import Header from "./header";
import { Contact } from "./Contact";
import { ProfileBanner } from "./ProfileBanner";
import SupportCard from "./support"; 
import "./socail.css";
import Cars from "./cars";

const SocialProfile = () => {
  const userID = Number(localStorage.getItem("userid"));
  return (
    <div className="min-h-screen bg-white">
      <Header title="My EV Profile" />

      {/* Page container */}
      <div className="mx-auto w-full max-w-screen-sm md:max-w-6xl px-4 pb-8 md:pb-12">
        <ProfileBanner />

        {/* Contact (ซ้าย) + Support (ขวา) */}
        {/* ⬇️ เพิ่ม gap-4 สำหรับมือถือ และคง md:gap-6 ไว้สำหรับเดสก์ท็อป */}
        <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* ซ้าย: Contact */}
          <div className="md:col-span-5 md:col-start-1">
            <Contact />
            <Cars userID={userID} />
          </div>

          {/* ขวา: Support / แจ้งปัญหา */}
          <div className="md:col-span-7">
            <SupportCard />
          </div>
        </div>
      </div>

      {/* Safe area for iOS bottom inset */}
      <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
    </div>
  );
};

export default SocialProfile;
