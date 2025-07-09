import { IoIosMore } from 'react-icons/io';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { BsChatLeft } from 'react-icons/bs';
import { SparkLine } from '../../../../component/admin';
import { SparklineAreaData } from '../../../../assets/admin/dummy';
import { useStateContext } from '../../../../contexts/ContextProvider';
import { ListPayments, ListEVChargingPayments, ListReviews } from '../../../../services';
import { useEffect, useState } from 'react';

const phone = () => {
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
        const name = `${p.User?.FirstName ?? ''} ${p.User?.LastName ?? ''}`.trim() || 'Unknown';
        userTotals[name] = (userTotals[name] || 0) + p.Amount;
      });
      const topUser = Object.entries(userTotals).sort((a, b) => b[1] - a[1])[0];
      setTopPayer({ name: topUser?.[0], amount: topUser?.[1] ?? 0 });

      // ✅ 2. Top Revenue EV Charger
      const evTotals: Record<string, number> = {};
      const evIncome: Record<string, number> = {};

      evPayments?.forEach((ev: any) => {
        const name = ev.EVcharging?.Name ?? 'Unknown EV';

        // รวมจำนวนครั้งที่ใช้งาน
        evTotals[name] = (evTotals[name] || 0) + 1;

        // รวมรายได้จาก ev.Price * ev.Quantity
        const income = ev.Price;
        evIncome[name] = (evIncome[name] || 0) + income;
      });

      const topEV = Object.entries(evIncome).sort((a, b) => b[1] - a[1])[0]?.[0];
      setMostEV({
        name: topEV,
        count: evTotals[topEV],
        income: evIncome[topEV],
      });

      // ✅ 3. Total Reviews
      setTotalReviews(reviews?.length ?? 0);
    };

    fetchData();
  }, []);

  const stats = [
    {
      icon: <FiShoppingCart />,
      amount: `฿${topPayer?.amount?.toLocaleString() ?? '-'}`,
      title: 'Top Payer',
      desc: topPayer?.name ?? '-',
      iconBg: '#FB9678',
      pcColor: 'green-600',
    },
    {
      icon: <FiStar />,
      amount: `฿${mostEV?.income?.toLocaleString() ?? '-'}`,
      title: 'Top EV Charger',
      desc: `${mostEV?.name ?? '-'} (${mostEV?.count ?? 0} transections)`,
      iconBg: 'rgb(254, 201, 15)',
      pcColor: 'green-600',
    },
    {
      icon: <BsChatLeft />,
      amount: `${totalReviews} Reviews`,
      title: 'Total Reviews',
      desc: 'Across all users',
      iconBg: '#00C292',
      pcColor: 'blue-600',
    },
  ];

  return (
    <div className="md:w-400 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-2xl p-6 m-3">
      <div className="flex justify-between">
        <p className="text-xl font-semibold">Weekly Stats</p>
        <button type="button" className="text-xl font-semibold text-gray-500">
          <IoIosMore />
        </button>
      </div>

      <div className="mt-10">
        {stats.map((item, index) => (
          <div key={index} className="flex justify-between mt-4 w-full">
            <div className="flex gap-4">
              <button
                type="button"
                style={{ background: item.iconBg }}
                className="text-2xl hover:drop-shadow-xl text-white rounded-full p-3"
              >
                {item.icon}
              </button>
              <div>
                <p className="text-md font-semibold">{item.title}</p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </div>
            <p className={`text-${item.pcColor}`}>{item.amount}</p>
          </div>
        ))}

        <div className="mt-4">
          <SparkLine
            currentColor={currentColor}
            id="area-sparkLine"
            height="160px"
            type="Area"
            data={SparklineAreaData}
            width="320"
            color="rgb(242, 252, 253)"
          />
        </div>
      </div>
    </div>
  );
};

export default phone;
