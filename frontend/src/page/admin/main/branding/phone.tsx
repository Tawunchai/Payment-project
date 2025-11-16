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

const PhoneEVOverview = () => {
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

      /* =========================================================
         1) EV Charging Power วันนี้
      ========================================================= */
      const todayEV = evResponse?.filter((item: any) => {
        const paymentDate = item?.Payment?.Date?.split("T")[0];
        return paymentDate === todayDate;
      });

      let totalPower = 0;
      const map: Record<string, number> = {};

      todayEV?.forEach((item: any) => {
        const chargerName = item?.EVcharging?.Name || "Unknown";

        // ⭐ ใช้ Power ไม่ใช่ Quantity
        const pwr = Number(item?.Power) || 0;

        totalPower += pwr;
        map[chargerName] = (map[chargerName] || 0) + pwr;
      });

      setPower(totalPower);
      setChargerPowerMap(map);

      /* =========================================================
         2) Payment วันนี้
      ========================================================= */
      const todayPayments = paymentResponse?.filter((item: any) =>
        item.Date?.startsWith(todayDate)
      );

      setTodayPaymentCount(todayPayments?.length || 0);

      const totalAmount =
        todayPayments?.reduce((sum: number, item: any) => sum + (item.Amount || 0), 0) || 0;

      setExpense(totalAmount);

      /* =========================================================
         3) Today Date Display
      ========================================================= */
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "2-digit",
      };
      setToday(date.toLocaleDateString("en-US", options));

      /* =========================================================
         4) Leaders (Admin)
      ========================================================= */
      const admins = userResponse?.filter(
        (user: any) => user.UserRole?.RoleName === "Admin"
      );

      const adminImages = admins?.map((u: any) => u.Profile).filter(Boolean) || [];
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
    <div className="w-[92%] mx-auto bg-white rounded-2xl shadow-md border border-blue-100 p-4 mt-3 mb-4">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center">
        <p className="text-base font-semibold text-blue-800">EV Station Status</p>
        <button
          type="button"
          className="text-lg font-semibold text-blue-500 hover:text-blue-700 transition-all"
        >
          <IoIosMore />
        </button>
      </div>

      {/* ===== Date Tag ===== */}
      <p className="text-xs font-semibold rounded-full w-fit px-3 py-1 mt-4 text-white bg-blue-600 shadow-sm">
        {today}
      </p>

      {/* ===== Summary ===== */}
      <div className="flex justify-between border-b border-blue-100 mt-4 pb-2">
        {medicalproBranding.data.map((item) => (
          <div key={item.title} className="flex flex-col items-start pr-2">
            <p className="text-[11px] text-gray-500">{item.title}</p>
            <p className="text-sm font-semibold text-blue-800">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* ===== Power Type ===== */}
      <div className="border-b border-blue-100 pb-3 mt-3">
        <p className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
          <BsBatteryCharging className="text-blue-600" /> Power Type
        </p>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(chargerPowerMap).map(([name, pwr]) => (
            <p
              key={name}
              className="text-white py-[2px] px-2.5 rounded-full text-[11px] bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
            >
              {name}: {pwr.toFixed(2)} kWh
            </p>
          ))}

          {Object.keys(chargerPowerMap).length === 0 && (
            <p className="text-[11px] text-gray-400">No data available</p>
          )}
        </div>
      </div>

      {/* ===== Leaders ===== */}
      <div className="mt-3">
        <p className="text-sm font-semibold text-blue-900 mb-1">Leaders</p>
        <div className="flex gap-2">
          {leaders.slice(0, 5).map((img, index) => (
            <img
              key={index}
              className="rounded-full w-7 h-7 object-cover ring-1 ring-blue-200 shadow-sm"
              src={`${apiUrlPicture}${img}`}
              alt={`Leader ${index}`}
            />
          ))}

          {leaders.length === 0 && (
            <p className="text-[11px] text-gray-400">No leaders found</p>
          )}
        </div>
      </div>

      {/* ===== Footer ===== */}
      <div className="flex justify-between items-center mt-4 border-t border-blue-100 pt-3">
        <button
          type="button"
          className="text-white text-2xl p-3 rounded-full shadow-md hover:shadow-lg transition-all"
          style={{ backgroundColor: currentColor || "#2563eb" }}
        >
          <BsBatteryCharging />
        </button>
        <p className="text-blue-700 text-xs font-medium">
          {todayPaymentCount} Recent Transactions
        </p>
      </div>
    </div>
  );
};

export default PhoneEVOverview;