import { useEffect, useMemo, useState } from "react";
import { FaBolt } from "react-icons/fa";
import { message } from "antd";
import ModalCreate from "../review/create";
import { GetReviewByUserID, VerifyChargingToken } from "../../../services";
import { getCurrentUser, initUserProfile } from "../../../services/httpLogin";
import { useNavigate } from "react-router-dom";

const ChargingEV = () => {
  const [charging, setCharging] = useState(false);
  const [energy, setEnergy] = useState(0);   // 0–100 %
  const [time, setTime] = useState(0);       // seconds
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userID, setUserID] = useState<number | null>(null);

  // 🚦 สถานะควบคุมปุ่ม
  const [hasStarted, setHasStarted] = useState(false); // เริ่มแล้วครั้งแรกหรือยัง (เริ่มได้ครั้งเดียว)
  const [isComplete, setIsComplete] = useState(false); // ครบ 100% แล้วหรือยัง

  const navigate = useNavigate();

  // 1) โหลด user จาก JWT cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        let current = getCurrentUser();
        if (!current) current = await initUserProfile();
        if (current?.id) setUserID(current.id);
        else {
          message.error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
          navigate("/login");
        }
      } catch (err) {
        console.error("โหลดข้อมูลผู้ใช้ล้มเหลว:", err);
        message.error("เกิดข้อผิดพลาดในการโหลดผู้ใช้");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  // 2) ตรวจสอบ token
  useEffect(() => {
    const checkToken = async () => {
      const urlToken = new URLSearchParams(window.location.search).get("token");
      const localToken = localStorage.getItem("charging_token");
      const token = urlToken || localToken;

      if (!token) {
        message.warning("กรุณาเลือกไฟฟ้าเเละชำระเงินก่อนเริ่มชาร์จ");
        navigate("/user/evs-selector");
        return;
      }

      const valid = await VerifyChargingToken(token);
      if (!valid) {
        message.warning("Session การชาร์จหมดอายุแล้ว");
        localStorage.removeItem("charging_token");
        navigate("/user");
        return;
      }

      setTokenValid(true);
      setIsVerifying(false);
    };
    checkToken();
  }, [navigate]);

  // 3) จำลองการชาร์จ (เพิ่มทีละ 1% ทุก 1 วินาที)
  useEffect(() => {
    if (!tokenValid) return;

    let intervalId: number | undefined;

    if (charging) {
      // เริ่มรอบใหม่ของการชาร์จ
      setEnergy(0);
      setTime(0);
      setIsComplete(false);
      let seconds = 0;

      intervalId = window.setInterval(() => {
        seconds += 1;
        setTime(seconds);
        setEnergy((prev) => {
          const next = Math.min(prev + 1, 100);
          if (next >= 100) {
            // ถึง 100% แล้ว -> หยุดนับ + เซ็ตสถานะเสร็จ
            setIsComplete(true);
            setCharging(false);
            if (intervalId !== undefined) window.clearInterval(intervalId);
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [charging, tokenValid]);

  // helpers
  const formatTime = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const estKW = useMemo(() => {
    const base = 7.2;
    const step = energy / 100;
    const value = Math.max(3, Math.min(base + step * 2, 11));
    return value.toFixed(1);
  }, [energy]);

  const batteryGradient = useMemo(() => {
    if (energy < 20) return "linear-gradient(180deg, #f87171, #ef4444)";
    if (energy < 40) return "linear-gradient(180deg, #fb923c, #f97316)";
    if (energy < 60) return "linear-gradient(180deg, #fbbf24, #f59e0b)";
    if (energy < 80) return "linear-gradient(180deg, #a3e635, #84cc16)";
    return "linear-gradient(180deg, #34d399, #22c55e)";
  }, [energy]);

  const handleComplete = async () => {
    if (!userID) {
      message.error("ไม่พบผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      navigate("/login");
      return;
    }
    try {
      const reviews = await GetReviewByUserID(userID);
      if (reviews && reviews.length > 0) {
        navigate("/");
      } else {
        setShowReviewModal(true);
      }
    } catch (error) {
      console.error("Error checking review:", error);
      message.error("เกิดข้อผิดพลาดในการตรวจสอบรีวิว");
    }
  };

  // ✅ หลังจากประกาศ Hook "ทั้งหมด" แล้ว ค่อยตัดสินใจ render
  if (isVerifying || !tokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600 text-sm">
        กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...
      </div>
    );
  }

  // สถานะปุ่มตามเงื่อนไขที่ขอ
  const startDisabled = hasStarted || charging || isComplete; // เริ่มได้ครั้งเดียว + ห้ามซ้ำ
  const cancelDisabled = !hasStarted || isComplete;          // เริ่มแล้วถึงจะยกเลิกได้ และห้ามยกเลิกเมื่อ 100%
  const completeDisabled = !isComplete;                       // เสร็จสิ้นได้เฉพาะเมื่อ 100%

  return (
    <>
      <ModalCreate
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        UserID={userID!}
        onReviewCreated={(id) => console.log("Review ID:", id)}
      />

      <div className="min-h-screen bg-white w-full">
        {/* HEADER */}
        <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-b-2xl shadow-md overflow-hidden">
          <div className="w-full px-4 py-3 flex items-center gap-2 justify-start">
            <button
              onClick={() => window.history.back()}
              aria-label="ย้อนกลับ"
              className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <FaBolt className="h-5 w-5 text-white" />
              <span className="text-sm md:text-base font-semibold tracking-wide">EV Charging</span>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT – เต็มจอมือถือ */}
        <main className="px-4 pt-5 pb-10">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md w-full">
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
                {charging ? "CHARGING" : isComplete ? "COMPLETE" : "IDLE"}
              </span>
            </div>

            {/* 🔋 ซ้าย = Battery / ขวา = ข้อมูล */}
            <div className="w-full flex items-start justify-center gap-5">
              {/* Battery */}
              <div className="flex flex-col items-center">
                <div className="mx-auto mb-1 h-2 w-12 rounded-sm bg-gray-300" />
                <div className="relative h-[320px] w-[150px] rounded-2xl border-2 border-gray-300 p-2 bg-white overflow-hidden">
                  <div className="absolute inset-2 rounded-xl bg-gray-100 border border-gray-200" />
                  <div
                    className="absolute left-2 right-2 bottom-2 rounded-b-xl transition-all duration-500 ease-out"
                    style={{
                      height: `calc(${energy}% - 0px)`,
                      background: batteryGradient,
                      boxShadow: "inset 0 0 10px rgba(0,0,0,0.08)",
                    }}
                  />
                  <div
                    className="absolute inset-2 rounded-xl pointer-events-none"
                    style={{ boxShadow: "inset 0 10px 14px rgba(0,0,0,0.05)" }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col items-stretch gap-3 min-w-[160px]">
                <div className="rounded-xl bg-blue-50 px-4 py-3">
                  <div className="text-[11px] text-blue-900/70">เปอร์เซ็นต์</div>
                  <div className="text-3xl font-extrabold tracking-tight text-blue-700">{energy}%</div>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <div className="text-[11px] text-gray-500">เวลา</div>
                  <div className="font-semibold text-gray-800">{formatTime(time)}</div>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <div className="text-[11px] text-gray-500">กำลังชาร์จ (kW)</div>
                  <div className="font-semibold text-gray-800">{estKW}</div>
                </div>
              </div>
            </div>

            {/* Controls: 3 ปุ่ม เต็มพื้นที่ */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    if (!hasStarted && !isComplete) {
                      setHasStarted(true);
                      setCharging(true);
                    }
                  }}
                  disabled={startDisabled}
                  className={`w-full rounded-xl px-3 py-3 text-sm font-semibold text-white shadow-sm transition
                    ${
                      startDisabled
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                    }`}
                >
                  เริ่ม
                </button>

                <button
                  onClick={() => {
                    // ยกเลิก: ใช้ได้เฉพาะเมื่อเริ่มแล้ว และยังไม่ครบ 100%
                    if (!cancelDisabled) {
                      setCharging(false);
                      setEnergy(0);
                      setTime(0);
                      localStorage.removeItem("charging_token");
                    }
                  }}
                  disabled={cancelDisabled}
                  className={`w-full rounded-xl px-3 py-3 text-sm font-semibold shadow-sm transition
                    ${
                      cancelDisabled
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                >
                  ยกเลิก
                </button>

                <button
                  disabled={completeDisabled}
                  onClick={handleComplete}
                  className={`w-full rounded-xl px-3 py-3 text-sm font-semibold shadow-sm transition
                    ${
                      completeDisabled
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ChargingEV;