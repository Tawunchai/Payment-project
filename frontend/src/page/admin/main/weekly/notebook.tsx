import { IoIosMore } from 'react-icons/io';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { BsChatLeft } from 'react-icons/bs';
import { SparkLine } from '../../../../component/admin';
import { SparklineAreaData } from '../../../../assets/admin/dummy';
import { useStateContext } from '../../../../contexts/ContextProvider';
import {
  ListPayments,
  ListEVChargingPayments,
  ListReviews,
  UpdateReviewStatusByID,
  DeleteReviewByID,
} from '../../../../services';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Table, Button, Popconfirm, Tooltip, message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, DeleteOutlined } from '@ant-design/icons';

const Index = () => {
  const { currentColor } = useStateContext();

  const [topPayer, setTopPayer] = useState<any>(null);
  const [mostEV, setMostEV] = useState<any>(null);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  const [reviewList, setReviewList] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const [toggleLoading, setToggleLoading] = useState<Record<string | number, boolean>>({});
  const [deleteLoading, setDeleteLoading] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      const payments = await ListPayments();
      const evPayments = await ListEVChargingPayments();
      const reviews = await ListReviews();

      const userTotals: Record<string, number> = {};
      payments?.forEach((p: any) => {
        const name = `${p?.User?.FirstName ?? ''} ${p?.User?.LastName ?? ''}`.trim() || 'Unknown';
        const amount = Number(p?.Amount ?? 0);
        userTotals[name] = (userTotals[name] || 0) + amount;
      });
      const topUser = Object.entries(userTotals).sort((a, b) => b[1] - a[1])[0];
      setTopPayer({ name: topUser?.[0], amount: topUser?.[1] ?? 0 });

      const evTotals: Record<string, number> = {};
      const evIncome: Record<string, number> = {};
      evPayments?.forEach((ev: any) => {
        const name = ev?.EVcharging?.Name ?? 'Unknown EV';
        evTotals[name] = (evTotals[name] || 0) + 1;
        const income = Number(ev?.Price ?? 0);
        evIncome[name] = (evIncome[name] || 0) + income;
      });
      const topEV = Object.entries(evIncome).sort((a, b) => b[1] - a[1])[0]?.[0];
      setMostEV({
        name: topEV,
        count: evTotals[topEV] ?? 0,
        income: evIncome[topEV] ?? 0,
      });

      setTotalReviews(reviews?.length ?? 0);
      setReviewList(reviews ?? []);
    };

    fetchData();
  }, []);

  const handleToggleVisibility = async (record: any) => {
    const id = record?.ID ?? record?.id;
    if (!id) return;
    const nextStatus = !record?.Status;

    try {
      setToggleLoading((s) => ({ ...s, [id]: true }));
      const res = await UpdateReviewStatusByID(id, nextStatus);
      if (!res) throw new Error('Update failed');

      setReviewList((list) =>
        list.map((r) => ((r.ID ?? r.id) === id ? { ...r, Status: nextStatus } : r))
      );
      message.success(nextStatus ? 'เปิดการมองเห็นรีวิวแล้ว' : 'ปิดการมองเห็นรีวิวแล้ว');
    } catch {
      message.error('ไม่สามารถอัปเดตสถานะได้');
    } finally {
      setToggleLoading((s) => ({ ...s, [id]: false }));
    }
  };

  const handleDeleteReview = async (record: any) => {
    const id = record?.ID ?? record?.id;
    if (!id) return;

    try {
      setDeleteLoading((s) => ({ ...s, [id]: true }));
      const ok = await DeleteReviewByID(id);
      if (!ok) throw new Error('Delete failed');

      setReviewList((list) => list.filter((r) => (r.ID ?? r.id) !== id));
      setTotalReviews((n) => Math.max(0, n - 1));
      message.success('ลบรีวิวสำเร็จ');
    } catch {
      message.error('ไม่สามารถลบรีวิวได้');
    } finally {
      setDeleteLoading((s) => ({ ...s, [id]: false }));
    }
  };

  const reviewColumns = useMemo(
    () => [
      {
        title: '#',
        dataIndex: 'index',
        key: 'index',
        width: 60,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: 'User',
        key: 'user',
        render: (_: any, record: any) => {
          const name = `${record?.User?.FirstName ?? ''} ${record?.User?.LastName ?? ''}`.trim();
          const email = record?.User?.Email ?? '';
          return name || email || 'Unknown';
        },
      },
      {
        title: 'Rating',
        dataIndex: 'Rating',
        key: 'rating',
        width: 100,
        render: (val: any) => val ?? '-',
      },
      {
        title: 'Comment',
        dataIndex: 'Comment',
        key: 'comment',
        ellipsis: true,
        render: (val: any) => val ?? '-',
      },
      {
        title: 'Date',
        dataIndex: 'CreatedAt',
        key: 'date',
        width: 200,
        render: (val: any) =>
          val ? new Date(val).toLocaleString() : '-',
      },
      {
        title: 'จัดการ',
        key: 'actions',
        width: 260,
        render: (_: any, record: any) => {
          const id = record?.ID ?? record?.id;
          const isVisible = !!record?.Status;
          const btnStyle = isVisible
            ? { backgroundColor: '#dbeafe', color: '#1e3a8a', borderColor: '#bfdbfe' } // blue tone
            : { backgroundColor: '#e2e8f0', color: '#334155', borderColor: '#cbd5e1' };

          return (
            <div className="flex items-center gap-2">
              <Tooltip title={isVisible ? 'เปิดการมองเห็น' : 'ปิดการมองเห็น'}>
                <Button
                  icon={isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  onClick={() => handleToggleVisibility(record)}
                  loading={!!toggleLoading[id]}
                  style={btnStyle}
                >
                  {isVisible ? 'เปิด' : 'ปิด'}
                </Button>
              </Tooltip>

              <Popconfirm
                title="ลบรีวิวนี้?"
                description="ยืนยันการลบรีวิวนี้ จะไม่สามารถกู้คืนได้"
                okText="ลบ"
                cancelText="ยกเลิก"
                onConfirm={() => handleDeleteReview(record)}
              >
                <Tooltip title="ลบ">
                  <Button danger icon={<DeleteOutlined />} loading={!!deleteLoading[id]}>
                    ลบ
                  </Button>
                </Tooltip>
              </Popconfirm>
            </div>
          );
        },
      },
    ],
    [toggleLoading, deleteLoading]
  );

  const stats = [
    {
      icon: <FiShoppingCart />,
      amount: `฿${topPayer?.amount?.toLocaleString() ?? '-'}`,
      title: 'Top Payer',
      desc: topPayer?.name ?? '-',
      iconBg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      textColor: 'text-blue-700',
    },
    {
      icon: <FiStar />,
      amount: `฿${mostEV?.income?.toLocaleString() ?? '-'}`,
      title: 'Top EV Charger',
      desc: `${mostEV?.name ?? '-'} (${mostEV?.count ?? 0} transections)`,
      iconBg: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
      textColor: 'text-blue-700',
    },
    {
      icon: <BsChatLeft />,
      amount: `${totalReviews} Reviews`,
      title: 'Total Reviews',
      desc: 'Across all users',
      iconBg: 'linear-gradient(135deg, #60a5fa, #2563eb)',
      textColor: 'text-blue-700',
      clickable: true,
    },
  ];

  const handleClickAmount = (item: any) => {
    if (item?.clickable && item?.title === 'Total Reviews') {
      setIsReviewModalOpen(true);
    }
  };

  return (
    <>
      <div className="md:w-200 bg-white border border-blue-100 rounded-2xl p-6 m-3 shadow-sm">
        <div className="flex justify-between">
          <p className="text-xl font-semibold text-blue-800">Weekly Stats</p>
          <button
            type="button"
            className="text-xl font-semibold text-blue-500 hover:text-blue-700"
          >
            <IoIosMore />
          </button>
        </div>

        <div className="mt-8">
          {stats.map((item, index) => (
            <div key={index} className="flex justify-between items-center mt-4 w-full">
              <div className="flex gap-4 items-center">
                <div
                  className="text-2xl text-white rounded-full p-3 shadow-md"
                  style={{ background: item.iconBg }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-md font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
              <p
                className={`cursor-pointer ${item.textColor} font-semibold`}
                onClick={() => handleClickAmount(item)}
                title={item.clickable ? 'View all reviews' : undefined}
              >
                {item.amount}
              </p>
            </div>
          ))}

          <div className="mt-5">
            <SparkLine
              currentColor={currentColor}
              id="area-sparkLine"
              height="160px"
              type="Area"
              data={SparklineAreaData}
              width="320"
              color="rgb(219, 234, 254)"
            />
          </div>
        </div>
      </div>

      <Modal
        title={`All Reviews (${totalReviews})`}
        open={isReviewModalOpen}
        onCancel={() => setIsReviewModalOpen(false)}
        footer={null}
        width={1100}
        destroyOnClose
      >
        <Table
          rowKey={(r: any, idx) => r?.ID ?? r?.id ?? idx}
          dataSource={reviewList}
          columns={reviewColumns as any}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Modal>
    </>
  );
};

export default Index;
