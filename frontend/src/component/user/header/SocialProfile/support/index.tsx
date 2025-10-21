import React from "react";
import { Card, Typography, Tag } from "antd";
import {
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiBugLine,
  RiExternalLinkLine,
} from "react-icons/ri";

const { Text, Link, Paragraph } = Typography;

const MOCK = {
  email: "support@evstation.example",
  phone: "+66 2 123 4567",
  location: {
    label: "ชั้น 12 อาคาร EV Station Tower, ถนนสุขุมวิท, กรุงเทพฯ 10110",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=13.736717,100.523186",
  },
  hours: "จันทร์–ศุกร์ 09:00–18:00 น. (หยุดเสาร์–อาทิตย์และนักขัตฤกษ์)",
  sla: "ตอบกลับภายใน 1–2 วันทำการ",
};

const quickMail = `mailto:${MOCK.email}?subject=${encodeURIComponent(
  "[EV Station] แจ้งปัญหา"
)}&body=${encodeURIComponent(
  "สวัสดีทีมงาน EV Station,\n\nรายละเอียดปัญหา:\n- พบเมื่อ:\n- หน้าจอ/ฟีเจอร์:\n- หมายเลขผู้ใช้ (ถ้ามี):\n- ภาพหน้าจอ/วิดีโอ (ถ้ามี):\n\nขอบคุณครับ/ค่ะ"
)}`;

const quickCall = `tel:${MOCK.phone.replace(/\s+/g, "")}`;

const SupportCard: React.FC = () => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span className="text-blue-600 text-xl">
            <RiBugLine />
          </span>
          <span className="text-gray-900 text-sm md:text-base font-bold">
            ติดต่อ / แจ้งปัญหา
          </span>
          <Tag color="blue" className="ml-2 hidden md:inline-flex">
            Service Desk
          </Tag>
        </div>
      }
      className="rounded-2xl md:rounded-3xl shadow-sm border border-gray-100"
      classNames={{
        body: "pt-2 md:pt-3",
        header: "border-0 bg-white rounded-t-2xl md:rounded-t-3xl",
      }}
      bordered={false}
    >
      <div className="flex flex-col gap-6">
        {/* Email */}
        <div className="flex items-start gap-3">
          <span className="text-xl text-blue-600 mt-0.5">
            <RiMailLine />
          </span>
          <div className="flex-1 min-w-0">
            <Text type="secondary" className="text-[12px] block">
              Email
            </Text>
            <Link href={quickMail} target="_blank" className="text-sm md:text-base">
              {MOCK.email}
            </Link>
            <div className="mt-1 text-[12px] text-gray-500">
              แนะนำให้แนบภาพหน้าจอ/วิดีโอ เพื่อช่วยตรวจสอบได้ไวขึ้น
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <span className="text-xl text-blue-600 mt-0.5">
            <RiPhoneLine />
          </span>
          <div className="flex-1 min-w-0">
            <Text type="secondary" className="text-[12px] block">
              Phone
            </Text>
            <Link href={quickCall} className="text-sm md:text-base">
              {MOCK.phone}
            </Link>
            <div className="mt-1 text-[12px] text-gray-500">
              โทรในเวลาทำการเพื่อการช่วยเหลือแบบเร่งด่วน
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3">
          <span className="text-xl text-blue-600 mt-0.5">
            <RiMapPinLine />
          </span>
          <div className="flex-1 min-w-0">
            <Text type="secondary" className="text-[12px] block">
              สถานที่
            </Text>
            <Paragraph className="!mb-1 text-sm md:text-base">
              {MOCK.location.label}
            </Paragraph>
            <Link href={MOCK.location.mapUrl} target="_blank" className="text-[13px]">
              เปิดแผนที่ <RiExternalLinkLine className="inline -mt-1 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SupportCard;
