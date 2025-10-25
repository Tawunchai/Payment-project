import { IoIosMore } from "react-icons/io";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import { BsChatLeft } from "react-icons/bs";
import { SparkLine } from "../../../../component/admin";
import { SparklineAreaData } from "../../../../assets/admin/dummy";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { ListPayments, ListEVChargingPayments, ListReviews } from "../../../../services";
import { useEffect, useState } from "react";

const PhoneWeeklyStats = () => {
  const { currentColor } = useStateContext();

  const [topPayer, setTopPayer] = useState<any>(null);
  const [mostEV, setMostEV] = useState<any>(null);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const payments = await ListPayments();
      const evPayments = await ListEVChargingPayments();
      const reviews = await ListReviews();

      // ✅ 1. Top Payer
      const userTotals: Record<string, number> = {};
      payments?.forEach((p: any) => {
        const name = `${p.User?.FirstName ?? ""} ${p.User?.LastName ?? ""}`.trim() || "Unknown";
        userTotals[name] = (userTotals[name] || 0) + (p.Amount ?? 0);
      });
      const topUser = Object.entries(userTotals).sort((a, b) => b[1] - a[1])[0];
      setTopPayer({ name: topUser?.[0], amount: topUser?.[1] ?? 0 });

      // ✅ 2. Top EV Charger Revenue
      const evTotals: Record<string, number> = {};
      const evIncome: Record<string, number> = {};
      evPayments?.forEach((ev: any) => {
        const name = ev.EVcharging?.Name ?? "Unknown EV";
        evTotals[name] = (evTotals[name] || 0) + 1;
        evIncome[name] = (evIncome[name] || 0) + (ev.Price ?? 0);
      });
      const topEV = Object.entries(evIncome).sort((a, b) => b[1] - a[1])[0]?.[0];
      setMostEV({
        name: topEV,
        count: evTotals[topEV] ?? 0,
        income: evIncome[topEV] ?? 0,
      });

      // ✅ 3. Total Reviews
      setTotalReviews(reviews?.length ?? 0);
    };

    fetchData();
  }, []);

  const stats = [
    {
      icon: <FiShoppingCart />,
      amount: `฿${topPayer?.amount?.toLocaleString() ?? "-"}`,
      title: "Top Payer",
      desc: topPayer?.name ?? "-",
      iconBg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      textColor: "text-blue-700",
    },
    {
      icon: <FiStar />,
      amount: `฿${mostEV?.income?.toLocaleString() ?? "-"}`,
      title: "Top EV Charger",
      desc: `${mostEV?.name ?? "-"} (${mostEV?.count ?? 0} uses)`,
      iconBg: "linear-gradient(135deg, #60a5fa, #2563eb)",
      textColor: "text-blue-700",
    },
    {
      icon: <BsChatLeft />,
      amount: `${totalReviews} Reviews`,
      title: "Total Reviews",
      desc: "Across all users",
      iconBg: "linear-gradient(135deg, #93c5fd, #1d4ed8)",
      textColor: "text-blue-700",
    },
  ];

  return (
    <div className="max-w-[360px] w-full mx-auto bg-white rounded-2xl shadow-md border border-blue-100 p-4 mt-2 mb-4 px-3">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center px-1">
        <p className="text-base font-semibold text-blue-800">Weekly Stats</p>
        <button
          type="button"
          className="text-lg font-semibold text-blue-500 hover:text-blue-700 transition-all"
        >
          <IoIosMore />
        </button>
      </div>

      {/* ===== Stats ===== */}
      <div className="mt-4 flex flex-col gap-3">
        {stats.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-white rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex gap-3 items-center">
              <div
                className="text-white text-xl p-2.5 rounded-full shadow-md"
                style={{ background: item.iconBg }}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
            <p className={`text-right text-sm font-bold ${item.textColor}`}>{item.amount}</p>
          </div>
        ))}
      </div>

      {/* ===== Sparkline Chart ===== */}
      <div className="mt-4 mb-1 flex justify-center">
        <SparkLine
          currentColor={currentColor}
          id="area-sparkLine"
          height="110px"
          type="Area"
          data={SparklineAreaData}
          width="260"
          color="rgb(219, 234, 254)"
        />
      </div>
    </div>
  );
};

export default PhoneWeeklyStats;
