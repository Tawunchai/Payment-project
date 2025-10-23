import React, { useState, useEffect } from "react";
import { Input, message } from "antd";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaBolt, FaTimes, FaCalendarAlt } from "react-icons/fa";
import type { ServiceInterface } from "../../../../interface/IService";
import { UpdateServiceByID } from "../../../../services";

interface EditServiceModalProps {
  open: boolean;
  onClose: () => void;
  service?: ServiceInterface | null;
  onUpdated: (updated: ServiceInterface) => void;
}

const ModalEditService: React.FC<EditServiceModalProps> = ({
  open,
  onClose,
  service,
  onUpdated,
}) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [mapURL, setMapURL] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (service) {
      setEmail(service.Email || "");
      setPhone(service.Phone || "");
      setLocation(service.Location || "");
      setMapURL(service.MapURL || "");
    }
  }, [service]);

  const canSubmit = email && phone && location;

  const handleSubmit = async () => {
    if (!service?.ID || submitting || !canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        Email: email,
        Phone: phone,
        Location: location,
        MapURL: mapURL,
      };
      const res = await UpdateServiceByID(service.ID, payload);
      if (res) {
        messageApi.success("อัปเดตข้อมูลบริการสำเร็จ!");
        onUpdated({ ...service, ...payload });
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
                <h2 className="text-base md:text-lg font-semibold">แก้ไขข้อมูลบริการ</h2>
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
                  <FaEnvelope className="text-blue-500" /> อีเมลติดต่อ
                </span>
                <Input
                  className="mt-1 rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="เช่น support@evstation.example"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              {/* PHONE */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaPhoneAlt className="text-blue-500" /> เบอร์โทรศัพท์
                </span>
                <Input
                  className="mt-1 rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="เช่น +66 2 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              {/* LOCATION */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" /> ที่อยู่
                </span>
                <Input.TextArea
                  rows={3}
                  className="rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="เช่น ชั้น 12 อาคาร EV Station Tower ถนนสุขุมวิท กรุงเทพฯ 10110"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </label>

              {/* MAP URL */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" /> ลิงก์แผนที่ (Google Maps)
                </span>
                <Input
                  className="mt-1 rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="https://www.google.com/maps?q=..."
                  value={mapURL}
                  onChange={(e) => setMapURL(e.target.value)}
                />
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

export default ModalEditService;
