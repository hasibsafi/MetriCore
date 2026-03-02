import { fetchGoogleJsonWithRetry } from "./google-api-client";

type GscRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type GscResponse = {
  rows?: GscRow[];
  responseAggregationType?: string;
};

function getDateRangeStrings(rangeDays: number) {
  const today = new Date();
  const endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1));
  const startDate = new Date(endDate);
  startDate.setUTCDate(endDate.getUTCDate() - Math.max(1, rangeDays - 1));

  const toDateString = (value: Date) => value.toISOString().slice(0, 10);

  return {
    startDate,
    endDate,
    startDateText: toDateString(startDate),
    endDateText: toDateString(endDate)
  };
}

function toNumber(value: number | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function fetchGscSnapshot(input: {
  gscSiteUrl: string;
  accessToken: string;
  rangeDays: number;
}) {
  const { startDateText, endDateText } = getDateRangeStrings(input.rangeDays);
  const encodedSite = encodeURIComponent(input.gscSiteUrl);
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

  const [summary, byQuery, byPage] = await Promise.all([
    fetchGoogleJsonWithRetry<GscResponse>({
      url: endpoint,
      accessToken: input.accessToken,
      method: "POST",
      body: {
        startDate: startDateText,
        endDate: endDateText,
        dataState: "all"
      }
    }),
    fetchGoogleJsonWithRetry<GscResponse>({
      url: endpoint,
      accessToken: input.accessToken,
      method: "POST",
      body: {
        startDate: startDateText,
        endDate: endDateText,
        dimensions: ["query"],
        rowLimit: 100,
        dataState: "all"
      }
    }),
    fetchGoogleJsonWithRetry<GscResponse>({
      url: endpoint,
      accessToken: input.accessToken,
      method: "POST",
      body: {
        startDate: startDateText,
        endDate: endDateText,
        dimensions: ["page"],
        rowLimit: 100,
        dataState: "all"
      }
    })
  ]);

  const summaryRow = summary.rows?.[0];

  const topQueries = (byQuery.rows ?? []).map((row) => ({
    query: row.keys?.[0] ?? "",
    clicks: toNumber(row.clicks),
    impressions: toNumber(row.impressions),
    ctr: toNumber(row.ctr),
    position: toNumber(row.position)
  }));

  const topPages = (byPage.rows ?? []).map((row) => ({
    page: row.keys?.[0] ?? "",
    clicks: toNumber(row.clicks),
    impressions: toNumber(row.impressions),
    ctr: toNumber(row.ctr),
    position: toNumber(row.position)
  }));

  return {
    clicks: Math.round(toNumber(summaryRow?.clicks)),
    impressions: Math.round(toNumber(summaryRow?.impressions)),
    ctr: toNumber(summaryRow?.ctr),
    position: toNumber(summaryRow?.position),
    topQueries,
    topPages
  };
}
