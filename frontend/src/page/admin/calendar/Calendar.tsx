import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DatePicker, TimePicker, Select, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  ListBooking,
  ListCabinetsEV,
  UpdateBookingByID,
  DeleteBookingByID,
} from "../../../services";
import type { UpdateBookingPayload } from "../../../services";
import {
  FaCalendarAlt,
  FaClock,
  FaPlug,
  FaTimes,
  FaUser,
} from "react-icons/fa";

// ---------- Interfaces ----------
interface Cabinet {
  ID: number;
  Name: string;
  Location: string;
}
interface BookingEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  cabinetID: number;
  location: string;
  description?: string;
  userFirstName?: string;
  userLastName?: string;
}

// ---------- Component ----------
const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [selectedCabinet, setSelectedCabinet] = useState<number | null>(null);

  // ---------- Load Data ----------
  const fetchCabinets = async () => {
    const res = await ListCabinetsEV();
    if (Array.isArray(res)) setCabinets(res);
  };

  const fetchBookings = async () => {
    const data = await ListBooking();
    if (Array.isArray(data)) {
      setEvents(
        data.map((b: any) => ({
          id: b.ID.toString(),
          title: `${b.User?.Username || "User"} – ${
            b.EVCabinet?.Name || "Cabinet"
          }`,
          start: b.StartDate,
          end: b.EndDate,
          cabinetID: b.EVCabinet?.ID || b.EVCabinetID,
          location: b.EVCabinet?.Location || "",
          description: b.EVCabinet?.Description || "",
          userFirstName: b.User?.FirstName,
          userLastName: b.User?.LastName,
        }))
      );
    }
  };

  useEffect(() => {
    fetchCabinets();
    fetchBookings();
  }, []);

  // ---------- Event Click ----------
  const handleEventClick = (clickInfo: any) => {
    const ev = events.find((e) => e.id === clickInfo.event.id);
    if (!ev) return;
    setSelectedEvent(ev);
    setSelectedDate(dayjs(ev.start));
    setStartTime(dayjs(ev.start));
    setEndTime(dayjs(ev.end));
    setSelectedCabinet(ev.cabinetID);
    setOpenModal(true);
  };

  // ---------- Update ----------
  const handleUpdate = async () => {
  if (!selectedEvent || !selectedDate || !startTime || !endTime || !selectedCabinet)
    return message.error("กรุณากรอกข้อมูลให้ครบ");

  // ✅ รวมวันที่กับเวลาให้เป็น datetime เดียวกัน
  const start = selectedDate
    .set("hour", startTime.hour())
    .set("minute", startTime.minute())
    .set("second", 0);

  const end = selectedDate
    .set("hour", endTime.hour())
    .set("minute", endTime.minute())
    .set("second", 0);

  const body: UpdateBookingPayload = {
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    ev_cabinet_id: selectedCabinet,
  };

  try {
    await UpdateBookingByID(Number(selectedEvent.id), body);
    message.success("อัปเดตสำเร็จ");
    setOpenModal(false);
    await fetchBookings();
  } catch {
    message.error("ไม่สามารถอัปเดตข้อมูลได้");
  }
};


  // ---------- Delete ----------
  const handleDelete = async () => {
    if (!selectedEvent) return;
    await DeleteBookingByID(Number(selectedEvent.id));
    message.success("ลบข้อมูลเรียบร้อย");
    setOpenModal(false);
    await fetchBookings();
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#eaf2ff_0%,#f6f9ff_60%,#ffffff_100%)] mt-14 md:mt-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-semibold tracking-wide">
            EV Booking Calendar
          </h1>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="m-2 md:m-10 mt-6 p-2 md:p-10 bg-gradient-to-b from-white to-blue-50 rounded-3xl shadow-sm">
        {/* ----------- FullCalendar Styles ----------- */}
        <style>{`
          .fc {
            font-family: 'Poppins', sans-serif;
            background: #f9fbff;
            border-radius: 12px;
            padding: 5px;
          }
          .fc-toolbar-title {
            color: #1E40AF;
            font-weight: 600;
            font-size: 1.2rem;
          }
          .fc-button-primary {
            background-color: #1D4ED8 !important;
            border: none !important;
            border-radius: 6px !important;
            text-transform: capitalize !important;
            padding: 4px 10px !important;
            font-size: 0.85rem !important;
          }
          .fc-button-primary:hover {
            background-color: #2563EB !important;
          }
          .fc-day-today {
            background-color: #E0F2FE !important;
            border-radius: 8px;
          }
          .fc-event {
            background: linear-gradient(90deg, #2563EB, #1E3A8A) !important;
            border: none !important;
            border-radius: 8px !important;
            color: #fff !important;
            font-size: 0.8rem !important;
            padding: 3px 5px !important;
            margin: 2px !important;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(37,99,235,0.2);
          }
          .fc-col-header-cell {
            background: #F0F7FF !important;
            color: #1E3A8A !important;
            font-weight: 600;
            border-bottom: 1px solid #BFDBFE !important;
            padding: 6px 0 !important;
          }
          .fc .fc-toolbar.fc-header-toolbar {
            margin-bottom: 0.5rem !important;
            flex-wrap: wrap !important;
            gap: 5px !important;
            justify-content: center !important;
          }
          @media (max-width: 640px) {
            .fc-toolbar-title {
              font-size: 1rem !important;
            }
            .fc-button-primary {
              font-size: 0.75rem !important;
              padding: 2px 8px !important;
            }
            .fc-event {
              font-size: 0.7rem !important;
              padding: 2px 3px !important;
            }
          }
        `}</style>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
        />
      </div>

      {/* ----------- Modal ----------- */}
      {openModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ev-scope">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenModal(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-blue-100 w-[95%] sm:w-[90%] md:w-[500px] overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="px-4 py-3 bg-blue-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaCalendarAlt />
                <h2 className="text-base md:text-lg font-semibold">
                  แก้ไขข้อมูลการจอง
                </h2>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-4 bg-blue-50/40 flex flex-col gap-4">
              {/* ผู้จอง */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaUser className="text-blue-500" /> ผู้จอง
                </span>
                <div className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-gray-700 font-medium text-sm">
                  {selectedEvent.userFirstName
                    ? `${selectedEvent.userFirstName} ${selectedEvent.userLastName || ""}`
                    : "ไม่พบข้อมูลผู้จอง"}
                </div>
              </div>

              {/* Cabinet */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaPlug className="text-blue-500" /> ตู้ชาร์จ (Cabinet)
                </span>
                <Select
                  className="ev-select w-full"
                  size="large"
                  value={selectedCabinet ?? undefined}
                  onChange={setSelectedCabinet}
                  options={cabinets.map((c) => ({
                    label: `${c.Name} (${c.Location})`,
                    value: c.ID,
                  }))}
                />
              </label>

              {/* Date */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-600 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" /> วันที่
                </span>
                <DatePicker
                  className="ev-input w-full"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  format="DD MMM YYYY"
                />
              </label>

              {/* Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-600 flex items-center gap-2">
                    <FaClock className="text-blue-500" /> เวลาเริ่ม
                  </span>
                  <TimePicker
                    className="ev-input w-full"
                    value={startTime}
                    onChange={setStartTime}
                    format="HH:mm"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-600 flex items-center gap-2">
                    <FaClock className="text-blue-500" /> เวลาสิ้นสุด
                  </span>
                  <TimePicker
                    className="ev-input w-full"
                    value={endTime}
                    onChange={setEndTime}
                    format="HH:mm"
                  />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-white border-t border-blue-100 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                onClick={() => setOpenModal(false)}
                className="w-full sm:w-auto px-4 h-10 rounded-xl border border-blue-200 bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                className="w-full sm:w-auto px-4 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
              >
                ลบ
              </button>
              <button
                onClick={handleUpdate}
                className="w-full sm:w-auto px-4 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
