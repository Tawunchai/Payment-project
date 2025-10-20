import React, { useEffect, useState } from "react";
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

/**
 * Minimal, mobile-first, EV blue style
 * - Bottom sheet on mobile (rounded top), centered dialog on md+
 * - Large touch targets, clean labels, subtle borders, focus rings
 * - Blue accents (#2563eb tailwind blue-600)
 */
const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  user,
  onSave,
  genders,
  userRoles,
}) => {
  const [form, setForm] = useState<any>(user);
  const [errors, setErrors] = useState<{ Email?: string; PhoneNumber?: string; Coin?: string }>(
    {}
  );

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
    if (form.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email)) {
      newErrors.Email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    if (form.PhoneNumber && !/^0\d{9}$/.test(form.PhoneNumber)) {
      newErrors.PhoneNumber = "กรุณาใส่เบอร์โทรให้ถูกต้อง";
    }
    if (form.Coin !== undefined && isNaN(Number(form.Coin))) {
      newErrors.Coin = "ต้องเป็นตัวเลขเท่านั้น";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: name === "Coin" ? value : value,
    }));
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const { Gender, UserRole, ...payload } = {
      ...form,
      Coin: Number(form.Coin),
    };
    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet / Dialog */}
      <div className="relative w-full md:max-w-[640px] mx-auto">
        <div className="bg-white md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden">
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

          {/* Body */}
          <div className="px-5 py-5 bg-blue-50/40">
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
                <div className={`flex items-center bg-white rounded-xl border ${errors.Email ? "border-red-400" : "border-slate-200"} focus-within:ring-2 focus-within:ring-blue-500/50`}>
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
              <label className="flex flex-col gap-1 md:col-span-1">
                <span className="text-xs text-slate-600">Phone Number</span>
                <div className={`flex items-center bg-white rounded-xl border ${errors.PhoneNumber ? "border-red-400" : "border-slate-200"} focus-within:ring-2 focus-within:ring-blue-500/50`}>
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
              <label className="flex flex-col gap-1 md:col-span-1">
                <span className="text-xs text-slate-600">Coin</span>
                <div className={`flex items-center bg-white rounded-xl border ${errors.Coin ? "border-red-400" : "border-slate-200"} focus-within:ring-2 focus-within:ring-blue-500/50`}>
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

              {/* Gender */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600">เพศ (Gender)</span>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/50">
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaTransgender />
                  </span>
                  <select
                    name="GenderID"
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    value={form.GenderID || ""}
                    onChange={handleChange}
                  >
                    <option value="">เลือกเพศ</option>
                    {genders.map((g) => (
                      <option key={g.ID} value={g.ID}>
                        {g.Gender}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              {/* Role */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600">บทบาท (Role)</span>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/50">
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaUserTag />
                  </span>
                  <select
                    name="UserRoleID"
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    value={form.UserRoleID || ""}
                    onChange={handleChange}
                  >
                    <option value="">เลือกบทบาท</option>
                    {userRoles.map((r) => (
                      <option key={r.ID} value={r.ID}>
                        {r.RoleName}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-white border-t border-slate-100 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>

      {/* Safe area for iOS bottom gesture */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
};

export default EditUserModal;
