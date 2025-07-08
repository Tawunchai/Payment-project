import { Avatar } from "antd";
import { useEffect, useState } from "react";
import { getUserByID,apiUrlPicture } from "../../../../../services"; // ปรับ path ให้ถูกต้อง
import { UsersInterface } from "../../../../../interface/IUser"; // กำหนด interface ให้ตรงกับข้อมูล

export const AvatarWithInfo = () => {
  const [users, setUsers] = useState<UsersInterface | null>(null);
  const [userid, setUserid] = useState<number>(
    Number(localStorage.getItem("userid")) || 0
  );

  useEffect(() => {
    setUserid(Number(localStorage.getItem("userid")));
    const fetchEmployee = async () => {
      const emp = await getUserByID(userid); 
      if (emp) {
        setUsers(emp);
      }
    };
    fetchEmployee();
  }, []);

  return (
    <div className="flex items-center justify-between flex-col sm:flex-row">
      <div className="flex flex-wrap flex-col items-center max-sm:text-center mb-6 lg:flex-row">
        <Avatar 
          src={users?.Profile ? `${apiUrlPicture}${users?.Profile}` : undefined} 
          alt="user" 
          size={80} 
        />
        <div className="flex-1 sm:pl-4 max-sm:mt-4">
          <div className="text-xl mb-1">
            {users ? `${users?.FirstName || ""} ${users?.LastName || ""}` : "Loading..."}
          </div>
          <div>{users?.UserRole?.RoleName || ""}</div>
        </div>
      </div>
    </div>
  );
};
