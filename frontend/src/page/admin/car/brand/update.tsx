import React, { useState } from "react";
import { FaEdit, FaTimes, FaTag } from "react-icons/fa";
import { Input, message } from "antd";
import { UpdateBrandByID } from "../../../../services";
import type { BrandInterface } from "../../../../interface/IBrand";

interface UpdateBrandModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  brandID: number;
  initialName: string;
}

const UpdateBrandModal: React.FC<UpdateBrandModalProps> = ({
  open,
  onClose,
  onSuccess,
  brandID,
  initialName,
}) => {
  const [brandName, setBrandName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (!brandName.trim()) {
      message.warning("กรุณากรอกชื่อยี่ห้อ");
      return;
    }

    setLoading(true);
    const updateBrand: Partial<BrandInterface> = { BrandName: brandName };
    const res = await UpdateBrandByID(brandID, updateBrand);
    setLoading(false);

    if (!res) {
      message.error("เกิดข้อผิดพลาดในการอัปเดตยี่ห้อ");
      return;
    }

    if ("error" in res) {
      if (res.error.includes("ชื่อยี่ห้อนี้มีอยู่แล้ว")) {
        message.warning("ชื่อยี่ห้อนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น");
      } else {
        message.error(res.error || "เกิดข้อผิดพลาดในการอัปเดตยี่ห้อ");
      }
      return;
    }

    // ✅ ตรวจสอบทั้งกรณี res.data.BrandName และ res.BrandName
    if ("data" in res && res.data && "BrandName" in res.data) {
      message.success("อัปเดตยี่ห้อสำเร็จ");
      onSuccess();
      onClose();
    } else if ("BrandName" in res) {
      message.success("อัปเดตยี่ห้อสำเร็จ");
      onSuccess();
      onClose();
    } else if ("message" in res) {
      message.success(res.message || "อัปเดตยี่ห้อสำเร็จ");
      onSuccess();
      onClose();
    } else {
      message.error("ไม่สามารถอัปเดตยี่ห้อได้");
    }
  };

  const canSubmit = !!brandName.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center ev-scope"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[420px] mx-4 md:mx-auto mb-8 md:mb-0">
        <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-blue-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-3 pb-4 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaEdit className="opacity-90" />
              <h2 className="text-base md:text-lg font-semibold">แก้ไขยี่ห้อ</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 -m-2 rounded-lg hover:bg-white/10"
              aria-label="ปิดหน้าต่าง"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-6 bg-blue-50/40">
            <label className="flex flex-col gap-2">
              <span className="text-xs text-slate-600 flex items-center gap-2">
                <FaTag className="text-blue-500" /> ชื่อยี่ห้อ (Brand Name)
              </span>
              <Input
                size="large"
                placeholder="กรอกชื่อยี่ห้อ..."
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="rounded-xl border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
                allowClear
              />
            </label>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-white border-t border-blue-100 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 h-10 rounded-xl border border-blue-200 bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={!canSubmit || loading}
              className={`px-4 h-10 rounded-xl text-white text-sm font-semibold shadow-sm ${
                canSubmit && !loading
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBrandModal;
