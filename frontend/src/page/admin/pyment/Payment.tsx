import { useEffect, useState, useRef } from "react";
import ColorMapping from "../charts/ColorMapping";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject,
  Sort,
  Filter,
} from "@syncfusion/ej2-react-grids";
import { Image, Modal, Input, Button, message } from "antd";
import { ListPayments, apiUrlPicture, ListBank, UpdateBank } from "../../../services";
import { PaymentsInterface } from "../../../interface/IPayment";
import { BankInterface } from "../../../interface/IBank"; // สมมติ interface Bank
import { Header } from "../../../component/admin";
import { BanknotesIcon, UserIcon, CreditCardIcon } from "@heroicons/react/24/outline";

const Payment = () => {
  const [paymentData, setPaymentData] = useState<PaymentsInterface[]>([]);
  const [bankData, setBankData] = useState<BankInterface[]>([]);
  const [editBank, setEditBank] = useState<BankInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<any>(null);

  useEffect(() => {
    fetchPayments();
    fetchBanks();
  }, []);

  const fetchPayments = async () => {
    const data = await ListPayments();
    if (data) {
      setPaymentData(data);
    }
  };

  const fetchBanks = async () => {
    const banks = await ListBank();
    if (banks) {
      setBankData(banks);
    }
  };

  // handle update bank form change
  const handleBankChange = (field: keyof BankInterface, value: string) => {
    if (editBank) {
      setEditBank({ ...editBank, [field]: value });
    }
  };

  const handleBankUpdate = async () => {
    if (!editBank) return;
    setLoading(true);
    const updated = await UpdateBank(editBank.ID, {
      promptpay: editBank.PromptPay,
      manager: editBank.Manager,
      banking: editBank.Banking,
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

  // columns สำหรับ payment grid (เดิม)
  const columns = [
    { field: "ID", headerText: "ID", width: "80", textAlign: "Center", isPrimaryKey: true },
    { field: "User.FirstName", headerText: "ชื่อผู้ใช้", width: "150" },
    { field: "User.LastName", headerText: "นามสกุล", width: "150" },
    { field: "Method.Medthod", headerText: "วิธีการชำระ", width: "120" },
    { field: "Amount", headerText: "จำนวนเงิน (บาท)", width: "150", textAlign: "Right" },
    {
      field: "Date",
      headerText: "วันที่",
      width: "120",
      textAlign: "Center",
      template: (props: PaymentsInterface) => new Date(props.Date).toLocaleDateString(),
    },
    { field: "ReferenceNumber", headerText: "เลขอ้างอิง", width: "160" },
    {
      headerText: "หลักฐาน",
      width: 120,
      template: (props: PaymentsInterface) =>
        props.Picture ? (
          <Image
            src={`${apiUrlPicture}${props.Picture}`}
            alt="หลักฐานการชำระเงิน"
            width={50}
            height={50}
            preview={{ maskClassName: "rounded-lg" }}
          />
        ) : (
          <span className="text-gray-400 text-sm">ไม่มี</span>
        ),
    },
  ];

  return (
    <div className="m-2 md:m-10 mt-24">
      <div className="bg-white rounded-3xl p-6 md:p-10 mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-300 pb-3">
          ข้อมูลธนาคารปัจจุบัน
        </h2>

        {bankData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">ไม่มีข้อมูลธนาคาร</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full table-fixed border-collapse text-gray-700">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold tracking-wide select-none">
                  <th className="border border-gray-300 p-3 w-[180px] min-w-[150px] text-left">
                    <div className="flex items-center space-x-2">
                      <BanknotesIcon className="h-5 w-5 text-indigo-600" />
                      <span>PROMPTPAY</span>
                    </div>
                  </th>
                  <th className="border border-gray-300 p-3 w-[180px] min-w-[150px] text-left">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-indigo-600" />
                      <span>MANAGER</span>
                    </div>
                  </th>
                  <th className="border border-gray-300 p-3 w-[200px] min-w-[150px] text-left">
                    <div className="flex items-center space-x-2">
                      <CreditCardIcon className="h-5 w-5 text-indigo-600" />
                      <span>BANKING</span>
                    </div>
                  </th>
                  <th className="border border-gray-300 p-3 w-[100px] text-center">
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
                    <td
                      className="border border-gray-300 p-3 overflow-hidden whitespace-nowrap text-ellipsis"
                      title={bank.PromptPay}
                    >
                      {bank.PromptPay}
                    </td>
                    <td
                      className="border border-gray-300 p-3 overflow-hidden whitespace-nowrap text-ellipsis"
                      title={bank.Manager}
                    >
                      {bank.Manager}
                    </td>
                    <td
                      className="border border-gray-300 p-3 overflow-hidden whitespace-nowrap text-ellipsis"
                      title={bank.Banking}
                    >
                      {bank.Banking}
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

      {/* กล่องแรก: ColorMapping */}
      <div className="bg-white rounded-3xl p-6 md:p-10 mb-6">
        <ColorMapping />
      </div>

      {/* กล่องที่สอง: Header + Grid */}
      <div className="bg-white rounded-3xl p-6 md:p-10">
        <Header category="Page" title="Payment History" />
        <GridComponent
          id="grid-payments"
          ref={gridRef}
          dataSource={paymentData}
          enableHover={true}
          allowPaging={true}
          pageSettings={{ pageSize: 5, pageCount: 5 }}
          allowSorting={true}
          allowFiltering={true}
          className="mt-4"
        >
          <ColumnsDirective>
            {columns.map((col, index) => (
              <ColumnDirective key={index} {...col} />
            ))}
          </ColumnsDirective>
          <Inject services={[Page, Sort, Filter]} />
        </GridComponent>
      </div>

      {/* Modal แก้ไข Bank */}
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
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payment;
