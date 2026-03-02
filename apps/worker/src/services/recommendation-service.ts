import { BuildRecommendationsPayload, RecommendationStatus, ScanRunType, buildDeterministicRecommendations } from "@metricore/shared";
import { Prisma } from "@prisma/client";
import { createWorkerAuditLog } from "../repositories/audit-log-repository";
import { getLatestPageSpeed } from "../repositories/page-speed-repository";
import { createManyRecommendations, listOpenRecommendationKeys } from "../repositories/recommendation-repository";
import { getScanRunById, markScanRunCompleted, markScanRunRunning } from "../repositories/scan-run-repository";
import { getSiteIntegration } from "../repositories/site-integrations-repository";
import { getLatestGSCSnapshot, getLatestTwoGA4Snapshots } from "../repositories/snapshot-repository";

function validateScanRun(
  scanRun: Awaited<ReturnType<typeof getScanRunById>>,
  payload: { orgId: string; siteId: string; scanRunId: string },
  expectedType: (typeof ScanRunType)[keyof typeof ScanRunType]
) {
  if (!scanRun || scanRun.orgId !== payload.orgId || scanRun.siteId !== payload.siteId || scanRun.type !== expectedType) {
    throw new Error("Scan run ownership check failed.");
  }
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

export async function processBuildRecommendations(payload: BuildRecommendationsPayload, jobId: string) {
  const scanRun = await getScanRunById(payload.scanRunId);
  validateScanRun(scanRun, payload, ScanRunType.BUILD_RECOMMENDATIONS);

  await markScanRunRunning(payload.scanRunId);
  console.log(
    `[worker] BUILD_RECOMMENDATIONS running jobId=${jobId} orgId=${payload.orgId} siteId=${payload.siteId} scanRunId=${payload.scanRunId}`
  );

  const [latestPageSpeed, latestGa4Rows, latestGsc, integrations, existingKeys] = await Promise.all([
    getLatestPageSpeed(payload.orgId, payload.siteId),
    getLatestTwoGA4Snapshots(payload.orgId, payload.siteId),
    getLatestGSCSnapshot(payload.orgId, payload.siteId),
    getSiteIntegration(payload.orgId, payload.siteId),
    listOpenRecommendationKeys(payload.orgId, payload.siteId)
  ]);

  const currentGa4 = latestGa4Rows[0] ?? null;
  const previousGa4 = latestGa4Rows[1] ?? null;

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

  const existingKeySet = new Set(existingKeys);
  const newRecommendations = generated.filter((item) => !existingKeySet.has(item.key));

  const createResult = await createManyRecommendations(
    payload.orgId,
    payload.siteId,
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
      } as Prisma.InputJsonValue
    }))
  );

  await markScanRunCompleted(payload.scanRunId);
  await createWorkerAuditLog({
    orgId: payload.orgId,
    action: "recommendation.build.completed",
    entityType: "scanRun",
    entityId: payload.scanRunId,
    metadataJson: {
      siteId: payload.siteId,
      type: ScanRunType.BUILD_RECOMMENDATIONS,
      generatedCount: generated.length,
      createdCount: createResult.count
    }
  });

  console.log(
    `[worker] BUILD_RECOMMENDATIONS completed jobId=${jobId} orgId=${payload.orgId} siteId=${payload.siteId} scanRunId=${payload.scanRunId} generated=${generated.length} created=${createResult.count}`
  );
}
