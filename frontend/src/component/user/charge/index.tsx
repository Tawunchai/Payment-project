import { useState, useEffect } from 'react';
import { FaBolt } from 'react-icons/fa';
import { message } from 'antd';
import ModalCreate from '../review/create'; // ✅ import modal
// หมายเหตุ: ตรวจสอบ path import ให้ตรงกับไฟล์จริงของคุณ
const ChargingEV = () => {
  const [charging, setCharging] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [time, setTime] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const userID = 1; // 🔁 เปลี่ยนเป็นค่าจริงของผู้ใช้

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (charging) {
      setEnergy(0);
      setTime(0);
      let seconds = 0;

      interval = setInterval(() => {
        seconds += 1;
        setEnergy((prev) => {
          const newEnergy = Math.min(prev + 20, 100);
          if (newEnergy >= 100) {
            setCharging(false);
            message.success('การชาร์จเสร็จเรียบร้อย!');
          }
          return newEnergy;
        });
        setTime(seconds);
        if (seconds >= 5) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [charging]);

  const formatTime = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <>
      {/* Modal Review */}
      <ModalCreate
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        UserID={userID}
        onReviewCreated={(id) => console.log("Review ID:", id)}
      />

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

          {/* Info */}
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

          {/* Buttons */}
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

            {/* ✅ ปุ่ม Complete */}
            <button
              disabled={energy < 100}
              onClick={() => setShowReviewModal(true)}
              className={`py-2 rounded-full font-semibold transition shadow 
                ${energy >= 100
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                }`}
            >
              Complete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChargingEV;
