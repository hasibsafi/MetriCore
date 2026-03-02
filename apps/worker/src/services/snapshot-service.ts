import { Ga4SnapshotPayload, GscSnapshotPayload, ScanRunType } from "@metricore/shared";
import { Prisma } from "@prisma/client";
import { getScanRunById, markScanRunCompleted, markScanRunRunning } from "../repositories/scan-run-repository";
import { createGA4Snapshot, createGSCSnapshot } from "../repositories/snapshot-repository";
import { createWorkerAuditLog } from "../repositories/audit-log-repository";
import { getSiteIntegration } from "../repositories/site-integrations-repository";
import { fetchGa4Snapshot } from "./ga4-service";
import { refreshGoogleAccessToken } from "./google-auth-service";
import { fetchGscSnapshot } from "./gsc-service";

const SNAPSHOT_RANGES: Array<{ label: "7d" | "30d" | "90d"; days: number }> = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 }
];

function getSnapshotWindow(rangeDays = 28) {
  const now = new Date();
  const dateEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  const dateStart = new Date(dateEnd);
  dateStart.setUTCDate(dateEnd.getUTCDate() - Math.max(1, rangeDays - 1));

  return {
    dateStart,
    dateEnd
  };
}

function validateScanRun(
  scanRun: Awaited<ReturnType<typeof getScanRunById>>,
  payload: { orgId: string; siteId: string; scanRunId: string },
  expectedType: (typeof ScanRunType)[keyof typeof ScanRunType]
) {
  if (!scanRun || scanRun.orgId !== payload.orgId || scanRun.siteId !== payload.siteId || scanRun.type !== expectedType) {
    throw new Error("Scan run ownership check failed.");
  }
}

export async function processGa4Snapshot(payload: Ga4SnapshotPayload, jobId: string) {
  const scanRun = await getScanRunById(payload.scanRunId);
  validateScanRun(scanRun, payload, ScanRunType.GA4_SNAPSHOT);

  await markScanRunRunning(payload.scanRunId);
  console.log(
    `[worker] GA4_SNAPSHOT running jobId=${jobId} orgId=${payload.orgId} siteId=${payload.siteId} scanRunId=${payload.scanRunId}`
  );

  const integration = await getSiteIntegration(payload.orgId, payload.siteId);
  if (!integration?.googleRefreshToken) {
    throw new Error("Google not connected for this site.");
  }

  const ga4PropertyId = integration.ga4PropertyId;
  if (!ga4PropertyId) {
    throw new Error("GA4 property ID is not configured.");
  }

  const { accessToken } = await refreshGoogleAccessToken({
    orgId: payload.orgId,
    siteId: payload.siteId,
    encryptedRefreshToken: integration.googleRefreshToken
  });

  await Promise.all(
    SNAPSHOT_RANGES.map(async ({ label, days }) => {
      const ga4Snapshot = await fetchGa4Snapshot({
        ga4PropertyId,
        accessToken,
        rangeDays: days
      });

      const { dateStart, dateEnd } = getSnapshotWindow(days);

      await createGA4Snapshot({
        orgId: payload.orgId,
        siteId: payload.siteId,
        range: label,
        dateStart,
        dateEnd,
        sessions: ga4Snapshot.sessions,
        users: ga4Snapshot.users,
        topPagesJson: ga4Snapshot.topPages as Prisma.InputJsonValue
      });
    })
  );

  await markScanRunCompleted(payload.scanRunId);
  await createWorkerAuditLog({
    orgId: payload.orgId,
    action: "snapshot.pull.completed",
    entityType: "scanRun",
    entityId: payload.scanRunId,
    metadataJson: {
      siteId: payload.siteId,
      type: ScanRunType.GA4_SNAPSHOT
    }
  });
  console.log(
    `[worker] GA4_SNAPSHOT completed jobId=${jobId} orgId=${payload.orgId} siteId=${payload.siteId} scanRunId=${payload.scanRunId}`
  );
}

export async function processGscSnapshot(payload: GscSnapshotPayload, jobId: string) {
  const scanRun = await getScanRunById(payload.scanRunId);
  validateScanRun(scanRun, payload, ScanRunType.GSC_SNAPSHOT);

  await markScanRunRunning(payload.scanRunId);
  console.log(
    `[worker] GSC_SNAPSHOT running jobId=${jobId} orgId=${payload.orgId} siteId=${payload.siteId} scanRunId=${payload.scanRunId}`
  );

  const integration = await getSiteIntegration(payload.orgId, payload.siteId);
  if (!integration?.googleRefreshToken) {
    throw new Error("Google not connected for this site.");
  }

  const gscSiteUrl = integration.gscSiteUrl;
  if (!gscSiteUrl) {
    throw new Error("GSC site URL is not configured.");
  }

  const { accessToken } = await refreshGoogleAccessToken({
    orgId: payload.orgId,
    siteId: payload.siteId,
    encryptedRefreshToken: integration.googleRefreshToken
  });

  await Promise.all(
    SNAPSHOT_RANGES.map(async ({ label, days }) => {
      const gscSnapshot = await fetchGscSnapshot({
        gscSiteUrl,
        accessToken,
        rangeDays: days
      });

      const { dateStart, dateEnd } = getSnapshotWindow(days);

      await createGSCSnapshot({
        orgId: payload.orgId,
        siteId: payload.siteId,
        range: label,
        dateStart,
        dateEnd,
        clicks: gscSnapshot.clicks,
        impressions: gscSnapshot.impressions,
        ctr: gscSnapshot.ctr,
        position: gscSnapshot.position,
        topQueriesJson: gscSnapshot.topQueries as Prisma.InputJsonValue,
        topPagesJson: gscSnapshot.topPages as Prisma.InputJsonValue
      });
    })
  );

  await markScanRunCompleted(payload.scanRunId);
  await createWorkerAuditLog({
    orgId: payload.orgId,
    action: "snapshot.pull.completed",
    entityType: "scanRun",
    entityId: payload.scanRunId,
    metadataJson: {
      siteId: payload.siteId,
      type: ScanRunType.GSC_SNAPSHOT
    }
  });
  console.log(
    `[worker] GSC_SNAPSHOT completed jobId=${jobId} orgId=${payload.orgId} siteId=${payload.siteId} scanRunId=${payload.scanRunId}`
  );
}
