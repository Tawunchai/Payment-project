import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/picture/Direct_Energy_logo.svg.png";
import product1 from "../../../assets/admin/product1.jpg";
import product2 from "../../../assets/admin/product2.jpg";
import qrpayment from "../../../assets/PromptPay-logo.png";
import { Divider } from "antd";

const Index = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card">("qr");

  const handlePayment = () => {
    if (paymentMethod === "qr") {
      navigate("/user/payment-by-qrcode");
    } else {
      navigate("/user/credit-card");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 text-gray-800">
      <img src={logo} style={{ width: "150px" }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ซ้าย */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">สรุปรายการคำสั่งซื้อ</h1>
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="bg-purple-100 text-orange-700 text-sm font-medium px-2 py-1 rounded">ใบเสร็จรับเงิน</span>
                <p className="mt-1 text-sm">Tawunchai Burakhon tawunchaien@gmail.com</p>
              </div>
              <button className="text-orange-600 hover:underline text-sm">แก้ไขข้อมูล</button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mt-6">รายการสั่งซื้อ</h2>
            <div className="border rounded-lg p-4 space-y-4">
              {/* รายการสินค้า */}
              <div className="flex gap-4">
                <img src={product1} alt="Course" className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">ก้าวสู่อาชีพ Project Manager : บทสัมภาษณ์จริงจากบุคคลที่อยู่ในแวดวง</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-orange-700 font-bold">฿1000.00</span>
                  </div>
                </div>
              </div>
              <Divider className="!my-2" />
              <div className="flex gap-4">
                <img src={product2} alt="Course" className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">ก้าวสู่อาชีพ Project Manager : บทสัมภาษณ์จริงจากบุคคลที่อยู่ในแวดวง</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-orange-700 font-bold">฿1000.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ขวา */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold">สรุปยอดที่ต้องชำระ</h2>
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between text-lg font-bold text-orange-700">
              <span>ยอดชำระทั้งหมด</span>
              <span>฿2000.00</span>
            </div>
          </div>

          {/* วิธีชำระเงิน */}
          <div className="border rounded-lg p-4 space-y-6">
            <h3 className="font-semibold text-sm">เลือกวิธีการชำระเงิน</h3>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "qr"}
                onChange={() => setPaymentMethod("qr")}
              />
              <span className="text-sm">QR Payment</span>
              <img src={qrpayment} className="h-9" alt="PromptPay" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              <span className="text-sm">บัตรเครดิต / เดบิต</span>
              <div className="flex gap-1">
                <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-4" alt="Visa" />
                <img src="https://img.icons8.com/color/48/000000/mastercard-logo.png" className="h-4" alt="Mastercard" />
                <img src="https://img.icons8.com/color/48/000000/jcb.png" className="h-4" alt="JCB" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              โดยการสั่งซื้อนี้ถือว่าคุณยอมรับใน <span className="underline">ข้อตกลงการใช้บริการ</span> และ <span className="underline">นโยบายการคืนเงิน</span> เรียบร้อยแล้ว
            </p>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-orange-700 text-white py-2 rounded text-lg mt-2 hover:bg-orange-800 transition"
          >
            ชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
