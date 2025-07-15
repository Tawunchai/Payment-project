import { useEffect, useState } from 'react';
import { useStateContext } from '../../../../contexts/ContextProvider';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { dropdownData } from '../../../../assets/admin/dummy';
import {
    ChartComponent, SeriesCollectionDirective, SeriesDirective,
    Inject, LineSeries, DateTime, Legend, Tooltip
} from '@syncfusion/ej2-react-charts';
import type { EdgeLabelPlacement } from '@syncfusion/ej2-react-charts';
import { ListPayments } from '../../../../services';

const LinePrimaryYAxis = {
    labelFormat: '{value}฿',
    rangePadding: 'None' as 'None',
    minimum: 0,
    maximum: 5000,
    interval: 1000,
    lineStyle: { width: 0 },
    majorTickLines: { width: 1, color: '#CBD5E1' },  // สีเทาอ่อน (soft gray)
    minorTickLines: { width: 0 },
    labelStyle: { color: '#64748B', fontWeight: '600', fontFamily: 'Inter, sans-serif' }, // ฟอนต์นุ่มๆ
    majorGridLines: { width: 1, dashArray: '5,5', color: '#E2E8F0' } // เส้นกริดเส้นประสีฟ้าสว่าง
};

const LinePrimaryXAxis = {
    valueType: 'DateTime' as 'DateTime',
    labelFormat: 'MMM yyyy', // ตัวอย่าง Jul 2025
    intervalType: 'Months' as 'Months',
    edgeLabelPlacement: 'Shift' as EdgeLabelPlacement,
    majorGridLines: { width: 0 },
    background: 'transparent',  // ให้ดูซอฟต์ขึ้น
    labelStyle: { color: '#64748B', fontWeight: '600', fontFamily: 'Inter, sans-serif' },
};

const DropDown = ({ currentMode }: any) => (
    <div className="w-28 border-1 border-color px-2 py-1 rounded-md">
        <DropDownListComponent
            id="time"
            fields={{ text: 'Time', value: 'Id' }}
            style={{
                border: 'none',
                color: currentMode === 'Dark' ? 'white' : undefined
            }}
            value="1"
            dataSource={dropdownData}
            popupHeight="220px"
            popupWidth="120px"
        />
    </div>
);

const MonthlyRevenueChart = () => {
    //@ts-ignore
    const { currentColor, currentMode } = useStateContext();
    const [chartData, setChartData] = useState<{ x: Date; y: number }[]>([]);

    useEffect(() => {
        const fetchChartData = async () => {
            const payments = await ListPayments();
            if (!payments) return;

            const monthMap: Record<string, number> = {};

            for (const p of payments) {
                const date = new Date(p.Date);
                const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthMap[yearMonth] = (monthMap[yearMonth] || 0) + (p.Amount || 0);
            }

            const dataArray = Object.entries(monthMap)
                .map(([ym, total]) => {
                    const [year, month] = ym.split('-').map(Number);
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
            xName: 'x',
            yName: 'y',
            name: 'Monthly Revenue',
            width: '3',
            fill: 'rgba(34, 197, 94, 0.1)',
            border: { width: 2, color: 'rgba(34, 197, 94, 0.6)' },
            marker: {
                visible: true,
                width: 10,
                height: 10,
                fill: 'rgba(34, 197, 94, 0.6)',
                border: { width: 1.5, color: 'rgba(21, 128, 61, 0.7)' }
            },
            type: 'Line',
            dashArray: '0',
            animation: { enable: true, duration: 1000, delay: 0 }
        }
    ];

    return (
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl w-full md:w-full">
            <div className="flex justify-between items-center gap-2 mb-10">
                <p className="text-xl font-semibold">Monthly Revenue Overview</p>
                <DropDown currentMode={currentMode} />
            </div>
            <div className="w-full">
                <ChartComponent
                    id="monthly-revenue-chart"
                    height="420px"
                    width="100%"
                    primaryXAxis={LinePrimaryXAxis}
                    primaryYAxis={LinePrimaryYAxis}
                    chartArea={{ border: { width: 0 } }}
                    tooltip={{ enable: true }}
                    background={currentMode === 'Dark' ? '#33373E' : '#fff'}
                    legendSettings={{ background: 'white' }}
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
