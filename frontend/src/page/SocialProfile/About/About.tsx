import React, { useEffect, useState } from "react";
import { Card, theme, Typography, Button, message } from "antd";
import { useTranslation } from "react-i18next";
import {
  FaUserGraduate,
  FaBriefcase,
  FaFileAlt,
  FaDollarSign,
  FaEdit,
} from "react-icons/fa";
import { getEmployeeByID } from "../../../services";
import { EmployeeInterface } from "../../../interface/IEmployee";
import { getCurrentUser, initUserProfile } from "../../../services/httpLogin";
import EditEmployeeModal from "../../../component/admin/profile"; // ✅ ใช้ modal เดิมของคุณ

const { Text } = Typography;
const { useToken } = theme;

export const About: React.FC = () => {
  const { token } = useToken();
  const { t } = useTranslation();

  const [employeeData, setEmployeeData] = useState<EmployeeInterface | null>(
    null
  );
  const [openModal, setOpenModal] = useState(false);

  // ✅ ดึงข้อมูลพนักงานจาก token (employee_id)
  const fetchEmployee = async () => {
    try {
      await initUserProfile(); // เตรียม user profile จาก token
      const currentUser = getCurrentUser();

      if (!currentUser || !currentUser.employee_id) {
        message.warning("ไม่พบรหัสพนักงาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        return;
      }

      // ✅ ดึงข้อมูลพนักงานจาก backend โดยใช้ employee_id
      const data = await getEmployeeByID(currentUser.employee_id);
      if (data) {
        setEmployeeData(data);
      } else {
        message.error("ไม่พบข้อมูลพนักงานในระบบ");
      }
    } catch (error) {
      console.error("❌ Error fetching employee data:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน");
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  // ✅ สร้างข้อมูล About (education, experience, bio, salary)
  const aboutsData =
    employeeData
      ? [
          {
            icon: FaUserGraduate,
            title: t("Education"),
            desc: employeeData.Education || "-",
          },
          {
            icon: FaBriefcase,
            title: t("Experience"),
            desc: employeeData.Experience || "-",
          },
          {
            icon: FaFileAlt,
            title: t("Bio"),
            desc: employeeData.Bio || "-",
          },
          {
            icon: FaDollarSign,
            title: t("Salary"),
            desc: (employeeData.Salary ?? 0).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            }),
          },
        ]
      : [];

  return (
    <>
      <Card
        bordered={false}
        className="rounded-2xl border border-blue-100/70 bg-white/90 backdrop-blur shadow-[0_8px_30px_rgba(37,99,235,0.06)]"
        classNames={{ header: "pt-2" }}
        title={
          <div className="flex items-center justify-between">
            <span className="text-blue-900">{t("About Me")}</span>
            <Button
              size="small"
              icon={<FaEdit />}
              onClick={() => setOpenModal(true)}
              className="!text-white !border-0"
              style={{
                background: "linear-gradient(to right, #2563eb, #1d4ed8)",
                height: 30,
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 12,
              }}
            >
              {t("เเก้ไขประวัติส่วนตัว")}
            </Button>
          </div>
        }
        styles={{ header: { color: token.colorTextHeading } }}
      >
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          {aboutsData.length === 0 ? (
            <Text>{t("Loading...")}</Text>
          ) : (
            aboutsData.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  className="col-span-12 sm:col-span-6 xl:col-span-4"
                  key={idx}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600">
                      <Icon className="text-[26px]" />
                    </span>
                    <div className="flex-1">
                      <Typography.Text type="secondary" className="text-xs">
                        {item.title}
                      </Typography.Text>
                      <Typography.Paragraph className="text-sm mt-1 mb-0 text-gray-800">
                        {item.desc}
                      </Typography.Paragraph>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* ✅ Modal แก้ไขข้อมูลพนักงาน */}
      {employeeData && (
        <EditEmployeeModal
          show={openModal}
          onClose={() => setOpenModal(false)}
          onSaveSuccess={() => fetchEmployee()}
          initialData={employeeData}
        />
      )}
    </>
  );
};