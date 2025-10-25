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
  <div className="w-24 border border-blue-200 px-2 py-1 rounded-md">
    <DropDownListComponent
      id="time"
      fields={{ text: "Time", value: "Id" }}
      style={{
        border: "none",
        color: currentMode === "Dark" ? "white" : "#2563eb",
      }}
      value="1"
      dataSource={dropdownData}
      popupHeight="200px"
      popupWidth="100px"
    />
  </div>
);

const EVBlueTransactionsMobile = () => {
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
    title: ev.name,
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

  return (
    <div className="w-[94%] mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 text-blue-800 rounded-2xl shadow-sm border border-blue-200 p-4 mt-3 mb-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-base font-semibold text-blue-700">
          Recent Transactions
        </p>
        <DropDown currentMode={currentMode} />
      </div>

      {/* Transactions */}
      <div className="mt-4 flex flex-col gap-3">
        {recentTransactions.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-white rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex gap-3 items-center">
              <div
                className="text-white text-xl p-2.5 rounded-full shadow-sm"
                style={{
                  backgroundColor: item.iconBg,
                  color: item.iconColor,
                }}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  {item.title}
                </p>
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
