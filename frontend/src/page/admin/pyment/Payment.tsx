import { useEffect, useState } from "react";
import LineChart from "./chart/line";
import { Modal, Input, Button, message, Skeleton } from "antd";
import { ListPayments, ListBank, UpdateBank } from "../../../services";
import { PaymentsInterface } from "../../../interface/IPayment";
import { BankInterface } from "../../../interface/IBank";
import { BanknotesIcon, UserIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import PaymentHistoryTable from "./payment/index"; // <- path ต้องตรงกับที่สร้าง PaymentHistoryTable.tsx
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
    setTimeout(() => { // loader 2 วินาทีเสมอ
      setPaymentData(data || []);
      setTableLoading(false);
    }, 2000);
  };

  const fetchBanks = async () => {
    const banks = await ListBank();
    if (banks) {
      setBankData(banks);
    }
  };

  const handleBankChange = (field: keyof BankInterface, value: string) => {
    if (editBank) {
      if (field === "Minimum") {
        setEditBank({ ...editBank, Minimum: Number(value) });
      } else {
        setEditBank({ ...editBank, [field]: value });
      }
    }
  };

  const handleBankUpdate = async () => {
    if (!editBank) return;
    setLoading(true);
    const updated = await UpdateBank(editBank.ID, {
      promptpay: editBank.PromptPay,
      manager: editBank.Manager,
      banking: editBank.Banking,
      minimum: editBank.Minimum,
    });
    setLoading(false);
    if (updated) {
      message.success("อัปเดตข้อมูลธนาคารเรียบร้อยแล้ว");
      setEditBank(null);
      fetchBanks();
    } else {
      message.error("อัปเดตข้อมูลธนาคารล้มเหลว");
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24">
      {/* ข้อมูลธนาคาร */}
      <div className="bg-white rounded-3xl p-6 md:p-10 mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-300 pb-3">
          ข้อมูลธนาคารปัจจุบัน
        </h2>
        {bankData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">ไม่มีข้อมูลธนาคาร</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full table-fixed border-collapse text-gray-700">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold tracking-wide select-none">
                  <th className="border border-gray-300 p-3 w-[140px] min-w-[130px] text-left">
                    <div className="flex items-center space-x-2">
                      <BanknotesIcon className="h-5 w-5 text-indigo-600" />
                      <span>PROMPTPAY</span>
                    </div>
                  </th>
                  <th className="border border-gray-300 p-3 w-[130px] min-w-[120px] text-left">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-indigo-600" />
                      <span>MANAGER</span>
                    </div>
                  </th>
                  <th className="border border-gray-300 p-3 w-[160px] min-w-[130px] text-left">
                    <div className="flex items-center space-x-2">
                      <CreditCardIcon className="h-5 w-5 text-indigo-600" />
                      <span>BANKING</span>
                    </div>
                  </th>
                  <th className="border border-gray-300 p-3 w-[100px] text-left">
                    <div className="flex items-center space-x-2">
                      <CreditCardIcon className="h-5 w-5 text-indigo-600" />
                      <span>MINIMUM</span>
                    </div>
                  </th>
                  <th className="border border-gray-300 p-3 w-[90px] text-center">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {bankData.map((bank) => (
                  <tr
                    key={bank.ID}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <td className="border border-gray-300 p-3 overflow-hidden whitespace-nowrap text-ellipsis" title={bank.PromptPay}>
                      {bank.PromptPay}
                    </td>
                    <td className="border border-gray-300 p-3 overflow-hidden whitespace-nowrap text-ellipsis" title={bank.Manager}>
                      {bank.Manager}
                    </td>
                    <td className="border border-gray-300 p-3 overflow-hidden whitespace-nowrap text-ellipsis" title={bank.Banking}>
                      {bank.Banking}
                    </td>
                    <td className="border border-gray-300 p-3 overflow-hidden whitespace-nowrap text-ellipsis" title={bank.Minimum + " บาท"}>
                      {bank.Minimum} บาท
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <Button
                        type="primary"
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 border-blue-600"
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
        )}
      </div>

      {/* กราฟสรุปยอด */}
      <div className="flex gap-6 mb-6">
        <div className="bg-white rounded-3xl p-6 md:p-10 flex-1">
          <LineChart />
        </div>
      </div>

      {/* ตารางประวัติการชำระเงิน */}
      <div className="bg-white rounded-3xl p-6 md:p-10">
        {tableLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <PaymentHistoryTable data={paymentData} />
        )}
      </div><br /><br />

      <div className="bg-white rounded-3xl p-6 md:p-10">
        {tableLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <PaymentCoinsTable />
        )}
      </div>
      {/* Modal แก้ไขธนาคาร */}
      <Modal
        title={
          <div className="flex items-center space-x-3">
            <BanknotesIcon className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-semibold text-gray-800">แก้ไขข้อมูลธนาคาร</span>
          </div>
        }
        open={!!editBank}
        onCancel={() => setEditBank(null)}
        onOk={handleBankUpdate}
        confirmLoading={loading}
        okText="บันทึก"
        cancelText="ยกเลิก"
        centered
        bodyStyle={{ padding: "1.5rem 2rem" }}
      >
        {editBank && (
          <div className="space-y-6">
            <label className="block">
              <span className="text-gray-700 font-medium flex items-center mb-1">
                <BanknotesIcon className="h-5 w-5 mr-1 text-indigo-600" />
                PromptPay
              </span>
              <Input
                value={editBank.PromptPay}
                onChange={(e) => handleBankChange("PromptPay", e.target.value)}
                className="rounded-md border-indigo-300 focus:ring-indigo-500"
                placeholder="เลข PromptPay"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium flex items-center mb-1">
                <UserIcon className="h-5 w-5 mr-1 text-indigo-600" />
                Manager
              </span>
              <Input
                value={editBank.Manager}
                onChange={(e) => handleBankChange("Manager", e.target.value)}
                className="rounded-md border-indigo-300 focus:ring-indigo-500"
                placeholder="ชื่อผู้จัดการ"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium flex items-center mb-1">
                <CreditCardIcon className="h-5 w-5 mr-1 text-indigo-600" />
                Banking
              </span>
              <Input
                value={editBank.Banking}
                onChange={(e) => handleBankChange("Banking", e.target.value)}
                className="rounded-md border-indigo-300 focus:ring-indigo-500"
                placeholder="ชื่อธนาคาร / สาขา"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium flex items-center mb-1">
                <CreditCardIcon className="h-5 w-5 mr-1 text-indigo-600" />
                Minimum (บาท)
              </span>
              <Input
                type="number"
                min={0}
                value={editBank.Minimum}
                onChange={e => handleBankChange("Minimum", e.target.value)}
                className="rounded-md border-indigo-300 focus:ring-indigo-500"
                placeholder="จำนวนเงินขั้นต่ำ"
              />
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payment;
