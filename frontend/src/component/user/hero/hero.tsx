import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import Hero_Image from "../../../assets/picture/car_charging.jpg";
import { ListEVCharging, ListUsers } from "../../../services";
import { EVchargingInterface } from "../../../interface/IEV";
import { UsersInterface } from "../../../interface/IUser";

type HeaderProps = {
  scrollToValue: () => void;
};

const Hero = ({ scrollToValue }: HeaderProps) => {
  const [evList, setEVList] = useState<EVchargingInterface[]>([]);
  const [userList, setUserList] = useState<UsersInterface[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const evs = await ListEVCharging();
      const users = await ListUsers();
      if (evs) setEVList(evs);
      if (users) setUserList(users);
    };
    fetchData();
  }, []);

  const namePriceSums = useMemo(() => {
    return evList.reduce((acc: Record<string, number>, ev) => {
      const name = ev.Name || "Unknown";
      acc[name] = (acc[name] || 0) + (Number(ev.Price) || 0);
      return acc;
    }, {});
  }, [evList]);

  return (
    <section className="relative w-full bg-white text-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-end pt-10 md:pt-14 pb-10 md:pb-16">
          {/* LEFT */}
          <div className="flex flex-col gap-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 w-max">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              EV Charging Made Simple
            </div>

            {/* Title */}
            <h1 className="font-bold leading-tight tracking-tight text-3xl sm:text-4xl">
              Discover the Best EV <br className="hidden sm:block" />
              Charging Spots Near You
            </h1>

            {/* Description */}
            <p className="text-[13px] sm:text-base text-gray-600">
              ค้นหาสถานีชาร์จที่เหมาะกับคุณได้อย่างรวดเร็ว ประสบการณ์ใช้งานลื่นไหล
              ปลอดภัย และเชื่อถือได้
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] transition"
                onClick={() => navigate("/user/evs-selector")}
              >
                เริ่มชาร์จไฟฟ้า
              </button>
              <button
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold bg-white text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-50 active:scale-[0.99] transition"
                onClick={scrollToValue}
              >
                ขั้นตอนการใช้งานตู้ชาร์จ
              </button>
            </div>

            {/* Stats (cards on white) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 mt-2">
              {Object.entries(namePriceSums).map(([name, total]) => (
                <div
                  key={name}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_24px_rgba(2,6,23,0.06)] text-center sm:text-left"
                >
                  <div className="text-2xl font-extrabold tracking-tight text-blue-700">
                    <CountUp
                      start={0}
                      end={parseFloat(total.toFixed(2))}
                      duration={2}
                      decimals={2}
                    />
                    <span className="text-blue-300"> $</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{name}</div>
                </div>
              ))}

              {/* Members: เต็มความกว้างบนมือถือ + จัดกลางบนมือถือ */}
              <div className="order-last sm:order-none col-span-2 sm:col-span-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_24px_rgba(2,6,23,0.06)] text-center sm:text-left">
                <div className="text-2xl font-extrabold tracking-tight text-blue-700">
                  <CountUp start={0} end={userList.length} duration={2} />
                  <span className="text-blue-300"> +</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Members</div>
              </div>
            </div>
          </div>

          {/* RIGHT — image (hidden on mobile) */}
          <div className="hidden md:flex justify-end">
            <figure className="relative w-[34rem] max-w-full h-[28rem] rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_20px_60px_rgba(2,6,23,0.08)] bg-white">
              <img
                src={Hero_Image}
                alt="EV Charging"
                className="h-full w-full object-cover"
                loading="eager"
              />
              <figcaption className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600" />
            </figure>
          </div>
        </div>
      </div>

      {/* soft divider to next section */}
      <div className="h-6 md:h-8 w-full bg-gradient-to-b from-white to-blue-50/30" />
    </section>
  );
};

export default Hero;
