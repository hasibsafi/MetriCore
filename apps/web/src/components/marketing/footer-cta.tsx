"use client";

import Link from "next/link";
import { Icons } from "./icons";
import { LogoMark } from "./logo-mark";

export function FooterCTA() {
  return (
    <section style={{ padding: "40px 0 96px" }}>
      <div className="mc-container">
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: "var(--cta-bg)",
            border: "1px solid var(--border-default)",
            borderRadius: 24,
            padding: "56px 40px",
            textAlign: "center"
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
              opacity: 0.15,
              pointerEvents: "none"
            }}
          />

          <div className="mc-eyebrow" style={{ color: "var(--accent-text)" }}>
            GET STARTED
          </div>
          <h2
            style={{
              margin: "14px 0 0",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--fg-primary)",
              textWrap: "balance"
            }}
          >
            One dashboard. Every site. Every signal.
          </h2>
          <p
            style={{
              margin: "14px auto 0",
              maxWidth: 520,
              fontSize: 15,
              color: "var(--fg-secondary)",
              lineHeight: 1.55,
              textWrap: "pretty"
            }}
          >
            Connect a site in two minutes. Compare ranges, export snapshots, and ship the changes that matter.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            <Link
              href="/sign-up"
              style={{
                padding: "12px 22px",
                borderRadius: 10,
                background: "var(--accent)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 10px 25px -10px rgba(14, 165, 233, 0.5)"
              }}
            >
              Start free
              <Icons.Arrow width={14} height={14} />
            </Link>
            <Link
              href="/sign-up"
              style={{
                padding: "12px 22px",
                borderRadius: 10,
                background: "var(--bg-surface)",
                color: "var(--fg-primary)",
                fontSize: 14,
                fontWeight: 600,
                border: "1px solid var(--border-default)",
                textDecoration: "none"
              }}
            >
              Book a walkthrough
            </Link>
          </div>
        </div>

        <footer
          style={{
            marginTop: 56,
            paddingTop: 32,
            borderTop: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={24} />
            <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>© 2026 MetriCore. Built on Next.js 15.</span>
          </div>

          <div style={{ display: "flex", gap: 22, fontSize: 12, color: "var(--fg-muted)" }}>
            <a
              href="#product"
              style={{ color: "inherit", textDecoration: "none" }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = "var(--fg-primary)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = "var(--fg-muted)";
              }}
            >
              Product
            </a>
            {["Pricing", "Changelog", "Docs", "Status"].map((label) => (
              <a
                key={label}
                href="#"
                style={{ color: "inherit", textDecoration: "none" }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = "var(--fg-primary)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = "var(--fg-muted)";
                }}
              >
                {label}
              </a>
            ))}
            <Link
              href="/privacy-policy"
              style={{ color: "inherit", textDecoration: "none" }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = "var(--fg-primary)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = "var(--fg-muted)";
              }}
            >
              Privacy
            </Link>
          </div>
        </footer>
      </div>
    </section>
  );
}
