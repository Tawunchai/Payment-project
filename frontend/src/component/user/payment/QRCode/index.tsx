import React, { useEffect, useState } from "react";

const apiUrl = "http://localhost:8000";

interface PromptPayChargeResponse {
  id: string;
  source: {
    scannable_code: {
      image: {
        download_uri: string;
      };
    };
  };
}

const PromptPayPayment: React.FC = () => {
  const [amount] = useState(100); // บาท
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!chargeId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/api/status/${chargeId}`);
        const data = await res.json();

        if (data.status === "successful") {
          setPaymentStatus("✅ ชำระเงินเรียบร้อยแล้ว");
          clearInterval(interval);
        } else if (data.status === "failed" || data.status === "expired") {
          setPaymentStatus("❌ ชำระเงินไม่สำเร็จ หรือหมดเวลา");
          clearInterval(interval);
        } else {
          setPaymentStatus("🕐 รอการชำระเงิน...");
        }
      } catch (error) {
        setPaymentStatus("❌ ไม่สามารถตรวจสอบสถานะได้");
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chargeId]);

  const createPromptPayCharge = async (): Promise<PromptPayChargeResponse | null> => {
    setLoading(true);
    setPaymentStatus(null);

    try {
      const res = await fetch(`${apiUrl}/api/create-promptpay-charge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) throw new Error("สร้าง QR ไม่สำเร็จ");

      const data = (await res.json()) as PromptPayChargeResponse;

      setQrImage(data.source.scannable_code.image.download_uri);
      setChargeId(data.id);

      return data;
    } catch (error) {
      alert("❌ ไม่สามารถสร้าง QR Code ได้");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!chargeId) return;
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/confirm-charge/${chargeId}`, { method: "POST" });
      if (!res.ok) throw new Error("ยืนยันไม่สำเร็จ");
      setPaymentStatus("🕐 รอการตรวจสอบสถานะ...");
    } catch (error) {
      alert("❌ ไม่สามารถยืนยันการชำระเงินได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>💰 ชำระผ่าน PromptPay</h2>
      <button onClick={createPromptPayCharge} disabled={loading} style={{ marginBottom: 20 }}>
        {loading ? "กำลังสร้าง QR..." : "สร้าง QR Code PromptPay"}
      </button>

      {qrImage && (
        <div>
          <h3>📱 สแกน QR เพื่อชำระเงิน</h3>
          <img src={qrImage} alt="PromptPay QR Code" style={{ width: 300, marginBottom: 20 }} />
          <button onClick={confirmPayment} disabled={loading}>
            {loading ? "กำลังยืนยัน..." : "✅ ยืนยันว่าชำระเงินแล้ว"}
          </button>
        </div>
      )}

      {paymentStatus && (
        <div style={{ marginTop: 15, fontWeight: "bold", color: paymentStatus.includes("✅") ? "green" : "red" }}>
          {paymentStatus}
        </div>
      )}
    </div>
  );
};

export default PromptPayPayment;
