import { BsCurrencyDollar } from "react-icons/bs";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { dropdownData } from "../../../../assets/admin/dummy";
import { useEffect, useState } from "react";
import {
  ListPayments,
  ListUsers,
  ListEVChargingPayments,
} from "../../../../services";
import { FaCoins, FaUniversity, FaBolt } from "react-icons/fa";

const DropDown = ({ currentMode }: any) => (
  <div className="w-28 border border-blue-200 px-2 py-1 rounded-md">
    <DropDownListComponent
      id="time"
      fields={{ text: "Time", value: "Id" }}
      style={{
        border: "none",
        color: currentMode === "Dark" ? "white" : undefined,
      }}
      value="1"
      dataSource={dropdownData}
      popupHeight="220px"
      popupWidth="120px"
    />
  </div>
);

const Index = () => {
  const { currentMode } = useStateContext();

  const [currentMonthAmount, setCurrentMonthAmount] = useState<number>(0);
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [currentMonthTransactionCount, setCurrentMonthTransactionCount] =
    useState<number>(0);
  const [evRevenueByCharger, setEvRevenueByCharger] = useState<
    { name: string; revenue: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const payments = await ListPayments();
      if (payments) {
        const filteredPayments = payments.filter((p: any) => {
          const paymentDate = new Date(p.Date);
          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        });

        const total = filteredPayments.reduce(
          (acc, curr) => acc + (curr.Amount || 0),
          0
        );
        setCurrentMonthAmount(total);
        setCurrentMonthTransactionCount(filteredPayments.length);
      }

      const users = await ListUsers();
      if (users) {
        const totalCoin = users.reduce(
          (acc, curr) => acc + (curr.Coin || 0),
          0
        );
        setTotalCoins(totalCoin);
      }

      const evPayments = await ListEVChargingPayments();
      if (evPayments) {
        const filteredEV = evPayments.filter((p: any) => {
          if (!p?.CreatedAt) return false;
          const d = new Date(p.CreatedAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const revenueMap = filteredEV.reduce((acc, curr) => {
          const name = curr.EVcharging?.Name ?? "Unknown EV";
          acc[name] = (acc[name] || 0) + (curr.Price || 0);
          return acc;
        }, {} as Record<string, number>);

        const revenueArray = Object.entries(revenueMap).map(
          ([name, revenue]) => ({
            name,
            revenue,
          })
        );
        setEvRevenueByCharger(revenueArray);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl border border-blue-100 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center gap-1">
        <p className="text-xl font-semibold text-blue-800">
          Recent Transactions
        </p>
        <DropDown currentMode={currentMode} />
      </div>

      {/* Transactions */}
      <div className="mt-8 w-80 md:w-96">
        {recentTransactions.map((item, idx) => (
          <div
            key={idx}
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
