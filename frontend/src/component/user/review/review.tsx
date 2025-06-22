import { useEffect, useState } from "react";
import Slider from "react-slick";
import Profile from "../../../assets/profile/people1.png"; // fallback image
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Like from "../../like/like"
import { ReviewInterface } from "../../../interface/IReview";
import { ListReviews } from "../../../services/index";

const Review = () => {
  const [reviews, setReviews] = useState<ReviewInterface[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await ListReviews();
      console.log("All reviews fetched:", res);
      if (res) {
        setReviews(res);
      }
    };
    fetchReviews();
  }, []);

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    autoplaySpeed: 2000,
    cssEase: "linear",
    pauseOnHover: true,
    pauseOnFocus: true,
    slidesToShow: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="flex flex-col items-center pt-10 px-4 bg-white">
      <div className="container">
        <div className="space-y-4 p-6 text-center max-w-[600px] mx-auto mb-6">
          <h1 className="uppercase font-semibold text-yellow-400 text-3xl">
            OUR Reviews
          </h1>
          <p className="font-semibold text-3xl">
            What Our Customer Say About Us
          </p>
        </div>

        <Slider {...settings}>
          {reviews.map((item) => {
            console.log("User Profile:", item?.User?.Profile);
            const imageSrc = item?.User?.Profile
              ? `http://localhost:8000/${item.User.Profile}`
              : Profile;

            return (
              <div key={item.ID} className="px-2 my-6">
                <div className="flex flex-col p-6 rounded-2xl bg-white h-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] min-h-[200px]">
                  <div className="flex justify-start items-center gap-4">
                    <img
                      src={imageSrc}
                      className="w-12 h-12 rounded-full object-cover"
                      alt="user"
                    />
                    <div>
                      <p className="text-xl font-bold text-black/80">
                        {item.User?.FirstName} {item.User?.LastName}
                      </p>
                      <p>{"⭐".repeat(item.Rating || 0)}</p>
                    </div>
                  </div>
                  <div className="py-3 space-y-4 min-h-[7.5rem]">
                    <p
                      className="text-sm text-gray-500 overflow-hidden text-ellipsis"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.5rem',
                        maxHeight: '7.5rem',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {item.Comment}
                    </p>
                      <Like reviewID={item.ID!} userID={1} />
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
