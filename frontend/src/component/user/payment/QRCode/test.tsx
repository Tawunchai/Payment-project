import React, { useRef, useEffect, useState } from "react";
import { FaPaypal, FaUpload, FaPaperPlane, FaTimes } from "react-icons/fa";
import { message, QRCode, Image } from "antd";
import generatePayload from "promptpay-qr";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadSlipOK, CreatePayment, CreateEVChargingPayment } from "../../../../services/index";
import { FileImageOutlined } from "@ant-design/icons";

const PayPalCard: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const location = useLocation();
  const { totalAmount, userID, chargers, MethodID } = location.state || {};
  const amountNumber = Number(totalAmount) || 0;
  console.log(userID)
  console.log(chargers)
  console.log(MethodID)

  const navigate = useNavigate();

  useEffect(() => {
    const phoneNumber = "0935096372";
    if (amountNumber > 0) {
      const payload = generatePayload(phoneNumber, { amount: amountNumber });
      setQrCode(payload);
    } else {
      setQrCode("");
    }
  }, [amountNumber]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // แก้ไข: แค่เก็บไฟล์ไว้ใน state ไม่เรียก uploadSlip ที่นี่
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      message.warning("กรุณาอัปโหลดสลิปก่อนส่ง");
      return;
    }

    try {
      const result = await uploadSlipOK(uploadedFile);
      console.log(result)
      if (result) {
        message.success("ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว");

        // สร้าง Payment object
        const paymentData = {
          date: new Date().toISOString(),
          amount: Number(totalAmount),
          user_id: 1,
          method_id: MethodID,
        };

        // สร้าง Payment
        const paymentResult = await CreatePayment(paymentData);

        if (paymentResult && paymentResult.ID) {
          message.success("สร้าง Payment เรียบร้อยแล้ว");

          // ถ้า chargers เป็น array ให้ loop สร้าง EVChargingPayment ทีละตัว
          if (Array.isArray(chargers)) {
            for (const charger of chargers) {
              // สมมุติ charger มี ID, power, total
              const evChargingPaymentData = {
                evcharging_id: charger.id,
                payment_id: paymentResult.ID,
                price: charger.total,
                quantity: charger.power,
              };

              console.log(evChargingPaymentData)

              const evPaymentResult = await CreateEVChargingPayment(evChargingPaymentData);
              if (evPaymentResult) {
                console.log("สร้าง EVChargingPayment เรียบร้อย", evPaymentResult);
              } else {
                message.error(`สร้าง EVChargingPayment สำหรับ charger ${charger.name} ล้มเหลว`);
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
        }, 2000);
      } else {
        message.error("ส่งหลักฐานล้มเหลว");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการส่งหลักฐาน");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-md border border-gray-300 w-full max-w-5xl p-6 md:p-8 md:gap-12 gap-6">

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2">
          <div className="border-2 border-dashed border-gray-400 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mb-4 text-center text-xs text-gray-500 leading-tight">
            YOUR LOGO
            <br />
            HERE
          </div>

          <div className="flex items-center gap-2 mb-4">
            <FaPaypal className="text-blue-600 text-2xl md:text-3xl" />
            <span className="text-lg md:text-xl font-bold text-gray-700">PromptPay</span>
          </div>

          <div className="p-3 bg-white rounded-lg shadow-md">
            {qrCode ? (
              <QRCode value={qrCode} size={180} errorLevel="H" />
            ) : (
              <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
                กำลังสร้าง QR Code...
              </div>
            )}
          </div>

          <p className="text-center text-gray-600 mt-4 font-medium tracking-wide">
            SCAN ME TO PAY
            <br />
            <span className="text-orange-600 text-xl md:text-2xl font-semibold">
              ฿{totalAmount}
            </span>
          </p>
        </div>

        {/* Upload Slip Section */}
        <div className="flex flex-col justify-center w-full md:w-1/2 max-w-md mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center">
            Upload Payment Slip
          </h2>

          {uploadedFile ? (
            <div className="relative mb-4 flex justify-center border border-gray-300 rounded-lg shadow-sm p-2 bg-white">
              <Image
                src={URL.createObjectURL(uploadedFile)}
                alt="Preview slip"
                style={{ maxHeight: 220, maxWidth: "100%", objectFit: "contain", borderRadius: 8 }}
                placeholder
                preview={{ maskClassName: "rounded-lg" }}
              />
              <button
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition"
                aria-label="Remove uploaded file"
                title="ลบสลิปที่อัปโหลด"
                type="button"
              >
                <FaTimes size={14} />
              </button>
            </div>
          ) : (
            <div className="mb-4 flex flex-col justify-center items-center border-2 border-dashed border-gray-400 rounded-lg py-12 text-gray-400 cursor-pointer select-none">
              <FileImageOutlined style={{ fontSize: 48, marginBottom: 12 }} />
              <p className="text-base font-medium">ยังไม่มีสลิปที่อัปโหลด</p>
              <p className="text-sm mt-1 text-gray-500 text-center px-2">
                คลิกปุ่มด้านล่างเพื่ออัปโหลดสลิปของคุณ
              </p>
            </div>
          )}

          <button
            onClick={handleUploadClick}
            className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium text-lg mb-3"
          >
            <FaUpload />
            อัปโหลดสลิป
          </button>

          <button
            onClick={handleSubmit}
            disabled={!uploadedFile}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-medium text-lg transition mb-2 ${uploadedFile
              ? "bg-green-600 hover:bg-green-700 cursor-pointer"
              : "bg-green-300 cursor-not-allowed"
              }`}
          >
            <FaPaperPlane />
            ส่งหลักฐานการชำระเงิน
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default PayPalCard;
