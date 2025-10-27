import { useEffect, useState } from "react";

const Index = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // ฟังการเปลี่ยนแปลงของขนาดหน้าจอ
    window.addEventListener("resize", handleResize);

    // ล้าง event listener เมื่อ component ถูก unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f4ff",
        color: "#333",
        fontFamily: "sans-serif",
      }}
    >
      <h1>📱 ขนาดหน้าจอปัจจุบัน</h1>
      <h2>
        {screenSize.width} × {screenSize.height} px
      </h2>
    </div>
  );
};

export default Index;
