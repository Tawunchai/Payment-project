import { useEffect, useState } from "react";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { dropdownData } from "../../../../assets/admin/dummy";
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

const LinePrimaryYAxis = {
  labelFormat: "{value}฿",
  rangePadding: "None" as "None",
  minimum: 0,
  maximum: 5000,
  interval: 1000,
  lineStyle: { width: 0 },
  majorTickLines: { width: 1, color: "#BFDBFE" },
  minorTickLines: { width: 0 },
  labelStyle: {
    color: "#2563EB",
    fontWeight: "600",
    fontFamily: "Inter, sans-serif",
  },
  majorGridLines: { width: 1, dashArray: "4,4", color: "#DBEAFE" },
};

const LinePrimaryXAxis = {
  valueType: "DateTime" as "DateTime",
  labelFormat: "MMM yyyy",
  intervalType: "Months" as "Months",
  edgeLabelPlacement: "Shift" as EdgeLabelPlacement,
  majorGridLines: { width: 0 },
  background: "transparent",
  labelStyle: {
    color: "#2563EB",
    fontWeight: "600",
    fontFamily: "Inter, sans-serif",
  },
};

const DropDown = ({ currentMode }: any) => (
  <div className="w-24 border border-blue-300 px-2 py-1 rounded-md">
    <DropDownListComponent
      id="time"
      fields={{ text: "Time", value: "Id" }}
      style={{
        border: "none",
        color: currentMode === "Dark" ? "white" : "#1E40AF",
      }}
      value="1"
      dataSource={dropdownData}
      popupHeight="180px"
      popupWidth="100px"
    />
  </div>
);

const MonthlyRevenueChartMobile = () => {
  const { currentMode } = useStateContext();
  const [chartData, setChartData] = useState<{ x: Date; y: number }[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      const payments = await ListPayments();
      if (!payments) return;

      const monthMap: Record<string, number> = {};
      for (const p of payments) {
        const date = new Date(p.Date);
        const yearMonth = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        monthMap[yearMonth] = (monthMap[yearMonth] || 0) + (p.Amount || 0);
      }

      const dataArray = Object.entries(monthMap)
        .map(([ym, total]) => {
          const [year, month] = ym.split("-").map(Number);
          return { x: new Date(year, month - 1, 1), y: Number(total) };
        })
        .sort((a, b) => a.x.getTime() - b.x.getTime());

      setChartData(dataArray);
    };

    fetchChartData();
  }, []);

  const lineCustomSeries = [
    {
      dataSource: chartData,
      xName: "x",
      yName: "y",
      name: "Monthly Revenue",
      width: "2",
      fill: "rgba(59,130,246,0.1)",
      border: { width: 2, color: "#2563EB" },
      marker: {
        visible: true,
        width: 8,
        height: 8,
        fill: "#3B82F6",
        border: { width: 2, color: "#1E40AF" },
      },
      type: "Line",
      animation: { enable: true, duration: 800 },
    },
  ];

  return (
    <div className="w-[94%] mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 rounded-2xl shadow-sm border border-blue-200 text-blue-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-base font-semibold">Monthly Revenue</p>
        <DropDown currentMode={currentMode} />
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <ChartComponent
          id="mobile-monthly-revenue-chart"
          height="260px"
          primaryXAxis={LinePrimaryXAxis}
          primaryYAxis={LinePrimaryYAxis}
          chartArea={{ border: { width: 0 } }}
          tooltip={{ enable: true }}
          margin={{ top: 10, bottom: 30, left: 10, right: 10 }}
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

export default MonthlyRevenueChartMobile;
