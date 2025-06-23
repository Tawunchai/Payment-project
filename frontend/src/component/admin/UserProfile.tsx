import { MdOutlineCancel } from 'react-icons/md';
import { Button } from '.';
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { userProfileData } from '../../assets/admin/dummy';
import { useStateContext } from '../../contexts/ContextProvider';
import { useEffect, useState } from 'react';

// ✅ Import service และ interface
import { getEmployeeByID } from '../../services';
import { EmployeeInterface } from '../../interface/IEmployee';

const UserProfile = () => {
  const { currentColor } = useStateContext();
  const navigate = useNavigate();

  // ✅ ใช้ข้อมูลที่ได้จาก backend
  const [employee, setEmployee] = useState<EmployeeInterface | null>(null);

  useEffect(() => {
    const employeeID = localStorage.getItem("employeeid");
    if (employeeID) {
      getEmployeeByID(Number(employeeID))
        .then((res) => {
          if (res) {
            setEmployee(res);
            console.log("ข้อมูล employee:", res);
          }
        })
        .catch((err) => {
          console.error("ดึงข้อมูล employee ไม่สำเร็จ:", err);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    message.success("ออกจากระบบ");
    setTimeout(() => {
      navigate("/login");
    }, 3500);
  };

  return (
    <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg dark:text-gray-200">User Profile</p>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
        />
      </div>
      <div className="flex gap-5 items-center mt-6 border-color border-b-1 pb-6">
        <img
          className="rounded-full h-24 w-24"
          src={`http://localhost:8000/${employee?.User?.Profile?? 'default-profile.png'}`}
          alt="user-profile"
        />
        <div>
          <p className="font-semibold text-xl dark:text-gray-200">
            {employee?.User?.FirstName} {employee?.User?.LastName}
          </p>
          <p className="text-gray-500 text-sm dark:text-gray-400">
            {employee?.User?.UserRole?.RoleName}
          </p>
          <p className="text-gray-500 text-sm font-semibold dark:text-gray-400">
            {employee?.User?.Email}
          </p>
        </div>
      </div>
      <div>
        {userProfileData.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate('/admin/Line')}
            className="flex gap-5 border-b-1 border-color p-4 hover:bg-light-gray cursor-pointer dark:hover:bg-[#42464D]"
          >
            <button
              type="button"
              style={{ color: item.iconColor, backgroundColor: item.iconBg }}
              className="text-xl rounded-lg p-3 hover:bg-light-gray"
            >
              {item.icon}
            </button>

            <div>
              <p className="font-semibold dark:text-gray-200">{item.title}</p>
              <p className="text-gray-500 text-sm dark:text-gray-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <Button
          color="white"
          bgColor={currentColor}
          text="Logout"
          borderRadius="10px"
          width="full"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default UserProfile;
