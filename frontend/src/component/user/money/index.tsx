import React, { useRef, useEffect, useState } from "react";
import { FaPaypal, FaUpload, FaPaperPlane, FaTimes } from "react-icons/fa";
import { message, QRCode, Image, InputNumber } from "antd";
import generatePayload from "promptpay-qr";
import {
  uploadSlipOK,
  UpdateCoin,
  getUserByID,
  CreatePaymentCoin,
  ListBank,
} from "../../../services";
import { FileImageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LoadingAnimation from "./LoadingAnimation";

// EV bolt icon (minimal)
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

const AddMoneyCoin: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const [userID, setUserID] = useState<number>(1);
  const [userCoin, setUserCoin] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  // ธนาคาร
  const [promptPay, setPromptPay] = useState<string>("");
  const [minimum, setMinimum] = useState<number>(0);

  const navigate = useNavigate();

  // โหลด PromptPay + Minimum
  useEffect(() => {
    const fetchBank = async () => {
      try {
        const banks = await ListBank();
        if (banks && banks.length > 0) {
          setPromptPay(banks[0].PromptPay);
          setMinimum(banks[0].Minimum);
          setCoinAmount(banks[0].Minimum);
          setTotalAmount(banks[0].Minimum);
        }
      } catch {
        message.error("ไม่สามารถโหลดข้อมูลธนาคารได้");
      }
    };
    fetchBank();
  }, []);

  // โหลดผู้ใช้
  useEffect(() => {
    const storedUserID = localStorage.getItem("userid");
    if (storedUserID) {
      const uid = Number(storedUserID);
      setUserID(uid);
      getUserByID(uid)
        .then((user) => {
          if (user) setUserCoin(user.Coin!);
        })
        .catch(() => message.error("ไม่สามารถโหลดข้อมูล Coin ได้"));
    }
  }, []);

  // สร้าง QR จาก PromptPay + amount
  useEffect(() => {
    if (promptPay && totalAmount >= minimum) {
      const payload = generatePayload(promptPay, { amount: totalAmount });
      setQrCode(payload);
    } else {
      setQrCode("");
    }
  }, [promptPay, totalAmount, minimum]);

  // อัปโหลด
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setUploadedFile(e.target.files[0]);
  };
  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ส่งหลักฐาน + บันทึกธุรกรรม + อัปเดตเหรียญ
  const handleSubmit = async () => {
    if (!uploadedFile || totalAmount < minimum || coinAmount < minimum) {
      message.warning(`กรุณาใส่จำนวนขั้นต่ำ ${minimum} บาท และอัปโหลดสลิปก่อน`);
      return;
    }
    try {
      setLoading(true);
      const result = await uploadSlipOK(uploadedFile);
      if (!result) {
        message.error("ส่งหลักฐานล้มเหลว");
        setLoading(false);
        return;
      }

      const paymentCoin = {
        Date: new Date().toISOString(),
        Amount: coinAmount,
        ReferenceNumber: "REF" + Date.now(),
        Picture: uploadedFile,
        UserID: userID,
      };
      const paymentResult = await CreatePaymentCoin(paymentCoin);
      if (!paymentResult) {
        message.error("บันทึกธุรกรรมล้มเหลว");
        setLoading(false);
        return;
      }

      const newTotalCoin = userCoin + coinAmount;
      const updateResult = await UpdateCoin({ user_id: userID, coin: newTotalCoin });
      if (!updateResult) {
        message.error("อัปเดต Coin ล้มเหลว");
        setLoading(false);
        return;
      }

      message.success(`เติม Coin สำเร็จ (รวม ${newTotalCoin.toFixed(2)} Coin)`);
      setTimeout(() => {
        setUserCoin(newTotalCoin);
        setCoinAmount(minimum);
        setTotalAmount(minimum);
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        navigate("/user");
        setLoading(false);
      }, 1200);
    } catch {
      message.error("เกิดข้อผิดพลาดในการส่งหลักฐาน");
      setLoading(false);
    }
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const canSubmit = !!uploadedFile && coinAmount >= minimum && !loading;

  return (
    <div className="min-h-screen bg-white">
      {/* Header น้ำเงินโค้งมน (เข้าชุดหน้าอื่น) */}
      <header
        className="sticky top-0 z-20 bg-blue-600 text-white rounded-b-2xl shadow-md overflow-hidden"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            aria-label="ย้อนกลับ"
            className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold tracking-wide">เติม Coin (PromptPay)</span>
          </div>
        </div>
      </header>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
          <LoadingAnimation />
        </div>
      )}

      {/* Content */}
      <main className="mx-auto max-w-screen-sm px-4 pb-28 pt-4">
        {/* Summary capsule */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
          <div className="text-sm text-blue-900">ยอดที่จะชำระ</div>
          <div className="text-xl font-bold text-blue-700">฿{totalAmount.toFixed(2)}</div>
        </div>

        {/* Card หลัก: QR + Input + Upload */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          {/* QR */}
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
                  กรุณาใส่จำนวนเงิน (ขั้นต่ำ {minimum} บาท)
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              จำนวน Coin ที่ต้องการเติม <span className="text-red-500">*</span>
            </label>
            <div className="rounded-xl border border-gray-200 p-2">
              <InputNumber
                min={minimum}
                value={coinAmount}
                onChange={(value) => {
                  const val = Number(value);
                  setCoinAmount(val);
                  setTotalAmount(val);
                }}
                className="w-full"
              />
            </div>
            {coinAmount < minimum && (
              <div className="text-red-500 text-xs mt-1">จำนวนขั้นต่ำ {minimum} บาท</div>
            )}
          </div>

          {/* Upload Slip */}
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">อัปโหลดสลิปชำระเงิน</h2>

            {uploadedFile ? (
              <div className="relative mb-2 flex justify-center border border-gray-200 rounded-xl p-2 bg-white">
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
                className="mb-2 flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-xl py-10 text-gray-500 cursor-pointer select-none"
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

            {/* ปุ่มสำรองในการ์ด (ซ่อนไว้ เพราะใช้ปุ่มใหญ่ที่ Bottom Bar) */}
            <div className="hidden">
              <button
                onClick={handleUploadClick}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition"
              >
                <FaUpload />
                อัปโหลดสลิป
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-white transition
                ${canSubmit ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800" : "bg-blue-300 cursor-not-allowed"}`}
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

      {/* Sticky Bottom Bar: ปุ่มใหญ่ กดง่ายบนมือถือ */}
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
            disabled={!canSubmit}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-white transition
              ${
                canSubmit
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:from-blue-800 active:to-blue-700"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            aria-busy={canSubmit ? loading : undefined}
          >
            <FaPaperPlane />
            <span className="text-sm font-semibold">ส่งหลักฐาน</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMoneyCoin;
