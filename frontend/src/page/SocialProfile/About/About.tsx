import { Card, theme, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getEmployeeByID } from "../../../services";
import { FaUserGraduate, FaBriefcase, FaFileAlt, FaDollarSign } from "react-icons/fa";
import { EmployeeInterface } from "../../../interface/IEmployee";

const { Text } = Typography;
const { useToken } = theme;

const About = () => {
  const { token } = useToken();
  const { t } = useTranslation();
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );

  const [employeeData, setEmployeeData] = useState<EmployeeInterface | null>(null);

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    const fetchEmployee = async () => {
      const data = await getEmployeeByID(employeeid);
      setEmployeeData(data);
    };

    fetchEmployee();
  }, []);

  const aboutsData = employeeData
    ? [
        {
          icon: FaUserGraduate,
          title: t("Education"),
          desc: employeeData.Education,
          usersList: [],
        },
        {
          icon: FaBriefcase,
          title: t("Experience"),
          desc: employeeData.Experience,
          usersList: [],
        },
        {
          icon: FaFileAlt,
          title: t("Bio"),
          desc: employeeData.Bio,
          usersList: [],
        },
        {
          icon: FaDollarSign,
          title: t("Salary"),
          desc: (employeeData.Salary ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD" }),
          usersList: [],
        },
      ]
    : [];

  return (
    <Card
      bordered={false}
      classNames={{
        header: "pt-0 flex flex-row font-normal",
      }}
      className="mb-8"
      title={t("About Me")}
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
  );
};

export { About };
