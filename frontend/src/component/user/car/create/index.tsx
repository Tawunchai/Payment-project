import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, message, Spin, Select } from "antd";
import { CreateCar, CarInterface, ListModals } from "../../../../services";
import type { ModalInterface } from "../../../../interface/ICarCatalog";

const { Option } = Select;

const EVHeader: React.FC<{ title?: string; onBack?: () => void }> = ({
  title = "เพิ่มพาหนะ",
  onBack,
}) => {
  const goBack = () => (onBack ? onBack() : window.history.back());
  return (
    <header
      className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-b-2xl shadow-md overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="w-full px-4 py-3 flex items-center gap-2 justify-start">
        {/* ปุ่มย้อนกลับ */}
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
            <path
              d="M15 18l-6-6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* ไอคอน ⚡ + ชื่อหัวข้อ */}
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 text-white"
          >
            <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
          </svg>
          <span className="text-sm md:text-base font-semibold tracking-wide">
            {title}
          </span>
        </div>
      </div>
    </header>
  );
};


/* ============ Bottom Sheet Component ============ */
type SheetItem = { key: string; label: string };

const BottomSheet: React.FC<{
  open: boolean;
  title: string;
  items: SheetItem[];
  onClose: () => void;
  onSelect: (item: SheetItem) => void;
  enableSearch?: boolean;
  placeholder?: string;
}> = ({ open, title, items, onClose, onSelect, enableSearch = true, placeholder = "ค้นหา" }) => {
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => it.label.toLowerCase().includes(s));
  }, [q, items]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white shadow-2xl border-t border-slate-200"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          maxHeight: "85vh",
        }}
      >
        {/* Handle + Header */}
        <div className="pt-2 pb-1">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300" />
        </div>
        <div className="px-4 py-2 flex items-center justify-between">
          <button className="text-blue-600 font-medium" onClick={onClose}>
            ยกเลิก
          </button>
          <div className="text-slate-900 font-semibold">{title}</div>
          <div className="w-12" /> {/* spacer */}
        </div>

        {/* Search */}
        {enableSearch && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="w-full outline-none"
              />
            </div>
          </div>
        )}

        {/* List */}
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

/* ============ Provinces (ตามที่ให้มา) ============ */
const TH_PROVINCES = [
  "กระบี่","กรุงเทพมหานคร","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร",
  "ขอนแก่น","จันทบุรี","ฉะเชิงเทรา","ชลบุรี","ชัยนาท","ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่",
  "ตรัง","ตราด","ตาก","นครนายก","นครปฐม","นครพนม","นครราชสีมา","นครศรีธรรมราช","นครสวรรค์","นนทบุรี","นราธิวาส","น่าน",
  "บึงกาฬ","บุรีรัมย์","ปทุมธานี","ประจวบคีรีขันธ์","ปราจีนบุรี","ปัตตานี",
  "พระนครศรีอยุธยา","พะเยา","พังงา","พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์","แพร่",
  "ภูเก็ต","มหาสารคาม","มุกดาหาร","แม่ฮ่องสอน","ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง","ระยอง","ราชบุรี",
  "ลพบุรี","ลำปาง","ลำพูน","เลย","ศรีสะเกษ","สกลนคร","สงขลา","สตูล","สมุทรปราการ","สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี","สิงห์บุรี",
  "สุโขทัย","สุพรรณบุรี","สุราษฎร์ธานี","สุรินทร์","หนองคาย","หนองบัวลำภู",
  "อ่างทอง","อำนาจเจริญ","อุดรธานี","อุตรดิตถ์","อุทัยธานี","อุบลราชธานี"
];

