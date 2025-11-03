import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { getEmployeeByID } from "../../../services";
import { getCurrentUser, initUserProfile } from "../../../services/httpLogin";
import { EmployeeInterface } from "../../../interface/IEmployee";
import { AvatarWithInfo } from "./AvatarWithInfo";
import { ProfileNavbar } from "./ProfileNavbar";
import EVCAR from "../../../assets/solar-profile.png";

const ProfileBanner: React.FC = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeInterface | null>(null);
  const [loading, setLoading] = useState(true);

  // 📦 โหลดข้อมูลผู้ใช้ปัจจุบัน + ดึงข้อมูลพนักงานจาก backend
  const fetchEmployee = async () => {
    try {
      // ✅ เริ่มจากเตรียม user profile (initUserProfile จะ sync token/localStorage)
      await initUserProfile();

      // ✅ ดึงข้อมูล user ปัจจุบันจาก token/localStorage
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.employee_id) {
        message.warning("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        setLoading(false);
        return;
      }

      // ✅ ดึงข้อมูลพนักงานจาก backend ตาม EmployeeID
      const data = await getEmployeeByID(currentUser.employee_id);
      if (data) {
        setEmployeeData(data);
      } else {
        message.error("ไม่พบข้อมูลพนักงานในระบบ");
      }
    } catch (error) {
      console.error("❌ Error fetching employee data:", error);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  // 🌀 Loading
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading Profile..." />
      </div>
    );

  // ❌ ไม่มีข้อมูล
  if (!employeeData)
    return (
      <div className="text-center text-gray-500 py-12">
        ไม่พบข้อมูลพนักงาน
      </div>
    );

  // ✅ แสดงผลข้อมูลพนักงาน
  return (
    <div
      className="relative py-12 px-8 mb-8 rounded-xl overflow-hidden text-white bg-center bg-cover bg-no-repeat after:inline-block after:absolute after:inset-0 after:bg-black/60"
      style={{ backgroundImage: `url(${EVCAR})` }}
    >
      <div className="relative z-10">
        <AvatarWithInfo />
        <ProfileNavbar
          employeeData={employeeData}
          onProfileUpdated={fetchEmployee}
        />
      </div>
    </div>
  );
};

export { ProfileBanner };
