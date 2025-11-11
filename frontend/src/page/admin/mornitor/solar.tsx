import React from "react";
import {
  FiZap,
  FiBarChart2,
  FiThermometer,
  FiBatteryCharging,
} from "react-icons/fi";

import TestingOCPP from "./test"
/** ---------- Types ---------- */
type Parameter = {
  name: string;
  value: string;
  status: "ON" | "OFF";
  icon: React.ReactNode;
};

/** ---------- Mock Data ---------- */
const params: Parameter[] = [
  { name: "Power Output", value: "5.2 kW", status: "ON", icon: <FiZap className="text-xl md:text-2xl text-blue-600" /> },
  { name: "Energy Today", value: "38.5 kWh", status: "ON", icon: <FiBarChart2 className="text-xl md:text-2xl text-blue-600" /> },
  { name: "Panel Temp.", value: "44°C", status: "ON", icon: <FiThermometer className="text-xl md:text-2xl text-blue-600" /> },
  { name: "Battery", value: "83%", status: "ON", icon: <FiBatteryCharging className="text-xl md:text-2xl text-blue-600" /> },
];

// ตัวอย่างกราฟ (Power Output รายชั่วโมง)
const powerSeries = [3.1, 3.6, 4.2, 4.8, 5.2, 5.0, 4.5, 4.9, 5.3, 5.1, 5.4, 5.6, 5.2, 5.0];

/** แปลงชุดข้อมูลเป็น polyline points */
function toPolylinePoints(values: number[], width = 560, height = 120): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.0001, max - min);
  const stepX = width / Math.max(1, values.length - 1);

  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height; // ค่ามากอยู่ด้านบน
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

const Index: React.FC = () => {
  const points = toPolylinePoints(powerSeries, 720, 140);

  return (
    <div className="min-h-screen bg-white text-gray-900 mt-14 sm:mt-0">
      {/* Top bar — แบบ News Management แต่ไม่มี CREATE */}
      <div className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-semibold tracking-wide">
            EV Station • Monitor
          </h1>
          <span className="text-[11px] sm:text-xs bg-white/15 px-2 py-1 rounded-lg border border-white/20">
            Live
          </span>
        </div>
      </div>

      {/* เนื้อหาเต็มหน้าจอ */}
      <main className="w-full px-4 sm:px-6 pt-5 pb-24">
        {/* Hero — สรุปสถานะรวม */}
        <section className="rounded-2xl bg-white border border-gray-200 p-5 md:p-6 shadow-sm">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 font-medium">System Status</p>
              <p className="text-3xl md:text-4xl font-extrabold text-blue-700">29°</p>
              <p className="text-sm md:text-base text-gray-500">Mostly Sunny • Celsius</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] md:text-xs text-gray-500">Updated</p>
              <p className="text-sm md:text-base font-semibold">Just now</p>
            </div>
          </div>
        </section>

        {/* การ์ดค่าหลัก 4 ตัว */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">
          {params.map((item) => (
            <div
              key={item.name}
              className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="inline-grid place-items-center h-9 w-9 md:h-10 md:w-10 rounded-lg bg-blue-50 border border-blue-100">
                  {item.icon}
                </div>
                <span
                  className={`text-[10px] md:text-xs px-2 py-1 rounded-full font-semibold ${item.status === "ON"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-gray-50 text-gray-500 border border-gray-200"
                    }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-[11px] md:text-xs text-gray-500">{item.name}</p>
                <p className="text-xl md:text-2xl font-bold text-blue-700">{item.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* กราฟเส้น (SVG) เต็มกว้าง */}
        <section className="mt-5 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Power Output</p>
                <p className="text-lg md:text-xl font-bold text-blue-700">Last 14 hours</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] md:text-xs text-gray-500">Peak</p>
                <p className="text-sm md:text-base font-semibold text-blue-700">5.6 kW</p>
              </div>
            </div>
          </div>

          <div className="px-3 pt-2 pb-4">
            <div className="rounded-xl bg-white border border-gray-200 p-2">
              <svg
                viewBox="0 0 720 180"
                className="w-full h-40 md:h-48"
                role="img"
                aria-label="Power output line chart"
              >
                {/* Grid */}
                <g>
                  {[30, 70, 110, 150].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      x2="720"
                      y1={y}
                      y2={y}
                      stroke="rgba(2,6,23,0.06)"
                      strokeWidth="1"
                    />
                  ))}
                </g>

                {/* Gradients */}
                <defs>
                  <linearGradient id="lineGradBlue" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(37,99,235,0.95)" />
                    <stop offset="100%" stopColor="rgba(37,99,235,0.65)" />
                  </linearGradient>
                  <linearGradient id="areaGradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.20)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.00)" />
                  </linearGradient>
                </defs>

                {/* Filled area */}
                <polyline
                  points={`${toPolylinePoints(powerSeries, 720, 140)} 720,180 0,180`}
                  fill="url(#areaGradBlue)"
                  stroke="none"
                />
                {/* Line */}
                <polyline
                  points={points}
                  fill="none"
                  stroke="url(#lineGradBlue)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* สรุปค่า Min/Avg/Max */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] md:text-xs">
              <div className="rounded-lg bg-blue-50 border border-blue-100 py-2">
                <p className="text-gray-500">Min</p>
                <p className="font-semibold text-blue-700">3.1 kW</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-100 py-2">
                <p className="text-gray-500">Avg</p>
                <p className="font-semibold text-blue-700">4.9 kW</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-100 py-2">
                <p className="text-gray-500">Max</p>
                <p className="font-semibold text-blue-700">5.6 kW</p>
              </div>
            </div>
          </div>
        </section>

        {/* bottom spacing */}
        <div className="h-10" />
      </main>
      <TestingOCPP />
    </div>
  );
};

export default Index;
