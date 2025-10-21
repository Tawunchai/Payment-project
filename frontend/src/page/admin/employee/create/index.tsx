import React, { useState, useEffect } from "react";
import { UserroleInterface } from "../../../../interface/IUserrole";
import { CreateEmployeeInput } from "../../../../interface/IEmployee";
import { message, Select } from "antd";
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
}

const CreateAdminModal: React.FC<CreateEmployeeModalProps> = ({
  open,
  onClose,
  onCreated,
  userRoles,
}) => {
  // เก็บเป็น string เพื่อพิมพ์/ลบสะดวกบนมือถือ แล้วค่อยแปลงตอน submit
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [salary, setSalary] = useState<string>("");
  const [userRoleID, setUserRoleID] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (userRoles?.length && userRoleID === undefined) {
      setUserRoleID(userRoles[0].ID!);
    }
  }, [userRoles]);

  const validate = () => {
    if (!username || !password || !firstName || !lastName || !email || !salary) {
      message.warning("กรุณากรอกข้อมูลให้ครบถ้วน");
      return false;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      message.warning("รูปแบบอีเมลไม่ถูกต้อง");
      return false;
    }
    const sNum = Number(salary);
    if (!Number.isFinite(sNum)) {
      message.warning("กรุณากรอก Salary เป็นตัวเลข");
      return false;
    }
    if (!userRoleID) {
      message.warning("กรุณาเลือกบทบาท");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload: CreateEmployeeInput = {
      username,
      password,
      firstName,
      lastName,
      email,
      salary: Number(salary),
      ...(userRoleID ? { userRoleID } : {}),
    };

    onCreated(payload);
    message.success("สร้างข้อมูลพนักงานสำเร็จ");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      // กันชิดขอบบนบนมือถือ: เคารพ safe-area + ระยะเผื่อ
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet / Dialog — mobile: มีระยะขอบซ้ายขวาและขยับลงจากบน */}
      <div className="relative w-full max-w-[640px] mx-4 md:mx-auto mt-24 md:mt-0 mb-8 md:mb-0">
        {/* กล่องโค้งมนทุกมุม + ring บาง ๆ + จำกัดความสูงและให้เลื่อนภายใน */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-blue-100 max-h-[85vh] flex flex-col">
          {/* Header — EV Blue */}
          <div className="px-5 pt-3 pb-4 md:pt-4 md:pb-4 bg-blue-600 text-white">
            <div className="mx-auto w-10 h-1.5 md:hidden rounded-full bg-white/60 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaUserPlus className="opacity-90" />
                <h2 className="text-base md:text-lg font-semibold">สร้างพนักงานใหม่</h2>
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

          {/* Body — ทำให้เลื่อนในกล่องได้บนมือถือ */}
          <div className="px-5 py-5 bg-blue-50/40 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Username */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">Username</span>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/50">
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaUser />
                  </span>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </label>

              {/* Password */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">Password</span>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/50">
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </label>

              {/* First / Last Name */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">First Name</span>
                <input
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">Last Name</span>
                <input
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>

              {/* Email (full width) */}
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-slate-700">Email</span>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/50">
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </label>

              {/* Salary (full width) */}
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-slate-700">Salary</span>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/50">
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaMoneyBill />
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    placeholder="0"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
              </label>

              {/* Role — Antd Select โค้งมนแบบเดียวกับ EV */}
              {userRoles?.length > 0 && (
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-xs text-slate-700">บทบาท (Role)</span>
                  <Select
                    className="ev-select w-full"
                    popupClassName="ev-select-dropdown"
                    placeholder="เลือกบทบาท"
                    value={userRoleID}
                    onChange={(val) => setUserRoleID(val as number)}
                    options={userRoles.map((r) => ({
                      label: r.RoleName,
                      value: r.ID,
                    }))}
                    allowClear={false}
                    showSearch={false}
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
              className="px-4 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
            >
              สร้าง
            </button>
          </div>

          {/* Safe area (iOS) ภายในกล่อง เพื่อให้ความโค้งล่างไม่ถูกบัง */}
          <div className="md:hidden h-[env(safe-area-inset-bottom)] bg-white" />
        </div>
      </div>
    </div>
  );
};

export default CreateAdminModal;
