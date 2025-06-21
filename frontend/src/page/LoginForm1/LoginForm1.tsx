import { currentYear } from "./data";
import ASSET_IMAGES from "../../assets/picture/Direct_Energy_logo.svg.png";
import background2 from "../../assets/EV Car.jpeg";
import {
  Button,
  Card,
  Divider,
  Form,
  Image,
  Input,
  theme,
  Typography,
} from "antd";
import { AiFillApple } from "react-icons/ai";
import { FaPaypal } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { RiMastercardFill } from "react-icons/ri";
import { Link } from "react-router-dom";

const { useToken } = theme;

const LoginForm1 = () => {
  const { token } = useToken();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-h-screen p-4">
      {/* LEFT FORM */}
      <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
        <div className="flex flex-col justify-around w-full max-w-xl p-4 lg:p-8 min-h-full">
          {/* Logo */}
          <div className="mb-8">
            <Link to={"#"}>
              <Image
                src={ASSET_IMAGES}
                alt="logo"
                className="w-[90px]"
                preview={false}
              />
            </Link>
          </div>

          {/* Form */}
          <div className="mb-4">
            <div className="mb-10">
              <div
                className="text-3xl sm:text-4xl font-semibold mb-2.5"
                style={{
                  color: token.colorTextHeading,
                }}
              >
                Sign in
              </div>
              <Typography.Text>Continue where you left off</Typography.Text>
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

            <Form
              layout="vertical"
              className="mb-10"
              initialValues={{
                email: "demo@example.com",
                password: "zab#723",
              }}
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please input your email!",
                  },
                ]}
              >
                <Input placeholder="Email" size="large" />
              </Form.Item>

              <Form.Item
                className="mb-2"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password placeholder="Password" size="large" />
              </Form.Item>

              <Link
                className="block underline mb-5 text-sm"
                to={"/auth/forgot-password"}
              >
                Forgot password?
              </Link>

              <Form.Item>
                <Button block type="primary" htmlType="submit" size="large">
                  Log in
                </Button>
              </Form.Item>
            </Form>

            <Typography.Text>
              Don’t have an account?{" "}
              <Link to={"/auth/signup-1"}>Create New Account</Link>
            </Typography.Text>
          </div>

          <div className="mt-auto">
            <Typography.Text>{`© Company Name ${currentYear}`}</Typography.Text>
          </div>
        </div>
      </div>

      {/* RIGHT IMAGE PANEL */}
      <div className="lg:col-span-6 order-1 lg:order-2">
        <Card
          style={{ backgroundColor: token.colorPrimary }}
          className="h-full"
          classNames={{
            body: "p-6 sm:p-8 text-white max-w-[700px] mx-auto flex flex-col justify-between h-full",
          }}
          bordered={false}
        >
          <div className="mb-5">
            <Typography.Title className="text-white text-2xl sm:text-4xl font-light">
              Build projects fast with ReactJS & AntD
            </Typography.Title>
            <Typography.Text className="text-white text-sm sm:text-xl font-light">
              Save 50% of your time and cost
            </Typography.Text>
          </div>

          <div className="mb-5">
            <img
              src={background2}
              alt="signIn-img"
              className="w-full h-auto object-cover rounded-md"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-lg">
              <RiMastercardFill fontSize={20} />
              <span>Mastercard</span>
            </div>
            <div className="flex items-center gap-2 text-lg">
              <FaPaypal fontSize={20} />
              <span>PayPal</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm1;
