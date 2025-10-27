import React, { useEffect, useState, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import qrpayment from "../../../assets/PromptPay-logo.png";
import { Divider, Button, message } from "antd";
import {
  getUserByID,
  UpdateCoin,
  ListMethods,
  CreatePayment,
  CreateEVChargingPayment,
  apiUrlPicture,
} from "../../../services";
import { UsersInterface } from "../../../interface/IUser";
import { MethodInterface } from "../../../interface/IMethod";

// ================== UI helpers ==================
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-base font-semibold text-gray-900">{children}</h2>
);

const SmallNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-gray-500">{children}</p>
);

// EV bolt icon (minimal)
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

// ================== Radio ==================
interface PaymentRadioProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
}
const PaymentRadio = memo(({ id, name, checked, onChange, label }: PaymentRadioProps) => (
  <label
    htmlFor={id}
    className={`flex items-center justify-between gap-3 rounded-xl border p-3 cursor-pointer transition
    ${checked ? "border-blue-500 ring-1 ring-blue-500/50 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
  >
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full border 
        ${checked ? "border-blue-600" : "border-gray-300"}`}
      >
        <span className={`h-2 w-2 rounded-full ${checked ? "bg-blue-600" : "bg-transparent"}`} />
      </span>
      <div className="text-sm">{label}</div>
    </div>
    <input
      type="radio"
      id={id}
      name={name}
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
  </label>
));

