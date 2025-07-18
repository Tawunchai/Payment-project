import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { SlideLeft } from "./SlideLeft";
import { ListGetStarted, DeleteGettingByID } from "../../services/index";
import type { GetstartedInterface } from "../../interface/IGetstarted";
import { FaTrash, FaEdit } from "react-icons/fa";
import { Trash2 } from "react-feather";
import Modal from "../admin/getting/Modal";
import { useNavigate } from "react-router-dom";
import { HiOutlineDocumentText } from "react-icons/hi";
import { message } from 'antd';
//
const Editor = () => {
  const [getstartedList, setGetstartedList] = useState<GetstartedInterface[]>([]);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const selectedRef = useRef<GetstartedInterface | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    const data = await ListGetStarted();
    if (data) setGetstartedList(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDeleteModal = (item: GetstartedInterface) => {
    selectedRef.current = item;
    setOpenConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (selectedRef.current) {
      const result = await DeleteGettingByID(selectedRef.current.ID!);
      if (result) {
        message.success('ลบข้อมูลสำเร็จ');
        fetchData();
      } else {
        message.error("เกิดข้อผิดพลาดในการลบ");
      }
      setOpenConfirmModal(false);
      selectedRef.current = null;
    }
  };

  const cancelDelete = () => {
    setOpenConfirmModal(false);
    selectedRef.current = null;
  };

  const handleEdit = (item: GetstartedInterface) => {
    navigate("/admin/edit-editor", {
      state: {
        id: item.ID,
        initialTitle: item.Title,
        initialDescription: item.Description,
      },
    });
  };

  return (
    <div className="bg-[#f9f9f9]">
      <div className="ContainerExtra py-24 paddings">
        <div className="space-y-4 p-6 text-center max-w-[500px] mx-auto mb-5">
          <h1 className="uppercase font-semibold text-black text-[32px]">
            Total Getting Started Management
          </h1>
          <button
            className="font-semibold text-2xl bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            onClick={() => window.location.href = "/admin/create-editor"}
          >
            CREATE
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {getstartedList.map((item, index) => {
            const delay = 0.3 + index * 0.3;
            return (
              <motion.div
                key={item.ID}
                variants={SlideLeft(delay)}
                initial="hidden"
                whileInView="visible"
                className="w-full space-y-2 p-6 rounded-xl shadow-[0_0_22px_0_rgba(0,0,0,0.15)] bg-white relative"
              >
                {/* ปุ่มแก้ไขและลบ */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-500 hover:text-blue-700"
                    title="แก้ไข"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="text-red-500 hover:text-red-700"
                    title="ลบ"
                  >
                    <FaTrash />
                  </button>
                </div>

                {/* เนื้อหา */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-orange-500">
                    <HiOutlineDocumentText size={32} />
                  </div>
                  <p className="font-semibold text-sm">{item.Title}</p>
                </div>
                <p className="text-sm text-gray-500">{item.Description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal ยืนยันการลบ */}
      <Modal open={openConfirmModal} onClose={cancelDelete}>
        <div className="text-center w-56">
          <Trash2 size={56} className="mx-auto text-red-500" />
          <div className="mx-auto my-4 w-48">
            <h3 className="text-lg font-black text-gray-800">ยืนยันการลบ</h3>
            <p className="text-sm text-gray-500">
              คุณแน่ใจว่าต้องการลบ
              {selectedRef.current?.Title && (
                <>
                  <br />
                  <span className="font-semibold text-red-600">
                    {selectedRef.current.Title}
                  </span>
                </>
              )}
              ใช่หรือไม่?
            </p>
          </div>
          <div className="flex gap-4">
            <button
              className="btn btn-danger w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded"
              onClick={confirmDelete}
            >
              ลบ
            </button>
            <button
              className="btn btn-light w-full bg-gray-200 hover:bg-gray-300 text-black py-1 rounded"
              onClick={cancelDelete}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Editor;
