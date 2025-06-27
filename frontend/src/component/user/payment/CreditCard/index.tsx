import React, { useEffect, useState } from "react";
import { createCharge } from "../../../../services";

declare global {
  interface Window {
    Omise: any;
  }
}

const OMISE_PUBLIC_KEY = "pkey_test_6464ej3d1gj003g26k9";

const loadOmiseScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Omise) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.omise.co/omise.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("โหลด Omise.js ไม่สำเร็จ"));
    document.body.appendChild(script);
  });
};

const PaymentPage: React.FC = () => {
  const [form, setForm] = useState({
    card_name: "",
    card_number: "",
    card_exp_month: "",
    card_exp_year: "",
    card_cvv: "",
    country: "Thailand",
  });

  const [amount] = useState(100); // 100 บาท (หน่วยเป็นสตางค์)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOmiseScript().then(() => {
      window.Omise.setPublicKey(OMISE_PUBLIC_KEY);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cardData = {
      name: form.card_name,
      number: form.card_number,
      expiration_month: parseInt(form.card_exp_month),
      expiration_year: parseInt(form.card_exp_year),
      security_code: form.card_cvv,
    };

    window.Omise.createToken("card", cardData, async (status: number, response: any) => {
      if (status === 200) {
        const token = response.id;

        const result = await createCharge({ amount, token });

        if (result) {
          alert("✅ ชำระเงินสำเร็จ");
        } else {
          alert("❌ ชำระเงินล้มเหลว");
        }
      } else {
        console.error("❌ สร้าง Token ไม่สำเร็จ", response.message);
        alert("❌ สร้าง Token ไม่สำเร็จ");
      }

      setIsLoading(false);
    });
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "30px", border: "1px solid #ccc", borderRadius: "10px", backgroundColor: "#fdfdfd" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>💳 ชำระเงินด้วยบัตรเครดิต</h2>
      <form autoComplete="off" onSubmit={handlePay}>
        <div style={{ marginBottom: 15 }}>
          <label>Card Number</label>
          <input
            type="tel"
            name="card_number"
            placeholder="4242 4242 4242 4242"
            value={form.card_number}
            onChange={handleInputChange}
            style={inputStyle}
            inputMode="numeric"
            autoComplete="off"
            required
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Name on Card</label>
          <input
            type="text"
            name="card_name"
            placeholder="John Doe"
            value={form.card_name}
            onChange={handleInputChange}
            style={inputStyle}
            autoComplete="off"
            required
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: 15 }}>
          <div style={{ flex: 1 }}>
            <label>Expiry Month (MM)</label>
            <input
              type="tel"
              name="card_exp_month"
              placeholder="12"
              value={form.card_exp_month}
              onChange={handleInputChange}
              style={inputStyle}
              inputMode="numeric"
              autoComplete="off"
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Expiry Year (YYYY)</label>
            <input
              type="tel"
              name="card_exp_year"
              placeholder="2030"
              value={form.card_exp_year}
              onChange={handleInputChange}
              style={inputStyle}
              inputMode="numeric"
              autoComplete="off"
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Security Code (CVV)</label>
          <input
            type="tel"
            name="card_cvv"
            placeholder="123"
            value={form.card_cvv}
            onChange={handleInputChange}
            style={inputStyle}
            inputMode="numeric"
            autoComplete="off"
            required
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Country</label>
          <select name="country" value={form.country} onChange={handleInputChange} style={{ ...inputStyle, padding: "8px" }}>
            <option value="Thailand">Thailand</option>
            <option value="Singapore">Singapore</option>
            <option value="Japan">Japan</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading} style={{ ...buttonStyle, backgroundColor: isLoading ? "#ccc" : "#28a745" }}>
          {isLoading ? "กำลังชำระเงิน..." : "💸 ชำระเงิน"}
        </button>
      </form>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "16px",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  fontSize: "16px",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default PaymentPage;
