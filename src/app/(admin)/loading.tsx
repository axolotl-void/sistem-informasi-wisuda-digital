export default function AdminLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Title skeleton */}
      <div>
        <div className="animate-pulse" style={{ height: 28, width: 200, borderRadius: 8, background: "rgba(255,255,255,0.04)" }} />
        <div className="animate-pulse" style={{ height: 14, width: 300, borderRadius: 6, background: "rgba(255,255,255,0.03)", marginTop: 8 }} />
      </div>

      {/* Cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 8 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse" style={{
            borderRadius: 12, height: 80, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.04)",
          }} />
        ))}
      </div>

      {/* Toolbar skeleton */}
      <div className="animate-pulse" style={{
        borderRadius: 12, height: 48, background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
      }} />

      {/* Table skeleton */}
      <div style={{
        borderRadius: 12, background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}>
        <div className="animate-pulse" style={{ height: 36, background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.04)" }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse" style={{
            height: 48, borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.03)" : "none",
          }} />
        ))}
      </div>
    </div>
  );
}
