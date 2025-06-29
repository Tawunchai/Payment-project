import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Image,
  Input,
  Select,
  Typography,
  message,
  theme,
  Upload,
} from "antd";
import ImgCrop from "antd-img-crop";
import { Link, useNavigate } from "react-router-dom";
import { IoPlayCircle } from "react-icons/io5";
import { PlusOutlined } from "@ant-design/icons";
import ASSET_IMAGES from "../../assets/picture/Direct_Energy_logo.svg.png";
import background2 from "../../assets/EV Car.jpeg";
import { currentYear } from "./data";
import { ListGenders, CreateUser } from "../../services";

const { useToken } = theme;
const { Title, Text } = Typography;

const Signup2Form = () => {
  const [form] = Form.useForm();
  const { token } = useToken();
  const navigate = useNavigate();
  const [genderOptions, setGenderOptions] = useState<{ ID: number; Name: string }[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    const fetchGenders = async () => {
      const res = await ListGenders();
      if (res) {
        const mapped = res.map((g) => ({
          ID: g.ID ?? 0,
          Name: g.Gender ?? "",
        }));
        setGenderOptions(mapped);
      }
    };
    fetchGenders();
  }, []);

  const onChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const imgWindow = window.open(src);
    imgWindow?.document.write(`<img src="${src}" style="max-width: 100%;" />`);
  };

  const onFinish = async (values: any) => {
    if (fileList.length === 0) {
      message.error("กรุณาอัพโหลดรูปภาพก่อนสมัคร");
      return;
    }

    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("firstname", values.firstname || "");
    formData.append("lastname", values.lastname || "");
    formData.append("phone", values.phone || "");
    formData.append("gender", values.gender);
    formData.append("userRoleID", "3");
    formData.append("profile", fileList[0].originFileObj);

    try {
      const res = await CreateUser(formData); // เรียกใช้งาน CreateUser จาก service
      if (res) {
        message.success("User created successfully!");
        navigate("/auth/login-2");
      } else {
        message.error("Failed to create user.");
      }
    } catch (err) {
      message.error("Error occurred while creating user.");
    }
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-h-screen p-4 md:p-8 xl:p-20"
      style={{ backgroundColor: token.colorBgLayout }}
    >
      <div className="col-span-12 lg:col-span-6 flex justify-center lg:order-2">
        <Card
          className="h-full w-full"
          classNames={{
            body: "p-4 sm:p-8 max-w-[700px] mx-auto flex flex-col justify-around h-full",
          }}
          bordered={false}
        >
          <div className="mb-8">
            <Link to="#">
              <Image src={ASSET_IMAGES} alt="logo" style={{ width: "150px" }} preview={false} />
            </Link>
          </div>

          <div className="mb-4">
            <div className="mb-10">
              <Title
                level={2}
                className="text-3xl sm:text-4xl font-semibold mb-2.5"
                style={{ color: token.colorTextHeading }}
              >
                Get Started Now
              </Title>
              <Text>Enter your credentials to create your account</Text>
            </div>

            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              className="mb-10"
              encType="multipart/form-data"
            >
              {/* Upload รูปโปรไฟล์ แบบวงกลม */}
              <div className="flex justify-center">
                <Form.Item
                  label="Profile Picture"
                  name="profile"
                  valuePropName="fileList"
                  getValueFromEvent={({ fileList }) => fileList}
                  rules={[
                    {
                      validator: () =>
                        fileList.length > 0
                          ? Promise.resolve()
                          : Promise.reject(new Error("กรุณาอัพโหลดรูป")),
                    },
                  ]}
                >
                  <ImgCrop rotationSlider>
                    <Upload
                      fileList={fileList}
                      onChange={onChange}
                      onPreview={onPreview}
                      beforeUpload={(file) => {
                        const isImage = file.type.startsWith("image/");
                        if (!isImage) {
                          message.error("กรุณาอัปโหลดไฟล์รูปภาพ");
                          return Upload.LIST_IGNORE;
                        }
                        setFileList([file]);
                        return false;
                      }}
                      maxCount={1}
                      listType="picture-circle"
                    >
                      {fileList.length < 1 && (
                        <div>
                          <PlusOutlined style={{ fontSize: 32 }} />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                  </ImgCrop>
                </Form.Item>
              </div>

              {/* Input ฟิลด์อื่น ๆ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: "Please input your username!" }]}
                >
                  <Input placeholder="Username" size="large" />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "กรุณาใส่อีเมลที่ถูกต้อง" },
                  ]}
                >
                  <Input placeholder="Email" size="large" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Input.Password placeholder="Password" size="large" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: "Please input your phone number!" },
                    {
                      pattern: /^0\d{9}$/,
                      message: "เบอร์โทรต้องเป็นเลข 10 ตัว",
                    },
                  ]}
                >
                  <Input placeholder="Phone Number" size="large" maxLength={10} />
                </Form.Item>

                <Form.Item
                  name="firstname"
                  rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                >
                  <Input placeholder="First Name" size="large" />
                </Form.Item>

                <Form.Item
                  name="lastname"
                  rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
                >
                  <Input placeholder="Last Name" size="large" />
                </Form.Item>

                <Form.Item
                  name="gender"
                  rules={[{ required: true, message: "Please select your gender!" }]}
                >
                  <Select placeholder="Select Gender" size="large">
                    {genderOptions.map((g) => (
                      <Select.Option key={g.ID} value={g.ID}>
                        {g.Name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item>
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={{ backgroundColor: "var(--black)" }}
                >
                  Signup
                </Button>
              </Form.Item>
            </Form>

            <Text>
              Already have an account? <Link to="/auth/login-2">Login here</Link>
            </Text>
          </div>

          <div className="mt-6">
            <Text>© Company Name {currentYear}</Text>
          </div>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-6 lg:order-1">
        <div className="flex flex-col h-full justify-center items-center">
          <div className="w-full max-w-2xl px-4 sm:px-8 lg:space-y-16">
            <div className="mb-5">
              <Title
                level={3}
                className="text-2xl sm:text-3xl lg:text-4xl"
                style={{ color: token.colorPrimary }}
              >
                Bring your idea to life
              </Title>
              <Text className="text-base sm:text-xl font-light">
                Right tools to give your next project a kickstart it needs
              </Text>
            </div>
            <div className="mb-5">
              <img
                src={background2}
                alt="sign2-img"
                className="w-full h-auto object-contain rounded-md"
              />
            </div>
            <Link className="block text-primary" to="#">
              <span className="inline-flex items-center gap-2 text-base">
                <IoPlayCircle /> How it works
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup2Form;
