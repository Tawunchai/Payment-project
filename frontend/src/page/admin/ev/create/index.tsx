import React, { useEffect, useState } from "react";
import Modal from "../../getting/modal";
import { StatusInterface } from "../../../../interface/IStatus";
import { TypeInterface } from "../../../../interface/IType";
import { CreateEVInput } from "../../../../interface/IEV";
import { CreateEV } from "../../../../services/index";

interface CreateEVModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  statusList: StatusInterface[];
  typeList: TypeInterface[];
}

const CreateEVModal: React.FC<CreateEVModalProps> = ({
  open,
  onClose,
  onSaved,
  statusList,
  typeList,
}) => {
  const [name, setName] = useState<string>("");
  const [voltage, setVoltage] = useState<string>("");
  const [current, setCurrent] = useState<string>("");
  const [price, setPrice] = useState<number | string>("");
  const [statusID, setStatusID] = useState<number | "">("");
  const [typeID, setTypeID] = useState<number | "">("");

  // reset ค่าเมื่อเปิด modal ใหม่
  useEffect(() => {
    if (open) {
      setName("");
      setVoltage("");
      setCurrent("");
      setPrice("");
      setStatusID("");
      setTypeID("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name || !voltage || !current || !price || !statusID || !typeID) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const payload: CreateEVInput = {
      Name: name,
      Voltage: parseFloat(voltage),
      Current: parseFloat(current),
      Price: typeof price === "string" ? parseFloat(price) : price,
      EmployeeID: 1,
      StatusID: Number(statusID),
      TypeID: Number(typeID),
    };

    const result = await CreateEV(payload);
    if (result) {
      onSaved();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4 w-[300px] sm:w-[400px]">
        <h2 className="text-xl font-bold">เพิ่มข้อมูล EV Charging</h2>

        <input
          className="border rounded w-full p-2"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border rounded w-full p-2"
          type="text"
          placeholder="Voltage"
          value={voltage}
          onChange={(e) => setVoltage(e.target.value)}
        />

        <input
          className="border rounded w-full p-2"
          type="text"
          placeholder="Current"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />

        <input
          className="border rounded w-full p-2"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <select
          className="border rounded w-full p-2"
          value={statusID}
          onChange={(e) => {
            const val = e.target.value;
            setStatusID(val === "" ? "" : Number(val));
          }}
        >
          <option value="">เลือกสถานะ</option>
          {statusList.map((status) => (
            <option key={status.ID} value={status.ID}>
              {status.Status}
            </option>
          ))}
        </select>

        <select
          className="border rounded w-full p-2"
          value={typeID}
          onChange={(e) => {
            const val = e.target.value;
            setTypeID(val === "" ? "" : Number(val));
          }}
        >
          <option value="">เลือกประเภท</option>
          {typeList.map((type) => (
            <option key={type.ID} value={type.ID}>
              {type.Type}
            </option>
          ))}
        </select>

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

export default CreateEVModal;
