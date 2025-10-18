import { useEffect, useMemo, useState } from "react";
import Slider, { Settings } from "react-slick";
import Profile from "../../../assets/profile/people1.png"; // fallback image
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Like from "../../like/like";
import { ReviewInterface } from "../../../interface/IReview";
import { ListReviewsVisible, apiUrlPicture } from "../../../services/index";

const Review = () => {
  const [reviews, setReviews] = useState<ReviewInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ โหลดข้อมูลรีวิว
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

  // ✅ ป้องกัน crash ตอน render ก่อนโหลดเสร็จ
  const hasReviews = reviews.length > 0;

  // ✅ useMemo ต้องอยู่ข้างนอก (ไม่อยู่ใน if)
  const settings: Settings = useMemo(() => {
    const n = reviews.length;
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
      autoplaySpeed: 2000,
      cssEase: "linear",
      pauseOnHover: true,
      pauseOnFocus: true,
      slidesToShow: baseShow,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: showMd,
            slidesToScroll: 1,
            infinite: n > showMd,
            autoplay: n > 1,
          },
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: showSm,
            slidesToScroll: 1,
            infinite: n > showSm,
            autoplay: n > 1,
          },
        },
      ],
    };
  }, [reviews.length]);

  // ✅ loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">กำลังโหลดรีวิว...</p>
      </div>
    );
  }

  // ✅ ไม่มีรีวิวเลย
  if (!hasReviews) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-400">ยังไม่มีรีวิวจากผู้ใช้งาน</p>
      </div>
    );
  }

  // ✅ แสดงรีวิวทั้งหมด
  return (
    <div className="flex flex-col items-center pt-10 px-4 bg-white">
      <div className="container">
        <div className="space-y-4 p-6 text-center max-w-[600px] mx-auto mb-6">
          <h1 className="uppercase font-semibold text-yellow-400 text-3xl">
            OUR REVIEWS
          </h1>
        </div>

        <Slider {...settings}>
          {reviews.map((item, idx) => {
            const imageSrc =
              item?.User?.Profile
                ? `${apiUrlPicture}${item.User.Profile}`
                : (Profile as unknown as string);

            return (
              <div key={item.ID ?? idx} className="px-2 my-6">
                <div className="flex flex-col p-6 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] h-full min-h-[280px]">
                  {/* Profile + Rating */}
                  <div className="flex justify-start items-center gap-4 mb-3">
                    <img
                      src={imageSrc}
                      className="w-12 h-12 rounded-full object-cover"
                      alt="user"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          Profile as unknown as string;
                      }}
                    />
                    <div>
                      <p className="text-xl font-bold text-black/80">
                        {item.User?.FirstName} {item.User?.LastName}
                      </p>
                      <p>{"⭐".repeat(item.Rating || 0)}</p>
                    </div>
                  </div>

                  {/* Comment + Like */}
                  <div className="flex flex-col justify-between flex-grow">
                    <p
                      className="text-sm text-gray-500 overflow-hidden text-ellipsis mb-4"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: "vertical",
                        lineHeight: "1.5rem",
                        height: "7.5rem",
                        overflowWrap: "break-word",
                      }}
                    >
                      {item.Comment}
                    </p>

                    {/* ✅ ดึง userID จาก localStorage */}
                    <Like
                      reviewID={item.ID!}
                      userID={Number(localStorage.getItem("userid")) || 0}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
};

export default Review;
