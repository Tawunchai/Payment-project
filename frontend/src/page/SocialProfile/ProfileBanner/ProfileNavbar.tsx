import React, { useState } from "react";
import { Button, Space } from "antd";
import { EditOutlined } from "@ant-design/icons";
import EditUserModal from "../../../component/admin/edit/index"; // ✅ path modal ที่คุณมีอยู่
import { EmployeeInterface } from "../../../interface/IEmployee";

interface ProfileNavbarProps {
  employeeData: EmployeeInterface; // รับข้อมูล user มาเปิดใน modal
  onProfileUpdated?: () => void; // callback เมื่อบันทึกสำเร็จ
}

export const ProfileNavbar: React.FC<ProfileNavbarProps> = ({
  employeeData,
  onProfileUpdated,
}) => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center md:flex-row md:justify-between">
        <Space>
          <Button
            size="small"
            type="link"
            icon={<EditOutlined />}
            onClick={() => setOpenModal(true)} // ✅ เปิด modal
            style={{
              color: "#fff",
              fontWeight: 700,
              borderRadius: "6px",
              padding: "0 12px",
              fontSize:"14px"
            }}
          >
            เเก้ไขข้อมูลส่วนตัว
          </Button>
        </Space>
      </div>

      {/* 🧾 Modal สำหรับแก้ไขข้อมูล */}
      {employeeData && (
        <EditUserModal
          show={openModal}
          onClose={() => setOpenModal(false)}
          onSaveSuccess={() => {
            if (onProfileUpdated) onProfileUpdated();
            setOpenModal(false);
          }}
          initialData={employeeData}
        />
      )}
    </>
  );
};
