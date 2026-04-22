type Recommendation = {
  impact: "High" | "Medium" | "Low";
  category: string;
  title: string;
  body: string;
};

const RECOMMENDATIONS: Recommendation[] = [
  {
    impact: "High",
    category: "Performance",
    title: "Compress hero image on /pricing",
    body: "Saves an estimated 420ms LCP on mobile. Convert to WebP and serve responsive sizes."
  },
  {
    impact: "High",
    category: "SEO",
    title: "Fix meta description on 14 product pages",
    body: "Descriptions are missing or duplicate — costing an estimated 1.8k clicks / month."
  },
  {
    impact: "Medium",
    category: "Performance",
    title: "Enable HTTP/2 server push for critical CSS",
    body: "Reduces render-blocking time on first paint across all templates."
  }
];

function impactColor(impact: Recommendation["impact"]) {
  if (impact === "High") {
    return { bg: "var(--success-bg)", fg: "var(--success-fg)" };
  }
  if (impact === "Medium") {
    return { bg: "var(--warning-bg)", fg: "var(--warning-fg)" };
  }
  return { bg: "var(--bg-muted)", fg: "var(--fg-muted)" };
}

export function RecommendationsStrip() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
      {RECOMMENDATIONS.map((recommendation) => {
        const color = impactColor(recommendation.impact);

        return (
          <article
            key={recommendation.title}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 9999,
                  background: color.bg,
                  color: color.fg
                }}
              >
                {recommendation.impact} impact
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "3px 10px",
                  borderRadius: 9999,
                  background: "var(--bg-muted)",
                  color: "var(--fg-secondary)"
                }}
              >
                {recommendation.category}
              </span>
            </div>

            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--fg-primary)", lineHeight: 1.35 }}>
              {recommendation.title}
            </h3>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--fg-secondary)", lineHeight: 1.5 }}>
              {recommendation.body}
            </p>
          </article>
        );
      })}
    </div>
  );
}
