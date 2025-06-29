import { useState } from "react";
import Modal from "./modal";
import { CreateReport } from "../../../../services";
import { message, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { AiOutlineFileText, AiOutlineUpload } from "react-icons/ai";

type Props = {
  open: boolean;
  onClose: () => void;
};

const ReportModal = ({ open, onClose }: Props) => {
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const userID = localStorage.getItem("userID") || "1";

  const onChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src && file.originFileObj) {
      src = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const imgWindow = window.open(src);
    imgWindow?.document.write(`<img src="${src}" style="max-width: 100%;" />`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!description.trim()) {
    message.error("กรุณากรอกคำอธิบาย");
    return;
  }

  setLoading(true);
  const formData = new FormData();
  formData.append("description", description);
  formData.append("userID", userID);

  if (fileList.length > 0 && fileList[0].originFileObj) {
    formData.append("picture", fileList[0].originFileObj);
  } else {
    formData.append("picture", ""); // หรืออาจไม่ต้องใส่เลย ขึ้นกับ backend
  }

  const result = await CreateReport(formData);
  setLoading(false);

  if (result) {
    message.success("รายงานถูกส่งเรียบร้อยแล้ว");
    setDescription("");
    setFileList([]);
    onClose();
  } else {
    message.error("เกิดข้อผิดพลาดในการส่งรายงาน");
  }
};

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400 flex justify-center items-center gap-2">
          <svg className="w-7 h-7 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" />
          </svg>
          รายงานสถานะ
        </h2>

        <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
          <AiOutlineUpload size={24} />
          อัพโหลดรูปภาพ
        </label>
        <ImgCrop rotationSlider>
          <Upload
            fileList={fileList}
            onChange={onChange}
            onPreview={onPreview}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith("image/");
              if (!isImage) {
                message.error("กรุณาอัปโหลดไฟล์รูปภาพ");
                return Upload.LIST_IGNORE;
              }
              return false; // prevent auto upload
            }}
            maxCount={1}
            listType="picture-card"

          >
            {fileList.length < 1 && (
              <div className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 transition cursor-pointer">
                <PlusOutlined style={{ fontSize: 28 }} />
                <div style={{ marginTop: 8, fontWeight: 500 }}>Upload</div>
              </div>
            )}
          </Upload>
        </ImgCrop>

        {/* Description */}
        <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
          <AiOutlineFileText size={24} />
          รายละเอียดคำอธิบาย
        </label>
        <textarea
          className="w-full rounded-md border border-gray-300 p-3 resize-none
             focus:outline-none focus:ring-2 focus:ring-orange-500
             placeholder-gray-400 transition text-gray-900 shadow-sm"
          placeholder="กรุณากรอกรายละเอียดคำอธิบายของคุณ..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-orange-600 py-3 text-white font-semibold
                     hover:bg-orange-700 disabled:opacity-50 transition-shadow shadow-md"
        >
          {loading ? "กำลังส่ง..." : "ส่งรายงาน"}
        </button>
      </form>
    </Modal>
  );
};

export default ReportModal;
