import React, { useEffect, useState } from "react";
import Modal from "../../getting/modal";
import { GendersInterface } from "../../../../interface/IGender";
import { UserroleInterface } from "../../../../interface/IUserrole";

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
      GenderID: user?.Gender?.ID ?? user?.GenderID ?? "",
      UserRoleID: user?.UserRole?.ID ?? user?.UserRoleID ?? "",
    });
  }, [user]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    // ลบ object ที่ไม่จำเป็น
    const { Gender, UserRole, ...payload } = form;
    onSave(payload);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-3 w-[300px] sm:w-[400px]">
        <h2 className="text-xl font-bold">Edit User</h2>

        <input
          className="border rounded w-full p-2"
          name="Username"
          placeholder="Username"
          value={form.Username || ""}
          onChange={handleChange}
        />
        <input
          className="border rounded w-full p-2"
          name="FirstName"
          placeholder="First Name"
          value={form.FirstName || ""}
          onChange={handleChange}
        />
        <input
          className="border rounded w-full p-2"
          name="LastName"
          placeholder="Last Name"
          value={form.LastName || ""}
          onChange={handleChange}
        />
        <input
          className="border rounded w-full p-2"
          name="Email"
          placeholder="Email"
          value={form.Email || ""}
          onChange={handleChange}
        />
        <input
          className="border rounded w-full p-2"
          name="PhoneNumber"
          placeholder="Phone Number"
          value={form.PhoneNumber || ""}
          onChange={handleChange}
        />

        <select
          name="GenderID"
          className="border rounded w-full p-2"
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

        <select
          name="UserRoleID"
          className="border rounded w-full p-2"
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

export default EditUserModal;
