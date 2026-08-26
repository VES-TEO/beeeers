export function CircularLogo({ size = 40, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg
      viewBox="-14 -10 128 120"
      width={size}
      height={size}
      style={{ overflow: "visible", animation: animate ? "logoBob 3s ease-in-out infinite" : undefined }}
    >
      <defs>
        <linearGradient id="beeeeersGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--amber)" />
          <stop offset="55%" stopColor="var(--amber-deep)" />
          <stop offset="100%" stopColor="var(--coral)" />
        </linearGradient>
        <path id="beeeeersArcPath" d="M 2,82 A 48,48 0 1 1 98,82" />
      </defs>
      <text fill="url(#beeeeersGrad)" fontFamily="var(--font-fredoka), sans-serif" fontWeight={700} fontSize={18} letterSpacing="0.3">
        <textPath href="#beeeeersArcPath" startOffset="50%" textAnchor="middle">
          BEEEEERS
        </textPath>
      </text>
      <text x={50} y={66} textAnchor="middle" fontSize={32}>
        🍺
      </text>
    </svg>
  );
}
