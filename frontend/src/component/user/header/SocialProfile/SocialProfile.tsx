import React, { useState } from "react";
import { Tabs } from "antd";
import Header from "./header";
import { Contact } from "./Contact";
import { ProfileBanner } from "./ProfileBanner";
import SupportCard from "./support";
import Cars from "./cars";
import BookingHistory from "./bookinghistory";
import Footer from "../../../../component/user/footer/footer";

const SocialProfile: React.FC = () => {
  const userID = Number(localStorage.getItem("userid"));
  const [activeKey, setActiveKey] = useState("1");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header title="My EV Profile" />

      {/* Main Container */}
      <div className="mx-auto w-full max-w-screen-sm md:max-w-6xl px-4 pb-8 md:pb-12">
        {/* Banner */}
        <ProfileBanner />

        {/* Tabs Section */}
        <div className="mt-5">
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            centered
            size="middle"
            tabBarGutter={20}
            tabBarStyle={{
              backgroundColor: "transparent",
              display: "flex",
              justifyContent: "center",
            }}
            items={[
              {
                key: "1",
                label: (
                  <span
                    className={`text-[13px] md:text-[14px] font-medium transition-colors duration-200 ${
                      activeKey === "1" ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    🚙 โปรไฟล์ของฉัน
                  </span>
                ),
                children: (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mt-3">
                    <div className="md:col-span-5 md:col-start-1">
                      <Contact />
                      <Cars userID={userID} /><br /><br />
                    </div>
                  </div>
                ),
              },
              {
                key: "2",
                label: (
                  <span
                    className={`text-[13px] md:text-[14px] font-medium transition-colors duration-200 ${
                      activeKey === "2" ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    ⚡ ประวัติการจอง
                  </span>
                ),
                children: (
                  <div className="mt-3">
                    <BookingHistory /><br /><br />
                  </div>
                ),
              },
              {
                key: "3",
                label: (
                  <span
                    className={`text-[13px] md:text-[14px] font-medium transition-colors duration-200 ${
                      activeKey === "3" ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    🛠️ แจ้งปัญหา
                  </span>
                ),
                children: (
                  <div className="mt-3">
                    <SupportCard /><br /><br />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Footer (Mobile Only) */}
      <div className="block md:hidden mt-10">
        <Footer />
      </div>
    </div>
  );
};

export default SocialProfile;
