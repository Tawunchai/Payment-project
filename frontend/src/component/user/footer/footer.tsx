import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { HiOutlineMap } from "react-icons/hi";
import { FaBolt } from "react-icons/fa";
import { RiNewspaperLine } from "react-icons/ri";
import { FiUser } from "react-icons/fi";

import { getCurrentUser, initUserProfile } from "../../../services/httpLogin";
import { GetChargingSessionByUserID } from "../../../services";

type Tab = {
  key: string;
  label: string;
  to: string;
  icon: React.ReactNode;
  "aria-label": string;
};

const Footer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userID, setUserID] = useState<number | null>(null);
  const [isChargingActive, setIsChargingActive] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      let user = getCurrentUser();
      if (!user) user = await initUserProfile();

      if (user?.id) {
        setUserID(user.id);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadSessions = async () => {
      if (!userID) return;

      const res = await GetChargingSessionByUserID(userID);
      if (res) {
        const active = res.some(
          (session: any) => session.Status === true || session.Status === 1
        );
        setIsChargingActive(active);
      }
    };
    loadSessions();
  }, [userID]);

  const tabs: Tab[] = [
    { key: "home", label: "หน้าหลัก", to: "/", icon: <AiFillHome />, "aria-label": "หน้าหลัก" },
    { key: "map", label: "แผนที่", to: "/user/map", icon: <HiOutlineMap />, "aria-label": "แผนที่" },
    { key: "charge", label: "ชาร์จ", to: "/user/evs-selector", icon: <FaBolt />, "aria-label": "เริ่มชาร์จ" },
    { key: "news", label: "ข่าวสาร", to: "/user/all-news", icon: <RiNewspaperLine />, "aria-label": "ข่าวสาร" },
    { key: "account", label: "บัญชี", to: "/user/profile", icon: <FiUser />, "aria-label": "บัญชี" },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="EV bottom navigation"
    >
      <div className="mx-auto max-w-screen-sm px-3">
        <div
          className="relative rounded-2xl bg-white/95 backdrop-blur border border-gray-100 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] pb-2 pt-1"
          style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
        >
          <ul className="grid grid-cols-5 items-end">
            {tabs.map((tab) => {
              const active = isActive(tab.to);

              // ⭐ ปุ่มชาร์จ
              if (tab.key === "charge") {
                return (
                  <li key={tab.key} className="flex justify-center">
                    <button
                      // ⭐ ถ้ากำลังชาร์จ → ไป /user/charging
                      // ⭐ ถ้าไม่ได้ชาร์จ → ไปหน้าเลือกเครื่องชาร์จ
                      onClick={() =>
                        isChargingActive
                          ? navigate("/user/charging")
                          : navigate("/user/evs-selector")
                      }
                      aria-label={tab["aria-label"]}
                      className="-translate-y-2 pb-1 transition-all duration-200 rounded-full shadow-lg focus:outline-none relative"
                    >
                      <div
                        className={
                          isChargingActive
                            ? "relative flex h-14 w-14 items-center justify-center rounded-full text-white bg-orange-500 ring-4 ring-white shadow-lg overflow-hidden"
                            : "relative flex h-14 w-14 items-center justify-center rounded-full text-white bg-gradient-to-b from-blue-500 to-blue-600 ring-4 ring-white"
                        }
                      >
                        {/* ⭐ เอฟเฟกต์ฟองลอยตอนกำลังชาร์จ */}
                        {isChargingActive && (
                          <>
                            <span className="bubble bubble1"></span>
                            <span className="bubble bubble2"></span>
                            <span className="bubble bubble3"></span>
                            <span className="bubble bubble4"></span>
                          </>
                        )}

                        <FaBolt
                          className={
                            isChargingActive
                              ? "text-xl animate-[pulseScale_0.8s_ease-in-out_infinite]"
                              : "text-xl"
                          }
                          style={{
                            animation:
                              isChargingActive
                                ? "pulseScale 0.8s ease-in-out infinite"
                                : "none",
                          }}
                        />
                      </div>

                      <div
                        className={
                          isChargingActive
                            ? "mt-1 text-center text-[11px] font-semibold text-orange-600"
                            : "mt-1 text-center text-[11px] font-semibold text-blue-700"
                        }
                      >
                        {isChargingActive ? "ชาร์จ" : tab.label}
                      </div>
                    </button>
                  </li>
                );
              }

              return (
                <li key={tab.key} className="flex justify-center">
                  <NavLink
                    to={tab.to}
                    aria-label={tab["aria-label"]}
                    className="flex flex-col items-center gap-1 py-3 w-full"
                  >
                    <span
                      className={`grid place-items-center h-9 w-9 rounded-xl transition-colors ${
                        active ? "bg-blue-50 text-blue-600" : "text-gray-400"
                      }`}
                    >
                      <span className="text-[20px]">{tab.icon}</span>
                    </span>
                    <span
                      className={`text-[11px] font-medium transition-colors ${
                        active ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ⭐ Animation CSS */}
      <style>
        {`
          @keyframes pulseScale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.35); }
          }

          @keyframes bubbleUp {
            0% { transform: translateY(20px) scale(0.4); opacity: 0.2; }
            50% { opacity: 0.6; }
            100% { transform: translateY(-20px) scale(1); opacity: 0; }
          }

          .bubble {
            position: absolute;
            bottom: 0;
            background: rgba(255, 255, 255, 0.45);
            border-radius: 50%;
            animation: bubbleUp 2s infinite ease-in-out;
          }

          .bubble1 { width: 8px; height: 8px; left: 10px; animation-delay: 0s; }
          .bubble2 { width: 10px; height: 10px; left: 22px; animation-delay: 0.4s; }
          .bubble3 { width: 6px; height: 6px; left: 30px; animation-delay: 0.8s; }
          .bubble4 { width: 9px; height: 9px; left: 18px; animation-delay: 1.2s; }
        `}
      </style>
    </nav>
  );
};

export default Footer;