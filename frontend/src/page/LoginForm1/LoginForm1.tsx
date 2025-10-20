import React from "react";
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt, FaCreditCard, FaQrcode } from "react-icons/fa";

import { LoginInterface } from "../../interface/Login";
import { AddLogin, GetEmployeeByUserID } from "../../services/httpLogin";

const LoginForm1: React.FC = () => {
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
          if (employeeID != null) localStorage.setItem("employeeid", String(employeeID));
        } catch {}
      }

      messageApi.success(`เข้าสู่ระบบสำเร็จ`);
      setTimeout(() => {
        if (roleName === "Admin" || roleName === "Employee") navigate("/admin");
        else navigate("/user");
      }, 1200);
    } else {
      messageApi.error("Invalid username or password. Please try again.");
    }
  };

  return (
    <>
      {contextHolder}

      {/* BG ฟ้าสด + ลวดลายเบาๆ */}
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Brand bar: EV Station (แทนโลโก้รูป) */}
        <div className="mx-auto max-w-screen-xl px-4 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <FaBolt className="text-lg" />
            </span>
            <div className="leading-tight">
              <div className="text-xl font-bold tracking-tight text-blue-700">
                EV Station
              </div>
              <div className="text-[12px] text-blue-900/60">
                clean • simple • fast
              </div>
            </div>
          </div>
        </div>

        {/* เนื้อหา: mobile-first, เดสก์ท็อปค่อยแบ่งสองฝั่ง */}
        <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-6 px-4 pb-12 lg:grid-cols-2">
          {/* LEFT: ฟอร์ม */}
          <div className="flex items-stretch">
            <div className="w-full rounded-2xl border border-blue-100 bg-white p-6 shadow-[0_10px_35px_rgba(37,99,235,0.06)] sm:p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-blue-900">
                  เข้าสู่ระบบ
                </h1>
                <p className="mt-1 text-sm text-blue-900/60">
                  ใช้ชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งานระบบ
                </p>
              </div>

              <Form
                layout="vertical"
                form={form}
                onFinish={(values) => {
                  const { username, password } = values as {
                    username?: string;
                    password?: string;
                  };
                  if (!username || !password) {
                    messageApi.warning("Please fill in all required fields.");
                    return;
                  }
                  const payload: LoginInterface = {
                    username: username.trim(),
                    password,
                  };
                  handleLogin(payload);
                }}
              >
                <Form.Item
                  name="username"
                  label={<span className="text-sm text-gray-700">Username</span>}
                  rules={[{ required: true, message: "Please enter your username." }]}
                >
                  <Input size="large" className="rounded-2xl" placeholder="yourname" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="text-sm text-gray-700">Password</span>}
                  rules={[{ required: true, message: "Please enter your password." }]}
                >
                  <Input.Password size="large" className="rounded-2xl" placeholder="••••••••" />
                </Form.Item>

                <div className="mb-4">
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    ลืมรหัสผ่าน?
                  </Link>
                </div>

                <Form.Item className="mb-2">
                  <Button
                    block
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="!h-12 !rounded-2xl !bg-blue-600 hover:!bg-blue-700"
                  >
                    เข้าสู่ระบบ
                  </Button>
                </Form.Item>
              </Form>

              <p className="mt-4 text-sm text-gray-600">
                ยังไม่มีบัญชี?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  สมัครใช้งาน
                </Link>
              </p>

              <p className="mt-8 text-xs text-gray-400">© EV Station 2025</p>
            </div>
          </div>

          {/* RIGHT: แผงข้อมูล/ฮีโร่ (ซ่อนบนมือถือ) */}
          <div className="relative hidden overflow-hidden rounded-3xl lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-500" />
            {/* ลวดลายวงกลม */}
            <div className="absolute -left-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
              <div>
                <h2 className="text-3xl font-semibold leading-snug">
                  Minimal EV UI
                </h2>
                <p className="mt-2 text-blue-100">
                  โฟกัสการใช้งานจริง โหลดไว ใช้งานง่าย บนทุกหน้าจอ
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-blue-50">
                    <div className="text-sm opacity-80">รองรับการชำระเงิน</div>
                    <div className="mt-3 flex items-center gap-3 text-base">
                      <FaCreditCard />
                      <span>Credit Card</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-base">
                      <FaQrcode />
                      <span>PromptPay</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-blue-50">
                    <div className="text-sm opacity-80">ประสบการณ์ใช้งาน</div>
                    <ul className="mt-3 space-y-1 text-base">
                      <li>• โหลดเร็ว</li>
                      <li>• ใช้งานง่าย</li>
                      <li>• ดีไซน์สะอาดตา</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-xs text-blue-100/70">EV Station • clean energy</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm1;
