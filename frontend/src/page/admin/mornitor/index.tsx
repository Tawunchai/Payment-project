import { JSX } from "react";
import {
  FiSun,
  FiZap,
  FiBarChart2,
  FiThermometer,
  FiBatteryCharging,
} from "react-icons/fi";


type SolarParameter = {
  name: string;
  value: string;
  status: string;
  icon: JSX.Element;
  bg: string;
};

const solarParameters: SolarParameter[] = [
  {
    name: "Power Output",
    value: "5.2 kW",
    status: "ON",
    icon: <FiZap className="text-3xl text-orange-300 drop-shadow-sm" />,
    bg: "bg-gradient-to-br from-orange-50 via-white to-orange-100",
  },
  {
    name: "Energy Today",
    value: "38.5 kWh",
    status: "ON",
    icon: <FiBarChart2 className="text-3xl text-orange-300 drop-shadow-sm" />,
    bg: "bg-gradient-to-br from-orange-50 via-white to-orange-100",
  },
  {
    name: "Panel Temp.",
    value: "44°C",
    status: "ON",
    icon: <FiThermometer className="text-3xl text-orange-300 drop-shadow-sm" />,
    bg: "bg-gradient-to-br from-orange-50 via-white to-orange-100",
  },
  {
    name: "Battery",
    value: "83%",
    status: "ON",
    icon: <FiBatteryCharging className="text-3xl text-orange-300 drop-shadow-sm" />,
    bg: "bg-gradient-to-br from-orange-50 via-white to-orange-100",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-white font-sans mt-24 md:mt-0">
      {/* Header */}
      <div className="relative flex flex-col items-center justify-center mx-6 mt-8 mb-8 h-40 rounded-[2rem] overflow-hidden shadow-xl bg-gradient-to-tr from-orange-300 via-orange-100 to-white border border-orange-200">
        <div className="absolute -top-8 -left-10 w-44 h-44 bg-yellow-300/70 rounded-full blur-2xl shadow-2xl"></div>
        <div className="z-10 flex flex-col items-center">
          <div className="flex items-end gap-3 mb-2">
            <span className="relative">
              <FiSun className="text-6xl text-yellow-400 drop-shadow-xl" />
              {/* aura - เข้ม/ฟุ้งมากขึ้น */}
              <span className="absolute -top-3 -left-3 w-14 h-14 bg-yellow-200/80 rounded-full blur-xl"></span>
            </span>
            <span className="text-6xl font-extrabold text-orange-500 drop-shadow-xl">
              29°
            </span>
          </div>
          <div className="text-xl font-bold text-orange-500 mb-1 tracking-wide drop-shadow">
            Mostly Sunny
          </div>
          <div className="text-sm text-orange-400 opacity-90 drop-shadow-sm">
            Celsius
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-6 px-6 mt-8">
        {solarParameters.map((item) => (
          <div
            key={item.name}
            className={`rounded-3xl ${item.bg} p-6 flex flex-col items-center shadow-md border border-orange-100 transition-transform duration-200 hover:scale-105 hover:shadow-xl`}
          >
            <div className="mb-3">{item.icon}</div>
            <div className="text-md font-medium text-gray-500 mb-1">{item.name}</div>
            <div className="text-2xl font-bold text-orange-500 mb-1">{item.value}</div>
            <span
              className={`mt-2 inline-block text-xs px-3 py-1 rounded-full font-semibold tracking-wide shadow-sm ${item.status === "ON"
                ? "bg-gradient-to-r from-orange-400 to-orange-300 text-white"
                : "bg-gray-100 text-gray-400"
                }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
      <div className="h-10" />
    </div>
  );
};

export default Index;
