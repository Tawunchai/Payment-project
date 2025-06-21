import React, { useEffect, useState } from "react";
import Modal from "../../getting/modal";
import { StatusInterface } from "../../../../interface/IStatus";
import { TypeInterface } from "../../../../interface/IType";
import { UpdateEVByID } from "../../../../services/index";

interface EditEVModalProps {
    open: boolean;
    onClose: () => void;
    evCharging: any;
    onSaved: () => void;
    statusList: StatusInterface[];
    typeList: TypeInterface[];
}

const EditEVModal: React.FC<EditEVModalProps> = ({
    open,
    onClose,
    evCharging,
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

    useEffect(() => {
        if (evCharging) {
            setName(evCharging.Name || "");
            setVoltage(evCharging.Voltage?.toString() || "");
            setCurrent(evCharging.Current?.toString() || "");
            setPrice(evCharging.Price ?? "");
            setStatusID(evCharging.StatusID ?? "");
            setTypeID(evCharging.TypeID ?? "");
        }
    }, [evCharging]);

    const handleSubmit = async () => {
        const payload: any = {};

        if (name !== "") payload.name = name;
        if (voltage !== "") payload.voltage = parseFloat(voltage);
        if (current !== "") payload.current = parseFloat(current);
        if (price !== "") payload.price = typeof price === "string" ? parseFloat(price) : price;
        if (statusID !== "" && Number(statusID) !== 0) payload.statusID = Number(statusID);
        if (typeID !== "" && Number(typeID) !== 0) payload.typeID = Number(typeID);
        payload.employeeID = 1;

        if (!evCharging.ID) {
            alert("ข้อมูล EV Charging ไม่สมบูรณ์");
            return;
        }

        console.log(evCharging.ID, payload)

        const result = await UpdateEVByID(evCharging.ID, payload);
        if (result) {
            onSaved();
            onClose();
        }
    };

    if (!open) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <div className="space-y-4 w-[300px] sm:w-[400px]">
                <h2 className="text-xl font-bold">Edit EV Charging</h2>

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
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditEVModal;
