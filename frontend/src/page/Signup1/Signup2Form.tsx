import { currentYear } from "./data";
import ASSET_IMAGES from "../../assets/picture/Direct_Energy_logo.svg.png";
import background2 from "../../assets/EV Car.jpeg";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Image,
  Input,
  theme,
  Typography,
} from "antd";
import { AiFillApple } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { IoPlayCircle } from "react-icons/io5";
import { Link } from "react-router-dom";

const { useToken } = theme;

const Signup2Form = () => {
  const { token } = useToken();

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-h-screen p-4 md:p-8 xl:p-20"
      style={{ backgroundColor: token.colorBgLayout }}
    >
      {/* Right Column (Form) */}
      <div className="col-span-12 lg:col-span-6 flex justify-center lg:order-2">
        <Card
          className="h-full w-full"
          classNames={{
            body: "p-4 sm:p-8 max-w-[700px] mx-auto flex flex-col justify-around h-full",
          }}
          bordered={false}
        >
          {/* Logo */}
          <div className="mb-8">
            <Link to={"#"}>
              <Image
                src={ASSET_IMAGES}
                alt="logo"
                style={{width:"150px"}}
                preview={false}
              />
            </Link>
          </div>

          {/* Form content */}
          <div className="mb-4">
            <div className="mb-10">
              <Typography.Title
                level={2}
                className="text-3xl sm:text-4xl font-semibold mb-2.5"
                style={{ color: token.colorTextHeading }}
              >
                Get Started Now
              </Typography.Title>
              <Typography.Text>
                Enter your credentials to create your account
              </Typography.Text>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <Button
                className="flex-1"
                icon={<FcGoogle fontSize={24} />}
                size="large"
              >
                Google
              </Button>
              <Button
                className="flex-1"
                icon={<AiFillApple fontSize={24} />}
                size="large"
              >
                Apple
              </Button>
            </div>

            <Divider className="mb-6" plain>
              or
            </Divider>

            <Form layout="vertical" className="mb-10">
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Please input your username!" }]}
              >
                <Input placeholder="Name" size="large" />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[{ required: true, message: "Please input your email!" }]}
              >
                <Input placeholder="Email" size="large" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Please input your password!" }]}
              >
                <Input.Password placeholder="Password" size="large" />
              </Form.Item>

              <Form.Item>
                <Checkbox>
                  <Typography.Text>
                    I agree to the{" "}
                    <Link to={"#"}>Terms & Conditions</Link> and{" "}
                    <Link to={"#"}>Privacy policies</Link>.
                  </Typography.Text>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button block type="primary" htmlType="submit" size="large">
                  Signup
                </Button>
              </Form.Item>
            </Form>

            <Typography.Text>
              Already have an account?{" "}
              <Link to={"/auth/login-2"}>Login here</Link>
            </Typography.Text>
          </div>

          <div className="mt-6">
            <Typography.Text>
              © Company Name {currentYear}
            </Typography.Text>
          </div>
        </Card>
      </div>

      {/* Left Column (Image & Text) */}
      <div className="col-span-12 lg:col-span-6 lg:order-1">
        <div className="flex flex-col h-full justify-center items-center">
          <div className="w-full max-w-2xl px-4 sm:px-8 lg:space-y-16">
            <div className="mb-5">
              <Typography.Title
                level={3}
                className="text-2xl sm:text-3xl lg:text-4xl"
                style={{ color: token.colorPrimary }}
              >
                Bring your idea to life
              </Typography.Title>
              <Typography.Text className="text-base sm:text-xl font-light">
                Right tools to give your next project a kickstart it needs
              </Typography.Text>
            </div>

            <div className="mb-5">
              <img
                src={background2}
                alt="sign2-img"
                className="w-full h-auto object-contain rounded-md"
              />
            </div>

            <Link className="block text-primary" to={"#"}>
              <span className="inline-flex items-center gap-2 text-base">
                <IoPlayCircle />
                How it works
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup2Form;
