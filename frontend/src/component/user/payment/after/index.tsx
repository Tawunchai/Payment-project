import { useEffect, useMemo, useState } from "react";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ListGetStarted, apiUrlPicture } from "../../../../services";
import { Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import {GetstartedInterface} from "../../../../interface/IGetstarted"

const GettingStarted = () => {
  const [data, setData] = useState<GetstartedInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ListGetStarted();
        if (res) setData(res);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasData = data.length > 0;

  const settings: Settings = useMemo(() => {
    const n = data.length;
    const baseShow = Math.min(3, n || 1);
    const showMd = Math.min(2, n || 1);
    const showSm = Math.min(1, n || 1);

    return {
      dots: true,
      arrows: false,
      infinite: n > baseShow,
      speed: 500,
      slidesToScroll: 1,
      autoplay: n > 1,
      autoplaySpeed: 3000,
      cssEase: "ease",
      pauseOnHover: true,
      slidesToShow: baseShow,
      responsive: [
        {
          breakpoint: 1024,
          settings: { slidesToShow: showMd, slidesToScroll: 1, infinite: n > showMd },
        },
        {
          breakpoint: 640,
          settings: { slidesToShow: showSm, slidesToScroll: 1, infinite: n > showSm },
        },
      ],
    };
  }, [data.length]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-500">
        ยังไม่มีข้อมูลคู่มือการใช้งาน
      </div>
    );
  }

  return (
    <section className="relative w-full bg-white py-10">
      <div className="mx-auto max-w-screen-lg px-4">
        {/* Header Title */}
        <div className="mx-auto mb-8 text-center">
          <h2 className="text-[22px] font-bold text-blue-800">
            คู่มือการใช้งานสถานีชาร์จ EV
          </h2>
        </div>

        {/* Slider */}
        <Slider {...settings}>
          {data.map((item, idx) => {
            const imageSrc = item.Picture
              ? `${apiUrlPicture}${item.Picture}`
              : "https://via.placeholder.com/600x400?text=EV+Guide";

            return (
              <div key={item.ID ?? idx} className="px-3">
                <article
                  className="
                    group relative flex flex-col justify-between
                    overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md
                    transition-transform hover:-translate-y-1 hover:shadow-lg
                    min-h-[500px]
                  "
                >
                  {/* รูปขนาดเท่ากันทุก card */}
                  <div className="w-full h-72 md:h-72 overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={item.Title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* ข้อความด้านล่าง */}
                  <div className="p-5 text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">
                        {item.Title}
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                        {item.Description}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </Slider>

        {/* ปุ่ม Skip - ขวาล่างพอดี */}
        <div className="fixed right-8 bottom-8 z-50">
          <Button
            type="primary"
            shape="round"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-4 text-base"
            onClick={() => navigate("/user/charging")}
          >
            ข้าม
          </Button>
        </div>
      </div>

      {/* Custom Dots */}
      <style>{`
        .slick-dots { bottom: -28px; }
        .slick-dots li { margin: 0 5px; }
        .slick-dots li button:before {
          font-size: 8px;
          color: #cbd5e1;
          opacity: 1;
        }
        .slick-dots li.slick-active button:before {
          color: #2563eb;
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default GettingStarted;
