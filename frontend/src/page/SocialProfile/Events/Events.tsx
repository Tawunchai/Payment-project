import { Card, List, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { events } from "./data";
import { EventItem } from "./EventItem/EventItem";

const Events = () => {
  const { t } = useTranslation();
  return (
    <Card
      classNames={{ body: "pt-0 px-0", header: "border-0 py-5" }}
      bordered={false}
      title={
        <>
          <div>{t("widgets.title.events")}</div>
          <Typography.Text type="secondary" className="text-xs leading-6">
            What Kiley is up-to
          </Typography.Text>
        </>
      }
    >
      <div className="h-96 overflow-y-auto">
        <List
          size="large"
          itemLayout="vertical"
          dataSource={events}
          renderItem={(event) => <EventItem data={event} />}
          className="max-md:[&_.ant-list-item]:flex-col [&_.ant-list-items]:-my-3 [&_.ant-list-item]:gap-6 [&_.ant-list-item-main]:order-2 [&_.ant-list-item-extra]:ms-0"
        />
      </div>
    </Card>
  );
};

export { Events };
