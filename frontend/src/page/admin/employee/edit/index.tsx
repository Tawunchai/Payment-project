import React, { useEffect, useState } from "react";
import { Select, message } from "antd"; // ⬅️ ใช้ antd Select
import { UserroleInterface } from "../../../../interface/IUserrole";
import { UpdateAdminByID } from "../../../../services/index";
import { EmployeeInterface } from "../../../../interface/IEmployee";
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
  // ใช้ number | undefined ให้ทำงานกับ antd Select ได้ดี
  const [userRoleID, setUserRoleID] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (employee) {
      const s =
        typeof employee.Salary === "number"
          ? String(employee.Salary)
          : employee.Salary ?? "";
      setSalary(s);
      setUserRoleID(employee?.UserRole?.ID ?? employee?.UserRoleID ?? undefined);
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

    if (typeof userRoleID === "number") {
      payload.userRoleID = userRoleID;
    }

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

      {/* Sheet (mobile) / Dialog (desktop) */}
      <div className="relative w-full md:max-w-[520px] mx-auto">
        <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden ring-1 ring-blue-100">
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

              {/* Role — ใช้ antd Select (โค้งมน) */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">บทบาท (Role)</span>
                <div className="flex items-center gap-2">
                  <span className="pl-0 pr-0 text-blue-500">
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

      {/* Scoped CSS — ทำให้ Select โค้งมน สไตล์ EV Blue */}
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

export default EditAdminModal;
