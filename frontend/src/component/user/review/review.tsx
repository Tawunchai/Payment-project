import { useEffect, useMemo, useState } from "react";
import Slider, { Settings } from "react-slick";
import Profile from "../../../assets/profile/people1.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Like from "../../like/like";
import { ReviewInterface } from "../../../interface/IReview";
import { ListReviewsVisible, apiUrlPicture } from "../../../services";

const Review = () => {
  const [reviews, setReviews] = useState<ReviewInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await ListReviewsVisible();
        if (res) setReviews(res);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const hasReviews = reviews.length > 0;

  const settings: Settings = useMemo(() => {
    const n = reviews.length;
    const baseShow = Math.min(3, n || 1);
    const showMd = Math.min(2, n || 1);
    const showSm = Math.min(1, n || 1);

    return {
      dots: true,
      arrows: false,
      infinite: n > baseShow,
      speed: 450,
      slidesToScroll: 1,
      autoplay: n > 1,
      autoplaySpeed: 2600,
      cssEase: "linear",
      pauseOnHover: true,
      pauseOnFocus: true,
      slidesToShow: baseShow,
      responsive: [
        { breakpoint: 1024, settings: { slidesToShow: showMd, slidesToScroll: 1, infinite: n > showMd } },
        { breakpoint: 640,  settings: { slidesToShow: showSm, slidesToScroll: 1, infinite: n > showSm } },
      ],
    };
  }, [reviews.length]);

  if (isLoading) {
    return (
      <section className="flex h-40 items-center justify-center bg-white">
        <p className="text-sm text-gray-500">กำลังโหลดรีวิว...</p>
      </section>
    );
  }

  if (!hasReviews) {
    return (
      <section className="flex h-40 items-center justify-center bg-white">
        <p className="text-sm text-gray-400">ยังไม่มีรีวิวจากผู้ใช้งาน</p>
      </section>
    );
  }

  return (
    <section className="w-full">
      {/* bg: EV minimal (blue gradient subtle) */}
      <div className="">
        <div className="mx-auto max-w-screen-lg px-4 py-10">
          {/* Title row */}
          <div className="mx-auto mb-6 max-w-md text-center">
            <h2 className="text-[22px] font-bold tracking-tight text-blue-800">
              รีวิวจากผู้ใช้งาน
            </h2>
            <p className="mt-1 text-[12px] text-blue-900/60">
              ประสบการณ์ชาร์จที่สะอาด ลื่นไหล และเชื่อถือได้
            </p>
          </div>

          <Slider {...settings}>
            {reviews.map((item, idx) => {
              const imageSrc = item?.User?.Profile
                ? `${apiUrlPicture}${item.User.Profile}`
                : (Profile as unknown as string);

              const rating = Math.max(0, Math.min(5, item.Rating || 0));

              return (
                <div key={item.ID ?? idx} className="px-2 my-6">
                  <article
                    className="
                      group relative flex h-full min-h-[270px] flex-col overflow-hidden
                      rounded-2xl border border-blue-100 bg-white/90 backdrop-blur
                      shadow-[0_8px_30px_rgba(37,99,235,0.08)]
                    "
                  >
                    {/* Top accent line */}
                    <div className="h-[3px] w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />

                    <div className="flex flex-1 flex-col p-5">
                      {/* Header */}
                      <div className="mb-3 flex items-center gap-3">
                        <div className="relative">
                          <span className="absolute inset-0 -z-10 rounded-full bg-blue-200/40 blur-[8px]" />
                          <img
                            src={imageSrc}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-100"
                            alt="user"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = Profile as unknown as string;
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold text-gray-900">
                            {item.User?.FirstName} {item.User?.LastName}
                          </p>
                          {/* Rating chips */}
                          <div className="mt-0.5 flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`h-[18px] rounded-full px-2 text-[10px] leading-[18px] ${
                                  i < rating
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-blue-50 text-blue-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Quote icon subtle */}
                      <div className="pointer-events-none absolute right-3 top-3 opacity-10">
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-700">
                          <path
                            fill="currentColor"
                            d="M7.17 6A5.17 5.17 0 0 0 2 11.17V22h8V10H5.17A3.17 3.17 0 0 1 8.34 6H7.17Zm9.66 0A5.17 5.17 0 0 0 11.66 11.17V22h8V10H16.83a3.17 3.17 0 0 1 3.17-3.17h-3.17Z"
                          />
                        </svg>
                      </div>

                      {/* Comment */}
                      <p
                        className="mb-4 flex-1 text-[13px] leading-6 text-gray-700"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 5,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.Comment}
                      </p>

                      {/* Like */}
                      <div className="mt-auto">
                        <Like
                          reviewID={item.ID!}
                          userID={Number(localStorage.getItem("userid")) || 0}
                        />
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </Slider>
        </div>
      </div>

      {/* Slick dots theme */}
      <style>{`
        .slick-dots { bottom: -6px; }
        .slick-dots li { margin: 0 3px; }
        .slick-dots li button:before {
          font-size: 7px;
          color: #93c5fd; /* blue-300 */
          opacity: 1;
        }
        .slick-dots li.slick-active button:before {
          color: #2563eb; /* blue-600 */
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default Review;
