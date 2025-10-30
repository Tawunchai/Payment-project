import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListModals, DeleteBrandByID } from "../../../services";
import type { ModalInterface } from "../../../interface/ICarCatalog";
import { Button, Spin, Input, message } from "antd";
import {
  ArrowLeftOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Edit2, Trash as TrashIcon, Trash2 } from "react-feather";
import ModalConfirm from "../get/Modal";
import CreateBrandModal from "./brand/create";
import UpdateBrandModal from "./brand/update";
import BrandDetailModal from "./brand/detail";

const CarData: React.FC = () => {
  const navigate = useNavigate();
  const [modals, setModals] = useState<ModalInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<{ id: number; name: string } | null>(
    null
  );

  // ✅ สำหรับ modal แสดงรายละเอียดของรุ่น (Modal)
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [detailBrand, setDetailBrand] = useState<{
    brandName: string;
    brandID: number;
    models: ModalInterface[];
  }>({
    brandName: "",
    brandID: 0,
    models: [],
  });

  // ✅ โหลดข้อมูลทั้งหมด
  const fetchModals = async () => {
    setLoading(true);
    const res = await ListModals();
    if (res) setModals(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchModals();
  }, []);

  // ✅ Group แยก Brand → Models
  const grouped = useMemo(() => {
    const map = new Map<
      number,
      { brandName: string; brandID: number; models: ModalInterface[] }
    >();

    modals.forEach((m) => {
      const brandID = m.Brand?.ID ?? 0;
      const brandName = m.Brand?.BrandName ?? "ไม่ระบุยี่ห้อ";

      if (!map.has(brandID)) {
        map.set(brandID, { brandName, brandID, models: [] });
      }
      map.get(brandID)!.models.push(m);
    });

    return Array.from(map.entries()).sort((a, b) =>
      a[1].brandName.localeCompare(b[1].brandName)
    );
  }, [modals]);

  // ✅ ค้นหา
  const filtered = useMemo(() => {
    if (!query.trim()) return grouped;
    const q = query.toLowerCase();
    return grouped.filter(([_, { brandName, models }]) => {
      return (
        brandName.toLowerCase().includes(q) ||
        models.some((m) => m.ModalName.toLowerCase().includes(q))
      );
    });
  }, [grouped, query]);

  // ✅ เปิด modal ลบ Brand
  const openDeleteModal = (id: number, name: string) => {
    setSelectedBrand({ id, name });
    setOpenConfirmModal(true);
  };

  // ✅ ยืนยันการลบ
  const confirmDelete = async () => {
    if (!selectedBrand) return;
    const ok = await DeleteBrandByID(selectedBrand.id);
    if (ok) {
      message.success("ลบยี่ห้อสำเร็จ");
      fetchModals();
    } else {
      message.warning("เกิดข้อผิดพลาดในการลบยี่ห้อ");
    }
    setOpenConfirmModal(false);
    setSelectedBrand(null);
  };

  // ✅ คลิกการ์ดเพื่อเปิด Modal ของรุ่น
  const handleCardClick = (brandName: string, brandID: number, models: ModalInterface[]) => {
    if (!brandID || brandID === 0) {
      message.warning("ไม่พบรหัสยี่ห้อ กรุณารีเฟรชหน้า");
      return;
    }
    console.log("🟦 handleCardClick ->", brandName, brandID);
    setDetailBrand({ brandName, brandID, models });
    setOpenDetailModal(true);
  };

  // 🔘 ปุ่มไอคอน
  const IconGhostButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "blue" | "red"; label: string }
  > = ({ tone = "blue", label, children, ...props }) => {
    const toneClass =
      tone === "blue"
        ? "border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50/70 focus:ring-blue-200"
        : "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50/70 focus:ring-red-200";
    return (
      <button
        {...props}
        className={`h-9 w-9 grid place-items-center rounded-lg border bg-white/80 backdrop-blur transition-all active:scale-[0.98] focus:outline-none focus:ring-4 ${toneClass}`}
        aria-label={label}
        title={label}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-blue-600 text-white shadow-sm flex items-center justify-between px-4 py-3">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/Car")}
          className="bg-white text-blue-600 font-semibold hover:bg-blue-50"
        >
          Back
        </Button>
        <h1 className="text-base font-semibold">Car Data</h1>
        <button
          onClick={() => setOpenCreateModal(true)}
          className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-white text-blue-700 text-sm font-semibold shadow-sm hover:bg-white/90 active:scale-[0.99] transition"
        >
          <PlusOutlined className="mr-1" /> CREATE
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-4 bg-white flex justify-start">
        <Input
          size="large"
          prefix={<SearchOutlined className="text-blue-500" />}
          placeholder="ค้นหา ยี่ห้อ หรือ รุ่นรถ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-80 md:w-96 rounded-xl border-blue-100 shadow-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
          allowClear
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Spin size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            ไม่พบข้อมูลที่ตรงกับ "{query}"
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map(([brandID, { brandName, models }]) => (
              <div
                key={brandID}
                onClick={() => handleCardClick(brandName, brandID, models)}
                className="group bg-white border border-blue-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between relative cursor-pointer"
              >
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  <IconGhostButton
                    tone="blue"
                    label="แก้ไข"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBrand({ id: brandID, name: brandName });
                      setOpenUpdateModal(true);
                    }}
                  >
                    <Edit2 size={16} strokeWidth={2} />
                  </IconGhostButton>

                  <IconGhostButton
                    tone="red"
                    label="ลบ"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(brandID, brandName);
                    }}
                  >
                    <TrashIcon size={16} strokeWidth={2} />
                  </IconGhostButton>
                </div>

                {/* Brand info */}
                <div>
                  <h3 className="text-blue-700 font-semibold text-sm sm:text-base truncate">
                    {brandName}
                  </h3>
                  <p className="text-xs text-gray-500">{models.length} รุ่น</p>
                </div>

                {/* Models summary */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {models.slice(0, 2).map((m) => (
                    <span
                      key={m.ID}
                      className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-xs text-gray-700 rounded-full"
                    >
                      {m.ModalName}
                    </span>
                  ))}
                  {models.length > 2 && (
                    <span className="text-[11px] text-blue-600 font-medium ml-1">
                      +{models.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete */}
      <ModalConfirm open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <div className="w-[min(92vw,280px)] text-center px-3 py-4">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-blue-100 bg-blue-50">
            <Trash2 size={22} className="text-blue-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">ยืนยันการลบยี่ห้อ</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            คุณต้องการลบ
            {selectedBrand && (
              <>
                <br />
                <span className="font-semibold text-blue-700">
                  “{selectedBrand.name}”
                </span>
              </>
            )}
            ใช่หรือไม่?
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={confirmDelete}
              className="w-full h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700"
            >
              ลบ
            </button>
            <button
              onClick={() => setOpenConfirmModal(false)}
              className="w-full h-10 rounded-xl border border-blue-200 bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </ModalConfirm>

      {/* Create / Update Brand */}
      {openCreateModal && (
        <CreateBrandModal
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          onSuccess={fetchModals}
        />
      )}
      {openUpdateModal && selectedBrand && (
        <UpdateBrandModal
          open={openUpdateModal}
          onClose={() => setOpenUpdateModal(false)}
          onSuccess={fetchModals}
          brandID={selectedBrand.id}
          initialName={selectedBrand.name}
        />
      )}

      {/* Detail Modal */}
      {openDetailModal && (
        <BrandDetailModal
          open={openDetailModal}
          onClose={() => setOpenDetailModal(false)}
          brandName={detailBrand.brandName}
          brandID={detailBrand.brandID}
          models={detailBrand.models}
          onReload={fetchModals}
        />
      )}
    </div>
  );
};

export default CarData;
