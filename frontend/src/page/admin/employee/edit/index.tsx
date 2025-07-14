import React, { useEffect, useState } from "react";
import { UserroleInterface } from "../../../../interface/IUserrole";
import { UpdateAdminByID } from "../../../../services/index"; // ปรับ path ตามจริง
import { EmployeeInterface } from "../../../../interface/IEmployee"; // ปรับ path ตามจริง
import { message } from "antd";
import { FaTimes, FaMoneyBill, FaUserTag, FaEdit } from "react-icons/fa";

interface EditAdminModalProps {
  open: boolean;
  onClose: () => void;
  employee: any;
  onSaved: () => void;
  userRoles: UserroleInterface[];
}

const EditAdminModal: React.FC<EditAdminModalProps> = ({
  open,
  onClose,
  employee,
  onSaved,
  userRoles,
}) => {
  const [salary, setSalary] = useState<number | string>("");
  const [userRoleID, setUserRoleID] = useState<number | "">("");

  useEffect(() => {
    if (employee) {
      setSalary(employee.Salary || "");
      setUserRoleID(employee.UserRole?.ID || employee.UserRoleID || "");
    }
  }, [employee]);

  const handleSubmit = async () => {
    const payload: Partial<Pick<EmployeeInterface, "Salary">> & {
      userRoleID?: number;
    } = {};

    if (salary !== "") payload.Salary = typeof salary === "string" ? parseFloat(salary) : salary;
    if (userRoleID !== "") payload.userRoleID = Number(userRoleID);
    console.log(employee.EmployeeID, payload)
    const result = await UpdateAdminByID(employee.EmployeeID, payload);
    if (result) {
      message.success("อัพเดตข้อมูลพนักงานสำเร็จ");
      onSaved();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-[500px] shadow-lg space-y-5 relative mx-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-orange-500 hover:text-orange-600"
        >
          <FaTimes size={20} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <FaEdit className="text-orange-500" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">แก้ไขข้อมูลพนักงาน</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center border rounded-lg px-3 py-2">
            <FaMoneyBill className="text-orange-400 mr-2" />
            <input
              type="number"
              name="Salary"
              placeholder="Salary"
              className="w-full outline-none"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>

          <div className="flex items-center border rounded-lg px-3 py-2">
            <FaUserTag className="text-orange-400 mr-2" />
            <select
              name="UserRoleID"
              className="w-full outline-none bg-transparent"
              value={userRoleID}
              onChange={(e) => setUserRoleID(Number(e.target.value))}
            >
              <option value="">เลือกบทบาท</option>
              {userRoles.map((role) => (
                <option key={role.ID} value={role.ID}>
                  {role.RoleName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAdminModal;
