import Header from "./header";
import { Contact } from "./Contact";
import { ProfileBanner } from "./ProfileBanner";
import "./socail.css";

const SocialProfile = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header title="My EV Profile" />

      {/* page container */}
      <div className="mx-auto w-full max-w-screen-sm px-4 pb-6">
        <ProfileBanner />
        <Contact />
      </div>

      {/* safe area for iOS bottom inset */}
      <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
    </div>
  );
};

export default SocialProfile;
