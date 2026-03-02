export const RecommendationPriority = {
  P0: "P0",
  P1: "P1",
  P2: "P2"
} as const;

export const RecommendationImpact = {
  high: "high",
  med: "med",
  low: "low"
} as const;

export const RecommendationStatus = {
  open: "open",
  done: "done"
} as const;

export type RecommendationPriorityValue = (typeof RecommendationPriority)[keyof typeof RecommendationPriority];
export type RecommendationImpactValue = (typeof RecommendationImpact)[keyof typeof RecommendationImpact];
export type RecommendationStatusValue = (typeof RecommendationStatus)[keyof typeof RecommendationStatus];

export type RecommendationInput = {
  key: string;
  category: string;
  title: string;
  description: string;
  impact: RecommendationImpactValue;
  priority: RecommendationPriorityValue;
};

type RecommendationDataInput = {
  pageSpeed?: {
    performanceScore: number | null;
    lcpMs: number | null;
    cls: number | null;
    tbtMs: number | null;
  } | null;
  ga4?: {
    sessions: number;
    users: number;
    topPages: Array<{ path: string; sessions: number; users: number }>;
  } | null;
  previousGa4?: {
    sessions: number;
    users: number;
  } | null;
  gsc?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
    topPages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>;
  } | null;
  integration?: {
    hasGa4Property: boolean;
    hasGscSiteUrl: boolean;
    connected: boolean;
  } | null;
};

function uniqueByKey(input: RecommendationInput[]) {
  const seen = new Set<string>();
  const output: RecommendationInput[] = [];

  for (const item of input) {
    if (seen.has(item.key)) {
      continue;
    }

    seen.add(item.key);
    output.push(item);
  }

  return output;
}

