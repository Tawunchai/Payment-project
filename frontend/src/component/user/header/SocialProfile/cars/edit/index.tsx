import React, { useMemo, useState, useEffect } from "react";
import { Select, Checkbox, Input, message } from "antd";
import { CarsInterface } from "../../../../../../interface/ICar";
import { UpdateCarByID, ListCars } from "../../../../../../services";
import {
  FaCarSide,
  FaCity,
  FaTags,
  FaBolt,
  FaTimes,
} from "react-icons/fa";

interface EditCarModalProps {
  open: boolean;
  onClose: () => void;
  car?: CarsInterface | null;
  onUpdated: (updated: CarsInterface) => void;
}

const EditCarModal: React.FC<EditCarModalProps> = ({
  open,
  onClose,
  car,
  onUpdated,
}) => {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [province, setProvince] = useState("");
  const [isSpecialReg, setIsSpecialReg] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // สำหรับตรวจทะเบียนซ้ำ
  const [allCars, setAllCars] = useState<CarsInterface[]>([]);
  const [plateError, setPlateError] = useState<string | null>(null);

  // ตัวเลือก (ตัวอย่าง)
  const brandOptions = ["Toyota", "Honda", "Mazda", "Nissan", "BYD", "Tesla"];
  const modelOptionsByBrand: Record<string, string[]> = {
    Toyota: ["Corolla Cross", "Yaris Ativ", "bZ4X"],
    Honda: ["City", "Civic e:HEV", "HR-V"],
    Mazda: ["Mazda2", "CX-3", "MX-30"],
    Nissan: ["Almera", "Kicks e-Power", "Leaf"],
    BYD: ["Atto 3", "Dolphin", "Seal"],
    Tesla: ["Model 3", "Model Y"],
  };
  const provinces = ["กรุงเทพมหานคร", "เชียงใหม่", "ขอนแก่น", "ภูเก็ต", "นครราชสีมา"];

  // โหลดรถทั้งหมดเพื่อเช็กทะเบียนซ้ำ (เมื่อ modal เปิด)
  useEffect(() => {
    const fetchCars = async () => {
      try {
        if (!open) return;
        const res = await ListCars();
        if (Array.isArray(res)) {
          setAllCars(res);
        }
      } catch {
        // ไม่บล็อค UI
      }
    };
    fetchCars();
  }, [open]);

  // ตั้งค่าค่าจากรถที่กำลังแก้ไข
  useEffect(() => {
    if (car) {
      setBrand(car.Brand || "");
      setModel(car.ModelCar || "");
      setPlate(car.LicensePlate || "");
      setProvince(car.City || "");
      setIsSpecialReg(!!car.SpecialNumber);
      setPlateError(null);
    }
  }, [car]);

  const modelOptions = useMemo(() => modelOptionsByBrand[brand] ?? [], [brand]);

  // ===== ตรวจรูปแบบและซ้ำของทะเบียน =====
  // รูปแบบที่อนุญาต: อักษรไทย/อังกฤษ 2 ตัว + ช่องว่าง "0 หรือ 1 ช่อง" + เลข 4 ตัว  เช่น "กข 1234", "AB1234"
  const plateRegex = /^[A-Za-zก-ฮ]{2}\s?\d{4}$/;

  const normalizePlate = (s: string) => s.replace(/\s+/g, "").toUpperCase();

  const validatePlate = (raw: string) => {
    const v = raw.trim();
    if (!v) {
      setPlateError(null);
      return;
    }
    if (!plateRegex.test(v)) {
      setPlateError("รูปแบบทะเบียนไม่ถูกต้อง (เช่น กข 1234 หรือ AB 1234)");
      return;
    }
    const norm = normalizePlate(v);
    const isDup = allCars.some((c) => {
      // ข้ามคันที่กำลังแก้ไข (ID เดียวกัน)
      if (car?.ID && c.ID === car.ID) return false;
      const other = normalizePlate(String(c?.LicensePlate ?? ""));
      return other === norm;
    });
    if (isDup) {
      setPlateError("ทะเบียนนี้มีอยู่ในระบบแล้ว");
    } else {
      setPlateError(null);
    }
  };

  // เรียกตรวจทุกครั้งที่พิมพ์
  useEffect(() => {
    validatePlate(plate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plate, allCars, car?.ID]);

  const canSubmit = Boolean(brand && model && plate && province && !plateError);

  const handleSubmit = async () => {
    if (!car?.ID || submitting || !canSubmit) return;

    // ตรวจซ้ำก่อนส่งอีกครั้ง (กันกรณี state lag)
    validatePlate(plate);
    if (plateError) {
      messageApi.error("กรุณาแก้ไขทะเบียนให้ถูกต้องก่อนบันทึก");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        Brand: brand,
        ModelCar: model,
        LicensePlate: plate.trim(),
        City: province,
        SpecialNumber: isSpecialReg,
      };
      const res = await UpdateCarByID(car.ID, payload);
      if (res) {
        messageApi.success("อัปเดตรถสำเร็จ!");
        onUpdated({ ...car, ...payload });
        onClose();
      } else {
        messageApi.error("ไม่สามารถอัปเดตข้อมูลได้");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("เกิดข้อผิดพลาดในการอัปเดตรถ");
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
                <h2 className="text-base md:text-lg font-semibold">แก้ไขข้อมูลพาหนะ</h2>
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
              {/* BRAND */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaCarSide className="text-blue-500" /> ยี่ห้อรถ
                </span>
                <Select
                  className="ev-select w-full"
                  placeholder="เลือกยี่ห้อ"
                  size="large"
                  value={brand || undefined}
                  allowClear
                  onChange={(val) => {
                    setBrand(val || "");
                    setModel("");
                  }}
                  options={brandOptions.map((b) => ({ label: b, value: b }))}
                />
              </label>

              {/* MODEL */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaTags className="text-blue-500" /> รุ่นรถ
                </span>
                <Select
                  className="ev-select w-full"
                  placeholder={brand ? "เลือกรุ่น" : "กรุณาเลือกยี่ห้อก่อน"}
                  size="large"
                  disabled={!brand}
                  value={model || undefined}
                  allowClear
                  onChange={(val) => setModel(val || "")}
                  options={modelOptions.map((m) => ({ label: m, value: m }))}
                />
              </label>

              {/* LICENSE PLATE */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaTags className="text-blue-500" /> ทะเบียนรถ
                </span>
                <Input
                  className={`mt-1 rounded-xl border p-2.5 outline-none ${
                    plateError
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                  placeholder="เช่น กข 1234 หรือ AB 1234"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                />
                {plateError && (
                  <p className="text-xs text-red-500 mt-1">{plateError}</p>
                )}
              </label>

              {/* PROVINCE */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaCity className="text-blue-500" /> จังหวัด
                </span>
                <Select
                  className="ev-select w-full"
                  placeholder="เลือกจังหวัด"
                  size="large"
                  allowClear
                  value={province || undefined}
                  onChange={(val) => setProvince(val || "")}
                  options={provinces.map((p) => ({ label: p, value: p }))}
                />
              </label>

              {/* SPECIAL NUMBER */}
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  checked={isSpecialReg}
                  onChange={(e) => setIsSpecialReg(e.target.checked)}
                />
                <span className="text-sm text-gray-700">เป็นทะเบียนพิเศษ</span>
              </div>
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

      {/* Scoped CSS สำหรับ Select */}
      <style>{`
        .ev-scope .ev-select .ant-select-selector {
          border-radius: 0.75rem !important;
          border-color: #e2e8f0 !important;
          height: 44px !important;
          display: flex;
          align-items: center;
          background-color: #ffffff !important;
        }
        .ev-scope .ev-select:hover .ant-select-selector {
          border-color: #cbd5e1 !important;
        }
        .ev-scope .ev-select.ant-select-focused .ant-select-selector,
        .ev-scope .ev-select .ant-select-selector:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25) !important;
        }
        .ev-scope .ev-select .ant-select-selection-item,
        .ev-scope .ev-select .ant-select-selection-placeholder {
          line-height: 42px !important;
        }
        .ev-scope .ev-select-dropdown {
          border-radius: 0.75rem !important;
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default EditCarModal;