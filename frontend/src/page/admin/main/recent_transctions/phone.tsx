import React, { useEffect, useMemo, useState } from "react";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { BsCurrencyDollar } from "react-icons/bs";
import { FaCoins, FaUniversity, FaBolt } from "react-icons/fa";
import { useStateContext } from "../../../../contexts/ContextProvider";
import {
  ListPayments,
  ListUsers,
  ListEVChargingPayments,
} from "../../../../services";

// ======= Month options (Jan–Dec) =======
const MONTH_OPTIONS = [
  { Id: 0,  Time: "Jan" },
  { Id: 1,  Time: "Feb" },
  { Id: 2,  Time: "Mar" },
  { Id: 3,  Time: "Apr" },
  { Id: 4,  Time: "May" },
  { Id: 5,  Time: "Jun" },
  { Id: 6,  Time: "Jul" },
  { Id: 7,  Time: "Aug" },
  { Id: 8,  Time: "Sep" },
  { Id: 9,  Time: "Oct" },
  { Id: 10, Time: "Nov" },
  { Id: 11, Time: "Dec" },
];

type EVRevenueRow = { name: string; revenue: number };

const MonthDropDown: React.FC<{
  currentMode: string;
  value: number; // 0-11
  onChange: (val: number) => void;
}> = ({ currentMode, value, onChange }) => {
  return (
    <div className="w-24 border border-blue-200 px-2 py-1 rounded-md">
      <DropDownListComponent
        id="month-mobile"
        fields={{ text: "Time", value: "Id" }}
        style={{
          border: "none",
          color: currentMode === "Dark" ? "white" : "#2563eb",
        }}
        value={value}
        dataSource={MONTH_OPTIONS}
        popupHeight="220px"
        popupWidth="100px"
        change={(e: any) => {
          if (typeof e?.value === "number") onChange(e.value);
        }}
      />
    </div>
  );
};

const EVBlueTransactionsMobile: React.FC = () => {
  const { currentMode } = useStateContext();

  // ใช้เดือนปัจจุบันเป็นค่าเริ่มต้น
  const now = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear] = useState<number>(now.getFullYear()); // ถ้าต้องการเลือกปี ค่อยเพิ่ม YearDropDown ภายหลัง

  // States
  const [currentMonthAmount, setCurrentMonthAmount] = useState<number>(0); // PromptPay Money Added
  const [totalCoins, setTotalCoins] = useState<number>(0);                 // Coins (รวมทุกผู้ใช้)
  const [currentMonthTransactionCount, setCurrentMonthTransactionCount] =
    useState<number>(0);                                                   // Transactions count
  const [evRevenueByCharger, setEvRevenueByCharger] = useState<EVRevenueRow[]>([]);

  // Helper: ตรวจว่า date อยู่ในเดือน/ปีที่เลือก
  const inSelectedMonth = (raw: Date | string | null | undefined) => {
    if (!raw) return false;
    const d = typeof raw === "string" ? new Date(raw) : raw;
    if (isNaN(d.getTime())) return false;
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  };

  useEffect(() => {
    const fetchData = async () => {
      // 1) PromptPay / Money Added (จาก ListPayments) อิงฟิลด์ Date
      const payments = await ListPayments();
      if (Array.isArray(payments)) {
        const filtered = payments.filter((p: any) => inSelectedMonth(p?.Date));
        const total = filtered.reduce(
          (acc, curr) => acc + (Number(curr?.Amount) || 0),
          0
        );
        setCurrentMonthAmount(total);
        setCurrentMonthTransactionCount(filtered.length);
      } else {
        setCurrentMonthAmount(0);
        setCurrentMonthTransactionCount(0);
      }

      // 2) Coins (รวมจากทุก user) — ตามเดิมไม่กรองเดือน
      const users = await ListUsers();
      if (Array.isArray(users)) {
        const coinSum = users.reduce(
          (acc, curr) => acc + (Number(curr?.Coin) || 0),
          0
        );
        setTotalCoins(coinSum);
      } else {
        setTotalCoins(0);
      }

      // 3) EV Charger Revenue (ListEVChargingPayments) อิงฟิลด์ CreatedAt
      const evPayments = await ListEVChargingPayments();
      if (Array.isArray(evPayments)) {
        const filteredEV = evPayments.filter((p: any) =>
          inSelectedMonth(p?.CreatedAt)
        );

        const revenueMap = filteredEV.reduce(
          (acc: Record<string, number>, curr: any) => {
            const name = curr?.EVcharging?.Name ?? "Unknown EV";
            const price =
              Number(curr?.Price) ??
              Number(curr?.Amount) ??
              0; // เผื่อบางกรณีใช้งาน Amount
            acc[name] = (acc[name] || 0) + (price || 0);
            return acc;
          },
          {}
        );

        const revenueArray: EVRevenueRow[] = Object.entries(revenueMap).map(
          ([name, revenue]) => ({ name, revenue })
        );

        // เรียงมาก -> น้อย
        revenueArray.sort((a, b) => b.revenue - a.revenue);
        setEvRevenueByCharger(revenueArray);
      } else {
        setEvRevenueByCharger([]);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  // Cards
  const baseTransactions = [
    {
      icon: <BsCurrencyDollar />,
      amount: `${currentMonthAmount.toLocaleString()}฿`,
      title: "PromptPay",
      desc: "Money Added",
      iconColor: "#2563EB",
      iconBg: "#EFF6FF",
    },
    {
      icon: <FaCoins />,
      amount: `${totalCoins.toLocaleString()}฿`,
      title: "Coins",
      desc: "All Payment",
      iconColor: "#3B82F6",
      iconBg: "#E0F2FE",
    },
    {
      icon: <FaUniversity />,
      amount: `${currentMonthTransactionCount}`,
      title: "Transactions",
      desc: "This Month",
      iconColor: "#1E40AF",
      iconBg: "#DBEAFE",
    },
  ];

  const evTransactions = evRevenueByCharger.map((ev) => ({
    icon: <FaBolt />,
    amount: `${ev.revenue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}฿`,
    title: ev.name, // เช่น "Charger B2", "Charger A1"
    desc: "EV Revenue",
    iconColor: "#1D4ED8",
    iconBg: "#E0E7FF",
  }));

  const recentTransactions = [
    baseTransactions[0],
    baseTransactions[1],
    ...evTransactions,
    baseTransactions[2],
  ];

  const monthLabel =
    MONTH_OPTIONS.find((m) => m.Id === selectedMonth)?.Time ?? "";

  return (
    <div className="w-[94%] mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 text-blue-800 rounded-2xl shadow-sm border border-blue-200 p-4 mt-3 mb-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-base font-semibold text-blue-700">
          Recent Transactions <span className="text-blue-500">({monthLabel} {selectedYear})</span>
        </p>
        <MonthDropDown
          currentMode={currentMode}
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
      </div>

      {/* Transactions */}
      <div className="mt-4 flex flex-col gap-3">
        {recentTransactions.map((item, idx) => (
          <div
            key={`${item.title}-${idx}`}
            className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-white rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex gap-3 items-center">
              <div
                className="text-white text-xl p-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                aria-label={item.title}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">{item.title}</p>
                <p className="text-xs text-blue-500">{item.desc}</p>
              </div>
            </div>
            <p className="text-right text-sm font-bold text-blue-700">
              {item.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EVBlueTransactionsMobile;
