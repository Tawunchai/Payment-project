import { TbCurrencyBaht } from 'react-icons/tb';
import { FaUsers, FaChargingStation } from 'react-icons/fa';
import { Button } from '../../../../component/admin';
import { useStateContext } from '../../../../contexts/ContextProvider';
import { ListPayments, ListUsers, ListEVChargingPayments } from "../../../../services";
import { useEffect, useState } from 'react';
import { MdOutlineSupervisorAccount } from 'react-icons/md';
import { PaymentsInterface } from "../../../../interface/IPayment";
import { EVChargingPayListmentInterface } from "../../../../interface/IEV";
import paymentBg from '../../../../assets/solar-profile.png';

const IPadHeader = () => {
  //@ts-ignore
  const { currentColor } = useStateContext();
  //@ts-ignore
  const [payments, setPayments] = useState<PaymentsInterface[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [evPayments, setEvPayments] = useState<EVChargingPayListmentInterface[]>([]);

  const brandBlue = '#2563eb';

  useEffect(() => {
    const fetchData = async () => {
      const resPayments = await ListPayments();
      if (resPayments) {
        setPayments(resPayments);
        const total = resPayments.reduce((acc, curr) => acc + (curr.Amount || 0), 0);
        setTotalAmount(total);
      }

      const resUsers = await ListUsers();
      if (resUsers) {
        const usersOnly = resUsers.filter((u) => u.UserRole?.RoleName === "User");
        const employees = resUsers.filter(
          (u) => u.UserRole?.RoleName === "Admin" || u.UserRole?.RoleName === "Employee"
        );
        setUserCount(usersOnly.length);
        setEmployeeCount(employees.length);
      }

      const resEV = await ListEVChargingPayments();
      if (resEV) {
        setEvPayments(resEV);
      }
    };
    fetchData();
  }, []);

  // รวมยอด EV Charger
  const evSummary = Object.values(
    evPayments.reduce((acc, payment) => {
      const id = payment.EVcharging?.ID;
      const name = payment.EVcharging?.Name ?? `EV Charger ${id}`;
      if (!id) return acc;
      if (!acc[id]) acc[id] = { id, name, total: 0 };
      acc[id].total += payment.Price;
      return acc;
    }, {} as Record<number, { id: number; name: string; total: number }>)
  );

  const handleDownloadCSV = async () => {
    const res = await ListPayments();
    if (!res) return;
    const headers = ["ID", "User", "Method", "Amount (BATH)", "CreatedAt"];
    const rows = res.map((p) => [
      p.ID,
      p.User?.FirstName ?? "",
      p.Method?.Medthod ?? "",
      p.Amount ?? 0,
      new Date(p.Date).toLocaleString(),
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "payments.csv";
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 md:px-8 mt-4">
      {/* ===== แถวที่ 1: Total Payment + Customers + Employees ===== */}
      <div className="flex flex-wrap justify-center gap-4 w-full mb-6">
        {/* ✅ Total Payment (ขยายกว้างขึ้น) */}
        <div
          className="relative h-44 rounded-2xl w-full md:w-[96%] max-w-[800px] p-8 pt-9 border border-blue-100 shadow-sm overflow-hidden"
          style={{
            backgroundImage: `url(${paymentBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-blue-600/20" />
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-white drop-shadow">Total Payment</p>
                <p className="text-2xl text-white drop-shadow">
                  ฿ {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs text-blue-100 ml-1">BATH</span>
                </p>
              </div>
              <button
                type="button"
                style={{ backgroundColor: currentColor || brandBlue }}
                className="text-2xl text-white rounded-full p-4 shadow"
              >
                <TbCurrencyBaht />
              </button>
            </div>
            <div className="mt-6">
              <Button
                color="white"
                bgColor={currentColor || brandBlue}
                text="Download CSV"
                borderRadius="12px"
                onClick={handleDownloadCSV}
              />
            </div>
          </div>
        </div>

        {/* ✅ Customers + Employees (แถวเดียว) */}
        <div className="flex flex-wrap justify-center gap-4 w-full md:w-[96%] max-w-[800px]">
          <div className="bg-white h-44 w-[45%] md:w-[48%] p-6 pt-8 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center">
            <button
              type="button"
              className="text-2xl rounded-full p-4 mb-2"
              style={{ color: "#1d4ed8", backgroundColor: "#dbeafe" }}
            >
              <FaUsers />
            </button>
            <p className="text-lg font-semibold text-gray-900">
              {userCount.toLocaleString()}
            </p>
            <p className="text-sm text-blue-700 mt-1 font-medium">Customers</p>
          </div>

          <div className="bg-white h-44 w-[45%] md:w-[48%] p-6 pt-8 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center">
            <button
              type="button"
              className="text-2xl rounded-full p-4 mb-2"
              style={{ color: "#1d4ed8", backgroundColor: "#e0f2fe" }}
            >
              <MdOutlineSupervisorAccount />
            </button>
            <p className="text-lg font-semibold text-gray-900">
              {employeeCount.toLocaleString()}
            </p>
            <p className="text-sm text-blue-700 mt-1 font-medium">Employees</p>
          </div>
        </div>
      </div>

      {/* ===== แถวที่ 2: EV Chargers ===== */}
      <div className="flex flex-wrap justify-center gap-4 w-full md:w-[96%] max-w-[800px] mb-6">
        {evSummary.map((item) => (
          <div
            key={item.name}
            className="bg-white h-44 w-[45%] md:w-[48%] p-6 pt-8 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center"
          >
            <button
              type="button"
              className="text-2xl rounded-full p-4 mb-2"
              style={{ color: "#1d4ed8", backgroundColor: "#eff6ff" }}
            >
              <FaChargingStation />
            </button>
            <p className="text-lg font-semibold text-gray-900">
              ฿ {item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-blue-700 mt-1 font-medium">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IPadHeader;
