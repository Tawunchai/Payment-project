import "./new.css";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SlideUp } from "./animation";
import { ListNews } from "../../../services/index";
import { NewsInterface } from "../../../interface/INews";

const New = () => {
  const [newsList, setNewsList] = useState<NewsInterface[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const res = await ListNews();
      if (res) {
        setNewsList(res);
      }
    };

    fetchNews();
  }, []);

  return (
    <>
      <h1 className="text-xl lg:text-2xl font-semibold capitalize flex justify-center pb-8">
        Announcement
      </h1>
      <div className="bg-white flex justify-center ml-8 mr-8">
        <div className="container space-y-6">
          {newsList.map((item, index) => (
            <div
              key={item.ID}
              className="grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center"
            >
              <div
                className={`flex justify-center items-center w-full ${index % 2 !== 0 ? "md:order-last" : ""
                  }`}
              >
                <motion.img
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                  src={`http://localhost:8000/${item.Picture}`}
                  alt=""
                  className="image h-full object-cover w-[400px] rounded-xl shadow-md"
                />
              </div>

              <div
                className={`tag flex flex-col justify-center space-y-4 lg:max-w-[500px] ${index % 2 !== 0
                    ? "text-right md:text-right"
                    : "text-left md:text-left"
                  }`}
              >
                <motion.p
                  variants={SlideUp(0.5)}
                  initial="hidden"
                  whileInView={"visible"}
                  className="text-sm text-orange-600 font-semibold uppercase"
                >
                  Announcement
                </motion.p>
                <motion.p
                  variants={SlideUp(0.7)}
                  initial="hidden"
                  whileInView={"visible"}
                  className="title text-xl lg:text-2xl font-bold capitalize"
                >
                  {item.Title}
                </motion.p>
                <motion.p
                  variants={SlideUp(0.9)}
                  initial="hidden"
                  whileInView={"visible"}
                  className="subtitle text-sm text-slate-600"
                >
                  {item.Description}
                </motion.p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default New;
