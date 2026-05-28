"use client";

import { useState, type ReactElement, type SVGProps } from "react";
import { Icons } from "./icons";

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

type FeatureCardProps = {
  icon: IconComponent;
  title: string;
  body: string;
};

function FeatureCard({ icon: Icon, title, body }: FeatureCardProps) {
  const [hover, setHover] = useState(false);

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: 16,
        padding: 24,
        boxShadow: hover
          ? "0 20px 40px -20px rgba(14, 165, 233, 0.25), 0 4px 12px rgba(0,0,0,0.04)"
          : "0 4px 12px rgba(0,0,0,0.04)",
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 240ms var(--ease-out), box-shadow 240ms var(--ease-out), border-color 200ms",
        borderColor: hover ? "var(--sky-200)" : "var(--border-default)",
        cursor: "default"
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "var(--sky-50)",
          color: "var(--accent-text)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--sky-100)",
          transition: "all 240ms",
          transform: hover ? "rotate(-4deg) scale(1.05)" : "none"
        }}
      >
        <Icon width={20} height={20} />
      </div>
      <h3 style={{ margin: "18px 0 8px", fontSize: 17, fontWeight: 600, color: "var(--fg-primary)" }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: "var(--fg-secondary)", lineHeight: 1.55 }}>{body}</p>
    </article>
  );
}

const FEATURE_ITEMS: FeatureCardProps[] = [
  {
    icon: Icons.Health,
    title: "PageSpeed at a glance",
    body: "LCP, CLS, TBT, FCP, and TTFB tracked on every scan. Spot regressions before users notice them."
  },
  {
    icon: Icons.Analytics,
    title: "GA4, unified",
    body: "Sessions, users, engagement, and conversion events normalized across every site you manage."
  },
  {
    icon: Icons.Search,
    title: "Search Console signal",
    body: "Clicks, impressions, CTR, and position trends plus top queries and pages side-by-side."
  },
  {
    icon: Icons.Recs,
    title: "Actionable recommendations",
    body: "Rule-based suggestions tagged by impact. Skip the generic audits and get the two things that move the needle."
  },
  {
    icon: Icons.Layers,
    title: "Multi-tenant by default",
    body: "Organizations, roles, and scoped permissions. Onboard a new client in under two minutes."
  },
  {
    icon: Icons.Plug,
    title: "Your stack, connected",
    body: "OAuth into Google Analytics and Search Console. Schedule scans. Export snapshots. Done."
  }
];

export function FeatureGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16
      }}
    >
      {FEATURE_ITEMS.map((item) => (
        <FeatureCard key={item.title} {...item} />
      ))}
    </div>
  );
}
