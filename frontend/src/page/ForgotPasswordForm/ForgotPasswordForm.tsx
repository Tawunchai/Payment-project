import ASSET_IMAGES from "../../assets/EV Car.jpeg";
import Logo from "../../assets/picture/Direct_Energy_logo.svg.png";
import {
  Button,
  Card,
  Form,
  Image,
  Input,
  theme,
  Typography,
} from "antd";
import { IoPlayCircle } from "react-icons/io5";
import { Link } from "react-router-dom";

const { useToken } = theme;

const ForgotPasswordForm = () => {
  const { token } = useToken();

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-h-screen p-4 md:p-8 xl:p-20"
      style={{ backgroundColor: token.colorBgLayout }}
    >
      {/* FORM SECTION */}
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
                src={Logo}
                alt="wieldy-logo"
                style={{ width: "100px" }}
                preview={false}
              />
            </Link>
          </div>

          {/* Heading & Form */}
          <div className="mb-4">
            <div className="mb-10">
              <Typography.Title
                level={2}
                className="text-3xl sm:text-4xl font-semibold mb-2.5"
                style={{ color: token.colorTextHeading }}
              >
                Forgot Password
              </Typography.Title>
            </div>

            <Form layout="vertical" className="mb-10">
              <Form.Item
                name="email"
                rules={[{ required: true, message: "Please input your email" }]}
              >
                <Input placeholder="Email" size="large" />
              </Form.Item>

              <Form.Item>
                <Button block type="primary" htmlType="submit" size="large">
                  Reset Password
                </Button>
              </Form.Item>
            </Form>

            <Typography.Text className="text-sm">
              Don’t remember your email?{" "}
              <Link to={"#"} className="underline">
                Contact Support
              </Link>
            </Typography.Text>
          </div>
        </Card>
      </div>

      {/* IMAGE + TEXT SECTION */}
      <div className="col-span-12 lg:col-span-6 lg:order-1">
        <div className="flex flex-col h-full justify-center items-center">
          <div className="w-full max-w-2xl px-4 sm:px-8 space-y-10">
            <div>
              <Typography.Text className="text-base sm:text-xl font-light">
                By entering your registered email address you will receive a
                password reset link. Kindly follow the instructions.
              </Typography.Text>
            </div>

            <div>
              <img
                src={ASSET_IMAGES}
                alt="sign2-img"
                className="w-full h-auto object-contain rounded-lg"
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

export default ForgotPasswordForm;
