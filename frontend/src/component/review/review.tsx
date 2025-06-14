import Slider from "react-slick";
import Profile from "../../assets/profile/people1.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


const ReviewsData = [
  {
    id: 1,
    name: "John Doe",
    text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus quidem eum ipsum adipisci quam, sapiente repellat quos voluptas harum repudiandae velit doloribus inventore laborum officiis ut placeat iusto. Praesentium, beatae!",
    img: Profile,
    delay: 0.2,
  },
  {
    id: 2,
    name: "Tawunchai",
    text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus quidem eum ipsum adipisci quam, sapiente repellat quos voluptas harum repudiandae velit doloribus inventore laborum officiis ut placeat iusto. Praesentium, beatae!",
    img: Profile,
    delay: 0.2,
  },
  {
    id: 3,
    name: "MJ Janista",
    text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus quidem eum ipsum adipisci quam, sapiente repellat quos voluptas harum repudiandae velit doloribus inventore laborum officiis ut placeat iusto. Praesentium, beatae!",
    img: Profile,
    delay: 0.2,
  },
];

const Review = () => {
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
    <div className="py-14 mb-10">
      <div className="container">
        <div className="space-y-4 p-6 text-center max-w-[600px] mx-auto mb-6">
          <h1 className="uppercase font-semibold text-orange-600">OUR Reviews</h1>
          <p className="font-semibold text-3xl">What Our Customer Say About Us</p>
        </div>

        <Slider {...settings}>
          {ReviewsData.map((item) => (
            <div key={item.id} className="px-2">
              <div className="flex flex-col gap-4 p-8 shadow-lg rounded-xl bg-slate-200 h-full">
                <div className="flex justify-start items-center gap-5">
                  <img src={item.img} className="w-16 h-16 rounded-full" />
                  <div>
                    <p className="text-xl font-bold text-black/80">{item.name}</p>
                    <p>{item.name}</p>
                  </div>
                </div>
                <div className="py-6 space-y-4">
                  <p className="text-sm text-gray-500">{item.text}</p>
                  <p>⭐⭐⭐⭐⭐</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Review;
