import { JobType, ScanRunType } from "@metricore/shared";
import { createAuditLog } from "../repositories/audit-log-repository";
import { createQueuedScanRun } from "../repositories/scan-run-repository";
import { getOrgSiteById } from "../repositories/site-repository";
import { enqueueJob } from "../lib/queue";
import { enforceSnapshotTriggerRateLimit } from "./rate-limit-service";
import { getLatestGA4Snapshot, getLatestGSCSnapshot } from "../repositories/snapshot-repository";
import { getIntegrations } from "../repositories/site-integrations-repository";
import { assertSnapshotIntegrationsReady } from "./google-integration-service";

export class SnapshotSiteNotFoundError extends Error {
  readonly status = 404;

  constructor() {
    super("Site not found.");
    this.name = "SnapshotSiteNotFoundError";
  }
}

type EnqueueSnapshotInput = {
  actorUserId: string;
  orgId: string;
  siteId: string;
  ipAddress: string;
};

type GscRange = "7d" | "30d" | "90d";

async function ensureSite(orgId: string, siteId: string) {
  const site = await getOrgSiteById(orgId, siteId);
  if (!site) {
    throw new SnapshotSiteNotFoundError();
  }

  return site;
}

export async function enqueueGa4Snapshot(input: EnqueueSnapshotInput) {
  await enforceSnapshotTriggerRateLimit({
    orgId: input.orgId,
    ipAddress: input.ipAddress,
    kind: "ga4"
  });

  await ensureSite(input.orgId, input.siteId);
  await assertSnapshotIntegrationsReady(input.orgId, input.siteId, "ga4");

  const scanRunId = await createQueuedScanRun({
    orgId: input.orgId,
    siteId: input.siteId,
    type: ScanRunType.GA4_SNAPSHOT
  });

  const job = await enqueueJob(JobType.GA4_SNAPSHOT, {
    orgId: input.orgId,
    siteId: input.siteId,
    scanRunId
  });

  await createAuditLog({
    orgId: input.orgId,
    actorUserId: input.actorUserId,
    action: "snapshot.triggered",
    entityType: "scanRun",
    entityId: scanRunId,
    metadataJson: {
      siteId: input.siteId,
      type: ScanRunType.GA4_SNAPSHOT
    }
  });

  return {
    scanRunId,
    jobId: String(job.id)
  };
}

export async function enqueueGscSnapshot(input: EnqueueSnapshotInput & { range?: GscRange | null }) {
  await enforceSnapshotTriggerRateLimit({
    orgId: input.orgId,
    ipAddress: input.ipAddress,
    kind: "gsc"
  });

  await ensureSite(input.orgId, input.siteId);
  await assertSnapshotIntegrationsReady(input.orgId, input.siteId, "gsc");

  const scanRunId = await createQueuedScanRun({
    orgId: input.orgId,
    siteId: input.siteId,
    type: ScanRunType.GSC_SNAPSHOT
  });

  const job = await enqueueJob(JobType.GSC_SNAPSHOT, {
    orgId: input.orgId,
    siteId: input.siteId,
    scanRunId,
    range: input.range ?? undefined
  });

  await createAuditLog({
    orgId: input.orgId,
    actorUserId: input.actorUserId,
    action: "snapshot.triggered",
    entityType: "scanRun",
    entityId: scanRunId,
    metadataJson: {
      siteId: input.siteId,
      type: ScanRunType.GSC_SNAPSHOT
    }
  });

  return {
    scanRunId,
    jobId: String(job.id)
  };
}

export async function getLatestSnapshots(orgId: string, siteId: string) {
  const site = await ensureSite(orgId, siteId);

  const [ga4, gsc, integrations] = await Promise.all([
    getLatestGA4Snapshot(orgId, siteId),
    getLatestGSCSnapshot(orgId, siteId),
    getIntegrations(orgId, siteId)
  ]);

  const integrationStatus = integrations
    ? {
        ga4PropertyId: integrations.ga4PropertyId,
        gscSiteUrl: integrations.gscSiteUrl,
        googleEmail: integrations.googleEmail,
        connectedAt: integrations.connectedAt,
        connected: Boolean(integrations.connectedAt)
      }
    : null;

  return {
    site,
    integrations: integrationStatus,
    ga4,
    gsc
  };
}
