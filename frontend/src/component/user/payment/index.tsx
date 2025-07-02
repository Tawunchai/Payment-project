import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/picture/Direct_Energy_logo.svg.png";
import qrpayment from "../../../assets/PromptPay-logo.png";
import { Divider, Button, message } from "antd";
import { getUserByID, UpdateCoin } from "../../../services";
import { UsersInterface } from "../../../interface/IUser";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { chargers } = location.state || { chargers: [] };
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card">("qr");
  const [user, setUser] = useState<UsersInterface | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = chargers.reduce(
    (sum: number, item: any) => sum + item.total,
    0
  );

  useEffect(() => {
    const userID = Number(localStorage.getItem("userid"));
    if (userID) {
      getUserByID(userID).then((res) => {
        if (res) setUser(res);
      });
    }
  }, []);

  const handlePayment = async () => {
    if (!user) return;

    if (paymentMethod === "qr") {
      navigate("/user/payment-by-qrcode", {
        state: { totalAmount: totalAmount.toFixed(2), userID: user.ID },
      });
    } else {
      if (user.Coin! < totalAmount) {
        message.error("จำนวน Coin ของคุณไม่เพียงพอ กรุณาเติม Coin ก่อน");
        return;
      }

      setIsProcessing(true);
      const updatedCoin = user.Coin! - totalAmount;

      if (!user?.ID) {
        message.error("ไม่สามารถอัปเดต Coin ได้: ไม่พบข้อมูลผู้ใช้");
        setIsProcessing(false);
        return;
      }

      const result = await UpdateCoin({ user_id: user.ID, coin: updatedCoin });
      if (result) {
        message.success("ชำระเงินด้วย Coin สำเร็จแล้ว");
        setTimeout(() => {
          setIsProcessing(false);
          navigate("/user/charging");
        }, 2500);
      } else {
        message.error("การหัก Coin ล้มเหลว");
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 text-gray-800">
      <img src={logo} style={{ width: "150px" }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ซ้าย: รายละเอียดคำสั่งซื้อ */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">สรุปรายการคำสั่งซื้อ</h1>

          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="bg-purple-100 text-orange-700 text-sm font-medium px-2 py-1 rounded">
                  ใบเสร็จรับเงิน
                </span>
                <p className="mt-1 text-sm">
                  {user?.FirstName} {user?.LastName} - {user?.Email}
                </p>
              </div>
              <button className="text-orange-600 hover:underline text-sm">
                แก้ไขข้อมูล
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mt-6">รายการสั่งซื้อ</h2>
            <div className="border rounded-lg p-4 space-y-4">
              {chargers.map((item: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-center gap-4">
                    <img
                      src={`http://localhost:8000/${item.picture}`}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-600">
                        กำลังไฟ: {item.power}
                      </p>
                    </div>
                    <span className="text-orange-700 font-bold">
                      ฿{item.total.toFixed(2)}
                    </span>
                  </div>
                  {index < chargers.length - 1 && <Divider className="!my-2" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ขวา: สรุปและเลือกการชำระเงิน */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold">สรุปยอดที่ต้องชำระ</h2>
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between text-lg font-bold text-orange-700">
              <span>ยอดชำระทั้งหมด</span>
              <span>฿{totalAmount.toFixed(2)}</span>
            </div>
          </div>

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
              <span className="text-sm">Coin</span>
              {user && (
                <span className="text-xs text-yellow-700 font-semibold bg-yellow-100 border border-yellow-400 px-2 py-0.5 rounded-full">
                  คุณมี {user.Coin!.toFixed(2)} Coin
                </span>
              )}
            </div>

            {/* ข้อความเตือนกรณี Coin ไม่พอ */}
            {paymentMethod === "card" && user && user.Coin! < totalAmount && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                <p className="text-sm font-medium flex items-center gap-2">
                  ⚠️ <span>จำนวน Coin ของคุณไม่เพียงพอ กรุณาเติม Coin ก่อน</span>
                </p>
                <div className="mt-2">
                  <Button
                    type="link"
                    onClick={() => navigate("/user/my-coins")}
                    className="text-blue-600 px-0 font-semibold"
                  >
                    👉 ไปหน้าเติม Coin
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-600 mt-2">
              โดยการสั่งซื้อนี้ถือว่าคุณยอมรับใน{" "}
              <span className="underline">ข้อตกลงการใช้บริการ</span> และ{" "}
              <span className="underline">นโยบายการคืนเงิน</span> เรียบร้อยแล้ว
            </p>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-orange-700 text-white py-2 rounded text-lg mt-2 hover:bg-orange-800 transition disabled:opacity-50"
          >
            {isProcessing ? "กำลังประมวลผล..." : "ชำระเงิน"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
