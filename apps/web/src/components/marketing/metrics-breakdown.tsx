"use client";

import { useRef } from "react";
import { AnimatedBarChart } from "./charts/animated-bar-chart";
import { AreaLineChart } from "./charts/area-line-chart";
import { DeltaPill } from "./charts/delta-pill";
import { ScoreRing } from "./charts/score-ring";
import { useInView } from "./hooks/use-in-view";

const cardBaseStyle = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border-default)",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
} as const;

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12
} as const;

const cardTitleStyle = {
  margin: "10px 0 4px",
  fontSize: 18,
  fontWeight: 600,
  color: "var(--fg-primary)"
} as const;

const cardSubStyle = {
  margin: 0,
  fontSize: 13,
  color: "var(--fg-secondary)",
  lineHeight: 1.5
} as const;

function pillStyle() {
  return {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--accent-text)",
    background: "var(--sky-50)",
    border: "1px solid var(--sky-100)",
    padding: "3px 10px",
    borderRadius: 9999
  } as const;
}

export function MetricsBreakdown() {
  const pageSpeedRef = useRef<HTMLElement>(null);
  const ga4Ref = useRef<HTMLElement>(null);
  const gscRef = useRef<HTMLElement>(null);

  const pageSpeedInView = useInView(pageSpeedRef);
  const ga4InView = useInView(ga4Ref);
  const gscInView = useInView(gscRef);

  const ga4Data = Array.from({ length: 14 }, (_, index) => ({
    label: index % 3 === 0 ? `D${index + 1}` : "",
    v1: 2400 + Math.sin(index / 2) * 600 + index * 220,
    v2: 1600 + Math.cos(index / 2) * 400 + index * 140
  }));

  const gscData = [
    { label: "Mon", clicks: 840, impr: 3200 },
    { label: "Tue", clicks: 1020, impr: 3900 },
    { label: "Wed", clicks: 980, impr: 3700 },
    { label: "Thu", clicks: 1140, impr: 4100 },
    { label: "Fri", clicks: 1280, impr: 4500 },
    { label: "Sat", clicks: 760, impr: 2800 },
    { label: "Sun", clicks: 690, impr: 2600 }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
      <article ref={pageSpeedRef} style={cardBaseStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <div style={pillStyle()}>Health</div>
            <h3 style={cardTitleStyle}>PageSpeed scans</h3>
            <p style={cardSubStyle}>Core Web Vitals tracked on every page, every run.</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
          <ScoreRing value={92} trigger={pageSpeedInView} label="Performance" color="var(--accent)" />
          <div style={{ flex: 1, minWidth: 180, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "LCP", value: "2.34s", delta: -8.2 },
              { label: "CLS", value: "0.042", delta: -12.1 },
              { label: "TBT", value: "180ms", delta: -5.3 },
              { label: "FCP", value: "1.12s", delta: -3.8 }
            ].map((metric) => (
              <div
                key={metric.label}
                style={{
                  padding: "10px 12px",
                  border: "1px solid var(--border-default)",
                  borderRadius: 10,
                  background: "var(--bg-subtle)"
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: "var(--fg-muted)",
                    textTransform: "uppercase"
                  }}
                >
                  {metric.label}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "var(--fg-primary)" }}>{metric.value}</span>
                  <DeltaPill value={metric.delta} invert />
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>

      <article ref={ga4Ref} style={cardBaseStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <div style={pillStyle()}>GA4</div>
            <h3 style={cardTitleStyle}>Analytics trends</h3>
            <p style={cardSubStyle}>
              Sessions, users, and engaged sessions — compared against the previous period.
            </p>
          </div>
          <DeltaPill value={15.8} />
        </div>

        <div style={{ marginTop: 16 }}>
          <AreaLineChart
            data={ga4Data}
            seriesKeys={["v1", "v2"]}
            colors={["var(--accent)", "#38bdf8"]}
            height={200}
            trigger={ga4InView}
          />
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 11, color: "var(--fg-muted)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--accent)" }} />
            Sessions
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 2, background: "#38bdf8" }} />
            Users
          </span>
        </div>
      </article>

      <article ref={gscRef} style={cardBaseStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <div style={pillStyle()}>GSC</div>
            <h3 style={cardTitleStyle}>Search performance</h3>
            <p style={cardSubStyle}>
              Clicks, impressions, CTR, and average position — rolled up by page and query.
            </p>
          </div>
          <DeltaPill value={8.4} />
        </div>

        <div style={{ marginTop: 16 }}>
          <AnimatedBarChart
            data={gscData}
            keys={["clicks"]}
            colors={["var(--accent)"]}
            height={200}
            trigger={gscInView}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
          {[
            { label: "Clicks", value: "6,912" },
            { label: "Impr.", value: "164.8k" },
            { label: "Avg. CTR", value: "4.2%" }
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                padding: "8px 10px",
                border: "1px solid var(--border-default)",
                borderRadius: 8,
                background: "var(--bg-subtle)"
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "var(--fg-muted)",
                  textTransform: "uppercase"
                }}
              >
                {metric.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-primary)", marginTop: 2 }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
