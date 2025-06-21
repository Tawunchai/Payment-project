import React, { useEffect, useState } from "react";
import Modal from "../../getting/modal";
import { UserroleInterface } from "../../../../interface/IUserrole";
import { UpdateAdminByID } from "../../../../services/index"; // ปรับ path ตามจริง
import { EmployeeInterface } from "../../../../interface/IEmployee"; // ปรับ path ตามจริง

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
      onSaved(); // รีโหลดข้อมูลในหน้า Employees
      onClose(); // ปิด modal
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4 w-[300px] sm:w-[400px]">
        <h2 className="text-xl font-bold">Edit Admin</h2>

        <input
          className="border rounded w-full p-2"
          type="number"
          name="Salary"
          placeholder="Salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />

        <select
          name="UserRoleID"
          className="border rounded w-full p-2"
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

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditAdminModal;
