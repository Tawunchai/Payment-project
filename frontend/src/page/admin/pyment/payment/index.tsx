import React, { useRef } from "react";
import {
    GridComponent,
    ColumnsDirective,
    ColumnDirective,
    Page,
    Inject,
    Sort,
    Filter,
} from "@syncfusion/ej2-react-grids";
import { PaymentsInterface } from "../../../../interface/IPayment";
import { Header } from "../../../../component/admin";
import { Image } from "antd";
import { apiUrlPicture } from "../../../../services";

// Badge สีสำหรับ Method
const renderMethodBadge = (method: string) => {
    if (method === "QR Payment") {
        return (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-400 to-orange-300 text-white font-semibold text-xs shadow">
                {method}
            </span>
        );
    } else if (method === "Coin Payment") {
        return (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-100 text-yellow-700 font-semibold text-xs shadow">
                {method}
            </span>
        );
    }
    return (
        <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 font-semibold text-xs shadow">
            {method}
        </span>
    );
};

// รวมรูป+ชื่อ+อีเมล ในคอลัมน์เดียว
const renderUserCell = (props: PaymentsInterface) => {
    const name = `${props.User?.FirstName || ""} ${props.User?.LastName || ""}`;
    const email = props.User?.Email || "-";
    // ปรับฟิลด์ Avatar ให้ตรงกับของจริง
    const avatar =
        props.User?.Profile && props.User.Profile !== ""
            ? props.User.Profile
            : "https://randomuser.me/api/portraits/men/32.jpg";

    return (
        <div className="flex items-center gap-3">
            <img
                src={`${apiUrlPicture}${avatar}`}
                alt={name}
                className="w-12 h-12 rounded-full object-cover shadow"
                style={{ background: "#eee" }}
            />
            <div>
                <div className="font-semibold text-gray-900 leading-tight">{name}</div>
                <div className="text-gray-500 text-sm">{email}</div>
            </div>
        </div>
    );
};

// Columns
const createColumns = () => [
    { field: "ID", headerText: "ID", width: "70", textAlign: "Center", isPrimaryKey: true },
    {
        headerText: "ชื่อผู้ชำระเงิน",
        width: "260",
        template: renderUserCell,
    },
    {
        field: "Date",
        headerText: "วันที่",
        width: "110",
        textAlign: "Center",
        template: (props: PaymentsInterface) => new Date(props.Date).toLocaleDateString(),
    },
     {
        field: "Amount",
        headerText: "จำนวนเงิน (บาท)",
        width: "140",
        textAlign: "Right",
        template: (props: PaymentsInterface) => (
            <span className="font-bold text-green-400 text-sm">
                {props.Amount?.toLocaleString()}
            </span>
        ),
    },
    {
        field: "Method.Medthod",
        headerText: "วิธีการชำระ",
        width: "140",
        template: (props: PaymentsInterface) => renderMethodBadge(props.Method?.Medthod || ""),
        textAlign: "Center",
    },
    {
    field: "ReferenceNumber",
    headerText: "เลขอ้างอิง",
    width: "130",
    template: (props: PaymentsInterface) => (
        <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded text-gray-700">
            {props.ReferenceNumber}
        </span>
    ),
},
    {
        headerText: "หลักฐาน",
        width: 100,
        template: (props: PaymentsInterface) =>
            props.Picture ? (
                <Image
                    src={`${apiUrlPicture}${props.Picture}`}
                    alt="หลักฐานการชำระเงิน"
                    width={44}
                    height={44}
                    preview={{ maskClassName: "rounded-lg" }}
                />
            ) : (
                <span className="text-gray-400 text-sm">ไม่มี</span>
            ),
    },
];

interface PaymentHistoryTableProps {
    data: PaymentsInterface[];
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ data }) => {
    const gridRef = useRef<any>(null);
    const columns = createColumns();

    return (
        <div>
            <Header category="Page" title="Payment History" />
            <GridComponent
                id="grid-payments"
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

export default PaymentHistoryTable;
