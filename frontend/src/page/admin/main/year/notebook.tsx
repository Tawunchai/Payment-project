import { Pie } from "../../../../component/admin";
import { ecomPieChartData } from "../../../../assets/admin/dummy";
import { useState, useEffect } from "react";
import { ListPayments } from "../../../../services";

const EVBlueYearlySales = () => {
  const [yearlySales, setYearlySales] = useState<number>(0);

  useEffect(() => {
    const fetchYearlySales = async () => {
      const payments = await ListPayments();
      if (payments) {
        const now = new Date();
        const currentYear = now.getFullYear();

        // ✅ กรองเฉพาะยอดขายปีปัจจุบัน
        const filtered = payments.filter((p: any) => {
          const paymentDate = new Date(p.Date);
          return paymentDate.getFullYear() === currentYear;
        });

        // ✅ รวมยอดทั้งหมดของปีนี้
        const total = filtered.reduce(
          (acc, curr) => acc + (curr.Amount || 0),
          0
        );
        setYearlySales(total);
      }
    };

    fetchYearlySales();
  }, []);

  return (
    <div className="bg-white text-blue-800 rounded-2xl md:w-400 p-6 m-3 flex justify-between items-center shadow-md border border-blue-100">
      {/* Left Info */}
      <div className="flex flex-col justify-center items-start">
        <p className="text-3xl font-bold text-blue-700">
          {yearlySales.toLocaleString()}฿
        </p>
        <p className="text-sm text-blue-600 mt-1">Yearly Sales</p>
      </div>

      {/* Right Pie Chart */}
      <div className="w-36 bg-gradient-to-br from-blue-50 to-white p-2 rounded-xl border border-blue-100">
        <Pie
          id="pie-chart"
          data={ecomPieChartData}
          legendVisiblity={false}
          height="150px"
        />
      </div>
    </div>
  );
};

export default EVBlueYearlySales;
