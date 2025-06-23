import { Avatar } from "antd";
import { useEffect, useState } from "react";
import { getEmployeeByID } from "../../../services"; // ปรับ path ให้ถูกต้อง
import { EmployeeInterface } from "../../../interface/IEmployee"; // กำหนด interface ให้ตรงกับข้อมูล

export const AvatarWithInfo = () => {
  const [employee, setEmployee] = useState<EmployeeInterface | null>(null);
   const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    const fetchEmployee = async () => {
      const emp = await getEmployeeByID(employeeid); 
      if (emp) {
        setEmployee(emp);
      }
    };
    fetchEmployee();
  }, []);

  return (
    <div className="flex items-center justify-between flex-col sm:flex-row">
      <div className="flex flex-wrap flex-col items-center max-sm:text-center mb-6 lg:flex-row">
        <Avatar 
          src={employee?.User?.Profile ? `http://localhost:8000/${employee.User.Profile}` : undefined} 
          alt="user" 
          size={80} 
        />
        <div className="flex-1 sm:pl-4 max-sm:mt-4">
          <div className="text-xl mb-1">
            {employee ? `${employee.User?.FirstName || ""} ${employee.User?.LastName || ""}` : "Loading..."}
          </div>
          <div>{employee?.User?.UserRole?.RoleName || ""}</div>
        </div>
      </div>
    </div>
  );
};
