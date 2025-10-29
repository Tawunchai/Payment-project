import React, { useEffect, useMemo, useState } from "react";
import { BsCurrencyDollar } from "react-icons/bs";
import { FaCoins, FaUniversity, FaBolt } from "react-icons/fa";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import {
  ListPayments,
  ListUsers,
  ListEVChargingPayments,
} from "../../../../services";

// ======= Month options (Jan–Dec) =======
const MONTH_OPTIONS = [
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

type EVRevenueRow = { name: string; revenue: number };

const MonthDropDown: React.FC<{
  currentMode: string;
  value: number;
  onChange: (val: number) => void;
}> = ({ currentMode, value, onChange }) => {
  return (
    <div className="w-32 border border-blue-200 px-2 py-1 rounded-md">
      <DropDownListComponent
        id="month"
        fields={{ text: "Time", value: "Id" }}
        style={{
          border: "none",
          color: currentMode === "Dark" ? "white" : undefined,
        }}
        value={value}
        dataSource={MONTH_OPTIONS}
        popupHeight="260px"
        popupWidth="140px"
        change={(e: any) => {
          if (typeof e?.value === "number") onChange(e.value);
        }}
      />
    </div>
  );
};

const Index: React.FC = () => {
  const { currentMode } = useStateContext();

  const now = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear] = useState<number>(now.getFullYear());

  const [currentMonthAmount, setCurrentMonthAmount] = useState<number>(0);
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [currentMonthTransactionCount, setCurrentMonthTransactionCount] =
    useState<number>(0);
  const [evRevenueByCharger, setEvRevenueByCharger] = useState<
    EVRevenueRow[]
  >([]);

  const inSelectedMonth = (d: Date | string | null | undefined) => {
    if (!d) return false;
    const dd = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dd.getTime())) return false;
    return dd.getMonth() === selectedMonth && dd.getFullYear() === selectedYear;
  };

  useEffect(() => {
    const fetchData = async () => {
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

      const evPayments = await ListEVChargingPayments();
      if (Array.isArray(evPayments)) {
        const filteredEV = evPayments.filter((p: any) =>
          inSelectedMonth(p?.CreatedAt)
        );
        const revenueMap = filteredEV.reduce(
          (acc: Record<string, number>, curr: any) => {
            const name = curr?.EVcharging?.Name ?? "Unknown EV";
            const price =
              Number(curr?.Price) ?? Number(curr?.Amount) ?? 0;
            acc[name] = (acc[name] || 0) + (price || 0);
            return acc;
          },
          {}
        );
        const revenueArray: EVRevenueRow[] = Object.entries(revenueMap).map(
          ([name, revenue]) => ({ name, revenue })
        );
        revenueArray.sort((a, b) => b.revenue - a.revenue);
        setEvRevenueByCharger(revenueArray);
      } else {
        setEvRevenueByCharger([]);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  const recentTransactionsBase = [
    {
      icon: <BsCurrencyDollar />,
      amount: `${currentMonthAmount.toLocaleString()}฿`,
      title: "PromptPay",
      desc: "Money Added",
      iconColor: "#2563EB",
      iconBg: "#EFF6FF",
      pcColor: "blue-600",
    },
    {
      icon: <FaCoins />,
      amount: `${totalCoins.toLocaleString()}฿`,
      title: "Coins",
      desc: "All Payment",
      iconColor: "#3B82F6",
      iconBg: "#E0F2FE",
      pcColor: "blue-600",
    },
    {
      icon: <FaUniversity />,
      amount: `${currentMonthTransactionCount}`,
      title: "Transactions",
      desc: "Payment transactions",
      iconColor: "#1D4ED8",
      iconBg: "#DBEAFE",
      pcColor: "blue-600",
    },
  ];

  const evTransactions = evRevenueByCharger.map((ev) => ({
    icon: <FaBolt />,
    amount: `${ev.revenue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}฿`,
    title: ev.name,
    desc: "EV Charger Revenue",
    iconColor: "#1E40AF",
    iconBg: "#E0E7FF",
    pcColor: "blue-700",
  }));

  const recentTransactions = [
    recentTransactionsBase[0],
    recentTransactionsBase[1],
    ...evTransactions,
    recentTransactionsBase[2],
  ];

  const monthLabel =
    MONTH_OPTIONS.find((m) => m.Id === selectedMonth)?.Time ?? "";

  return (
    <div className="flex-1 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl border border-blue-100 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center gap-2">
        <p className="text-xl font-semibold text-blue-800">
          Recent Transactions{" "}
          <span className="text-blue-500">
            ({monthLabel} {selectedYear})
          </span>
        </p>

        <MonthDropDown
          currentMode={currentMode}
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
      </div>

      {/* Transactions */}
      <div className="mt-8 w-full md:w-[420px] lg:w-[460px] xl:w-[480px] 2xl:w-[500px]">
        {recentTransactions.map((item, idx) => (
          <div
            key={`${item.title}-${idx}`}
            className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-white rounded-xl p-4 mb-3 hover:shadow-md transition-all"
          >
            <div className="flex gap-4 items-center">
              <button
                type="button"
                style={{
                  color: item.iconColor,
                  backgroundColor: item.iconBg,
                }}
                className="text-2xl rounded-lg p-4 hover:scale-105 transition-transform"
                aria-label={item.title}
              >
                {item.icon}
              </button>
              <div>
                <p className="text-md font-semibold text-blue-900">
                  {item.title}
                </p>
                <p className="text-sm text-blue-500">{item.desc}</p>
              </div>
            </div>
            <p className={`font-semibold text-${item.pcColor}`}>
              {item.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
