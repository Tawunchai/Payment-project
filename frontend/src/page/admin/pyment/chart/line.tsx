import { useEffect, useState } from "react";
import { DatePicker, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useStateContext } from "../../../../contexts/ContextProvider";
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
import { ListEVChargingPayments } from "../../../../services";
import { EVChargingPayListmentInterface } from "../../../../interface/IEV";
import "dayjs/locale/th";

const { RangePicker } = DatePicker;

const LinePrimaryYAxis = {
  labelFormat: "{value}฿",
  rangePadding: "None" as "None",
  lineStyle: { width: 0 },
  majorTickLines: { width: 1, color: "#CBD5E1" },
  minorTickLines: { width: 0 },
  labelStyle: {
    color: "#64748B",
    fontWeight: "600",
    fontFamily: "Inter, sans-serif",
  },
  majorGridLines: { width: 1, dashArray: "5,5", color: "#E2E8F0" },
};

// ================== MAIN COMPONENT ==================
const MonthlyRevenueChart = () => {
  //@ts-ignore
  const { currentMode } = useStateContext();
  const [chartDataSets, setChartDataSets] = useState<any[]>([]);

  // 🕒 โหมดช่วงเวลา: day / month / year
  const [rangeType, setRangeType] = useState<"day" | "month" | "year">("day");

  // 🗓️ state ของช่วงเวลา (Dayjs)
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(7, "day"));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  // ================== ฟังก์ชันโหลดข้อมูล ==================
  useEffect(() => {
    const fetchChartData = async () => {
      const data = await ListEVChargingPayments();
      if (!data) return;

      const grouped: Record<string, number> = {};

      for (const p of data as EVChargingPayListmentInterface[]) {
        const paymentDate = p.Payment?.Date;
        if (!paymentDate) continue;
        const date = dayjs(paymentDate);

        // ตรวจสอบช่วงเวลา
        if (date.isBefore(startDate) || date.isAfter(endDate)) continue;

        // กำหนด key ตามโหมด
        let key = "";
        if (rangeType === "day") {
          key = date.format("YYYY-MM-DD");
        } else if (rangeType === "month") {
          key = date.format("YYYY-MM");
        } else {
          key = date.format("YYYY");
        }

        const total = (p.Price || 0) * (p.Quantity || 0);
        grouped[key] = (grouped[key] || 0) + total;
      }

      // แปลงข้อมูลเป็น format ของ Syncfusion
      const chartData = Object.entries(grouped)
        .map(([key, total]) => {
          if (rangeType === "day") return { x: new Date(key), y: total };
          if (rangeType === "month") {
            const [y, m] = key.split("-").map(Number);
            return { x: new Date(y, m - 1, 1), y: total };
          }
          const y = Number(key);
          return { x: new Date(y, 0, 1), y: total };
        })
        .sort((a, b) => a.x.getTime() - b.x.getTime());

      setChartDataSets([
        {
          name:
            rangeType === "day"
              ? "ยอดรวมรายวัน"
              : rangeType === "month"
              ? "ยอดรวมรายเดือน"
              : "ยอดรวมรายปี",
          dataSource: chartData,
          color: "rgba(34, 197, 94, 0.6)",
        },
      ]);
    };

    fetchChartData();
  }, [rangeType, startDate, endDate]);

  // ================== แกน X แบบ dynamic ==================
  const LinePrimaryXAxis =
    rangeType === "day"
      ? {
          valueType: "DateTime" as "DateTime",
          labelFormat: "dd MMM",
          intervalType: "Days" as "Days",
          edgeLabelPlacement: "Shift" as EdgeLabelPlacement,
          majorGridLines: { width: 0 },
          labelStyle: {
            color: "#64748B",
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
          },
        }
      : rangeType === "month"
      ? {
          valueType: "DateTime" as "DateTime",
          labelFormat: "MMM yyyy",
          intervalType: "Months" as "Months",
          edgeLabelPlacement: "Shift" as EdgeLabelPlacement,
          majorGridLines: { width: 0 },
          labelStyle: {
            color: "#64748B",
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
          },
        }
      : {
          valueType: "DateTime" as "DateTime",
          labelFormat: "yyyy",
          intervalType: "Years" as "Years",
          edgeLabelPlacement: "Shift" as EdgeLabelPlacement,
          majorGridLines: { width: 0 },
          labelStyle: {
            color: "#64748B",
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
          },
        };

  // ================== UI ตัวเลือกเวลา ==================
  const renderDateSelector = () => {
    if (rangeType === "day") {
      return (
        <RangePicker
          value={[startDate, endDate]}
          onChange={(dates) => {
            if (dates) {
              setStartDate(dates[0]!);
              setEndDate(dates[1]!);
            }
          }}
          format="DD/MM/YYYY"
          allowClear={false}
        />
      );
    }

    if (rangeType === "month") {
      return (
        <RangePicker
          picker="month"
          value={[startDate, endDate]}
          onChange={(dates) => {
            if (dates) {
              // ถ้าเลือกเดือนเดียว ให้ set ทั้งเดือนนั้น
              const start = dates[0]!.startOf("month");
              const end = dates[1]!.endOf("month");
              setStartDate(start);
              setEndDate(end);
            }
          }}
          format="MMM YYYY"
          allowClear={false}
        />
      );
    }

    if (rangeType === "year") {
      return (
        <RangePicker
          picker="year"
          value={[startDate, endDate]}
          onChange={(dates) => {
            if (dates) {
              const start = dates[0]!.startOf("year");
              const end = dates[1]!.endOf("year");
              setStartDate(start);
              setEndDate(end);
            }
          }}
          format="YYYY"
          allowClear={false}
        />
      );
    }
  };

  // ================== Default เมื่อเปลี่ยนโหมด ==================
  useEffect(() => {
    const now = dayjs();
    if (rangeType === "day") {
      setStartDate(now.subtract(7, "day"));
      setEndDate(now);
    } else if (rangeType === "month") {
      setStartDate(now.startOf("month"));
      setEndDate(now.endOf("month"));
    } else {
      setStartDate(now.startOf("year"));
      setEndDate(now.endOf("year"));
    }
  }, [rangeType]);

  // ================== Render ==================
  return (
    <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl w-full md:w-full">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
        <p className="text-xl font-semibold">
          EV Charging Revenue Overview ({rangeType})
        </p>

        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={rangeType}
            onChange={(val) => setRangeType(val)}
            options={[
              { value: "day", label: "รายวัน" },
              { value: "month", label: "รายเดือน" },
              { value: "year", label: "รายปี" },
            ]}
          />
          {renderDateSelector()}
        </div>
      </div>

      <ChartComponent
        id="monthly-revenue-chart"
        height="420px"
        width="100%"
        primaryXAxis={LinePrimaryXAxis}
        primaryYAxis={LinePrimaryYAxis}
        chartArea={{ border: { width: 0 } }}
        tooltip={{ enable: true }}
        background={currentMode === "Dark" ? "#33373E" : "#fff"}
        legendSettings={{ visible: true, position: "Bottom" }}
      >
        <Inject services={[LineSeries, DateTime, Legend, Tooltip]} />
        <SeriesCollectionDirective>
          {chartDataSets.map((item, index) => (
            <SeriesDirective
              key={index}
              dataSource={item.dataSource}
              xName="x"
              yName="y"
              name={item.name}
              width={3}
              fill={`${item.color}20`}
              border={{ width: 2, color: item.color }}
              marker={{
                visible: true,
                width: 10,
                height: 10,
                fill: item.color,
                border: { width: 1.5, color: item.color },
              }}
              type="Line"
              animation={{ enable: true, duration: 1000, delay: 0 }}
            />
          ))}
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
};

export default MonthlyRevenueChart;
