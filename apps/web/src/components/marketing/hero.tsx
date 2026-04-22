"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { DashboardPreview } from "./dashboard-preview";
import { Icons } from "./icons";

const HERO_TITLE =
  "Track health, traffic, and search impact without jumping between tools.";

const HERO_SUBTITLE =
  "MetriCore connects GA4, Search Console, and PageSpeed into a single view. Capture snapshots, compare ranges, and turn metrics into clear next steps.";

function scrollToProduct(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  const product = document.getElementById("product");
  if (product) {
    window.scrollTo({ top: product.offsetTop - 72, behavior: "smooth" });
  }
}

export function Hero() {
  const [before, after = ""] = HERO_TITLE.split("without");

  return (
    <section id="top" style={{ position: "relative", overflow: "hidden", paddingTop: 56, paddingBottom: 72 }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle at 20% 0%, var(--hero-bg-glow-a) 0%, transparent 50%), radial-gradient(circle at 85% 10%, var(--hero-bg-glow-b) 0%, transparent 45%)",
          opacity: 1
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(var(--hero-grid) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 35%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 35%, transparent 75%)"
        }}
      />

      <div className="mc-container" style={{ position: "relative" }}>
        <div style={{ textAlign: "center" }}>
          <div className="mc-eyebrow" style={{ fontSize: 12 }}>
            CLIENT PORTAL
          </div>
        </div>

        <h1
          style={{
            margin: "18px auto 0",
            textAlign: "center",
            fontSize: "clamp(36px, 6vw, 68px)",
            lineHeight: 1.02,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            color: "var(--fg-primary)",
            maxWidth: 960,
            textWrap: "balance"
          }}
        >
          {before}
          <span style={{ color: "var(--accent)" }}>without</span>
          {after}
        </h1>

        <p
          style={{
            margin: "22px auto 0",
            textAlign: "center",
            fontSize: 18,
            lineHeight: 1.55,
            color: "var(--fg-secondary)",
            maxWidth: 680,
            textWrap: "pretty"
          }}
        >
          {HERO_SUBTITLE}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
          <Link
            href="/sign-up"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              borderRadius: 10,
              background: "var(--accent)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 10px 25px -10px rgba(14, 165, 233, 0.5)",
              transition: "all 200ms"
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "var(--accent-hover)";
              event.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "var(--accent)";
              event.currentTarget.style.transform = "none";
            }}
          >
            Start free
            <Icons.Arrow width={14} height={14} />
          </Link>

          <a
            href="#product"
            onClick={scrollToProduct}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              borderRadius: 10,
              background: "var(--bg-surface)",
              color: "var(--fg-primary)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid var(--border-default)",
              transition: "all 200ms"
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "var(--bg-muted)";
              event.currentTarget.style.borderColor = "var(--border-strong)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "var(--bg-surface)";
              event.currentTarget.style.borderColor = "var(--border-default)";
            }}
          >
            See a live demo
          </a>
        </div>

        <div style={{ textAlign: "center", marginTop: 22, fontSize: 12, color: "var(--fg-muted)" }}>
          Used by teams managing{" "}
          <strong style={{ color: "var(--fg-primary)", fontWeight: 600 }}>400+ client sites</strong>. No credit
          card required.
        </div>

        <div style={{ marginTop: 64, position: "relative" }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "-40px 10% auto 10%",
              height: 8,
              background: "radial-gradient(ellipse at center, rgba(14, 165, 233, 0.35), transparent 70%)",
              filter: "blur(12px)"
            }}
          />
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
