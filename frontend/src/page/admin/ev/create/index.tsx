import React, { useEffect, useState } from "react";
import { Upload, message } from "antd";
import ImgCrop from "antd-img-crop";
import { StatusInterface } from "../../../../interface/IStatus";
import { TypeInterface } from "../../../../interface/IType";
import { CreateEV } from "../../../../services/index";
import { FaTimes, FaBolt, FaImage } from "react-icons/fa";

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
  const [price, setPrice] = useState<string>("");
  const [statusID, setStatusID] = useState<number | "">("");
  const [typeID, setTypeID] = useState<number | "">("");
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      setName("");
      setVoltage("");
      setCurrent("");
      setPrice("");
      setStatusID("");
      setTypeID("");
      setFileList([]);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (
      !name || !voltage || !current || !price || !statusID || !typeID || fileList.length === 0
    ) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วนและเลือกรูปภาพ");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("voltage", voltage);
    formData.append("current", current);
    formData.append("price", price);
    formData.append("statusID", statusID.toString());
    formData.append("typeID", typeID.toString());
    formData.append("employeeID", "1");
    formData.append("picture", fileList[0].originFileObj);

    const result = await CreateEV(formData);
    if (result) {
      message.success("สร้างข้อมูลสำเร็จ");
      onSaved();
      onClose();
    } else {
      message.error("ไม่สามารถสร้างข้อมูลได้");
    }
  };

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src && file.originFileObj) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const imgWindow = window.open(src);
    imgWindow?.document.write(`<img src="${src}" style="max-width: 100%;" />`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-[600px] shadow-lg space-y-5 relative mx-auto">
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-orange-500 hover:text-orange-600"
        >
          <FaTimes size={20} />
        </button>

        {/* หัวข้อ */}
        <div className="flex items-center justify-center gap-2 mb-2 text-orange-500">
          <FaBolt size={20} />
          <h2 className="text-xl font-semibold text-gray-800">เพิ่มข้อมูล EV Charging</h2>
        </div>

        {/* Upload Image */}
        <div className="flex justify-center">
          <ImgCrop rotationSlider>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newList }) => setFileList(newList)}
              onPreview={onPreview}
              beforeUpload={(file) => {
                if (!file.type.startsWith("image/")) {
                  message.error("กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ");
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div className="flex flex-col items-center text-orange-400">
                  <FaImage size={24} />
                  <span className="mt-1">Upload</span>
                </div>
              )}
            </Upload>
          </ImgCrop>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300"
            type="text"
            placeholder="Voltage"
            value={voltage}
            onChange={(e) => setVoltage(e.target.value)}
          />
          <input
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300"
            type="text"
            placeholder="Current"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <input
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300"
            value={statusID}
            onChange={(e) => setStatusID(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">เลือกสถานะ</option>
            {statusList.map((status) => (
              <option key={status.ID} value={status.ID}>
                {status.Status}
              </option>
            ))}
          </select>
          <select
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300"
            value={typeID}
            onChange={(e) => setTypeID(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">เลือกประเภท</option>
            {typeList.map((type) => (
              <option key={type.ID} value={type.ID}>
                {type.Type}
              </option>
            ))}
          </select>
        </div>

        {/* ปุ่ม */}
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

export default CreateEVModal;
