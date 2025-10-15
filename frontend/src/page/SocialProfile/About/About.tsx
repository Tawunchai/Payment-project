import React, { useEffect, useState } from "react";
import { Card, theme, Typography, Button } from "antd";
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
import EditEmployeeModal from "../../../component/admin/profile"; // ✅ ใช้ modal ที่ path นี้

const { Text } = Typography;
const { useToken } = theme;

const About: React.FC = () => {
  const { token } = useToken();
  const { t } = useTranslation();

  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const [employeeData, setEmployeeData] = useState<EmployeeInterface | null>(
    null
  );
  const [openModal, setOpenModal] = useState(false);

  // โหลดข้อมูลพนักงานจาก backend
  const fetchEmployee = async () => {
    const data = await getEmployeeByID(employeeid);
    if (data) setEmployeeData(data);
  };

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    fetchEmployee();
  }, []);

  const aboutsData = employeeData
    ? [
        {
          icon: FaUserGraduate,
          title: t("Education"),
          desc: employeeData.Education,
        },
        {
          icon: FaBriefcase,
          title: t("Experience"),
          desc: employeeData.Experience,
        },
        {
          icon: FaFileAlt,
          title: t("Bio"),
          desc: employeeData.Bio,
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
        classNames={{
          header: "pt-0 flex flex-row font-normal",
        }}
        className="mb-8"
        title={
          <div className="flex items-center justify-between">
            <span>{t("About Me")}</span>

            {/* 🟧 ปุ่มแก้ไขประวัติ */}
            <Button
              type="primary"
              size="small"
              icon={<FaEdit />}
              onClick={() => setOpenModal(true)}
              style={{
                background: "linear-gradient(to right, #f97316, #f59e0b)",
                border: "none",
                fontWeight: 500,
                color: "#fff",
                transition: "all 0.3s ease",
                height:"30px",
                fontSize:"14px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "linear-gradient(to right, #fb923c, #fbbf24)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "linear-gradient(to right, #f97316, #f59e0b)";
              }}
            >
              {t("เเก้ไขประวัติส่วนตัว")}
            </Button>
          </div>
        }
        styles={{ header: { color: token.colorTextHeading } }}
      >
        <div className="grid grid-cols-12 gap-8">
          {aboutsData.length === 0 ? (
            <Text>{t("Loading...")}</Text>
          ) : (
            aboutsData.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <div
                  className="col-span-12 sm:col-span-6 xl:col-span-4"
                  key={index}
                >
                  <div className="flex items-center">
                    <Text type="warning">
                      <ItemIcon className="text-[28px]" />
                    </Text>
                    <div className="flex-1 pl-4">
                      <Typography.Text type={"secondary"} className="text-xs">
                        {item.title}
                      </Typography.Text>
                      <div>
                        {item.desc && (
                          <Typography.Paragraph className="text-sm">
                            {item.desc}
                          </Typography.Paragraph>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* 🟣 Modal แก้ไขข้อมูลพนักงาน */}
      {employeeData && (
        <EditEmployeeModal
          show={openModal}
          onClose={() => setOpenModal(false)}
          onSaveSuccess={() => {
            fetchEmployee(); // โหลดข้อมูลใหม่หลังบันทึก
          }}
          initialData={employeeData}
        />
      )}
    </>
  );
};

export { About };
