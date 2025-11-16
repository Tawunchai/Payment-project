import { useEffect, useState, useMemo } from "react";
import LineChart from "./chart/EVRevenueChartIndex";
import { Modal, Input, Button, message, Skeleton } from "antd";
import { ListPayments, ListBank, UpdateBank } from "../../../services";
import { PaymentsInterface } from "../../../interface/IPayment";
import { BankInterface } from "../../../interface/IBank";
import {
  BanknotesIcon,
  UserIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import PaymentHistoryTable from "./payment/index";
import PaymentCoinsTable from "./coin/index";
import { GetProfile } from "../../../services/httpLogin";

/* ===========================
   BANK CODE MAP
   =========================== */
const TH_BANK_CODE_MAP: Record<string, string> = {
  "002": "ธนาคารกรุงเทพ จำกัด (มหาชน)",
  "004": "ธนาคารกสิกรไทย จำกัด (มหาชน)",
  "006": "ธนาคารกรุงไทย จำกัด (มหาชน)",
  "008": "ธนาคารเจพีมอร์แกน เชส",
  "011": "ธนาคารทหารไทยธนชาต จำกัด (มหาชน)",
  "014": "ธนาคารไทยพาณิชย์ จำกัด (มหาชน)",
  "017": "ธนาคารซิตี้แบงก์",
  "018": "ธนาคารซูมิโตโม มิตซุย แบงกิ้ง คอร์ปอเรชั่น",
  "020": "ธนาคารสแตนดาร์ดชาร์เตอร์ด (ไทย) จำกัด (มหาชน)",
  "022": "ธนาคารซีไอเอ็มบี ไทย จำกัด (มหาชน)",
  "024": "ธนาคารยูโอบี จำกัด (มหาชน)",
  "025": "ธนาคารกรุงศรีอยุธยา จำกัด (มหาชน)",
  "026": "ธนาคารเมกะ สากลพาณิชย์ จำกัด (มหาชน)",
  "027": "ธนาคารแห่งอเมริกา เนชั่นแนล แอสโซซิเอชั่น",
  "030": "ธนาคารออมสิน",
  "031": "ธนาคารฮ่องกงและเซี่ยงไฮ้แบงกิ้งคอร์ปอเรชั่น จำกัด",
  "032": "ธนาคารดอยซ์แบงก์",
  "033": "ธนาคารอาคารสงเคราะห์",
  "034": "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร",
  "039": "ธนาคารมิซูโฮ จํากัด",
  "045": "ธนาคารบีเอ็นพี พารีบาส์",
  "052": "ธนาคารแห่งประเทศจีน (ไทย) จำกัด (มหาชน)",
  "066": "ธนาคารอิสลามแห่งประเทศไทย",
  "067": "ธนาคารทิสโก้ จำกัด (มหาชน)",
  "069": "ธนาคารเกียรตินาคินภัทร จำกัด (มหาชน)",
  "070": "ธนาคารไอซีบีซี (ไทย) จำกัด (มหาชน)",
  "071": "ธนาคารไทยเครดิต จำกัด (มหาชน)",
  "073": "ธนาคารแลนด์ แอนด์ เฮ้าส์ จำกัด (มหาชน)",
};

// ฟังก์ชันแสดงชื่อธนาคาร
const formatBankingDisplay = (banking: string | undefined | null): string => {
  if (!banking) return "-";
  const trimmed = String(banking).trim();
  return TH_BANK_CODE_MAP[trimmed] || trimmed;
};

const Payment = () => {
  const [userRole, setUserRole] = useState<string | null>(null); // ⭐ ส่ง role ต่อ
  const [paymentData, setPaymentData] = useState<PaymentsInterface[]>([]);
  const [bankData, setBankData] = useState<BankInterface[]>([]);
  const [editBank, setEditBank] = useState<BankInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  // ⭐ โหลด role ของผู้ใช้จาก token
  useEffect(() => {
    const loadRole = async () => {
      try {
        const res = await GetProfile();
        setUserRole(res.data.role || null);
      } catch {
        setUserRole(null);
      }
    };
    loadRole();
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchBanks();
  }, []);

  const fetchPayments = async () => {
    setTableLoading(true);
    const data = await ListPayments();
    setTimeout(() => {
      setPaymentData(data || []);
      setTableLoading(false);
    }, 2000);
  };

  const fetchBanks = async () => {
    const banks = await ListBank();
    if (banks) setBankData(banks);
  };

  const handleBankChange = (field: keyof BankInterface, value: string) => {
    if (!editBank) return;
    if (field === "Minimum") {
      setEditBank({ ...editBank, Minimum: Number(value) });
    } else {
      setEditBank({ ...editBank, [field]: value as any });
    }
  };

  const handleBankUpdate = async () => {
    if (!editBank) return;
    setLoading(true);

    const ok = await UpdateBank(editBank.ID, {
      promptpay: editBank.PromptPay,
      manager: editBank.Manager,
      banking: editBank.Banking,
      minimum: editBank.Minimum,
    });

    setLoading(false);

    if (ok) {
      message.success("อัปเดตข้อมูลธนาคารเรียบร้อยแล้ว");
      setEditBank(null);
      fetchBanks();
    } else {
      message.error("อัปเดตข้อมูลธนาคารล้มเหลว");
    }
  };

  const selectedBankCode = useMemo(() => {
    if (!editBank?.Banking) return "";
    const val = String(editBank.Banking).trim();
    return TH_BANK_CODE_MAP[val] ? val : "";
  }, [editBank?.Banking]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 via-white to-white mt-14 sm:mt-0">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-semibold tracking-wide">
            Payment & Banking
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-4 sm:px-6 py-6 space-y-6">

        {/* Bank Info */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <h2 className="text-[15px] sm:text-base font-semibold text-gray-800">
              ข้อมูลธนาคารปัจจุบัน
            </h2>
          </div>

          {bankData.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-500">
              ไม่มีข้อมูลธนาคาร
            </div>
          ) : (
            <div className="px-3 sm:px-6 py-4">
              <div className="overflow-x-auto">
                <table className="min-w-[720px] w-full text-gray-700 ev-table">
                  <thead>
                    <tr>
                      <th>PROMPTPAY</th>
                      <th>MANAGER</th>
                      <th>BANKING</th>
                      <th>MINIMUM</th>
                      {userRole === "Admin" && (
                        <th className="text-center">จัดการ</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {bankData.map((bank) => (
                      <tr key={bank.ID}>
                        <td>{bank.PromptPay}</td>
                        <td>{bank.Manager}</td>
                        <td>{formatBankingDisplay(bank.Banking)}</td>
                        <td>{bank.Minimum} บาท</td>

                        {/* Admin เท่านั้นที่เห็นปุ่มแก้ไข */}
                        {userRole === "Admin" && (
                          <td className="text-center">
                            <Button
                              type="primary"
                              className="bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-lg"
                              onClick={() => setEditBank(bank)}
                            >
                              แก้ไข
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Chart */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 sm:p-6">
          <LineChart />
        </section>

        {/* Payment History */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 sm:p-6">
          {tableLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <PaymentHistoryTable data={paymentData} role={userRole} />
          )}
        </section>

        {/* Payment Coins */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 sm:p-6">
          {tableLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <PaymentCoinsTable role={userRole} />
          )}
        </section>

      </main>

      {/* Modal */}
      <Modal
        open={!!editBank}
        onCancel={() => setEditBank(null)}
        footer={null}
        centered
        destroyOnClose
        width={420}
        styles={{
          content: {
            borderRadius: 20,
            padding: 0,
            overflow: "hidden",
            background: "#ffffff",
          },
        }}
      >
        {editBank && userRole === "Admin" && (
          <div className="px-5 py-6 text-gray-800">

            <div className="flex items-center justify-center mb-4 border-b border-gray-100 pb-3">
              <BanknotesIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-base sm:text-lg font-semibold text-blue-700">
                แก้ไขข้อมูลธนาคาร
              </h2>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-gray-700 font-medium flex items-center mb-1">
                  <BanknotesIcon className="h-5 w-5 mr-2 text-blue-500" />
                  PromptPay
                </span>
                <Input
                  value={editBank.PromptPay}
                  onChange={(e) => handleBankChange("PromptPay", e.target.value)}
                  className="rounded-lg h-10 border-gray-300"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700 font-medium flex items-center mb-1">
                  <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Manager
                </span>
                <Input
                  value={editBank.Manager}
                  onChange={(e) => handleBankChange("Manager", e.target.value)}
                  className="rounded-lg h-10 border-gray-300"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700 font-medium flex items-center mb-1">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-blue-500" />
                  ธนาคาร
                </span>
                <select
                  value={selectedBankCode}
                  onChange={(e) => handleBankChange("Banking", e.target.value)}
                  className="appearance-none w-full rounded-lg border border-gray-300 h-10 px-3 bg-white"
                >
                  <option value="">เลือกธนาคาร</option>
                  {Object.entries(TH_BANK_CODE_MAP).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-gray-700 font-medium flex items-center mb-1">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Minimum (บาท)
                </span>
                <Input
                  type="number"
                  min={0}
                  value={editBank.Minimum}
                  onChange={(e) => handleBankChange("Minimum", e.target.value)}
                  className="rounded-lg h-10 border-gray-300"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setEditBank(null)}
                block
                className="h-11 rounded-lg"
              >
                ยกเลิก
              </Button>

              <Button
                type="primary"
                loading={loading}
                block
                onClick={handleBankUpdate}
                className="h-11 rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                บันทึก
              </Button>
            </div>

          </div>
        )}
      </Modal>

      {/* Table Style */}
      <style>{`
        .ev-table thead th {
          background: #f9fafb;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 700;
          font-size: 13px;
          text-align: left;
          padding: 12px 10px;
        }
        .ev-table tbody td {
          border-top: 1px solid #f1f5f9;
          padding: 12px 10px;
        }
        .ev-table tbody tr:nth-child(even) td {
          background: #f9fafb;
        }
        .ev-table tbody tr:hover td {
          background: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default Payment;
