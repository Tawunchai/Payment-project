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

/** โทนสีหลัก: น้ำเงินเข้ม / ส้มเข้ม */
const PALETTE = [
    "#2563eb", // blue-600
    "#ea580c", // orange-600
    "#1d4ed8", // blue-700
    "#c2410c", // orange-700
    "#1e40af", // blue-800
    "#9a3412", // orange-800
    "#1e3a8a", // blue-900
    "#7c2d12", // orange-900
];

const Loader = () => (
    <div className="flex items-center justify-center h-80 text-lg text-gray-600">
        <span className="animate-spin border-4 border-teal-300 rounded-full border-t-transparent w-8 h-8 mr-3" />
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

                if (!res || res.length === 0) {
                    setSeriesData([]); setNoData(true); return;
                }

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

                if (filtered.length === 0) {
                    setSeriesData([]); setNoData(true); return;
                }

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
                                    const avgPerMonth = sumYear / 12; // เปลี่ยนเป็น sumYear ถ้าต้องการผลรวมรายปี
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

                setSeriesData(
                    allSeries.map((s) => ({
                        dataSource: s.data,
                        xName: "x",
                        yName: "y",
                        name: s.name,
                        type: "Line",
                        // ทำให้เส้นเข้ม/ชัด
                        fill: s.color,        // <<— ใช้สีทึบ
                        width: 1,             // ขยายความหนาเส้น
                        // ทำให้ marker ชัดขึ้น
                        marker: {
                            visible: true,
                            width: 8,
                            height: 8,
                            fill: s.color,
                            border: { width: 1, color: s.color }
                        },
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
        <div className="relative" style={{ minHeight: 440 }}>
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl
                        bg-white/60 dark:bg-black/40">
                    <Loader />
                </div>
            )}

            {!loading && noData ? (
                <div className="flex items-center justify-center h-80 text-red-500 font-bold">
                    ไม่มีข้อมูลในช่วงเวลาที่เลือก
                </div>
            ) : (
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
                    }}
                    primaryYAxis={{
                        labelFormat: "{value}฿",
                        rangePadding: "None",
                        lineStyle: { width: 0 },
                        majorTickLines: { width: 0 },
                        minorTickLines: { width: 0 },
                    }}
                    chartArea={{ border: { width: 0 } }}
                    tooltip={{ enable: true }}
                    background={currentMode === "Dark" ? "#33373E" : "#fff"}
                    legendSettings={{ visible: true, position: "Bottom" }}
                >
                    <Inject services={[LineSeries, DateTime, Legend, Tooltip]} />
                    <SeriesCollectionDirective>
                        {seriesData.map((s, i) => <SeriesDirective key={i} {...s} />)}
                    </SeriesCollectionDirective>
                </ChartComponent>
            )}
        </div>
    );
};

export default EVRevenueChart;
