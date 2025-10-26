import React, { useEffect, useMemo, useState } from "react";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  LineSeries,
  DateTime,
  Legend,
  Tooltip,
} from "@syncfusion/ej2-react-charts";
import type { EdgeLabelPlacement } from "@syncfusion/ej2-react-charts";
import { ListPayments } from "../../../../services";

// ---------------- UI helpers ----------------
type MonthOption = { Id: number; Time: string }; // Id: -1=All, 0..11=Jan..Dec
const MONTH_OPTIONS: MonthOption[] = [
  { Id: -1, Time: "All" },
  { Id: 0, Time: "Jan" },
  { Id: 1, Time: "Feb" },
  { Id: 2, Time: "Mar" },
  { Id: 3, Time: "Apr" },
  { Id: 4, Time: "May" },
  { Id: 5, Time: "Jun" },
  { Id: 6, Time: "Jul" },
  { Id: 7, Time: "Aug" },
  { Id: 8, Time: "Sep" },
  { Id: 9, Time: "Oct" },
  { Id: 10, Time: "Nov" },
  { Id: 11, Time: "Dec" },
];

const MonthDropDown: React.FC<{
  currentMode: string;
  value: number;
  onChange: (val: number) => void;
}> = ({ currentMode, value, onChange }) => (
  <div className="w-28 border border-blue-300 px-2 py-1 rounded-md">
    <DropDownListComponent
      id="month"
      fields={{ text: "Time", value: "Id" }}
      style={{ border: "none", color: currentMode === "Dark" ? "white" : "#1D4ED8" }}
      value={value}
      dataSource={MONTH_OPTIONS}
      popupHeight="240px"
      popupWidth="120px"
      change={(e: any) => typeof e?.value === "number" && onChange(e.value)}
    />
  </div>
);

const YearDropDown: React.FC<{
  currentMode: string;
  years: number[];
  value: number;
  onChange: (val: number) => void;
}> = ({ currentMode, years, value, onChange }) => (
  <div className="w-28 border border-blue-300 px-2 py-1 rounded-md">
    <DropDownListComponent
      id="year"
      fields={{ text: "label", value: "value" }}
      style={{ border: "none", color: currentMode === "Dark" ? "white" : "#1D4ED8" }}
      value={value}
      dataSource={years.map((y) => ({ label: String(y), value: y }))}
      popupHeight="240px"
      popupWidth="120px"
      change={(e: any) => typeof e?.value === "number" && onChange(e.value)}
    />
  </div>
);

// ---------------- Chart axis base (จูนสไตล์) ----------------
const basePrimaryYAxis = {
  labelFormat: "{value}฿",
  rangePadding: "None" as const,
  minimum: 0,
  // maximum จะกำหนดแบบไดนามิกใน component
  interval: 1000,
  lineStyle: { width: 0 },
  majorTickLines: { width: 1, color: "#BFDBFE" },
  minorTickLines: { width: 0 },
  labelStyle: {
    color: "#2563EB",
    fontWeight: "600",
    fontFamily: "Inter, sans-serif",
  },
  majorGridLines: { width: 1, dashArray: "5,5", color: "#DBEAFE" },
};

const basePrimaryXAxis = {
  valueType: "DateTime" as const,
  labelFormat: "MMM yyyy",
  intervalType: "Months" as const,
  edgeLabelPlacement: "Shift" as EdgeLabelPlacement,
  majorGridLines: { width: 0 },
  background: "transparent",
  labelStyle: {
    color: "#2563EB",
    fontWeight: "600",
    fontFamily: "Inter, sans-serif",
  },
};

type Point = { x: Date; y: number };

