import { fetchGoogleJsonWithRetry } from "./google-api-client";

type Ga4MetricValue = {
  value?: string;
};

type Ga4DimensionValue = {
  value?: string;
};

type Ga4Row = {
  dimensionValues?: Ga4DimensionValue[];
  metricValues?: Ga4MetricValue[];
};

type Ga4RunReportResponse = {
  rows?: Ga4Row[];
  totals?: Array<{ metricValues?: Ga4MetricValue[] }>;
};

function parseMetric(value: string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function fetchGa4Snapshot(input: {
  ga4PropertyId: string;
  accessToken: string;
  rangeDays: number;
}) {
  const endpoint = `https://analyticsdata.googleapis.com/v1beta/${input.ga4PropertyId}:runReport`;
  const rangeDays = Math.max(1, Math.floor(input.rangeDays));
  const baseRange = [{ startDate: `${rangeDays}daysAgo`, endDate: "yesterday" }];

  const [summary, topPages] = await Promise.all([
    fetchGoogleJsonWithRetry<Ga4RunReportResponse>({
      url: endpoint,
      accessToken: input.accessToken,
      method: "POST",
      body: {
        dateRanges: baseRange,
        metrics: [{ name: "sessions" }, { name: "totalUsers" }]
      }
    }),
    fetchGoogleJsonWithRetry<Ga4RunReportResponse>({
      url: endpoint,
      accessToken: input.accessToken,
      method: "POST",
      body: {
        dateRanges: baseRange,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 20
      }
    })
  ]);

  const summaryTotals = summary.totals?.[0]?.metricValues ?? [];
  const sessions = Math.round(parseMetric(summaryTotals[0]?.value));
  const users = Math.round(parseMetric(summaryTotals[1]?.value));

  const topPagesRows = (topPages.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "/",
    sessions: Math.round(parseMetric(row.metricValues?.[0]?.value)),
    users: Math.round(parseMetric(row.metricValues?.[1]?.value))
  }));

  return {
    sessions,
    users,
    topPages: topPagesRows
  };
}
