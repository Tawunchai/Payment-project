import "./new.css";
import { useEffect, useState } from "react";
import { ListNews, apiUrlPicture } from "../../../services/index";
import { NewsInterface } from "../../../interface/INews";

const NewsCarousel = () => {
  const [newsList, setNewsList] = useState<NewsInterface[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const res = await ListNews();
      if (res) setNewsList(res);
    };
    fetchNews();
  }, []);

  return (
    <section className="w-full bg-white py-6 rounded-xl  mb-8 paddings">
      <div className="flex justify-between items-center px-6 mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          ข่าวสารและกิจกรรม
        </h2>
        <a
          href="#"
          className="text-blue-600 font-medium hover:underline whitespace-nowrap"
        >
          ดูทั้งหมด &gt;
        </a>
      </div>
      <div className="overflow-x-auto no-scrollbar px-4">
        <div className="flex gap-6 snap-x snap-mandatory">
          {newsList.map((item) => (
            <div
              key={item.ID}
              className="snap-center flex-shrink-0 rounded-xl overflow-hidden shadow border border-blue-100 bg-white"
              style={{
                width: 340,
                minHeight: 190,
                maxHeight: 210,
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
            >
              <img
                src={`${apiUrlPicture}${item.Picture}`}
                alt={item.Title}
                className="object-cover w-full h-full aspect-video"
                style={{ maxHeight: 200 }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsCarousel;
