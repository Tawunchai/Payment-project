import React from "react";
import {
  FiBattery,
  FiBatteryCharging as FiCharge,
  FiClock,
} from "react-icons/fi";

/** ---------- Types ---------- */
type BatteryStatus = "Charging" | "Discharging" | "Idle";

type BatteryInfo = {
  id: number;
  name: string;
  capacity: string;
  voltage: string;
  status: BatteryStatus;
  icon: React.ReactNode;
};

/** ---------- Mock Data ---------- */
const batteries: BatteryInfo[] = [
  {
    id: 1,
    name: "Battery Pack #1",
    capacity: "83%",
    voltage: "402 V",
    status: "Charging",
    icon: <FiCharge className="text-2xl md:text-3xl text-green-500" />,
  },
  {
    id: 2,
    name: "Battery Pack #2",
    capacity: "71%",
    voltage: "399 V",
    status: "Discharging",
    icon: <FiBattery className="text-2xl md:text-3xl text-blue-500" />,
  },
  {
    id: 3,
    name: "Battery Pack #3",
    capacity: "95%",
    voltage: "405 V",
    status: "Idle",
    icon: <FiBattery className="text-2xl md:text-3xl text-gray-500" />,
  },
];

/** ---------- Mock Graph Data ---------- */
const chargeHistory = [60, 64, 67, 70, 74, 77, 79, 82, 84, 83, 85, 88, 90, 91, 93];

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
const Battery: React.FC = () => {
  const points = toPolylinePoints(chargeHistory, 720, 140);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 mt-14 sm:mt-0">
      {/* Header */}
      <div
        className="sticky top-0 z-10 bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-semibold tracking-wide">
            Battery System • Monitor
          </h1>
          <span className="text-[11px] sm:text-xs bg-white/15 px-2 py-1 rounded-lg border border-white/20">
            Live
          </span>
        </div>
      </div>

      {/* Content */}
      <main className="w-full px-4 sm:px-6 pt-5 pb-24">
        {/* Battery overview */}
        <section className="rounded-2xl bg-white border border-gray-200 p-5 md:p-6 shadow-sm">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                Total System Charge
              </p>
              <p className="text-3xl md:text-4xl font-extrabold text-green-600">82%</p>
              <p className="text-sm md:text-base text-gray-500">
                Estimated 4 hrs to Full
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

        {/* Battery packs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {batteries.map((b) => (
            <div
              key={b.id}
              className="rounded-xl bg-white border border-gray-200 p-5 shadow hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{b.name}</p>
                    <p className="text-[11px] text-gray-500">{b.voltage}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] md:text-xs px-2 py-1 rounded-full font-semibold ${
                    b.status === "Charging"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : b.status === "Discharging"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  }`}
                >
                  {b.status}
                </span>
              </div>
              <div className="mt-4 text-center">
                <p className="text-3xl font-bold text-green-600">{b.capacity}</p>
                <p className="text-xs text-gray-500">Charge Level</p>
              </div>
            </div>
          ))}
        </section>

        {/* Charge History Graph */}
        <section className="mt-6 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500">Charge History</p>
              <p className="text-lg md:text-xl font-bold text-green-600">
                Last 15 hours
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <FiClock className="text-gray-400" />
              Updated 2 min ago
            </div>
          </div>

          <div className="px-3 pt-2 pb-5">
            <div className="rounded-xl bg-white border border-gray-200 p-2">
              <svg
                viewBox="0 0 720 180"
                className="w-full h-40 md:h-48"
                role="img"
                aria-label="Battery charge line chart"
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
                      stroke="rgba(0,0,0,0.06)"
                      strokeWidth="1"
                    />
                  ))}
                </g>

                {/* Gradients */}
                <defs>
                  <linearGradient id="lineGradGreen" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(34,197,94,0.9)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.6)" />
                  </linearGradient>
                  <linearGradient id="areaGradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(134,239,172,0.25)" />
                    <stop offset="100%" stopColor="rgba(187,247,208,0.00)" />
                  </linearGradient>
                </defs>

                {/* Filled Area */}
                <polyline
                  points={`${toPolylinePoints(chargeHistory, 720, 140)} 720,180 0,180`}
                  fill="url(#areaGradGreen)"
                  stroke="none"
                />
                {/* Line */}
                <polyline
                  points={points}
                  fill="none"
                  stroke="url(#lineGradGreen)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Summary */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] md:text-xs">
              <div className="rounded-lg bg-green-50 border border-green-100 py-2">
                <p className="text-gray-500">Min</p>
                <p className="font-semibold text-green-700">60%</p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-100 py-2">
                <p className="text-gray-500">Avg</p>
                <p className="font-semibold text-green-700">79%</p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-100 py-2">
                <p className="text-gray-500">Max</p>
                <p className="font-semibold text-green-700">93%</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Battery;
