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
import { ListPaymentCoins } from "../../../../services";
import { PaymentCoinInterface } from "../../../../interface/IPaymentCoin";
import { apiUrlPicture } from "../../../../services";
import { Header } from "../../../../component/admin";

// ----- Avatar + Name + Email -----
const renderUserCell = (props: PaymentCoinInterface) => {
  const name = `${props.User?.FirstName || ""} ${props.User?.LastName || ""}`.trim();
  const email = props.User?.Email || "-";
  const avatar =
    props.User?.Profile && props.User.Profile !== ""
      ? `${apiUrlPicture}${props.User.Profile}`
      : "https://randomuser.me/api/portraits/men/32.jpg";

  return (
    <div className="flex items-center gap-3">
      <img
        src={avatar}
        alt={name}
        className="w-12 h-12 rounded-full object-cover shadow"
        style={{ background: "#eee" }}
      />
      <div>
        <div className="font-bold text-black leading-tight">{name}</div>
        <div className="text-gray-500 text-sm">{email}</div>
      </div>
    </div>
  );
};

const createColumns = () => [
  { field: "ID", headerText: "ID", width: "70", textAlign: "Center", isPrimaryKey: true },
  {
    headerText: "ชื่อผู้ใช้",
    width: "240",
    template: renderUserCell,
  },
  {
    field: "Date",
    headerText: "วันที่",
    width: "120",
    textAlign: "Center",
    template: (props: PaymentCoinInterface) => new Date(props.Date).toLocaleDateString(),
  },
  {
  field: "Amount",
  headerText: "จำนวนเหรียญ",
  width: "130",
  textAlign: "Right",
  template: (props: PaymentCoinInterface) => (
    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-100 text-yellow-700 font-semibold text-xs shadow">
      {props.Amount?.toLocaleString()}
    </span>
  ),
},
  {
    field: "ReferenceNumber",
    headerText: "เลขอ้างอิง",
    width: "150",
    template: (props: PaymentCoinInterface) => (
      <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded text-gray-700">
        {props.ReferenceNumber}
      </span>
    ),
  },
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
