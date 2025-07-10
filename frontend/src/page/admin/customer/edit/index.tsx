import React, { useEffect, useState } from "react";
import Modal from "../../getting/modal";
import { GendersInterface } from "../../../../interface/IGender";
import { UserroleInterface } from "../../../../interface/IUserrole";
import { FaUserEdit, FaEnvelope, FaUser, FaPhoneAlt, FaCoins, FaTransgender, FaUserTag, FaTimes, FaSave } from "react-icons/fa";

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

  useEffect(() => {
    setForm({
      ...user,
      UserID: user?.UserID ?? user?.ID ?? "",
      GenderID: user?.Gender?.ID ?? user?.GenderID ?? "",
      UserRoleID: user?.UserRole?.ID ?? user?.UserRoleID ?? "",
      Coin: user?.Coin ?? 0,
    });
  }, [user]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: name === "Coin" ? Number(value) : value
    }));
  };

  const handleSubmit = () => {
    const { Gender, UserRole, ...payload } = form;
    console.log("📦 ข้อมูลที่กำลังจะอัปเดต:", payload);
    onSave(payload);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border-t-4 border-orange-500 space-y-5">
        <div className="flex items-center justify-center gap-2 text-orange-600">
          <FaUserEdit size={24} />
          <h2 className="text-xl font-semibold">Edit User</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <FaUser className="absolute left-2 top-3 text-orange-400" />
            <input
              className="pl-8 border rounded p-2 w-full focus:ring-2 focus:ring-orange-300"
              name="Username"
              placeholder="Username"
              value={form.Username || ""}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-2 top-3 text-orange-400" />
            <input
              className="pl-8 border rounded p-2 w-full focus:ring-2 focus:ring-orange-300"
              name="Email"
              placeholder="Email"
              value={form.Email || ""}
              onChange={handleChange}
            />
          </div>
          <input
            className="border rounded p-2 w-full focus:ring-2 focus:ring-orange-300"
            name="FirstName"
            placeholder="First Name"
            value={form.FirstName || ""}
            onChange={handleChange}
          />
          <input
            className="border rounded p-2 w-full focus:ring-2 focus:ring-orange-300"
            name="LastName"
            placeholder="Last Name"
            value={form.LastName || ""}
            onChange={handleChange}
          />
          <div className="relative">
            <FaPhoneAlt className="absolute left-2 top-3 text-orange-400" />
            <input
              className="pl-8 border rounded p-2 w-full focus:ring-2 focus:ring-orange-300"
              name="PhoneNumber"
              placeholder="Phone Number"
              value={form.PhoneNumber || ""}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FaCoins className="absolute left-2 top-3 text-yellow-500" />
            <input
              type="number"
              className="pl-8 border rounded p-2 w-full focus:ring-2 focus:ring-orange-300"
              name="Coin"
              placeholder="Coin"
              value={form.Coin ?? 0}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <FaTransgender className="absolute left-2 top-3 text-orange-400" />
            <select
              name="GenderID"
              className="pl-8 border rounded p-2 w-full focus:ring-2 focus:ring-orange-300"
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
          <div className="relative">
            <FaUserTag className="absolute left-2 top-3 text-orange-400" />
            <select
              name="UserRoleID"
              className="pl-8 border rounded p-2 w-full focus:ring-2 focus:ring-orange-300"
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

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-4 py-2 bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition"
          >
            <FaTimes /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
          >
            <FaSave /> Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditUserModal;
