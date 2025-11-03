import React, { useEffect, useState } from "react";
import { Spin, Empty, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import {
  ListBookingByUserID,
  apiUrlPicture,
} from "../../../../../services";
import { getCurrentUser, initUserProfile } from "../../../../../services/httpLogin";
import type { BookingInterface } from "../../../../../interface/IBooking";
import bgCard from "../../../../../assets/booking-ev.png"; // 🔹 รูปพื้นหลัง EV station

const BookingHistory: React.FC = () => {
  const [userID, setUserID] = useState<number | undefined>(undefined);
  const [bookings, setBookings] = useState<BookingInterface[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ โหลด userID จาก JWT (cookie)
  useEffect(() => {
    const loadUser = async () => {
      try {
        let current = getCurrentUser();
        if (!current) current = await initUserProfile();

        const uid = current?.id;
        if (!uid) {
          message.error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
          return;
        }

        setUserID(uid);
      } catch (error) {
        console.error("Error loading user:", error);
        message.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      }
    };
    loadUser();
  }, []);

  // ✅ โหลดประวัติการจอง
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!userID) return;
        const res = await ListBookingByUserID(userID);
        if (res && Array.isArray(res)) {
          const now = dayjs();

          // ✅ กรองเฉพาะที่ยัง active หรือหมดอายุไม่เกิน 7 วัน
          const filtered = res.filter((b) => {
            const end = dayjs(b.EndDate);
            return end.isAfter(now.subtract(7, "day"));
          });

          // ✅ เรียงลำดับ: active (ยังไม่หมดอายุ) ก่อน แล้วตามด้วยหมดอายุเรียงจากใหม่ไปเก่า
          const sorted = filtered.sort((a, b) => {
            const now = dayjs();
            const aEnd = dayjs(a.EndDate);
            const bEnd = dayjs(b.EndDate);

            const aActive = now.isBefore(aEnd);
            const bActive = now.isBefore(bEnd);

            // active ก่อน expired
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;

            // ถ้า active เหมือนกัน → เรียงตามเวลาใกล้ปัจจุบัน
            return bEnd.diff(aEnd);
          });

          setBookings(sorted);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        message.error("โหลดประวัติการจองล้มเหลว");
      } finally {
        setLoading(false);
      }
    };

    if (userID) fetchBookings();
  }, [userID]);

  //@ts-ignore
  const getDynamicStatusTag = (start: string, end: string) => {
    const now = dayjs();
    const active = now.isBefore(dayjs(end));
    return (
      <div
        className={`px-3 py-[2px] rounded-full text-[12px] font-medium ${
          active
            ? "bg-green-100 text-green-700 border border-green-200"
            : "bg-gray-100 text-red-500 border border-red-200"
        }`}
      >
        {active ? "จองแล้ว" : "หมดอายุการจอง"}
      </div>
    );
  };

  // ✅ Loading
  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <Spin size="large" />
      </div>
    );

  // ✅ ไม่มีข้อมูล
  if (!bookings.length)
    return (
      <div className="flex justify-center items-center py-8">
        <Empty description="ยังไม่มีประวัติการจองในช่วง 7 วันที่ผ่านมา" />
      </div>
    );

  // ✅ แสดงประวัติการจอง
  return (
    <div
      className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pr-2"
      style={{ maxHeight: bookings.length > 2 ? "360px" : "auto" }}
    >
      {bookings.map((b) => (
        <div
          key={b.ID}
          className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 bg-white/80 backdrop-blur-[1px]"
        >
          {/* 🔹 พื้นหลัง EV station */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{
              backgroundImage: `url(${bgCard})`,
              filter: "brightness(0.8) saturate(1.05)",
              zIndex: 1,
            }}
          />

          {/* 🌈 Overlay Gradient ฟ้าโปร่งบาง */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#001a3b70] via-[#002b5570] to-[#00408060]"
            style={{ zIndex: 2 }}
          />

          {/* 🔹 เนื้อหา card */}
          <div
            className="relative z-10 p-4 flex flex-col justify-between h-full text-white"
            style={{ minHeight: "170px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <img
                src={
                  b.EVCabinet?.Image
                    ? `${apiUrlPicture}${b.EVCabinet.Image}`
                    : "https://via.placeholder.com/60x60.png?text=EV"
                }
                alt={b.EVCabinet?.Name}
                className="w-12 h-12 rounded-lg object-cover shadow-md border border-white/40"
              />
              <div>
                {/* 🔵 ชื่อ EV */}
                <span className="inline-block bg-blue-600 text-white text-[13px] font-semibold px-3 py-[3px] rounded-md shadow-md drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                  {b.EVCabinet?.Name || "ไม่ทราบชื่อตู้"}
                </span>
                <p className="text-[13px] text-blue-100 font-medium mt-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
                  {dayjs(b.StartDate).locale("th").format("DD MMM YYYY")}
                </p>
              </div>
            </div>

            {/* เวลา */}
            <div className="flex justify-between text-[13px] mt-3 text-blue-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
              <div>
                <span className="font-semibold text-blue-200">เริ่ม:</span>{" "}
                {dayjs(b.StartDate).format("HH:mm")}
              </div>
              <div>
                <span className="font-semibold text-blue-200">สิ้นสุด:</span>{" "}
                {dayjs(b.EndDate).format("HH:mm")}
              </div>
            </div>

            {/* เส้นแบ่ง */}
            <div className="h-[1px] bg-white/40 my-2" />

            {/* สถานะ */}
            <div className="flex justify-start items-center text-blue-50">
              {getDynamicStatusTag(b.StartDate, b.EndDate)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingHistory;
