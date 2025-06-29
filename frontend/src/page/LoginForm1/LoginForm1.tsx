import {
  Button,
  Card,
  Divider,
  Form,
  Image,
  Input,
  Typography,
  message,
  theme,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { FaCreditCard, FaQrcode } from 'react-icons/fa';
import "./login.css"
import ASSET_IMAGES from "../../assets/picture/Direct_Energy_logo.svg.png";
import backgroundImage from "../../assets/EV Car.jpeg";

import { LoginInterface } from "../../interface/Login";
import { AddLogin, GetEmployeeByUserID } from "../../services/httpLogin";

const { useToken } = theme;

const LoginForm1 = () => {
  const { token } = useToken();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleLogin = async (loginData: LoginInterface) => {
    const res = await AddLogin(loginData);

    if (res.status === 200) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("roleName", res.data.UserRole.RoleName);
      localStorage.setItem("userid", res.data.UserID);
      localStorage.setItem("firstnameuser", res.data.FirstNameUser);
      localStorage.setItem("lastnameuser", res.data.LastNameUser);

      const roleName = res.data.UserRole.RoleName;
      const userID = res.data.UserID;

      if (userID && roleName !== "User") {
        try {
          const employeeID = await GetEmployeeByUserID(Number(userID));
          if (employeeID != null) {
            localStorage.setItem("employeeid", employeeID.toString());
          }
        } catch (error) {
          console.error("Failed to fetch EmployeeID:", error);
        }
      }

      messageApi.success(`Successfully logged in as ${roleName}`);

      setTimeout(() => {
        if (roleName === "Admin" || roleName === "Employee") navigate("/admin");
        else if (roleName === "User") navigate("/user");
      }, 100);
    } else {
      messageApi.error("Invalid username or password. Please try again.");
    }
  };

  return (
    <>
      {contextHolder}
      <div className="grid grid-cols-12 gap-6 w-full min-h-screen p-4">
        {/* Left: Login Form */}
        <div className="col-span-12 lg:col-span-6 flex justify-center">
          <div className="flex flex-col justify-around w-[640px] max-w-full p-4 lg:p-8 min-h-full">
            <div className="mb-8">
              <Link to="#">
                <Image
                  src={ASSET_IMAGES}
                  alt="logo"
                  style={{ width: "300px" }}
                  preview={false}
                />
              </Link>
            </div>

            <div className="mb-4">
              <div className="mb-10">
                <div
                  className="text-4xl font-semibold mb-2.5"
                  style={{ color: token.colorTextHeading }}
                >
                  Sign in
                </div>
                <Typography.Text>
                  Use your username and password to access the system
                </Typography.Text>
              </div>

              <Divider className="mb-6" plain></Divider>

              <Form
                layout="vertical"
                className="mb-10"
                form={form}
                onFinish={(values) => {
                  const { username, password } = values;

                  if (!username || !password) {
                    messageApi.warning("Please fill in all required fields.");
                    return;
                  }

                  const loginData: LoginInterface = {
                    username: username.trim(),
                    password,
                  };

                  handleLogin(loginData);
                }}
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: "Please enter your username." }]}
                >
                  <Input placeholder="Username" size="large" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Please enter your password." }]}
                >
                  <Input.Password placeholder="Password" size="large" />
                </Form.Item>

                <Link className="block underline mb-5" to="/forgot-password">
                  Forgot password?
                </Link>

                <Form.Item>
                  <Button block type="primary" htmlType="submit" size="large" style={{ backgroundColor: "var(--black)" }}>
                    Log in
                  </Button>
                </Form.Item>
              </Form>

              <Typography.Text>
                Don’t have an account?{" "}
                <Link to="/register">Create one here</Link>
              </Typography.Text>
            </div>

            <div>
              <Typography.Text>{`© Company Name 2025`}</Typography.Text>
            </div>
          </div>
        </div>

        {/* Right: Info + Image */}
        <div className="col-span-12 lg:col-span-6">
          <Card
            style={{ backgroundColor: "var(--black)" }}
            className="h-full"
            classNames={{
              body: "p-8 text-white max-w-[700px] mx-auto flex flex-col justify-between h-full",
            }}
            bordered={false}
          >
            <div className="mb-5 hidden lg:block">
              <Typography.Title className="title-sigin text-white text-3xl lg:text-4xl font-light" style={{ color: "white" }}>
                The simplest way to build your projects with ReactJS
              </Typography.Title>
              <Typography.Text className="title-sigin text-white text-base lg:text-2xl font-light">
                Save up to 50% of your time and cost with our system
              </Typography.Text>
            </div>

            <div className="mb-5">
              <img
                src={backgroundImage}
                alt="signIn-img"
                className="w-full h-auto object-cover rounded-md"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xl">
                <FaCreditCard fontSize={20} />
                <span>Credit Card</span>
              </div>
              <div className="flex items-center gap-2 text-xl">
                <FaQrcode fontSize={20} />
                <span>PromptPay</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginForm1;