const MonthlyRevenueChart: React.FC = () => {
  const { currentMode } = useStateContext();

  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(-1); // -1 = All (ทั้งปี)
  const [data, setData] = useState<Point[]>([]);
  const [yMax, setYMax] = useState<number>(5000); // default ก่อนมีข้อมูล

  // ดึงปีที่มีในข้อมูล + เตรียม chart data
  useEffect(() => {
    const run = async () => {
      const payments = await ListPayments();
      if (!Array.isArray(payments)) {
        setAvailableYears([]);
        setData([]);
        setYMax(1000);
        return;
      }

      // 1) สร้างรายการปีจากข้อมูลจริง
      const yearsSet = new Set<number>();
      for (const p of payments) {
        const d = new Date(p?.Date);
        if (!isNaN(d.getTime())) yearsSet.add(d.getFullYear());
      }
      const years = Array.from(yearsSet).sort((a, b) => a - b);
      setAvailableYears(years);

      // ถ้าปีที่เลือกไม่มีในข้อมูล ให้ fallback เป็นปีล่าสุดในข้อมูล
      const activeYear = years.includes(year) ? year : years[years.length - 1] ?? now.getFullYear();
      if (activeYear !== year) setYear(activeYear);

      // 2) เตรียมโครง 12 เดือนของปี (ค่าตั้งต้น = 0)
      const monthlyMap = Array.from({ length: 12 }, () => 0);

      // 3) รวมยอดตามปีที่เลือก
      for (const p of payments) {
        const d = new Date(p?.Date);
        if (isNaN(d.getTime())) continue;
        if (d.getFullYear() !== activeYear) continue;
        const m = d.getMonth(); // 0..11
        monthlyMap[m] += Number(p?.Amount) || 0;
      }

      // 4) ถ้า month = -1 (All) แสดงทั้ง 12 จุด, ถ้าเลือกเดือน ให้แสดงเฉพาะเดือนนั้น (1 จุด)
      let points: Point[] = [];
      if (month === -1) {
        points = monthlyMap.map((sum, m) => ({
          x: new Date(activeYear, m, 1),
          y: sum,
        }));
      } else {
        points = [{
          x: new Date(activeYear, month, 1),
          y: monthlyMap[month] || 0,
        }];
      }

      // 5) จัดเรียงตามเวลา + คำนวณ yMax อัตโนมัติ (ปัดขึ้นเป็นขั้นละ 1,000)
      points.sort((a, b) => a.x.getTime() - b.x.getTime());
      const localMax = Math.max(0, ...points.map((p) => p.y));
      const roundedMax = Math.max(1000, Math.ceil(localMax / 1000) * 1000);
      setYMax(roundedMax);
      setData(points);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const monthLabel = useMemo(
    () => MONTH_OPTIONS.find((m) => m.Id === month)?.Time ?? "All",
    [month]
  );

  const lineCustomSeries = [
    {
      dataSource: data,
      xName: "x",
      yName: "y",
      name: "Monthly Revenue",
      width: "3",
      fill: "rgba(59,130,246,0.15)",        // พื้นกราฟฟ้าใส
      border: { width: 3, color: "#2563EB" },// เส้นฟ้าเข้ม EV
      marker: {
        visible: true,
        width: 10,
        height: 10,
        fill: "#60A5FA",
        border: { width: 2, color: "#1E3A8A" },
      },
      type: "Line",
      animation: { enable: true, duration: 800, delay: 0 },
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 text-blue-800 p-6 rounded-2xl w-96 md:w-760 shadow-sm border border-blue-200">
      {/* Header */}
      <div className="flex justify-between items-center gap-2 mb-8">
        <p className="text-xl font-semibold text-blue-800">
          Monthly Revenue Overview{" "}
          <span className="text-blue-500">
            ({monthLabel} {year})
          </span>
        </p>

        {/* Filters: Month + Year */}
        <div className="flex items-center gap-2">
          <MonthDropDown currentMode={currentMode} value={month} onChange={setMonth} />
          <YearDropDown
            currentMode={currentMode}
            years={availableYears.length ? availableYears : [year]}
            value={year}
            onChange={setYear}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="md:w-full overflow-auto">
        <ChartComponent
          id="monthly-revenue-chart"
          height="420px"
          primaryXAxis={basePrimaryXAxis}
          primaryYAxis={{ ...basePrimaryYAxis, maximum: yMax, interval: 1000 }}
          chartArea={{ border: { width: 0 } }}
          tooltip={{
            enable: true,
            // แสดงเป็น: "Oct 2025 : 28,680฿"
            format: "${point.x} : ${point.y}฿",
          }}
          margin={{ top: 10, bottom: 40, left: 10, right: 10 }}
          legendSettings={{
            visible: true,
            position: "Bottom",
            alignment: "Center",
            textStyle: { color: "#2563EB", fontWeight: "600" },
            background: "transparent",
          }}
          background={currentMode === "Dark" ? "#1E293B" : "transparent"}
        >
          <Inject services={[LineSeries, DateTime, Legend, Tooltip]} />
          <SeriesCollectionDirective>
            {lineCustomSeries.map((item: any, index: number) => (
              <SeriesDirective key={index} {...item} />
            ))}
          </SeriesCollectionDirective>
        </ChartComponent>
      </div>
    </div>
  );
};

export default MonthlyRevenueChart;
