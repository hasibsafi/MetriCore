import { JobType, ScanRunType } from "@metricore/shared";
import { createAuditLog } from "../repositories/audit-log-repository";
import { createQueuedScanRun, getLatestForSite } from "../repositories/scan-run-repository";
import { getOrgSiteById } from "../repositories/site-repository";
import { enqueueJob } from "../lib/queue";
import { enforcePageSpeedTriggerRateLimit } from "./rate-limit-service";

export class SiteNotFoundError extends Error {
  readonly status = 404;

  constructor() {
    super("Site not found.");
    this.name = "SiteNotFoundError";
  }
}

export async function triggerPageSpeedScan(input: {
  actorUserId: string;
  orgId: string;
  siteId: string;
  ipAddress: string;
}) {
  await enforcePageSpeedTriggerRateLimit({
    orgId: input.orgId,
    ipAddress: input.ipAddress
  });

  const site = await getOrgSiteById(input.orgId, input.siteId);
  if (!site) {
    throw new SiteNotFoundError();
  }

  const scanRunId = await createQueuedScanRun({
    orgId: input.orgId,
    siteId: input.siteId,
    type: ScanRunType.PAGESPEED_SCAN
  });

  const job = await enqueueJob(JobType.PAGESPEED_SCAN, {
    orgId: input.orgId,
    siteId: input.siteId,
    scanRunId,
    url: site.url
  });

  await createAuditLog({
    orgId: input.orgId,
    actorUserId: input.actorUserId,
    action: "scan.triggered",
    entityType: "scanRun",
    entityId: scanRunId,
    metadataJson: {
      siteId: input.siteId,
      type: ScanRunType.PAGESPEED_SCAN
    }
  });

  return {
    scanRunId,
    jobId: String(job.id)
  };
}

export async function getLatestPageSpeedHealth(orgId: string, siteId: string) {
  const site = await getOrgSiteById(orgId, siteId);
  if (!site) {
    throw new SiteNotFoundError();
  }

  const latest = await getLatestForSite(orgId, siteId, ScanRunType.PAGESPEED_SCAN);

  return {
    site,
    latest
  };
}
