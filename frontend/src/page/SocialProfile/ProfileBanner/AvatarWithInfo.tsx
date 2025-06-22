import { Avatar } from "antd";
import  ASSET_AVATARS  from "../../../assets/admin/product1.jpg";

export const AvatarWithInfo = () => {
  return (
    <div className="flex items-center justify-between flex-col sm:flex-row">
      <div className="flex flex-wrap flex-col items-center max-sm:text-center mb-6 lg:flex-row">
        <Avatar src={ASSET_AVATARS} alt="user" size={80} />
        <div className="flex-1 sm:pl-4 max-sm:mt-4">
          <div className="text-xl mb-1">Kiley Brown</div>
          <div>Florida, USA</div>
        </div>
      </div>
    </div>
  );
};
