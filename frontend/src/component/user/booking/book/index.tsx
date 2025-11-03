import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Divider,
  DatePicker,
  Spin,
  message,
  Tag,
  Alert,
} from "antd";
import { FaMapMarkerAlt, FaUserCircle } from "react-icons/fa";
import dayjs, { Dayjs } from "dayjs";
import locale from "antd/es/date-picker/locale/th_TH";
import "dayjs/locale/th";

import {
  apiUrlPicture,
  ListBookingByEVCabinetIDandStartDate,
  CreateBooking,
} from "../../../../services";
import { getCurrentUser, initUserProfile } from "../../../../services/httpLogin";
import type { EVCabinetInterface } from "../../../../interface/IBooking";

interface TimeSlot {
  label: string;
  start: string;
  end: string;
}

/* =========================
   HeaderBar EV Gradient Blue
   ========================= */
const HeaderBar: React.FC<{ title?: string; onBack?: () => void }> = ({
  title = "จองตู้ชาร์จไฟฟ้า",
  onBack,
}) => {
  const goBack = () => (onBack ? onBack() : window.history.back());
  return (
    <header
      className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-b-2xl shadow-md overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="w-full px-4 py-3 flex items-center gap-2 justify-start">
        <button
          onClick={goBack}
          aria-label="ย้อนกลับ"
          className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M15 18l-6-6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 text-white"
          >
            <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
          </svg>
          <span className="text-sm md:text-base font-semibold tracking-wide">
            {title}
          </span>
        </div>
      </div>
    </header>
  );
};

/* =========================
   BookingDate Component
   ========================= */
