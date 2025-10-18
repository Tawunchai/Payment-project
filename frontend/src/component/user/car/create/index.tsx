import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ======================= Bottom Sheet Picker ======================= */
type SheetFor = "brand" | "model" | "province";

type BottomSheetPickerProps = {
  open: boolean;
  title: string;
  options: string[];
  onClose: () => void;
  onSelect: (val: string) => void;
};

const BottomSheetPicker: React.FC<BottomSheetPickerProps> = ({
  open,
  title,
  options,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="
          absolute left-0 right-0 bottom-0
          bg-white rounded-t-3xl shadow-2xl
          pt-3 pb-6 animate-[sheetUp_180ms_ease-out]
        "
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300" />
        <div className="px-4 flex items-center justify-between">
          <button type="button" onClick={onClose} className="text-blue-600 font-semibold">
            ยกเลิก
          </button>
          <div className="text-gray-900 font-semibold">{title}</div>
          <div className="w-[64px]" />
        </div>

        <div className="px-4 mt-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหา"
              className="
                w-full rounded-2xl border border-gray-300 bg-white
                pl-11 pr-4 py-3 outline-none
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200
              "
            />
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </div>
        </div>

        <div className="mt-2 max-h-[62vh] overflow-y-auto px-4">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-500">ไม่พบรายการ</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => onSelect(opt)}
                    className="w-full text-left py-4 text-gray-800 hover:bg-gray-50"
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0%); }
        }
      `}</style>
    </div>
  );
};
/* ======================= End Bottom Sheet Picker ======================= */

const Index: React.FC = () => {
  const navigate = useNavigate();

  // form states
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [isSpecialReg, setIsSpecialReg] = useState(false);
  const [plate, setPlate] = useState("");
  const [province, setProvince] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // data
  const brandOptions = [
    "AJ EV","Audi","BMW","BYD","Changan","Chery","FOMM","FORD","FOXCONN",
    "GAC","GWM","Honda","Mazda","Nissan","Toyota","Tesla"
  ];
  const modelOptionsByBrand: Record<string, string[]> = {
    Toyota: ["Corolla Cross", "Yaris Ativ", "bZ4X"],
    Honda: ["City", "Civic e:HEV", "HR-V"],
    Mazda: ["Mazda2", "CX-3", "MX-30"],
    Nissan: ["Almera", "Kicks e-Power", "Leaf"],
    BYD: ["Atto 3", "Dolphin", "Seal"],
    Tesla: ["Model 3", "Model Y"],
    BMW: ["iX1", "iX3", "i4"],
    Audi: ["e-tron GT", "Q8 e-tron"],
    GWM: ["ORA Good Cat"],
  };
  const provinces = [
    "กรุงเทพมหานคร","กระบี่","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร","ขอนแก่น","จันทบุรี","ฉะเชิงเทรา",
    "ชลบุรี","ชัยนาท","ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่","ตรัง","ตราด","ตาก","นครนายก",
    "นครปฐม","นครพนม","นครราชสีมา","นครศรีธรรมราช","นครสวรรค์","นนทบุรี","นราธิวาส","น่าน",
    "บึงกาฬ","บุรีรัมย์","ปทุมธานี","ประจวบคีรีขันธ์","ปราจีนบุรี","ปัตตานี","พระนครศรีอยุธยา","พังงา",
    "พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์","แพร่","พะเยา","ภูเก็ต","มหาสารคาม","มุกดาหาร",
    "แม่ฮ่องสอน","ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง","ระยอง","ราชบุรี","ลพบุรี","ลำปาง","ลำพูน","เลย",
    "ศรีสะเกษ","สกลนคร","สงขลา","สตูล","สมุทรปราการ","สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี",
    "สิงห์บุรี","สุโขทัย","สุพรรณบุรี","สุราษฎร์ธานี","สุรินทร์","หนองคาย","หนองบัวลำภู","อ่างทอง",
    "อำนาจเจริญ","อุดรธานี","อุตรดิตถ์","อุทัยธานี","อุบลราชธานี"
  ];

  const modelOptions = useMemo(() => modelOptionsByBrand[brand] ?? [], [brand]);
  const canSubmit = brand && model && plate && province;

  // bottom sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("เลือก");
  const [sheetOptions, setSheetOptions] = useState<string[]>([]);
  const sheetFor = useRef<SheetFor>("brand");

  const openBrandSheet = () => {
    sheetFor.current = "brand";
    setSheetTitle("ยี่ห้อ");
    setSheetOptions(brandOptions);
    setSheetOpen(true);
  };
  const openModelSheet = () => {
    if (!brand) return;
    sheetFor.current = "model";
    setSheetTitle("รุ่น");
    setSheetOptions(modelOptions);
    setSheetOpen(true);
  };
  const openProvinceSheet = () => {
    sheetFor.current = "province";
    setSheetTitle("จังหวัด");
    setSheetOptions(provinces);
    setSheetOpen(true);
  };

  const handlePick = (val: string) => {
    if (sheetFor.current === "brand") {
      setBrand(val);
      setModel("");
    } else if (sheetFor.current === "model") {
      setModel(val);
    } else {
      setProvince(val);
    }
    setSheetOpen(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const payload = { brand, model, special_registration: isSpecialReg, plate, province, is_default: isDefault };
    console.log("SUBMIT VEHICLE:", payload);
    navigate(-1);
  };

  return (
    <form onSubmit={submit} className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="relative flex items-center justify-center px-4 py-3 border-b border-gray-100">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="ย้อนกลับ"
          className="absolute left-4 inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 active:scale-[0.98] transition"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-base font-semibold text-gray-900">เพิ่มพาหนะ</div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4 pb-28 sm:px-6">
        {/* Brand */}
        <label className="block">
          <span className="text-gray-700 text-sm">ยี่ห้อ <span className="text-red-500">*</span></span>
          <button
            type="button"
            onClick={openBrandSheet}
            className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-left text-gray-900 relative focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <span className={brand ? "" : "text-gray-400"}>{brand || "เลือกยี่ห้อ"}</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
          </button>
        </label>

        {/* Model */}
        <label className="block mt-4">
          <span className="text-gray-700 text-sm">รุ่น <span className="text-red-500">*</span></span>
          <button
            type="button"
            onClick={openModelSheet}
            disabled={!brand}
            className={`mt-2 w-full rounded-2xl border px-4 py-3 text-left relative ${
              brand
                ? "border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                : "border-gray-300 bg-gray-100 text-gray-400"
            }`}
          >
            {brand ? (model || "เลือกรุ่น") : "กรุณาเลือกยี่ห้อก่อน"}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
          </button>
        </label>

        {/* Supported connector */}
        <div className="mt-5">
          <div className="text-gray-700 text-sm">หัวชาร์จที่รองรับ</div>
          <div className="mt-3 text-xl leading-none">-</div>
        </div>

        <div className="my-5 h-[1px] w-full bg-gray-100" />

        {/* Special Reg */}
        <div className="flex items-start gap-3">
          <input
            id="specialReg"
            type="checkbox"
            checked={isSpecialReg}
            onChange={(e) => setIsSpecialReg(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="specialReg" className="flex-1">
            <div className="text-gray-900 font-medium">พาหนะของคุณเป็นทะเบียนพิเศษ</div>
            <p className="text-gray-500 text-sm mt-1">
              พาหนะของหน่วยงานราชการ, บุคคลในคณะผู้แทนทางการทูต, ทะเบียนต่างประเทศ เป็นต้น
            </p>
          </label>
        </div>

        {/* Plate */}
        <label className="block mt-6">
          <span className="text-gray-700 text-sm">ทะเบียนพาหนะ <span className="text-red-500">*</span></span>
          <input
            type="text"
            placeholder="เช่น 1กก 1234"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            required
          />
        </label>

        {/* Province (Bottom Sheet เหมือนกัน) */}
        <label className="block mt-4">
          <span className="text-gray-700 text-sm">จังหวัด <span className="text-red-500">*</span></span>
          <button
            type="button"
            onClick={openProvinceSheet}
            className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-left text-gray-900 relative focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <span className={province ? "" : "text-gray-400"}>{province || "เลือกจังหวัด"}</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
          </button>
        </label>

        {/* Default toggle */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-gray-900 font-semibold">ตั้งเป็นค่าเริ่มต้น</div>
          <button
            type="button"
            role="switch"
            aria-checked={isDefault}
            onClick={() => setIsDefault((v) => !v)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${isDefault ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${isDefault ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white/90 to-transparent">
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full h-14 rounded-2xl font-semibold text-white shadow-lg active:scale-[0.99] transition ${
            canSubmit ? "bg-blue-600" : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          บันทึก
        </button>
      </div>

      {/* Sheets */}
      <BottomSheetPicker
        open={sheetOpen}
        title={sheetTitle}
        options={sheetOptions}
        onClose={() => setSheetOpen(false)}
        onSelect={handlePick}
      />
    </form>
  );
};

export default Index;
