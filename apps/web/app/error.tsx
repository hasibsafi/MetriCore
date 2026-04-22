"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
          maxWidth: 640,
          border: "1px solid var(--border-default)",
          borderRadius: 16,
          background: "var(--bg-surface)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          padding: 28,
          textAlign: "center"
        }}
      >
        <div className="mc-eyebrow" style={{ marginBottom: 12 }}>
          Something went wrong
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
          We hit an unexpected error.
        </h1>
        <p style={{ margin: "14px 0 0", fontSize: 15, color: "var(--fg-secondary)", lineHeight: 1.55 }}>
          Try refreshing this route. If the issue persists, go back to the homepage.
        </p>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              border: "1px solid transparent",
              borderRadius: 10,
              background: "var(--accent)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 16px",
              cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--border-default)",
              borderRadius: 10,
              background: "var(--bg-surface)",
              color: "var(--fg-primary)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 16px"
            }}
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
