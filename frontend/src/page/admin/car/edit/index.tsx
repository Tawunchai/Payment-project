import React, { useEffect, useMemo, useState } from "react";
import { Select, Checkbox, Input, message } from "antd";
import { FaCarSide, FaCity, FaTags, FaBolt, FaTimes } from "react-icons/fa";
import { UpdateCarByID, ListCars } from "../../../../services";
import type { CarsInterface } from "../../../../interface/ICar";

const { Option } = Select;

interface ModalEditCarProps {
  open: boolean;
  onClose: () => void;
  car?: CarsInterface | null;
  onUpdated: (updated: CarsInterface) => void;
}

// type guard
function isCarsArray(arr: unknown): arr is CarsInterface[] {
  return Array.isArray(arr);
}

const ModalEditCar: React.FC<ModalEditCarProps> = ({
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
  const [plateError, setPlateError] = useState<string | null>(null);
  const [allCars, setAllCars] = useState<CarsInterface[]>([]);

  // === ตัวเลือก (ตัวอย่าง / fallback) ===
  const brandOptions = ["Toyota", "Honda", "Mazda", "Nissan", "BYD", "Tesla"];
  const modelOptionsByBrand: Record<string, string[]> = {
    Toyota: ["Corolla Cross", "Yaris Ativ", "bZ4X"],
    Honda: ["City", "Civic e:HEV", "HR-V"],
    Mazda: ["Mazda2", "CX-3", "MX-30"],
    Nissan: ["Almera", "Kicks e-Power", "Leaf"],
    BYD: ["Atto 3", "Dolphin", "Seal"],
    Tesla: ["Model 3", "Model Y"],
  };
  const provinces = [
    "กรุงเทพมหานคร","เชียงใหม่","ขอนแก่น","ภูเก็ต","นครราชสีมา","ชลบุรี","สงขลา","สุราษฎร์ธานี",
  ];

  const modelOptions = useMemo(() => modelOptionsByBrand[brand] ?? [], [brand]);

  // ✅ ชื่อเจ้าของ (หลายคนคั่นด้วย , )
  const ownerNames = useMemo(() => {
    const users = (car as any)?.User ?? [];
    if (!Array.isArray(users) || users.length === 0) return "-";
    return users
      .map((u) => `${u?.FirstName ?? ""} ${u?.LastName ?? ""}`.trim())
      .filter(Boolean)
      .join(", ");
  }, [car]);

  // โหลดรถทั้งหมดเพื่อเช็คทะเบียนซ้ำ (โหลดเมื่อ modal เปิด)
  useEffect(() => {
    const fetchCars = async () => {
      if (!open) return;
      try {
        const res = await ListCars();
        if (isCarsArray(res)) {
          setAllCars(res);
        } else {
          setAllCars([]);
        }
      } catch {
        setAllCars([]);
      }
    };
    fetchCars();
  }, [open]);

  // ตั้งค่าจากรถที่กำลังแก้ไข
  useEffect(() => {
    if (car) {
      setBrand((car as any).Brand ?? "");
      setModel((car as any).ModelCar ?? "");
      setPlate((car as any).LicensePlate ?? "");
      setProvince((car as any).City ?? "");
      setIsSpecialReg(!!(car as any).SpecialNumber);
      setPlateError(null);
    }
  }, [car]);

  // ===== ตรวจรูปแบบ/ซ้ำของทะเบียน =====
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
      if (car?.ID !== undefined && c.ID === car.ID) return false;
      const other = normalizePlate(String((c as any).LicensePlate ?? ""));
      return other === norm;
    });
    setPlateError(isDup ? "ทะเบียนนี้มีอยู่ในระบบแล้ว" : null);
  };

  useEffect(() => {
    validatePlate(plate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plate, allCars, car?.ID]);

  const canSubmit =
    Boolean(brand && model && plate && province && !plateError) &&
    car?.ID !== undefined;

  const handleSubmit = async () => {
    if (!car || car.ID === undefined || submitting || !canSubmit) return;

    // กันกรณี state lag: ตรวจอีกครั้งก่อนส่ง
    validatePlate(plate);
    if (plateError) {
      message.error("กรุณาแก้ไขทะเบียนให้ถูกต้องก่อนบันทึก");
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
      const ok = await UpdateCarByID(car.ID, payload);

      if (ok) {
        // ✅ ให้ข้อความโชว์ก่อน แล้วค่อยปิด (global message ไม่หายแม้ modal unmount)
        await message.open({
          type: "success",
          content: "อัปเดตข้อมูลรถสำเร็จ",
          duration: 1.2,
        });

        onUpdated({ ...car, ...payload });
        onClose();
      } else {
        message.error("เกิดข้อผิดพลาดในการอัปเดต");
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการอัปเดตรถ");
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

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
                  showSearch
                  optionFilterProp="children"
                  onChange={(val) => {
                    setBrand(val || "");
                    setModel("");
                  }}
                >
                  {brandOptions.map((b) => (
                    <Option key={b} value={b}>
                      {b}
                    </Option>
                  ))}
                </Select>
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
                  showSearch
                  optionFilterProp="children"
                  onChange={(val) => setModel(val || "")}
                >
                  {modelOptions.map((m) => (
                    <Option key={m} value={m}>
                      {m}
                    </Option>
                  ))}
                </Select>
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
                {plateError && <p className="text-xs text-red-500 mt-1">{plateError}</p>}
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
                  showSearch
                  optionFilterProp="children"
                  value={province || undefined}
                  onChange={(val) => setProvince(val || "")}
                >
                  {provinces.map((p) => (
                    <Option key={p} value={p}>
                      {p}
                    </Option>
                  ))}
                </Select>
              </label>

              {/* SPECIAL NUMBER */}
              <div className="flex items-center gap-2 mt-2">
                <Checkbox checked={isSpecialReg} onChange={(e) => setIsSpecialReg(e.target.checked)} />
                <span className="text-sm text-gray-700">ทะเบียนพิเศษ (Special Number)</span>
              </div>

              {/* OWNER */}
              <div className="pt-2">
                <p className="text-xs text-slate-500 text-center">เจ้าของ: {ownerNames}</p>
              </div>
            </div>
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
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={`px-4 h-10 rounded-xl text-white text-sm font-semibold shadow-sm ${
                canSubmit && !submitting ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
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

export default ModalEditCar;