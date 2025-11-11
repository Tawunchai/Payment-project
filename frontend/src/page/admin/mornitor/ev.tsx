// src/component/user/ev-calibet/index.tsx
import React from "react";
import {
  FiClock,
  FiBatteryCharging,
  FiPower,
  FiCpu,
} from "react-icons/fi";

/** ---------- Types ---------- */
type PortStatus = "Available" | "Charging" | "Error";

type PortInfo = {
  id: number;
  name: string;
  energy: string;
  duration: string;
  status: PortStatus;
  currentCar: string;
  power: string;
};

/** ---------- Mock Data ---------- */
const ports: PortInfo[] = [
  {
    id: 1,
    name: "Port A1",
    energy: "18.4 kWh",
    duration: "45 min",
    status: "Charging",
    currentCar: "Tesla Model 3",
    power: "11.2 kW",
  },
  {
    id: 2,
    name: "Port B2",
    energy: "0.0 kWh",
    duration: "-",
    status: "Available",
    currentCar: "-",
    power: "0 kW",
  },
  {
    id: 3,
    name: "Port C3",
    energy: "5.1 kWh",
    duration: "22 min",
    status: "Error",
    currentCar: "BYD Atto 3",
    power: "5.8 kW",
  },
];

/** ---------- Mock Power Trend ---------- */
const powerTrend = [0, 2.5, 5, 6.3, 7.8, 9.1, 10.4, 9.9, 8.6, 7.2, 5.4, 4.1, 3.2];

function toPolylinePoints(values: number[], width = 720, height = 140): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.0001, max - min);
  const stepX = width / Math.max(1, values.length - 1);

  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

/** ---------- Component ---------- */
const EVCalibet: React.FC = () => {
  const points = toPolylinePoints(powerTrend, 720, 140);

  return (
    <div className="min-h-screen bg-white text-gray-900 mt-14 sm:mt-0">
      {/* Header */}
      <div
        className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-semibold tracking-wide">
            EV Cabinet • Power Monitor
          </h1>
          <span className="text-[11px] sm:text-xs bg-white/15 px-2 py-1 rounded-lg border border-white/20">
            Live
          </span>
        </div>
      </div>

      {/* Main */}
      <main className="w-full px-4 sm:px-6 pt-5 pb-24">
        {/* Summary */}
        <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                Total Output
              </p>
              <p className="text-3xl md:text-4xl font-extrabold text-blue-700">
                27.6 kW
              </p>
              <p className="text-sm md:text-base text-gray-500">
                Across 3 Active Chargers
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] md:text-xs text-gray-500">Updated</p>
              <p className="text-sm md:text-base font-semibold text-blue-700">
                Just now
              </p>
            </div>
          </div>
        </section>

        {/* Ports */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {ports.map((port) => (
            <div
              key={port.id}
              className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    {port.status === "Charging" ? (
                      <FiBatteryCharging className="text-blue-600 text-2xl" />
                    ) : port.status === "Available" ? (
                      <FiPower className="text-green-600 text-2xl" />
                    ) : (
                      <FiCpu className="text-red-500 text-2xl" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {port.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {port.currentCar}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] md:text-xs px-2 py-1 rounded-full font-semibold ${
                    port.status === "Charging"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : port.status === "Available"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {port.status}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-gray-500 text-[11px]">Energy</p>
                  <p className="font-bold text-blue-700">{port.energy}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[11px]">Power</p>
                  <p className="font-bold text-blue-700">{port.power}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[11px]">Duration</p>
                  <p className="font-bold text-blue-700">{port.duration}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Power Trend Graph */}
        <section className="mt-8 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500">Power Usage</p>
              <p className="text-lg md:text-xl font-bold text-blue-700">
                Last 13 hours
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <FiClock className="text-gray-400" />
              Updated 5 min ago
            </div>
          </div>

          <div className="px-3 pt-2 pb-5">
            <div className="rounded-xl bg-white border border-gray-200 p-2">
              <svg
                viewBox="0 0 720 180"
                className="w-full h-40 md:h-48"
                role="img"
                aria-label="EV Power line chart"
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
                  <linearGradient id="lineGradEV" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(37,99,235,0.95)" />
                    <stop offset="100%" stopColor="rgba(37,99,235,0.65)" />
                  </linearGradient>
                  <linearGradient id="areaGradEV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.20)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.00)" />
                  </linearGradient>
                </defs>

                {/* Filled Area */}
                <polyline
                  points={`${toPolylinePoints(powerTrend, 720, 140)} 720,180 0,180`}
                  fill="url(#areaGradEV)"
                  stroke="none"
                />
                {/* Line */}
                <polyline
                  points={points}
                  fill="none"
                  stroke="url(#lineGradEV)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Summary */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] md:text-xs">
              <div className="rounded-lg bg-blue-50 border border-blue-100 py-2">
                <p className="text-gray-500">Min</p>
                <p className="font-semibold text-blue-700">2.5 kW</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-100 py-2">
                <p className="text-gray-500">Avg</p>
                <p className="font-semibold text-blue-700">7.8 kW</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-100 py-2">
                <p className="text-gray-500">Max</p>
                <p className="font-semibold text-blue-700">10.4 kW</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EVCalibet;
