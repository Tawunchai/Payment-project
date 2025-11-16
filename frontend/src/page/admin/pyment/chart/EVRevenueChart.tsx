// EVRevenueChart.tsx
import React, { useEffect, useState } from "react";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  DateTime,
  Legend,
  Tooltip,
  LineSeries,
} from "@syncfusion/ej2-react-charts";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { ListEVChargingPayments } from "../../../../services";
import { EVChargingPayListmentInterface } from "../../../../interface/IEV";

/* ============================================================
   TYPES + RANGE GUARDS
============================================================ */
type RangeType = "day" | "month" | "year";

const isDateRange = (v: any): v is [Date, Date] =>
  Array.isArray(v) &&
  v.length === 2 &&
  v.every((d) => d instanceof Date && !isNaN(d.getTime()));

const isMonthSel = (v: any): v is { month: string; year: string } =>
  v &&
  typeof v === "object" &&
  typeof v.month === "string" &&
  typeof v.year === "string";

const isYearRange = (v: any): v is [number, number] =>
  Array.isArray(v) &&
  v.length === 2 &&
  v.every((n) => typeof n === "number");

/* ============================================================
   HELPERS
============================================================ */
const daysInMonth = (y: number, m1to12: number) =>
  new Date(y, m1to12, 0).getDate();

const firstDayOfMonth = (y: number, m0to11: number) =>
  new Date(y, m0to11, 1);

const firstDayOfYear = (y: number) => new Date(y, 0, 1);

const kDay = (y: number, m1to12: number, d: number) =>
  `${y}-${String(m1to12).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const kMonth = (y: number, m1to12: number) =>
  `${y}-${String(m1to12).padStart(2, "0")}`;

/* ============================================================
   TYPES
============================================================ */
type SeriesPoint = { x: Date; y: number };
type EvSeries = { name: string; evId: number; color: string; data: SeriesPoint[] };

const PALETTE = [
  "#2563eb",
  "#ea580c",
  "#1d4ed8",
  "#c2410c",
  "#1e40af",
  "#9a3412",
  "#1e3a8a",
  "#7c2d12",
];

/* ============================================================
   COLOR UTILS
============================================================ */
const hexToRgb = (hex: string) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 37, g: 99, b: 235 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
};

const rgba = (hex: string, a: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

const lighten = (hex: string, pct = 0.35) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(
    ${Math.round(r + (255 - r) * pct)},
    ${Math.round(g + (255 - g) * pct)},
    ${Math.round(b + (255 - b) * pct)}
  )`;
};

