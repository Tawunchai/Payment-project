import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Image, List, Space, Tag, theme, Typography } from "antd";
import { RiCalendar2Line, RiMapPin2Line } from "react-icons/ri";
import { Events } from "../data";

const { useToken } = theme;

const EventItem = ({ data }: { data: Events }) => {
  const { token } = useToken();
  return (
    <List.Item
      extra={
        <Image
          src={data.image}
          alt="image"
          className="w-full h-auto rounded-xl md:w-[150px] md:aspect-[4/2.65] object-cover"
          preview={false}
        />
      }
    >
      <div className="md:flex md:min-h-full">
        <Space direction="vertical">
          <Tag color={token.colorSuccess} className="mt-1">
            {data.name}
          </Tag>
          <div>
            <div className="font-normal text-xl mb-1">{data.title}</div>
            <Typography.Text type={"secondary"} className="flex items-center">
              <RiMapPin2Line className="mr-2 " />
              {data.location}
            </Typography.Text>
          </div>
        </Space>
        <div
          style={{ color: token.colorPrimary }}
          className="ml-auto text-right flex justify-between md:flex-col md:mt-0"
        >
          <div className="flex items-center align-middle text-base font-normal leading-5">
            <RiCalendar2Line className="mr-2" />
            {data.date}
          </div>
          <Button type={"link"} size={"small"}>
            Check in detail
            <ArrowRightOutlined />
          </Button>
        </div>
      </div>
    </List.Item>
  );
};

export { EventItem };
