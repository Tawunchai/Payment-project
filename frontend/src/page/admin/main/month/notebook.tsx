import { SparkLine } from '../../../../component/admin';
import { SparklineAreaData } from '../../../../assets/admin/dummy';
import { useStateContext } from '../../../../contexts/ContextProvider';
import { useState, useEffect } from 'react';
import { ListPayments, ListUsers } from "../../../../services";
import { PaymentsInterface } from "../../../../interface/IPayment";

const Index = () => {
  const { currentColor } = useStateContext();//@ts-ignore
  const [payments, setPayments] = useState<PaymentsInterface[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);//@ts-ignore
  const [userCount, setUserCount] = useState<number>(0);//@ts-ignore
  const [employeeCount, setEmployeeCount] = useState<number>(0);

  useEffect(() => {
    const fetchPayments = async () => {
      const res = await ListPayments();
      if (res) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // ✅ กรองเฉพาะรายการในเดือนนี้
        const filtered = res.filter((p: any) => {
          const paymentDate = new Date(p.Date);
          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        });

        setPayments(filtered);

        const total = filtered.reduce((acc, curr) => acc + (curr.Amount || 0), 0);
        setTotalAmount(total);
      }
    };

    const fetchUsers = async () => {
      const res = await ListUsers();
      if (res) {
        const usersOnly = res.filter((user) => user.UserRole?.RoleName === "User");
        const employees = res.filter((user) =>
          user.UserRole?.RoleName === "Admin" || user.UserRole?.RoleName === "Employee"
        );

        setUserCount(usersOnly.length);
        setEmployeeCount(employees.length);
      }
    };

    fetchPayments();
    fetchUsers();
  }, []);

  const now = new Date();
  const monthLabel = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  return (
    <div
      className="rounded-2xl md:w-400 p-4 m-3"
      style={{ backgroundColor: currentColor }}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold text-white text-2xl">Payment Money</p>

        <div>
          <p className="text-2xl text-white font-semibold mt-8 ml-12">
            ฿{totalAmount.toLocaleString()}
          </p>
          <p className="text-gray-200">
            Revenue in {monthLabel} {year}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <SparkLine
          currentColor={currentColor}
          id="column-sparkLine"
          height="100px"
          type="Column"
          data={SparklineAreaData}
          width="320"
          color="rgb(242, 252, 253)"
        />
      </div>
    </div>
  );
};

export default Index;
