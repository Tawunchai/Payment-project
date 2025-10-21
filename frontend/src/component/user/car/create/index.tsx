import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Checkbox, message } from "antd";
import { CreateCar, CarInterface } from "../../../../services";

const { Option } = Select;

/* ============ Icon & Header ============ */
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

const EVHeader: React.FC<{ title?: string; onBack?: () => void }> = ({
  title = "เพิ่มพาหนะ",
  onBack,
}) => {
  const goBack = () => (onBack ? onBack() : window.history.back());
  return (
    <header className="sticky top-0 z-20 bg-blue-600 text-white rounded-b-2xl shadow-md">
      <div className="mx-auto max-w-screen-sm md:max-w-5xl px-4 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={goBack}
          className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15"
          aria-label="ย้อนกลับ"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
            <BoltIcon className="h-5 w-5 text-white" />
          </span>
          <span className="text-sm md:text-base font-semibold tracking-wide">{title}</span>
        </div>
      </div>
    </header>
  );
};

/* ============ Page ============ */
const Index: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // states
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [isSpecialReg, setIsSpecialReg] = useState<boolean>(false);
  const [plate, setPlate] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const userID = Number(localStorage.getItem("userid")); // ดึง user id จาก localStorage

  // options
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

  const modelOptions = useMemo(() => modelOptionsByBrand[brand] ?? [], [brand]);
  const canSubmit = Boolean(brand && model && plate && province);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const payload: CarInterface = {
        brand: brand,
        model_car: model,
        license_plate: plate,
        city: province,
        user_id: userID,
      };

      const res = await CreateCar(payload);
      if (res) {
        messageApi.success({ content: "เพิ่มข้อมูลรถสำเร็จ", duration: 2 });
        setTimeout(() => navigate("/"), 2000); // ⏳ delay 2 วิ แล้วค่อยไปหน้า /
      } else {
        messageApi.error("บันทึกไม่สำเร็จ กรุณาลองใหม่");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="min-h-screen bg-gray-50 flex flex-col ev-scope">
      {contextHolder}
      <EVHeader title="เพิ่มพาหนะ" onBack={() => navigate(-1)} />

      <div className="flex-1 px-4 pt-4 pb-28 md:pb-40 sm:px-6">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          {/* BRAND */}
          <label className="block">
            <span className="text-sm text-gray-700">
              ยี่ห้อ <span className="text-red-500">*</span>
            </span>
            <Select
              className="ev-select mt-2 w-full"
              popupClassName="ev-select-dropdown"
              size="large"
              allowClear
              placeholder="เลือกยี่ห้อ"
              value={brand || undefined}
              onChange={(val) => {
                setBrand(val || "");
                setModel(""); // reset รุ่น
              }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {brandOptions.map((b) => (
                <Option key={b} value={b}>
                  {b}
                </Option>
              ))}
            </Select>
          </label>

          {/* MODEL */}
          <label className="block">
            <span className="text-sm text-gray-700">
              รุ่น <span className="text-red-500">*</span>
            </span>
            <Select
              className="ev-select mt-2 w-full"
              popupClassName="ev-select-dropdown"
              size="large"
              allowClear
              placeholder={brand ? "เลือกรุ่น" : "กรุณาเลือกยี่ห้อก่อน"}
              value={model || undefined}
              onChange={(val) => setModel(val || "")}
              disabled={!brand}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {modelOptions.map((m) => (
                <Option key={m} value={m}>
                  {m}
                </Option>
              ))}
            </Select>
          </label>

          {/* SPECIAL REG */}
          <div className="flex items-center gap-2">
            <Checkbox checked={isSpecialReg} onChange={(e) => setIsSpecialReg(e.target.checked)} />
            <span>พาหนะของคุณเป็นทะเบียนพิเศษ</span>
          </div>

          {/* PLATE */}
          <label className="block">
            <span className="text-sm text-gray-700">
              ทะเบียน <span className="text-red-500">*</span>
            </span>
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="เช่น 1กก 1234"
            />
          </label>

          {/* PROVINCE */}
          <label className="block">
            <span className="text-sm text-gray-700">
              จังหวัด <span className="text-red-500">*</span>
            </span>
            <Select
              className="ev-select mt-2 w-full"
              popupClassName="ev-select-dropdown"
              size="large"
              allowClear
              placeholder="เลือกจังหวัด"
              value={province || undefined}
              onChange={(val) => setProvince(val || "")}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {provinces.map((p) => (
                <Option key={p} value={p}>
                  {p}
                </Option>
              ))}
            </Select>
          </label>
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 bg-white">
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className={`w-full h-14 rounded-2xl font-semibold text-white shadow-lg ${
            canSubmit && !submitting ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300"
          }`}
        >
          {submitting ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>

      {/* Scoped CSS for rounded Antd Select */}
      <style>{`
        .ev-scope .ev-select .ant-select-selector {
          border-radius: 0.75rem !important;        /* rounded-xl */
          border-color: #e2e8f0 !important;         /* slate-300 */
          height: 44px !important;
          padding: 0 12px !important;
          display: flex;
          align-items: center;
          background-color: #ffffff !important;
        }
        .ev-scope .ev-select:hover .ant-select-selector {
          border-color: #cbd5e1 !important;         /* slate-300 hover */
        }
        .ev-scope .ev-select.ant-select-focused .ant-select-selector,
        .ev-scope .ev-select .ant-select-selector:focus,
        .ev-scope .ev-select .ant-select-selector:active {
          border-color: #2563eb !important;         /* blue-600 */
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25) !important;
        }
        .ev-scope .ev-select .ant-select-selection-item,
        .ev-scope .ev-select .ant-select-selection-placeholder {
          line-height: 42px !important;             /* center vertically */
        }
        .ev-scope .ev-select .ant-select-clear,
        .ev-scope .ev-select .ant-select-arrow {
          top: 50%;
          transform: translateY(-50%);
        }
        .ev-scope .ev-select-dropdown {
          border-radius: 0.75rem !important;        /* rounded dropdown */
          overflow: hidden !important;
        }
      `}</style>
    </form>
  );
};

export default Index;
