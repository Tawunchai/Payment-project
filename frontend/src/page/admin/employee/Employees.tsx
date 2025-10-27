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
  SearchOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Trash2 } from "react-feather";

import {
  ListUsersByRoleAdmin,
  ListUsers,
  GetEmployeeByUserID,
  DeleteAdmin,
  ListUserRoles,
  createEmployeeByAdmin,
  apiUrlPicture,
} from "../../../services";

import EditAdminModal from "./edit";
import CreateAdminModal from "./create";

// ------- Types -------
type RowType = {
  key: number;
  EmployeeID: number;
  UserID: number;
  Name: string;
  Username: string;
  Email: string;
  ProfileImage: string;
  Role: string;
  Status: string;
  Phone: string;
  Salary: number;
  Raw: any;
};

// ------- Custom Confirm Modal -------
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
          <div className="md:hidden h-[env(safe-area-inset-bottom)] bg-white" />
        </div>
      </div>
    </div>
  );
};

// ------- Component -------
const Employees: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<RowType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [allUsersData, setAllUsersData] = useState<
    { Username: string; Email: string; PhoneNumber: string }[]
  >([]);

  // ✅ Responsive scrollX
  const [scrollX, setScrollX] = useState(950);

  useEffect(() => {
    const updateScrollX = () => {
      if (window.innerWidth <= 1300 && window.innerWidth >= 768) {
        // iPad
        setScrollX(830);
      } else {
        setScrollX(950);
      }
    };

    updateScrollX();
    window.addEventListener("resize", updateScrollX);
    return () => window.removeEventListener("resize", updateScrollX);
  }, []);

  // Confirm delete
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const selectedEmployeeRef = useRef<RowType | null>(null);

  // ------- Fetch All Users -------
  const fetchAllUsers = async (): Promise<void> => {
    try {
      const users = await ListUsers();
      if (Array.isArray(users)) {
        const mapped = users.map((u: any) => ({
          Username: u.Username ?? "",
          Email: u.Email ?? "",
          PhoneNumber: u.PhoneNumber ?? "",
        }));
        setAllUsersData(mapped);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // ------- Fetch Admins -------
  const fetchAdmins = async (): Promise<void> => {
    setLoading(true);
    try {
      const users: any[] = (await ListUsersByRoleAdmin()) ?? [];
      const rows: RowType[] = [];
      for (const u of users) {
        const emp: any = await GetEmployeeByUserID(u.ID!);
        const employeeId = Number(emp?.ID ?? u?.ID ?? 0);
        const userId = Number(u?.ID ?? 0);

        const profile =
          u?.Profile && String(u.Profile).trim() !== ""
            ? `${apiUrlPicture}${u.Profile}`
            : "https://via.placeholder.com/80x80.png?text=EV";

        const salaryNumber =
          typeof emp?.Salary === "number"
            ? emp.Salary
            : Number(emp?.Salary ?? 0);

        rows.push({
          key: employeeId,
          EmployeeID: employeeId,
          UserID: userId,
          Name: `${u.FirstName ?? ""} ${u.LastName ?? ""}`.trim() || "-",
          Username: u.Username ?? "-",
          Email: u.Email ?? "-",
          ProfileImage: profile,
          Role: u.UserRole?.RoleName ?? "-",
          Status: u.Gender?.Gender ?? "-",
          Phone: u.PhoneNumber ?? "-",
          Salary: Number.isFinite(salaryNumber) ? salaryNumber : 0,
          Raw: {
            ...u,
            EmployeeDetail: emp,
            UserID: userId,
            EmployeeID: employeeId,
            Salary: Number.isFinite(salaryNumber) ? salaryNumber : 0,
          },
        });
      }
      setTableData(rows);
    } finally {
      setLoading(false);
    }
  };

  // ------- Fetch Roles -------
  const fetchUserRoles = async (): Promise<void> => {
    const roles = await ListUserRoles();
    setUserRoles(roles ?? []);
  };

  useEffect(() => {
    fetchAdmins();
    fetchUserRoles();
    fetchAllUsers();
  }, []);

  // ------- Search -------
  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return tableData;
    return tableData.filter(
      (r) =>
        r.Name.toLowerCase().includes(q) ||
        r.Username.toLowerCase().includes(q) ||
        r.Email.toLowerCase().includes(q) ||
        r.Role.toLowerCase().includes(q) ||
        r.Phone.toLowerCase().includes(q)
    );
  }, [tableData, searchText]);

  // ------- Delete (Single) -------
  const openDeleteModal = (record: RowType): void => {
    selectedEmployeeRef.current = record;
    setOpenConfirmModal(true);
  };
  const cancelDelete = (): void => {
    setOpenConfirmModal(false);
    selectedEmployeeRef.current = null;
    setConfirmLoading(false);
  };
  const confirmDelete = async (): Promise<void> => {
    if (!selectedEmployeeRef.current) return;
    setConfirmLoading(true);
    const ok = await DeleteAdmin(selectedEmployeeRef.current.EmployeeID);
    if (ok) {
      message.success("ลบข้อมูลพนักงานสำเร็จ");
      await fetchAdmins();
      await fetchAllUsers();
    } else {
      message.error("เกิดข้อผิดพลาดในการลบ");
    }
    cancelDelete();
  };

  // ------- Bulk Delete -------
  const handleBulkDelete = (): void => {
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
          selectedRowKeys.map((empId) => DeleteAdmin(Number(empId)))
        );
        const failed = results.some((r) => !r);
        if (!failed) {
          message.success("ลบข้อมูลสำเร็จ");
          setSelectedRowKeys([]);
          fetchAdmins();
          fetchAllUsers();
        } else {
          message.error("ลบบางรายการไม่สำเร็จ");
        }
      },
    });
  };

  // ------- Create -------
  const handleCreated = async (payload: any): Promise<void> => {
    const ok = await createEmployeeByAdmin(payload);
    if (ok) {
      message.success("สร้างพนักงานใหม่สำเร็จ");
      setCreateOpen(false);
      fetchAdmins();
      fetchAllUsers();
    } else {
      message.error("สร้างพนักงานใหม่ไม่สำเร็จ");
    }
  };

  // ------- Edit -------
  const openEdit = (row: RowType): void => {
    setEditingEmployee(row.Raw);
    setEditOpen(true);
  };
  const onSavedEdit = async (): Promise<void> => {
    setEditOpen(false);
    setEditingEmployee(null);
    fetchAdmins();
    fetchAllUsers();
  };

  // ------- Columns -------
  const columns: ColumnsType<RowType> = [
    {
      title: "Admin",
      dataIndex: "Name",
      key: "admin",
      sorter: (a, b) => a.Name.localeCompare(b.Name),
      render: (_, record) => (
        <Space size="middle">
          <Avatar src={record.ProfileImage} />
          <div>
            <div className="font-semibold text-gray-900">{record.Name}</div>
            <div className="text-gray-400 text-xs italic">
              {record.Username}
            </div>
            <div className="text-gray-500 text-xs">{record.Email}</div>
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
      render: (v) => <Tag color="blue">{v}</Tag>,
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
        <Tag color={v === "Male" ? "green" : "orange"}>{v}</Tag>
      ),
    },
    { title: "Phone", dataIndex: "Phone", key: "phone", width: 140 },
    {
      title: "Salary",
      dataIndex: "Salary",
      key: "salary",
      width: 110,
      sorter: (a, b) => a.Salary - b.Salary,
      render: (v) => (
        <span className="font-semibold text-blue-700">
          {Number(v ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
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

  const rowSelection: TableProps<RowType>["rowSelection"] = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#eaf2ff_0%,#f6f9ff_60%,#ffffff_100%)] mt-14 sm:mt-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex justify-between">
          <h1 className="text-sm sm:text-base font-semibold">
            Employees (Admins)
          </h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-6">
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <Input
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            placeholder="ค้นหา: ชื่อ / Username / อีเมล / เบอร์ / บทบาท"
            className="max-w-xl"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex gap-2">
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
            scroll={{ x: scrollX }}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </div>
      </div>

      {/* ✅ Create Modal */}
      {createOpen && (
        <CreateAdminModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
          userRoles={userRoles}
          allUsersData={allUsersData}
        />
      )}

      {/* ✅ Edit Modal */}
      {editOpen && (
        <EditAdminModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          employee={editingEmployee}
          onSaved={onSavedEdit}
          userRoles={userRoles}
        />
      )}

      {/* ✅ Confirm Delete Modal */}
      <EvModal open={openConfirmModal} onClose={cancelDelete}>
        <div className="w-[min(92vw,420px)] px-5 py-5 flex flex-col items-center text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-blue-100 bg-blue-50">
            <Trash2 size={22} className="text-blue-600" />
          </div>

          <h3 className="text-base font-bold text-slate-900">
            ยืนยันการลบผู้ดูแลระบบ
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            คุณต้องการลบ
            {selectedEmployeeRef.current?.Name && (
              <>
                <br />
                <span className="font-semibold text-blue-700">
                  “{selectedEmployeeRef.current.Name}”
                </span>
              </>
            )}{" "}
            ใช่หรือไม่?
            <br />
            <span className="text-xs text-slate-500">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </span>
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={confirmDelete}
              disabled={confirmLoading}
              className="min-w-[96px] h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-60"
            >
              {confirmLoading ? "กำลังลบ..." : "ลบ"}
            </button>
            <button
              onClick={cancelDelete}
              className="min-w-[96px] h-10 rounded-xl border border-blue-200 bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50 active:scale-[0.99] transition"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </EvModal>
    </div>
  );
};

export default Employees;
