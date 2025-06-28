import React, { useEffect, useState } from "react";
import Modal from "../../getting/modal";
import { Upload, message } from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
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
  const [fileList, setFileList] = useState<any[]>([]); // antd Upload fileList

  useEffect(() => {
    if (evCharging) {
      setName(evCharging.Name || "");
      setVoltage(evCharging.Voltage?.toString() || "");
      setCurrent(evCharging.Current?.toString() || "");
      setPrice(evCharging.Price ?? "");
      setStatusID(evCharging.StatusID ?? "");
      setTypeID(evCharging.TypeID ?? "");

      // ถ้ามีรูปเดิมให้แสดง preview รูปใน fileList ของ Upload ด้วย (รูปจาก URL)
      if (evCharging.PictureURL) {
        setFileList([
          {
            uid: "-1",
            name: "current_image.jpg",
            status: "done",
            url: evCharging.PictureURL, // URL รูปภาพจริงที่ backend เก็บไว้
            originFileObj: null,
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [evCharging]);

  const handleSubmit = async () => {
    if (!evCharging.ID) {
      alert("ข้อมูล EV Charging ไม่สมบูรณ์");
      return;
    }

    if (
      !name ||
      !voltage ||
      !current ||
      !price ||
      !statusID ||
      !typeID
    ) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("voltage", voltage);
    formData.append("current", current);
    formData.append("price", price.toString());
    formData.append("statusID", statusID.toString());
    formData.append("typeID", typeID.toString());
    formData.append("employeeID", "1");

    // ถ้ามีไฟล์ใหม่ที่ upload มาแนบจริง (originFileObj)
    // ถ้า user ไม่เปลี่ยนรูป จะไม่มี originFileObj ให้ส่ง (เพราะแสดงแค่ URL)
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("picture", fileList[0].originFileObj);
    }

    const result = await UpdateEVByID(evCharging.ID, formData);
    if (result) {
      message.success("แก้ไขข้อมูลสำเร็จ");
      onSaved();
      onClose();
    } else {
      message.error("ไม่สามารถแก้ไขข้อมูลได้");
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
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4 w-[300px] sm:w-[400px]">
        <h2 className="text-xl font-bold">Edit EV Charging</h2>

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
