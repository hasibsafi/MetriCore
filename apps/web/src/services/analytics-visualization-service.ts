import { getPageSpeedHistory } from "../repositories/page-speed-repository";
import { getGA4History, getGSCHistory } from "../repositories/snapshot-repository";
import { getIntegrations } from "../repositories/site-integrations-repository";
import { getOrgSiteById } from "../repositories/site-repository";

type TrendDirection = "up" | "down" | "flat";

type DeltaMetric = {
  absolute: number;
  percent: number;
  direction: TrendDirection;
};

export class VisualizationSiteNotFoundError extends Error {
  readonly status = 404;

  constructor() {
    super("Site not found.");
    this.name = "VisualizationSiteNotFoundError";
  }
}

function parseDays(range: string | null) {
  if (range === "7d") {
    return 7;
  }

  if (range === "90d") {
    return 90;
  }

  return 30;
}

function normalizeRange(range: string | null) {
  if (range === "7d" || range === "90d") {
    return range;
  }

  return "30d";
}

function toDelta(current: number, previous: number): DeltaMetric {
  const absolute = Number((current - previous).toFixed(2));

  if (previous === 0) {
    if (current === 0) {
      return { absolute, percent: 0, direction: "flat" };
    }

    return {
      absolute,
      percent: 100,
      direction: current > 0 ? "up" : "down"
    };
  }

  const percent = Number((((current - previous) / Math.abs(previous)) * 100).toFixed(2));

  if (percent > 0) {
    return { absolute, percent, direction: "up" };
  }

  if (percent < 0) {
    return { absolute, percent, direction: "down" };
  }

  return { absolute, percent: 0, direction: "flat" };
}

function asTopPages(raw: unknown) {
  if (!Array.isArray(raw)) {
    return [] as Array<{ path: string; sessions: number; users: number }>;
  }

  return raw
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }

      const value = row as { path?: unknown; sessions?: unknown; users?: unknown };
      const path = typeof value.path === "string" ? value.path : "";
      if (!path) {
        return null;
      }

      return {
        path,
        sessions: Number(value.sessions ?? 0),
        users: Number(value.users ?? 0)
      };
    })
    .filter((row): row is { path: string; sessions: number; users: number } => row !== null)
    .sort((a, b) => b.sessions - a.sessions);
}

function asTopQueries(raw: unknown) {
  if (!Array.isArray(raw)) {
    return [] as Array<{ query: string; clicks: number; impressions: number; ctr: number }>;
  }

  return raw
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }

      const value = row as { query?: unknown; clicks?: unknown; impressions?: unknown; ctr?: unknown };
      const query = typeof value.query === "string" ? value.query : "";
      if (!query) {
        return null;
      }

      return {
        query,
        clicks: Number(value.clicks ?? 0),
        impressions: Number(value.impressions ?? 0),
        ctr: Number(value.ctr ?? 0)
      };
    })
    .filter((row): row is { query: string; clicks: number; impressions: number; ctr: number } => row !== null)
    .sort((a, b) => b.clicks - a.clicks);
}

function asGscTopPages(raw: unknown) {
  if (!Array.isArray(raw)) {
    return [] as Array<{ page: string; clicks: number; impressions: number; ctr: number }>;
  }

  return raw
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }

      const value = row as { page?: unknown; clicks?: unknown; impressions?: unknown; ctr?: unknown };
      const page = typeof value.page === "string" ? value.page : "";
      if (!page) {
        return null;
      }

      return {
        page,
        clicks: Number(value.clicks ?? 0),
        impressions: Number(value.impressions ?? 0),
        ctr: Number(value.ctr ?? 0)
      };
    })
    .filter((row): row is { page: string; clicks: number; impressions: number; ctr: number } => row !== null)
    .sort((a, b) => b.clicks - a.clicks);
}

async function ensureSite(orgId: string, siteId: string) {
  const site = await getOrgSiteById(orgId, siteId);
  if (!site) {
    throw new VisualizationSiteNotFoundError();
  }

  return site;
}

