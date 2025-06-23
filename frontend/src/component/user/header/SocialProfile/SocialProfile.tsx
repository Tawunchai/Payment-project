import Header from "./header/index"
import { Contact } from "./Contact";
import { ProfileBanner } from "./ProfileBanner";
import "./socail.css"
const SocialProfile = () => {
  return (
    <div className="min-h-screen header-extra">
      <Header />
      <div className="paddings">
        <ProfileBanner />
        <div>
          <Contact />
        </div>
      </div>
    </div>
  );
};

export default SocialProfile;
