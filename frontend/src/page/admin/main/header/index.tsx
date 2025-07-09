import { BsCurrencyDollar } from 'react-icons/bs';
import { Button } from '../../../../component/admin';
import { useStateContext } from '../../../../contexts/ContextProvider';
import { ListPayments, ListUsers } from "../../../../services";
import { PaymentsInterface } from "../../../../interface/IPayment";
import { useEffect, useState } from 'react';
import { FiBarChart } from 'react-icons/fi';
import { BsBoxSeam } from 'react-icons/bs';
import { MdOutlineSupervisorAccount } from 'react-icons/md';
import { HiOutlineRefresh } from 'react-icons/hi';

const index = () => {//@ts-ignore
    const { currentColor, currentMode } = useStateContext(); //@ts-ignore
    const [payments, setPayments] = useState<PaymentsInterface[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [userCount, setUserCount] = useState<number>(0);
    const [employeeCount, setEmployeeCount] = useState<number>(0);


    useEffect(() => {
        const fetchPayments = async () => {
            const res = await ListPayments();
            console.log(res)
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
                const employees = res.filter((user) => user.UserRole?.RoleName === "Admin" || user.UserRole?.RoleName === "Employee");

                setUserCount(usersOnly.length);
                setEmployeeCount(employees.length);
            }
        };

        fetchPayments();
        fetchUsers();
    }, []);

    const earningData = [
        {
            icon: <MdOutlineSupervisorAccount />,
            amount: userCount.toLocaleString(),
            percentage: '-4%',
            title: 'Customers',
            iconColor: '#03C9D7',
            iconBg: '#E5FAFB',
            pcColor: 'red-600',
        },
        {
            icon: <BsBoxSeam />,
            amount: employeeCount.toLocaleString(),
            percentage: '+23%',
            title: 'Employees',
            iconColor: 'rgb(255, 244, 229)',
            iconBg: 'rgb(254, 201, 15)',
            pcColor: 'green-600',
        },
        {
            icon: <FiBarChart />,
            amount: '423,39',
            percentage: '+38%',
            title: 'Sales',
            iconColor: 'rgb(228, 106, 118)',
            iconBg: 'rgb(255, 244, 229)',
            pcColor: 'green-600',
        },
        {
            icon: <HiOutlineRefresh />,
            amount: '39,354',
            percentage: '-12%',
            title: 'Refunds',
            iconColor: 'rgb(0, 194, 146)',
            iconBg: 'rgb(235, 250, 242)',
            pcColor: 'red-600',
        },
    ];

    const handleDownloadCSV = async () => {
        const res = await ListPayments();
        if (!res) {
            console.error("Failed to fetch payments");
            return;
        }

        const headers = ["ID", "User", "Method", "Amount", "CreatedAt"];
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
        <div className="flex flex-wrap lg:flex-nowrap justify-center ">
            <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-hero-pattern bg-no-repeat bg-cover bg-center">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-gray-400">Payment Money</p>
                        <p className="text-2xl">${totalAmount.toLocaleString()}</p>
                    </div>
                    <button
                        type="button"
                        style={{ backgroundColor: currentColor }}
                        className="text-2xl opacity-0.9 text-white hover:drop-shadow-xl rounded-full  p-4"
                    >
                        <BsCurrencyDollar />
                    </button>
                </div>
                <div className="mt-6">
                    <Button
                        color="white"
                        bgColor={currentColor}
                        text="Download"
                        borderRadius="10px"
                        onClick={handleDownloadCSV}
                    />
                </div>
            </div>
            <div className="flex m-3 flex-wrap justify-center gap-1 items-center">
                <div className="earning-grid">
                    {earningData.map((item) => (
                        <div key={item.title} className="earning-item bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-44 p-4 pt-9 rounded-2xl">
                            <button
                                type="button"
                                style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
                            >
                                {item.icon}
                            </button>
                            <p className="mt-3">
                                <span className="text-lg font-semibold">{item.amount}</span>
                            </p>
                            <p className="text-sm text-gray-400 mt-1">{item.title}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default index