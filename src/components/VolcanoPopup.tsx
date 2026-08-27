"use client";

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { Avatar } from "./Avatar";
import { playSiren } from "@/lib/sound";
import type { Profile } from "@/lib/types";

export function VolcanoPopup({ profile, onClose }: { profile: Profile | null | undefined; onClose: () => void }) {
  useEffect(() => {
    playSiren();
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  // Lapilli fly out of the crater on a real up-then-down arc (translate peaks
  // mid-animation, then keeps falling past the start point) with a spin, so
  // the eruption reads as chunks of molten rock rather than plain rising dots.
  const lapilli = useMemo(
    () =>
      [
        { arcX: -46, arcHeight: 92, spin: 260, size: 9, delay: "0s", duration: "2.1s" },
        { arcX: -22, arcHeight: 122, spin: -180, size: 6, delay: "0.15s", duration: "1.9s" },
        { arcX: 6, arcHeight: 140, spin: 320, size: 8, delay: "0.3s", duration: "2.3s" },
        { arcX: 30, arcHeight: 115, spin: -260, size: 7, delay: "0.45s", duration: "2s" },
        { arcX: 52, arcHeight: 88, spin: 200, size: 9, delay: "0.6s", duration: "2.2s" },
        { arcX: -34, arcHeight: 70, spin: -220, size: 5, delay: "0.8s", duration: "1.8s" },
        { arcX: -8, arcHeight: 60, spin: 180, size: 6, delay: "0.95s", duration: "1.7s" },
        { arcX: 18, arcHeight: 75, spin: -300, size: 5, delay: "1.1s", duration: "1.9s" },
        { arcX: 42, arcHeight: 55, spin: 240, size: 6, delay: "1.3s", duration: "1.8s" },
        { arcX: -14, arcHeight: 100, spin: 150, size: 7, delay: "1.5s", duration: "2.1s" },
      ] as const,
    []
  );

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

        <div className="relative h-[180px] flex items-end justify-center overflow-hidden">
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

          {/* shockwave ring pulsing out of the crater */}
          <div
            style={{
              position: "absolute",
              bottom: 58,
              left: "50%",
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "2px solid var(--amber-deep)",
              transform: "translate(-50%, 50%)",
              animation: "shockwave 1.6s ease-out infinite",
              zIndex: 1,
            }}
          />

          <svg
            viewBox="0 0 200 150"
            width="100%"
            height="180"
            style={{ position: "relative", zIndex: 2, animation: "mountainShake 0.5s ease-in-out 1" }}
          >
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

          {lapilli.map((l, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                bottom: 62,
                left: "50%",
                width: l.size,
                height: l.size,
                borderRadius: "45% 55% 60% 40%",
                background: "radial-gradient(circle at 35% 30%, #FFF6D6 0%, #FFE8A3 25%, var(--amber-deep) 65%, var(--coral) 100%)",
                boxShadow: "0 0 6px 1px rgba(255,166,48,0.6)",
                animation: `lavaArc ${l.duration} ease-out infinite`,
                animationDelay: l.delay,
                zIndex: 1,
                "--arcX": `${l.arcX}px`,
                "--arcHeight": `${l.arcHeight}px`,
                "--spin": `${l.spin}deg`,
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
