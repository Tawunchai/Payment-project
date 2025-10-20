import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  Avatar,
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
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Trash2 } from "react-feather";

import type { GendersInterface } from "../../../interface/IGender";
import type { UserroleInterface } from "../../../interface/IUserrole";
import {
  ListUsersByRoleUser,
  DeleteUser,
  UpdateUser,
  ListGenders,
  ListUserRoles,
  apiUrlPicture,
} from "../../../services";

import EditUserModal from "./edit/index";

// ------- Types -------
type RowType = {
  key: number;
  UserID: number;
  Username: string;
  FirstName: string;
  LastName: string;
  CustomerName: string;
  CustomerEmail: string;
  CustomerImage: string;
  Role: string;
  Status: string;
  StatusBg: string;
  PhoneNumber: string;
  Coin: number;
  Raw: any;
};

// ===== Inline EV Blue Minimal Modal (ตามตัวอย่าง) =====
const EvModal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode; }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"> {/* ⬅️ items-center */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full md:max-w-[280px] mx-auto px-3 md:px-0">
        <div className="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

const Customers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<RowType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const [editUser, setEditUser] = useState<any>(null);
  const [genders, setGenders] = useState<GendersInterface[]>([]);
  const [userRoles, setUserRoles] = useState<UserroleInterface[]>([]);

  // สำหรับ Modal ลบแบบตัวอย่าง
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const selectedUserRef = useRef<RowType | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // ------- Fetch -------
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await ListUsersByRoleUser();
      if (users) {
        const formatted: RowType[] = users.map((u: any) => ({
          key: u.ID,
          UserID: u.ID,
          Username: u.Username ?? "-",
          FirstName: u.FirstName ?? "",
          LastName: u.LastName ?? "",
          CustomerName: `${u.FirstName ?? ""} ${u.LastName ?? ""}`.trim(),
          CustomerEmail: u.Email ?? "-",
          CustomerImage:
            u?.Profile && u.Profile !== ""
              ? `${apiUrlPicture}${u.Profile}`
              : "https://via.placeholder.com/80x80.png?text=EV",
          Role: u.UserRole?.RoleName ?? "-",
          Status: u.Gender?.Gender ?? "-",
          StatusBg: u.Gender?.Gender === "Male" ? "#8BE78B" : "#FEC90F",
          PhoneNumber: u.PhoneNumber ?? "-",
          Coin: u.Coin ?? 0,
          Raw: u,
        }));
        setTableData(formatted);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    const [gs, rs] = await Promise.all([ListGenders(), ListUserRoles()]);
    if (gs) setGenders(gs);
    if (rs) setUserRoles(rs);
  };

  useEffect(() => {
    fetchUsers();
    fetchDropdowns();
  }, []);

  // ------- Search (client-side) -------
  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return tableData;
    return tableData.filter(
      (r) =>
        r.CustomerName.toLowerCase().includes(q) ||
        r.Username.toLowerCase().includes(q) ||
        r.CustomerEmail.toLowerCase().includes(q) ||
        r.Role.toLowerCase().includes(q) ||
        r.PhoneNumber.toLowerCase().includes(q)
    );
  }, [tableData, searchText]);

  // ------- Confirm Delete Modal handlers (ตามตัวอย่าง) -------
  const openDeleteModal = (record: RowType) => {
    selectedUserRef.current = record;
    setOpenConfirmModal(true);
  };

  const cancelDelete = () => {
    setOpenConfirmModal(false);
    selectedUserRef.current = null;
    setConfirmLoading(false);
  };

  const confirmDelete = async () => {
    if (!selectedUserRef.current) return;
    setConfirmLoading(true);
    const ok = await DeleteUser(selectedUserRef.current.UserID);
    if (ok) {
      message.success("ลบข้อมูลสำเร็จ");
      await fetchUsers();
    } else {
      message.error("เกิดข้อผิดพลาดในการลบ");
    }
    cancelDelete();
  };

  // ------- Columns -------
  const columns: ColumnsType<RowType> = [
    {
      title: "User",
      dataIndex: "CustomerName",
      key: "user",
      sorter: (a, b) => a.CustomerName.localeCompare(b.CustomerName),
      render: (_, record) => (
        <Space size="middle">
          <Avatar src={record.CustomerImage} />
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.CustomerName || "-"}
            </div>
            <div className="text-gray-500 text-xs truncate">{record.Username}</div>
            <div className="text-gray-500 text-xs truncate">{record.CustomerEmail}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "Role",
      key: "role",
      width: 120,
      filters: [
        ...Array.from(new Set(tableData.map((t) => t.Role))).map((r) => ({
          text: r,
          value: r,
        })),
      ],
      onFilter: (val, rec) => rec.Role === val,
      render: (v) => (
        <Tag color="blue" className="px-2 py-1 rounded-md">
          {v}
        </Tag>
      ),
    },
    {
      title: "Gender",
      dataIndex: "Status",
      key: "gender",
      width: 120,
      filters: [
        ...Array.from(new Set(tableData.map((t) => t.Status))).map((s) => ({
          text: s,
          value: s,
        })),
      ],
      onFilter: (val, rec) => rec.Status === val,
      render: (v) => (
        <Tag color={v === "Male" ? "green" : "orange"} className="px-2 py-1 rounded-md">
          {v}
        </Tag>
      ),
    },
    {
      title: "Phone",
      dataIndex: "PhoneNumber",
      key: "phone",
      width: 140,
      responsive: ["md"],
    },
    {
      title: "Coin",
      dataIndex: "Coin",
      key: "coin",
      width: 90,
      sorter: (a, b) => a.Coin - b.Coin,
      render: (v) => <span className="font-semibold text-blue-700">{v}</span>,
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            className="border-blue-200 text-blue-700"
            onClick={() => setEditUser(record.Raw)}
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

  // ------- Selection -------
  const rowSelection: TableProps<RowType>["rowSelection"] = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // ------- Bulk delete (เดิม ใช้ Modal.confirm ของ AntD ต่อไปได้) -------
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
          selectedRowKeys.map((id) => DeleteUser(Number(id)))
        );
        const failed = results.some((r) => !r);
        if (!failed) {
          message.success("ลบข้อมูลสำเร็จ");
          setSelectedRowKeys([]);
          fetchUsers();
        } else {
          message.error("ลบบางรายการไม่สำเร็จ");
        }
      },
    });
  };

  // ------- Save from Edit Modal -------
  const handleUpdate = async (updated: any) => {
    const id = updated.UserID ?? updated.ID;
    if (!id) return message.error("ไม่พบรหัสผู้ใช้");

    const { Raw, CustomerName, ...payload } = updated;
    const ok = await UpdateUser(id, payload);
    if (ok) {
      message.success("อัปเดตข้อมูลสำเร็จ");
      setEditUser(null);
      fetchUsers();
    } else {
      message.error("อัปเดตข้อมูลไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#eaf2ff_0%,#f6f9ff_60%,#ffffff_100%)] mt-14 sm:mt-0">
      {/* Page Header — EV Blue */}
      <div
        className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-semibold tracking-wide">Customers</h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-6">
        {/* Toolbar (Search + Bulk Delete บรรทัดเดียวกัน) */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <Input
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            placeholder="ค้นหา: ชื่อผู้ใช้ / อีเมล / เบอร์ / บทบาท"
            className="max-w-xl"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={handleBulkDelete}
            className="bg-white text-red-600 hover:bg-white/90 self-start sm:self-auto"
          >
            ลบที่เลือก ({selectedRowKeys.length})
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden ring-1 ring-blue-100 bg-white">
          <Table<RowType>
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            scroll={{ x: 900 }}
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

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          open={!!editUser}
          onClose={() => setEditUser(null)}
          user={editUser}
          onSave={handleUpdate}
          genders={genders}
          userRoles={userRoles}
        />
      )}

      <EvModal open={openConfirmModal} onClose={cancelDelete}>
        <div className="w-[min(92vw,280px)] text-center px-4 py-5"> {/* ⬅️ text-center + กว้างขึ้นนิด */}
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-blue-100 bg-blue-50">
            <Trash2 size={22} className="text-blue-600" />
          </div>

          <h3 className="text-base font-bold text-slate-900">ยืนยันการลบผู้ใช้</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            คุณต้องการลบ
            {selectedUserRef.current?.CustomerName && (
              <>
                <br />
                <span className="font-semibold text-blue-700">
                  “{selectedUserRef.current.CustomerName}”
                </span>
              </>
            )}{" "}
            ใช่หรือไม่?
            <br />
            <span className="text-xs text-slate-500">การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>
          </p>

          {/* ⬇️ จัดปุ่มให้อยู่กลาง */}
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

      {/* EV Blue — Minimal override for Ant Table */}
      <style>{`
  .ev-ant-table .ant-table-thead > tr > th {
    background: #fff !important;
    color: #0f172a !important;
    border-bottom: 1px solid rgba(2,6,23,0.06) !important;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: .2px;
  }
  .ev-ant-table .ant-table-tbody > tr > td {
    border-color: rgba(2,6,23,0.06) !important;
    padding-top: 12px !important;
    padding-bottom: 12px !important;
  }
  .ev-ant-table .ant-table-tbody > tr:hover > td {
    background: #f8fafc !important;
  }
  .ev-ant-table .ant-table-tbody > tr:nth-child(even) > td {
    background: #fcfcff;
  }
  .ev-ant-table .ant-table-pagination { justify-content: center !important; }
  .ev-ant-table .ant-pagination .ant-pagination-item-active {
    border-color: rgba(2,6,23,0.2) !important;
  }
  .ev-ant-table .ant-pagination .ant-pagination-item-active a {
    color: #0f172a !important; font-weight: 600;
  }
`}</style>
    </div>
  );
};

export default Customers;
