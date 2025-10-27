import React, { useMemo, useState, useEffect, useRef } from "react";
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
  DeleteOutlined,
} from "@ant-design/icons";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { PaymentCoinInterface } from "../../../../interface/IPaymentCoin";
import {
  ListPaymentCoins,
  apiUrlPicture,
  DeletePaymentCoins,
} from "../../../../services";
import { Trash2 } from "react-feather";

const EvModal: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[420px] mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-blue-100">
          {children}
        </div>
      </div>
    </div>
  );
};

type RowType = {
  key: number;
  Index: number;
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
  if (!raw || raw === "")
    return "https://via.placeholder.com/96x96.png?text=EV";
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10); // ✅ pageSize state
  const selectedIDsRef = useRef<number[]>([]);

  // ✅ Responsive scrollX
  const [scrollX, setScrollX] = useState(900);

  useEffect(() => {
    const updateScrollX = () => {
      if (window.innerWidth <= 1300 && window.innerWidth >= 768) {
        // iPad
        setScrollX(750);
      } else {
        setScrollX(900);
      }
    };

    updateScrollX();
    window.addEventListener("resize", updateScrollX);
    return () => window.removeEventListener("resize", updateScrollX);
  }, []);

  const fetchCoins = async () => {
    setTableLoading(true);
    try {
      const res = await ListPaymentCoins();
      const mapped: RowType[] = (res || []).map((p, idx) => {
        const name = `${p.User?.FirstName ?? ""} ${p.User?.LastName ?? ""
          }`.trim();
        return {
          key: p.ID!,
          Index: idx + 1,
          ID: p.ID!,
          CustomerName: name || "-",
          CustomerEmail: p.User?.Email || "-",
          CustomerImage: toAvatarUrl(p.User?.Profile),
          DateISO: p.Date ? new Date(p.Date).toISOString() : "",
          Amount:
            typeof p.Amount === "number" ? p.Amount : Number(p.Amount ?? 0),
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

  // ===== ลบข้อมูล =====
  const openDeleteModal = () => {
    if (selectedRowKeys.length === 0) return;
    selectedIDsRef.current = selectedRowKeys.map((k) => Number(k));
    setOpenConfirmModal(true);
  };

  const cancelDelete = () => {
    setOpenConfirmModal(false);
    setConfirmLoading(false);
  };

  const confirmDelete = async () => {
    setConfirmLoading(true);
    const ids = selectedIDsRef.current;
    const res = await DeletePaymentCoins(ids);
    if (res) {
      setRows((prev) => prev.filter((row) => !ids.includes(row.ID)));
      message.success("ลบข้อมูลการชำระเงิน Coin สำเร็จ");
      setSelectedRowKeys([]);
    } else {
      message.error("เกิดข้อผิดพลาดในการลบ");
    }
    cancelDelete();
  };

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

      const headers = [
        "ลำดับ",
        "ID",
        "Name",
        "Email",
        "Date",
        "Coins",
        "Reference",
        "HasProof",
      ];
      const rowsCsv = pick.map((r) => [
        r.Index,
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
              const val =
                v === null || v === undefined ? "" : String(v).replace(/"/g, '""');
              return /[",\n]/.test(val) ? `"${val}"` : val;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
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

  // ===== Download Proof ZIP =====
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
      const folder = zip.folder(
        `coin_proofs_${new Date().toISOString().slice(0, 10)}`
      )!;

      for (const r of withPics) {
        const url = `${apiUrlPicture}${r.Picture}`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
          const blob = await res.blob();
          const base = sanitize(`${r.ID}_${r.CustomerName}_${r.ReferenceNumber}`);
          const ext = blob.type.split("/")[1] || "jpg";
          folder.file(`${base}.${ext}`, blob);
        } catch (err) {
          console.warn("โหลดรูปไม่ได้:", url, err);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `coin_proofs_${Date.now()}.zip`);
      message.success("ดาวน์โหลด ZIP สำเร็จ");
    } catch (e) {
      console.error(e);
      message.error("ดาวน์โหลด ZIP ล้มเหลว");
    } finally {
      setExportingZip(false);
    }
  };

  // ===== Columns =====
  const columns: ColumnsType<RowType> = [
    {
      title: "#",
      dataIndex: "Index",
      key: "index",
      width: 60,
      align: "center",
      sorter: (a, b) => a.Index - b.Index,
    },
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space size="middle">
          <Avatar src={record.CustomerImage} />
          <div>
            <div className="font-semibold">{record.CustomerName}</div>
            <div className="text-xs text-gray-500">{record.CustomerEmail}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Date",
      dataIndex: "DateISO",
      key: "date",
      width: 140,
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    {
      title: "Coins",
      dataIndex: "Amount",
      key: "amount",
      width: 100,
      render: (v) => (
        <Tag className="px-2 py-1 rounded-md text-blue-700 bg-blue-50 border border-blue-200">
          {v.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: "Reference",
      dataIndex: "ReferenceNumber",
      key: "ref",
      width: 150,
      render: (v) => (
        <span className="font-mono bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-100">
          {v}
        </span>
      ),
    },
    {
      title: "Proof",
      key: "proof",
      width: 100,
      align: "center",
      render: (_, record) =>
        record.Picture ? (
          <Image
            src={`${apiUrlPicture}${record.Picture}`}
            width={46}
            height={46}
            className="rounded-lg object-cover"
            preview
          />
        ) : (
          <span className="text-gray-400 text-sm">ไม่มี</span>
        ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  // ===== Render =====
  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-blue-100 bg-white relative">
      <div className="px-4 sm:px-6 py-3 border-b border-blue-100 bg-blue-50/40 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[15px] sm:text-base font-semibold text-blue-900">
          Payment Coin History
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            allowClear
            size="middle"
            prefix={<SearchOutlined />}
            placeholder="ค้นหา: ชื่อ/อีเมล/เลขอ้างอิง"
            className="w-[220px]"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={openDeleteModal}
              className="bg-white text-red-600 hover:bg-red-50"
            >
              ลบที่เลือก ({selectedRowKeys.length})
            </Button>
          )}
          <Tooltip title="Export CSV">
            <Button
              icon={<FileExcelOutlined />}
              loading={exportingCsv}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Tooltip>
          <Tooltip title="ดาวน์โหลดหลักฐาน (ZIP)">
            <Button
              icon={<DownloadOutlined />}
              loading={exportingZip}
              onClick={handleDownloadImagesZip}
            >
              Proofs ZIP
            </Button>
          </Tooltip>
        </div>
      </div>

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
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50", "100"], // ✅ เลือกจำนวนแถว
              onShowSizeChange: (_, size) => setPageSize(size),
              onChange: (_, size) => setPageSize(size),
              position: ["bottomCenter"],
            }}
            scroll={{ x: scrollX }}
            className="ev-ant-table"
            size="middle"
          />
        )}
      </div>

      {/* Modal ยืนยันการลบ */}
      <EvModal open={openConfirmModal} onClose={cancelDelete}>
        <div className="p-5 flex flex-col items-center text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-blue-100 bg-blue-50">
            <Trash2 size={22} className="text-blue-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            ยืนยันการลบข้อมูล
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            คุณต้องการลบข้อมูล Coin{" "}
            <span className="font-semibold text-blue-700">
              {selectedRowKeys.length}
            </span>{" "}
            รายการใช่หรือไม่?
            <br />
            <span className="text-xs text-slate-500">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={confirmDelete}
              disabled={confirmLoading}
              className="min-w-[96px] h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              {confirmLoading ? "กำลังลบ..." : "ลบ"}
            </button>
            <button
              onClick={cancelDelete}
              className="min-w-[96px] h-10 rounded-xl border border-blue-200 bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </EvModal>
    </div>
  );
};

export default PaymentCoinsTable;
