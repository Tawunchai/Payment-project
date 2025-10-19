import React, { useState } from "react";
import { Button, Form, Input, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt } from "react-icons/fa";
import { IoPlayCircle } from "react-icons/io5";

import ASSET_IMAGES from "../../assets/EV Car.jpeg";
import { checkEmailExists } from "../../services/httpLogin";

const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const onFinish = async (values: { email: string }) => {
    setEmailError(null);
    setLoading(true);
    try {
      const res = await checkEmailExists(values.email);
      if (res?.exists) {
        navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
      } else {
        setEmailError("ไม่พบอีเมลในระบบ กรุณาลองใหม่");
      }
    } catch {
      setEmailError("เกิดข้อผิดพลาดในการตรวจสอบอีเมล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Brand bar: EV Station */}
      <div className="mx-auto max-w-screen-xl px-4 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <FaBolt className="text-lg" />
          </span>
          <div className="leading-tight">
            <div className="text-xl font-bold tracking-tight text-blue-700">
              EV Station
            </div>
            <div className="text-[12px] text-blue-900/60">secure • simple</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-6 px-4 pb-12 lg:grid-cols-2">
        {/* LEFT: Form card */}
        <div className="flex items-stretch">
          <div className="w-full rounded-2xl border border-blue-100 bg-white p-6 shadow-[0_10px_35px_rgba(37,99,235,0.06)] sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-blue-900">
                ลืมรหัสผ่าน
              </h1>
              <p className="mt-1 text-sm text-blue-900/60">
                กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้คุณ
              </p>
            </div>

            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="email"
                label={<span className="text-sm text-gray-700">อีเมล</span>}
                validateStatus={emailError ? "error" : ""}
                help={emailError || ""}
                rules={[
                  { required: true, message: "กรุณากรอกอีเมล" },
                  { type: "email", message: "กรุณากรอกอีเมลให้ถูกต้อง" },
                ]}
              >
                <Input
                  placeholder="name@example.com"
                  size="large"
                  className="rounded-2xl"
                />
              </Form.Item>

              <Form.Item className="mb-2">
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="!h-12 !rounded-2xl !bg-blue-600 hover:!bg-blue-700"
                >
                  ส่งลิงก์รีเซ็ตรหัสผ่าน
                </Button>
              </Form.Item>
            </Form>

            <p className="mt-4 text-sm text-gray-600">
              จำอีเมลไม่ได้?{" "}
              <Link to="#" className="text-blue-600 hover:underline">
                ติดต่อทีมซัพพอร์ต
              </Link>
            </p>

            <p className="mt-8 text-xs text-gray-400">© EV Station 2025</p>
          </div>
        </div>

        {/* RIGHT: Illustration / helper (desktop only) */}
        <div className="relative hidden overflow-hidden rounded-3xl lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-500" />
          <div className="absolute -left-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
            <div>
              <Typography.Title
                level={3}
                className="!m-0 !text-white !font-semibold"
              >
                รีเซ็ตรหัสผ่านอย่างปลอดภัย
              </Typography.Title>
              <p className="mt-2 text-blue-100">
                ระบบจะส่งลิงก์รีเซ็ตไปยังอีเมลของคุณ ตรวจสอบกล่องเข้า/สแปม
              </p>
            </div>

            <div>
              <img
                src={ASSET_IMAGES}
                alt="ev-illustration"
                className="w-full rounded-2xl border border-white/15 shadow-lg"
              />
              <Link to="#" className="mt-4 inline-flex items-center gap-2 text-blue-50">
                <IoPlayCircle className="text-xl" />
                วิธีการใช้งาน
              </Link>
            </div>

            <div className="text-xs text-blue-100/70">
              keep your account secure • EV Station
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
