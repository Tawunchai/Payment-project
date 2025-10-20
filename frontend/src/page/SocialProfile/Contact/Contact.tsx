import React, { useEffect, useState } from "react";
import { Card, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { RiMailLine, RiPagesLine, RiPhoneLine } from "react-icons/ri";
import { getEmployeeByID } from "../../../services";

const { Text, Link } = Typography;

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");//@ts-ignore
  const [web, setWeb] = useState<string>("example.com");

  useEffect(() => {
    const employeeid = Number(localStorage.getItem("employeeid")) || 0;
    const fetchEmployeeData = async () => {
      try {
        if (!employeeid) return;
        const employee = await getEmployeeByID(employeeid);
        if (employee) {
          setPhone(employee.User?.PhoneNumber || "");
          setEmail(employee.User?.Email || "");
        }
      } catch {}
    };
    fetchEmployeeData();
  }, []);

  return (
    <Card
      title={<span className="text-blue-900">{t("Contact")}</span>}
      bordered={false}
      className="rounded-2xl border border-blue-100/70 bg-white/90 backdrop-blur shadow-[0_8px_30px_rgba(37,99,235,0.06)]"
      classNames={{ body: "pt-2", header: "border-0" }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex">
          <span className="text-2xl text-blue-600 mr-3"><RiMailLine /></span>
          <div className="flex-1">
            <Text type="secondary" className="text-xs block">Email</Text>
            <Link href={`mailto:${email}`} target="_blank">{email || "-"}</Link>
          </div>
        </div>

        <div className="flex">
          <span className="text-2xl text-blue-600 mr-3"><RiPagesLine /></span>
          <div className="flex-1">
            <Text type="secondary" className="text-xs block">Web page</Text>
            <Link href={web.startsWith("http") ? web : `https://${web}`} target="_blank">
              {web}
            </Link>
          </div>
        </div>

        <div className="flex">
          <span className="text-2xl text-blue-600 mr-3"><RiPhoneLine /></span>
          <div className="flex-1">
            <Text type="secondary" className="text-xs block">Phone</Text>
            <Link href={`tel:${phone}`} target="_blank">{phone || "-"}</Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
