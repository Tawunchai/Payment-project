import { Pie } from '../../../../component/admin';
import { ecomPieChartData } from '../../../../assets/admin/dummy';
import { useState, useEffect } from 'react';
import { ListPayments } from '../../../../services';

const Index = () => {
  const [yearlySales, setYearlySales] = useState<number>(0);

  useEffect(() => {
    const fetchYearlySales = async () => {
      const payments = await ListPayments();
      if (payments) {
        const now = new Date();
        const currentYear = now.getFullYear();

        // กรองยอดปีปัจจุบัน
        const filtered = payments.filter((p: any) => {
          const paymentDate = new Date(p.Date);
          return paymentDate.getFullYear() === currentYear;
        });

        // รวมยอด Amount ทั้งหมดของปีนี้
        const total = filtered.reduce((acc, curr) => acc + (curr.Amount || 0), 0);
        setYearlySales(total);
      }
    };

    fetchYearlySales();
  }, []);

  return (
    <div
      className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-2xl md:w-400 p-8 m-3 flex justify-center items-center gap-10"
    >
      <div>
        <p className="text-2xl font-semibold">฿{yearlySales.toLocaleString()}</p>
        <p className="text-gray-400">Yearly now sales</p>
      </div>

      <div className="w-40">
        <Pie
          id="pie-chart"
          data={ecomPieChartData}
          legendVisiblity={false}
          height="160px"
        />
      </div>
    </div>
  );
};

export default Index;
