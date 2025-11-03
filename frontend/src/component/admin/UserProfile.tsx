import { MdOutlineCancel } from "react-icons/md";
import { Button } from ".";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { userProfileData } from "../../assets/admin/dummy";
import { useStateContext } from "../../contexts/ContextProvider";
import { JSX, useEffect, useState } from "react";
import { getEmployeeByID, apiUrlPicture } from "../../services";
import { Logout, clearCachedUser, getCurrentUser, initUserProfile } from "../../services/httpLogin"; // ✅ เพิ่ม
import { EmployeeInterface } from "../../interface/IEmployee";

type UserProfileItem = {
  icon: JSX.Element;
  title: string;
  desc: string;
  iconColor: string;
  iconBg: string;
  link: string;
};

const UserProfile = () => {
  const { currentColor } = useStateContext();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeInterface | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const loadEmployee = async () => {
      let current = getCurrentUser();
      if (!current) current = await initUserProfile();

      const empID = current?.employee_id; // ✅ ดึง employee_id จาก current user
      if (!empID) return;

      try {
        const empData = await getEmployeeByID(empID);
        if (empData) setEmployee(empData);
      } catch (err) {
        console.error("❌ โหลดข้อมูลพนักงานล้มเหลว:", err);
      }
    };

    loadEmployee();
  }, []);

  // ✅ Logout ปลอดภัย 100%
  const handleLogout = async () => {
    try {
      const ok = await Logout();
      if (ok) {
        messageApi.success("ออกจากระบบแล้ว");
        setTimeout(() => {
          clearCachedUser();
          localStorage.clear();
          window.dispatchEvent(new Event("roleChange"));
          navigate("/login", { replace: true });
        }, 1000);
      } else {
        messageApi.error("ไม่สามารถออกจากระบบได้");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดระหว่าง Logout");
    }
  };

  const profileSrc =
    employee?.User?.Profile
      ? `${apiUrlPicture}${employee.User.Profile}`
      : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='%23eef2ff'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='16' fill='%233b82f6' font-family='Arial, Helvetica, sans-serif'>EV</text></svg>";

  return (
    <div
      className="
        fixed right-3 top-16 z-50
        w-[calc(100vw-24px)] max-w-sm
        rounded-2xl overflow-hidden
        bg-white dark:bg-white
        border border-gray-100
        shadow-[0_12px_36px_rgba(37,99,235,0.15)]
      "
      style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
    >
      {contextHolder}

      {/* Header */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-12" />
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <p className="text-white text-sm font-semibold">User Profile</p>
          <Button
            icon={<MdOutlineCancel />}
            color="#ffffff"
            bgHoverColor="rgba(255,255,255,0.15)"
            size="2xl"
            borderRadius="50%"
          />
        </div>
      </div>

      {/* Header Card */}
      <div className="px-4 pt-4 pb-3 bg-white">
        <div className="flex gap-4 items-center">
          <img
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-blue-100 bg-blue-50"
            src={profileSrc}
            alt="user-profile"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='%23eef2ff'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='16' fill='%233b82f6' font-family='Arial, Helvetica, sans-serif'>EV</text></svg>";
            }}
          />
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">
              {employee?.User?.FirstName} {employee?.User?.LastName}
            </p>
            <p className="text-[12px] text-blue-700 font-medium">
              {employee?.User?.UserRole?.RoleName ?? "—"}
            </p>
            <p className="text-[12px] text-gray-500 truncate">
              {employee?.User?.Email}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 pb-1 bg-white">
        <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
          {userProfileData.map((item: UserProfileItem, idx: number) => (
            <button
              key={idx}
              onClick={() => navigate(item.link)}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-blue-50 transition-colors"
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-xl"
                style={{ color: item.iconColor, backgroundColor: item.iconBg }}
              >
                {item.icon}
              </span>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {item.title}
                </p>
                <p className="text-[12px] text-gray-500 truncate">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pt-3 pb-4 bg-white">
        <Button
          color="#ffffff"
          bgColor={currentColor || "#2563eb"}
          text="Logout"
          borderRadius="12px"
          width="100%"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default UserProfile;