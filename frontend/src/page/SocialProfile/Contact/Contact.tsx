import { Card, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { RiMailLine, RiPagesLine, RiPhoneLine } from "react-icons/ri";

const { Text, Link } = Typography;

const Contact = () => {
  const { t } = useTranslation();

  return (
    <Card
      title={t("widgets.title.contact")}
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
            <Link href="mailto:kiley.brown@example.com" target="_blank">
              kiley.brown@example.com
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
            <Link href="tel:+1-987 (454) 987" target="_blank">
              +1-987 (454) 987
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
export { Contact };
