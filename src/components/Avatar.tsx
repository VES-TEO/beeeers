import { avatarColor } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export function Avatar({ profile, size = 40 }: { profile: Profile | null | undefined; size?: number }) {
  if (profile?.photoURL) {
    // eslint-disable-next-line @next/next/no-img-element -- avatars are small, dynamic, cross-origin Storage URLs
    return (
      <img
        src={profile.photoURL}
        alt={profile.name}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid var(--bg-elev)",
          boxShadow: "0 0 0 1.5px rgba(255,201,60,0.4)",
          flexShrink: 0,
        }}
      />
    );
  }
  const initial = (profile?.name || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColor(profile?.id || "x"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#12100B",
        fontWeight: 800,
        fontSize: size * 0.42,
        fontFamily: "var(--font-baloo), sans-serif",
        border: "2px solid var(--bg-elev)",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
