// src/pages/admin/Service/ModalEditSendEmail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Input, message } from "antd";
import { FaEnvelope, FaKey, FaBolt, FaTimes } from "react-icons/fa";
import { UpdateSendEmailByID } from "../../../../services/";
import type { SendEmailInterface } from "../../../../interface/ISendEmail";

interface EditSendEmailModalProps {
  open: boolean;
  onClose: () => void;
  record?: SendEmailInterface | null;
  onUpdated: (updated: SendEmailInterface) => void;
}

const ModalEditSendEmail: React.FC<EditSendEmailModalProps> = ({
  open,
  onClose,
  record,
  onUpdated,
}) => {
  const [email, setEmail] = useState("");
  const [passApp, setPassApp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (record) {
      setEmail(record.Email || "");
      setPassApp(record.PassApp || "");
    }
  }, [record]);

  const canSubmit = useMemo(
    () => email.trim() !== "" && passApp.trim() !== "",
    [email, passApp]
  );

  const handleSubmit = async () => {
    if (!record?.ID || submitting || !canSubmit) return;
    setSubmitting(true);
    try {
      const payload = { Email: email.trim(), PassApp: passApp.trim() };
      console.log(payload)
      const res = await UpdateSendEmailByID(record.ID, payload);
      if (res?.data) {
        messageApi.success("อัปเดตข้อมูลอีเมลผู้ส่งสำเร็จ!");
        onUpdated(res.data);
        onClose();
      } else {
        messageApi.error("ไม่สามารถอัปเดตข้อมูลได้");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center ev-scope"
      role="dialog"
      aria-modal="true"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {contextHolder}

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-[520px] mx-4 mt-24 md:mt-0 mb-8 md:mb-0">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-blue-100 flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-5 pt-3 pb-4 md:pt-4 md:pb-4 bg-blue-600 text-white">
            <div className="mx-auto w-10 h-1.5 md:hidden rounded-full bg-white/60 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaBolt className="opacity-90" />
                <h2 className="text-base md:text-lg font-semibold">แก้ไขอีเมลผู้ส่ง OTP</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="ปิดหน้าต่าง"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-5 bg-blue-50/40 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4">
              {/* EMAIL */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaEnvelope className="text-blue-500" /> อีเมลผู้ส่ง (Gmail)
                </span>
                <Input
                  className="mt-1 rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="เช่น yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              {/* APP PASSWORD */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaKey className="text-blue-500" /> รหัสผ่านแอป (App password)
                </span>
                <Input.Password
                  className="mt-1 rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={passApp}
                  onChange={(e) => setPassApp(e.target.value)}
                />
                <span className="text-[11px] text-slate-500">
                  ใช้รหัสผ่านแอปของ Gmail (เปิด 2-Step Verification และสร้าง App password)
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-white border-t border-blue-100 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 h-10 rounded-xl border border-blue-200 bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={`px-4 h-10 rounded-xl text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.99] ${
                canSubmit && !submitting
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-300 text-white"
              }`}
            >
              {submitting ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>

          {/* Safe Area (iOS) */}
          <div className="md:hidden h-[env(safe-area-inset-bottom)] bg-white" />
        </div>
      </div>

      {/* Scoped CSS */}
      <style>{`
        .ev-scope input, .ev-scope textarea {
          border-radius: 0.75rem !important;
        }
      `}</style>
    </div>
  );
};

export default ModalEditSendEmail;
