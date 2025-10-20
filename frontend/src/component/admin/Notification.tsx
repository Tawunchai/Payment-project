import { useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { Button } from ".";
import { Image } from "antd";
import {
  ListReports,
  UpdateReportByID,
  DeleteReportByID,
  apiUrlPicture,
} from "../../services";
import { ReportInterface } from "../../interface/IReport";

const Notification: React.FC = () => {
  const [reports, setReports] = useState<ReportInterface[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const data = await ListReports();
      if (data) setReports(data);
    };
    fetchReports();
  }, []);

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Pending" ? "Complete" : "Pending";
    const ok = await UpdateReportByID(id, newStatus);
    if (ok) {
      setReports((prev) =>
        prev.map((r) => (r.ID === id ? { ...r, Status: newStatus } : r))
      );
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await DeleteReportByID(id);
    if (ok) {
      setReports((prev) => prev.filter((r) => r.ID !== id));
    } else {
      alert("เกิดข้อผิดพลาดในการลบรายงาน");
    }
  };

  const avatarFallback =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
        <rect width='100%' height='100%' rx='12' fill='#eef2ff'/>
        <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='#3b82f6' font-family='Arial'>EV</text>
      </svg>`
    );

  const photoFallback =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
        <rect width='100%' height='100%' rx='8' fill='#eff6ff'/>
        <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='#2563eb' font-family='Arial'>No Photo</text>
      </svg>`
    );

  return (
    <div
      className="
        nav-item fixed right-3 top-16 z-50
        w-[calc(100vw-24px)] max-w-sm
        rounded-2xl overflow-hidden
        bg-white/80 backdrop-blur-xl
        border border-blue-100 shadow-[0_12px_36px_rgba(37,99,235,0.18)]
      "
      style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
    >
      {/* Header — EV Blue */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-12" />
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-semibold">Report Notifications</p>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/30">
              {reports.length} New
            </span>
          </div>
          <Button
            icon={<MdOutlineCancel />}
            color="#ffffff"
            bgHoverColor="rgba(255,255,255,0.18)"
            size="2xl"
            borderRadius="50%"
          />
        </div>
      </div>

      {/* List */}
      <div
        className="p-3 space-y-3"
        style={{ maxHeight: 420, overflowY: "auto" }}
      >
        {reports.map((item) => {
          const profileSrc = item.User?.Profile
            ? `${apiUrlPicture}${item.User.Profile}`
            : avatarFallback;

        return (
          <div
            key={item.ID}
            className="
              rounded-xl bg-white/80 border border-blue-100
              p-3 shadow-sm hover:shadow-md transition-shadow
            "
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <img
                src={profileSrc}
                alt={`${item.User?.FirstName || ""} ${item.User?.LastName || ""}`}
                className="h-10 w-10 rounded-lg object-cover ring-1 ring-blue-100 bg-blue-50 flex-shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = avatarFallback;
                }}
              />

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {item.User?.FirstName} {item.User?.LastName}
                </p>

                {/* Photo (optional) */}
                {item.Picture && (
                  <div className="mt-2">
                    <Image
                      width={64}
                      height={64}
                      className="rounded-md object-cover ring-1 ring-blue-100"
                      src={`${apiUrlPicture}${item.Picture}`}
                      alt="Report"
                      fallback={photoFallback}
                      preview={{ mask: "Preview" }}
                    />
                  </div>
                )}

                {/* Description */}
                <p className="mt-2 text-[13px] text-gray-600 whitespace-pre-line">
                  {item.Description}
                </p>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-8">
                  {/* Status toggle */}
                  <button
                    onClick={() => handleStatusChange(item.ID!, item.Status!)}
                    className={`
                      inline-flex items-center h-7 px-3 rounded-full text-[11px] font-semibold
                      border transition
                      ${
                        item.Status === "Pending"
                          ? "bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
                          : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      }
                    `}
                  >
                    {item.Status}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item.ID!)}
                    title="Delete Report"
                    className="
                      inline-flex items-center h-7 px-3 rounded-lg text-[12px] font-semibold
                      border border-red-200 text-red-600 bg-white hover:bg-red-50 active:scale-95 transition
                    "
                  >
                    <FaTrash className="mr-1.5" size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )})}

        {reports.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-10">
            ยังไม่มีการแจ้งรายงานใหม่
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
