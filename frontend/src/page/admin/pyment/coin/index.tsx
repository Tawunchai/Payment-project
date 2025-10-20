import React, { useMemo, useState, useEffect } from "react";
import { Table, Avatar, Space, Tag, Input, Image } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import type { PaymentCoinInterface } from "../../../../interface/IPaymentCoin";
import { ListPaymentCoins, apiUrlPicture } from "../../../../services";

type RowType = {
  key: number;
  ID: number;
  CustomerName: string;
  CustomerEmail: string;
  CustomerImage: string;
  DateISO: string;
  Amount: number;
  ReferenceNumber: string;
  Picture?: string;
  Raw: PaymentCoinInterface;
};

const toAvatarUrl = (raw?: string) => {
  if (!raw || raw === "") return "https://via.placeholder.com/96x96.png?text=EV";
  return /^https?:\/\//i.test(raw) ? raw : `${apiUrlPicture}${raw}`;
};

const PaymentCoinsTable: React.FC = () => {
  const [rows, setRows] = useState<RowType[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    (async () => {
      const res = await ListPaymentCoins();
      const mapped: RowType[] = (res || []).map((p) => {
        const name = `${p.User?.FirstName ?? ""} ${p.User?.LastName ?? ""}`.trim();
        return {
          key: p.ID!,
          ID: p.ID!,
          CustomerName: name || "-",
          CustomerEmail: p.User?.Email || "-",
          CustomerImage: toAvatarUrl(p.User?.Profile),
          DateISO: p.Date ? new Date(p.Date).toISOString() : "",
          Amount: typeof p.Amount === "number" ? p.Amount : Number(p.Amount ?? 0),
          ReferenceNumber: p.ReferenceNumber || "-",
          Picture: p.Picture,
          Raw: p,
        };
      });
      setRows(mapped);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.CustomerName.toLowerCase().includes(q) ||
        r.CustomerEmail.toLowerCase().includes(q) ||
        r.ReferenceNumber.toLowerCase().includes(q)
    );
  }, [rows, searchText]);

  const columns: ColumnsType<RowType> = [
    {
      title: "User",
      key: "user",
      sorter: (a, b) => a.CustomerName.localeCompare(b.CustomerName),
      render: (_, record) => (
        <Space size="middle">
          <Avatar src={record.CustomerImage} />
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">{record.CustomerName}</div>
            <div className="text-gray-500 text-xs truncate">{record.CustomerEmail}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Date",
      dataIndex: "DateISO",
      key: "date",
      width: 140,
      sorter: (a, b) => (a.DateISO || "").localeCompare(b.DateISO || ""),
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    {
      title: "Coins",
      dataIndex: "Amount",
      key: "amount",
      width: 120,
      sorter: (a, b) => (a.Amount || 0) - (b.Amount || 0),
      render: (v: number) => (
        <Tag className="px-2 py-1 rounded-md text-blue-700 bg-blue-50 border border-blue-200">
          {v.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: "Reference",
      dataIndex: "ReferenceNumber",
      key: "ref",
      width: 160,
      render: (v: string) => (
        <span className="font-mono font-semibold bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-100">
          {v}
        </span>
      ),
    },
    {
      title: "Proof",
      key: "proof",
      width: 110,
      align: "center",
      render: (_, record) =>
        record.Picture ? (
          <Image
            src={`${apiUrlPicture}${record.Picture}`}
            alt="หลักฐาน"
            width={44}
            height={44}
            className="rounded-lg object-cover"
            preview={{ maskClassName: "rounded-lg" }}
          />
        ) : (
          <span className="text-gray-400 text-sm">ไม่มี</span>
        ),
    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-blue-100 bg-white">
      {/* Header — EV Blue */}
      <div className="px-4 sm:px-6 py-3 border-b border-blue-100 bg-blue-50/40 flex items-center justify-between">
        <h2 className="text-[15px] sm:text-base font-semibold text-blue-900">Payment Coin History</h2>
        <Input
          allowClear
          size="middle"
          prefix={<SearchOutlined />}
          placeholder="ค้นหา: ชื่อ/อีเมล/เลขอ้างอิง"
          className="w-[220px]"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="px-2 sm:px-4 py-3">
        <Table<RowType>
          columns={columns}
          dataSource={filtered}
          rowKey="key"
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            position: ["bottomCenter"],
          }}
          scroll={{ x: 900 }}
          className="ev-ant-table"
          size="middle"
        />
      </div>

      {/* EV Blue — Minimal override for Ant Table */}
      <style>{`
        .ev-ant-table .ant-table-thead > tr > th {
          background: #fff !important;
          color: #0f172a !important;
          border-bottom: 1px solid rgba(2,6,23,0.06) !important;
          font-weight: 700; font-size: 13px; letter-spacing: .2px;
        }
        .ev-ant-table .ant-table-tbody > tr > td {
          border-color: rgba(2,6,23,0.06) !important;
          padding-top: 12px !important; padding-bottom: 12px !important;
        }
        .ev-ant-table .ant-table-tbody > tr:hover > td { background: #f8fafc !important; }
        .ev-ant-table .ant-table-tbody > tr:nth-child(even) > td { background: #fcfcff; }
        .ev-ant-table .ant-table-pagination { justify-content: center !important; }
        .ev-ant-table .ant-pagination .ant-pagination-item-active { border-color: rgba(2,6,23,0.2) !important; }
        .ev-ant-table .ant-pagination .ant-pagination-item-active a { color: #0f172a !important; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default PaymentCoinsTable;
