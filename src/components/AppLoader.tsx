/** Full-screen loading state, styled like the FAB's beer glass instead of a
 * generic spinner — the glass fills and empties on a loop while data loads. */
export function AppLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-bg">
      <div
        style={{
          width: 56,
          height: 62,
          borderRadius: "8px 8px 20px 20px",
          background: "rgba(255,255,255,0.06)",
          border: "2px solid rgba(255,255,255,0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(180deg, var(--amber) 0%, var(--amber-deep) 100%)",
            animation: "loaderFill 1.7s ease-in-out infinite",
          }}
        >
          <div style={{ position: "absolute", top: -4, left: 0, right: 0, height: 6, background: "#FFF8E7", borderRadius: "3px 3px 0 0" }} />
        </div>
      </div>
      <span className="text-text-dim text-xs font-sans">Un attimo…</span>
    </div>
  );
}
