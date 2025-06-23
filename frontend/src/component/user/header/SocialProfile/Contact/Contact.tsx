import { Card, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiMailLine, RiPagesLine, RiPhoneLine } from "react-icons/ri";
import { getUserByID } from "../../../../../services"; // import service ที่สร้าง

const { Text, Link } = Typography;

const Contact = () => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [userid, setUserid] = useState<number>(
    Number(localStorage.getItem("userid")) || 0
  );

  useEffect(() => {
    setUserid(Number(localStorage.getItem("userid")));
    const fetchEmployeeData = async () => {
      const id = userid;
      const users = await getUserByID(id);
      console.log(users)
      if (users) {
        setPhone(users.PhoneNumber || "");
        setEmail(users.Email || "");
      }
    };

    fetchEmployeeData();
  }, []);

  return (
    <Card
      title={t("Contact")}
      classNames={{ body: "pt-2", header: "border-0" }}
      bordered={false}
    >
      <div className="flex flex-col gap-9">
        <div className="flex">
          <span className="text-2xl text-primary mr-3">
            <RiMailLine />
          </span>
          <div className="flex-1">
            <Text type="secondary" className="text-xs block">
              Email
            </Text>
            <Link href={`mailto:${email}`} target="_blank">
              {email || "-"}
            </Link>
          </div>
        </div>

        {/* Web Page Section */}
        <div className="flex">
          <span className="text-2xl text-primary mr-3">
            <RiPagesLine />
          </span>
          <div className="flex-1">
            <Text type="secondary" className="text-xs block">
              Web page
            </Text>
            <Link href="#" target="_blank">
              example.com
            </Link>
          </div>
        </div>

        {/* Phone Section */}
        <div className="flex">
          <span className="mr-3 text-2xl text-primary">
            <RiPhoneLine />
          </span>
          <div className="flex-1">
            <Text type="secondary" className="text-xs block">
              Phone
            </Text>
            <Link href={`tel:${phone}`} target="_blank">
              {phone || "-"}
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
export { Contact };
