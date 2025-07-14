import React, { useEffect, useState } from "react";
import { GendersInterface } from "../../../../interface/IGender";
import { UserroleInterface } from "../../../../interface/IUserrole";
import {
  FaUserEdit, FaEnvelope, FaUser, FaPhoneAlt, FaCoins, FaTransgender, FaUserTag, FaTimes
} from "react-icons/fa";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
  onSave: (updatedUser: any) => void;
  genders: GendersInterface[];
  userRoles: UserroleInterface[];
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  user,
  onSave,
  genders,
  userRoles,
}) => {
  const [form, setForm] = useState<any>(user);
  const [errors, setErrors] = useState<{ Email?: string; PhoneNumber?: string; Coin?: string }>({});

  useEffect(() => {
    setForm({
      ...user,
      UserID: user?.UserID ?? user?.ID ?? "",
      GenderID: user?.Gender?.ID ?? user?.GenderID ?? "",
      UserRoleID: user?.UserRole?.ID ?? user?.UserRoleID ?? "",
      Coin: user?.Coin ?? 0,
    });
    setErrors({});
  }, [user]);

  if (!open) return null;

  const validate = () => {
    const newErrors: typeof errors = {};

    if (form.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email)) {
      newErrors.Email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    if (form.PhoneNumber && !/^0\d{9}$/.test(form.PhoneNumber)) {
      newErrors.PhoneNumber = "กรุณาใส่เบอร์โทรให้ถูกต้อง";
    }
    if (form.Coin !== undefined && isNaN(form.Coin)) {
      newErrors.Coin = "ต้องเป็นตัวเลขเท่านั้น";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: name === "Coin" ? value : value
    }));
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const { Gender, UserRole, ...payload } = {
      ...form,
      Coin: Number(form.Coin)
    };
    console.log("📦 ข้อมูลที่กำลังจะอัปเดต:", payload);
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-[600px] shadow-lg space-y-5 relative mx-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-orange-500 hover:text-orange-600"
        >
          <FaTimes size={20} />
        </button>

        <div className="flex items-center gap-2 mb-2 text-orange-500">
          <FaUserEdit size={24} />
          <h2 className="text-xl font-semibold text-gray-800">แก้ไขข้อมูลผู้ใช้</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center border rounded-lg px-3 py-2">
            <FaUser className="text-orange-400 mr-2" />
            <input
              className="w-full outline-none"
              name="Username"
              placeholder="Username"
              value={form.Username || ""}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaEnvelope className="text-orange-400 mr-2" />
              <input
                className="w-full outline-none"
                name="Email"
                placeholder="Email"
                value={form.Email || ""}
                onChange={handleChange}
              />
            </div>
            {errors.Email && <p className="text-red-500 text-xs mt-1">{errors.Email}</p>}
          </div>

          <input
            className="border rounded-lg px-3 py-2 outline-none"
            name="FirstName"
            placeholder="First Name"
            value={form.FirstName || ""}
            onChange={handleChange}
          />
          <input
            className="border rounded-lg px-3 py-2 outline-none"
            name="LastName"
            placeholder="Last Name"
            value={form.LastName || ""}
            onChange={handleChange}
          />

          <div className="flex flex-col">
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaPhoneAlt className="text-orange-400 mr-2" />
              <input
                className="w-full outline-none"
                name="PhoneNumber"
                placeholder="Phone Number"
                value={form.PhoneNumber || ""}
                onChange={handleChange}
              />
            </div>
            {errors.PhoneNumber && <p className="text-red-500 text-xs mt-1">{errors.PhoneNumber}</p>}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaCoins className="text-yellow-500 mr-2" />
              <input
                type="number"
                step="0.01"
                className="w-full outline-none"
                name="Coin"
                placeholder="Coin"
                value={form.Coin ?? 0}
                onChange={handleChange}
              />
            </div>
            {errors.Coin && <p className="text-red-500 text-xs mt-1">{errors.Coin}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center border rounded-lg px-3 py-2">
            <FaTransgender className="text-orange-400 mr-2" />
            <select
              name="GenderID"
              className="w-full outline-none bg-transparent"
              value={form.GenderID || ""}
              onChange={handleChange}
            >
              <option value="">เลือกเพศ</option>
              {genders.map((g) => (
                <option key={g.ID} value={g.ID}>
                  {g.Gender}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center border rounded-lg px-3 py-2">
            <FaUserTag className="text-orange-400 mr-2" />
            <select
              name="UserRoleID"
              className="w-full outline-none bg-transparent"
              value={form.UserRoleID || ""}
              onChange={handleChange}
            >
              <option value="">เลือกบทบาท</option>
              {userRoles.map((r) => (
                <option key={r.ID} value={r.ID}>
                  {r.RoleName}
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

export default EditUserModal;
