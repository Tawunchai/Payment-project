import React, { useEffect, useState } from "react";
import Modal from "../../getting/modal";
import { Upload, message } from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { StatusInterface } from "../../../../interface/IStatus";
import { TypeInterface } from "../../../../interface/IType";
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
  const [price, setPrice] = useState<string>("");
  const [statusID, setStatusID] = useState<number | "">("");
  const [typeID, setTypeID] = useState<number | "">("");
  const [fileList, setFileList] = useState<any[]>([]); // antd ใช้ fileList

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
      !name ||
      !voltage ||
      !current ||
      !price ||
      !statusID ||
      !typeID ||
      fileList.length === 0
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
    formData.append("employeeID", "1"); // ปรับได้ตามระบบ auth
    formData.append("picture", fileList[0].originFileObj); // แนบไฟล์จริง

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

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4 w-[300px] sm:w-[400px]">
        <h2 className="text-xl font-bold">เพิ่มข้อมูล EV Charging</h2>

        <ImgCrop rotationSlider>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList: newList }) => setFileList(newList)}
            onPreview={onPreview}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith("image/");
              if (!isImage) {
                message.error("กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ");
                return Upload.LIST_IGNORE;
              }
              return false; // ไม่ให้อัปโหลดทันที
            }}
            maxCount={1}
          >
            {fileList.length < 1 && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </ImgCrop>

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
          onChange={(e) =>
            setStatusID(e.target.value === "" ? "" : Number(e.target.value))
          }
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
          onChange={(e) =>
            setTypeID(e.target.value === "" ? "" : Number(e.target.value))
          }
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
