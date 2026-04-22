"use client";

import Link from "next/link";
import { useEffect } from "react";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" data-theme="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "var(--bg-surface)",
          color: "var(--fg-body)",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
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
          <div
            style={{
              marginBottom: 12,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--accent-text)"
            }}
          >
            Application error
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
            A critical error occurred.
          </h1>
          <p style={{ margin: "14px 0 0", fontSize: 15, color: "var(--fg-secondary)", lineHeight: 1.55 }}>
            Please retry. If the problem continues, go to the homepage and refresh.
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
      </body>
    </html>
  );
}
