import { useEffect, useMemo, useState } from "react";
import { FaBolt } from "react-icons/fa";
import { message } from "antd";
import ModalCreate from "../review/create";
import { GetReviewByUserID } from "../../../services"; // ✅ import service
import { useNavigate } from "react-router-dom";

const ChargingEV = () => {
  const [charging, setCharging] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [time, setTime] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const navigate = useNavigate();
  const userID = Number(localStorage.getItem("userid"));

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (charging) {
      setEnergy(0);
      setTime(0);
      let seconds = 0;

      interval = setInterval(() => {
        seconds += 1;
        setTime(seconds);
        setEnergy((prev) => {
          const next = Math.min(prev + 20, 100);
          if (next >= 100) {
            message.success("การชาร์จเสร็จเรียบร้อย!");
            setCharging(false);
          }
          return next;
        });
        if (seconds >= 5 && interval) clearInterval(interval); // demo only
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [charging]);

  const formatTime = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const canComplete = energy >= 100;

  // ===== Battery segment logic =====
  const segmentCount = 5;
  const segments = useMemo(() => {
    const filledCount = Math.round((energy / 100) * segmentCount);
    return Array.from({ length: segmentCount }, (_, i) => i < filledCount);
  }, [energy]);

  const segmentColors = [
    { from: "#f87171", to: "#ef4444", border: "#dc2626" },
    { from: "#fb923c", to: "#f97316", border: "#ea580c" },
    { from: "#fbbf24", to: "#f59e0b", border: "#d97706" },
    { from: "#a3e635", to: "#84cc16", border: "#65a30d" },
    { from: "#34d399", to: "#22c55e", border: "#16a34a" },
  ];

  const estKW = useMemo(() => {
    const base = 7.2;
    const step = energy / 100;
    const value = Math.max(3, Math.min(base + step * 2, 11));
    return value.toFixed(1);
  }, [energy]);

  // ✅ ฟังก์ชันเช็กรีวิวก่อนเปิด Modal
  const handleComplete = async () => {
    try {
      const reviews = await GetReviewByUserID(userID);
      if (reviews && reviews.length > 0) {
        navigate("/"); // 👉 ไปหน้าแรก
      } else {
        setShowReviewModal(true); // 👉 เปิด Modal ให้รีวิว
      }
    } catch (error) {
      console.error("Error checking review:", error);
      message.error("เกิดข้อผิดพลาดในการตรวจสอบรีวิว");
    }
  };

  return (
    <>
      <ModalCreate
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        UserID={userID}
        onReviewCreated={(id) => console.log("Review ID:", id)}
      />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header
          className="sticky top-0 z-20 overflow-hidden rounded-b-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="mx-auto flex max-w-screen-sm items-center gap-2 px-4 py-3">
            <button
              onClick={() => window.history.back()}
              aria-label="ย้อนกลับ"
              className="flex h-9 w-9 items-center justify-center rounded-xl active:bg-white/15 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                <FaBolt className="text-white" />
              </span>
              <span className="text-sm font-semibold tracking-wide">EV Charging</span>
            </div>
          </div>
          <div className="mx-auto h-1.5 max-w-screen-sm rounded-b-2xl bg-white/15" />
        </header>

        {/* Content */}
        <main className="mx-auto max-w-screen-sm px-4 pt-5 pb-8">
          <div className="rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-sm backdrop-blur">
            {/* Title */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-blue-900">
                <FaBolt className="text-blue-600" /> กำลังชาร์จ EV
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  charging
                    ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200"
                    : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200"
                }`}
              >
                {charging ? "CHARGING" : "IDLE"}
              </span>
            </div>

            {/* Battery + Info */}
            <div className="flex items-center justify-center gap-6">
              {/* Battery 5 cell */}
              <div className="text-center">
                <div className="mx-auto mb-1 h-2 w-10 rounded-sm bg-gray-300" />
                <div className="relative h-48 w-20 rounded-2xl border-2 border-gray-300 p-2">
                  <div className="flex h-full flex-col-reverse justify-start gap-1">
                    {Array.from({ length: segmentCount }, (_, idxFromBottom) => {
                      const isOn = segments[idxFromBottom];
                      const palette = segmentColors[idxFromBottom];
                      const onStyle = {
                        background: `linear-gradient(180deg, ${palette.from}, ${palette.to})`,
                        borderColor: palette.border,
                      };
                      return (
                        <div
                          key={idxFromBottom}
                          className={[
                            "h-full rounded-md border transition-all duration-300",
                            isOn ? "shadow-sm" : "bg-gray-100 border-gray-200",
                            charging && isOn ? "animate-evGlow" : "",
                          ].join(" ")}
                          style={isOn ? onStyle : undefined}
                        />
                      );
                    })}
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30" />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col items-start gap-3">
                <div className="rounded-xl bg-blue-50 px-3 py-2">
                  <div className="text-[11px] text-blue-900/70">เปอร์เซ็นต์</div>
                  <div className="text-3xl font-extrabold tracking-tight text-blue-700">{energy}%</div>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <div className="text-[11px] text-gray-500">เวลา</div>
                  <div className="font-semibold text-gray-800">{formatTime(time)}</div>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <div className="text-[11px] text-gray-500">กำลังชาร์จ (kW)</div>
                  <div className="font-semibold text-gray-800">{estKW}</div>
                </div>
              </div>
            </div>

            {/* Extra Info */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                <div className="text-[11px] text-blue-800/80">Solar Cell</div>
                <div className="font-semibold text-blue-700">70%</div>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                <div className="text-[11px] text-blue-800/80">Grid</div>
                <div className="font-semibold text-blue-700">30%</div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setCharging(true)}
                  disabled={charging}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition
                    ${charging ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"}`}
                >
                  เริ่ม
                </button>
                <button
                  onClick={() => setCharging(false)}
                  className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-200"
                >
                  ปลด
                </button>
                <button
                  onClick={() => {
                    setCharging(false);
                    setEnergy(0);
                    setTime(0);
                  }}
                  className="rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-600"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={!canComplete}
                  onClick={handleComplete} // ✅ ตรวจสอบก่อนเปิด Modal
                  className={`rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition
                    ${
                      canComplete
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes evGlow {
          0% { box-shadow: 0 0 0px rgba(37,99,235,0); }
          50% { box-shadow: 0 0 14px rgba(37,99,235,0.45); }
          100% { box-shadow: 0 0 0px rgba(37,99,235,0); }
        }
        .animate-evGlow { animation: evGlow 1.8s ease-in-out infinite; }
      `}</style>
    </>
  );
};

export default ChargingEV;
