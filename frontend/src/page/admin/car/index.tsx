import React, { JSX, useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Modal,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { ListCars, DeleteCar, apiUrlPicture } from "../../../services";
import type { CarsInterface } from "../../../interface/ICar";
import {
  FaCarSide,
  FaTruckPickup,
  FaTaxi,
  FaBusAlt,
} from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import ModalEditCar from "./edit";

// -------------------- Row Type --------------------
type RowType = {
  key: number;
  Index: number;
  Icon: JSX.Element;
  Brand: string;
  ModelCar: string;
  LicensePlate: string;
  City: string;
  SpecialNumber?: boolean;
  ID: number;
  UserName: string;
  Raw: CarsInterface;
};

const CarList: React.FC = () => {
  const [cars, setCars] = useState<RowType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editCar, setEditCar] = useState<any | null>(null);

  // 🚗 ไอคอนสุ่มเฉพาะรถยนต์
  const carIcons = [FaCarSide, FaTruckPickup, FaTaxi, FaBusAlt];
  const randomIcon = () => {
    const Icon = carIcons[Math.floor(Math.random() * carIcons.length)];
    return <Icon className="text-blue-600 text-lg mr-2" />;
  };

  // -------- Fetch cars --------
  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await ListCars();
      if (res) {
        const rows: RowType[] = res.map((c: CarsInterface, i: number) => {
          const ownerNames =
            c.User && c.User.length > 0
              ? c.User.map((u) => `${u.FirstName || ""} ${u.LastName || ""}`).join(", ")
              : "-";
          return {
            key: i + 1,
            Index: i + 1,
            Icon: randomIcon(),
            Brand: c.Brand ?? "",
            ModelCar: c.ModelCar ?? "",
            LicensePlate: c.LicensePlate ?? "",
            City: c.City ?? "",
            SpecialNumber: c.SpecialNumber ?? false,
            ID: c.ID ?? 0,
            UserName: ownerNames,
            Raw: c,
          };
        });
        setCars(rows);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // -------- Delete Car Handler --------
  const handleDelete = (id: number, name: string) => {
    Modal.confirm({
      title: "ยืนยันการลบรถ",
      icon: <ExclamationCircleOutlined />,
      content: `คุณต้องการลบรถ "${name}" ออกจากระบบหรือไม่?`,
      okText: "ลบ",
      cancelText: "ยกเลิก",
      okButtonProps: { danger: true },
      async onOk() {
        const ok = await DeleteCar(id);
        if (ok) {
          message.success("ลบข้อมูลรถสำเร็จ");
          fetchCars();
        } else {
          message.error("เกิดข้อผิดพลาดในการลบ");
        }
      },
    });
  };

  // -------- Export CSV --------
  const handleExportCSV = () => {
    if (cars.length === 0) {
      message.warning("ไม่มีข้อมูลให้ดาวน์โหลด");
      return;
    }

    const data = cars.map((c) => ({
      No: c.Index,
      Brand: c.Brand,
      Model: c.ModelCar,
      LicensePlate: c.LicensePlate,
      City: c.City,
      SpecialNumber: c.SpecialNumber ? "Yes" : "No",
      Owner: c.UserName,
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Cars");
    writeFile(wb, "car_list.xlsx");

    message.success("ดาวน์โหลดไฟล์สำเร็จ");
  };

  // -------- Search filter --------
  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return cars;
    return cars.filter(
      (r) =>
        r.Brand.toLowerCase().includes(q) ||
        r.ModelCar.toLowerCase().includes(q) ||
        r.LicensePlate.toLowerCase().includes(q) ||
        r.City.toLowerCase().includes(q) ||
        r.UserName.toLowerCase().includes(q)
    );
  }, [cars, searchText]);

  // -------- Columns --------
  const columns: ColumnsType<RowType> = [
    {
      title: "No.",
      dataIndex: "Index",
      key: "index",
      width: 60,
      align: "center",
      render: (_, record) => <span className="font-semibold">{record.Index}</span>,
    },
    {
      title: "Brand / Icon",
      dataIndex: "Brand",
      key: "brand",
      sorter: (a, b) => a.Brand.localeCompare(b.Brand),
      render: (_, record) => (
        <div className="flex items-center">
          {record.Icon}
          <span className="font-semibold text-gray-900">{record.Brand}</span>
        </div>
      ),
    },
    {
      title: "Model",
      dataIndex: "ModelCar",
      key: "model",
      sorter: (a, b) => a.ModelCar.localeCompare(b.ModelCar),
      render: (v) => <span className="text-gray-800">{v}</span>,
    },
    {
      title: "License Plate",
      dataIndex: "LicensePlate",
      key: "license_plate",
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "City",
      dataIndex: "City",
      key: "city",
      render: (v) => <span className="text-gray-700">{v}</span>,
    },
    {
      title: "Owner",
      dataIndex: "UserName",
      key: "user",
      render: (_, record) => {
        const user = record.Raw.User?.[0];
        if (!user)
          return <span className="text-gray-400 italic">ไม่พบข้อมูลผู้ใช้</span>;

        const avatarUrl = user.Profile
          ? `${apiUrlPicture}${user.Profile}`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              `${user.FirstName} ${user.LastName}`
            )}&background=0D8ABC&color=fff&size=40`;

        return (
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt={user.FirstName}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-gray-900">
                {user.FirstName} {user.LastName}
              </span>
              <span className="text-xs text-gray-500">{user.Username}</span>
              <span className="text-xs text-gray-500">{user.Email}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Special",
      dataIndex: "SpecialNumber",
      key: "special",
      render: (v) =>
        v ? (
          <Tag color="gold" className="font-semibold ml-4">
            ทะเบียนพิเศษ
          </Tag>
        ) : (
          <Tag color="default">ทะเบียนธรรมดา</Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            className="border-blue-200 text-blue-700"
            onClick={() => setEditCar(record.Raw)}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.ID, record.Brand)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white mt-14 sm:mt-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-semibold tracking-wide">Cars</h1>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <Input
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            placeholder="ค้นหา: ยี่ห้อ / รุ่น / ทะเบียน / จังหวัด / เจ้าของ"
            className="max-w-xl"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden ring-1 ring-blue-100 bg-white mb-10">
          <Table<RowType>
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              position: ["bottomCenter"],
            }}
            className="ev-ant-table"
            size="middle"
          />
        </div>

        <p className="text-[12px] text-gray-500 text-center mt-10">
          EV Blue • มินิมอล • รองรับมือถือ
        </p>
      </div>

      {/* ✅ Modal Edit Car */}
      {editCar && (
        <ModalEditCar
          open={!!editCar}
          car={editCar}
          onClose={() => setEditCar(null)}
          onUpdated={fetchCars}
        />
      )}

      {/* EV Blue Theme */}
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
        .ev-ant-table .ant-table-pagination {
          justify-content: center !important;
        }
      `}</style>
    </div>
  );
};

export default CarList;