/* ============ Page ============ */
const AddCarPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const userID = Number(localStorage.getItem("userid"));

  // detect mobile
  const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // remote data
  const [modals, setModals] = useState<ModalInterface[]>([]);
  const [loadingMods, setLoadingMods] = useState(true);

  // selections
  const [brand, setBrand] = useState<string>("");          // ชื่อยี่ห้อที่เลือก
  const [model, setModel] = useState<string>("");          // ชื่อรุ่นที่เลือก
  const [otherBrand, setOtherBrand] = useState<string>(""); // กรอกยี่ห้อเอง
  const [otherModel, setOtherModel] = useState<string>(""); // กรอกรุ่นเอง
  const [isSpecialReg, setIsSpecialReg] = useState<boolean>(false);
  const [plate, setPlate] = useState<string>("");
  const [province, setProvince] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  // sheets
  const [brandSheetOpen, setBrandSheetOpen] = useState(false);
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [provinceSheetOpen, setProvinceSheetOpen] = useState(false);

  // load modals
  useEffect(() => {
    const load = async () => {
      setLoadingMods(true);
      const data = await ListModals();
      if (data) setModals(data);
      setLoadingMods(false);
    };
    load();
  }, []);

  // brand options (unique)
  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    modals.forEach((m) => {
      const name = m.Brand?.BrandName?.trim();
      if (name) set.add(name);
    });
    const arr = [...set].sort((a, b) => a.localeCompare(b));
    return [...arr, "อื่นๆ"];
  }, [modals]);

  // model options by brand
  const modelOptions = useMemo(() => {
    if (!brand || brand === "อื่นๆ") return ["อื่นๆ"];
    const list = modals
      .filter((m) => m.Brand?.BrandName === brand)
      .map((m) => m.ModalName)
      .filter(Boolean);
    const uniq = Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
    return [...uniq, "อื่นๆ"];
  }, [brand, modals]);

  // items for sheets
  const brandItems = brandOptions.map((b) => ({ key: b, label: b }));
  const modelItems = modelOptions.map((m) => ({ key: m, label: m }));
  const provinceItems = TH_PROVINCES.map((p) => ({ key: p, label: p }));

  // validation
  const canSubmit = useMemo(() => {
    const finalBrand = brand === "อื่นๆ" ? otherBrand.trim() : brand;
    const finalModel =
      brand === "อื่นๆ"
        ? otherModel.trim()
        : model === "อื่นๆ"
        ? otherModel.trim()
        : model;
    return Boolean(finalBrand && finalModel && plate && province);
  }, [brand, model, otherBrand, otherModel, plate, province]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    const finalBrand = brand === "อื่นๆ" ? otherBrand.trim() : brand;
    const finalModel =
      brand === "อื่นๆ"
        ? otherModel.trim()
        : model === "อื่นๆ"
        ? otherModel.trim()
        : model;

    setSubmitting(true);
    try {
      const payload: CarInterface = {
        brand: finalBrand,
        model_car: finalModel,
        license_plate: plate,
        city: province,
        user_id: userID,
      };

      const res = await CreateCar(payload);
      if (res) {
        messageApi.success({ content: "เพิ่มข้อมูลรถสำเร็จ", duration: 2 });
        setTimeout(() => navigate("/"), 1500);
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
    <form onSubmit={submit} className="min-h-screen bg-gray-50 flex flex-col">
      {contextHolder}
      <EVHeader title="เพิ่มพาหนะ" onBack={() => navigate(-1)} />

      <div className="flex-1 px-4 pt-4 pb-28 md:pb-40 sm:px-6">
        <div className="mx-auto w-full max-w-3xl space-y-6">

          {/* BRAND */}
          <div>
            <span className="text-sm text-gray-700">
              ยี่ห้อ <span className="text-red-500">*</span>
            </span>

            {isMobile ? (
              <>
                <button
                  type="button"
                  onClick={() => !loadingMods && setBrandSheetOpen(true)}
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
                    className="mt-3 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    placeholder="ระบุยี่ห้อ"
                    value={otherBrand}
                    onChange={(e) => setOtherBrand(e.target.value)}
                  />
                )}
              </>
            ) : (
              <>
                <Select
                  className="mt-2 w-full"
                  size="large"
                  allowClear
                  placeholder="เลือกยี่ห้อ"
                  value={brand || undefined}
                  onChange={(val) => {
                    const v = (val as string) || "";
                    setBrand(v);
                    setModel("");
                    setOtherBrand("");
                    setOtherModel("");
                  }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {brandOptions.map((b) => (
                    <Option key={b} value={b}>
                      {b}
                    </Option>
                  ))}
                </Select>

                {brand === "อื่นๆ" && (
                  <input
                    className="mt-3 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    placeholder="ระบุยี่ห้อ"
                    value={otherBrand}
                    onChange={(e) => setOtherBrand(e.target.value)}
                  />
                )}
              </>
            )}
          </div>

          {/* MODEL */}
          <div>
            <span className="text-sm text-gray-700">
              รุ่น <span className="text-red-500">*</span>
            </span>

            {isMobile ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (!brand) {
                      message.info("กรุณาเลือกยี่ห้อก่อน");
                      return;
                    }
                    setModelSheetOpen(true);
                  }}
                  className={`mt-2 w-full rounded-xl border border-slate-300 p-3 text-left bg-white flex items-center justify-between ${
                    !brand ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <span className={model || brand === "อื่นๆ" ? "text-slate-900" : "text-slate-400"}>
                    {brand === "อื่นๆ"
                      ? "กรุณาระบุรุ่นที่ช่องด้านล่าง"
                      : model || "เลือกรุ่น"}
                  </span>
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {(brand === "อื่นๆ" || model === "อื่นๆ") && (
                  <input
                    className="mt-3 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    placeholder="ระบุรุ่น"
                    value={otherModel}
                    onChange={(e) => setOtherModel(e.target.value)}
                  />
                )}
              </>
            ) : (
              <>
                <Select
                  className="mt-2 w-full"
                  size="large"
                  allowClear
                  placeholder={brand ? "เลือกรุ่น" : "กรุณาเลือกยี่ห้อก่อน"}
                  disabled={!brand}
                  value={brand === "อื่นๆ" ? undefined : model || undefined}
                  onChange={(val) => {
                    const v = (val as string) || "";
                    setModel(v);
                    setOtherModel("");
                  }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {modelOptions.map((m) => (
                    <Option key={m} value={m}>
                      {m}
                    </Option>
                  ))}
                </Select>

                {(brand === "อื่นๆ" || model === "อื่นๆ") && (
                  <input
                    className="mt-3 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    placeholder="ระบุรุ่น"
                    value={otherModel}
                    onChange={(e) => setOtherModel(e.target.value)}
                  />
                )}
              </>
            )}
          </div>

          {/* SPECIAL REG */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSpecialReg}
              onChange={(e) => setIsSpecialReg(e.target.checked)}
            />
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
              className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
              placeholder="เช่น 1กก 1234"
            />
          </label>

          {/* PROVINCE */}
          <div>
            <span className="text-sm text-gray-700">
              จังหวัด <span className="text-red-500">*</span>
            </span>

            {isMobile ? (
              <>
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
              </>
            ) : (
              <Select
                className="mt-2 w-full"
                size="large"
                allowClear
                placeholder="เลือกจังหวัด"
                value={province || undefined}
                onChange={(val) => setProvince((val as string) || "")}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {TH_PROVINCES.map((p) => (
                  <Option key={p} value={p}>
                    {p}
                  </Option>
                ))}
              </Select>
            )}
          </div>
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

      {/* Sheets (Mobile only) */}
      <BottomSheet
        open={isMobile && brandSheetOpen}
        title="ยี่ห้อ"
        items={brandItems}
        onClose={() => setBrandSheetOpen(false)}
        onSelect={(it) => {
          setBrand(it.key);
          setBrandSheetOpen(false);
          // reset model fields
          setModel("");
          setOtherModel("");
          if (it.key !== "อื่นๆ") setOtherBrand("");
        }}
        enableSearch
        placeholder="ค้นหายี่ห้อ"
      />

      <BottomSheet
        open={isMobile && modelSheetOpen}
        title="รุ่น"
        items={modelItems}
        onClose={() => setModelSheetOpen(false)}
        onSelect={(it) => {
          setModel(it.key);
          setModelSheetOpen(false);
          if (it.key !== "อื่นๆ") setOtherModel("");
        }}
        enableSearch
        placeholder="ค้นหารุ่น"
      />

      <BottomSheet
        open={isMobile && provinceSheetOpen}
        title="จังหวัด"
        items={provinceItems}
        onClose={() => setProvinceSheetOpen(false)}
        onSelect={(it) => {
          setProvince(it.key);
          setProvinceSheetOpen(false);
        }}
        enableSearch
        placeholder="ค้นหาจังหวัด"
      />
    </form>
  );
};

export default AddCarPage;
