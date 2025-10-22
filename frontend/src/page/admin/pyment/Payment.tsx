import { useEffect, useState } from "react";
import LineChart from "./chart/line";
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

const Payment = () => {
  const [paymentData, setPaymentData] = useState<PaymentsInterface[]>([]);
  const [bankData, setBankData] = useState<BankInterface[]>([]);
  const [editBank, setEditBank] = useState<BankInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 via-white to-white mt-14 sm:mt-0">
      {/* Header */}
      <header
        className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
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
                      <th className="text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankData.map((bank) => (
                      <tr key={bank.ID}>
                        <td>{bank.PromptPay}</td>
                        <td>{bank.Manager}</td>
                        <td>{bank.Banking}</td>
                        <td>{bank.Minimum} บาท</td>
                        <td className="text-center">
                          <Button
                            type="primary"
                            className="bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-lg"
                            onClick={() => setEditBank(bank)}
                          >
                            แก้ไข
                          </Button>
                        </td>
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
            <PaymentHistoryTable data={paymentData} onReload={fetchPayments} />
          )}
        </section>

        {/* Payment Coins */}
        <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 sm:p-6">
          {tableLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            // ...
            <PaymentCoinsTable/>
            // ...
          )}
        </section>
      </main>

      {/* ✅ Modal — EV Clean White Style */}
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
        {editBank && (
          <div className="px-5 py-6 text-gray-800">
            {/* Header */}
            <div className="flex items-center justify-center mb-4 border-b border-gray-100 pb-3">
              <BanknotesIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-base sm:text-lg font-semibold text-blue-700">
                แก้ไขข้อมูลธนาคาร
              </h2>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-gray-700 font-medium flex items-center mb-1">
                  <BanknotesIcon className="h-5 w-5 mr-2 text-blue-500" />
                  PromptPay
                </span>
                <Input
                  value={editBank.PromptPay}
                  onChange={(e) => handleBankChange("PromptPay", e.target.value)}
                  className="rounded-lg h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="เลข PromptPay"
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
                  className="rounded-lg h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="ชื่อผู้จัดการ"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700 font-medium flex items-center mb-1">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Banking
                </span>
                <Input
                  value={editBank.Banking}
                  onChange={(e) => handleBankChange("Banking", e.target.value)}
                  className="rounded-lg h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="ชื่อธนาคาร / สาขา"
                />
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
                  className="rounded-lg h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="จำนวนเงินขั้นต่ำ"
                />
              </label>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setEditBank(null)}
                block
                style={{
                  height: 42,
                  borderRadius: 10,
                  fontWeight: 500,
                  border: "1px solid #d1d5db",
                  color: "#374151",
                }}
              >
                ยกเลิก
              </Button>
              <Button
                type="primary"
                loading={loading}
                block
                onClick={handleBankUpdate}
                style={{
                  height: 42,
                  borderRadius: 10,
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
                  border: "none",
                  boxShadow: "0 4px 10px rgba(37,99,235,0.2)",
                }}
              >
                บันทึก
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Table styles */}
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
