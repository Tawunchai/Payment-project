import { Avatar, message } from "antd";
import { useEffect, useState } from "react";
import { getEmployeeByID, apiUrlPicture } from "../../../services";
import { getCurrentUser, initUserProfile } from "../../../services/httpLogin";
import { EmployeeInterface } from "../../../interface/IEmployee";

export const AvatarWithInfo = () => {
  const [employee, setEmployee] = useState<EmployeeInterface | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        // ✅ เตรียม user profile ก่อน (จะ decode token และตั้งค่าภายใน)
        await initUserProfile();

        // ✅ ดึงข้อมูล user จาก token
        const currentUser = getCurrentUser();

        if (!currentUser || !currentUser.employee_id) {
          message.warning("ไม่พบรหัสพนักงานในระบบ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
          return;
        }

        // ✅ ดึงข้อมูลพนักงานจาก backend
        const emp = await getEmployeeByID(currentUser.employee_id);
        console.log("✅ Employee fetched:", emp);

        if (emp) {
          setEmployee(emp);
        } else {
          message.error("ไม่พบข้อมูลพนักงานในระบบ");
        }
      } catch (error) {
        console.error("❌ Error fetching employee data:", error);
        message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน");
      }
    };

    fetchEmployee();
  }, []);

  return (
    <div className="flex items-center justify-between flex-col sm:flex-row">
      <div className="flex flex-wrap flex-col items-center max-sm:text-center mb-6 lg:flex-row">
        {/* ✅ รูปโปรไฟล์ */}
        <Avatar
          src={
            employee?.User?.Profile
              ? `${apiUrlPicture}${employee.User.Profile}`
              : undefined
          }
          alt="user"
          size={80}
        />

        {/* ✅ ชื่อ + ตำแหน่ง */}
        <div className="flex-1 sm:pl-4 max-sm:mt-4">
          <div className="text-xl mb-1">
            {employee
              ? `${employee.User?.FirstName || ""} ${employee.User?.LastName || ""}`
              : "Loading..."}
          </div>
          <div>{employee?.User?.UserRole?.RoleName || ""}</div>
        </div>
      </div>
    </div>
  );
};
