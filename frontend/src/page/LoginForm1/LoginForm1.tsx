import { useState } from "react";
import { message } from "antd";
import { LoginInterface } from "../../interface/Login";
import { AddLogin, GetEmployeeByUserID } from "../../services/httpLogin";

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
import { Link } from "react-router-dom";

const { useToken } = theme;

const LoginForm1 = () => {
  const { token } = useToken();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const clickLoginbt = async (datalogin: LoginInterface) => {
    const res = await AddLogin(datalogin);

    if (res.status === 200) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("roleName", res.data.UserRole.RoleName);
      localStorage.setItem("userid", res.data.UserID);
      localStorage.setItem("firstnameuser", res.data.FirstNameUser);
      localStorage.setItem("lastnameuser", res.data.LastNameUser);

      const RoleName = localStorage.getItem("roleName");
      const userID = localStorage.getItem("userid");

      if (userID && RoleName !== "User") {
        try {
          const employeeID = await GetEmployeeByUserID(Number(userID));
          if (employeeID != null) {
            localStorage.setItem("employeeid", employeeID.toString());
          }
        } catch (error) {
          console.error("Failed to fetch EmployeeID:", error);
        }
      }

      messageApi.success(`ท่านได้ทำการ เข้าสู่ระบบ ${RoleName} สำเร็จ`);

      setTimeout(() => {
        if (RoleName === "Admin") window.location.href = "/admin";
        else if (RoleName === "User") window.location.href = "/user";
      }, 100);
    } else {
      messageApi.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่");
    }
  };

  return (
    <>
      {contextHolder}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-h-screen p-4">
        <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
          <div className="flex flex-col justify-around w-full max-w-xl p-4 lg:p-8 min-h-full">
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

            <div className="mb-4">
              <div className="mb-10">
                <div
                  className="text-3xl sm:text-4xl font-semibold mb-2.5"
                  style={{ color: token.colorTextHeading }}
                >
                  Sign in
                </div>
                <Typography.Text>เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน</Typography.Text>
              </div>

              <Divider className="mb-6" plain>
                โปรดกรอกข้อมูลเข้าสู่ระบบ
              </Divider>

              <Form
                layout="vertical"
                className="mb-10"
                onFinish={async () => {
                  if (!username || !password) {
                    messageApi.warning("กรุณากรอกข้อมูลให้ครบ");
                    return;
                  }

                  const datalogin: LoginInterface = {
                    username: username.trim(),
                    password,
                  };

                  await clickLoginbt(datalogin);
                }}
              >
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[{ required: true, message: "กรุณากรอก Username" }]}
                >
                  <Input
                    placeholder="Username"
                    size="large"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
                >
                  <Input.Password
                    placeholder="Password"
                    size="large"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Item>

                <Form.Item>
                  <Button block type="primary" htmlType="submit" size="large">
                    Log in
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <div className="mt-auto">
              <Typography.Text>{`© Company Name ${new Date().getFullYear()}`}</Typography.Text>
            </div>
          </div>
        </div>

        {/* ขวา: รูปประกอบ */}
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
                Welcome to EV System
              </Typography.Title>
              <Typography.Text className="text-white text-sm sm:text-xl font-light">
                โปรดเข้าสู่ระบบเพื่อเริ่มใช้งาน
              </Typography.Text>
            </div>

            <div className="mb-5">
              <img
                src={background2}
                alt="signIn-img"
                className="w-full h-auto object-cover rounded-md"
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginForm1;
