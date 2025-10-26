import React, { useEffect, useState } from "react";
import { Upload, message, Select } from "antd";
import ImgCrop from "antd-img-crop";
import { StatusInterface } from "../../../../interface/IStatus";
import { TypeInterface } from "../../../../interface/IType";
import { CreateEV } from "../../../../services/index";
import {
  FaTimes,
  FaBolt,
  FaImage,
  FaTag,
  FaMoneyBillWave,
  FaListAlt,
  FaInfoCircle,
} from "react-icons/fa";

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
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [statusID, setStatusID] = useState<number | undefined>(undefined);
  const [typeID, setTypeID] = useState<number | undefined>(undefined);
  const [fileList, setFileList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ตรวจมือถือเพื่อกำหนดความสูงโมดัล (ให้เลื่อนใน body)
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setPrice("");
      setStatusID(undefined);
      setTypeID(undefined);
      setFileList([]);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name || !description || !price || !statusID || !typeID || fileList.length === 0) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วนและเลือกรูปภาพ");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("statusID", String(statusID));
      formData.append("typeID", String(typeID));
      formData.append("employeeID", "1"); // ปรับตามระบบจริง
      formData.append("picture", fileList[0].originFileObj);

      const result = await CreateEV(formData);
      if (result) {
        message.success("สร้างข้อมูลสำเร็จ");
        onSaved();
        onClose();
      } else {
        message.error("ไม่สามารถสร้างข้อมูลได้");
      }
    } catch {
      message.error("เกิดข้อผิดพลาดระหว่างการบันทึก");
    } finally {
      setSubmitting(false);
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
    const imgWindow = window.open(src as string);
    imgWindow?.document.write(`<img src="${src}" style="max-width: 100%;" />`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[600px] mx-4 md:mx-auto mb-8 md:mb-0">
        {/* กล่อง modal เป็นคอลัมน์: header (fixed) + body (scroll) + footer (fixed) */}
        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-blue-100 flex flex-col"
          style={{ maxHeight: isMobile ? "78vh" : "82vh" }}
        >
          {/* Header */}
          <div
            className="px-5 pt-3 pb-4 bg-blue-600 text-white flex justify-between items-center"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 8px)" }}
          >
            <div className="flex items-center gap-2">
              <FaBolt className="opacity-90" />
              <h2 className="text-base md:text-lg font-semibold">เพิ่มข้อมูล EV Charging</h2>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="p-2 -m-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-60"
              title="ปิด"
              aria-label="ปิด"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body (scroll area) */}
          <div
            className="px-5 py-5 bg-blue-50/40 space-y-3"
            style={{
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              maxHeight: "100%",
            }}
          >
            {/* Upload */}
            <div className="flex justify-center mb-3">
              <ImgCrop rotationSlider>
                <Upload
                  accept="image/*"
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList: newList }) => setFileList(newList)}
                  onPreview={onPreview}
                  beforeUpload={(file) => {
                    if (!file.type?.startsWith("image/")) {
                      message.error("กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ");
                      return Upload.LIST_IGNORE;
                    }
                    return false; // อัปโหลดตอน submit
                  }}
                  maxCount={1}
                >
                  {fileList.length < 1 && (
                    <div className="flex flex-col items-center text-blue-500">
                      <FaImage size={24} />
                      <span className="mt-1 text-sm font-medium">Upload</span>
                    </div>
                  )}
                </Upload>
              </ImgCrop>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Name */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaTag className="text-blue-500" /> ชื่อสถานี (Name)
                </span>
                <input
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  type="text"
                  placeholder="ชื่อ EV Charging"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              {/* Price */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaMoneyBillWave className="text-blue-500" /> ราคา (Price)
                </span>
                <input
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  type="number"
                  placeholder="ราคา (บาท)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>

              {/* Status */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaListAlt className="text-blue-500" /> สถานะ (Status)
                </span>
                <Select
                  className="ev-select w-full"
                  popupClassName="ev-select-dropdown"
                  placeholder="เลือกสถานะ"
                  value={statusID}
                  onChange={(val) => setStatusID(val as number)}
                  options={statusList.map((s) => ({ label: s.Status, value: s.ID }))}
                  allowClear
                  showSearch={false}
                  size="large"
                />
              </label>

              {/* Type */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-500" /> ประเภท (Type)
                </span>
                <Select
                  className="ev-select w-full"
                  popupClassName="ev-select-dropdown"
                  placeholder="เลือกประเภท"
                  value={typeID}
                  onChange={(val) => setTypeID(val as number)}
                  options={typeList.map((t) => ({ label: t.Type, value: t.ID }))}
                  allowClear
                  showSearch={false}
                  size="large"
                />
              </label>

              {/* Description */}
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-500" /> รายละเอียด (Description)
                </span>
                <textarea
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="คำอธิบายเพิ่มเติม"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-white border-t border-blue-100 flex gap-2 justify-end">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 h-10 rounded-xl border border-blue-200 bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50 active:scale-[0.99] disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-blue-200 transition"
            >
              {submitting ? "กำลังบันทึก..." : "สร้าง"}
            </button>
          </div>

          {/* safe-area ด้านล่างสำหรับมือถือ */}
          <div className="md:hidden h-[env(safe-area-inset-bottom)] bg-white" />
        </div>
      </div>
    </div>
  );
};

export default CreateEVModal;
