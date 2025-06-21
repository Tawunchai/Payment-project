import ASSET_IMAGES from "../../assets/picture/Direct_Energy_logo.svg.png";
import background2 from "../../assets/EV Car.jpeg";
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

const ResetPasswordForm = () => {
  const { token } = useToken();

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-h-screen p-4 md:p-8 xl:p-20"
      style={{ backgroundColor: token.colorBgLayout }}
    >
      {/* FORM */}
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
                className="w-[70px] sm:w-[90px]"
                style={{width:"150px"}}
                preview={false}
              />
            </Link>
          </div>

          {/* Title & Form */}
          <div className="mb-4">
            <Typography.Title
              level={2}
              className="text-3xl sm:text-4xl font-semibold mb-2.5"
              style={{ color: token.colorTextHeading }}
            >
              Reset Password
            </Typography.Title>

            <Form layout="vertical" className="mb-10">
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your old password!",
                  },
                ]}
              >
                <Input.Password placeholder="Password" size="large" />
              </Form.Item>

              <Form.Item
                name="newpassword"
                rules={[
                  {
                    required: true,
                    message: "Please input your new password",
                  },
                ]}
              >
                <Input.Password
                  placeholder="Retype New Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button block type="primary" htmlType="submit" size="large">
                  Reset
                </Button>
              </Form.Item>
            </Form>

            <Typography.Text className="text-sm">
              Already have an account?{" "}
              <Link to={"/auth/login-1"}>Login here</Link> or{" "}
              <Link to={"/auth/signup-1"}>Create New</Link>
            </Typography.Text>
          </div>
        </Card>
      </div>

      {/* IMAGE + DESCRIPTION */}
      <div className="col-span-12 lg:col-span-6 lg:order-1">
        <div className="flex flex-col h-full justify-center items-center">
          <div className="w-full max-w-2xl px-4 sm:px-8 space-y-10">
            <Typography.Text className="text-base sm:text-xl font-light">
              Please enter your new password below to securely reset your
              account credentials.
            </Typography.Text>

            <div>
              <img
                src={background2}
                alt="reset-password-img"
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

export default ResetPasswordForm;