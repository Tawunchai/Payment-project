// EVRevenueChart.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  ChartComponent, SeriesCollectionDirective, SeriesDirective,
  Inject, DateTime, Legend, Tooltip, LineSeries,
} from "@syncfusion/ej2-react-charts";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { ListEVChargingPayments } from "../../../../services";
import { EVChargingPayListmentInterface } from "../../../../interface/IEV";

type RangeType = "day" | "month" | "year";

/* ---------- guards ---------- */
const isDateRange = (v: any): v is [Date, Date] =>
  Array.isArray(v) && v.length === 2 && v.every((d) => d instanceof Date && !isNaN(d.getTime()));
const isMonthSel = (v: any): v is { month: string; year: string } =>
  v && typeof v === "object" && "month" in v && "year" in v;
const isYearRange = (v: any): v is [number, number] =>
  Array.isArray(v) && v.length === 2 && v.every((n) => Number.isFinite(n));

/* ---------- helpers ---------- */
const daysInMonth = (y: number, m1to12: number) => new Date(y, m1to12, 0).getDate();
const firstDayOfMonth = (y: number, m0to11: number) => new Date(y, m0to11, 1);
const firstDayOfYear = (y: number) => new Date(y, 0, 1);
const kDay = (y: number, m1to12: number, d: number) =>
  `${y}-${String(m1to12).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const kMonth = (y: number, m1to12: number) => `${y}-${String(m1to12).padStart(2, "0")}`;

type SeriesPoint = { x: Date; y: number };
type EvSeries = { name: string; evId: number; color: string; data: SeriesPoint[] };

/** โทนสีหลัก: น้ำเงิน/ส้ม (หลายเฉด) */
const PALETTE = [
  "#2563eb", "#ea580c", "#1d4ed8", "#c2410c",
  "#1e40af", "#9a3412", "#1e3a8a", "#7c2d12",
];

/* ---------- color utils (ทำให้ marker มี “สองวง” คนละเฉด) ---------- */
const hexToRgb = (hex: string) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 37, g: 99, b: 235 }; // fallback blue-600
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
};
const rgba = (hex: string, a: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};
const lighten = (hex: string, pct = 0.35) => {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.round(r + (255 - r) * pct);
  const lg = Math.round(g + (255 - g) * pct);
  const lb = Math.round(b + (255 - b) * pct);
  return `rgb(${lr},${lg},${lb})`;
};
const darken = (hex: string, pct = 0.2) => {
  const { r, g, b } = hexToRgb(hex);
  const dr = Math.round(r * (1 - pct));
  const dg = Math.round(g * (1 - pct));
  const db = Math.round(b * (1 - pct));
  return `rgb(${dr},${dg},${db})`;
};

const Loader = () => (
  <div className="flex items-center justify-center h-80 text-blue-700">
    <span className="animate-spin border-4 border-blue-300 rounded-full border-t-transparent w-8 h-8 mr-3" />
    Loading...
  </div>
);

const EVRevenueChart: React.FC<{ timeRangeType: RangeType; selectedRange: any; }> = ({
  timeRangeType, selectedRange,
}) => {
  // @ts-ignore
  const { currentMode } = useStateContext();
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [noData, setNoData] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const id = ++fetchIdRef.current;

    const valid =
      (timeRangeType === "day" && isDateRange(selectedRange)) ||
      (timeRangeType === "month" && isMonthSel(selectedRange)) ||
      (timeRangeType === "year" && isYearRange(selectedRange));

    if (!valid) {
      setLoading(true);
      setSeriesData([]);
      setNoData(false);
      setTimeout(() => { if (id === fetchIdRef.current) setLoading(false); }, 150);
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const res = await ListEVChargingPayments();
        if (id !== fetchIdRef.current) return;

        if (!res || res.length === 0) { setSeriesData([]); setNoData(true); return; }

        // filter by range
        const filtered: EVChargingPayListmentInterface[] = (res as any[]).filter((r) => {
          const iso = r?.Payment?.Date;
          if (!iso) return false;
          const d = new Date(iso);

          if (timeRangeType === "day") {
            const [s0, e0] = selectedRange as [Date, Date];
            const s = new Date(s0); const e = new Date(e0); e.setHours(23, 59, 59, 999);
            return d >= s && d <= e;
          }
          if (timeRangeType === "month") {
            const { month, year } = selectedRange as { month: string; year: string };
            return kMonth(d.getFullYear(), d.getMonth() + 1) === kMonth(+year, +month);
          }
          const [ys, ye] = selectedRange as [number, number];
          return d.getFullYear() >= ys && d.getFullYear() <= ye;
        });

        if (filtered.length === 0) { setSeriesData([]); setNoData(true); return; }

        // group by EV
        type EvBucket = { name: string; items: EVChargingPayListmentInterface[] };
        const byEv: Record<number, EvBucket> = {};
        for (const r of filtered) {
          const evId = (r as any).EVchargingID as number;
          const evName = (r as any)?.EVcharging?.Name as string | undefined;
          if (!byEv[evId]) byEv[evId] = { name: evName ? evName : `EV #${evId}`, items: [] };
          byEv[evId].items.push(r);
        }

        const colorFor = (index: number) => PALETTE[index % PALETTE.length];

        const build = (): EvSeries[] => {
          const evIds = Object.keys(byEv).map(Number).sort((a, b) => a - b);
          const out: EvSeries[] = [];

          const sumDaily = (rows: EVChargingPayListmentInterface[]) => {
            const map: Record<string, number> = {};
            for (const r of rows) {
              const iso = (r as any)?.Payment?.Date; if (!iso) continue;
              const d = new Date(iso); if (isNaN(d.getTime())) continue;
              const t = ((r as any).Price || 0) * ((r as any).Quantity || 0);
              const key = kDay(d.getFullYear(), d.getMonth() + 1, d.getDate());
              map[key] = (map[key] || 0) + t;
            }
            return map;
          };
          const sumMonthly = (rows: EVChargingPayListmentInterface[]) => {
            const map: Record<string, number> = {};
            for (const r of rows) {
              const iso = (r as any)?.Payment?.Date; if (!iso) continue;
              const d = new Date(iso); if (isNaN(d.getTime())) continue;
              const t = ((r as any).Price || 0) * ((r as any).Quantity || 0);
              const key = kMonth(d.getFullYear(), d.getMonth() + 1);
              map[key] = (map[key] || 0) + t;
            }
            return map;
          };
          const sumYearly = (rows: EVChargingPayListmentInterface[]) => {
            const map: Record<string, number> = {};
            for (const r of rows) {
              const iso = (r as any)?.Payment?.Date; if (!iso) continue;
              const d = new Date(iso); if (isNaN(d.getTime())) continue;
              const t = ((r as any).Price || 0) * ((r as any).Quantity || 0);
              const key = String(d.getFullYear());
              map[key] = (map[key] || 0) + t;
            }
            return map;
          };

          evIds.forEach((evId, idx) => {
            const bucket = byEv[evId];
            const color = colorFor(idx);
            let data: SeriesPoint[] = [];

            if (timeRangeType === "day") {
              const [s0, e0] = selectedRange as [Date, Date];
              const s = new Date(s0); s.setHours(0, 0, 0, 0);
              const e = new Date(e0); e.setHours(23, 59, 59, 999);
              const map = sumDaily(bucket.items);
              const arr: SeriesPoint[] = [];
              const cur = new Date(s);
              while (cur <= e) {
                const key = kDay(cur.getFullYear(), cur.getMonth() + 1, cur.getDate());
                arr.push({ x: new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()), y: map[key] || 0 });
                cur.setDate(cur.getDate() + 1);
              }
              data = arr;
            }

            if (timeRangeType === "month") {
              const { month, year } = selectedRange as { month: string; year: string };
              const y = +year, m1 = +month, days = daysInMonth(y, m1);
              const map = sumDaily(bucket.items);
              const arr: SeriesPoint[] = [];
              for (let d = 1; d <= days; d++) {
                const key = kDay(y, m1, d);
                arr.push({ x: new Date(y, m1 - 1, d), y: map[key] || 0 });
              }
              data = arr;
            }

            if (timeRangeType === "year") {
              const [ys, ye] = selectedRange as [number, number];
              if (ys === ye) {
                const y = ys;
                const map = sumMonthly(bucket.items);
                const arr: SeriesPoint[] = [];
                for (let m = 1; m <= 12; m++) {
                  const key = kMonth(y, m);
                  arr.push({ x: firstDayOfMonth(y, m - 1), y: map[key] || 0 });
                }
                data = arr;
              } else {
                const map = sumYearly(bucket.items);
                const arr: SeriesPoint[] = [];
                for (let y = ys; y <= ye; y++) {
                  const sumYear = map[String(y)] || 0;
                  const avgPerMonth = sumYear / 12;
                  arr.push({ x: firstDayOfYear(y), y: avgPerMonth });
                }
                data = arr;
              }
            }

            out.push({
              name: bucket.name,
              evId,
              color,
              data: data.sort((a, b) => a.x.getTime() - b.x.getTime()),
            });
          });

          return out;
        };

        const allSeries = build();
        if (id !== fetchIdRef.current) return;

        // === สไตล์เส้น “ตามตัวอย่าง” + marker สองวงสีต่างกัน ===
        setSeriesData(
          allSeries.map((s) => ({
            dataSource: s.data,
            xName: "x",
            yName: "y",
            name: s.name,
            type: "Line",
            width: 3,                              // เส้นหนาชัด
            fill: rgba(s.color, 0.15),             // พื้นโปร่งใสอ่อน ๆ
            border: { width: 3, color: s.color },  // เส้นสีหลัก (เหมือนตัวอย่าง)
            marker: {
              visible: true,
              width: 10,
              height: 10,
              fill: lighten(s.color, 0.45),        // วงใน (ไส้) สีอ่อน
              border: { width: 2, color: darken(s.color, 0.25) }, // วงนอก (ขอบ) สีเข้ม
            },
            animation: { enable: true, duration: 1000, delay: 0 },
          }))
        );

        setNoData(allSeries.every((s) => s.data.length === 0));
      } catch {
        if (id !== fetchIdRef.current) return;
        setSeriesData([]); setNoData(true);
      } finally {
        if (id === fetchIdRef.current) setLoading(false);
      }
    };

    run();
  }, [timeRangeType, selectedRange]);

  /* ---- Axis ---- */
  const isSingleYear =
    timeRangeType === "year" &&
    Array.isArray(selectedRange) && selectedRange.length === 2 &&
    Number.isFinite(selectedRange[0]) && Number.isFinite(selectedRange[1]) &&
    selectedRange[0] === selectedRange[1];

  const xLabelFormat =
    timeRangeType === "day" ? "dd/MM" :
      timeRangeType === "month" ? "dd MMM" :
        isSingleYear ? "MMM" : "yyyy";

  const xIntervalType =
    timeRangeType === "day" ? "Days" :
      timeRangeType === "month" ? "Days" :
        isSingleYear ? "Months" : "Years";

  const xMin = isSingleYear ? new Date(selectedRange[0], 0, 1) : undefined;
  const xMax = isSingleYear ? new Date(selectedRange[0], 11, 31) : undefined;
  const xInterval = isSingleYear ? 1 : undefined;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-sm border border-blue-200 text-blue-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <p className="text-base sm:text-lg font-semibold">EV Revenue Overview</p>
        <span className="text-xs sm:text-sm px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          {timeRangeType === "day" ? "Daily" : timeRangeType === "month" ? "Monthly" : "Yearly"}
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
              style={{ display: "block" }}
              primaryXAxis={{
                valueType: "DateTime",
                labelFormat: xLabelFormat,
                intervalType: xIntervalType as any,
                interval: xInterval as any,
                minimum: xMin,
                maximum: xMax,
                edgeLabelPlacement: "Shift",
                majorGridLines: { width: 0 },
                labelStyle: { color: "#2563EB", fontWeight: "600", fontFamily: "Inter, sans-serif" },
              }}
              primaryYAxis={{
                labelFormat: "{value}฿",
                rangePadding: "None",
                lineStyle: { width: 0 },
                majorTickLines: { width: 1, color: "#BFDBFE" },
                minorTickLines: { width: 0 },
                labelStyle: { color: "#2563EB", fontWeight: "600", fontFamily: "Inter, sans-serif" },
                majorGridLines: { width: 1, dashArray: "5,5", color: "#DBEAFE" },
              }}
              chartArea={{ border: { width: 0 } }}
              tooltip={{
                enable: true,
                shared: true,
                format: "<b>${series.name}</b><br/>${x:dd MMM yyyy} : ฿${point.y}",
              }}
              background={currentMode === "Dark" ? "#1E293B" : "transparent"}
              legendSettings={{
                visible: true,
                position: "Bottom",
                alignment: "Center",
                textStyle: { color: "#2563EB", fontWeight: "600" },
                background: "transparent",
              }}
              margin={{ top: 10, bottom: 40, left: 10, right: 10 }}
            >
              <Inject services={[LineSeries, DateTime, Legend, Tooltip]} />
              <SeriesCollectionDirective>
                {seriesData.map((s, i) => <SeriesDirective key={i} {...s} />)}
              </SeriesCollectionDirective>
            </ChartComponent>
          </div>
        )}
      </div>
    </div>
  );
};

export default EVRevenueChart;
