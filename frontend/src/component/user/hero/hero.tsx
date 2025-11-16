import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import Hero_Image from "../../../assets/picture/car_charging.jpg";

import { ListEVCharging, ListUsers, GetChargingSessionByUserID } from "../../../services";
import { EVchargingInterface } from "../../../interface/IEV";
import { UsersInterface } from "../../../interface/IUser";
import { getCurrentUser, initUserProfile } from "../../../services/httpLogin";

import { FaBolt, FaCalendarCheck, FaUsers, FaChargingStation } from "react-icons/fa";

type HeaderProps = {
  scrollToValue: () => void;
};

const Hero = ({ }: HeaderProps) => {
  const [evList, setEVList] = useState<EVchargingInterface[]>([]);
  const [userList, setUserList] = useState<UsersInterface[]>([]);
  const [userID, setUserID] = useState<number | null>(null);
  const [isChargingActive, setIsChargingActive] = useState(false);

  const navigate = useNavigate();

  // ✔ โหลด UserID จาก JWT
  useEffect(() => {
    const loadUser = async () => {
      let u = getCurrentUser();
      if (!u) u = await initUserProfile();
      if (u?.id) setUserID(u.id);
    };
    loadUser();
  }, []);

  // ✔ โหลด Charging Session
  useEffect(() => {
    const loadSession = async () => {
      if (!userID) return;

      const res = await GetChargingSessionByUserID(userID);
      if (res) {
        const active = res.some((s: any) => s.Status === true || s.Status === 1);
        setIsChargingActive(active);
      }
    };
    loadSession();
  }, [userID]);

  // ✔ โหลด EV & Users
  useEffect(() => {
    const fetchData = async () => {
      const evs = await ListEVCharging();
      const users = await ListUsers();
      if (evs) setEVList(evs);
      if (users) setUserList(users);
    };
    fetchData();
  }, []);

  // ✔ รวมราคา
  const namePriceSums = useMemo(() => {
    return evList.reduce((acc: Record<string, number>, ev) => {
      const name = ev.Name || "Unknown";
      acc[name] = (acc[name] || 0) + (Number(ev.Price) || 0);
      return acc;
    }, {});
  }, [evList]);

  return (
    <section className="relative w-full bg-white text-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-end pt-10 md:pt-14 pb-10 md:pb-16">

          {/* LEFT */}
          <div className="flex flex-col gap-6">

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 w-max">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              EV Charging Made Simple
            </div>

            <h1 className="font-bold leading-tight tracking-tight text-3xl sm:text-4xl">
              Discover the Best EV <br className="hidden sm:block" />
              Charging Spots Near You
            </h1>

            <p className="text-[13px] sm:text-base text-gray-600">
              ค้นหาสถานีชาร์จที่เหมาะกับคุณได้อย่างรวดเร็ว ประสบการณ์ใช้งานลื่นไหล
              ปลอดภัย และเชื่อถือได้
            </p>

            {/* 🔥 ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">

              {/* ⭐ ปุ่มเริ่มชาร์จไฟฟ้า / กำลังชาร์จ */}
              <button
                className={`relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-sm active:scale-[0.99] transition
                  ${isChargingActive
                    ? "bg-orange-500 text-white shadow-lg"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                onClick={() =>
                  isChargingActive
                    ? navigate("/user/charging")      // ⭐ เปลี่ยนเส้นทางเมื่อกำลังชาร์จ
                    : navigate("/user/evs-selector")  // ⭐ ปกติไปเลือกหัวชาร์จ
                }
              >
                {/* Bubble Animation (ทั่วปุ่ม) */}
                {isChargingActive && (
                  <>
                    <span className="bubble bubble1"></span>
                    <span className="bubble bubble2"></span>
                    <span className="bubble bubble3"></span>
                    <span className="bubble bubble4"></span>
                    <span className="bubble bubble5"></span>
                    <span className="bubble bubble6"></span>
                    <span className="bubble bubble7"></span>
                  </>
                )}

                <FaBolt
                  className={
                    isChargingActive
                      ? "text-lg animate-[pulseScale_0.8s_ease-in-out_infinite]"
                      : "text-lg"
                  }
                />
                {isChargingActive ? "กำลังชาร์จ" : "เริ่มชาร์จไฟฟ้า"}
              </button>

              {/* ปุ่มจองเข้าชาร์จไฟฟ้า */}
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold bg-white text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-50 active:scale-[0.99] transition"
                onClick={() => navigate("/user/booking-ev")}
              >
                <FaCalendarCheck className="text-lg text-blue-600" />
                จองเข้าชาร์จไฟฟ้า
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 mt-2">
              {Object.entries(namePriceSums).map(([name, total], index, arr) => {
                const isLast = index === arr.length - 1;
                const isOdd = arr.length % 2 === 1;

                return (
                  <div
                    key={name}
                    className={`
        rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_24px_rgba(2,6,23,0.06)]
        text-center sm:text-left
        ${isLast && isOdd ? "col-span-2" : ""}
      `}
                  >
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <FaChargingStation className="text-blue-600 text-lg" />

                      <div className="text-2xl font-extrabold tracking-tight text-blue-700">
                        {Number(total).toFixed(2)}
                        <span className="text-blue-300"> ฿</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-1">{name}</div>
                  </div>
                );
              })}

              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_24px_rgba(2,6,23,0.06)] text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <FaUsers className="text-blue-600 text-lg" />
                  <div className="text-2xl font-extrabold tracking-tight text-blue-700">
                    <CountUp start={0} end={userList.length} duration={2} />
                    <span className="text-blue-300"> +</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Members</div>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden md:flex justify-end">
            <figure className="relative w-[34rem] max-w-full h-[28rem] rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_20px_60px_rgba(2,6,23,0.08)] bg-white">
              <img
                src={Hero_Image}
                alt="EV Charging"
                className="h-full w-full object-cover"
                loading="eager"
              />
              <figcaption className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600" />
            </figure>
          </div>
        </div>
      </div>

      <div className="h-6 md:h-8 w-full bg-gradient-to-b from-white to-blue-50/30" />

      {/* ANIMATION CSS */}
      <style>
        {`
          @keyframes pulseScale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.35); }
          }

          @keyframes bubbleUpWide {
            0% { transform: translateY(20px) scale(0.3); opacity: 0; }
            40% { opacity: 0.45; }
            100% { transform: translateY(-35px) scale(1.2); opacity: 0; }
          }

          .bubble {
            position: absolute;
            bottom: 0;
            background: rgba(255, 255, 255, 0.45);
            border-radius: 50%;
            animation: bubbleUpWide 2.2s infinite ease-out;
            pointer-events: none;
          }

          .bubble1 { width: 8px; height: 8px; left: 10%; animation-delay: 0s; }
          .bubble2 { width: 12px; height: 12px; left: 30%; animation-delay: 0.3s; }
          .bubble3 { width: 9px; height: 9px; left: 50%; animation-delay: 0.6s; }
          .bubble4 { width: 7px; height: 7px; left: 70%; animation-delay: 0.9s; }
          .bubble5 { width: 11px; height: 11px; left: 85%; animation-delay: 1.2s; }
          .bubble6 { width: 10px; height: 10px; left: 40%; animation-delay: 1.5s; }
          .bubble7 { width: 6px; height: 6px; left: 20%; animation-delay: 1.8s; }
        `}
      </style>
    </section>
  );
};

export default Hero;