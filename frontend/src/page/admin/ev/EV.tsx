import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  Image as AntImage,
  Tag,
  Space,
  Button,
  Input,
  Modal,
  message,
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Trash2 } from "react-feather";

import {
  ListEVCharging,
  DeleteEVcharging,
  ListStatus,
  ListTypeEV,
  apiUrlPicture,
} from "../../../services";
import type { StatusInterface } from "../../../interface/IStatus";
import type { TypeInterface } from "../../../interface/IType";

import EditEVModal from "./edit";
import CreateEVModal from "./create";

// ---------- Types ----------
type RowType = {
  key: number;
  ID: number;
  Name: string;
  Email: string;
  Description: string;
  Price: number;
  Type: string;
  Status: string;
  EmployeeName: string;
  Picture: string;
  EmployeeID?: number;
  StatusID?: number;
  TypeID?: number;
  Raw: any;
};

// ===== Inline EV Blue Minimal Modal (single delete confirm) =====
const EvModal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode; }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full md:max-w-[320px] mx-auto px-3 md:px-0">
        <div className="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

const EV: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<RowType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");

  const [statusList, setStatusList] = useState<StatusInterface[]>([]);
  const [typeList, setTypeList] = useState<TypeInterface[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEV, setEditingEV] = useState<any>(null);

  // single delete
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const selectedEVRef = useRef<RowType | null>(null);

  // ---------- Fetch ----------
  const fetchEVData = async () => {
    setLoading(true);
    try {
      const evs = await ListEVCharging();
      if (evs) {
        const rows: RowType[] = evs.map((ev: any) => {
          const id = Number(ev.ID);
          return {
            key: id,
            ID: id,
            Name: ev.Name ?? "-",
            Email: ev.Employee?.User?.Email ?? "-",
            Description: ev.Description ?? "-",
            Price: Number(ev.Price ?? 0),
            Type: ev.Type?.Type ?? "-",
            Status: ev.Status?.Status ?? "-",
            EmployeeName: ev.Employee
              ? `${ev.Employee?.User?.FirstName ?? ""} ${ev.Employee?.User?.LastName ?? ""}`.trim()
              : "-",
            Picture: ev.Picture ?? "",
            EmployeeID: ev.EmployeeID,
            StatusID: ev.StatusID,
            TypeID: ev.TypeID,
            Raw: ev,
          };
        });
        setTableData(rows);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLists = async () => {
    const [statuses, types] = await Promise.all([ListStatus(), ListTypeEV()]);
    if (statuses) setStatusList(statuses);
    if (types) setTypeList(types);
  };

  useEffect(() => {
    fetchEVData();
    fetchLists();
  }, []);

  // ---------- Search (client-side) ----------
  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return tableData;
    return tableData.filter((r) =>
      (r.Name ?? "").toLowerCase().includes(q) ||
      (r.Email ?? "").toLowerCase().includes(q) ||
      (r.Type ?? "").toLowerCase().includes(q) ||
      (r.Status ?? "").toLowerCase().includes(q) ||
      (r.EmployeeName ?? "").toLowerCase().includes(q)
    );
  }, [tableData, searchText]);

  // ---------- Single delete handlers ----------
  const openDeleteModal = (record: RowType) => {
    selectedEVRef.current = record;
    setOpenConfirmModal(true);
  };
  const cancelDelete = () => {
    setOpenConfirmModal(false);
    selectedEVRef.current = null;
    setConfirmLoading(false);
  };
  const confirmDelete = async () => {
    if (!selectedEVRef.current) return;
    setConfirmLoading(true);
    const ok = await DeleteEVcharging(selectedEVRef.current.ID);
    if (ok) {
      message.success("ลบข้อมูลสำเร็จ");
      await fetchEVData();
    } else {
      message.error("เกิดข้อผิดพลาดในการลบ");
    }
    cancelDelete();
  };

  // ---------- Bulk delete ----------
  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) return;
    Modal.confirm({
      title: "ยืนยันการลบ",
      icon: <ExclamationCircleOutlined />,
      content: `ลบ ${selectedRowKeys.length} รายการออกจากระบบหรือไม่?`,
      okText: "ลบ",
      cancelText: "ยกเลิก",
      okButtonProps: { danger: true },
      async onOk() {
        const results = await Promise.all(
          selectedRowKeys.map((id) => DeleteEVcharging(Number(id)))
        );
        const failed = results.some((r) => !r);
        if (!failed) {
          message.success("ลบข้อมูลสำเร็จ");
          setSelectedRowKeys([]);
          fetchEVData();
        } else {
          message.error("ลบบางรายการไม่สำเร็จ");
        }
      },
    });
  };

  // ---------- Edit / Create ----------
  const openEdit = (row: RowType) => {
    setEditingEV(row.Raw);
    setEditOpen(true);
  };
  const onSavedEdit = async () => {
    setEditOpen(false);
    setEditingEV(null);
    await fetchEVData();
  };

  const onSavedCreate = async () => {
    setCreateOpen(false);
    await fetchEVData();
  };

  // ---------- Columns ----------
  const columns: ColumnsType<RowType> = [
    {
      title: "Station",
      dataIndex: "Name",
      key: "station",
      sorter: (a, b) => a.Name.localeCompare(b.Name),
      render: (_, record) => (
        <Space size="middle">
          <AntImage
            src={
              record.Picture
                ? `${apiUrlPicture}${record.Picture}`
                : "https://via.placeholder.com/64x64.png?text=EV"
            }
            width={40}
            height={40}
            preview={false}
            className="rounded-lg object-cover"
          />
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">{record.Name || "-"}</div>
            <div className="text-gray-500 text-xs truncate">{record.Email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "Type",
      key: "type",
      width: 120,
      filters: [...Array.from(new Set(tableData.map((t) => t.Type))).map((v) => ({ text: v, value: v }))],
      onFilter: (val, rec) => rec.Type === val,
      render: (v) => <Tag color="blue" className="px-2 py-1 rounded-md">{v}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "status",
      width: 120,
      filters: [...Array.from(new Set(tableData.map((t) => t.Status))).map((v) => ({ text: v, value: v }))],
      onFilter: (val, rec) => rec.Status === val,
      render: (v) => (
        <Tag color={v?.toLowerCase().includes("active") ? "green" : "orange"} className="px-2 py-1 rounded-md">
          {v}
        </Tag>
      ),
    },
    {
      title: "Price",
      dataIndex: "Price",
      key: "price",
      width: 100,
      sorter: (a, b) => a.Price - b.Price,
      render: (v) => <span className="font-semibold text-blue-700">{Number(v).toLocaleString()}</span>,
    },
    {
      title: "Owner",
      dataIndex: "EmployeeName",
      key: "owner",
      width: 160,
      ellipsis: true,
      responsive: ["md"],
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            className="border-blue-200 text-blue-700"
            onClick={() => openEdit(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => openDeleteModal(record)}
          />
        </Space>
      ),
    },
  ];

  // ---------- Selection ----------
  const rowSelection: TableProps<RowType>["rowSelection"] = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#eaf2ff_0%,#f6f9ff_60%,#ffffff_100%)] mt-14 sm:mt-0">
      {/* Header — EV Blue */}
      <div
        className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-semibold tracking-wide">EV Charging Stations</h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <Input
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            placeholder="ค้นหา: ชื่อ / อีเมล / สถานะ / ประเภท / ผู้ดูแล"
            className="max-w-xl"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-600"
              onClick={() => setCreateOpen(true)}
            >
              Create
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={handleBulkDelete}
              className="bg-white text-red-600 hover:bg-white/90"
            >
              ลบที่เลือก ({selectedRowKeys.length})
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden ring-1 ring-blue-100 bg-white">
          <Table<RowType>
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            scroll={{ x: 960 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              position: ["bottomCenter"],
            }}
            className="ev-ant-table"
            size="middle"
          />
        </div>

        <p className="text-[12px] text-gray-500 text-center mt-6">
          โทนฟ้าสบายตา • มินิมอล • รองรับมือถือ/เดสก์ท็อป
        </p>
      </div>

      {/* Edit EV */}
      {editOpen && (
        <EditEVModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          evCharging={editingEV}
          onSaved={onSavedEdit}
          statusList={statusList}
          typeList={typeList}
        />
      )}

      {/* Create EV */}
      {createOpen && (
        <CreateEVModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSaved={onSavedCreate}
          statusList={statusList}
          typeList={typeList}
        />
      )}

      {/* Confirm Delete (Single) */}
      <EvModal open={openConfirmModal} onClose={cancelDelete}>
        <div className="w-[min(92vw,320px)] text-center px-4 py-5">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-blue-100 bg-blue-50">
            <Trash2 size={22} className="text-blue-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">ยืนยันการลบสถานีชาร์จ</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            คุณต้องการลบ
            {selectedEVRef.current?.Name && (
              <>
                <br />
                <span className="font-semibold text-blue-700">“{selectedEVRef.current.Name}”</span>
              </>
            )}{" "}
            ใช่หรือไม่?
            <br />
            <span className="text-xs text-slate-500">การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={confirmDelete}
              disabled={confirmLoading}
              className="min-w-[96px] h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-200 transition disabled:opacity-60"
            >
              {confirmLoading ? "กำลังลบ..." : "ลบ"}
            </button>
            <button
              onClick={cancelDelete}
              className="min-w-[96px] h-10 rounded-xl border border-blue-200 bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </EvModal>

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

export default EV;
