import React from "react";
import { Button, Space } from "antd";

export const ProfileNavbar: React.FC = () => {
  return (
    <div className="flex flex-col items-center md:flex-row md:justify-between">
      <Space>
        <Button
          size="small"
          type="link"
          aria-label="Edit profile"
          className="
            !text-white font-semibold tracking-wide
            rounded-lg px-3 py-1 transition
            hover:!text-white focus:!text-white active:!text-white
            hover:!bg-white/30 focus:!bg-white/35 active:!bg-white/40
            hover:!border hover:!border-white/60 focus:!border focus:!border-white/70
            hover:shadow-md focus:shadow-md
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
            active:scale-[0.98]
          "
          style={{ color: "#fff" }}
        >
          EDIT PROFILE
        </Button>
      </Space>
      {/* ที่ว่างสำหรับเมนูเพิ่มในอนาคต */}
      <div className="hidden md:block" />
    </div>
  );
};
