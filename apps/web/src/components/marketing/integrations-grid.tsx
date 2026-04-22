import { Icons } from "./icons";

const INTEGRATIONS = [
  { name: "Google Analytics", sub: "GA4" },
  { name: "Search Console", sub: "GSC" },
  { name: "PageSpeed", sub: "Lighthouse" },
  { name: "Google OAuth", sub: "One-click connect" },
  { name: "Webhooks", sub: "Snapshot exports" },
  { name: "CSV & JSON", sub: "Report downloads" }
];

export function IntegrationsGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 0,
        border: "1px solid var(--border-default)",
        borderRadius: 16,
        background: "var(--bg-surface)",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
      }}
    >
      {INTEGRATIONS.map((integration, index) => (
        <div
          key={integration.name}
          style={{
            padding: "24px 20px",
            borderRight: index % 3 !== 2 ? "1px solid var(--border-default)" : "none",
            borderBottom: index < 3 ? "1px solid var(--border-default)" : "none",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "flex-start"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--sky-50)",
                color: "var(--accent-text)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--sky-100)"
              }}
            >
              <Icons.Plug width={16} height={16} />
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-primary)" }}>
                {integration.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 1 }}>{integration.sub}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
