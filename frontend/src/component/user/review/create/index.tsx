import React from "react";
import ReactDOM from "react-dom";
import { Form, Input, message, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { CreateReview } from "../../../../services";
import StarRating from "../../../../feature/star";
import { ReviewInterface } from "../../../../interface/IReview";
import { FaStar, FaTimes, FaCommentDots } from "react-icons/fa";

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
      messageApi.warning("กรุณาให้คะแนนสวนสัตว์");
      return;
    }

    const trimmedComment = values.Comment?.trim() || "";
    if (trimmedComment.length === 0 || trimmedComment.length > 500) {
      messageApi.warning("กรุณากรอกข้อความรีวิวให้ถูกต้อง (1-500 ตัวอักษร)");
      return;
    }

    const reviewData = {
      rating,
      comment: trimmedComment,
      user_id: UserID,
    };

    setLoading(true);
    try {
      const res = await CreateReview(reviewData);
      if (res) {
        messageApi.success("การรีวิวสำเร็จ");
        setTimeout(() => {
          onClose();
          onReviewCreated(res.id);
          navigate("/user");
        }, 1500);
      } else {
        messageApi.error("การรีวิวไม่สำเร็จ");
      }
    } catch (err) {
      messageApi.error("เกิดข้อผิดพลาดขณะส่งรีวิว");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันปิด modal พร้อมไปหน้า /user (สำหรับปุ่ม "รีวิวทีหลัง")
  const handleReviewLater = () => {
    onClose();
    navigate("/user");
  };

  return ReactDOM.createPortal(
    <>
      {contextHolder}

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="bg-gradient-to-tr from-orange-50 via-white to-orange-100 rounded-2xl shadow-md p-8 w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto relative overflow-y-auto max-h-[90vh] border border-orange-200
          animate-softFadeIn scale-97 transition-transform duration-350 ease-in-out"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-orange-400 hover:text-orange-600 transition"
            aria-label="Close modal"
          >
            <FaTimes size={22} />
          </button>

          {/* หัวข้อแบบ Soft */}
          <h2
            className="text-3xl font-semibold text-center mb-6 text-orange-400 flex items-center justify-center gap-3 select-none"
            style={{
              textShadow:
                "0 0 5px rgba(251, 191, 36, 0.4), 0 0 10px rgba(251, 191, 36, 0.3)",
              fontWeight: 500,
            }}
          >
            รีวิวการชาร์จไฟฟ้า EV
          </h2>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-5"
          >
            <Form.Item
              label={
                <span className="flex items-center gap-2 font-medium text-orange-600 select-none">
                  <FaStar className="text-yellow-300" /> ให้คะแนน
                </span>
              }
            >
              <StarRating rating={rating ?? 0} onRatingChange={setRating} />
            </Form.Item>

            <Form.Item
              name="Comment"
              label={
                <span className="flex items-center gap-2 font-medium text-orange-600 select-none">
                  <FaCommentDots className="text-orange-400" /> รีวิวของคุณ
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
                placeholder="เขียนรีวิวของคุณที่นี่..."
                className="resize-none rounded-lg border border-orange-200 focus:border-orange-400 shadow-sm focus:shadow-md transition"
              />
            </Form.Item>

            <div className="flex justify-end gap-4 pt-4">
              <Tooltip title="รีวิวทีหลัง">
                <button
                  type="button"
                  onClick={handleReviewLater}
                  className="flex items-center gap-2 bg-gray-100 text-gray-600 px-6 py-2 rounded-full hover:bg-gray-200 shadow-sm transition"
                >
                  <FaTimes /> รีวิวทีหลัง
                </button>
              </Tooltip>

              <Tooltip title={loading ? "กำลังส่งรีวิว กรุณารอ..." : "ส่งรีวิว"}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold text-white transition shadow-sm
                    ${
                      loading
                        ? "bg-orange-200 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-400 to-orange-500 hover:opacity-90 shadow-md"
                    }`}
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
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

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes softFadeIn {
            from {
              opacity: 0;
              transform: scale(0.97);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-softFadeIn {
            animation: softFadeIn 0.3s ease-in-out forwards;
          }
        `}
      </style>
    </>,
    document.body
  );
};

export default ModalCreate;
