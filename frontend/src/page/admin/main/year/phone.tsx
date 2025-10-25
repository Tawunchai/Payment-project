import { Pie } from "../../../../component/admin";
import { ecomPieChartData } from "../../../../assets/admin/dummy";
import { useState, useEffect } from "react";
import { ListPayments } from "../../../../services";

const EVBlueYearlySalesMobile = () => {
  const [yearlySales, setYearlySales] = useState<number>(0);

  useEffect(() => {
    const fetchYearlySales = async () => {
      const payments = await ListPayments();
      if (payments) {
        const now = new Date();
        const currentYear = now.getFullYear();

        // ✅ กรองยอดปีปัจจุบัน
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
    <div className="w-[94%] mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 text-blue-800 rounded-2xl shadow-sm border border-blue-200 p-4 mt-3 mb-3 flex justify-between items-center">
      {/* Left Side */}
      <div className="flex flex-col justify-center items-start">
        <p className="text-lg font-semibold text-blue-700">
          {yearlySales.toLocaleString()}฿
        </p>
        <p className="text-sm text-blue-600 mt-1">Yearly Sales</p>
      </div>

      {/* Right Side (Pie Chart) */}
      <div className="w-24 bg-gradient-to-br from-blue-100 to-white p-1.5 rounded-xl border border-blue-100">
        <Pie
          id="pie-chart"
          data={ecomPieChartData}
          legendVisiblity={false}
          height="100px"
        />
      </div>
    </div>
  );
};

export default EVBlueYearlySalesMobile;
