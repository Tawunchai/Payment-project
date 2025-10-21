import { JSX, useEffect, useMemo, useState } from "react";
import { FaCoins, FaPaypal, FaWallet } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getUserByID, apiUrlPicture, ListPaymentsByUserID } from "../../../services";

interface TransactionItem {
  icon: JSX.Element;
  bg: string;
  title: string;
  desc: string;
  amountNum: number;
  amountText: string;
  color: string;
  date?: string;
  displayDate?: string;
  displayTime?: string;
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
  const [loading, setLoading] = useState(true);
  const [userid, setUserid] = useState<number>(Number(localStorage.getItem("userid")) || 0);

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDate = (d: string | Date) =>
    new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });

  const fmtTime = (d: string | Date) =>
    new Date(d).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });

  const pickStyleByMethod = (methodId?: number, methodName?: string) => {
    const name = (methodName || "").toLowerCase();
    if (methodId === 2 || name.includes("coin") || name.includes("coins")) {
      return {
        icon: <FaCoins className="text-base text-white" />,
        bg: "bg-blue-400",
        title: methodName || "Coins",
        desc: "ชำระด้วย Coins",
      };
    }
    return {
      icon: <FaPaypal className="text-base text-white" />,
      bg: "bg-blue-500",
      title: methodName || "QR Payment",
      desc: "ชำระผ่าน PromptPay/QR",
    };
  };

  useEffect(() => {
    const fetchUser = async () => {
      const _uid = Number(localStorage.getItem("userid")) || userid || 0;
      setUserid(_uid);
      if (_uid === 0) return;
      const res = await getUserByID(_uid);
      setUser({
        FirstName: res?.FirstName ?? "",
        LastName: res?.LastName ?? "",
        Profile: res?.Profile ?? "",
        Coin: res?.Coin ?? 0,
      });
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userid) return;
      setLoading(true);
      try {
        const list = await ListPaymentsByUserID(userid);
        const payments = (list ?? []).map((it: any) => {
          const amount = Number(it.Amount) || 0;
          const methodName: string =
            it?.Method?.Medthod || it?.Method?.Method || it?.Method?.Name || "";
          const methodId: number | undefined = it?.MethodID;
          const style = pickStyleByMethod(methodId, methodName);
          const dateRaw: string = it?.CreatedAt || it?.Date || "";

          return {
            icon: style.icon,
            bg: style.bg,
            title: style.title,
            desc: style.desc,
            amountNum: amount,
            amountText: `$${fmt(amount)}`,
            color: "text-green-600",
            date: dateRaw,
            displayDate: dateRaw ? fmtDate(dateRaw) : "",
            displayTime: dateRaw ? fmtTime(dateRaw) : "",
          } as TransactionItem;
        });

        payments.sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        });

        setTransactions(payments);

        const sum = (list ?? []).reduce(
          (acc: number, cur: any) => acc + (Number(cur.Amount) || 0),
          0
        );
        setTotalAmount(sum);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userid]);

  const coinBalance = useMemo(() => user?.Coin ?? 0, [user]);

  // ความสูงสูงสุดของ “6 แถว” (ปรับได้ตามดีไซน์)
  // ประมาณแถวละ ~64px -> 6 แถว ≈ 384px + ระยะเผื่อ
  const MAX_LIST_HEIGHT = 400; // px

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* HEADER */}
      <header
        className="sticky top-0 z-30 bg-blue-600 text-white rounded-b-2xl shadow-md overflow-hidden w-full"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto max-w-screen-sm md:max-w-6xl px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            aria-label="ย้อนกลับ"
            className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
              <FaWallet className="text-white" />
            </span>
            <span className="text-sm md:text-base font-semibold tracking-wide">Wallet & History</span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="mx-auto w-full max-w-screen-sm md:max-w-6xl px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 md:gap-6">
          {/* LEFT: SUMMARY */}
          <section className="md:col-span-4">
            <div className="md:sticky md:top-[88px] md:space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  {user?.Profile ? (
                    <img
                      src={`${apiUrlPicture}${user.Profile}`}
                      alt="profile"
                      className="h-14 w-14 rounded-full object-cover border-4 border-blue-50"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-blue-50 animate-pulse" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {user ? `${user.FirstName} ${user.LastName}` : "Loading..."}
                    </div>
                    <div className="text-xs text-gray-500 truncate">กระเป๋าเงินของฉัน</div>
                  </div>
                  <button
                    onClick={() => navigate("/user/add-coins")}
                    className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition"
                  >
                    เติมเงิน
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-blue-50 p-3">
                    <div className="text-[11px] text-blue-900">ยอดคงเหลือ (Coins)</div>
                    <div className="mt-1 text-lg font-bold text-blue-700">${fmt(coinBalance)}</div>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <div className="text-[11px] text-blue-900">รวมธุรกรรมทั้งหมด</div>
                    <div className="mt-1 text-lg font-bold text-blue-700">${fmt(totalAmount)}</div>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 h-10 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  กลับ
                </button>
                <button
                  onClick={() => navigate("/user/add-coins")}
                  className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800"
                >
                  เติม Coins
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT: HISTORY */}
          <main className="md:col-span-8 mt-4 md:mt-0">
            <div className="mb-2 text-sm md:text-base font-bold text-gray-900">ประวัติการชำระเงิน</div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">No history.</div>
              ) : (
                <>
                  {/* Desktop header (fixed) */}
                  <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 text-xs font-semibold text-gray-600 bg-gray-50 border-b border-gray-100">
                    <div className="col-span-6">วิธี / รายละเอียด</div>
                    <div className="col-span-2">วันที่</div>
                    <div className="col-span-2">เวลา</div>
                    <div className="col-span-2 text-right">จำนวน</div>
                  </div>

                  {/* Desktop list with scroll after 6 rows */}
                  <div
                    className="hidden md:block overflow-y-auto"
                    style={{ maxHeight: `${MAX_LIST_HEIGHT}px` }}
                  >
                    <ul className="divide-y divide-gray-100">
                      {transactions.map((item, idx) => (
                        <li key={idx} className="grid grid-cols-12 gap-3 px-5 py-3 hover:bg-gray-50">
                          <div className="col-span-6 flex items-center gap-3 min-w-0">
                            <div className={`shrink-0 h-10 w-10 rounded-xl ${item.bg} text-white flex items-center justify-center`}>
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-gray-900">{item.title}</div>
                              <div className="truncate text-[12px] text-gray-500">{item.desc}</div>
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center text-sm text-gray-700">{item.displayDate}</div>
                          <div className="col-span-2 flex items-center text-sm text-gray-700">{item.displayTime}</div>
                          <div className="col-span-2 flex items-center justify-end text-sm font-bold text-green-600">
                            {item.amountText}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mobile list: show 6 then scroll */}
                  <div className="md:hidden" style={{ maxHeight: `${MAX_LIST_HEIGHT}px`, overflowY: "auto" }}>
                    <ul className="divide-y divide-gray-100">
                      {transactions.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 px-4 py-3">
                          <div className={`shrink-0 h-10 w-10 rounded-xl ${item.bg} text-white flex items-center justify-center`}>
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="truncate text-sm font-semibold text-gray-900">{item.title}</div>
                              <div className={`text-sm font-bold ${item.color}`}>{item.amountText}</div>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <div className="truncate text-[12px] text-gray-500">{item.desc}</div>
                              {(item.displayDate || item.displayTime) && (
                                <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600">
                                  {item.displayDate}
                                  {item.displayTime ? ` • ${item.displayTime}` : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* CTA ล่าง (โมบาย) */}
            <div className="mt-4 flex gap-2 md:hidden">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium active:bg-gray-50"
              >
                กลับ
              </button>
              <button
                onClick={() => navigate("/user/add-coins")}
                className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800"
              >
                เติม Coins
              </button>
            </div>
          </main>
        </div>
      </div>

      <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
    </div>
  );
};

export default HistoryPay;
