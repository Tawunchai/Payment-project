import React from "react";
import { AvatarWithInfo } from "./AvatarWithInfo";
import { ProfileNavbar } from "./ProfileNavbar";
import EVCAR from "../../../../../assets/EV Car.jpeg";

const ProfileBanner: React.FC = () => {
  return (
    <section className="mt-4">
      {/* Banner: รูป + overlay + โค้งมน */}
      <div
        className="relative rounded-2xl overflow-hidden bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${EVCAR})` }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 px-4 py-8">
          <AvatarWithInfo inverted />
          <div className="mt-3">
            <ProfileNavbar />
          </div>
        </div>
      </div>
    </section>
  );
};

export { ProfileBanner };
