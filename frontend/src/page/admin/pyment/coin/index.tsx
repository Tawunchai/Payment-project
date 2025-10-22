import React, { useMemo, useState, useEffect } from "react";
import {
  Table,
  Avatar,
  Space,
  Tag,
  Input,
  Image,
  Spin,
  Button,
  Tooltip,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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

const sanitize = (s: string) =>
  s.replace(/[\\/:*?"<>|\s]+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${dd} ${hh}:${mm}`;
};

const PaymentCoinsTable: React.FC = () => {
  const [rows, setRows] = useState<RowType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [tableLoading, setTableLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);

  const fetchCoins = async () => {
    setTableLoading(true);
    try {
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
    } catch (e) {
      console.error(e);
      message.error("โหลดข้อมูล Coin ไม่สำเร็จ");
    } finally {
      setTimeout(() => setTableLoading(false), 400);
    }
  };

  useEffect(() => {
    fetchCoins();
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

  // mark รูปที่มีให้ loading=true ตั้งต้น
  useEffect(() => {
    const next: Record<number, boolean> = {};
    filtered.forEach((r) => {
      if (r.Picture) next[r.ID] = true;
    });
    setImageLoading(next);
  }, [filtered]);

  // ===== Export CSV =====
  const handleExportCSV = async () => {
    try {
      setExportingCsv(true);
      const pick = selectedRowKeys.length
        ? filtered.filter((r) => selectedRowKeys.includes(r.key))
        : filtered;

      if (!pick.length) {
        message.info("ไม่มีข้อมูลสำหรับส่งออก");
        return;
      }

      const headers = ["ID", "Name", "Email", "Date", "Coins", "Reference", "HasProof"];
      const rowsCsv = pick.map((r) => [
        r.ID,
        r.CustomerName,
        r.CustomerEmail,
        formatDate(r.DateISO),
        r.Amount,
        r.ReferenceNumber,
        r.Picture ? "Yes" : "No",
      ]);

      const csvContent = [
        headers.join(","),
        ...rowsCsv.map((cols) =>
          cols
            .map((v) => {
              const val = v === null || v === undefined ? "" : String(v).replace(/"/g, '""');
              return /[",\n]/.test(val) ? `"${val}"` : val;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const filename = `payment_coin_history_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.csv`;
      saveAs(blob, filename);
      message.success("ส่งออก CSV สำเร็จ");
    } catch (e) {
      console.error(e);
      message.error("ส่งออก CSV ล้มเหลว");
    } finally {
      setExportingCsv(false);
    }
  };

  // ===== Download Proof Images as ZIP =====
  const handleDownloadImagesZip = async () => {
    try {
      setExportingZip(true);
      const pick = selectedRowKeys.length
        ? filtered.filter((r) => selectedRowKeys.includes(r.key))
        : filtered;

      const withPics = pick.filter((r) => !!r.Picture);
      if (!withPics.length) {
        message.info("ไม่มีรูปหลักฐานสำหรับดาวน์โหลด");
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder(`coin_proofs_${new Date().toISOString().slice(0, 10)}`)!;

      for (const r of withPics) {
        const url = `${apiUrlPicture}${r.Picture}`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
          const blob = await res.blob();
          const base =
            sanitize(`${r.ID}_${r.CustomerName || "user"}_${r.ReferenceNumber || ""}`) ||
            `coin_${r.ID}`;
          const ext = blob.type.split("/")[1] || "jpg";
          folder.file(`${base}.${ext}`, blob);
        } catch (err) {
          console.warn("โหลดรูปไม่ได้:", url, err);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const filename = `coin_proofs_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.zip`;
      saveAs(zipBlob, filename);
      message.success("ดาวน์โหลดรูปหลักฐาน (ZIP) เรียบร้อย");
    } catch (e) {
      console.error(e);
      message.error("ดาวน์โหลดรูป (ZIP) ล้มเหลว");
    } finally {
      setExportingZip(false);
    }
  };

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
          <div className="flex justify-center">
            <div className="relative w-[46px] h-[46px]">
              {imageLoading[record.ID] && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                  <Spin size="small" />
                </div>
              )}
              <Image
                src={`${apiUrlPicture}${record.Picture}`}
                alt="หลักฐาน"
                width={46}
                height={46}
                className="rounded-lg object-cover"
                preview={{ maskClassName: "rounded-lg" }}
                onLoad={() =>
                  setImageLoading((prev) => ({ ...prev, [record.ID]: false }))
                }
                onError={() =>
                  setImageLoading((prev) => ({ ...prev, [record.ID]: false }))
                }
                placeholder={
                  <div className="w-[46px] h-[46px] rounded-lg bg-gray-100 flex items-center justify-center">
                    <Spin size="small" />
                  </div>
                }
              />
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">ไม่มี</span>
        ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    preserveSelectedRowKeys: true,
  };

  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-blue-100 bg-white">
      {/* Header — EV Blue */}
      <div className="px-4 sm:px-6 py-3 border-b border-blue-100 bg-blue-50/40 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[15px] sm:text-base font-semibold text-blue-900">
          Payment Coin History
        </h2>
        <div className="flex items-center gap-2">
          <Input
            allowClear
            size="middle"
            prefix={<SearchOutlined />}
            placeholder="ค้นหา: ชื่อ/อีเมล/เลขอ้างอิง"
            className="w-[220px]"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Tooltip title="ส่งออกเป็น CSV">
            <Button
              icon={<FileExcelOutlined />}
              loading={exportingCsv}
              onClick={handleExportCSV}
              className="rounded-md text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Export CSV
            </Button>
          </Tooltip>

          <Tooltip title="ดาวน์โหลดรูปหลักฐาน (ZIP)">
            <Button
              icon={<DownloadOutlined />}
              loading={exportingZip}
              onClick={handleDownloadImagesZip}
              className="rounded-md text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Proofs ZIP
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Table */}
      <div className="px-2 sm:px-4 py-3">
        {tableLoading ? (
          <div className="flex justify-center items-center h-60">
            <Spin size="large" tip="กำลังโหลดข้อมูล..." />
          </div>
        ) : (
          <Table<RowType>
            columns={columns}
            dataSource={filtered}
            rowKey="key"
            rowSelection={rowSelection}
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              position: ["bottomCenter"],
            }}
            scroll={{ x: 900 }}
            className="ev-ant-table"
            size="middle"
          />
        )}
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
