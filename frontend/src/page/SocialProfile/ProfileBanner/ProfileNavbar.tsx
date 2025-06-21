import { Button, Space } from "antd";
import { RiSettings2Line } from "react-icons/ri";

export const ProfileNavbar = () => {
  return (
    <div className="flex flex-col items-center [&_.ant-btn-link]:text-white hover:[&_.ant-btn-link]:text-[#037dca] md:flex-row md:justify-between">
      <Space>
        <Button size="small" type="link">
          Timeline
        </Button>
        <Button size="small" type="link">
          About
        </Button>
        <Button size="small" type="link">
          Photos
        </Button>
        <Button size="small" type="link">
          Friends
        </Button>
        <Button size="small" type="link">
          More
        </Button>
      </Space>

      <div className="mt-0">
        <Button size="small" type="link">
          <RiSettings2Line />
          Settings
        </Button>
      </div>
    </div>
  );
};
