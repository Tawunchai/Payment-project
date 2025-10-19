import React, { useEffect, useState } from "react";
import { Card, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { RiMailLine, RiPagesLine, RiPhoneLine } from "react-icons/ri";
import { getUserByID } from "../../../../../services";

const { Text, Link } = Typography;

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const uid = Number(localStorage.getItem("userid")) || 0;
    const fetch = async () => {
      const users = await getUserByID(uid);
      if (users) {
        setPhone(users.PhoneNumber || "");
        setEmail(users.Email || "");
      }
    };
    fetch();
  }, []);

  return (
    <Card
      title={<span className="text-gray-900 text-sm font-bold">{t("Contact")}</span>}
      className="mt-4 rounded-2xl shadow-sm border border-gray-100"
      classNames={{
        body: "pt-2",
        header: "border-0 bg-white rounded-t-2xl",
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
            <Link href={`mailto:${email}`} target="_blank" className="text-sm">
              {email || "-"}
            </Link>
          </div>
        </div>

        {/* Web Page */}
        <div className="flex items-start gap-3">
          <span className="text-xl text-blue-600 mt-0.5">
            <RiPagesLine />
          </span>
          <div className="flex-1 min-w-0">
            <Text type="secondary" className="text-[12px] block">
              Web page
            </Text>
            <Link href="#" target="_blank" className="text-sm">
              example.com
            </Link>
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
            <Link href={`tel:${phone}`} target="_blank" className="text-sm">
              {phone || "-"}
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export { Contact };
