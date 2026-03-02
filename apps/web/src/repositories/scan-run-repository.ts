import { ScanRunStatus, ScanRunType } from "@prisma/client";
import { db } from "../lib/db";

export async function createScanRun(input: { orgId: string; siteId?: string | null; type: ScanRunType; status?: ScanRunStatus }) {
  return db.scanRun.create({
    data: {
      orgId: input.orgId,
      siteId: input.siteId ?? null,
      type: input.type,
      status: input.status ?? ScanRunStatus.queued
    },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      type: true,
      status: true,
      queuedAt: true,
      startedAt: true,
      completedAt: true,
      error: true
    }
  });
}

export async function createQueuedScanRun(input: { orgId: string; siteId: string | null; type: ScanRunType }) {
  const run = await db.scanRun.create({
    data: {
      orgId: input.orgId,
      siteId: input.siteId,
      type: input.type,
      status: ScanRunStatus.queued
    },
    select: {
      id: true
    }
  });

  return run.id;
}

export async function getScanRunById(scanRunId: string) {
  return db.scanRun.findUnique({
    where: { id: scanRunId },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      type: true,
      status: true,
      queuedAt: true,
      startedAt: true,
      completedAt: true,
      error: true
    }
  });
}

export async function updateScanRunRunning(scanRunId: string) {
  return db.scanRun.update({
    where: { id: scanRunId },
    data: {
      status: ScanRunStatus.running,
      startedAt: new Date(),
      error: null
    }
  });
}

export async function markRunning(scanRunId: string) {
  return updateScanRunRunning(scanRunId);
}

export async function updateScanRunCompleted(scanRunId: string) {
  return db.scanRun.update({
    where: { id: scanRunId },
    data: {
      status: ScanRunStatus.completed,
      completedAt: new Date(),
      error: null
    }
  });
}

export async function markCompleted(scanRunId: string) {
  return updateScanRunCompleted(scanRunId);
}

export async function updateScanRunFailed(scanRunId: string, errorMessage: string) {
  return db.scanRun.update({
    where: { id: scanRunId },
    data: {
      status: ScanRunStatus.failed,
      completedAt: new Date(),
      error: errorMessage.slice(0, 500)
    }
  });
}

export async function markFailed(scanRunId: string, errorMessage: string) {
  return updateScanRunFailed(scanRunId, errorMessage);
}

export async function getLatestForSite(orgId: string, siteId: string, type: ScanRunType = ScanRunType.PAGESPEED_SCAN) {
  return db.scanRun.findFirst({
    where: {
      orgId,
      siteId,
      type
    },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      type: true,
      status: true,
      queuedAt: true,
      startedAt: true,
      completedAt: true,
      error: true,
      pageSpeedResult: {
        select: {
          id: true,
          orgId: true,
          scanRunId: true,
          performanceScore: true,
          lcpMs: true,
          cls: true,
          tbtMs: true,
          fcpMs: true,
          ttfbMs: true,
          rawJson: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      queuedAt: "desc"
    }
  });
}
