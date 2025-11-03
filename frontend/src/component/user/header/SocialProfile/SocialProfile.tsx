import React, { useState, useEffect } from "react";
import { Tabs } from "antd";
import Header from "./header";
import { Contact } from "./Contact";
import { ProfileBanner } from "./ProfileBanner";
import SupportCard from "./support";
import Cars from "./cars";
import BookingHistory from "./bookinghistory";
import Footer from "../../../../component/user/footer/footer";
import { getCurrentUser, initUserProfile } from "../../../../services/httpLogin"; // ✅ import มาใช้

const SocialProfile: React.FC = () => {
  const [userID, setUserID] = useState<number | null>(null);
  const [activeKey, setActiveKey] = useState("1");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let current = getCurrentUser();
        if (!current) current = await initUserProfile(); // ✅ ถ้าไม่มีใน memory ให้ดึงจาก server
        if (current?.id) {
          setUserID(current.id);
        } else {
          console.warn("⚠️ ไม่พบ userID ในข้อมูลผู้ใช้");
        }
      } catch (err) {
        console.error("❌ Error fetching user profile:", err);
      }
    };
    fetchUser();
  }, []);

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
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact (ซ้าย) */}
                    <div className="flex flex-col gap-4">
                      <Contact />
                    </div>

                    {/* Cars (ขวา) */}
                    <div className="flex flex-col gap-4">
                      {userID ? (
                        <Cars userID={userID} />
                      ) : (
                        <div className="text-gray-400 text-sm">
                          กำลังโหลดข้อมูลผู้ใช้...
                        </div>
                      )}
                      <br />
                      <br />
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
                    <BookingHistory />
                    <br />
                    <br />
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
                    <SupportCard />
                    <br />
                    <br />
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