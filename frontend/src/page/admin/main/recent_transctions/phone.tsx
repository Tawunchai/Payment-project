import { BsCurrencyDollar } from 'react-icons/bs';
import { useStateContext } from '../../../../contexts/ContextProvider';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { dropdownData } from '../../../../assets/admin/dummy';
import { useEffect, useState } from 'react';
import { ListPayments, ListUsers, ListEVChargingPayments } from '../../../../services';
import { FaCoins, FaUniversity, FaBolt } from 'react-icons/fa';

const DropDown = ({ currentMode }: any) => (
    <div className="w-28 border-1 border-color px-2 py-1 rounded-md">
        <DropDownListComponent
            id="time"
            fields={{ text: 'Time', value: 'Id' }}
            style={{
                border: 'none',
                color: currentMode === 'Dark' ? 'white' : undefined,
            }}
            value="1"
            dataSource={dropdownData}
            popupHeight="220px"
            popupWidth="120px"
        />
    </div>
);

const phone = () => { //@ts-ignore
    const { currentColor, currentMode } = useStateContext();

    const [currentMonthAmount, setCurrentMonthAmount] = useState<number>(0);
    const [totalCoins, setTotalCoins] = useState<number>(0);
    const [currentMonthTransactionCount, setCurrentMonthTransactionCount] = useState<number>(0);

    // เก็บรายได้แยกตาม EV Charger แต่ละตัว
    const [evRevenueByCharger, setEvRevenueByCharger] = useState<
        { name: string; revenue: number }[]
    >([]);

    useEffect(() => {
        const fetchData = async () => {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // ดึง payments และกรองเฉพาะเดือนปัจจุบัน
            const payments = await ListPayments();
            if (payments) {
                const filteredPayments = payments.filter((p: any) => {
                    const paymentDate = new Date(p.Date);
                    return (
                        paymentDate.getMonth() === currentMonth &&
                        paymentDate.getFullYear() === currentYear
                    );
                });

                const total = filteredPayments.reduce((acc, curr) => acc + (curr.Amount || 0), 0);
                setCurrentMonthAmount(total);

                setCurrentMonthTransactionCount(filteredPayments.length);
            }

            // ดึง users **ไม่กรองเดือน** รวม Coin ทั้งหมดเลย
            const users = await ListUsers();
            if (users) {
                const totalCoin = users.reduce((acc, curr) => acc + (curr.Coin || 0), 0);
                setTotalCoins(totalCoin);
            }

            // ดึง ev payments กรองเฉพาะเดือนปัจจุบัน
            const evPayments = await ListEVChargingPayments();
            if (evPayments) {
                const filteredEV = evPayments.filter(p => {
                    const d = new Date(p.CreatedAt);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                });

                const revenueMap = filteredEV.reduce((acc, curr) => {
                    const name = curr.EVcharging?.Name ?? 'Unknown EV';
                    acc[name] = (acc[name] || 0) + (curr.Price || 0);
                    return acc;
                }, {} as Record<string, number>);

                const revenueArray = Object.entries(revenueMap).map(([name, revenue]) => ({
                    name,
                    revenue,
                }));

                setEvRevenueByCharger(revenueArray);
            }
        };

        fetchData();
    }, []);


    // สร้าง recentTransactions array โดยแทนที่ 2 รายการเป็นข้อมูล EV Charger แต่ละตัว
    const recentTransactionsBase = [
        {
            icon: <BsCurrencyDollar />,
            amount: `${currentMonthAmount.toLocaleString()}฿`,
            title: 'Paromtpay',
            desc: 'Money Added',
            iconColor: '#22C55E',     // เขียวสด tailwind green-500
            iconBg: '#DCFCE7',        // เขียวอ่อน tailwind green-100
            pcColor: 'green-600',
        },
        {
            icon: <FaCoins />,
            amount: `${totalCoins.toLocaleString()}฿`,
            desc: 'All Payment',
            title: 'Coins',
            iconColor: '#FFD700',
            iconBg: '#FFF8DC',
            pcColor: 'yellow-600',
        },
        {
            icon: <FaUniversity />,
            amount: `${currentMonthTransactionCount}`,
            percentage: '+38%',
            title: 'Transactions',
            desc: 'Payment transactions',
            iconColor: '#3B82F6',     
            iconBg: '#DBEAFE',        
            pcColor: 'blue-500',
        },
    ];

    const evTransactions = evRevenueByCharger.map((ev) => ({
        icon: <FaBolt style={{ color: '#FFA500' }} />,  // สีส้ม (#FFA500)
        amount: `${ev.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}฿`,
        title: ev.name,
        desc: 'Monthly EV',
        iconColor: '#FFA500',
        iconBg: 'rgba(255, 165, 0, 0.2)',
        pcColor: 'orange-600',
    }));

    const recentTransactions = [
        recentTransactionsBase[0],
        recentTransactionsBase[1],
        ...evTransactions,
        recentTransactionsBase[2],
    ];

    return (
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
                <p className="text-xl font-semibold">Recent Transactions</p>
                <DropDown currentMode={currentMode} />
            </div>
            <div className="mt-10 w-72 md:w-400">
                {recentTransactions.map((item) => (
                    <div key={item.title} className="flex justify-between mt-4">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                style={{
                                    color: item.iconColor,
                                    backgroundColor: item.iconBg,
                                }}
                                className="text-2xl rounded-lg p-4 hover:drop-shadow-xl"
                            >
                                {item.icon}
                            </button>
                            <div>
                                <p className="text-md font-semibold">{item.title}</p>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                        <p className={`text-${item.pcColor} `}>{item.amount}</p>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-4 pb-4 border-b border-gray-300"></div>
        </div>
    );
};

export default phone;
