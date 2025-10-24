import { SparkLine } from "../../../../component/admin";
import { SparklineAreaData } from "../../../../assets/admin/dummy";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { useState, useEffect } from "react";
import { ListPayments } from "../../../../services";
import type { PaymentsInterface } from "../../../../interface/IPayment";

const EVBluePaymentMobile = () => {
  const { currentColor } = useStateContext();
 //@ts-ignore
  const [payments, setPayments] = useState<PaymentsInterface[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    const fetchPayments = async () => {
      const res = await ListPayments();
      if (res) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const filtered = res.filter((p: any) => {
          const paymentDate = new Date(p.Date);
          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        });

        setPayments(filtered);
        const total = filtered.reduce(
          (acc, curr) => acc + (curr.Amount || 0),
          0
        );
        setTotalAmount(total);
      }
    };

    fetchPayments();
  }, []);

  const now = new Date();
  const monthLabel = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();

  return (
    <div className="w-[94%] mx-auto rounded-2xl shadow-md p-4 mt-4 mb-4 bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-base text-blue-800">Payment Overview</p>
        <div className="text-right">
          <p className="text-xl font-bold text-blue-700 leading-tight">
            {totalAmount.toLocaleString()}฿
          </p>
          <p className="text-xs text-blue-500 font-medium">
            Revenue in {monthLabel} {year}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl p-2 border border-blue-200">
        <SparkLine
          currentColor={currentColor}
          id="column-sparkLine"
          height="90px"
          type="Column"
          data={SparklineAreaData}
          width="260"
          color="rgb(37, 99, 235)"
        />
      </div>
    </div>
  );
};

export default EVBluePaymentMobile;
