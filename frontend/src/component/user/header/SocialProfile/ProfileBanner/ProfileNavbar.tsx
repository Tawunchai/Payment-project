import React from "react";
import { Button, Space } from "antd";

export const ProfileNavbar: React.FC = () => {
  return (
    <div className="flex flex-col items-center md:flex-row md:justify-between">
      <Space>
        <Button
          size="small"
          type="link"
          className="text-white hover:!text-blue-200 focus:!text-blue-200 active:!text-blue-300"
        >
          EDIT PROFILE
        </Button>
      </Space>
      {/* ที่ว่างสำหรับเมนูเพิ่มในอนาคต */}
      <div className="hidden md:block" />
    </div>
  );
};
