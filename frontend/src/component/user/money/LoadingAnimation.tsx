import React from "react";
import { FaMoneyBillWave } from "react-icons/fa";

const SlipCheckingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 select-none">
      {/* Neon glowing ring with rotating gradient */}
      <div className="relative w-36 h-36 flex items-center justify-center animate-float">
        {/* Outer glowing ring */}
        <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-green-400 via-green-500 to-green-300 opacity-60 filter blur-xl animate-spin-slow"></div>

        {/* Middle glowing ring with gradient light sweep */}
        <div className="absolute w-28 h-28 rounded-full border-4 border-transparent border-t-green-400 border-r-green-300 border-b-green-400 border-l-green-300 animate-spin-fast opacity-90"></div>

        {/* Inner soft glow */}
        <div className="absolute w-24 h-24 rounded-full bg-green-300 opacity-40 blur-md"></div>

        {/* Icon */}
        <FaMoneyBillWave
          style={{
            fontSize: 90,
            color: "#166534", // green-700 deep
            filter:
              "drop-shadow(0 0 6px #4ade80) drop-shadow(0 0 12px #22c55e)",
          }}
        />
      </div>

      {/* Shimmering gradient text */}
      <p className="text-3xl font-extrabold bg-gradient-to-r from-green-400 via-green-500 to-green-400 bg-clip-text text-transparent animate-shimmer-glow-green drop-shadow-lg">
        กำลังตรวจสอบสลิป...
      </p>
    </div>
  );
};

export default SlipCheckingAnimation;
