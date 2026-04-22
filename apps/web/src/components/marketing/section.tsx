import type { CSSProperties, ReactNode } from "react";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  style?: CSSProperties;
};

export function Section({ id, eyebrow, title, subtitle, children, style }: SectionProps) {
  return (
    <section id={id} style={{ padding: "96px 0", ...(style ?? {}) }}>
      <div className="mc-container">
        <div style={{ maxWidth: 720, marginBottom: 56 }}>
          {eyebrow ? <div className="mc-eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div> : null}
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 600,
              color: "var(--fg-primary)",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              textWrap: "balance"
            }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              style={{
                margin: "16px 0 0",
                fontSize: 17,
                color: "var(--fg-secondary)",
                lineHeight: 1.55,
                maxWidth: 640,
                textWrap: "pretty"
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