export async function getHealthHistory(orgId: string, siteId: string, range: string | null) {
  const days = parseDays(range);
  const [site, history] = await Promise.all([ensureSite(orgId, siteId), getPageSpeedHistory(orgId, siteId, days)]);

  const points = history.map((item) => ({
    date: item.createdAt.toISOString(),
    performanceScore: item.performanceScore,
    lcpMs: item.lcpMs,
    cls: item.cls,
    tbtMs: item.tbtMs,
     fcpMs: item.fcpMs,
     ttfbMs: item.ttfbMs,
     desktopPerformanceScore: item.desktopPerformanceScore ?? null,
     desktopLcpMs: item.desktopLcpMs ?? null,
     desktopCls: item.desktopCls ?? null,
     desktopTbtMs: item.desktopTbtMs ?? null,
     desktopFcpMs: item.desktopFcpMs ?? null,
     desktopTtfbMs: item.desktopTtfbMs ?? null
  }));

  const latest = history[history.length - 1] ?? null;
  const previous = history[history.length - 2] ?? null;

  return {
    site,
    range: `${days}d`,
    points,
    delta:
      latest && previous
        ? {
            current: {
              date: latest.createdAt.toISOString(),
              performanceScore: latest.performanceScore,
              lcpMs: latest.lcpMs,
              cls: latest.cls,
              tbtMs: latest.tbtMs,
              fcpMs: latest.fcpMs,
              ttfbMs: latest.ttfbMs
            },
            previous: {
              date: previous.createdAt.toISOString(),
              performanceScore: previous.performanceScore,
              lcpMs: previous.lcpMs,
              cls: previous.cls,
              tbtMs: previous.tbtMs,
              fcpMs: previous.fcpMs,
              ttfbMs: previous.ttfbMs
            },
            changes: {
              performanceScore: toDelta(Number(latest.performanceScore ?? 0), Number(previous.performanceScore ?? 0)),
              lcpMs: toDelta(Number(latest.lcpMs ?? 0), Number(previous.lcpMs ?? 0)),
              cls: toDelta(Number(latest.cls ?? 0), Number(previous.cls ?? 0)),
              tbtMs: toDelta(Number(latest.tbtMs ?? 0), Number(previous.tbtMs ?? 0))
            }
          }
        : null
  };
}

export async function getAnalyticsHistory(orgId: string, siteId: string, range: string | null) {
  const days = parseDays(range);
  const normalizedRange = normalizeRange(range);
  const [site, integrations, history] = await Promise.all([
    ensureSite(orgId, siteId),
    getIntegrations(orgId, siteId),
    getGA4History(orgId, siteId, normalizedRange)
  ]);

  const points = history.map((item) => ({
    date: item.createdAt.toISOString(),
    sessions: item.sessions,
    users: item.users
  }));

  const latest = history[history.length - 1] ?? null;
  const previous = history[history.length - 2] ?? null;

  return {
    site,
    range: normalizedRange,
    integrations: integrations
      ? {
          ga4PropertyId: integrations.ga4PropertyId,
          gscSiteUrl: integrations.gscSiteUrl,
          googleEmail: integrations.googleEmail,
          connectedAt: integrations.connectedAt,
          connected: Boolean(integrations.connectedAt)
        }
      : null,
    points,
    topPages: asTopPages(latest?.topPagesJson),
    delta:
      latest && previous
        ? {
            current: {
              date: latest.createdAt.toISOString(),
              sessions: latest.sessions,
              users: latest.users
            },
            previous: {
              date: previous.createdAt.toISOString(),
              sessions: previous.sessions,
              users: previous.users
            },
            changes: {
              sessions: toDelta(latest.sessions, previous.sessions),
              users: toDelta(latest.users, previous.users)
            }
          }
        : null
  };
}

export async function getSearchHistory(orgId: string, siteId: string, range: string | null) {
  const days = parseDays(range);
  const normalizedRange = normalizeRange(range);
  const [site, integrations, history] = await Promise.all([
    ensureSite(orgId, siteId),
    getIntegrations(orgId, siteId),
    getGSCHistory(orgId, siteId, normalizedRange)
  ]);

  const points = history.map((item) => ({
    date: item.createdAt.toISOString(),
    clicks: item.clicks,
    impressions: item.impressions,
    ctr: item.ctr,
    position: item.position
  }));

  const latest = history[history.length - 1] ?? null;
  const previous = history[history.length - 2] ?? null;

  return {
    site,
    range: normalizedRange,
    integrations: integrations
      ? {
          ga4PropertyId: integrations.ga4PropertyId,
          gscSiteUrl: integrations.gscSiteUrl,
          googleEmail: integrations.googleEmail,
          connectedAt: integrations.connectedAt,
          connected: Boolean(integrations.connectedAt)
        }
      : null,
    points,
    topQueries: asTopQueries(latest?.topQueriesJson),
    topPages: asGscTopPages(latest?.topPagesJson),
    delta:
      latest && previous
        ? {
            current: {
              date: latest.createdAt.toISOString(),
              clicks: latest.clicks,
              impressions: latest.impressions,
              ctr: latest.ctr,
              position: latest.position
            },
            previous: {
              date: previous.createdAt.toISOString(),
              clicks: previous.clicks,
              impressions: previous.impressions,
              ctr: previous.ctr,
              position: previous.position
            },
            changes: {
              clicks: toDelta(latest.clicks, previous.clicks),
              impressions: toDelta(latest.impressions, previous.impressions),
              ctr: toDelta(latest.ctr, previous.ctr),
              position: toDelta(latest.position, previous.position)
            }
          }
        : null
  };
}
