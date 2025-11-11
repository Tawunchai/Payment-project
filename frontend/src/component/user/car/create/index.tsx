import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, message, Spin } from "antd";
import { CreateCar, CarInterface, ListModals, ListCars } from "../../../../services";
import type { ModalInterface } from "../../../../interface/ICarCatalog";
import { getCurrentUser, initUserProfile } from "../../../../services/httpLogin";

const EVHeader: React.FC<{ title?: string; onBack?: () => void }> = ({
  title = "เพิ่มพาหนะ",
  onBack,
}) => {
  const goBack = () => (onBack ? onBack() : window.history.back());
  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-b-2xl shadow-md overflow-hidden">
      <div className="w-full px-4 py-3 flex items-center gap-2 justify-start">
        <button
          type="button"
          onClick={goBack}
          aria-label="ย้อนกลับ"
          className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15 transition-colors"
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
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white">
            <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
          </svg>
          <span className="text-sm md:text-base font-semibold tracking-wide">{title}</span>
        </div>
      </div>
    </header>
  );
};

/* ---------------------------------------------------
   BOTTOM SHEET (MOBILE)
--------------------------------------------------- */
type SheetItem = { key: string; label: string };

const BottomSheet: React.FC<{
  open: boolean;
  title: string;
  items: SheetItem[];
  onClose: () => void;
  onSelect: (item: SheetItem) => void;
}> = ({ open, title, items, onClose, onSelect }) => {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => it.label.toLowerCase().includes(s));
  }, [q, items]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white shadow-2xl border-t border-slate-200 transition-transform duration-300"
        style={{ paddingBottom: "env(safe-area-inset-bottom)", maxHeight: "85vh" }}
      >
        <div className="pt-2 pb-1">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300" />
        </div>
        <div className="px-4 py-2 flex items-center justify-between">
          <button className="text-blue-600 font-medium" onClick={onClose}>
            ยกเลิก
          </button>
          <div className="text-slate-900 font-semibold">{title}</div>
          <div className="w-12" />
        </div>
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหา"
              className="w-full outline-none"
            />
          </div>
        </div>
        <div className="px-2 pb-2 overflow-y-auto" style={{ maxHeight: "65vh" }}>
          <ul className="divide-y divide-slate-100">
            {filtered.map((it) => (
              <li key={it.key}>
                <button
                  className="w-full text-left px-4 py-3 active:bg-slate-50"
                  onClick={() => onSelect(it)}
                >
                  {it.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------
   PROVINCES
--------------------------------------------------- */
const TH_PROVINCES = [
  'กระบี่', 'กรุงเทพมหานคร', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
    'ขอนแก่น',
    'จันทบุรี',
    'ฉะเชิงเทรา',
    'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่',
    'ตรัง', 'ตราด', 'ตาก',
    'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
    'บึงกาฬ', 'บุรีรัมย์',
    'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี',
    'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่',
    'ภูเก็ต',
    'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
    'ยโสธร', 'ยะลา',
    'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี',
    'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย',
    'ศรีสะเกษ',
    'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์',
    'หนองคาย', 'หนองบัวลำภู',
    'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
];



/* ---------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------- */
type CarRowForCheck = { LicensePlate?: string | null }; // <-- ใช้แค่ field ที่ต้องการเช็กซ้ำ

const AddCarPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [userID, setUserID] = useState<number | undefined>(undefined);

  // ✅ โหลด userID จาก JWT
  useEffect(() => {
    const loadUser = async () => {
      let current = getCurrentUser();
      if (!current) current = await initUserProfile();

      const uid = current?.id;
      if (!uid) {
        message.error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      setUserID(uid);
    };
    loadUser();
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [modals, setModals] = useState<ModalInterface[]>([]);
  const [loadingMods, setLoadingMods] = useState(true);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [otherBrand, setOtherBrand] = useState("");
  const [otherModel, setOtherModel] = useState("");
  const [isSpecialReg, setIsSpecialReg] = useState(false);
  const [plate, setPlate] = useState("");
  const [plateError, setPlateError] = useState<string | null>(null); // <-- error message
  const [province, setProvince] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [brandSheetOpen, setBrandSheetOpen] = useState(false);
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [provinceSheetOpen, setProvinceSheetOpen] = useState(false);

  // 📥 โหลดยี่ห้อ/รุ่น
  useEffect(() => {
    const load = async () => {
      setLoadingMods(true);
      const data = await ListModals();
      if (data) setModals(data);
      setLoadingMods(false);
    };
    load();
  }, []);

  // 📥 โหลดรถทั้งหมดเพื่อตรวจทะเบียนซ้ำ
  const [allCars, setAllCars] = useState<CarRowForCheck[]>([]);
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await ListCars();
        if (res && Array.isArray(res)) {
          // เก็บเฉพาะ field ที่ต้องใช้
          setAllCars(res.map((r: any) => ({ LicensePlate: r?.LicensePlate ?? null })));
        }
      } catch (e) {
        // เงียบ ๆ ก็ได้ ไม่บล็อคการใช้งาน
      }
    };
    fetchCars();
  }, []);

  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    modals.forEach((m) => {
      const name = m.Brand?.BrandName?.trim();
      if (name) set.add(name);
    });
    return [...set, "อื่นๆ"];
  }, [modals]);

  const modelOptions = useMemo(() => {
    if (!brand || brand === "อื่นๆ") return ["อื่นๆ"];
    const list = modals
      .filter((m) => m.Brand?.BrandName === brand)
      .map((m) => m.ModalName);
    return [...new Set(list), "อื่นๆ"];
  }, [brand, modals]);

  // ================== Validation ทะเบียน ==================
  // รูปแบบ: ตัวอักษรไทยหรืออังกฤษ 2 ตัว + เว้นวรรค (มี/ไม่มีได้) + ตัวเลข 4 ตัว
  const plateRegex = /^[A-Za-zก-ฮ]{2}\s?\d{4}$/;

  const normalizePlate = (s: string) => s.replace(/\s+/g, "").toUpperCase();

  const checkPlate = (value: string) => {
    const v = value.trim();
    if (!v) {
      setPlateError(null);
      return;
    }
    if (!plateRegex.test(v)) {
      setPlateError("รูปแบบทะเบียนไม่ถูกต้อง (เช่น กข 1234 หรือ AB 1234)");
      return;
    }
    const norm = normalizePlate(v);
    const duplicated = allCars.some((c) => normalizePlate(String(c.LicensePlate ?? "")) === norm);
    if (duplicated) {
      setPlateError("ทะเบียนนี้มีอยู่ในระบบแล้ว");
    } else {
      setPlateError(null);
    }
  };

  // ================== Submit ==================
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userID) {
      messageApi.error("ไม่พบข้อมูลผู้ใช้");
      return;
    }

    if (!brand || !model || !plate || !province) {
      messageApi.warning("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    // ตรวจอีกรอบก่อนส่ง
    checkPlate(plate);
    if (plateError) {
      messageApi.error("กรุณาแก้ไขข้อมูลทะเบียนก่อนบันทึก");
      return;
    }

    const finalBrand = brand === "อื่นๆ" ? otherBrand : brand;
    const finalModel = model === "อื่นๆ" ? otherModel : model;

    setSubmitting(true);
    try {
      const payload: CarInterface = {
        brand: finalBrand,
        model_car: finalModel,
        license_plate: plate.trim(),
        city: province,
        user_id: userID,
      };

      const res = await CreateCar(payload);
      if (res) {
        messageApi.success("เพิ่มข้อมูลรถสำเร็จ");
        setTimeout(() => navigate("/"), 1500);
      } else {
        messageApi.error("บันทึกไม่สำเร็จ");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="min-h-screen bg-gray-50 flex flex-col">
      {contextHolder}
      <EVHeader title="เพิ่มพาหนะ" onBack={() => navigate(-1)} />

      <div className="flex-1 px-4 pt-4 pb-28 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* ===== ยี่ห้อ ===== */}
          <div>
            <span className="text-sm text-gray-700">ยี่ห้อ *</span>
            {isMobile ? (
              <>
                <button
                  type="button"
                  onClick={() => setBrandSheetOpen(true)}
                  className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-left bg-white flex items-center justify-between"
                >
                  {loadingMods ? (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Spin size="small" /> กำลังโหลด...
                    </div>
                  ) : (
                    <>
                      <span className={brand ? "text-slate-900" : "text-slate-400"}>
                        {brand || "เลือกยี่ห้อ"}
                      </span>
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </>
                  )}
                </button>
                {brand === "อื่นๆ" && (
                  <input
                    className="mt-3 w-full rounded-xl border border-slate-300 p-3 bg-white outline-none"
                    placeholder="ระบุยี่ห้อ"
                    value={otherBrand}
                    onChange={(e) => setOtherBrand(e.target.value)}
                  />
                )}
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <select
                  className="rounded-xl border border-slate-300 p-3 bg-white outline-none"
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    setModel("");
                    setOtherBrand("");
                  }}
                >
                  <option value="">เลือกยี่ห้อ</option>
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {brand === "อื่นๆ" && (
                  <input
                    className="rounded-xl border border-slate-300 p-3 bg-white outline-none"
                    placeholder="ระบุยี่ห้อ"
                    value={otherBrand}
                    onChange={(e) => setOtherBrand(e.target.value)}
                  />
                )}
              </div>
            )}
          </div>

          {/* ===== รุ่น ===== */}
          <div>
            <span className="text-sm text-gray-700">รุ่น *</span>
            {isMobile ? (
              <>
                <button
                  type="button"
                  onClick={() => setModelSheetOpen(true)}
                  disabled={!brand}
                  className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-left bg-white flex items-center justify-between"
                >
                  <span className={model ? "text-slate-900" : "text-slate-400"}>
                    {model || "เลือกรุ่น"}
                  </span>
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {(brand === "อื่นๆ" || model === "อื่นๆ") && (
                  <input
                    className="mt-3 w-full rounded-xl border border-slate-300 p-3 bg-white outline-none"
                    placeholder="ระบุรุ่น"
                    value={otherModel}
                    onChange={(e) => setOtherModel(e.target.value)}
                  />
                )}
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <select
                  className="rounded-xl border border-slate-300 p-3 bg-white outline-none"
                  disabled={!brand}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="">เลือกรุ่น</option>
                  {modelOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {(brand === "อื่นๆ" || model === "อื่นๆ") && (
                  <input
                    className="rounded-xl border border-slate-300 p-3 bg-white outline-none"
                    placeholder="ระบุรุ่น"
                    value={otherModel}
                    onChange={(e) => setOtherModel(e.target.value)}
                  />
                )}
              </div>
            )}
          </div>

          {/* ===== ทะเบียนพิเศษ ===== */}
          <div className="flex items-center gap-2">
            <Checkbox checked={isSpecialReg} onChange={(e) => setIsSpecialReg(e.target.checked)} />
            <span>พาหนะของคุณเป็นทะเบียนพิเศษ</span>
          </div>

          {/* ===== ทะเบียน ===== */}
          <div>
            <span className="text-sm text-gray-700">ทะเบียน *</span>
            <input
              className={`mt-2 w-full rounded-xl border p-3 bg-white outline-none ${
                plateError ? "border-red-400" : "border-slate-300"
              }`}
              placeholder="เช่น กข 1234 หรือ AB 1234"
              value={plate}
              onChange={(e) => {
                const v = e.target.value;
                setPlate(v);
                checkPlate(v);
              }}
            />
            {plateError && <p className="text-xs text-red-500 mt-1">{plateError}</p>}
          </div>

          {/* ===== จังหวัด ===== */}
          <div>
            <span className="text-sm text-gray-700">จังหวัด *</span>
            {isMobile ? (
              <button
                type="button"
                onClick={() => setProvinceSheetOpen(true)}
                className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-left bg-white flex items-center justify-between"
              >
                <span className={province ? "text-slate-900" : "text-slate-400"}>
                  {province || "เลือกจังหวัด"}
                </span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            ) : (
              <select
                className="mt-2 w-full rounded-xl border border-slate-300 p-3 bg-white outline-none"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="">เลือกจังหวัด</option>
                {TH_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ปุ่มบันทึก */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 bg-white">
        <button
          type="submit"
          disabled={submitting}
          className={`w-full h-14 rounded-2xl font-semibold text-white shadow-lg ${
            !submitting ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300"
          }`}
        >
          {submitting ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>

      {/* BottomSheet (Mobile only) */}
      <BottomSheet
        open={isMobile && brandSheetOpen}
        title="ยี่ห้อ"
        items={brandOptions.map((b) => ({ key: b, label: b }))}
        onClose={() => setBrandSheetOpen(false)}
        onSelect={(it) => {
          setBrand(it.key);
          setBrandSheetOpen(false);
        }}
      />
      <BottomSheet
        open={isMobile && modelSheetOpen}
        title="รุ่น"
        items={modelOptions.map((m) => ({ key: m, label: m }))}
        onClose={() => setModelSheetOpen(false)}
        onSelect={(it) => {
          setModel(it.key);
          setModelSheetOpen(false);
        }}
      />
      <BottomSheet
        open={isMobile && provinceSheetOpen}
        title="จังหวัด"
        items={TH_PROVINCES.map((p) => ({ key: p, label: p }))}
        onClose={() => setProvinceSheetOpen(false)}
        onSelect={(it) => {
          setProvince(it.key);
          setProvinceSheetOpen(false);
        }}
      />
    </form>
  );
};

export default AddCarPage;