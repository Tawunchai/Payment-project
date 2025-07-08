import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { SlideLeft } from "./SlideLeft";
import { ListNews, DeleteNews,apiUrlPicture } from "../../../services";
import type { NewsInterface } from "../../../interface/INews";
import { FaTrash, FaEdit } from "react-icons/fa";
import { Trash2 } from "react-feather";
import Modal from "../getting/modal";
import { useNavigate } from "react-router-dom"; // ✅ เพิ่ม

const New = () => {
  const [newsList, setNewsList] = useState<NewsInterface[]>([]);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const selectedNewsRef = useRef<NewsInterface | null>(null);
  const navigate = useNavigate(); // ✅ สำหรับ redirect

  const fetchNews = async () => {
    const data = await ListNews();
    if (data) setNewsList(data);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openDeleteModal = (news: NewsInterface) => {
    selectedNewsRef.current = news;
    setOpenConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (selectedNewsRef.current) {
      const result = await DeleteNews(selectedNewsRef.current.ID!);
      if (result) {
        alert("ลบข่าวสำเร็จ");
        fetchNews();
      } else {
        alert("เกิดข้อผิดพลาดในการลบข่าว");
      }
      setOpenConfirmModal(false);
      selectedNewsRef.current = null;
    }
  };

  const cancelDelete = () => {
    setOpenConfirmModal(false);
    selectedNewsRef.current = null;
  };

  const handleEdit = (news: NewsInterface) => {
    navigate("/admin/edit-new", {
      state: {
        newsId: news.ID,
        initialTitle: news.Title,
        initialDescription: news.Description,
        initialPicture: news.Picture,
      },
    });
  };

  return (
    <div className="bg-[#f9f9f9]">
      <div className="ContainerExtra py-24 paddings">
        <div className="space-y-4 p-6 text-center max-w-[500px] mx-auto mb-5">
          <h1 className="uppercase font-semibold text-black text-[32px]">
            Total News Management
          </h1>
          <button
            className="font-semibold text-2xl bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            onClick={() => window.location.href = "/admin/create-new"}
          >
            CREATE
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {newsList.map((item, index) => {
            const delay = 0.3 + index * 0.3;
            return (
              <motion.div
                key={item.ID}
                variants={SlideLeft(delay)}
                initial="hidden"
                whileInView="visible"
                className="w-full space-y-2 p-6 rounded-xl shadow-[0_0_22px_0_rgba(0,0,0,0.15)] bg-white relative"
              >
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-500 hover:text-blue-700"
                    title="แก้ไขข่าว"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="text-red-500 hover:text-red-700"
                    title="ลบข่าว"
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={`${apiUrlPicture}${item.Picture}`}
                      alt="news icon"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-semibold text-sm">{item.Title}</p>
                </div>
                <p className="text-sm text-gray-500">{item.Description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Modal open={openConfirmModal} onClose={cancelDelete}>
        <div className="text-center w-56">
          <Trash2 size={56} className="mx-auto text-red-500" />
          <div className="mx-auto my-4 w-48">
            <h3 className="text-lg font-black text-gray-800">ยืนยันการลบ</h3>
            <p className="text-sm text-gray-500">
              คุณแน่ใจว่าต้องการลบ
              {selectedNewsRef.current?.Title && (
                <>
                  <br />
                  <span className="font-semibold text-red-600">
                    {selectedNewsRef.current.Title}
                  </span><br />
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

export default New;
