import { Plus } from "lucide-react";

/** Fills like a pint glass based on the share of the group active today — used inside the FAB. */
export function BeerGlassIcon({ fillPct }: { fillPct: number }) {
  const bubbles = [
    { left: "22%", delay: "0s", size: 3 },
    { left: "50%", delay: "0.7s", size: 2.4 },
    { left: "72%", delay: "1.4s", size: 2.8 },
  ];
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${fillPct}%`,
          background: "linear-gradient(180deg, var(--amber) 0%, var(--amber-deep) 100%)",
          transition: "height 0.6s ease",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -4, left: 0, right: 0, height: 6, background: "#FFF8E7", borderRadius: "3px 3px 0 0" }} />
        {bubbles.map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 4,
              left: b.left,
              width: b.size,
              height: b.size,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.75)",
              animation: `bubbleRise 2.2s ease-in infinite`,
              animationDelay: b.delay,
            }}
          />
        ))}
      </div>
      <Plus
        size={14}
        strokeWidth={3}
        color="#12100B"
        style={{ position: "absolute", top: 6, right: 6, background: "rgba(18,16,11,0.15)", borderRadius: "50%", padding: 2 }}
      />
    </div>
  );
}
