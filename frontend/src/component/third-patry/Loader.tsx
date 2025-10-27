import React, { useEffect, useState } from "react";

const Loader: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 3000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "#ffffff",
      }}
    >
      {/* ⚡ โลโก้ EV */}
      <div
        style={{
          fontSize: "clamp(50px, 8vw, 100px)",
          marginBottom: "20px", // ✅ ขยับขึ้นมาใกล้ก้อนฟ้า
          animation: "float 2.4s ease-in-out infinite",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          fontWeight: 700,
          letterSpacing: "1px",
          userSelect: "none",
        }}
      >
        ⚡
        <span
          style={{
            background:
              "linear-gradient(90deg, #0284c7, #22d3ee, #06b6d4, #67e8f9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto",
            animation: "shine 4s linear infinite",
          }}
        >
          EV
        </span>
      </div>

      {/* 🔵 จุดพลังงานฟ้า */}
      <div
        style={{
          display: "flex",
          gap: "24px", // ✅ เพิ่มช่องว่างระหว่างก้อน
          justifyContent: "center",
          alignItems: "center",
          marginTop: "-8px", // ✅ ขยับขึ้นใกล้โลโก้
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "clamp(10px, 2vw, 16px)",
              height: "clamp(10px, 2vw, 16px)",
              borderRadius: "50%",
              background:
                "linear-gradient(180deg, #38bdf8 0%, #0ea5e9 60%, #06b6d4 100%)",
              boxShadow: "0 0 12px rgba(14,165,233,0.25)",
              animation: "bounce 1.6s ease-in-out infinite",
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}
      </div>

      {/* 🔹 Animation Keyframes */}
      <style>
        {`
          @keyframes float {
            0%   { transform: translateY(0px); }
            50%  { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); opacity: 0.6; }
            50% { transform: translateY(-10px); opacity: 1; }
          }

          @keyframes shine {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }

          @media (max-width: 768px) {
            div[style*="flex-direction: column"] {
              background: #ffffff;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Loader;
