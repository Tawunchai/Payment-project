import "./new.css";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SlideUp } from "./animation";
import { ListNews, apiUrlPicture } from "../../../services";
import { NewsInterface } from "../../../interface/INews";

const New = () => {
  const [newsList, setNewsList] = useState<NewsInterface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await ListNews();
        if (res) setNewsList(res);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <>
      {/* Title */}
      <div className="mx-auto max-w-screen-lg px-4 pt-6 pb-3 text-center">
        <h1 className="text-[20px] md:text-[22px] font-bold tracking-tight text-blue-800">
          ข่าวสาร & ประกาศ
        </h1>
        <p className="mt-1 text-[12px] text-blue-900/60">
          อัปเดตเรื่องราว EV ล่าสุดสำหรับคุณ
        </p>
      </div>

      {/* BG gradient ฟ้าอ่อน */}
      <section>
        <div className="mx-auto max-w-screen-lg px-4 pb-10">
          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-blue-100 bg-white p-3 md:p-4 shadow-[0_8px_28px_rgba(37,99,235,0.06)]">
                  <div className="aspect-[16/9] rounded-xl bg-blue-50 animate-pulse" />
                  <div className="mt-3 h-4 w-2/3 rounded bg-blue-50 animate-pulse" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-blue-50 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* List */}
          {!loading && newsList.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500">
              ยังไม่มีข่าวสารในขณะนี้
            </div>
          )}

          <div className="space-y-6">
            {newsList.map((item, index) => {
              const isOdd = index % 2 !== 0;
              return (
                <article
                  key={item.ID}
                  className={`
                    grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6
                    items-center
                    rounded-2xl border border-blue-100 bg-white
                    shadow-[0_8px_28px_rgba(37,99,235,0.06)]
                    p-3 md:p-4
                  `}
                >
                  {/* รูปภาพ 16:9 + badge + top accent */}
                  <motion.div
                    variants={SlideUp(0.2)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className={`${isOdd ? "md:order-2" : ""}`}
                  >
                    <div className="relative overflow-hidden rounded-xl">
                      {/* เส้นเน้นหัวการ์ด */}
                      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 z-10" />
                      <img
                        src={`${apiUrlPicture}${item.Picture}`}
                        alt={item.Title}
                        className="aspect-[16/9] w-full object-cover"
                        loading="lazy"
                      />
                      {/* Badge */}
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200">
                        EV NEWS
                      </span>
                    </div>
                  </motion.div>

                  {/* เนื้อหา */}
                  <motion.div
                    variants={SlideUp(0.35)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className={`${isOdd ? "md:order-1 md:text-right" : ""}`}
                  >
                    <p className="text-[12px] font-semibold uppercase text-blue-600">
                      Announcement
                    </p>
                    <h3 className="mt-1 text-[18px] md:text-[20px] font-bold leading-snug text-gray-900">
                      {item.Title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-6 text-gray-700">
                      {item.Description}
                    </p>
                  </motion.div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default New;
