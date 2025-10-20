import React, { useEffect, useState } from "react";
import { UserroleInterface } from "../../../../interface/IUserrole";
import { UpdateAdminByID } from "../../../../services/index";
import { EmployeeInterface } from "../../../../interface/IEmployee";
import { message } from "antd";
import { FaTimes, FaMoneyBill, FaUserTag, FaEdit } from "react-icons/fa";

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
  // เก็บเป็น string เพื่อพิมพ์/ลบได้สะดวกบนมือถือ แล้วค่อยแปลงตอน submit
  const [salary, setSalary] = useState<string>("");
  const [userRoleID, setUserRoleID] = useState<number | "">("");

  useEffect(() => {
    if (employee) {
      const s =
        typeof employee.Salary === "number"
          ? String(employee.Salary)
          : employee.Salary ?? "";
      setSalary(s);
      setUserRoleID(employee.UserRole?.ID ?? employee.UserRoleID ?? "");
    }
  }, [employee]);

  const handleSubmit = async () => {
    // payload สำหรับ API
    const payload: Partial<Pick<EmployeeInterface, "Salary">> & {
      userRoleID?: number;
    } = {};

    if (salary !== "") {
      const num = Number(salary);
      if (!Number.isFinite(num)) {
        message.error("กรุณากรอก Salary เป็นตัวเลข");
        return;
      }
      payload.Salary = num;
    }

    if (userRoleID !== "") payload.userRoleID = Number(userRoleID);

    const ok = await UpdateAdminByID(employee.EmployeeID, payload);
    if (ok) {
      message.success("อัปเดตข้อมูลพนักงานสำเร็จ");
      onSaved();
      onClose();
    } else {
      message.error("ไม่สามารถอัปเดตข้อมูลได้");
    }
  };

  if (!open) return null;

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

      {/* Sheet (mobile) / Dialog (desktop) */}
      <div className="relative w-full md:max-w-[520px] mx-auto">
        <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
          {/* Header: EV Blue */}
          <div className="px-5 pt-3 pb-4 md:pt-4 md:pb-4 bg-blue-600 text-white">
            {/* drag handle for mobile */}
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
                className="p-2 -m-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
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
                <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/50">
                  <span className="pl-3 pr-2 text-blue-500">
                    <FaUserTag />
                  </span>
                  <select
                    name="UserRoleID"
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-transparent"
                    value={userRoleID}
                    onChange={(e) => {
                      const v = e.target.value;
                      setUserRoleID(v === "" ? "" : Number(v));
                    }}
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
              className="px-4 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>

      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
};

export default EditAdminModal;
