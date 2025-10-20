import React, { useEffect, useState } from "react";
import { getEmployeeByID } from "../../../services";
import { EmployeeInterface } from "../../../interface/IEmployee";
import { AvatarWithInfo } from "./AvatarWithInfo";
import { ProfileNavbar } from "./ProfileNavbar";
import EVCAR from "../../../assets/solar-profile.png";
import { Spin } from "antd";

const ProfileBanner: React.FC = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeInterface | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // 📦 ดึงข้อมูลพนักงานจาก localStorage + backend
  const fetchEmployee = async () => {
    try {
      const employeeID = Number(localStorage.getItem("employeeid"));
      if (!employeeID) return;

      const data = await getEmployeeByID(employeeID);
      setEmployeeData(data);
    } catch (error) {
      console.error("❌ Error fetching employee data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading Profile..." />
      </div>
    );

  if (!employeeData)
    return (
      <div className="text-center text-gray-500 py-12">ไม่พบข้อมูลพนักงาน</div>
    );

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
