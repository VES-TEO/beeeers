import { Bell, BellOff } from "lucide-react";
import { CircularLogo } from "./CircularLogo";
import { Avatar } from "./Avatar";
import type { Profile } from "@/lib/types";

export function TopHeader({
  myProfile,
  notifStatus,
  onEnableNotifications,
}: {
  myProfile: Profile;
  notifStatus: "unsupported" | "denied" | "default" | "granted";
  onEnableNotifications: () => void;
}) {
  return (
    <div className="flex justify-between items-center px-[18px] py-4 bg-[rgba(26,24,32,0.75)] backdrop-blur-md border-b border-border sticky top-0 z-[25]">
      <CircularLogo size={50} />
      <div className="flex items-center gap-2.5">
        {notifStatus !== "unsupported" && (
          <button
            onClick={onEnableNotifications}
            title={notifStatus === "granted" ? "Notifiche attive" : "Attiva le notifiche push"}
            className="bg-bg-elev-2 border border-border rounded-full w-8 h-8 flex items-center justify-center"
          >
            {notifStatus === "granted" ? (
              <Bell size={15} color="var(--amber)" />
            ) : (
              <BellOff size={15} color="#B9B6C3" />
            )}
          </button>
        )}
        <Avatar profile={myProfile} size={34} />
      </div>
    </div>
  );
}
