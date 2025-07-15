import React, { useEffect, useState, useRef } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject,
  Sort,
  Filter,
} from "@syncfusion/ej2-react-grids";
import { Image } from "antd";
import { ListPaymentCoins } from "../../../../services"; // path ของคุณ
import { PaymentCoinInterface } from "../../../../interface/IPaymentCoin";
import { apiUrlPicture } from "../../../../services";
import { Header } from "../../../../component/admin";

const createColumns = () => [
  { field: "ID", headerText: "ID", width: "70", textAlign: "Center", isPrimaryKey: true },
  { field: "User.FirstName", headerText: "ชื่อผู้ใช้", width: "140" },
  { field: "User.LastName", headerText: "นามสกุล", width: "140" },
  { field: "Amount", headerText: "จำนวนเหรียญ", width: "130", textAlign: "Right" },
  {
    field: "Date",
    headerText: "วันที่",
    width: "120",
    textAlign: "Center",
    template: (props: PaymentCoinInterface) => new Date(props.Date).toLocaleDateString(),
  },
  { field: "ReferenceNumber", headerText: "เลขอ้างอิง", width: "150" },
  {
    headerText: "หลักฐาน",
    width: 110,
    template: (props: PaymentCoinInterface) =>
      props.Picture ? (
        <Image
          src={`${apiUrlPicture}${props.Picture}`}
          alt="หลักฐาน"
          width={46}
          height={46}
          preview={{ maskClassName: "rounded-lg" }}
        />
      ) : (
        <span className="text-gray-400 text-sm">ไม่มี</span>
      ),
  },
];

const PaymentCoinTable: React.FC = () => {
  const [data, setData] = useState<PaymentCoinInterface[]>([]);
  const gridRef = useRef<any>(null);
  const columns = createColumns();

  useEffect(() => {
    const fetchData = async () => {
      const res = await ListPaymentCoins();
      if (res) setData(res);
    };
    fetchData();
  }, []);

  return (
    <div>
      <Header category="Page" title="Payment Coin History" />
      <GridComponent
        id="grid-paymentcoin"
        ref={gridRef}
        dataSource={data}
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
  );
};

export default PaymentCoinTable;
