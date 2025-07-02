import { useState, useEffect } from 'react';
import { FaBolt } from 'react-icons/fa';

const ChargingEV = () => {
  const [charging, setCharging] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (charging && energy < 100) {
      interval = setInterval(() => {
        setEnergy((prev) => Math.min(prev + 0.2, 100));
        setTime((prev) => prev + 1);
      }, 500);
    }

    return () => clearInterval(interval);
  }, [charging, energy]);

  const formatTime = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--black)] px-4">
      <div className="w-full max-w-md bg-white backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-orange-100 transition-all">
        <h2 className="text-orange-500 text-2xl font-semibold mb-6 flex items-center gap-2 justify-center">
          ⚡ กำลังชาร์จ EV
        </h2>

        {/* Progress Bar */}
        <div className="w-full h-5 bg-orange-100 rounded-full overflow-hidden mb-2 relative">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500 ease-in-out rounded-full"
            style={{ width: `${energy}%` }}
          ></div>

          {/* shimmer animation */}
          {charging && (
            <div className="absolute top-0 left-0 h-full w-full overflow-hidden rounded-full">
              <div className="w-1/3 h-full bg-white/20 animate-shimmer" />
            </div>
          )}
        </div>

        {/* ⚡ Pulse Lightning Animation */}
        {charging && (
          <div className="flex justify-center items-center gap-5 mb-6 h-6 px-4">
            {[...Array(5)].map((_, i) => (
              <FaBolt
                key={i}
                className="text-orange-400 animate-ping-slow"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}

        {/* ข้อมูล */}
        <div className="text-sm space-y-2 mb-6 text-gray-700 leading-relaxed font-medium">
          <p>🕒 เวลาที่ชาร์จ: <span className="font-semibold">{formatTime(time)}</span></p>
          <p>⚡ พลังงานชาร์จ (kWh): <span className="font-semibold">{energy.toFixed(1)}</span></p>
          <p>☀️ สัดส่วน Solar Cell: <span className="text-yellow-500">70%</span></p>
          <p>🔌 สัดส่วน การไฟฟ้า: <span className="text-blue-500">30%</span></p>
          <p>
            📡 สถานะ:{' '}
            <span className={`font-semibold ${charging ? 'text-green-600' : 'text-gray-400'}`}>
              {charging ? 'กำลังชาร์จ' : 'รอเริ่มชาร์จ'}
            </span>
          </p>
        </div>

        {/* ปุ่มควบคุม */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setCharging(true)}
            className="bg-gradient-to-r from-orange-400 to-orange-500 text-white py-2 rounded-full font-semibold hover:opacity-90 transition shadow-md"
          >
            เริ่มชาร์จ
          </button>
          <button
            onClick={() => setCharging(false)}
            className="bg-gray-100 text-gray-600 py-2 rounded-full font-medium hover:bg-gray-200 transition shadow-sm"
          >
            ปลดหัวชาร์จ
          </button>
          <button
            onClick={() => {
              setCharging(false);
              setEnergy(0);
              setTime(0);
            }}
            className="bg-red-400 text-white py-2 rounded-full font-semibold hover:bg-red-500 transition shadow"
          >
            ยกเลิก
          </button>
          <button
            className="bg-orange-700 text-white py-2 rounded-full font-semibold hover:bg-orange-800 transition shadow"
          >
            HOME
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChargingEV;