export function buildDeterministicRecommendations(input: RecommendationDataInput): RecommendationInput[] {
  const recommendations: RecommendationInput[] = [];

  if (!input.integration?.connected) {
    recommendations.push({
      key: "integration:connect-google",
      category: "General",
      title: "Connect Google integrations",
      description: "Connect Google to unlock GA4 and Search Console recommendations for this site.",
      impact: RecommendationImpact.med,
      priority: RecommendationPriority.P2
    });
  }

  if (!input.integration?.hasGa4Property) {
    recommendations.push({
      key: "integration:ga4-property-missing",
      category: "Analytics",
      title: "Set GA4 property ID",
      description: "Set a GA4 property ID in Settings so analytics snapshots can be collected.",
      impact: RecommendationImpact.med,
      priority: RecommendationPriority.P2
    });
  }

  if (!input.integration?.hasGscSiteUrl) {
    recommendations.push({
      key: "integration:gsc-site-missing",
      category: "Search",
      title: "Set Search Console property",
      description: "Set a valid Search Console property (sc-domain or URL-prefix) to collect search performance data.",
      impact: RecommendationImpact.med,
      priority: RecommendationPriority.P2
    });
  }

  if (!input.pageSpeed) {
    recommendations.push({
      key: "pagespeed:missing",
      category: "Performance",
      title: "Run a PageSpeed scan",
      description: "Run a PageSpeed scan to generate performance-specific recommendations.",
      impact: RecommendationImpact.med,
      priority: RecommendationPriority.P2
    });
  }

  if (!input.ga4) {
    recommendations.push({
      key: "ga4:missing",
      category: "Analytics",
      title: "Fetch GA4 snapshot",
      description: "Run a GA4 snapshot to unlock traffic and engagement recommendations.",
      impact: RecommendationImpact.med,
      priority: RecommendationPriority.P2
    });
  }

  if (!input.gsc) {
    recommendations.push({
      key: "gsc:missing",
      category: "Search",
      title: "Fetch Search Console snapshot",
      description: "Run a Search Console snapshot to unlock CTR and ranking recommendations.",
      impact: RecommendationImpact.med,
      priority: RecommendationPriority.P2
    });
  }

  if (input.pageSpeed) {
    const { performanceScore, lcpMs, cls, tbtMs } = input.pageSpeed;

    if (performanceScore !== null && performanceScore < 60) {
      recommendations.push({
        key: "pagespeed:score-low",
        category: "Performance",
        title: "Reduce JavaScript payload and apply code-splitting",
        description: "Performance score is below 60. Reduce bundle size, defer non-critical scripts, and split large routes.",
        impact: RecommendationImpact.high,
        priority: RecommendationPriority.P0
      });
    }

    if (lcpMs !== null && lcpMs > 2500) {
      recommendations.push({
        key: "pagespeed:lcp-high",
        category: "Performance",
        title: "Improve LCP for above-the-fold content",
        description: "LCP exceeds 2.5s. Optimize hero images, preload critical assets, and reduce render-blocking resources.",
        impact: RecommendationImpact.high,
        priority: lcpMs > 4000 ? RecommendationPriority.P0 : RecommendationPriority.P1
      });
    }

    if (cls !== null && cls > 0.1) {
      recommendations.push({
        key: "pagespeed:cls-high",
        category: "Performance",
        title: "Stabilize layout to reduce CLS",
        description: "CLS is above 0.1. Set fixed media dimensions and avoid injecting late layout-shifting banners.",
        impact: RecommendationImpact.med,
        priority: RecommendationPriority.P1
      });
    }

    if (tbtMs !== null && tbtMs > 300) {
      recommendations.push({
        key: "pagespeed:tbt-high",
        category: "Performance",
        title: "Reduce long main-thread tasks",
        description: "Total Blocking Time is elevated. Break long tasks, trim third-party scripts, and move heavy work off the main thread.",
        impact: RecommendationImpact.med,
        priority: RecommendationPriority.P1
      });
    }
  }

  if (input.gsc) {
    const { impressions, ctr, position, topQueries, topPages } = input.gsc;

    if (impressions > 5000 && ctr < 0.025) {
      recommendations.push({
        key: "gsc:high-impressions-low-ctr",
        category: "Search",
        title: "Improve titles and meta descriptions for high-impression pages",
        description: "Impressions are high but CTR is low. Rewrite snippets for top pages/queries and align SERP intent.",
        impact: RecommendationImpact.med,
        priority: RecommendationPriority.P1
      });
    }

    if (impressions > 3000 && position >= 8 && position <= 20) {
      recommendations.push({
        key: "gsc:position-opportunity",
        category: "Search",
        title: "Refresh content for page-2 ranking queries",
        description: "Average position is between 8 and 20 with meaningful impressions. Refresh content depth and internal linking for ranking lift.",
        impact: RecommendationImpact.med,
        priority: RecommendationPriority.P2
      });
    }

    const topQuery = topQueries[0];
    const topPage = topPages[0];
    if (topQuery && topPage) {
      const normalizedQuery = topQuery.query.toLowerCase();
      const normalizedPage = topPage.page.toLowerCase();

      if (!normalizedPage.includes(normalizedQuery.split(" ")[0] ?? "")) {
        recommendations.push({
          key: "gsc:intent-mismatch",
          category: "Search",
          title: "Align page intent with top query",
          description: "Top query intent appears misaligned with the highest-traffic landing page. Update headings and intro copy to better match query intent.",
          impact: RecommendationImpact.low,
          priority: RecommendationPriority.P2
        });
      }
    }
  }

  if (input.ga4) {
    const { sessions, topPages } = input.ga4;

    if (input.previousGa4 && input.previousGa4.sessions > 0) {
      const sessionDrop = (input.previousGa4.sessions - sessions) / input.previousGa4.sessions;
      if (sessionDrop >= 0.15) {
        recommendations.push({
          key: "ga4:sessions-down",
          category: "Analytics",
          title: "Investigate recent traffic drop",
          description: "Sessions are down by at least 15% versus the previous snapshot. Review landing page changes, rankings, and acquisition channels.",
          impact: RecommendationImpact.med,
          priority: RecommendationPriority.P1
        });
      }
    }

    const totalTopSessions = topPages.reduce((sum, page) => sum + Math.max(0, page.sessions), 0);
    const firstPageSessions = topPages[0]?.sessions ?? 0;

    if (totalTopSessions > 0 && firstPageSessions / totalTopSessions >= 0.6) {
      recommendations.push({
        key: "ga4:traffic-concentration",
        category: "Analytics",
        title: "Reduce traffic concentration on a single page",
        description: "A large share of traffic is concentrated on one page. Add internal links and supporting content to distribute visits.",
        impact: RecommendationImpact.low,
        priority: RecommendationPriority.P2
      });
    }
  }

  recommendations.push({
    key: "general:weekly-schedule",
    category: "General",
    title: "Run scans and snapshots on a weekly cadence",
    description: "Schedule weekly PageSpeed, GA4, and GSC runs so recommendations remain current and trend-aware.",
    impact: RecommendationImpact.low,
    priority: RecommendationPriority.P2
  });

  return uniqueByKey(recommendations).slice(0, 20);
}
