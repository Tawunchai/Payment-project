import React, { useEffect, useMemo, useState } from "react";
import { Avatar } from "antd";
import { getUserByID, apiUrlPicture } from "../../../../../services";
import { UsersInterface } from "../../../../../interface/IUser";

type Props = {
  inverted?: boolean;
  showRole?: boolean;
  size?: number;
  userData?: UsersInterface; // ✅ เพิ่ม prop นี้
};

export const AvatarWithInfo: React.FC<Props> = ({
  inverted = false,
  showRole = true,
  size = 84,
  userData,
}) => {
  const [user, setUser] = useState<UsersInterface | null>(userData ?? null);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    if (userData) return; 

    const uid = Number(localStorage.getItem("userid")) || 0;
    if (!uid) return;

    const fetchUser = async () => {
      const res = await getUserByID(uid);
      if (res) setUser(res);
    };
    fetchUser();
  }, [userData]);

  const textMain = inverted ? "text-white" : "text-gray-900";
  const ringClr = inverted ? "ring-white/25" : "ring-blue-100";
  const badgeBg = inverted
    ? "bg-white/15 border-white/25 text-white"
    : "bg-blue-50 border-blue-200 text-blue-700";

  const fullName = useMemo(
    () => (user ? `${user.FirstName ?? ""} ${user.LastName ?? ""}`.trim() : ""),
    [user]
  );

  const initials = useMemo(() => {
    if (!fullName) return "EV";
    const parts = fullName.split(" ").filter(Boolean);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || "EV";
  }, [fullName]);

  const profileSrc = user?.Profile && imgOk ? `${apiUrlPicture}${user.Profile}` : undefined;
  const isLoading = !user;

  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <div
        className={[
          "relative rounded-full p-0.5",
          "bg-gradient-to-b from-blue-600/15 to-blue-600/5",
          "ring-2",
          ringClr,
          "shadow-sm",
        ].join(" ")}
      >
        {isLoading ? (
          <div
            className="rounded-full bg-gray-200 animate-pulse"
            style={{ height: size, width: size }}
          />
        ) : (
          <Avatar
            src={profileSrc}
            alt={fullName || "user"}
            size={size}
            onError={() => {
              setImgOk(false);
              return false;
            }}
            className="bg-white text-blue-600 font-semibold"
          >
            {initials}
          </Avatar>
        )}
      </div>

      <div className="min-w-0">
        <div
          className={`text-lg sm:text-xl md:text-2xl font-semibold ${textMain} truncate`}
        >
          {isLoading ? (
            <span className="inline-block h-5 w-40 bg-gray-200 animate-pulse rounded" />
          ) : (
            fullName || "Unnamed User"
          )}
        </div>

        {showRole && (
          <div className="mt-1">
            {isLoading ? (
              <span className="inline-block h-4 w-24 bg-gray-200 animate-pulse rounded-full" />
            ) : (
              <span
                className={[
                  "inline-flex items-center gap-1 px-2 py-0.5",
                  "rounded-full border text-[11px] leading-none",
                  badgeBg,
                ].join(" ")}
                title={user?.UserRole?.RoleName || "User"}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="truncate max-w-[12rem] md:max-w-[16rem]">
                  {user?.UserRole?.RoleName || "User"}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
