import React, { useState } from "react";
import { Tooltip } from "antd";
import { EditOutlined } from "@ant-design/icons";
import EditUserModal from "../../../component/admin/edit";
import { EmployeeInterface } from "../../../interface/IEmployee";

interface ProfileNavbarProps {
  employeeData: EmployeeInterface;
  onProfileUpdated?: () => void;
}

export const ProfileNavbar: React.FC<ProfileNavbarProps> = ({
  employeeData,
  onProfileUpdated,
}) => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center md:flex-row md:justify-between">
        <Tooltip placement="bottom">
          <button
            onClick={() => setOpenModal(true)}
            className={[
              // พื้นหลังไล่เฉด + pill
              "inline-flex items-center gap-2 rounded-xl px-4 py-2",
              "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
              // เงาเรืองนิด ๆ
              "shadow-[0_6px_18px_rgba(37,99,235,0.35)]",
              // โฟกัสสำหรับคีย์บอร์ด/มือถือ
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600",
              // hover/active
              "transition-all hover:brightness-110 active:translate-y-[1px]",
              // ตัวหนังสือ
              "text-sm font-semibold tracking-wide"
            ].join(" ")}
          >
            <EditOutlined className="text-base" />
            แก้ไขข้อมูลส่วนตัว
            {/* ไฮไลท์จุดเล็ก ๆ กระพริบเบา ๆ */}
            <span className="ml-1 inline-block h-2 w-2 rounded-full bg-white/90 animate-pulse" />
          </button>
        </Tooltip>
      </div>

      {employeeData && (
        <EditUserModal
          show={openModal}
          onClose={() => setOpenModal(false)}
          onSaveSuccess={() => {
            onProfileUpdated?.();
            setOpenModal(false);
          }}
          initialData={employeeData}
        />
      )}
    </>
  );
};
