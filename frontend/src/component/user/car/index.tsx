import CarImg from "../../../assets/CAR.png";

const CardAddVehicle = () => {
  return (
    <div className="w-full flex justify-center items-center min-h-[230px] py-6 px-0 paddings ">
      <div
        className="
          bg-white rounded-2xl shadow-lg 
          w-full mx-auto p-0 overflow-hidden
          md:rounded-2xl
        "
        style={{
          minWidth: 0,
        }}
      >
        <div className="
          flex flex-row items-start justify-between
          p-6 pb-1 bg-gradient-to-r from-orange-100 to-white
          md:p-8
        ">
          <div>
            <div className="font-bold text-orange-800 mb-1 text-lg md:text-xl tracking-tight">
              เตรียมความพร้อม!
            </div>
            <div className="text-gray-900 text-base md:text-lg font-semibold tracking-tight">
              ก่อนเริ่มใช้บริการที่สถานีใน<br />2 ขั้นตอน
            </div>
          </div>
          <img
            src={CarImg}
            alt="EV car"
            className="w-24 h-20 md:w-32 md:h-24 object-contain"
            draggable={false}
          />
        </div>
        {/* Divider */}
        <div className="h-[2px] bg-[#F4F8FB]"></div>
        {/* Add vehicle row */}
        <div className="
          flex flex-row items-center justify-between 
          px-6 py-4 hover:bg-blue-50 transition
          md:px-8
        ">
          {/* Icon + Text */}
          <div className="flex flex-row items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 bg-white text-2xl text-gray-400 font-bold shadow-sm">
              +
            </div>
            <div className="text-gray-900 text-[18px] md:text-lg font-semibold">เพิ่มพาหนะ</div>
          </div>
          {/* ปุ่มเพิ่ม */}
          <button className="flex items-center gap-1 text-orange-700 font-bold text-[16px] md:text-base px-2 py-1 hover:underline">
            เพิ่ม
            <span className="ml-0.5">{'>'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardAddVehicle;