// ================== Page ==================
const Index: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { chargers } = location.state || { chargers: [] as any[] };

  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card">("qr");
  const [user, setUser] = useState<UsersInterface | null>(null);
  const [qrMethod, setQRMethod] = useState<MethodInterface | null>(null);
  const [coinMethod, setCoinMethod] = useState<MethodInterface | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingMethod, setIsLoadingMethod] = useState(true);

  const totalAmount = chargers.reduce((sum: number, item: any) => sum + (item?.total || 0), 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userID = Number(localStorage.getItem("userid"));
        if (userID) {
          const userRes = await getUserByID(userID);
          if (userRes) setUser(userRes);
        }

        const methodRes = await ListMethods();
        if (methodRes) {
          const qr = methodRes.find((m: MethodInterface) =>
            m.Medthod?.toLowerCase().includes("qr")
          );
          const coin = methodRes.find((m: MethodInterface) =>
            m.Medthod?.toLowerCase().includes("coin")
          );

          setQRMethod(qr || null);
          setCoinMethod(coin || null);
          setPaymentMethod(qr ? "qr" : "card");
        }
      } catch {
        message.error("โหลดข้อมูลล้มเหลว");
      } finally {
        setIsLoadingMethod(false);
      }
    };

    fetchData();
  }, []);

  const handlePayment = async () => {
    if (!user) return;

    const selectedMethod = paymentMethod === "qr" ? qrMethod : coinMethod;

    // ชำระแบบ QR
    if (paymentMethod === "qr") {
      if (!selectedMethod?.ID) {
        message.error("ไม่พบ Method สำหรับ QR");
        return;
      }
      navigate("/user/payment-by-qrcode", {
        state: {
          totalAmount: totalAmount.toFixed(2),
          userID: user.ID!,
          chargers,
          MethodID: selectedMethod.ID,
        },
      });
      return;
    }

    // ชำระแบบ Coin
    if (!coinMethod?.ID) {
      message.error("ไม่พบ Method สำหรับ Coin");
      return;
    }
    if ((user.Coin || 0) < totalAmount) {
      message.error("จำนวน Coin ของคุณไม่เพียงพอ กรุณาเติม Coin ก่อน");
      return;
    }

    try {
      setIsProcessing(true);

      const updatedCoin = (user.Coin || 0) - totalAmount;
      const result = await UpdateCoin({ user_id: user.ID!, coin: updatedCoin });

      if (!result) {
        message.error("การหัก Coin ล้มเหลว");
        setIsProcessing(false);
        return;
      }

      message.success("ชำระเงินด้วย Coin สำเร็จแล้ว");

      // บันทึก Payment
      const paymentData = {
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        amount: Number(totalAmount),
        user_id: user.ID!,
        method_id: coinMethod.ID!,
        reference_number: "",
        picture: null,
      };
      const paymentResult = await CreatePayment(paymentData);

      if (!paymentResult || !paymentResult.ID) {
        message.error("สร้าง Payment ล้มเหลว");
        setIsProcessing(false);
        return;
      }

      // ผูก EVChargingPayment (ตามรายการ chargers)
      if (Array.isArray(chargers)) {
        for (const charger of chargers) {
          const evChargingPaymentData = {
            evcharging_id: charger.id,
            payment_id: paymentResult.ID,
            price: charger.total,
            quantity: charger.power,
          };
          await CreateEVChargingPayment(evChargingPaymentData);
        }
      }

      // ✅ เปลี่ยนปลายทางตามที่คุณต้องการ
      setTimeout(() => {
        navigate("/user/after-payment");
        setIsProcessing(false);
      }, 800);
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดระหว่างชำระเงิน");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header
        className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-b-2xl shadow-md overflow-hidden"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="w-full px-4 py-3 flex items-center gap-2 justify-start">
          <button
            onClick={() => window.history.back()}
            aria-label="ย้อนกลับ"
            className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M15 18l-6-6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5 text-white"
            >
              <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
            </svg>
            <span className="text-sm md:text-base font-semibold tracking-wide">
              EV Payments
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-screen-sm px-4 pb-28 pt-4">
        {/* สรุปยอดบนสุด (mobile-first) */}
        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-900">ยอดชำระทั้งหมด</span>
            <span className="text-xl font-bold text-blue-700">฿{totalAmount.toFixed(2)}</span>
          </div>
          <SmallNote>ตรวจสอบรายการก่อนชำระเงิน</SmallNote>
        </div>

        {/* รายการสั่งซื้อ */}
        <section className="mb-6">
          <SectionTitle>รายการสั่งซื้อ</SectionTitle>
          <div className="mt-3 rounded-2xl border border-gray-100">
            {chargers.map((item: any, index: number) => (
              <div key={index} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={`${apiUrlPicture}${item.picture}`}
                    alt={item.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-gray-500">กำลังไฟ: {item.power}</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">
                    ฿{Number(item.total || 0).toFixed(2)}
                  </span>
                </div>
                {index < chargers.length - 1 && <Divider className="!my-3" />}
              </div>
            ))}
            {chargers.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">ไม่มีรายการ</div>
            )}
          </div>
        </section>

        {/* เลือกวิธีชำระเงิน */}
        <section className="mb-6">
          <SectionTitle>วิธีการชำระเงิน</SectionTitle>
          <div className="mt-3 space-y-3">
            {isLoadingMethod ? (
              <p className="text-sm text-gray-500">กำลังโหลดวิธีการชำระเงิน...</p>
            ) : (
              <>
                {qrMethod && (
                  <PaymentRadio
                    id="payment-qr"
                    name="payment"
                    checked={paymentMethod === "qr"}
                    onChange={() => setPaymentMethod("qr")}
                    label={
                      <div className="flex items-center gap-2">
                        <span>{qrMethod.Medthod}</span>
                        <img src={qrpayment} className="h-5" alt="PromptPay" />
                      </div>
                    }
                  />
                )}

                {coinMethod && (
                  <PaymentRadio
                    id="payment-coin"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    label={
                      <div className="flex items-center gap-2">
                        <span>{coinMethod.Medthod}</span>
                        {user && (
                          <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            คุณมี {(user.Coin || 0).toFixed(2)} Coin
                          </span>
                        )}
                      </div>
                    }
                  />
                )}

                {!qrMethod && !coinMethod && (
                  <p className="text-sm text-gray-500">ยังไม่มีวิธีการชำระเงินที่พร้อมใช้งาน</p>
                )}
              </>
            )}

            {paymentMethod === "card" && user && (user.Coin || 0) < totalAmount && (
              <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                <p className="text-sm font-medium">⚠️ Coin ไม่เพียงพอ</p>
                <div className="mt-1">
                  <Button
                    type="link"
                    onClick={() => navigate("/user/my-coins")}
                    className="px-0 text-blue-600"
                  >
                    ไปหน้าเติม Coin
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Sticky Pay Bar (mobile-friendly) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-screen-sm items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-gray-500">ยอดสุทธิ</span>
            <span className="text-lg font-bold text-blue-700">฿{totalAmount.toFixed(2)}</span>
          </div>
          <button
            onClick={handlePayment}
            disabled={isProcessing || isLoadingMethod || chargers.length === 0}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-white transition
            ${isProcessing || isLoadingMethod || chargers.length === 0
                ? "bg-blue-300"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"}`}
          >
            <BoltIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold">
              {isProcessing ? "กำลังประมวลผล..." : "ชำระเงิน"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
