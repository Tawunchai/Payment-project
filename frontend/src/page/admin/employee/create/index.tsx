import React, { useState, useEffect, useMemo } from "react";
import { UserroleInterface } from "../../../../interface/IUserrole";
import { CreateEmployeeInput } from "../../../../interface/IEmployee";
import { Select } from "antd";
import {
  FaUserPlus,
  FaTimes,
  FaUser,
  FaLock,
  FaEnvelope,
  FaMoneyBill,
} from "react-icons/fa";

interface CreateEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (data: CreateEmployeeInput) => void;
  userRoles: UserroleInterface[];
  allUsersData: { Username: string; Email: string }[];
}

const CreateAdminModal: React.FC<CreateEmployeeModalProps> = ({
  open,
  onClose,
  onCreated,
  userRoles,
  allUsersData,
}) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    salary: "",
    userRoleID: undefined as number | undefined,
  });

  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    salary?: string;
  }>({});

  // ตรวจมือถือเพื่อกำหนด maxHeight ที่เหมาะสม
  const isMobile = useMemo(
    () => (typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false),
    []
  );

  useEffect(() => {
    if (userRoles?.length && !form.userRoleID) {
      setForm((p) => ({ ...p, userRoleID: userRoles[0].ID }));
    }
  }, [userRoles]);

  // ✅ ตรวจสอบซ้ำแบบ realtime (username / email)
  useEffect(() => {
    const newErrors: typeof errors = { ...errors };

    // Username ซ้ำ
    if (form.username) {
      const dupUsername = allUsersData.some(
        (u) => u.Username.trim().toLowerCase() === form.username.trim().toLowerCase()
      );
      newErrors.username = dupUsername ? "Username นี้มีอยู่ในระบบแล้ว" : undefined;
    } else {
      newErrors.username = undefined;
    }

    // Email ซ้ำ
    if (form.email) {
      const dupEmail = allUsersData.some(
        (u) => u.Email.trim().toLowerCase() === form.email.trim().toLowerCase()
      );
      newErrors.email = dupEmail ? "Email นี้มีอยู่ในระบบแล้ว" : newErrors.email;
    }

    setErrors(newErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.username, form.email, allUsersData]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!form.username.trim()) newErrors.username = "กรุณากรอก Username";
    if (!form.password) newErrors.password = "กรุณากรอก Password";
    if (!form.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ";
    if (!form.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล";

    if (!form.email.trim()) newErrors.email = "กรุณากรอก Email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";

    if (!form.salary) newErrors.salary = "กรุณากรอกเงินเดือน";
    else if (isNaN(Number(form.salary))) newErrors.salary = "Salary ต้องเป็นตัวเลข";

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every((v) => v === undefined);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // ถ้ามี error แบบ realtime (dup) ให้หยุดไว้ก่อน
    if (errors.username || errors.email) return;

    const payload: CreateEmployeeInput = {
      username: form.username.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      salary: Number(form.salary),
      ...(form.userRoleID ? { userRoleID: form.userRoleID } : {}),
    };

    onCreated(payload);
  };

  const handleChange = (name: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const canSubmit =
    !errors.username &&
    !errors.password &&
    !errors.firstName &&
    !errors.lastName &&
    !errors.email &&
    !errors.salary &&
    form.username &&
    form.password &&
    form.firstName &&
    form.lastName &&
    form.email &&
    form.salary;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center ev-scope"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Dialog */}
      <div className="relative w-full max-w-[640px] mx-4 md:mx-auto mb-8 md:mb-0">
        {/* กล่อง modal: header (fixed) + body (scroll) + footer (fixed) */}
        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-blue-100 flex flex-col"
          style={{ maxHeight: isMobile ? "78vh" : "85vh" }}
        >
          {/* Header */}
          <div
            className="px-5 pt-3 pb-4 bg-blue-600 text-white flex justify-between items-center"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 8px)" }}
          >
            <div className="flex items-center gap-2">
              <FaUserPlus className="opacity-90" />
              <h2 className="text-base md:text-lg font-semibold">สร้างพนักงานใหม่</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 -m-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="ปิดหน้าต่าง"
              title="ปิด"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body (scroll area) */}
          <div
            className="px-5 py-5 bg-blue-50/40"
            style={{ overflowY: "auto", WebkitOverflowScrolling: "touch", maxHeight: "100%" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Username */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">Username</span>
                <div
                  className={`flex items-center bg-white rounded-xl border ${
                    errors.username ? "border-red-400" : "border-slate-200"
                  } focus-within:ring-2 focus-within:ring-blue-500/50`}
                >
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaUser />
                  </span>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                  />
                </div>
                {errors.username && <span className="text-xs text-red-500">{errors.username}</span>}
              </label>

              {/* Password */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">Password</span>
                <div
                  className={`flex items-center bg-white rounded-xl border ${
                    errors.password ? "border-red-400" : "border-slate-200"
                  } focus-within:ring-2 focus-within:ring-blue-500/50`}
                >
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                </div>
                {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
              </label>

              {/* First Name */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">First Name</span>
                <input
                  className={`w-full px-3 py-2.5 rounded-xl bg-white border ${
                    errors.firstName ? "border-red-400" : "border-slate-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
                {errors.firstName && <span className="text-xs text-red-500">{errors.firstName}</span>}
              </label>

              {/* Last Name */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">Last Name</span>
                <input
                  className={`w-full px-3 py-2.5 rounded-xl bg-white border ${
                    errors.lastName ? "border-red-400" : "border-slate-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
                {errors.lastName && <span className="text-xs text-red-500">{errors.lastName}</span>}
              </label>

              {/* Email */}
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-slate-700">Email</span>
                <div
                  className={`flex items-center bg-white rounded-xl border ${
                    errors.email ? "border-red-400" : "border-slate-200"
                  } focus-within:ring-2 focus-within:ring-blue-500/50`}
                >
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
              </label>

              {/* Salary */}
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-slate-700">Salary</span>
                <div
                  className={`flex items-center bg-white rounded-xl border ${
                    errors.salary ? "border-red-400" : "border-slate-200"
                  } focus-within:ring-2 focus-within:ring-blue-500/50`}
                >
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaMoneyBill />
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    placeholder="0"
                    value={form.salary}
                    onChange={(e) => handleChange("salary", e.target.value)}
                  />
                </div>
                {errors.salary && <span className="text-xs text-red-500">{errors.salary}</span>}
              </label>

              {/* Role */}
              {userRoles?.length > 0 && (
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-xs text-slate-700">บทบาท (Role)</span>
                  <Select
                    className="ev-select w-full"
                    popupClassName="ev-select-dropdown"
                    placeholder="เลือกบทบาท"
                    value={form.userRoleID}
                    onChange={(val) => setForm((p) => ({ ...p, userRoleID: val as number }))}
                    options={userRoles.map((r) => ({
                      label: r.RoleName,
                      value: r.ID,
                    }))}
                    allowClear={false}
                    size="large"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-white border-t border-blue-100 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-4 h-10 rounded-xl text-white shadow-sm ${
                canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              สร้าง
            </button>
          </div>

          {/* safe-area ล่างสำหรับมือถือ */}
          <div className="md:hidden h-[env(safe-area-inset-bottom)] bg-white" />
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
        .ev-scope .ev-select.ant-select-focused .ant-select-selector {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 2px rgba(37,99,235,0.25) !important;
        }
        .ev-scope .ev-select-dropdown {
          border-radius: 0.75rem !important;
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default CreateAdminModal;
