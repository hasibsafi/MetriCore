import {
  JobType,
  RecommendationPriority,
  RecommendationStatus,
  ScanRunType,
  buildDeterministicRecommendations
} from "@metricore/shared";
import { MembershipRole, RecommendationPriority as PrismaRecommendationPriority, RecommendationStatus as PrismaRecommendationStatus } from "@prisma/client";
import { createAuditLog } from "../repositories/audit-log-repository";
import { getLatestPageSpeed } from "../repositories/page-speed-repository";
import {
  createManyRecommendations,
  getOpenRecommendationsCount,
  listRecommendations,
  markRecommendationDone
} from "../repositories/recommendation-repository";
import { createQueuedScanRun } from "../repositories/scan-run-repository";
import { getLatestGSCSnapshot, getLatestTwoGA4Snapshots } from "../repositories/snapshot-repository";
import { getIntegrations } from "../repositories/site-integrations-repository";
import { getOrgSiteById } from "../repositories/site-repository";
import { enqueueJob } from "../lib/queue";
import { enforceRecommendationsTriggerRateLimit } from "./rate-limit-service";

export class RecommendationSiteNotFoundError extends Error {
  readonly status = 404;

  constructor() {
    super("Site not found.");
    this.name = "RecommendationSiteNotFoundError";
  }
}

export class RecommendationNotFoundError extends Error {
  readonly status = 404;

  constructor() {
    super("Recommendation not found.");
    this.name = "RecommendationNotFoundError";
  }
}

async function ensureSite(orgId: string, siteId: string) {
  const site = await getOrgSiteById(orgId, siteId);
  if (!site) {
    throw new RecommendationSiteNotFoundError();
  }

  return site;
}

function parseTopPages(value: unknown): Array<{ path: string; sessions: number; users: number }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }

      const record = row as Record<string, unknown>;
      const path = typeof record.path === "string" ? record.path : "/";
      const sessions = Number(record.sessions ?? 0);
      const users = Number(record.users ?? 0);

      return {
        path,
        sessions: Number.isFinite(sessions) ? sessions : 0,
        users: Number.isFinite(users) ? users : 0
      };
    })
    .filter((row): row is { path: string; sessions: number; users: number } => Boolean(row));
}

function parseTopQueries(value: unknown): Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }

      const record = row as Record<string, unknown>;

      return {
        query: typeof record.query === "string" ? record.query : "",
        clicks: Number(record.clicks ?? 0),
        impressions: Number(record.impressions ?? 0),
        ctr: Number(record.ctr ?? 0),
        position: Number(record.position ?? 0)
      };
    })
    .filter((row): row is { query: string; clicks: number; impressions: number; ctr: number; position: number } => Boolean(row));
}

function parseTopGscPages(value: unknown): Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }

      const record = row as Record<string, unknown>;

      return {
        page: typeof record.page === "string" ? record.page : "",
        clicks: Number(record.clicks ?? 0),
        impressions: Number(record.impressions ?? 0),
        ctr: Number(record.ctr ?? 0),
        position: Number(record.position ?? 0)
      };
    })
    .filter((row): row is { page: string; clicks: number; impressions: number; ctr: number; position: number } => Boolean(row));
}

