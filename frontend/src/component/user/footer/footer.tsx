import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { HiOutlineMap } from "react-icons/hi";
import { FaBolt } from "react-icons/fa";
import { RiNewspaperLine } from "react-icons/ri";
import { FiUser } from "react-icons/fi";

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
        {/* ✅ เพิ่ม pb-2 และ safe-area ภายใน panel เพื่อไม่ให้ label ชิดขอบล่าง */}
        <div
          className="relative rounded-2xl bg-white/95 backdrop-blur border border-gray-100 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] pb-2 pt-1"
          style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
        >
          <ul className="grid grid-cols-5 items-end">
            {tabs.map((tab) => {
              const active = isActive(tab.to);

              if (tab.key === "charge") {
                return (
                  <li key={tab.key} className="flex justify-center">
                    <button
                      onClick={() => navigate(tab.to)}
                      aria-label={tab["aria-label"]}
                      // ✅ ลดลอยขึ้นเล็กน้อย และเว้นที่ด้านล่างเพิ่ม (pb-1)
                      className="-translate-y-2 pb-1 transition-all duration-200 rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full text-white bg-gradient-to-b from-blue-500 to-blue-600 ring-4 ring-white">
                        <FaBolt className="text-xl" />
                      </div>
                      <div className="mt-1 text-center text-[11px] font-semibold text-blue-700">
                        {tab.label}
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
    </nav>
  );
};

export default Footer;
