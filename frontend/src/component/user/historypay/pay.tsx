import { JSX, useEffect, useState } from "react";
import {
    FaCoins,
    FaPaypal,
    FaWallet,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getUserByID, apiUrlPicture, ListPayments, ListPaymentCoins } from "../../../services";

interface TransactionItem {
    icon: JSX.Element;
    bg: string;
    title: string;
    desc: string;
    amount: string;
    color: string;
    date?: string; // ถ้ามี field วันที่
}

interface UserType {
    FirstName: string;
    LastName: string;
    Profile: string;
    Coin: number;
}

const HistoryPay = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserType | null>(null);
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);


    // โหลดข้อมูล user
    useEffect(() => {
        const fetchUser = async () => {
            const res = await getUserByID(1);
            if (!res) {
                setUser({
                    FirstName: "",
                    LastName: "",
                    Profile: "",
                    Coin: 0,
                });
                return;
            }
            setUser({
                FirstName: res.FirstName ?? "",
                LastName: res.LastName ?? "",
                Profile: res.Profile ?? "",
                Coin: res.Coin ?? 0,
            });
        };
        fetchUser();
    }, []);

    // โหลดข้อมูล history ทั้ง 2 แบบ + filter UserID = 1
    useEffect(() => {
        const fetchHistory = async () => {
            const paymentList = await ListPayments();
            const paymentCoinsList = await ListPaymentCoins();

            // Payments
            const payments: TransactionItem[] = (paymentList ?? [])
                .filter((item: any) => item.UserID === 1)
                .map((item: any) => ({
                    icon: <FaPaypal className="text-2xl text-white" />,
                    bg: "bg-blue-400",
                    title: "promptpay",
                    desc: "Lorem ipsum dolor sit amet",
                    amount: `${item.Amount}$`,
                    color: "text-green-400",
                    date: item.CreatedAt || "",
                }));

            // PaymentCoins
            const paymentCoins: TransactionItem[] = (paymentCoinsList ?? [])
                .filter((item: any) => item.UserID === 1)
                .map((item: any) => ({
                    icon: <FaCoins className="text-2xl text-white" />,
                    bg: "bg-yellow-400",
                    title: "coins",
                    desc: "Lorem ipsum dolor sit amet",
                    amount: `${item.Amount}$`,
                    color: "text-green-500",
                    date: item.CreatedAt || "",
                }));

            // รวม 2 array แล้ว sort จากเก่าไปใหม่ (ใหม่สุดล่างสุด)
            const merged = [...payments, ...paymentCoins].sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateA - dateB;
            });

            setTransactions(merged);

            // === ส่วนนี้: คำนวณผลรวมยอดเงินทั้งหมดของ 2 รายการ ===
            // ดึงยอดออกมาจาก original data (ไม่เอา string ที่ map แล้ว)
            const sumPayments = (paymentList ?? [])
                .filter((item: any) => item.UserID === 1)
                .reduce((acc: number, curr: any) => acc + (Number(curr.Amount) || 0), 0);

            const sumPaymentCoins = (paymentCoinsList ?? [])
                .filter((item: any) => item.UserID === 1)
                .reduce((acc: number, curr: any) => acc + (Number(curr.Amount) || 0), 0);

            setTotalAmount(sumPayments + sumPaymentCoins);
        };

        fetchHistory();
    }, []);



    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-200 via-gray-100 to-white flex flex-col items-center font-sans">
            {/* Header + User Summary Card */}
            <div className="relative w-full flex flex-col items-center">
                {/* Header */}
                <div className="w-full mx-auto h-[200px] rounded-b-3xl bg-gradient-to-br from-orange-600 to-yellow-500 p-6 pt-7 flex flex-col items-center relative shadow-md z-0">
                    <div className="text-white text-lg md:text-2xl font-semibold tracking-wide mb-1 text-center">
                        Financial Analysis
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                        <FaWallet className="text-2xl md:text-3xl text-white" />
                        <span className="text-3xl md:text-4xl font-bold tracking-widest text-white">
                            {user ? `${user.Coin}$` : "-"}
                        </span>
                    </div>
                </div>

                {/* User Summary Card */}
                <div
                    className="
        absolute left-1/2
        -translate-x-1/2
        -bottom-[140px] md:-bottom-[180px]
        w-[95vw] 
        bg-white rounded-xl p-5 md:p-8 flex flex-col items-center shadow-lg border
        z-10
    "
                    style={{ minWidth: 240 }}
                >
                    <div className="flex flex-col items-center mb-3">
                        {/* Profile image (user.Profile) */}
                        {user?.Profile ? (
                            <img
                                src={`${apiUrlPicture}${user.Profile}`}
                                alt="profile"
                                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full border-4 border-orange-200 shadow mb-2"
                            />
                        ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-orange-100 animate-pulse mb-2" />
                        )}
                        {/* FirstName + LastName */}
                        <span className="font-bold text-lg md:text-2xl text-gray-800">
                            {user ? `${user.FirstName} ${user.LastName}` : "Loading..."}
                        </span>
                    </div>
                    <div className="flex justify-between w-full px-2 md:px-8 mb-1">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1">
                                <FaWallet className="text-orange-400" />
                                <span className="text-lg md:text-xl font-semibold text-gray-700">
                                    {totalAmount}$
                                </span>
                            </div>
                        </div>
                        {/* ปุ่มเติมเงิน */}
                        <div className="flex flex-col items-center">
                            <button
                                className="
                                    flex items-center gap-1
                                    bg-gradient-to-r from-orange-400 to-yellow-400
                                    text-white px-4 py-2
                                    rounded-lg shadow font-semibold
                                    hover:from-orange-500 hover:to-yellow-500
                                    transition
                                    md:text-base text-sm
                                "
                                onClick={() => navigate("/user/add-coins")}
                                type="button"
                            >
                                <FaWallet className="text-lg md:text-xl" />
                                เติมเงิน
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer */}
            <div className="h-24"></div>

            {/* History Title + List */}
            <div className="w-full mx-auto mt-[80px] md:mt-[150px] px-4 md:px-8 lg:px-24">
                <div className="text-lg md:text-2xl font-bold text-gray-800 mb-3">History</div>
                <div className="
    bg-white rounded-2xl shadow 
    p-2 md:p-6
    max-h-[370px]
    overflow-y-auto
">
                    {transactions.length === 0 ? (
                        <div className="text-center text-gray-400 py-6">No history.</div>
                    ) : (
                        // *** อย่า slice ตรงนี้ ***
                        transactions.map((item, idx) => (
                            <div key={idx} className="flex items-center py-2 px-2 md:py-3 md:px-4">
                                <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${item.bg} shadow-md mr-3`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold md:text-lg text-gray-700">{item.title}</div>
                                    <div className="text-xs md:text-base text-gray-400">{item.desc}</div>
                                </div>
                                <div className={`text-base md:text-xl font-bold ml-2 ${item.color}`}>
                                    {item.amount}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryPay;