const BookingDate: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cabinet: EVCabinetInterface | null = location.state?.cabinet || null;

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [alreadyBookedToday, setAlreadyBookedToday] = useState(false);
  const [userID, setUserID] = useState<number | undefined>(undefined);

  // ✅ โหลด userID จาก JWT (cookie)
  useEffect(() => {
    const loadUser = async () => {
      try {
        let current = getCurrentUser();
        if (!current) current = await initUserProfile();
        const uid = current?.id;

        if (!uid) {
          message.error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
          navigate("/login");
          return;
        }

        setUserID(uid);
      } catch (err) {
        console.error("Error loading user:", err);
        message.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      }
    };
    loadUser();
  }, [navigate]);

  /* =========================
     ช่วงเวลาหลักแบบคงที่
     ========================= */
  const staticSlots: TimeSlot[] = [
    { label: "06:00 - 09:00", start: "06:00", end: "09:00" },
    { label: "09:00 - 12:00", start: "09:00", end: "12:00" },
    { label: "12:00 - 15:00", start: "12:00", end: "15:00" },
    { label: "15:00 - 18:00", start: "15:00", end: "18:00" },
    { label: "18:00 - 21:00", start: "18:00", end: "21:00" },
    { label: "21:00 - 00:00", start: "21:00", end: "00:00" },
    { label: "00:00 - 03:00", start: "00:00", end: "03:00" },
    { label: "03:00 - 06:00", start: "03:00", end: "06:00" },
  ];

  /* =========================
     ฟังก์ชันกรองช่วงเวลาที่จองแล้วออก
     ========================= */
  const computeAvailableSlots = (): TimeSlot[] => {
    if (!bookings || bookings.length === 0 || !selectedDate) return staticSlots;

    return staticSlots.filter((slot) => {
      const slotStart = dayjs(
        `${selectedDate.format("YYYY-MM-DD")} ${slot.start}`,
        "YYYY-MM-DD HH:mm"
      );
      const slotEnd = dayjs(
        `${selectedDate.format("YYYY-MM-DD")} ${slot.end}`,
        "YYYY-MM-DD HH:mm"
      );

      const isOverlap = bookings.some((b) => {
        const bookedStart = dayjs(b.StartDate);
        const bookedEnd = dayjs(b.EndDate);
        return slotStart.isBefore(bookedEnd) && slotEnd.isAfter(bookedStart);
      });

      return !isOverlap;
    });
  };

  /* =========================
     โหลดข้อมูลเมื่อเลือกวันที่
     ========================= */
  const handleDateChange = async (date: Dayjs | null) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (!date || !cabinet || !userID) return;
    setLoading(true);
    try {
      const res = await ListBookingByEVCabinetIDandStartDate(
        cabinet.ID,
        date.format("YYYY-MM-DD")
      );
      const bookingsData = Array.isArray(res) ? res : [];
      setBookings(bookingsData);

      const userHasBooked = bookingsData.some((b: any) => b.UserID === userID);
      setAlreadyBookedToday(userHasBooked);
    } catch (err) {
      console.error(err);
      message.error("โหลดข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) setAvailableSlots(computeAvailableSlots());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, selectedDate]);

  /* =========================
     สร้างการจอง
     ========================= */
  const handleBooking = async () => {
    if (alreadyBookedToday) {
      message.warning("คุณได้ทำการจองในวันนี้แล้ว ไม่สามารถจองซ้ำได้");
      return;
    }

    if (!cabinet || !selectedDate || !selectedSlot || !userID) {
      message.warning("กรุณาเลือกวันที่และช่วงเวลา");
      return;
    }

    const payload = {
      start_date: dayjs(
        `${selectedDate.format("YYYY-MM-DD")} ${selectedSlot.start}`
      ).toDate(),
      end_date: dayjs(
        `${selectedDate.format("YYYY-MM-DD")} ${selectedSlot.end}`
      ).toDate(),
      user_id: userID,
      ev_cabinet_id: cabinet.ID,
    };

    try {
      const res = await CreateBooking(payload);
      if (res) {
        message.success("จองสำเร็จ");
        navigate("/");
      }
    } catch (err: any) {
      message.error(err.response?.data?.error || "เกิดข้อผิดพลาดในการจอง");
    }
  };

  if (!cabinet) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p>ไม่พบข้อมูลสถานีที่เลือก</p>
      </div>
    );
  }

  /* =========================
     UI
     ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col w-full overflow-x-hidden">
      <HeaderBar title="จองตู้ชาร์จไฟฟ้า" onBack={() => navigate(-1)} />

      <div className="flex justify-center mt-4 px-4 w-full">
        <Card className="w-full max-w-md md:max-w-3xl rounded-2xl shadow-lg border border-blue-100 bg-white">
          <img
            src={`${apiUrlPicture}${cabinet.Image}`}
            alt={cabinet.Name}
            className="h-36 w-full object-cover rounded-xl"
          />
          <div className="mt-3 px-2 md:px-4">
            <h2 className="text-lg md:text-xl font-semibold text-blue-800 mb-1">
              {cabinet.Name}
            </h2>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              <FaMapMarkerAlt className="text-blue-500" />
              {cabinet.Location}
            </p>
            {cabinet.Description && (
              <p className="text-gray-500 text-sm mt-1 leading-snug">
                {cabinet.Description}
              </p>
            )}

            <Divider />

            <DatePicker
              locale={locale}
              format="YYYY-MM-DD"
              className="w-full"
              onChange={handleDateChange}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />

            {alreadyBookedToday && (
              <Alert
                className="mt-3"
                message="คุณได้ทำการจองในวันนี้แล้ว"
                type="warning"
                showIcon
              />
            )}

            <Divider />

            {/* 🔹 การจองในวันนั้น */}
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mb-4">
              <h3 className="text-blue-700 font-semibold mb-2 text-sm md:text-base flex items-center gap-2">
                <FaUserCircle /> การจองในวันที่{" "}
                {selectedDate?.format("YYYY-MM-DD") || "—"}
              </h3>

              {loading ? (
                <div className="flex justify-center py-4">
                  <Spin />
                </div>
              ) : bookings.length > 0 ? (
                bookings.map((b, i) => (
                  <div
                    key={i}
                    className="flex justify-between bg-white p-2 rounded-lg border border-blue-100 mb-2"
                  >
                    <span className="text-gray-700 text-sm">
                      {dayjs(b.StartDate).format("HH:mm")} -{" "}
                      {dayjs(b.EndDate).format("HH:mm")}
                    </span>
                    <Tag color={b.UserID === userID ? "gold" : "blue"}>
                      {b.User?.FirstName || "ไม่ระบุ"}
                    </Tag>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center text-sm">
                  ยังไม่มีการจองในวันนี้
                </p>
              )}
            </div>

            {/* 🔹 แสดงช่วงเวลาคงที่ */}
            {!alreadyBookedToday && selectedDate && (
              <>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableSlots.map((slot, i) => (
                      <Button
                        key={i}
                        block
                        type={
                          selectedSlot?.label === slot.label
                            ? "primary"
                            : "default"
                        }
                        className={`rounded-lg transition-all ${
                          selectedSlot?.label === slot.label
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.label}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Alert
                    className="mt-3"
                    message="ไม่มีช่วงเวลาให้เลือก เนื่องจากถูกจองเต็มแล้ว"
                    type="info"
                    showIcon
                  />
                )}

                <Button
                  type="primary"
                  className="w-full mt-5 bg-blue-600 hover:bg-blue-700 rounded-xl"
                  onClick={handleBooking}
                  disabled={!selectedSlot}
                >
                  ยืนยันการจอง
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      <footer className="mt-6 text-[10px] text-gray-400 text-center pb-4">
        ⚡ EV Smart Charging App © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default BookingDate;
