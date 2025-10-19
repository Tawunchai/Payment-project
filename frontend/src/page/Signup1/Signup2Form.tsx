import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Typography,
  message,
  Upload,
} from "antd";
import ImgCrop from "antd-img-crop";
import { Link, useNavigate } from "react-router-dom";
import { IoPlayCircle } from "react-icons/io5";
import { PlusOutlined } from "@ant-design/icons";
import { FaBolt } from "react-icons/fa";
import background2 from "../../assets/EV Car.jpeg";
import { currentYear } from "./data";
import { ListGenders, CreateUser } from "../../services";

const { Title, Text } = Typography;

const Signup2Form: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [genderOptions, setGenderOptions] = useState<{ ID: number; Name: string }[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGenders = async () => {
      const res = await ListGenders();
      if (res) {
        const mapped = res.map((g: any) => ({
          ID: g.ID ?? 0,
          Name: g.Gender ?? "",
        }));
        setGenderOptions(mapped);
      }
    };
    fetchGenders();
  }, []);

  const onChange = ({ fileList: newFileList }: any) => setFileList(newFileList);

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const imgWindow = window.open(src as string);
    imgWindow?.document.write(`<img src="${src}" style="max-width: 100%;" />`);
  };

  const onFinish = async (values: any) => {
    if (fileList.length === 0) {
      message.error("กรุณาอัพโหลดรูปภาพก่อนสมัคร");
      return;
    }

    setLoading(true);

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
      const res = await CreateUser(formData);
      if (res) {
        message.success("User created successfully!");
        setTimeout(() => {
          setLoading(false);
          navigate("/auth/login-2");
        }, 1200);
      } else {
        message.error("Failed to create user.");
        setLoading(false);
      }
    } catch {
      message.error("Error occurred while creating user.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Brand bar */}
      <div className="mx-auto max-w-screen-xl px-4 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <FaBolt className="text-lg" />
          </span>
          <div className="leading-tight">
            <div className="text-xl font-bold tracking-tight text-blue-700">EV Station</div>
            <div className="text-[12px] text-blue-900/60">charge • drive • repeat</div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-6 px-4 pb-12 lg:grid-cols-2">
        {/* FORM CARD */}
        <div className="flex items-stretch">
          <Card
            bordered={false}
            className="w-full rounded-2xl border border-blue-100 shadow-[0_10px_35px_rgba(37,99,235,0.06)]"
            styles={{ body: { padding: 24 } }}
          >
            <div className="mb-6">
              <Title level={2} className="!m-0 !text-blue-900">Create your account</Title>
              <Text className="text-blue-900/70">กรอกข้อมูลเพื่อเริ่มต้นใช้งาน</Text>
            </div>

            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              className="mb-4"
              encType="multipart/form-data"
            >
              {/* Upload */}
              <div className="flex justify-center">
                <Form.Item
                  label={<span className="text-sm text-gray-700">Profile Picture</span>}
                  name="profile"
                  valuePropName="fileList"
                  getValueFromEvent={({ fileList }: any) => fileList}
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
                        <div className="text-center">
                          <PlusOutlined style={{ fontSize: 32 }} />
                          <div className="mt-2 text-sm">Upload</div>
                        </div>
                      )}
                    </Upload>
                  </ImgCrop>
                </Form.Item>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: "Please input your username!" }]}
                >
                  <Input placeholder="Username" size="large" className="rounded-2xl" />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "กรุณาใส่อีเมลที่ถูกต้อง" },
                  ]}
                >
                  <Input placeholder="Email" size="large" className="rounded-2xl" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Input.Password placeholder="Password" size="large" className="rounded-2xl" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: "Please input your phone number!" },
                    { pattern: /^0\d{9}$/, message: "เบอร์โทรต้องเป็นเลข 10 ตัว" },
                  ]}
                >
                  <Input placeholder="Phone Number" size="large" maxLength={10} className="rounded-2xl" />
                </Form.Item>

                <Form.Item
                  name="firstname"
                  rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                >
                  <Input placeholder="First Name" size="large" className="rounded-2xl" />
                </Form.Item>

                <Form.Item
                  name="lastname"
                  rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
                >
                  <Input placeholder="Last Name" size="large" className="rounded-2xl" />
                </Form.Item>

                <Form.Item
                  name="gender"
                  rules={[{ required: true, message: "Please select your gender!" }]}
                >
                  <Select placeholder="Select Gender" size="large" className="!rounded-2xl">
                    {genderOptions.map((g) => (
                      <Select.Option key={g.ID} value={g.ID}>
                        {g.Name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item className="mt-2">
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  disabled={loading}
                  className="!h-12 !rounded-2xl !bg-blue-600 hover:!bg-blue-700"
                >
                  {loading ? "กำลังสมัคร..." : "Sign up"}
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-2 text-sm text-gray-700">
              Already have an account?{" "}
              <Link to="/auth/login-2" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </div>

            <div className="mt-8 text-xs text-gray-400">© EV Station {currentYear}</div>
          </Card>
        </div>

        {/* ILLUSTRATION PANEL (desktop only) */}
        <div className="relative hidden overflow-hidden rounded-3xl lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-500" />
          <div className="absolute -left-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
            <div>
              <Title level={3} className="!m-0 !text-white !font-semibold">
                เริ่มต้นเดินทางพลังงานไฟฟ้า
              </Title>
              <p className="mt-2 text-blue-100">สมัครง่าย ปลอดภัย พร้อมใช้งานได้ทันที</p>
            </div>

            <div>
              <img
                src={background2}
                alt="signup-img"
                className="w-full rounded-2xl border border-white/15 shadow-lg"
              />
              <Link to="#" className="mt-4 inline-flex items-center gap-2 text-blue-50">
                <IoPlayCircle className="text-xl" />
                How it works
              </Link>
            </div>

            <div className="text-xs text-blue-100/70">charge smarter • EV Station</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup2Form;
