import { useEffect, useState } from "react";
import { FaUsers, FaChargingStation } from "react-icons/fa";
import { MdOutlineSupervisorAccount } from "react-icons/md";
import { Button } from "../../../../component/admin";
import { useStateContext } from "../../../../contexts/ContextProvider";
import {
  ListPayments,
  ListUsers,
  ListEVChargingPayments,
} from "../../../../services";
import type { PaymentsInterface } from "../../../../interface/IPayment";
import type { EVChargingPayListmentInterface } from "../../../../interface/IEV";

// 👉 รูปพื้นหลังเฉพาะ Card แรก
import cardBg from "../../../../assets/solar-profile.png";

const PhoneDashboard = () => {
  //@ts-ignore
  const { currentColor } = useStateContext(); //@ts-ignore
  const [payments, setPayments] = useState<PaymentsInterface[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [evPayments, setEvPayments] = useState<EVChargingPayListmentInterface[]>([]);

  const brandBlue = "#2563eb";

  useEffect(() => {
    const load = async () => {
      const payRes = await ListPayments();
      if (payRes) {
        setPayments(payRes);
        setTotalAmount(payRes.reduce((sum, p) => sum + (p.Amount || 0), 0));
      }

      const usersRes = await ListUsers();
      if (usersRes) {
        setUserCount(usersRes.filter((u) => u.UserRole?.RoleName === "User").length);
        setEmployeeCount(
          usersRes.filter(
            (u) =>
              u.UserRole?.RoleName === "Admin" ||
              u.UserRole?.RoleName === "Employee"
          ).length
        );
      }

      const evRes = await ListEVChargingPayments();
      if (evRes) setEvPayments(evRes);
    };
    load();
  }, []);

  // รวมยอด EV ตามสถานี
  const evSummary = Object.values(
    evPayments.reduce((acc, cur) => {
      const id = cur.EVcharging?.ID;
      if (!id) return acc;
      const name = cur.EVcharging?.Name ?? `Charger ${id}`;
      acc[id] = acc[id] || { id, name, total: 0 };
      acc[id].total += cur.Price;
      return acc;
    }, {} as Record<number, { id: number; name: string; total: number }>)
  );

  const earningData = [
    {
      title: "Customers",
      icon: <FaUsers />,
      value: userCount,
    },
    {
      title: "Employees",
      icon: <MdOutlineSupervisorAccount />,
      value: employeeCount,
    },
    ...evSummary.map((ev) => ({
      title: ev.name,
      icon: <FaChargingStation />,
      value: `฿ ${ev.total.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    })),
  ];

  const handleDownloadCSV = async () => {
    const res = await ListPayments();
    if (!res) return;
    const headers = ["ID", "User", "Method", "Amount (BATH)", "Date"];
    const rows = res.map((r) => [
      r.ID,
      r.User?.FirstName ?? "",
      r.Method?.Medthod ?? "",
      r.Amount ?? 0,
      new Date(r.Date).toLocaleString(),
    ]);
    const csv = [headers.join(","), ...rows.map((x) => x.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
  };

  return (
    <div className="w-full px-4 pt-4 pb-1 flex flex-col gap-3">
      {/* ===== Card แรก (พื้นหลังเป็นรูป) ===== */}
      <div
        className="relative rounded-2xl p-5 shadow-sm overflow-hidden h-40"
        style={{
          backgroundImage: `url(${cardBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-blue-600/25" />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <p className="text-white/90 text-sm">Total Payment</p>
            <h1 className="text-3xl font-semibold text-white mt-1">
              ฿ {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
              <span className="text-xs text-blue-100">BATH</span>
            </h1>
          </div>
          <div className="flex justify-end">
            <Button
              text="Download CSV"
              color="white"
              bgColor={currentColor || brandBlue}
              borderRadius="12px"
              onClick={handleDownloadCSV}
            />
          </div>
        </div>
      </div>

      {/* ===== Card อื่น ๆ (พื้นหลังขาว) ===== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {earningData.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-4 shadow-sm text-center h-32 bg-white border border-blue-100"
          >
            <div className="text-3xl text-blue-700 mb-2">{item.icon}</div>
            <p className="text-lg font-semibold text-gray-800">{item.value}</p>
            <p className="text-[12px] text-blue-600 mt-1">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhoneDashboard;
