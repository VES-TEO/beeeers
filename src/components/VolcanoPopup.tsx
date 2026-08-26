"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Avatar } from "./Avatar";
import type { Profile } from "@/lib/types";

export function VolcanoPopup({ profile, onClose }: { profile: Profile | null | undefined; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  const embers = [
    { left: "38%", delay: "0s", drift: "-14px", size: 5 },
    { left: "50%", delay: "0.3s", drift: "6px", size: 4 },
    { left: "58%", delay: "0.6s", drift: "-6px", size: 6 },
    { left: "45%", delay: "0.9s", drift: "16px", size: 4 },
    { left: "62%", delay: "1.2s", drift: "-18px", size: 5 },
  ];
  const smoke = [
    { left: "42%", delay: "0s" },
    { left: "52%", delay: "0.8s" },
    { left: "48%", delay: "1.6s" },
  ];

  return (
    <div
      className="fixed inset-0 bg-[rgba(10,5,2,0.75)] flex items-center justify-center z-[70] p-5"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-bg-elev border border-border rounded-[22px] px-[22px] pt-[18px] pb-6 w-full max-w-[340px] text-center shadow-[0_12px_50px_rgba(0,0,0,0.55)]"
        style={{ animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 bg-[rgba(255,255,255,0.08)] border-none rounded-full w-[26px] h-[26px] flex items-center justify-center text-text-dim"
        >
          <X size={15} />
        </button>

        <div className="relative h-[180px] flex items-end justify-center">
          {smoke.map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                bottom: 90,
                left: s.left,
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "rgba(220,215,205,0.18)",
                filter: "blur(2px)",
                animation: "smokeDrift 4s ease-out infinite",
                animationDelay: s.delay,
                zIndex: 1,
              }}
            />
          ))}
          <svg viewBox="0 0 200 150" width="100%" height="180" style={{ position: "relative", zIndex: 2 }}>
            <defs>
              <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4A3524" />
                <stop offset="100%" stopColor="#241609" />
              </linearGradient>
              <radialGradient id="craterGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE8A3" />
                <stop offset="45%" stopColor="var(--amber-deep)" />
                <stop offset="100%" stopColor="var(--coral)" />
              </radialGradient>
            </defs>
            <polygon points="15,145 100,18 185,145" fill="url(#mountainGrad)" />
            <path d="M 70,90 L 95,45 L 100,60 L 115,42 L 130,90 Z" fill="rgba(255,127,48,0.25)" />
            <ellipse cx="100" cy="26" rx="20" ry="9" fill="url(#craterGrad)" style={{ animation: "craterGlow 1.4s ease-in-out infinite" }} />
          </svg>
          {embers.map((em, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                bottom: 62,
                left: em.left,
                width: em.size,
                height: em.size,
                borderRadius: "50%",
                background: "radial-gradient(circle, #FFE8A3 0%, var(--amber-deep) 60%, var(--coral) 100%)",
                animation: "emberRise 2.4s ease-out infinite",
                animationDelay: em.delay,
                zIndex: 1,
                "--drift": em.drift,
              } as React.CSSProperties}
            />
          ))}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-[3]" style={{ animation: "bounce 1.8s ease-in-out infinite" }}>
            <Avatar profile={profile} size={64} />
          </div>
        </div>

        <div className="font-fredoka font-extrabold text-lg text-text mt-1.5">🌋 Qualcuno vive in un vulcano!</div>
        <div className="font-sans text-[13px] text-text-dim mt-2 leading-relaxed">
          <strong>{profile?.name || "Qualcuno"}</strong> ha appena bevuto una birra bollente — punti doppi ♨️
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 rounded-xl py-3 font-fredoka text-[15.5px] font-bold text-[#12100B]"
          style={{ background: "linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%)" }}
        >
          Che caldo! 🔥
        </button>
      </div>
    </div>
  );
}
