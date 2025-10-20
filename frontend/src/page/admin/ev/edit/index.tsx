import React, { useEffect, useState } from "react";
import { Upload, message } from "antd";
import ImgCrop from "antd-img-crop";
import { StatusInterface } from "../../../../interface/IStatus";
import { TypeInterface } from "../../../../interface/IType";
import { UpdateEVByID, apiUrlPicture } from "../../../../services/index";
import { FaTimes, FaEdit, FaImage } from "react-icons/fa";

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
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<number | string>("");
  const [statusID, setStatusID] = useState<number | "">("");
  const [typeID, setTypeID] = useState<number | "">("");
  const [fileList, setFileList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (evCharging) {
      setName(evCharging.Name || "");
      setDescription(evCharging.Description || "");
      setPrice(evCharging.Price ?? "");
      setStatusID(evCharging.StatusID ?? "");
      setTypeID(evCharging.TypeID ?? "");

      if (evCharging.Picture) {
        setFileList([
          {
            uid: "-1",
            name: "current_image.jpg",
            status: "done",
            url: apiUrlPicture + evCharging.Picture,
            originFileObj: null,
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [evCharging]);

  const handleSubmit = async () => {
    if (!evCharging?.ID) {
      message.error("ข้อมูล EV Charging ไม่สมบูรณ์");
      return;
    }
    if (!name || !description || !price || !statusID || !typeID) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price.toString());
    formData.append("statusID", statusID.toString());
    formData.append("typeID", typeID.toString());
    formData.append("employeeID", "1"); // ปรับตามระบบจริง

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("picture", fileList[0].originFileObj);
    }

    try {
      setSubmitting(true);
      const result = await UpdateEVByID(evCharging.ID, formData);
      if (result) {
        message.success("แก้ไขข้อมูลสำเร็จ");
        onSaved();
        onClose();
      } else {
        message.error("ไม่สามารถแก้ไขข้อมูลได้");
      }
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
    const imgWindow = window.open(src);
    imgWindow?.document.write(`<img src="${src}" style="max-width: 100%;" />`);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet/Dialog */}
      <div className="relative w-full md:max-w-[600px] mx-auto">
        <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
          {/* Header — EV Blue */}
          <div className="px-5 pt-3 pb-4 md:pt-4 md:pb-4 bg-blue-600 text-white">
            <div className="mx-auto w-10 h-1.5 md:hidden rounded-full bg-white/60 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaEdit className="opacity-90" />
                <h2 className="text-base md:text-lg font-semibold">แก้ไข EV Charging</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="ปิดหน้าต่าง"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-5 bg-blue-50/40">
            {/* Upload */}
            <div className="flex justify-center mb-3">
              <ImgCrop rotationSlider>
                <Upload
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

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <select
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={statusID}
                onChange={(e) => setStatusID(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">เลือกสถานะ</option>
                {statusList.map((s) => (
                  <option key={s.ID} value={s.ID}>
                    {s.Status}
                  </option>
                ))}
              </select>

              <select
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={typeID}
                onChange={(e) => setTypeID(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">เลือกประเภท</option>
                {typeList.map((t) => (
                  <option key={t.ID} value={t.ID}>
                    {t.Type}
                  </option>
                ))}
              </select>

              <textarea
                className="md:col-span-2 w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-white border-t border-slate-100 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 h-10 rounded-xl border border-blue-200 bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-200 transition disabled:opacity-60"
            >
              {submitting ? "กำลังบันทึก…" : "บันทึก"}
            </button>
          </div>
        </div>
      </div>

      {/* Safe area (iOS) */} 
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
};

export default EditEVModal;
