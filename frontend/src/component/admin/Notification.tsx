import { useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { Button } from ".";
import { ListReports, UpdateReportByID, DeleteReportByID } from "../../services/index";
import { ReportInterface } from "../../interface/IReport";
import { Image } from "antd";

const Notification = () => {
  const [reports, setReports] = useState<ReportInterface[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const data = await ListReports();
      if (data) {
        setReports(data);
      }
    };
    fetchReports();
  }, []);

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Pending" ? "Complete" : "Pending";
    const result = await UpdateReportByID(id, newStatus);
    if (result) {
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.ID === id ? { ...report, Status: newStatus } : report
        )
      );
    }
  };

  const handleDelete = async (id: number) => {
    const result = await DeleteReportByID(id);
    if (result) {
      setReports((prevReports) => prevReports.filter((r) => r.ID !== id));
    } else {
      alert("เกิดข้อผิดพลาดในการลบรายงาน");
    }
  };

  return (
    <div className="nav-item absolute right-5 md:right-40 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96">
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <p className="font-semibold text-lg dark:text-gray-200">Report Notifications</p>
          <button
            type="button"
            className="text-white text-xs rounded p-1 px-2 bg-orange-theme"
          >
            {reports.length} New
          </button>
        </div>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
        />
      </div>

      <div
        className="mt-5"
        style={{
          maxHeight: "350px",
          overflowY: "auto",
        }}
      >
        {reports.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-5 border-b-1 border-color p-3"
          >
            <img
              className="rounded-full h-10 w-10 object-cover"
              src={`http://localhost:8000/${item.User?.Profile}`}
              alt={`${item.User?.FirstName} ${item.User?.LastName}`}
            />
            <div className="flex flex-col w-full">
              <p className="font-semibold dark:text-gray-200">
                {item.User?.FirstName} {item.User?.LastName}
              </p>
              {item.Picture && (
                <Image
                  className="rounded-md object-cover"
                  width={40}
                  height={40}
                  src={`http://localhost:8000/${item.Picture}`}
                  alt="Report"
                  preview={true}
                />
              )}
              <p className="text-gray-500 text-sm dark:text-gray-400 mt-1">
                {item.Description}
              </p>

              <div className="flex items-center gap-3 mt-2">
                {/* ปุ่มเปลี่ยน Status */}
                <button
                  onClick={() => handleStatusChange(item.ID!, item.Status!)}
                  className={`text-xs px-2 py-1 rounded font-semibold w-fit ${
                    item.Status === "Pending"
                      ? "bg-yellow-400 text-black"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {item.Status}
                </button>

                {/* ปุ่มลบ กดแล้วลบเลย */}
                <button
                  onClick={() => handleDelete(item.ID!)}
                  title="Delete Report"
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;
