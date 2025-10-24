import { useEffect, useState } from "react";
import { IoIosMore } from "react-icons/io";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { BsBatteryCharging } from "react-icons/bs";
import {
  ListPayments,
  ListEVChargingPayments,
  ListUsers,
  apiUrlPicture,
} from "../../../../services";

const Index = () => {
  const { currentColor } = useStateContext();

  const [power, setPower] = useState(0);
  const [expense, setExpense] = useState(0);
  const [today, setToday] = useState("");
  const [chargerPowerMap, setChargerPowerMap] = useState<{ [name: string]: number }>({});
  const [todayPaymentCount, setTodayPaymentCount] = useState(0);
  const [leaders, setLeaders] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const evResponse = await ListEVChargingPayments();
      const paymentResponse = await ListPayments();
      const userResponse = await ListUsers();

      const todayDate = new Date().toISOString().split("T")[0];

      // ✅ Filter EV Charging ของวันนี้
      const todayEV = evResponse!.filter((item: any) => {
        const paymentDate = item?.Payment?.Date?.split("T")[0];
        return paymentDate === todayDate;
      });

      // ✅ รวม Quantity
      let totalQuantity = 0;
      const map: { [name: string]: number } = {};
      todayEV.forEach((item: any) => {
        const chargerName = item?.EVcharging?.Name || "Unknown";
        const qty = item?.Quantity || 0;
        totalQuantity += qty;

        if (map[chargerName]) map[chargerName] += qty;
        else map[chargerName] = qty;
      });
      setPower(totalQuantity);
      setChargerPowerMap(map);

      // ✅ Filter Payment วันนี้
      const todayPayments = paymentResponse!.filter((item: any) =>
        item.Date?.startsWith(todayDate)
      );
      setTodayPaymentCount(todayPayments.length);

      // ✅ รวมจำนวนเงิน
      const totalAmount = todayPayments.reduce(
        (sum: number, item: any) => sum + item.Amount,
        0
      );
      setExpense(totalAmount);

      // ✅ วันที่
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "2-digit",
      };
      setToday(date.toLocaleDateString("en-US", options));

      // ✅ Leaders (เฉพาะ Admin)
      const adminUsers = userResponse!.filter(
        (user: any) => user.UserRole?.RoleName === "Admin"
      );
      const adminImages = adminUsers.map((user: any) => user.Profile).filter(Boolean);
      setLeaders(adminImages);
    };

    fetchData();
  }, []);

  const medicalproBranding = {
    data: [
      { title: "Today Date", desc: today },
      { title: "Power", desc: `${power.toFixed(2)} kWh` },
      { title: "Expense", desc: `฿${expense.toLocaleString()}` },
    ],
  };

  return (
    <div className="w-250 bg-gradient-to-br from-blue-50 to-blue-100 dark:text-gray-200 rounded-2xl shadow-lg border border-blue-200 p-6 m-3 transition-all duration-300 hover:shadow-xl">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center">
        <p className="text-xl font-semibold text-blue-800">EV Station Overview</p>
        <button
          type="button"
          className="text-2xl font-semibold text-blue-500 hover:text-blue-700 transition-all"
        >
          <IoIosMore />
        </button>
      </div>

      {/* ===== Date Tag ===== */}
      <p className="text-xs font-semibold rounded-full w-fit px-3 py-1 mt-6 text-white bg-blue-600 shadow-md">
        {today}
      </p>

      {/* ===== Summary ===== */}
      <div className="flex gap-6 border-b border-blue-200 mt-6 pb-3">
        {medicalproBranding.data.map((item) => (
          <div key={item.title} className="pr-4">
            <p className="text-xs text-gray-500">{item.title}</p>
            <p className="text-sm font-semibold text-blue-800">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* ===== Power Type ===== */}
      <div className="border-b border-blue-200 pb-4 mt-4">
        <p className="text-md font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <BsBatteryCharging className="text-blue-600" /> Power Type
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(chargerPowerMap).map(([name, qty]) => (
            <p
              key={name}
              className="cursor-pointer text-white py-1 px-3 rounded-full text-xs bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
            >
              {name}: {qty.toFixed(2)} kWh
            </p>
          ))}
          {Object.keys(chargerPowerMap).length === 0 && (
            <p className="text-xs text-gray-400">No data available</p>
          )}
        </div>
      </div>

      {/* ===== Leaders ===== */}
      <div className="mt-4">
        <p className="text-md font-semibold text-blue-900 mb-2">Leaders</p>
        <div className="flex gap-3">
          {leaders.slice(0, 5).map((img, index) => (
            <img
              key={index}
              className="rounded-full w-9 h-9 object-cover ring-2 ring-blue-200 shadow-sm hover:scale-105 transition-transform"
              src={`${apiUrlPicture}${img}`}
              alt={`Leader ${index}`}
            />
          ))}
          {leaders.length === 0 && (
            <p className="text-xs text-gray-400">No leaders found</p>
          )}
        </div>
      </div>

      {/* ===== Footer ===== */}
      <div className="flex justify-between items-center mt-5 border-t border-blue-200 pt-3">
        <button
          type="button"
          className="text-white text-3xl p-4 rounded-full shadow-lg hover:shadow-2xl transition-all"
          style={{ backgroundColor: currentColor || "#2563eb" }}
        >
          <BsBatteryCharging />
        </button>
        <p className="text-blue-700 text-sm font-medium">
          {todayPaymentCount} Recent Transactions
        </p>
      </div>
    </div>
  );
};

export default Index;
