import React from "react";
import { FaBolt } from "react-icons/fa";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <div
      className="px-5 pb-6"
      style={{ paddingBottom: "max(18px, env(safe-area-inset-bottom))" }}
    >
      {/* พื้นหลังฟ้าไล่เฉดนิด ๆ */}
      <div className="mx-auto max-w-xl rounded-3xl p-1 bg-gradient-to-br from-blue-600/20 to-blue-400/10">
        {/* การ์ดแก้ว (glassmorphism) ทรง pill */}
        <footer
          className="
            rounded-2xl
            bg-white/70 backdrop-blur-xl
            dark:bg-[#0b1220]/70
            border border-white/60 dark:border-white/10
            shadow-[0_6px_24px_rgba(30,64,175,0.18)]
          "
          aria-label="EV FastCharge footer"
        >
          <div className="flex items-center justify-between px-4 py-3">
            {/* โลโก้ไอคอนในแคปซูลน้ำเงิน */}
            <span
              className="
                inline-flex h-9 w-9 items-center justify-center rounded-xl
                bg-gradient-to-br from-blue-600 to-blue-500 text-white
                shadow-[0_6px_16px_rgba(37,99,235,0.35)]
              "
            >
              <FaBolt className="text-base" aria-hidden />
            </span>

            {/* ข้อความกลาง */}
            <p className="text-[13px] sm:text-sm font-medium text-gray-800 dark:text-gray-100 text-center flex-1 mx-3">
              Powered by{" "}
              <span className="text-blue-700 dark:text-blue-400 font-semibold">
                EV FastCharge
              </span>
            </p>

            {/* แท็กปีแบบชิป */}
            <span
              className="
                px-2.5 py-1 rounded-lg text-[11px] font-semibold
                text-blue-700 bg-blue-50
                dark:text-blue-300 dark:bg-blue-900/30
                border border-blue-100 dark:border-blue-800/40
              "
            >
              © {year}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
