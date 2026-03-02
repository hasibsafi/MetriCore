import { JobType, ScanRunType } from "@metricore/shared";
import { ScanRunStatus } from "@prisma/client";
import { enqueueJob } from "../lib/queue";
import { listUserMemberships } from "../repositories/membership-repository";
import { createScanRun, getScanRunById } from "../repositories/scan-run-repository";

export class NoMembershipError extends Error {
  readonly status = 400;

  constructor() {
    super("You need to create or join an organization before running jobs.");
    this.name = "NoMembershipError";
  }
}

export async function enqueuePingForUser(userId: string) {
  const memberships = await listUserMemberships(userId);
  const firstMembership = memberships[0];

  if (!firstMembership) {
    throw new NoMembershipError();
  }

  const scanRun = await createScanRun({
    orgId: firstMembership.orgId,
    siteId: null,
    type: ScanRunType.PING,
    status: ScanRunStatus.queued
  });

  const job = await enqueueJob(JobType.PING, {
    orgId: firstMembership.orgId,
    scanRunId: scanRun.id,
    timestamp: new Date().toISOString()
  });

  return {
    scanRunId: scanRun.id,
    jobId: String(job.id)
  };
}

export async function getJobStatus(scanRunId: string) {
  return getScanRunById(scanRunId);
}
