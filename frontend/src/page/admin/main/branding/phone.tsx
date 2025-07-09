import { useEffect, useState } from 'react';
import { IoIosMore } from 'react-icons/io';
import { useStateContext } from '../../../../contexts/ContextProvider';
import { BsBatteryCharging } from 'react-icons/bs';
import { ListPayments, ListEVChargingPayments, ListUsers, apiUrlPicture } from '../../../../services';

const phone = () => {
  const { currentColor } = useStateContext();

  const [power, setPower] = useState(0);
  const [expense, setExpense] = useState(0);
  const [today, setToday] = useState('');
  const [chargerPowerMap, setChargerPowerMap] = useState<{ [name: string]: number }>({});
  const [todayPaymentCount, setTodayPaymentCount] = useState(0);
  const [leaders, setLeaders] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const evResponse = await ListEVChargingPayments();
      const paymentResponse = await ListPayments();
      const userResponse = await ListUsers();

      const todayDate = new Date().toISOString().split('T')[0];

      // Filter EV Charging ของวันนี้
      const todayEV = evResponse!.filter((item: any) => {
        const paymentDate = item?.Payment?.Date?.split('T')[0];
        return paymentDate === todayDate;
      });

      // รวม Quantity
      let totalQuantity = 0;
      const map: { [name: string]: number } = {};

      todayEV.forEach((item: any) => {
        const chargerName = item?.EVcharging?.Name || 'Unknown';
        const qty = item?.Quantity || 0;
        totalQuantity += qty;

        if (map[chargerName]) {
          map[chargerName] += qty;
        } else {
          map[chargerName] = qty;
        }
      });

      setPower(totalQuantity);
      setChargerPowerMap(map);

      // Filter Payment ของวันนี้
      const todayPayments = paymentResponse!.filter((item: any) =>
        item.Date?.startsWith(todayDate)
      );
      setTodayPaymentCount(todayPayments.length);

      // รวมจำนวนเงิน
      const totalAmount = todayPayments.reduce((sum: number, item: any) => sum + item.Amount, 0);
      setExpense(totalAmount);

      // ตั้งค่าวันที่
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
      setToday(date.toLocaleDateString('en-US', options));

      // Filter Leaders (เฉพาะ Admin)
      const adminUsers = userResponse!.filter((user: any) => user.UserRole?.RoleName === 'Admin');
      const adminImages = adminUsers.map((user: any) => user.Profile).filter(Boolean);
      setLeaders(adminImages);
      console.log(adminImages)
    };

    fetchData();
  }, []);

  const medicalproBranding = {
    data: [
      {
        title: 'Today Date',
        desc: today,
      },
      {
        title: 'Power',
        desc: `${power.toFixed(2)} kWh`,
      },
      {
        title: 'Expense',
        desc: `$${expense.toLocaleString()}`,
      },
    ],
  };

  return (
    <div className="w-400 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-2xl p-6 m-3">
      <div className="flex justify-between">
        <p className="text-xl font-semibold">MedicalPro Branding</p>
        <button type="button" className="text-xl font-semibold text-gray-400">
          <IoIosMore />
        </button>
      </div>

      <p className="text-xs cursor-pointer hover:drop-shadow-xl font-semibold rounded-lg w-24 bg-orange-400 py-0.5 px-2 text-gray-200 mt-10">
        {today}
      </p>

      <div className="flex gap-4 border-b-1 border-color mt-6">
        {medicalproBranding.data.map((item) => (
          <div key={item.title} className="border-r-1 border-color pr-4 pb-2">
            <p className="text-xs text-gray-400">{item.title}</p>
            <p className="text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="border-b-1 border-color pb-4 mt-2">
        <p className="text-md font-semibold mb-2">Power Type</p>
        <div className="flex flex-col gap-2">
          {Object.entries(chargerPowerMap).map(([name, qty]) => (
            <p
              key={name}
              className="cursor-pointer hover:drop-shadow-xl text-white py-0.5 px-3 rounded-lg text-xs bg-orange-400 w-fit"
            >
              {name}: {qty.toFixed(2)} kWh
            </p>
          ))}
        </div>
      </div>

      <div className="mt-2">
        <p className="text-md font-semibold mb-2">Leaders</p>
        <div className="flex gap-4">
          {leaders.slice(0, 5).map((img, index) => (
            <img
              key={index}
              className="rounded-full w-8 h-8 object-cover"
              src={`${apiUrlPicture}${img}`}
              alt={`Leader ${index}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-5 border-t-1 border-color">
        <div className="mt-3">
          <button
            type="button"
            className="text-white text-3xl p-4 rounded-full hover:shadow-lg transition-all duration-300"
            style={{ backgroundColor: currentColor }}
          >
            <BsBatteryCharging />
          </button>
        </div>
        <p className="text-gray-400 text-sm">{todayPaymentCount} Recent Transactions</p>
      </div>
    </div>
  );
};

export default phone;
