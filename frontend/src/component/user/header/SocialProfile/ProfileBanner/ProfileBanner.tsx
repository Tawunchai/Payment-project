import React from "react";
import { AvatarWithInfo } from "./AvatarWithInfo";
import { ProfileNavbar } from "./ProfileNavbar";
import EVCAR from "../../../../../assets/solar-profile.png";

const ProfileBanner: React.FC = () => {
  return (
    <section className="mt-4 md:mt-6">
      {/* Banner */}
      <div
        className="
          relative overflow-hidden rounded-2xl md:rounded-3xl
          bg-center bg-cover bg-no-repeat
          ev-hero
        "
        style={{ backgroundImage: `url(${EVCAR})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-black/25 md:from-black/55 md:via-black/30 md:to-black/20" />
        {/* Content */}
        <div className="relative z-10 px-4 md:px-8 py-8 md:py-10">
          {/* Avatar + name/role */}
          <AvatarWithInfo inverted size={96} />

          {/* Navbar */}
          <div className="mt-4 md:mt-6">
            <ProfileNavbar />
          </div>
        </div>
      </div>
    </section>
  );
};

export { ProfileBanner };
