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
    majorGridLines: { width: 1, dashArray: "5,5", color: "#DBEAFE" },
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
    <div className="w-28 border border-blue-300 px-2 py-1 rounded-md">
        <DropDownListComponent
            id="time"
            fields={{ text: "Time", value: "Id" }}
            style={{
                border: "none",
                color: currentMode === "Dark" ? "white" : "#1D4ED8",
            }}
            value="1"
            dataSource={dropdownData}
            popupHeight="220px"
            popupWidth="120px"
        />
    </div>
);

const MonthlyRevenueChart = () => {
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
                    return {
                        x: new Date(year, month - 1, 1),
                        y: Number(total),
                    };
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
            width: "3",
            fill: "rgba(59,130,246,0.15)", // พื้นกราฟฟ้าใส
            border: { width: 3, color: "#2563EB" }, // เส้นฟ้าเข้ม EV
            marker: {
                visible: true,
                width: 10,
                height: 10,
                fill: "#60A5FA",
                border: { width: 2, color: "#1E3A8A" },
            },
            type: "Line",
            animation: { enable: true, duration: 1000, delay: 0 },
        },
    ];

    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 text-blue-800 p-6 rounded-2xl w-96 md:w-760 shadow-sm border border-blue-200">
            {/* Header */}
            <div className="flex justify-between items-center gap-2 mb-8">
                <p className="text-xl font-semibold text-blue-800">
                    Monthly Revenue Overview
                </p>
                <DropDown currentMode={currentMode} />
            </div>

            {/* Chart */}
            <div className="md:w-full overflow-auto">
                <ChartComponent
                    id="monthly-revenue-chart"
                    height="420px"
                    primaryXAxis={LinePrimaryXAxis}
                    primaryYAxis={LinePrimaryYAxis}
                    chartArea={{ border: { width: 0 } }}
                    tooltip={{ enable: true }}
                    margin={{ top: 10, bottom: 40, left: 10, right: 10 }}
                    legendSettings={{
                        visible: true,
                        position: 'Bottom',
                        alignment: 'Center',
                        textStyle: { color: '#2563EB', fontWeight: '600' },
                        background: 'transparent',
                    }}
                    background={currentMode === 'Dark' ? '#1E293B' : 'transparent'}
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
