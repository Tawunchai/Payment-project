import React, { useState, useEffect } from "react";
import Modal from "../../getting/modal";
import { UserroleInterface } from "../../../../interface/IUserrole";
import { CreateEmployeeInput } from "../../../../interface/IEmployee";

interface CreateEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (data: CreateEmployeeInput) => void; // ฟังก์ชัน callback รับ data
  userRoles: UserroleInterface[];
}

const CreateAdminModal: React.FC<CreateEmployeeModalProps> = ({
  open,
  onClose,
  onCreated,
  userRoles,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [userRoleID, setUserRoleID] = useState<number | "">("");
  const [salary, setSalary] = useState<number | string>("");

  useEffect(() => {
    if (userRoles.length > 0) setUserRoleID(userRoles[0].ID!);
  }, [userRoles]);

  const handleSubmit = () => {
    if (
      !username ||
      !password ||
      !firstName ||
      !lastName ||
      !email ||
      !userRoleID ||
      !salary
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const payload: CreateEmployeeInput = {
      username,
      password,
      firstName,
      lastName,
      email,
      salary: typeof salary === "string" ? parseFloat(salary) : salary,
    };

    onCreated(payload);
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4 w-[300px] sm:w-[400px]">
        <h2 className="text-xl font-bold">สร้างพนักงานใหม่</h2>

        <input
          className="border rounded w-full p-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border rounded w-full p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="border rounded w-full p-2"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="border rounded w-full p-2"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          className="border rounded w-full p-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border rounded w-full p-2"
          placeholder="Salary"
          type="number"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateAdminModal;
