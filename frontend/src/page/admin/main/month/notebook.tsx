import { SparkLine } from "../../../../component/admin";
import { SparklineAreaData } from "../../../../assets/admin/dummy";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { useState, useEffect } from "react";
import { ListPayments } from "../../../../services";
import type { PaymentsInterface } from "../../../../interface/IPayment";

const EVBluePaymentCard = () => {
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
    <div className="rounded-2xl md:w-400 p-6 m-3 shadow-md bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <p className="font-medium text-xl tracking-wide">Payment Overview</p>
        <div className="text-right">
          <p className="text-3xl font-bold leading-tight mb-1">
            {totalAmount.toLocaleString()}฿
          </p>
          <p className="text-sm text-blue-100 font-medium">
            Revenue in {monthLabel} {year}
          </p>
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="mt-5 bg-blue-800/20 rounded-xl p-3 border border-blue-400/30">
        <SparkLine
          currentColor={currentColor}
          id="column-sparkLine"
          height="100px"
          type="Column"
          data={SparklineAreaData}
          width="320"
          color="rgb(219, 234, 254)"
        />
      </div>
    </div>
  );
};

export default EVBluePaymentCard;