export async function buildRecommendations(orgId: string, siteId: string) {
  await ensureSite(orgId, siteId);

  const [latestPageSpeed, latestGa4Rows, latestGsc, integrations, existingOpen] = await Promise.all([
    getLatestPageSpeed(orgId, siteId),
    getLatestTwoGA4Snapshots(orgId, siteId),
    getLatestGSCSnapshot(orgId, siteId),
    getIntegrations(orgId, siteId),
    listRecommendations(orgId, siteId, { status: PrismaRecommendationStatus.open })
  ]);

  const currentGa4 = latestGa4Rows[0] ?? null;
  const previousGa4 = latestGa4Rows[1] ?? null;

  const existingKeys = new Set(
    existingOpen
      .map((item) => {
        const metadata = item.metadataJson as { key?: unknown } | null;
        return typeof metadata?.key === "string" ? metadata.key : null;
      })
      .filter((item): item is string => Boolean(item))
  );

  const generated = buildDeterministicRecommendations({
    pageSpeed: latestPageSpeed
      ? {
          performanceScore: latestPageSpeed.performanceScore,
          lcpMs: latestPageSpeed.lcpMs,
          cls: latestPageSpeed.cls,
          tbtMs: latestPageSpeed.tbtMs
        }
      : null,
    ga4: currentGa4
      ? {
          sessions: currentGa4.sessions,
          users: currentGa4.users,
          topPages: parseTopPages(currentGa4.topPagesJson)
        }
      : null,
    previousGa4: previousGa4
      ? {
          sessions: previousGa4.sessions,
          users: previousGa4.users
        }
      : null,
    gsc: latestGsc
      ? {
          clicks: latestGsc.clicks,
          impressions: latestGsc.impressions,
          ctr: latestGsc.ctr,
          position: latestGsc.position,
          topQueries: parseTopQueries(latestGsc.topQueriesJson),
          topPages: parseTopGscPages(latestGsc.topPagesJson)
        }
      : null,
    integration: {
      hasGa4Property: Boolean(integrations?.ga4PropertyId),
      hasGscSiteUrl: Boolean(integrations?.gscSiteUrl),
      connected: Boolean(integrations?.connectedAt)
    }
  });

  const newRecommendations = generated.filter((item) => !existingKeys.has(item.key));

  const result = await createManyRecommendations(
    orgId,
    siteId,
    newRecommendations.map((item) => ({
      category: item.category,
      title: item.title,
      description: item.description,
      impact: item.impact,
      priority: item.priority,
      status: RecommendationStatus.open,
      metadataJson: {
        key: item.key,
        source: "rules-v1"
      }
    }))
  );

  return {
    createdCount: result.count,
    generatedCount: generated.length
  };
}

export async function enqueueRecommendationsBuild(input: {
  actorUserId: string;
  orgId: string;
  siteId: string;
  ipAddress: string;
}) {
  await enforceRecommendationsTriggerRateLimit({
    orgId: input.orgId,
    ipAddress: input.ipAddress
  });

  await ensureSite(input.orgId, input.siteId);

  const scanRunId = await createQueuedScanRun({
    orgId: input.orgId,
    siteId: input.siteId,
    type: ScanRunType.BUILD_RECOMMENDATIONS
  });

  const job = await enqueueJob(JobType.BUILD_RECOMMENDATIONS, {
    orgId: input.orgId,
    siteId: input.siteId,
    scanRunId
  });

  await createAuditLog({
    orgId: input.orgId,
    actorUserId: input.actorUserId,
    action: "recommendation.built.requested",
    entityType: "scanRun",
    entityId: scanRunId,
    metadataJson: {
      siteId: input.siteId,
      type: ScanRunType.BUILD_RECOMMENDATIONS
    }
  });

  return {
    scanRunId,
    jobId: String(job.id)
  };
}

export async function getRecommendations(
  orgId: string,
  siteId: string,
  filters: { status?: PrismaRecommendationStatus; priority?: PrismaRecommendationPriority }
) {
  await ensureSite(orgId, siteId);

  const [recommendations, openCount] = await Promise.all([
    listRecommendations(orgId, siteId, {
      status: filters.status as PrismaRecommendationStatus | undefined,
      priority: filters.priority as PrismaRecommendationPriority | undefined
    }),
    getOpenRecommendationsCount(orgId, siteId)
  ]);

  return {
    openCount,
    recommendations
  };
}

export async function markRecommendationDoneById(input: {
  actorUserId: string;
  orgId: string;
  siteId: string;
  recId: string;
}) {
  await ensureSite(input.orgId, input.siteId);

  const result = await markRecommendationDone(input.orgId, input.siteId, input.recId);
  if (result.count === 0) {
    throw new RecommendationNotFoundError();
  }

  await createAuditLog({
    orgId: input.orgId,
    actorUserId: input.actorUserId,
    action: "recommendation.done",
    entityType: "recommendation",
    entityId: input.recId,
    metadataJson: {
      siteId: input.siteId
    }
  });

  return { success: true };
}

export function canMarkRecommendations(role: MembershipRole | null | undefined) {
  if (!role) {
    return false;
  }

  return role === MembershipRole.owner || role === MembershipRole.admin || role === MembershipRole.member;
}
