import React, { useState, useEffect } from "react";
import EVMapDesktop from "./notebook";
import EVMapMobile from "./phone";

/**
 * Component หลักที่ตรวจจับขนาดหน้าจอ
 * แล้วสลับระหว่าง EVMapDesktop และ EVMapMobile
 */
const Index: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // ตรวจจับการเปลี่ยนขนาดหน้าจอ
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // เรียกครั้งแรกตอน mount
    handleResize();

    // ฟัง event resize
    window.addEventListener("resize", handleResize);

    // cleanup ตอน unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <>{isMobile ? <EVMapMobile /> : <EVMapDesktop />}</>;
};

export default Index;
