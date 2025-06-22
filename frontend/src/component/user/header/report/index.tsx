import { useState } from "react";
import Modal from "./modal"; // ที่คุณสร้างไว้ (Modal with close X icon)
import { CreateReport } from "../../../../services"; // ที่คุณสร้าง service ไว้
import { message } from "antd";

type Props = {
  open: boolean;
  onClose: () => void;
};

const ReportModal = ({ open, onClose }: Props) => {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // สมมติ userID มีมาจาก localStorage หรือ context
  const userID = localStorage.getItem("userID") || "1";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      message.error("กรุณากรอกคำอธิบาย");
      return;
    }
    if (!file) {
      message.error("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("description", description);
    formData.append("userID", userID);
    formData.append("picture", file);

    const result = await CreateReport(formData);
    setLoading(false);

    if (result) {
      message.success("รายงานถูกส่งเรียบร้อยแล้ว");
      setDescription("");
      setFile(null);
      onClose();
    } else {
      message.error("เกิดข้อผิดพลาดในการส่งรายงาน");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h2 className="text-xl font-bold">รายงานสถานะ</h2>

        <textarea
          className="border p-2 w-full rounded"
          placeholder="คำอธิบายรายงาน"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />

        <input type="file" accept="image/*" onChange={handleFileChange} required />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "กำลังส่ง..." : "ส่งรายงาน"}
        </button>
      </form>
    </Modal>
  );
};

export default ReportModal;
