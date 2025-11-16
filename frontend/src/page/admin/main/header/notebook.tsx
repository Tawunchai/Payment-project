import { TbCurrencyBaht } from 'react-icons/tb';
import { FaUsers, FaChargingStation } from 'react-icons/fa';
import { Button } from '../../../../component/admin';
import { useStateContext } from '../../../../contexts/ContextProvider';
import { ListPayments, ListUsers, ListEVChargingPayments } from "../../../../services";
import { useEffect, useState } from 'react';
import { MdOutlineSupervisorAccount } from 'react-icons/md';
import { PaymentsInterface } from "../../../../interface/IPayment";
import { EVChargingPayListmentInterface } from "../../../../interface/IEV";

// 👉 นำรูปเข้ามา (แก้ path ตามที่คุณเก็บไฟล์)
import paymentBg from '../../../../assets/solar-profile.png';

const index = () => {
  //@ts-ignore
  const { currentColor, currentMode } = useStateContext();

  // ===== state เดิมตามโครงสร้าง =====
  //@ts-ignore
  const [payments, setPayments] = useState<PaymentsInterface[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [employeeCount, setEmployeeCount] = useState<number>(0);

  //@ts-ignore
  const [evPayments, setEvPayments] = useState<EVChargingPayListmentInterface[]>([]);//@ts-ignore
  const [salesTotal, setSalesTotal] = useState<number>(0);//@ts-ignore
  const [refundsCount, setRefundsCount] = useState<number>(0);

  const brandBlue = '#2563eb'; // tailwind blue-600

  useEffect(() => {
    const fetchPayments = async () => {
      const res = await ListPayments();
      if (res) {
        setPayments(res);
        const total = res.reduce((acc, curr) => acc + (curr.Amount || 0), 0);
        setTotalAmount(total);
      }
    };

    const fetchUsers = async () => {
      const res = await ListUsers();
      if (res) {
        const usersOnly = res.filter((user) => user.UserRole?.RoleName === "User");
        const employees = res.filter(
          (user) => user.UserRole?.RoleName === "Admin" || user.UserRole?.RoleName === "Employee"
        );

        setUserCount(usersOnly.length);
        setEmployeeCount(employees.length);
      }
    };

    const fetchEVPayments = async () => {
      const res = await ListEVChargingPayments();
      if (res) {
        setEvPayments(res);
        const sales = res.reduce((acc, curr) => acc + curr.Price, 0);
        setSalesTotal(sales);
        setRefundsCount(res.length);
      }
    };

    fetchPayments();
    fetchUsers();
    fetchEVPayments();
  }, []);

  // ===== summary EV ตามโครงสร้างเดิม =====
  const evSummary = Object.values(
    evPayments.reduce((acc, payment) => {
      const id = payment.EVcharging?.ID;
      const name = payment.EVcharging?.Name ?? `EV Charger ${id}`;
      if (!id) return acc;

      if (!acc[id]) {
        acc[id] = {
          id,
          name,
          total: 0,
        };
      }

      acc[id].total += payment.Price;
      return acc;
    }, {} as Record<number, { id: number; name: string; total: number }>)
  );

  // ===== earningData: เปลี่ยนไอคอน+โทนสีให้ EV blue =====
  const earningData = [
    {
      icon: <FaUsers />,                        // Customers icon
      amount: userCount.toLocaleString(),
      percentage: '-4%',
      title: 'Customers',
      iconColor: '#1d4ed8',                     // blue-700
      iconBg: '#dbeafe',                        // blue-100
      pcColor: 'red-600',
    },
    {
      icon: <MdOutlineSupervisorAccount />,     // Employees icon
      amount: employeeCount.toLocaleString(),
      percentage: '+23%',
      title: 'Employees',
      iconColor: '#1d4ed8',
      iconBg: '#e0f2fe',                        // light-cyan/blue mix
      pcColor: 'green-600',
    },
    ...evSummary.map((item) => ([
      <FaChargingStation key={`icon-${item.name}`} />,              // EV charger icon
      item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      '+12%',
      item.name,
      '#1d4ed8',
      '#eff6ff',                        // blue-50
      'green-600',
    ])).map(([icon, amount, percentage, title, iconColor, iconBg, pcColor]) => ({
      icon, amount, percentage, title, iconColor, iconBg, pcColor
    })),
  ];

  const handleDownloadCSV = async () => {
    const res = await ListPayments();
    if (!res) {
      console.error("Failed to fetch payments");
      return;
    }

    // เปลี่ยนหัว Amount ให้ชัดว่าเป็น BATH
    const headers = ["ID", "User", "Method", "Amount (BATH)", "CreatedAt"];
    const rows = res.map((payment) => [
      payment.ID,
      payment.User?.FirstName ?? "",
      payment.Method?.Medthod ?? "",
      payment.Amount ?? 0,
      new Date(payment.Date).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "payments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-wrap lg:flex-nowrap justify-center">
      {/* ===== Card บนซ้าย: Total Payment (พื้นหลังเป็นรูป) ===== */}
      <div
        className="relative h-44 rounded-2xl w-full lg:w-80 p-8 pt-9 m-3 border border-blue-100 shadow-sm overflow-hidden"
        style={{
          backgroundImage: `url(${paymentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* overlay ช่วยให้อ่านง่าย */}
        <div className="absolute inset-0 bg-blue-600/20" />

        {/* เนื้อหาการ์ด */}
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-white drop-shadow">Total Payment</p>
              {/* เปลี่ยนหน่วยเป็น BATH/฿ */}
              <p className="text-2xl text-white drop-shadow">
                ฿ {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xs text-blue-100">BATH</span>
              </p>
            </div>
            <button
              type="button"
              style={{ backgroundColor: currentColor || brandBlue }}
              className="text-2xl text-white hover:drop-shadow-xl rounded-full p-4"
              aria-label="Total Payment"
              title="Total Payment"
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

      {/* ===== Grid ด้านขวา: สถิติ + EV summary ===== */}
      <div className="flex m-3 flex-wrap justify-center gap-1 items-center">
        <div className="earning-grid">
          {earningData.map((item) => (
            <div
              key={item.title as string}
              className="earning-item bg-white h-44 md:w-44 p-4 pt-9 rounded-2xl border border-blue-100 shadow-sm"
            >
              <button
                type="button"
                style={{ color: item.iconColor as string, backgroundColor: item.iconBg as string }}
                className="text-2xl rounded-full p-4 hover:drop-shadow"
                aria-label={item.title as string}
                title={item.title as string}
              >
                {item.icon as React.ReactNode}
              </button>
              <p className="mt-3">
                {/* เงินให้โชว์ BATH/฿ เฉพาะรายการที่เป็นจำนวนเงิน */}
                <span className="text-lg font-semibold text-gray-900">
                  {item.title === 'Customers' || item.title === 'Employees'
                    ? (item.amount as string)
                    : `฿ ${item.amount}`
                  }
                </span>
                {!(item.title === 'Customers' || item.title === 'Employees') && (
                  <span className="ml-1 text-[10px] text-blue-600">BATH</span>
                )}
              </p>
              <p className="text-sm text-blue-700 mt-1 font-medium">{item.title as string}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default index;