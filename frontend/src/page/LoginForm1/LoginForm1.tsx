import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt } from "react-icons/fa";
import { LoginInterface } from "../../interface/Login";
import { AddLogin, GetEmployeeByUserID } from "../../services/httpLogin";
import Background from "../../assets/woman-charging-electro-car-by-her-house.jpg";

const LoginForm1: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginData: LoginInterface) => {
    try {
      setLoading(true);
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

        messageApi.success("เข้าสู่ระบบสำเร็จ");
        setTimeout(() => {
          if (roleName === "Admin" || roleName === "Employee") navigate("/admin");
          else navigate("/user");
        }, 900);
      } else {
        messageApi.error("Invalid username or password. Please try again.");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อ โปรดลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      {/* พื้นหลังภาพเต็มจอแบบ object-cover (แก้ white strip + fixed bug) */}
      <div className="relative min-h-dvh flex items-center justify-center px-4 py-10 overflow-hidden">
        {/* ชั้นรูปภาพพื้นหลัง */}
        <div className="absolute inset-0 -z-10">
          <img
            src={Background}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* Overlay ช่วยให้อ่านง่าย */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-900/60 via-slate-900/35 to-blue-950/60" />

        {/* Soft grid โปร่งบาง */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(#0b12261a 1px, transparent 1px), linear-gradient(90deg, #0b12261a 1px, transparent 1px)",
            backgroundSize: "36px 36px, 36px 36px",
          }}
        />

        {/* Blur blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl opacity-30 -z-10"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, rgba(59,130,246,0.35), rgba(59,130,246,0.0) 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 w-72 h-72 rounded-full blur-3xl opacity-25 -z-10"
          style={{
            background:
              "radial-gradient(circle at 60% 60%, rgba(14,165,233,0.30), rgba(14,165,233,0.0) 60%)",
          }}
        />

        {/* กล่องฟอร์ม */}
        <div className="relative w-full max-w-md">
          {/* กรอบนิ่งโทนไล่เฉดบาง ๆ */}
          <div
            className="rounded-[28px] p-[1px]"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(37,99,235,0.30), rgba(56,189,248,0.18), rgba(99,102,241,0.24), rgba(37,99,235,0.30))",
            }}
          >
            {/* การ์ด ขาวล้วน */}
            <div className="rounded-[26px] bg-white border border-gray-200 shadow-[0_20px_60px_rgba(2,6,23,0.18)] p-8 md:p-10">
              {/* แบรนด์ */}
              <div className="flex items-center gap-3 mb-6 justify-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow">
                  <FaBolt className="text-xl" />
                </span>
                <div className="leading-tight text-center">
                  <h1
                    className="text-2xl font-extrabold tracking-tight"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #1e40af, #2563eb, #06b6d4, #22c55e, #2563eb)",
                      backgroundSize: "220% 100%",
                      backgroundPosition: "0% 50%",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      animation: "evTextShine 6s ease-in-out infinite",
                    }}
                  >
                    EV Station
                  </h1>
                  <p className="text-[12px] text-blue-700/70 font-medium">Smart • Clean • Future</p>
                </div>
              </div>

              {/* แถบชาร์จใต้โลโก้ */}
              <div className="mb-8">
                <div className="h-[3px] w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400 animate-barSlide rounded-full" />
                </div>
              </div>

              {/* ฟอร์ม */}
              <Form
                layout="vertical"
                form={form}
                onFinish={(values) => {
                  const { username, password } = values as { username?: string; password?: string };
                  if (!username || !password) {
                    messageApi.warning("Please fill in all required fields.");
                    return;
                  }
                  handleLogin({ username: username.trim(), password });
                }}
                disabled={loading}
              >
                <Form.Item
                  name="username"
                  label={<span className="text-sm text-gray-700 font-medium">Username</span>}
                  rules={[{ required: true, message: "Please enter your username." }]}
                >
                  <Input
                    size="large"
                    className="rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="yourname"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="text-sm text-gray-700 font-medium">Password</span>}
                  rules={[{ required: true, message: "Please enter your password." }]}
                >
                  <Input.Password
                    size="large"
                    className="rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="••••••••"
                  />
                </Form.Item>

                <div className="flex items-center justify-between mb-4 text-sm">
                  <Link to="/forgot-password" className="text-blue-600 hover:underline">ลืมรหัสผ่าน?</Link>
                  <Link to="/register" className="text-blue-600 hover:underline">สมัครใช้งาน</Link>
                </div>

                <Form.Item className="mb-2">
                  <Button
                    block
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    disabled={loading}
                    className="!h-12 !rounded-2xl !bg-blue-600 hover:!bg-blue-700 font-medium"
                  >
                    เข้าสู่ระบบ
                  </Button>
                </Form.Item>
              </Form>

              <p className="mt-8 text-center text-xs text-gray-500">© EV Station 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* keyframes: แถบชาร์จ + gradient text */}
      <style>{`
        @keyframes evTextShine {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes barSlide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(30%); }
          100% { transform: translateX(110%); }
        }
        .animate-barSlide { animation: barSlide 2.8s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .animate-barSlide { animation: none !important; }
          h1[style] { animation: none !important; }
        }
      `}</style>
    </>
  );
};

export default LoginForm1;
