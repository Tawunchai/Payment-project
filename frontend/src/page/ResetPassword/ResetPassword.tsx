import React, { useState } from "react";
import { Button, Form, Input, Typography, message } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IoPlayCircle } from "react-icons/io5";
import { FaBolt } from "react-icons/fa";

import background2 from "../../assets/EV Car.jpeg";
import { resetPassword } from "../../services/httpLogin";

const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { password: string; newpassword: string }) => {
    const { password, newpassword } = values;

    if (password !== newpassword) {
      message.error("New password and confirm password must be the same!");
      return;
    }
    if (!email) {
      message.error("Email ไม่ถูกต้อง หรือหมดเวลา กรุณาลองใหม่");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ email, new_password: newpassword });
      if (res) {
        message.success("เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่");
        setTimeout(() => navigate("/"), 1800);
      } else {
        message.error("เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่");
      }
    } catch {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Brand bar */}
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
                Reset Password
              </h1>
              <p className="mt-1 text-sm text-blue-900/60">
                โปรดตั้งรหัสผ่านใหม่ด้านล่างเพื่อความปลอดภัยของบัญชี
              </p>
            </div>

            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="password"
                label={<span className="text-sm text-gray-700">New Password</span>}
                rules={[{ required: true, message: "Please input your new password!" }]}
                hasFeedback
              >
                <Input.Password placeholder="New password" size="large" className="rounded-2xl" />
              </Form.Item>

              <Form.Item
                name="newpassword"
                label={<span className="text-sm text-gray-700">Confirm New Password</span>}
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Please confirm your new password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) return Promise.resolve();
                      return Promise.reject(new Error("Passwords do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Retype new password" size="large" className="rounded-2xl" />
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
                  บันทึกรหัสผ่านใหม่
                </Button>
              </Form.Item>
            </Form>

            <p className="mt-4 text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{" "}
              <Link to="/" className="text-blue-600 hover:underline">
                กลับไปเข้าสู่ระบบ
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
              <Typography.Title level={3} className="!m-0 !text-white !font-semibold">
                ตั้งรหัสผ่านใหม่อย่างปลอดภัย
              </Typography.Title>
              <p className="mt-2 text-blue-100">
                ใช้รหัสผ่านที่คาดเดายากและไม่ซ้ำกับบริการอื่น ๆ
              </p>
            </div>

            <div>
              <img
                src={background2}
                alt="reset-password-img"
                className="w-full rounded-2xl border border-white/15 shadow-lg"
              />
              <Link to="#" className="mt-4 inline-flex items-center gap-2 text-blue-50">
                <IoPlayCircle className="text-xl" />
                วิธีการใช้งาน
              </Link>
            </div>

            <div className="text-xs text-blue-100/70">keep your account secure • EV Station</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
