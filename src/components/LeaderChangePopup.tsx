"use client";

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { playFanfare } from "@/lib/sound";

const CONFETTI_COLORS = ["var(--amber)", "var(--amber-deep)", "var(--coral)", "var(--mint)", "#7DD3FC", "#C084FC"];

/** Celebratory popup shown to everyone (client-side, realtime via Firestore) whenever
 * the #1 spot in the leaderboard changes hands. */
export function LeaderChangePopup({ leaderName, onClose }: { leaderName: string; onClose: () => void }) {
  useEffect(() => {
    playFanfare();
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: `${Math.round((i * 137.5) % 100)}%`,
        delay: `${(i % 10) * 0.18}s`,
        duration: `${2.4 + (i % 5) * 0.3}s`,
        size: 6 + (i % 3) * 3,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: (i * 47) % 360,
      })),
    []
  );

  return (
    <div className="fixed inset-0 bg-[rgba(10,5,2,0.75)] flex items-center justify-center z-[70] p-5" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-bg-elev border border-border rounded-[22px] px-[22px] pt-[18px] pb-6 w-full max-w-[340px] text-center shadow-[0_12px_50px_rgba(0,0,0,0.55)] overflow-hidden"
        style={{ animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 bg-[rgba(255,255,255,0.08)] border-none rounded-full w-[26px] h-[26px] flex items-center justify-center text-text-dim z-10"
        >
          <X size={15} />
        </button>

        <div className="relative h-[150px] overflow-hidden rounded-2xl" style={{ background: "linear-gradient(180deg, rgba(255,201,60,0.14) 0%, rgba(255,166,48,0.04) 100%)" }}>
          {confetti.map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: -16,
                left: c.left,
                width: c.size,
                height: c.size * 0.6,
                background: c.color,
                animation: `confettiFall ${c.duration} ease-in infinite`,
                animationDelay: c.delay,
                "--rotate": `${c.rotate}deg`,
              } as React.CSSProperties}
            />
          ))}

          {/* checkered flag strip along the bottom, like a finish line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-3"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#12100B 0% 25%, #F5F3EE 0% 50%)",
              backgroundSize: "12px 12px",
              opacity: 0.85,
            }}
          />

          <div style={{ position: "absolute", bottom: 10, fontSize: 40, animation: "carDash 2.6s ease-in-out infinite" }}>
            🏎️💨
          </div>
        </div>

        <div className="font-fredoka font-extrabold text-lg text-text mt-3">🏁 Nuovo leader in pista!</div>
        <div className="font-sans text-[13px] text-text-dim mt-2 leading-relaxed">
          <strong>{leaderName}</strong> è scattato in testa alla classifica — qualcuno qui è in fuga! 💨
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 rounded-xl py-3 font-fredoka text-[15.5px] font-bold text-[#12100B]"
          style={{ background: "linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%)" }}
        >
          Forza! 🏆
        </button>
      </div>
    </div>
  );
}
