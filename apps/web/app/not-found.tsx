import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--bg-surface)",
        color: "var(--fg-body)"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          border: "1px solid var(--border-default)",
          borderRadius: 16,
          background: "var(--bg-surface)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          padding: 28,
          textAlign: "center"
        }}
      >
        <div className="mc-eyebrow" style={{ marginBottom: 12 }}>
          Not found
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(28px, 4vw, 40px)",
            lineHeight: 1.1,
            fontWeight: 600,
            color: "var(--fg-primary)"
          }}
        >
          This page does not exist.
        </h1>
        <p style={{ margin: "14px 0 0", fontSize: 15, color: "var(--fg-secondary)", lineHeight: 1.55 }}>
          The URL may be incorrect, or the page may have moved.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 16px",
              borderRadius: 10,
              background: "var(--accent)",
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
