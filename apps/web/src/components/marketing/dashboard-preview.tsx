"use client";

import { useRef, useState } from "react";
import { AreaLineChart } from "./charts/area-line-chart";
import { DeltaPill } from "./charts/delta-pill";
import { Sparkline } from "./charts/sparkline";
import { useInView } from "./hooks/use-in-view";
import { Icons } from "./icons";
import { LogoMark } from "./logo-mark";

type DashboardPreviewProps = {
  variant?: "overview";
  compact?: boolean;
};

export function DashboardPreview({ variant = "overview", compact = false }: DashboardPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, true);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  const trafficData = [
    { label: "Mar 22", sessions: 3420, users: 2180 },
    { label: "Mar 29", sessions: 3890, users: 2510 },
    { label: "Apr 05", sessions: 4210, users: 2740 },
    { label: "Apr 12", sessions: 4680, users: 3020 },
    { label: "Apr 19", sessions: 5120, users: 3380 },
    { label: "Apr 26", sessions: 5460, users: 3610 },
    { label: "May 03", sessions: 6120, users: 4020 },
    { label: "May 10", sessions: 6890, users: 4480 }
  ];

  return (
    <div
      ref={rootRef}
      className="mc-dash-preview"
      data-variant={variant}
      style={{
        background: "var(--bg-app)",
        border: "1px solid var(--border-default)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 24px 60px -24px rgba(15, 23, 42, 0.22), 0 4px 12px rgba(0,0,0,0.04)",
        display: "grid",
        gridTemplateColumns: compact ? "180px 1fr" : "220px 1fr",
        height: compact ? 520 : 600
      }}
    >
      <aside
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-default)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ padding: "14px 14px 12px", borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogoMark size={26} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-primary)" }}>MetriCore</span>
          </div>
        </div>

        <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-default)" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--fg-muted)"
            }}
          >
            Site
          </div>
          <div
            style={{
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 9px",
              border: "1px solid var(--border-strong)",
              borderRadius: 10,
              background: "var(--bg-surface)",
              fontSize: 12,
              color: "var(--fg-body)"
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              acme.com
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <nav style={{ padding: "10px 8px", display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {[
            { key: "overview", label: "Overview", Icon: Icons.Overview, active: true },
            { key: "sites", label: "Sites", Icon: Icons.Sites },
            { key: "health", label: "Health", Icon: Icons.Health },
            { key: "analytics", label: "Analytics", Icon: Icons.Analytics },
            { key: "search", label: "Search", Icon: Icons.Search },
            { key: "recs", label: "Recommendations", Icon: Icons.Recs },
            { key: "settings", label: "Settings", Icon: Icons.Settings }
          ].map((item) => (
            <div
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: 8,
                background: item.active ? "var(--sky-50)" : "transparent",
                border: `1px solid ${item.active ? "var(--sky-200)" : "transparent"}`,
                color: item.active ? "var(--accent-text)" : "var(--fg-secondary)",
                fontSize: 12,
                fontWeight: item.active ? 600 : 500
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  background: item.active ? "var(--sky-100)" : "var(--bg-muted)",
                  color: item.active ? "var(--accent-text)" : "var(--fg-body)"
                }}
              >
                <item.Icon width={12} height={12} />
              </span>
              {item.label}
            </div>
          ))}
        </nav>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          style={{
            height: 48,
            borderBottom: "1px solid var(--border-default)",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 12
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--bg-muted)",
              borderRadius: 10,
              padding: "5px 10px",
              border: "1px solid var(--border-default)",
              maxWidth: 280
            }}
          >
            <Icons.Search width={12} height={12} color="var(--fg-muted)" />
            <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>Search sites, pages, keywords</span>
          </div>

          <div
            style={{
              display: "inline-flex",
              border: "1px solid var(--border-default)",
              background: "var(--bg-muted)",
              borderRadius: 8,
              padding: 2
            }}
          >
            {[
              ["7D", "7d"],
              ["30D", "30d"],
              ["90D", "90d"]
            ].map(([label, value]) => {
              const selected = range === value;
              return (
                <button
                  key={value}
                  onClick={() => setRange(value as "7d" | "30d" | "90d")}
                  style={{
                    border: 0,
                    background: selected ? "var(--accent)" : "transparent",
                    color: selected ? "#fff" : "var(--fg-body)",
                    padding: "3px 10px",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 120ms"
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--bg-muted)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--fg-body)",
              position: "relative"
            }}
          >
            <Icons.Bell width={13} height={13} />
            <span
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                width: 6,
                height: 6,
                borderRadius: 9999,
                background: "var(--danger-500)"
              }}
            />
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 9999,
              background: "var(--sky-500)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 600
            }}
          >
            AS
          </div>
        </div>

        <div style={{ padding: 16, overflow: "hidden", background: "var(--bg-app)", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  color: "var(--accent-text)",
                  textTransform: "uppercase"
                }}
              >
                Overview
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: "var(--fg-primary)", marginTop: 2 }}>
                Traffic overview
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>
                Snapshot of health, analytics, and recommendations.
              </div>
            </div>

            <button
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: 0,
                borderRadius: 10,
                padding: "6px 12px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit"
              }}
            >
              <Icons.Bolt width={11} height={11} />
              Run Health Scan
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
            {[
              {
                label: "GA4 Sessions",
                value: "48,216",
                delta: 15.8,
                spark: [18, 22, 20, 28, 30, 34, 32, 40, 44, 48],
                up: true
              },
              {
                label: "GSC Clicks",
                value: "6,912",
                delta: 8.4,
                spark: [14, 16, 14, 18, 20, 22, 24, 26, 30, 32],
                up: true
              },
              {
                label: "Avg. CTR",
                value: "4.2%",
                delta: -2.3,
                spark: [32, 30, 28, 26, 24, 22, 24, 26, 24, 22],
                up: false
              },
              {
                label: "Perf. score",
                value: "92",
                delta: 4.1,
                spark: [72, 74, 78, 82, 84, 86, 88, 90, 91, 92],
                up: true
              }
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--fg-muted)"
                    }}
                  >
                    {item.label}
                  </div>
                  <DeltaPill value={item.delta} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "var(--fg-primary)", marginTop: 6 }}>
                  {item.value}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Sparkline
                    data={item.spark}
                    color={item.up ? "var(--accent)" : "#94a3b8"}
                    width={100}
                    height={22}
                    trigger={inView}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: 12,
              padding: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-primary)" }}>Sessions vs Users</div>
                <div style={{ fontSize: 10, color: "var(--fg-muted)", marginTop: 2 }}>
                  Last {range === "7d" ? "7" : range === "30d" ? "30" : "90"} days · GA4
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 10, color: "var(--fg-muted)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{ width: 8, height: 8, background: "var(--accent)", borderRadius: 2, display: "inline-block" }}
                  />
                  Sessions
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 2, background: "#38bdf8", display: "inline-block" }} />
                  Users
                </span>
              </div>
            </div>

            <AreaLineChart
              data={trafficData}
              seriesKeys={["sessions", "users"]}
              colors={["var(--accent)", "#38bdf8"]}
              height={compact ? 140 : 180}
              trigger={inView}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
