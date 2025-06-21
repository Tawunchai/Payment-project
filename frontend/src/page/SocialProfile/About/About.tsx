import { Avatar, Card, theme, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { aboutsData, tabs } from "./data";

const { Text } = Typography;
const { useToken } = theme;

const About = () => {
  const { token } = useToken();
  const { t } = useTranslation();
  return (
    <Card
      bordered={false}
      classNames={{
        header: "pt-0 flex flex-row font-normal",
      }}
      className="mb-8"
      title={t("widgets.title.about")}
      tabList={tabs}
      styles={{ header: { color: token.colorTextHeading } }}
    >
      <div className="grid grid-cols-12 gap-8">
        {aboutsData?.map((item, index) => {
          const ItemIcon = item.icon;
          return (
            <div
              className="col-span-12 sm:col-span-6 xl:col-span-4"
              key={index}
            >
              <div className="flex">
                <Text type="warning">
                  <ItemIcon className="text-[44px]" />
                </Text>
                <div className="flex-1 self-center pl-4">
                  <Typography.Text type={"secondary"} className="text-xs">
                    {item.title}
                  </Typography.Text>
                  <div>
                    {item.desc && (
                      <Typography.Paragraph className="text-sm">
                        {item.desc}
                      </Typography.Paragraph>
                    )}
                    {item.usersList.length > 0 ? (
                      <Avatar.Group max={{ count: 3 }} size={30}>
                        {item.usersList.map((user, index) => (
                          <Avatar key={index} src={user.profilePic} />
                        ))}
                      </Avatar.Group>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export { About };
