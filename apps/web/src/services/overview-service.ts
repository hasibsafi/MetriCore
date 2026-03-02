import { getLatestGA4Snapshot, getLatestGSCSnapshot } from "../repositories/snapshot-repository";
import { getOrgSiteById } from "../repositories/site-repository";

export class OverviewSiteNotFoundError extends Error {
  readonly status = 404;

  constructor() {
    super("Site not found.");
    this.name = "OverviewSiteNotFoundError";
  }
}

type SnapshotRange = "7d" | "30d" | "90d";

function normalizeRange(range: SnapshotRange | null | undefined): SnapshotRange {
  if (range === "7d" || range === "90d") {
    return range;
  }

  return "30d";
}

async function ensureSite(orgId: string, siteId: string) {
  const site = await getOrgSiteById(orgId, siteId);
  if (!site) {
    throw new OverviewSiteNotFoundError();
  }

  return site;
}

export async function getOverviewSnapshot(orgId: string, siteId: string, range: SnapshotRange | null | undefined) {
  const normalizedRange = normalizeRange(range);

  const [site, ga4, gsc] = await Promise.all([
    ensureSite(orgId, siteId),
    getLatestGA4Snapshot(orgId, siteId, normalizedRange),
    getLatestGSCSnapshot(orgId, siteId, normalizedRange)
  ]);

  return {
    site,
    range: normalizedRange,
    ga4: ga4
      ? {
          sessions: ga4.sessions,
          users: ga4.users,
          dateStart: ga4.dateStart.toISOString(),
          dateEnd: ga4.dateEnd.toISOString(),
          createdAt: ga4.createdAt.toISOString()
        }
      : null,
    gsc: gsc
      ? {
          clicks: gsc.clicks,
          impressions: gsc.impressions,
          dateStart: gsc.dateStart.toISOString(),
          dateEnd: gsc.dateEnd.toISOString(),
          createdAt: gsc.createdAt.toISOString()
        }
      : null
  };
}
