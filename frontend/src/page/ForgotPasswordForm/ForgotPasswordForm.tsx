import React, { useState } from "react";
import { Button, Form, Input, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt } from "react-icons/fa";

import Background from "../../assets/woman-charging-electro-car-by-her-house.jpg";
import { checkEmailExists, SendOTP } from "../../services/httpLogin";
import OTPModal from "../Signup1/otp"; // ✅ นำเข้า OTPModal

const { Title } = Typography;

const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // สำหรับ OTP modal
  const [otpOpen, setOtpOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  const onFinish = async (values: { email: string }) => {
    setEmailError(null);
    setLoading(true);
    try {
      // 1) ตรวจว่ามีอีเมลในระบบไหม
      const chk = await checkEmailExists(values.email);
      if (!chk?.exists) {
        setEmailError("ไม่พบอีเมลในระบบ กรุณาลองใหม่");
        return;
      }

      // 2) ส่ง OTP ไปยังอีเมลนั้น
      await SendOTP(values.email);

      // 3) เปิด OTP Modal
      setPendingEmail(values.email);
      setOtpOpen(true);

      messageApi.info("เราได้ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว");
    } catch (err) {
      setEmailError("เกิดข้อผิดพลาดในการส่ง OTP");
    } finally {
      setLoading(false);
    }
  };

  // เรียกเมื่อ OTP ตรวจสอบผ่าน
  const handleOtpSuccess = () => {
    messageApi.success("ยืนยัน OTP สำเร็จ กำลังไปหน้ารีเซ็ตรหัสผ่าน...");
    navigate(`/reset-password?email=${encodeURIComponent(pendingEmail)}`);
  };

  return (
    <>
      {contextHolder}

      {/* BG + Overlay + Grid + Blobs */}
      <div className="relative min-h-dvh flex items-center justify-center px-4 py-10 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={Background}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            draggable={false}
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-900/60 via-slate-900/35 to-blue-950/60" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(#0b12261a 1px, transparent 1px), linear-gradient(90deg, #0b12261a 1px, transparent 1px)",
            backgroundSize: "36px 36px, 36px 36px",
          }}
        />
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

        {/* Card */}
        <div className="relative w-full max-w-xl">
          <div
            className="rounded-[28px] p-[1px]"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(37,99,235,0.30), rgba(56,189,248,0.18), rgba(99,102,241,0.24), rgba(37,99,235,0.30))",
            }}
          >
            <div className="rounded-[26px] bg-white border border-gray-200 shadow-[0_20px_60px_rgba(2,6,23,0.18)] p-8 md:p-10">
              {/* Brand */}
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
                  <p className="text-[12px] text-blue-700/70 font-medium">
                    Secure • Simple • Clean
                  </p>
                </div>
              </div>

              {/* Loading bar */}
              <div className="mb-8">
                <div className="h-[3px] w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400 animate-barSlide rounded-full" />
                </div>
              </div>

              {/* Title */}
              <div className="mb-4 text-center">
                <Title level={3} className="!m-0 !text-blue-900 !font-semibold">
                  ลืมรหัสผ่าน
                </Title>
                <p className="mt-1 text-sm text-blue-900/70">
                  กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งรหัส OTP เพื่อยืนยันก่อนรีเซ็ตรหัสผ่าน
                </p>
              </div>

              {/* Form */}
              <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                  name="email"
                  label={<span className="text-sm text-gray-700 font-medium">อีเมล</span>}
                  validateStatus={emailError ? "error" : ""}
                  help={emailError || ""}
                  rules={[
                    { required: true, message: "กรุณากรอกอีเมล" },
                    { type: "email", message: "กรุณากรอกอีเมลให้ถูกต้อง" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="name@example.com"
                    className="rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </Form.Item>

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
                    ส่งลิงก์รีเซ็ตรหัสผ่าน
                  </Button>
                </Form.Item>
              </Form>

              {/* Links */}
              <div className="flex items-center justify-between mt-4 text-sm">
                <Link to="/auth/login-2" className="text-blue-600 hover:underline">
                  กลับไปเข้าสู่ระบบ
                </Link>
              </div>

              <p className="mt-8 text-center text-xs text-gray-500">© EV Station 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        open={otpOpen}
        email={pendingEmail}
        onCancel={() => setOtpOpen(false)}
        onSuccess={handleOtpSuccess}
      />

      {/* Animations */}
      <style>{`
        @keyframes evTextShine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes barSlide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(30%); }
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

export default ForgotPasswordForm;
