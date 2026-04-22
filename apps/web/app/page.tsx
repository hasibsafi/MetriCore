import { FeatureGrid } from "../src/components/marketing/feature-grid";
import { FooterCTA } from "../src/components/marketing/footer-cta";
import { Hero } from "../src/components/marketing/hero";
import { IntegrationsGrid } from "../src/components/marketing/integrations-grid";
import { MetricsBreakdown } from "../src/components/marketing/metrics-breakdown";
import { RecommendationsStrip } from "../src/components/marketing/recommendations-strip";
import { Section } from "../src/components/marketing/section";
import { Topbar } from "../src/components/marketing/topbar";

export default function HomePage() {
  return (
    <main>
      <Topbar />
      <Hero />

      <Section
        id="product"
        eyebrow="The product"
        title="Everything you need to manage site performance — in one view."
        subtitle="MetriCore is a multi-tenant dashboard built for teams juggling dozens of client sites. Connect once, monitor continuously, act on what matters."
        style={{ background: "var(--bg-subtle)" }}
      >
        <FeatureGrid />
      </Section>

      <Section
        id="metrics"
        eyebrow="Metrics we track"
        title="GA4, Search Console, and PageSpeed — stitched together."
        subtitle="Every data source you already use, normalized and compared. No spreadsheet gymnastics, no dashboards of dashboards."
      >
        <MetricsBreakdown />
      </Section>

      <Section
        id="recs"
        eyebrow="Recommendations"
        title="Advice that's scoped to your site, not a checklist."
        subtitle="Rule-based recommendations are tagged by impact and category, so the work is already prioritized when you open the tab."
        style={{ background: "var(--bg-subtle)" }}
      >
        <RecommendationsStrip />
      </Section>

      <Section
        id="integrations"
        eyebrow="Integrations"
        title="Your stack, already connected."
        subtitle="OAuth into Google services in a single click. Background scans powered by a proper job queue. Type-safe all the way down."
      >
        <IntegrationsGrid />
      </Section>

      <FooterCTA />
    </main>
  );
}
