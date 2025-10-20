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
    // eslint-disable-next-line
  }, []);

  const fetchPayments = async () => {
    setTableLoading(true);
    const data = await ListPayments();
    setTimeout(() => {
      // loader 2 วิ เพื่อให้ transition นุ่ม
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
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#eaf2ff_0%,#f5f8ff_55%,#ffffff_100%)] mt-14 sm:mt-0">
      {/* Header — EV Blue */}
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
        {/* Bank Info (EV Blue Card) */}
        <section className="rounded-2xl bg-white border border-blue-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-blue-100 bg-blue-50/40">
            <h2 className="text-[15px] sm:text-base font-semibold text-blue-900">
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
                      <th>
                        <div className="flex items-center gap-2">
                          <BanknotesIcon className="h-5 w-5 text-blue-600" />
                          PROMPTPAY
                        </div>
                      </th>
                      <th>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                          MANAGER
                        </div>
                      </th>
                      <th>
                        <div className="flex items-center gap-2">
                          <CreditCardIcon className="h-5 w-5 text-blue-600" />
                          BANKING
                        </div>
                      </th>
                      <th>
                        <div className="flex items-center gap-2">
                          <CreditCardIcon className="h-5 w-5 text-blue-600" />
                          MINIMUM
                        </div>
                      </th>
                      <th className="text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankData.map((bank) => (
                      <tr key={bank.ID}>
                        <td title={bank.PromptPay} className="truncate">
                          {bank.PromptPay}
                        </td>
                        <td title={bank.Manager} className="truncate">
                          {bank.Manager}
                        </td>
                        <td title={bank.Banking} className="truncate">
                          {bank.Banking}
                        </td>
                        <td title={`${bank.Minimum} บาท`} className="truncate">
                          {bank.Minimum} บาท
                        </td>
                        <td className="text-center">
                          <Button
                            type="primary"
                            className="bg-blue-600 hover:bg-blue-700 border-blue-600"
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

        {/* Chart (EV Blue Card) */}
        <section className="rounded-2xl bg-white border border-blue-100 shadow-sm p-4 sm:p-6">
          <LineChart />
        </section>

        {/* Payment History */}
        <section className="rounded-2xl bg-white border border-blue-100 shadow-sm p-4 sm:p-6">
          {tableLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <PaymentHistoryTable data={paymentData} />
          )}
        </section>

        {/* Payment Coins */}
        <section className="rounded-2xl bg-white border border-blue-100 shadow-sm p-4 sm:p-6">
          {tableLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <PaymentCoinsTable />
          )}
        </section>
      </main>

      {/* Edit Bank Modal — EV Minimal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BanknotesIcon className="h-6 w-6 text-blue-600" />
            <span className="text-[15px] sm:text-base font-semibold">
              แก้ไขข้อมูลธนาคาร
            </span>
          </div>
        }
        open={!!editBank}
        onCancel={() => setEditBank(null)}
        onOk={handleBankUpdate}
        confirmLoading={loading}
        okText="บันทึก"
        cancelText="ยกเลิก"
        centered
        bodyStyle={{ padding: "1.25rem 1.5rem" }}
      >
        {editBank && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700 text-sm font-medium flex items-center mb-1">
                <BanknotesIcon className="h-5 w-5 mr-1 text-blue-600" />
                PromptPay
              </span>
              <Input
                value={editBank.PromptPay}
                onChange={(e) => handleBankChange("PromptPay", e.target.value)}
                className="rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500/40"
                placeholder="เลข PromptPay"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 text-sm font-medium flex items-center mb-1">
                <UserIcon className="h-5 w-5 mr-1 text-blue-600" />
                Manager
              </span>
              <Input
                value={editBank.Manager}
                onChange={(e) => handleBankChange("Manager", e.target.value)}
                className="rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500/40"
                placeholder="ชื่อผู้จัดการ"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 text-sm font-medium flex items-center mb-1">
                <CreditCardIcon className="h-5 w-5 mr-1 text-blue-600" />
                Banking
              </span>
              <Input
                value={editBank.Banking}
                onChange={(e) => handleBankChange("Banking", e.target.value)}
                className="rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500/40"
                placeholder="ชื่อธนาคาร / สาขา"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 text-sm font-medium flex items-center mb-1">
                <CreditCardIcon className="h-5 w-5 mr-1 text-blue-600" />
                Minimum (บาท)
              </span>
              <Input
                type="number"
                min={0}
                value={editBank.Minimum}
                onChange={(e) => handleBankChange("Minimum", e.target.value)}
                className="rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500/40"
                placeholder="จำนวนเงินขั้นต่ำ"
              />
            </label>
          </div>
        )}
      </Modal>

      {/* EV Table style overrides */}
      <style>{`
        .ev-table thead th {
          background: #fff;
          color: #0f172a;
          border-bottom: 1px solid rgba(2,6,23,0.08);
          font-weight: 700;
          font-size: 13px;
          letter-spacing: .2px;
          text-align: left;
          padding: 12px 10px;
          white-space: nowrap;
        }
        .ev-table tbody td {
          border-top: 1px solid rgba(2,6,23,0.06);
          padding: 12px 10px;
          max-width: 240px;
        }
        .ev-table tbody tr:nth-child(even) td {
          background: #fcfcff;
        }
        .ev-table tbody tr:hover td {
          background: #f8fafc;
        }
        .ev-table .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default Payment;
