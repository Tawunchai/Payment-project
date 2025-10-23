import React, { useEffect, useMemo, useState } from "react";
import { message, Select, Checkbox } from "antd";
import { FaCarSide, FaCity, FaHashtag, FaTimes, FaEdit } from "react-icons/fa";
import { UpdateCarByID } from "../../../../services";

const { Option } = Select;

interface ModalEditCarProps {
  open: boolean;
  onClose: () => void;
  car: any;
  onUpdated: () => void;
}

const ModalEditCar: React.FC<ModalEditCarProps> = ({ open, onClose, car, onUpdated }) => {
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [plate, setPlate] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [special, setSpecial] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // 🧠 ตัวเลือกยี่ห้อ / รุ่น / จังหวัด
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
    "กรุงเทพมหานคร",
    "เชียงใหม่",
    "ขอนแก่น",
    "ภูเก็ต",
    "นครราชสีมา",
    "ชลบุรี",
    "สงขลา",
    "สุราษฎร์ธานี",
  ];

  const modelOptions = useMemo(() => modelOptionsByBrand[brand] ?? [], [brand]);
  const canSubmit = Boolean(brand && model && plate && province);

  // โหลดข้อมูลรถเข้าฟอร์ม
  useEffect(() => {
    if (car) {
      setBrand(car.Brand || "");
      setModel(car.ModelCar || "");
      setPlate(car.LicensePlate || "");
      setProvince(car.City || "");
      setSpecial(car.SpecialNumber || false);
    }
  }, [car]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!canSubmit) {
      message.warning("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        Brand: brand,
        ModelCar: model,
        LicensePlate: plate,
        City: province,
        SpecialNumber: special,
      };
      const ok = await UpdateCarByID(car.ID, payload);
      if (ok) {
        message.success("อัปเดตข้อมูลรถสำเร็จ");
        onUpdated();
        onClose();
      } else {
        message.error("เกิดข้อผิดพลาดในการอัปเดต");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center ev-scope"
      role="dialog"
      aria-modal="true"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-[500px] mx-4 md:mx-auto mt-24 md:mt-0 mb-8 md:mb-0">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-blue-100 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="px-5 pt-3 pb-4 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaEdit className="opacity-90" />
              <h2 className="text-base md:text-lg font-semibold">แก้ไขข้อมูลรถยนต์</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 -m-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 bg-blue-50/40 overflow-y-auto">
            <div className="space-y-4">
              {/* Brand */}
              <label className="block">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaCarSide className="text-blue-500" /> ยี่ห้อ (Brand)
                </span>
                <Select
                  className="ev-select mt-1 w-full"
                  popupClassName="ev-select-dropdown"
                  size="large"
                  allowClear
                  placeholder="เลือกยี่ห้อ"
                  value={brand || undefined}
                  onChange={(val) => {
                    setBrand(val || "");
                    setModel("");
                  }}
                  showSearch
                  optionFilterProp="children"
                >
                  {brandOptions.map((b) => (
                    <Option key={b} value={b}>
                      {b}
                    </Option>
                  ))}
                </Select>
              </label>

              {/* Model */}
              <label className="block">
                <span className="text-xs text-slate-600">รุ่น (Model)</span>
                <Select
                  className="ev-select mt-1 w-full"
                  popupClassName="ev-select-dropdown"
                  size="large"
                  allowClear
                  placeholder={brand ? "เลือกรุ่น" : "กรุณาเลือกยี่ห้อก่อน"}
                  value={model || undefined}
                  onChange={(val) => setModel(val || "")}
                  disabled={!brand}
                  showSearch
                  optionFilterProp="children"
                >
                  {modelOptions.map((m) => (
                    <Option key={m} value={m}>
                      {m}
                    </Option>
                  ))}
                </Select>
              </label>

              {/* License Plate */}
              <label className="block">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaHashtag className="text-blue-500" /> ทะเบียนรถ (License Plate)
                </span>
                <input
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  placeholder="เช่น 1กก 1234"
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </label>

              {/* Province */}
              <label className="block">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaCity className="text-blue-500" /> จังหวัด (City)
                </span>
                <Select
                  className="ev-select mt-1 w-full"
                  popupClassName="ev-select-dropdown"
                  size="large"
                  allowClear
                  placeholder="เลือกจังหวัด"
                  value={province || undefined}
                  onChange={(val) => setProvince(val || "")}
                  showSearch
                  optionFilterProp="children"
                >
                  {provinces.map((p) => (
                    <Option key={p} value={p}>
                      {p}
                    </Option>
                  ))}
                </Select>
              </label>

              {/* Special Number */}
              <div className="flex items-center gap-2 mt-3">
                <Checkbox checked={special} onChange={(e) => setSpecial(e.target.checked)} />
                <span className="text-sm text-slate-700">ทะเบียนพิเศษ (Special Number)</span>
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
              disabled={loading || !canSubmit}
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

      {/* Scoped CSS */}
      <style>{`
        .ev-scope .ev-select .ant-select-selector {
          border-radius: 0.75rem !important;
          border-color: #e2e8f0 !important;
          height: 44px !important;
          padding: 0 12px !important;
          display: flex;
          align-items: center;
          background-color: #ffffff !important;
        }
        .ev-scope .ev-select:hover .ant-select-selector {
          border-color: #cbd5e1 !important;
        }
        .ev-scope .ev-select.ant-select-focused .ant-select-selector,
        .ev-scope .ev-select .ant-select-selector:focus,
        .ev-scope .ev-select .ant-select-selector:active {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25) !important;
        }
        .ev-scope .ev-select .ant-select-selection-item,
        .ev-scope .ev-select .ant-select-selection-placeholder {
          line-height: 42px !important;
        }
        .ev-scope .ev-select .ant-select-clear,
        .ev-scope .ev-select .ant-select-arrow {
          top: 50%;
          transform: translateY(-50%);
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
