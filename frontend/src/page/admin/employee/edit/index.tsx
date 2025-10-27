import React, { useEffect, useState } from "react";
import { Select, message } from "antd";
import { UserroleInterface } from "../../../../interface/IUserrole";
import { UpdateAdminByID } from "../../../../services";
import { EmployeeInterface } from "../../../../interface/IEmployee";
import {
  FaTimes,
  FaMoneyBill,
  FaUserTag,
  FaEdit,
  FaLock,
  FaUnlockAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

interface EditAdminModalProps {
  open: boolean;
  onClose: () => void;
  employee: any;
  onSaved: () => void;
  userRoles: UserroleInterface[];
}

const EditAdminModal: React.FC<EditAdminModalProps> = ({
  open,
  onClose,
  employee,
  onSaved,
  userRoles,
}) => {
  const [salary, setSalary] = useState<string>("");
  const [userRoleID, setUserRoleID] = useState<number | undefined>(undefined);
  const [password, setPassword] = useState<string>("");
  const [editPassword, setEditPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false); // ✅ toggle ดู/ซ่อนรหัส

  useEffect(() => {
    if (employee) {
      const s =
        typeof employee.Salary === "number"
          ? String(employee.Salary)
          : employee.Salary ?? "";
      setSalary(s);
      setUserRoleID(employee?.UserRole?.ID ?? employee?.UserRoleID ?? undefined);
      setPassword("");
      setEditPassword(false);
      setShowPassword(false);
    }
  }, [employee]);

  const handleSubmit = async () => {
    const payload: Partial<Pick<EmployeeInterface, "Salary">> & {
      userRoleID?: number;
      password?: string;
    } = {};

    if (salary !== "") {
      const num = Number(salary);
      if (!Number.isFinite(num)) {
        message.error("กรุณากรอก Salary เป็นตัวเลข");
        return;
      }
      payload.Salary = num;
    }

    if (typeof userRoleID === "number") {
      payload.userRoleID = userRoleID;
    }

    // ✅ เพิ่ม password ถ้าอยู่ในโหมดแก้ไข
    if (editPassword && password.trim() !== "") {
      payload.password = password.trim();
    }

    const ok = await UpdateAdminByID(employee.EmployeeID, payload);
    if (ok) {
      message.success("อัปเดตข้อมูลสำเร็จ");
      onSaved();
      onClose();
    } else {
      message.error("ไม่สามารถอัปเดตข้อมูลได้");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center ev-scope"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full md:max-w-[520px] mx-auto">
        <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden ring-1 ring-blue-100">
          {/* Header */}
          <div className="px-5 pt-3 pb-4 md:pt-4 md:pb-4 bg-blue-600 text-white">
            <div className="mx-auto w-10 h-1.5 md:hidden rounded-full bg-white/60 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaEdit className="opacity-90" />
                <h2 className="text-base md:text-lg font-semibold">
                  แก้ไขข้อมูลพนักงาน
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-lg hover:bg-white/10"
                aria-label="ปิดหน้าต่าง"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-5 bg-blue-50/40">
            <div className="grid grid-cols-1 gap-3">
              {/* Salary */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">Salary</span>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/50">
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaMoneyBill />
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    name="Salary"
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
              </label>

              {/* Role */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">บทบาท (Role)</span>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">
                    <FaUserTag />
                  </span>
                  <Select
                    className="ev-select w-full"
                    popupClassName="ev-select-dropdown"
                    placeholder="เลือกบทบาท"
                    size="large"
                    allowClear
                    value={userRoleID}
                    onChange={(val) => setUserRoleID(val as number | undefined)}
                    options={userRoles.map((r) => ({
                      label: r.RoleName,
                      value: r.ID,
                    }))}
                  />
                </div>
              </label>

              {/* Password Section */}
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-xs text-slate-700">รหัสผ่าน (Password)</span>
                <div className="flex items-center gap-2 w-full">
                  <span className="text-blue-500">
                    {editPassword ? <FaUnlockAlt /> : <FaLock />}
                  </span>

                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        editPassword ? "กรอกรหัสผ่านใหม่" : "รหัสผ่านถูกซ่อน"
                      }
                      className={`w-full px-3 py-2.5 pr-10 rounded-xl border bg-white border-slate-200 outline-none transition-all ${
                        editPassword
                          ? "focus:ring-2 focus:ring-blue-500/50"
                          : "bg-slate-100 cursor-not-allowed opacity-70"
                      }`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={!editPassword}
                    />

                    {/* ✅ ดวงตา toggle */}
                    {editPassword && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditPassword(!editPassword);
                      setShowPassword(false);
                      setPassword("");
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      editPassword
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {editPassword ? "ยกเลิก" : "แก้ไข"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-white border-t border-slate-100 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>

      <div className="h-[env(safe-area-inset-bottom)]" />

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
          box-shadow: 0 0 0 2px rgba(37,99,235,0.25) !important;
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

export default EditAdminModal;
