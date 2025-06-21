import { About } from "./About";
import { Contact } from "./Contact";
import { ProfileBanner } from "./ProfileBanner";

const SocialProfile = () => {
  return (
    <div className="paddings">
      <ProfileBanner />
      <div className="grid grid-cols-12 gap-8 relative z-10">
        <div className="col-span-12 lg:col-span-8">
          <div className="flex flex-col">
            <About />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="flex flex-col gap-8 ">
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProfile;
