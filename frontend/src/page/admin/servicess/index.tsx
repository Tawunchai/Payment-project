import React, { useEffect, useState } from "react";
import { Button, Spin, Empty, Typography, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { RiExternalLinkLine } from "react-icons/ri";
import { ListServices, ListSendEmails } from "../../../services";
import type { ServiceInterface } from "../../../interface/IService";
import type { SendEmailInterface } from "../../../interface/ISendEmail";

// ✅ แยกโมดัลคนละตัวให้ชัด
import ModalEditSendEmail from "./editemail";
import ModalEditService from "./editservice";

const { Text, Link, Paragraph, Title } = Typography;

const ServiceContactCenter: React.FC = () => {
  // -------- Service contacts --------
  const [services, setServices] = useState<ServiceInterface[]>([]);
  const [loadingService, setLoadingService] = useState(false);
  // modal แก้ service contact
  const [openEditService, setOpenEditService] = useState(false);
  const [editService, setEditService] = useState<ServiceInterface | null>(null);

  // -------- OTP sender (SendEmail) --------
  const [sendEmail, setSendEmail] = useState<SendEmailInterface | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  // modal แก้ OTP sender
  const [openEditEmail, setOpenEditEmail] = useState(false);

  const fetchServices = async () => {
    setLoadingService(true);
    try {
      const res = await ListServices();
      if (res) setServices(res);
    } finally {
      setLoadingService(false);
    }
  };

  const fetchFirstSendEmail = async () => {
    setLoadingEmail(true);
    try {
      const res = await ListSendEmails();
      if (res && res.length > 0) {
        setSendEmail(res[0]);
      } else {
        setSendEmail(null);
      }
    } finally {
      setLoadingEmail(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchFirstSendEmail();
  }, []);

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-semibold tracking-wide">
            Service Contact Center
          </h1>

          {/* 👉 ปุ่ม EDIT OTP Sending */}
          <Button
            onClick={() => setOpenEditEmail(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
            loading={loadingEmail}
          >
            EDIT OTP Sending
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full bg-white py-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <Title level={3} className="!m-0 !text-blue-700">
              Service Contact Center
            </Title>
            <Paragraph className="!mt-1 text-gray-500">
              ข้อมูลติดต่อบริการทั้งหมดในระบบ EV Platform
            </Paragraph>
          </div>

          {loadingService ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : services.length === 0 ? (
            <Empty description="ไม่พบข้อมูลบริการ" className="mt-20" />
          ) : (
            <div className="flex flex-col gap-8">
              {services.map((s) => (
                <div
                  key={s.ID}
                  className="w-full shadow-lg rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 p-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                    <span className="font-semibold text-blue-700 text-lg">
                      Service #{s.ID}
                    </span>
                    <Button
                      icon={<EditOutlined />}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => {
                        setEditService(s);
                        setOpenEditService(true); // ✅ เปิด modal ของ service
                      }}
                    >
                      Edit Service Contact
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-700 text-sm">
                    {/* Email */}
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-blue-600" />
                      <Text copyable>{s.Email || "-"}</Text>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2">
                      <FaPhoneAlt className="text-blue-600" />
                      <Text>{s.Phone || "-"}</Text>
                    </div>

                    {/* Location + Map */}
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <FaMapMarkerAlt className="text-blue-600 mt-1" />
                      <div className="flex flex-col">
                        <Text>{s.Location || "-"}</Text>
                        {s.MapURL && (
                          <Link
                            href={s.MapURL}
                            target="_blank"
                            className="text-blue-500 flex items-center gap-1 hover:underline"
                          >
                            เปิดแผนที่ <RiExternalLinkLine />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-gray-500 text-xs pt-3 col-span-full border-t border-gray-100 mt-2 pt-3">
                      <FaCalendarAlt />
                      <span>
                        {s.CreatedAt
                          ? new Date(s.CreatedAt).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-[12px] text-gray-500 text-center mt-10">
            EV Blue • มินิมอล • รองรับมือถือ
          </p>
        </div>
      </div>

      {/* ✅ Modal: Edit Service Contact (ใหม่) */}
      {editService && (
        <ModalEditService
          open={openEditService}
          record={editService}
          onClose={() => setOpenEditService(false)}
          onUpdated={(updated) => {
            // อัปเดตรายการในหน้า
            setServices((prev) =>
              prev.map((x) => (x.ID === updated.ID ? updated : x))
            );
            message.success("อัปเดต Service Contact สำเร็จ");
          }}
        />
      )}

      {/* ✅ Modal: EDIT OTP Sending (เดิม) */}
      <ModalEditSendEmail
        open={openEditEmail}
        onClose={() => setOpenEditEmail(false)}
        record={sendEmail}
        onUpdated={(u) => {
          setSendEmail(u);
          message.success("อัปเดตอีเมลผู้ส่ง OTP สำเร็จ");
        }}
      />
    </div>
  );
};

export default ServiceContactCenter;