const darken = (hex: string, pct = 0.2) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(
    ${Math.round(r * (1 - pct))},
    ${Math.round(g * (1 - pct))},
    ${Math.round(b * (1 - pct))}
  )`;
};

/* ============================================================
   LOADER
============================================================ */
const Loader = () => (
  <div className="flex items-center justify-center h-80 text-blue-700">
    <span className="animate-spin border-4 border-blue-300 rounded-full border-t-transparent w-8 h-8 mr-3" />
    Loading...
  </div>
);

/* ============================================================
   MAIN COMPONENT
============================================================ */
const EVRevenueChart: React.FC<{
  timeRangeType: RangeType;
  selectedRange: any;
}> = ({ timeRangeType, selectedRange }) => {
  // @ts-ignore
  const { currentMode } = useStateContext();

  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [noData, setNoData] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ============================================================
     FETCH + BUILD DATA
  ============================================================= */
  useEffect(() => {

    // Validate range type
    const valid =
      (timeRangeType === "day" && isDateRange(selectedRange)) ||
      (timeRangeType === "month" && isMonthSel(selectedRange)) ||
      (timeRangeType === "year" && isYearRange(selectedRange));

    if (!valid) {
      setSeriesData([]);
      setNoData(false);
      return;
    }

    const run = async () => {
      setLoading(true);

      try {
        const res = await ListEVChargingPayments();

        if (!res || res.length === 0) {
          setSeriesData([]);
          setNoData(true);
          return;
        }

        /* ============================================================
           FILTER BY RANGE
        ============================================================= */
        const filtered = (res as any[]).filter((r) => {
          const iso = r?.Payment?.Date;
          if (!iso) return false;

          const d = new Date(iso);

          if (timeRangeType === "day" && isDateRange(selectedRange)) {
            const [s0, e0] = selectedRange;
            const s = new Date(s0);
            const e = new Date(e0);
            e.setHours(23, 59, 59, 999);
            return d >= s && d <= e;
          }

          if (timeRangeType === "month" && isMonthSel(selectedRange)) {
            return (
              d.getFullYear() === Number(selectedRange.year) &&
              d.getMonth() + 1 === Number(selectedRange.month)
            );
          }

          if (timeRangeType === "year" && isYearRange(selectedRange)) {
            const [ys, ye] = selectedRange;
            return d.getFullYear() >= ys && d.getFullYear() <= ye;
          }

          return false;
        });

        if (filtered.length === 0) {
          setSeriesData([]);
          setNoData(true);
          return;
        }

        /* ============================================================
           GROUP BY EV
        ============================================================= */
        type EvBucket = {
          name: string;
          items: EVChargingPayListmentInterface[];
        };

        const byEv: Record<number, EvBucket> = {};

        for (const r of filtered) {
          const evId = r.EVchargingID;
          const evName = r?.EVcharging?.Name || `EV #${evId}`;
          if (!byEv[evId]) byEv[evId] = { name: evName, items: [] };
          byEv[evId].items.push(r);
        }

        const colorFor = (i: number) => PALETTE[i % PALETTE.length];

        /* ============================================================
           SUM FUNCTIONS
        ============================================================= */
        const sumDaily = (rows: EVChargingPayListmentInterface[]) => {
          const map: Record<string, number> = {};
          for (const r of rows) {
            const iso = r.Payment?.Date;
            const d = new Date(iso!);
            const t = r.Price || 0;
            const key = kDay(
              d.getFullYear(),
              d.getMonth() + 1,
              d.getDate()
            );
            map[key] = (map[key] || 0) + t;
          }
          return map;
        };

        const sumMonthly = (rows: EVChargingPayListmentInterface[]) => {
          const map: Record<string, number> = {};
          for (const r of rows) {
            const iso = r.Payment?.Date;
            const d = new Date(iso!);
            const t = r.Price || 0;
            const key = kMonth(d.getFullYear(), d.getMonth() + 1);
            map[key] = (map[key] || 0) + t;
          }
          return map;
        };

        const sumYearly = (rows: EVChargingPayListmentInterface[]) => {
          const map: Record<string, number> = {};
          for (const r of rows) {
            const iso = r.Payment?.Date;
            const d = new Date(iso!);
            const t = r.Price || 0;
            const key = String(d.getFullYear());
            map[key] = (map[key] || 0) + t;
          }
          return map;
        };

        /* ============================================================
           BUILD SERIES
        ============================================================= */
        const build = (): EvSeries[] => {
          const out: EvSeries[] = [];
          const evIds = Object.keys(byEv).map(Number);

          evIds.forEach((evId, idx) => {
            const bucket = byEv[evId];
            const color = colorFor(idx);
            let data: SeriesPoint[] = [];

            /* -------------------- DAILY -------------------- */
            if (timeRangeType === "day" && isDateRange(selectedRange)) {
              const [s0, e0] = selectedRange;

              const s = new Date(s0);
              s.setHours(0, 0, 0, 0);

              const e = new Date(e0);
              e.setHours(23, 59, 59, 999);

              const map = sumDaily(bucket.items);
              const arr: SeriesPoint[] = [];

              const cur = new Date(s);
              while (cur <= e) {
                const key = kDay(
                  cur.getFullYear(),
                  cur.getMonth() + 1,
                  cur.getDate()
                );
                arr.push({ x: new Date(cur), y: map[key] || 0 });
                cur.setDate(cur.getDate() + 1);
              }

              data = arr;
            }

            /* -------------------- MONTHLY -------------------- */
            if (timeRangeType === "month" && isMonthSel(selectedRange)) {
              const y = Number(selectedRange.year);
              const m = Number(selectedRange.month);

              const map = sumDaily(bucket.items);
              const days = daysInMonth(y, m);

              const arr: SeriesPoint[] = [];
              for (let d = 1; d <= days; d++) {
                const key = kDay(y, m, d);
                arr.push({
                  x: new Date(y, m - 1, d),
                  y: map[key] || 0,
                });
              }

              data = arr;
            }

            /* -------------------- YEARLY -------------------- */
            if (timeRangeType === "year" && isYearRange(selectedRange)) {
              const [ys, ye] = selectedRange;

              // Single year → monthly breakdown
              if (ys === ye) {
                const y = ys;
                const map = sumMonthly(bucket.items);
                const arr: SeriesPoint[] = [];

                for (let m = 1; m <= 12; m++) {
                  const key = kMonth(y, m);
                  arr.push({
                    x: firstDayOfMonth(y, m - 1),
                    y: map[key] || 0,
                  });
                }

                data = arr;
              } else {
                // Multi years
                const map = sumYearly(bucket.items);
                const arr: SeriesPoint[] = [];

                for (let y = ys; y <= ye; y++) {
                  arr.push({
                    x: firstDayOfYear(y),
                    y: map[String(y)] || 0,
                  });
                }

                data = arr;
              }
            }

            out.push({
              name: bucket.name,
              evId,
              color,
              data: data.sort(
                (a, b) => a.x.getTime() - b.x.getTime()
              ),
            });
          });

          return out;
        };

        const allSeries = build();

        setSeriesData(
          allSeries.map((s) => ({
            dataSource: s.data,
            xName: "x",
            yName: "y",
            name: s.name,
            type: "Line",
            width: 3,
            fill: rgba(s.color, 0.15),
            border: { width: 3, color: s.color },
            marker: {
              visible: true,
              width: 10,
              height: 10,
              fill: lighten(s.color, 0.45),
              border: {
                width: 2,
                color: darken(s.color, 0.25),
              },
            },
            animation: { enable: true, duration: 1000 },
          }))
        );

        setNoData(allSeries.every((s) => s.data.length === 0));
      } catch {
        setSeriesData([]);
        setNoData(true);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [timeRangeType, selectedRange]);

  /* ============================================================
     AXIS SETTINGS
  ============================================================= */
  const isSingleYear =
    timeRangeType === "year" &&
    isYearRange(selectedRange) &&
    selectedRange[0] === selectedRange[1];

  const xLabelFormat =
    timeRangeType === "day"
      ? "dd/MM"
      : timeRangeType === "month"
      ? "dd MMM"
      : isSingleYear
      ? "MMM"
      : "yyyy";

  const xIntervalType =
    timeRangeType === "day"
      ? "Days"
      : timeRangeType === "month"
      ? "Days"
      : isSingleYear
      ? "Months"
      : "Years";

  /* ============================================================
     RENDER
  ============================================================= */
  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-sm border border-blue-200 text-blue-800">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <p className="text-base sm:text-lg font-semibold">
          EV Revenue Overview
        </p>
        <span className="text-xs sm:text-sm px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          {timeRangeType === "day"
            ? "Daily"
            : timeRangeType === "month"
            ? "Monthly"
            : "Yearly"}
        </span>
      </div>

      <div className="relative" style={{ minHeight: 440 }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
            <Loader />
          </div>
        )}

        {!loading && noData ? (
          <div className="flex items-center justify-center h-80 text-red-500 font-bold">
            ไม่มีข้อมูลในช่วงเวลาที่เลือก
          </div>
        ) : (
          <div className="overflow-x-auto">
            <ChartComponent
              id="ev-revenue"
              height="420px"
              width="100%"
              primaryXAxis={{
                valueType: "DateTime",
                labelFormat: xLabelFormat,
                intervalType: xIntervalType as any,
                edgeLabelPlacement: "Shift",
                majorGridLines: { width: 0 },
                labelStyle: { color: "#2563EB", fontWeight: "600" },
              }}
              primaryYAxis={{
                labelFormat: "{value} ฿",
                majorGridLines: {
                  width: 1,
                  dashArray: "5,5",
                  color: "#DBEAFE",
                },
                labelStyle: {
                  color: "#2563EB",
                  fontWeight: "600",
                },
              }}
              tooltip={{
                enable: true,
                shared: true,
                format:
                  "<b>${series.name}</b> : ${point.y}",
              }}
              legendSettings={{
                visible: true,
                position: "Bottom",
                alignment: "Center",
                textStyle: { color: "#2563EB", fontWeight: "600" },
              }}
              chartArea={{ border: { width: 0 } }}
            >
              <Inject services={[LineSeries, DateTime, Legend, Tooltip]} />
              <SeriesCollectionDirective>
                {seriesData.map((s, i) => (
                  <SeriesDirective key={i} {...s} />
                ))}
              </SeriesCollectionDirective>
            </ChartComponent>
          </div>
        )}
      </div>
    </div>
  );
};

export default EVRevenueChart;
