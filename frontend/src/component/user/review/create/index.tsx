import React from "react";
import ReactDOM from "react-dom";
import { Form, Input, message, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { CreateReview } from "../../../../services";
import StarRating from "../../../../feature/star";
import { ReviewInterface } from "../../../../interface/IReview";
import { FaStar, FaTimes, FaBolt } from "react-icons/fa";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  UserID: number;
  onReviewCreated: (reviewId: number) => void;
}

const ModalCreate: React.FC<ModalProps> = ({
  open,
  onClose,
  UserID,
  onReviewCreated,
}) => {
  if (!open) return null;

  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [rating, setRating] = React.useState<number | undefined>(undefined);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const onFinish = async (values: ReviewInterface) => {
    if (rating === undefined || rating < 1 || rating > 5) {
      messageApi.warning("กรุณาให้คะแนนการชาร์จ");
      return;
    }
    const trimmedComment = values.Comment?.trim() || "";
    if (trimmedComment.length === 0 || trimmedComment.length > 500) {
      messageApi.warning("กรุณากรอกข้อความรีวิวให้ถูกต้อง (1–500 ตัวอักษร)");
      return;
    }

    const reviewData = { rating, comment: trimmedComment, user_id: UserID };

    setLoading(true);
    try {
      const res = await CreateReview(reviewData);
      if (res) {
        messageApi.success("ส่งรีวิวสำเร็จ");
        setTimeout(() => {
          onClose();
          onReviewCreated(res.id);
          navigate("/user");
        }, 800);
      } else {
        messageApi.error("การรีวิวไม่สำเร็จ");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดขณะส่งรีวิว");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewLater = () => {
    onClose();
    navigate("/user");
  };

  return ReactDOM.createPortal(
    <>
      {contextHolder}

      {/* Overlay: กลางหน้าจอ & เบลอบางลง */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" // ← เบลอเบาลง
        onClick={onClose}
      />

      {/* Modal: จัดกึ่งกลางแนวตั้ง/แนวนอน */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="w-full max-w-md sm:max-w-lg mx-auto relative overflow-y-auto max-h-[92vh]
                     rounded-2xl border border-blue-100 bg-white shadow-lg animate-softFadeIn
                     font-sans" // ← โทนตัวอักษรเรียบขึ้น
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header (ปรับฟอนต์/ไอคอนให้นิ่งขึ้น) */}
          <div className="sticky top-0 flex items-center justify-between gap-3 px-5 py-4
                          bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                <FaBolt className="text-white" />
              </span>
              <h2 className="text-[15px] font-semibold tracking-wide">
                รีวิวการชาร์จ EV
              </h2>
            </div>
            <button
              onClick={onClose}
              className="h-9 w-9 inline-flex items-center justify-center rounded-xl active:bg-white/15 transition"
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 text-[15px] leading-relaxed"> {/* ← เปลี่ยนสไตล์ตัวอักษร */}
            <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-5">
              <Form.Item
                label={
                  <span className="flex items-center gap-2 font-medium text-blue-700 select-none">
                    การให้คะแนน
                  </span>
                }
              >
                <StarRating rating={rating ?? 0} onRatingChange={setRating} />
              </Form.Item>

              <Form.Item
                name="Comment"
                label={
                  <span className="flex items-center gap-2 font-medium text-blue-700 select-none">
                    ความคิดเห็นของคุณ
                  </span>
                }
                rules={[
                  { required: true, message: "กรุณาเขียนรีวิว" },
                  { max: 500, message: "ไม่เกิน 500 ตัวอักษร" },
                ]}
              >
                <Input.TextArea
                  rows={6}
                  maxLength={500}
                  placeholder="เล่าประสบการณ์การชาร์จของคุณ เช่น ความเร็ว/ความสะดวก/ความสะอาด ฯลฯ"
                  className="resize-none rounded-xl border border-blue-100 focus:border-blue-300 focus:shadow-sm transition"
                />
              </Form.Item>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Tooltip title="รีวิวทีหลัง">
                  <button
                    type="button"
                    onClick={handleReviewLater}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    รีวิวทีหลัง
                  </button>
                </Tooltip>

                <Tooltip title={loading ? "กำลังส่งรีวิว..." : "ส่งรีวิว"}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition
                      ${loading
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95"}`}
                  >
                    {loading ? (
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <FaStar />
                    )}
                    {loading ? "กำลังส่ง..." : "ส่งรีวิว"}
                  </button>
                </Tooltip>
              </div>
            </Form>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes softFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-softFadeIn { animation: softFadeIn .2s ease-out; }
      `}</style>
    </>,
    document.body
  );
};

export default ModalCreate;
