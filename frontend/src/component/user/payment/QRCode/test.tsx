import React, { useRef, useEffect, useState } from "react";
import { FaPaypal, FaUpload, FaPaperPlane, FaTimes } from "react-icons/fa";
import { message, QRCode, Image } from "antd";
import generatePayload from "promptpay-qr";
import { useLocation, useNavigate } from "react-router-dom";
import {
  uploadSlipOK,
  CreatePayment,
  CreateEVChargingPayment,
  ListBank,
} from "../../../../services/index";
import { FileImageOutlined } from "@ant-design/icons";
import LoadingAnimation from "../../../../component/user/money/LoadingAnimation";

// EV bolt icon (minimal)
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

const PayPalCard: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const location = useLocation();
  const { totalAmount, userID, chargers, MethodID } = location.state || {};
  const amountNumber = Number(totalAmount) || 0;

  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // โหลดเบอร์ PromptPay จากธนาคาร
  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const banks = await ListBank();
        if (banks && banks.length > 0) {
          const bankPhone = banks[0].PromptPay || "";
          setPhoneNumber(bankPhone);
        } else {
          message.error("ไม่พบข้อมูลธนาคารสำหรับ PromptPay");
        }
      } catch {
        message.error("โหลดข้อมูลธนาคารล้มเหลว");
      }
    };
    fetchBankData();
  }, []);

  // สร้าง Payload QR
  useEffect(() => {
    if (amountNumber > 0 && phoneNumber) {
      const payload = generatePayload(phoneNumber, { amount: amountNumber });
      setQrCode(payload);
    } else {
      setQrCode("");
    }
  }, [amountNumber, phoneNumber]);

  // อัปโหลดไฟล์
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ส่งหลักฐาน
  const handleSubmit = async () => {
    if (!uploadedFile) {
      message.warning("กรุณาอัปโหลดสลิปก่อนส่ง");
      return;
    }
    setLoading(true);

    try {
      const result = await uploadSlipOK(uploadedFile);
      if (!result) {
        message.error("ส่งหลักฐานล้มเหลว");
        setLoading(false);
        return;
      }

      message.success("ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว");

      const paymentData = {
        date: new Date().toISOString().split("T")[0], // "YYYY-MM-DD"
        amount: Number(totalAmount),
        user_id: userID,
        method_id: MethodID,
        reference_number: result.data.ref,
        picture: uploadedFile, // หรือเปลี่ยนเป็น path ที่ server ส่งกลับมาก็ได้
      };

      const paymentResult = await CreatePayment(paymentData);

      if (paymentResult && paymentResult.ID) {
        if (Array.isArray(chargers)) {
          for (const charger of chargers) {
            const evChargingPaymentData = {
              evcharging_id: charger.id,
              payment_id: paymentResult.ID,
              price: charger.total,
              quantity: charger.power,
            };
            const evPaymentResult = await CreateEVChargingPayment(evChargingPaymentData);
            if (!evPaymentResult) {
              message.error(`สร้าง EVChargingPayment สำหรับ ${charger.name} ล้มเหลว`);
            }
          }
        } else {
          message.error("ไม่มีข้อมูล chargers ที่ถูกต้อง");
        }
      } else {
        message.error("สร้าง Payment ล้มเหลว");
      }

      setTimeout(() => {
        navigate("/user/charging");
        setLoading(false);
      }, 1200);
    } catch {
      message.error("เกิดข้อผิดพลาดในการส่งหลักฐาน");
      setLoading(false);
    }
  };

  // Drag & Drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      setUploadedFile(file);
      event.dataTransfer.clearData();
    }
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();

  return (
    <div className="min-h-screen bg-white">
      {/* Header น้ำเงินโค้งมน (สไตล์เดียวกับหน้า Payment) */}
      <header
        className="sticky top-0 z-20 bg-blue-600 text-white rounded-b-2xl shadow-md overflow-hidden"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            aria-label="ย้อนกลับ"
            className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold tracking-wide">Scan to pay / Upload slip</span>
          </div>
        </div>
      </header>

      {/* Overlay Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
          <LoadingAnimation />
        </div>
      )}

      {/* Content */}
      <main className="mx-auto max-w-screen-sm px-4 pb-28 pt-4">
        {/* Summary capsule */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
          <div className="text-sm text-blue-900">ยอดชำระทั้งหมด</div>
          <div className="text-xl font-bold text-blue-700">฿{amountNumber.toFixed(2)}</div>
        </div>

        {/* Card หลัก: QR + อัปโหลด สไตล์ minimal */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          {/* QR Section */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <FaPaypal className="text-blue-600 text-2xl" />
              <span className="text-base font-semibold text-gray-800">PromptPay</span>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              {qrCode ? (
                <QRCode value={qrCode} size={180} errorLevel="H" />
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
                  กำลังสร้าง QR Code...
                </div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">อัปโหลดสลิปชำระเงิน</h2>

            {uploadedFile ? (
              <div className="relative mb-3 flex justify-center border border-gray-200 rounded-xl p-2 bg-white">
                <Image
                  src={URL.createObjectURL(uploadedFile)}
                  alt="Preview slip"
                  style={{ maxHeight: 240, maxWidth: "100%", objectFit: "contain", borderRadius: 12 }}
                  placeholder
                  preview={{ maskClassName: "rounded-xl" }}
                />
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow transition"
                  aria-label="Remove uploaded file"
                  title="ลบสลิปที่อัปโหลด"
                  type="button"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            ) : (
              <div
                className="mb-3 flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-xl py-10 text-gray-500 cursor-pointer select-none"
                onClick={handleUploadClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <FileImageOutlined style={{ fontSize: 44, marginBottom: 10 }} />
                <p className="text-sm font-medium">ยังไม่มีสลิปที่อัปโหลด</p>
                <p className="text-[12px] mt-1 text-gray-500 text-center px-2">
                  คลิกหรือ “ลาก-วาง” ไฟล์สลิปมาที่นี่เพื่ออัปโหลด
                </p>
              </div>
            )}

            {/* ปุ่มในการ์ด (สำรอง ถ้าไม่อยากใช้ bottom bar สามารถย้าย logic มาที่นี่) */}
            <div className="hidden">
              <button
                onClick={handleUploadClick}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition font-medium"
              >
                <FaUpload />
                อัปโหลดสลิป
              </button>
              <button
                onClick={handleSubmit}
                disabled={!uploadedFile}
                className={`mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium transition
                  ${uploadedFile ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800" : "bg-blue-300 cursor-not-allowed"}`}
              >
                <FaPaperPlane />
                ส่งหลักฐานการชำระเงิน
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </main>

      {/* Bottom Action Bar: ปุ่มใหญ่กดง่ายบนมือถือ */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-screen-sm items-center gap-3 px-4 py-3">
          <button
            onClick={handleUploadClick}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-white
              bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition"
          >
            <FaUpload />
            <span className="text-sm font-semibold">อัปโหลดสลิป</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={!uploadedFile}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-white transition
              ${
                uploadedFile
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:from-blue-800 active:to-blue-700"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            aria-busy={!uploadedFile ? undefined : loading}
          >
            <FaPaperPlane />
            <span className="text-sm font-semibold">ส่งหลักฐาน</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayPalCard;
