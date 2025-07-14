import React, { useState, useEffect } from "react";
import { UserroleInterface } from "../../../../interface/IUserrole";
import { CreateEmployeeInput } from "../../../../interface/IEmployee";
import { message } from "antd";
import { FaUserPlus, FaTimes, FaUser, FaLock, FaEnvelope, FaMoneyBill } from "react-icons/fa";

interface CreateEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (data: CreateEmployeeInput) => void;
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
    if (!username || !password || !firstName || !lastName || !email || !userRoleID || !salary) {
      message.warning("กรุณากรอกข้อมูลให้ครบถ้วน");
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
    message.success("สร้างข้อมูลพนักงานสำเร็จ");
    onCreated(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-[600px] shadow-lg space-y-5 relative mx-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-orange-500 hover:text-orange-600"
        >
          <FaTimes size={20} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <FaUserPlus className="text-orange-500" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">สร้างพนักงานใหม่</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center border rounded-lg px-3 py-2">
            <FaUser className="text-orange-400 mr-2" />
            <input
              className="w-full outline-none"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex items-center border rounded-lg px-3 py-2">
            <FaLock className="text-orange-400 mr-2" />
            <input
              type="password"
              className="w-full outline-none"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <input
            className="border rounded-lg px-3 py-2 outline-none"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            className="border rounded-lg px-3 py-2 outline-none"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <div className="md:col-span-2 flex items-center border rounded-lg px-3 py-2">
            <FaEnvelope className="text-orange-400 mr-2" />
            <input
              type="email"
              className="w-full outline-none"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex items-center border rounded-lg px-3 py-2">
            <FaMoneyBill className="text-orange-400 mr-2" />
            <input
              type="number"
              className="w-full outline-none"
              placeholder="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
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
            สร้าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminModal;
