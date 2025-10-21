import React, { useEffect, useState } from "react";
import { Select } from "antd"; // ⬅️ ใช้ antd Select
import { GendersInterface } from "../../../../interface/IGender";
import { UserroleInterface } from "../../../../interface/IUserrole";
import {
  FaUserEdit,
  FaEnvelope,
  FaUser,
  FaPhoneAlt,
  FaCoins,
  FaTransgender,
  FaUserTag,
  FaTimes,
} from "react-icons/fa";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
  onSave: (updatedUser: any) => void;
  genders: GendersInterface[];
  userRoles: UserroleInterface[];
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  user,
  onSave,
  genders,
  userRoles,
}) => {
  const [form, setForm] = useState<any>(user);
  const [errors, setErrors] = useState<{ Email?: string; PhoneNumber?: string; Coin?: string }>({});

  useEffect(() => {
    setForm({
      ...user,
      UserID: user?.UserID ?? user?.ID ?? "",
      GenderID: user?.Gender?.ID ?? user?.GenderID ?? "",
      UserRoleID: user?.UserRole?.ID ?? user?.UserRoleID ?? "",
      Coin: user?.Coin ?? 0,
    });
    setErrors({});
  }, [user]);

  if (!open) return null;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (form.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email))
      newErrors.Email = "รูปแบบอีเมลไม่ถูกต้อง";
    if (form.PhoneNumber && !/^0\d{9}$/.test(form.PhoneNumber))
      newErrors.PhoneNumber = "กรุณาใส่เบอร์โทรให้ถูกต้อง";
    if (form.Coin !== undefined && isNaN(Number(form.Coin)))
      newErrors.Coin = "ต้องเป็นตัวเลขเท่านั้น";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const { Gender, UserRole, ...payload } = { ...form, Coin: Number(form.Coin) };
    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center ev-scope"
      role="dialog"
      aria-modal="true"
      // เคารพ notch และดัน modal ลงบนมือถือ
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog — mobile: ขยับลงด้วย mt-24 + มี margin ล่าง, จำกัดความสูงและให้เลื่อนภายใน */}
      <div className="relative w-full max-w-[640px] mx-4 md:mx-auto mt-24 md:mt-0 mb-8 md:mb-0">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-blue-100 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="px-5 pt-3 pb-4 md:pt-4 md:pb-4 bg-blue-600 text-white">
            <div className="mx-auto w-10 h-1.5 md:hidden rounded-full bg-white/60 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaUserEdit className="opacity-90" />
                <h2 className="text-base md:text-lg font-semibold">แก้ไขข้อมูลผู้ใช้</h2>
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

          {/* Body — scrollable ภายในกล่อง */}
          <div className="px-5 py-5 bg-blue-50/40 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Username */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600">Username</span>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/50">
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaUser />
                  </span>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    name="Username"
                    placeholder="Username"
                    value={form.Username || ""}
                    onChange={handleChange}
                  />
                </div>
              </label>

              {/* Email */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600">Email</span>
                <div
                  className={`flex items-center bg-white rounded-xl border ${
                    errors.Email ? "border-red-400" : "border-slate-200"
                  } focus-within:ring-2 focus-within:ring-blue-500/50`}
                >
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaEnvelope />
                  </span>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    name="Email"
                    placeholder="Email"
                    value={form.Email || ""}
                    onChange={handleChange}
                  />
                </div>
                {errors.Email && <span className="text-xs text-red-500">{errors.Email}</span>}
              </label>

              {/* First / Last Name */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600">First Name</span>
                <input
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  name="FirstName"
                  placeholder="First Name"
                  value={form.FirstName || ""}
                  onChange={handleChange}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600">Last Name</span>
                <input
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  name="LastName"
                  placeholder="Last Name"
                  value={form.LastName || ""}
                  onChange={handleChange}
                />
              </label>

              {/* Phone */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600">Phone Number</span>
                <div
                  className={`flex items-center bg-white rounded-xl border ${
                    errors.PhoneNumber ? "border-red-400" : "border-slate-200"
                  } focus-within:ring-2 focus-within:ring-blue-500/50`}
                >
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaPhoneAlt />
                  </span>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    name="PhoneNumber"
                    placeholder="0xxxxxxxxx"
                    value={form.PhoneNumber || ""}
                    onChange={handleChange}
                    inputMode="numeric"
                  />
                </div>
                {errors.PhoneNumber && (
                  <span className="text-xs text-red-500">{errors.PhoneNumber}</span>
                )}
              </label>

              {/* Coin */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600">Coin</span>
                <div
                  className={`flex items-center bg-white rounded-xl border ${
                    errors.Coin ? "border-red-400" : "border-slate-200"
                  } focus-within:ring-2 focus-within:ring-blue-500/50`}
                >
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaCoins />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    name="Coin"
                    placeholder="0"
                    value={form.Coin ?? 0}
                    onChange={handleChange}
                  />
                </div>
                {errors.Coin && <span className="text-xs text-red-500">{errors.Coin}</span>}
              </label>

              {/* Gender — antd Select โค้งมน */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaTransgender className="text-blue-500" /> เพศ (Gender)
                </span>
                <Select
                  className="ev-select w-full"
                  popupClassName="ev-select-dropdown"
                  placeholder="เลือกเพศ"
                  size="large"
                  allowClear
                  value={form.GenderID || undefined}
                  onChange={(val) => setForm((p: any) => ({ ...p, GenderID: val }))}
                  options={genders.map((g) => ({ label: g.Gender, value: g.ID }))}
                />
              </label>

              {/* Role — antd Select โค้งมน */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaUserTag className="text-blue-500" /> บทบาท (Role)
                </span>
                <Select
                  className="ev-select w-full"
                  popupClassName="ev-select-dropdown"
                  placeholder="เลือกบทบาท"
                  size="large"
                  allowClear
                  value={form.UserRoleID || undefined}
                  onChange={(val) => setForm((p: any) => ({ ...p, UserRoleID: val }))}
                  options={userRoles.map((r) => ({ label: r.RoleName, value: r.ID }))}
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
              className="px-4 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-200 transition"
            >
              บันทึก
            </button>
          </div>

          {/* Safe area (iOS) ภายในกล่อง */}
          <div className="md:hidden h-[env(safe-area-inset-bottom)] bg-white" />
        </div>
      </div>

      {/* Scoped CSS — ทำให้ Select โค้งมนและโฟกัสโทนฟ้า */}
      <style>{`
        .ev-scope .ev-select .ant-select-selector {
          border-radius: 0.75rem !important;        /* rounded-xl */
          border-color: #e2e8f0 !important;         /* slate-200 */
          height: 44px !important;                  /* ให้สูงพอดีกับ input */
          padding: 0 12px !important;
          display: flex;
          align-items: center;
          background-color: #ffffff !important;
        }
        .ev-scope .ev-select:hover .ant-select-selector {
          border-color: #cbd5e1 !important;         /* slate-300 */
        }
        .ev-scope .ev-select.ant-select-focused .ant-select-selector,
        .ev-scope .ev-select .ant-select-selector:focus,
        .ev-scope .ev-select .ant-select-selector:active {
          border-color: #2563eb !important;         /* blue-600 */
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25) !important; /* focus ring */
        }
        .ev-scope .ev-select .ant-select-selection-item,
        .ev-scope .ev-select .ant-select-selection-placeholder {
          line-height: 42px !important;             /* จัดกลางแนวตั้ง */
        }
        .ev-scope .ev-select .ant-select-clear,
        .ev-scope .ev-select .ant-select-arrow {
          top: 50%;
          transform: translateY(-50%);
        }
        .ev-scope .ev-select-dropdown {
          border-radius: 0.75rem !important;        /* dropdown โค้งมน */
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default EditUserModal;
