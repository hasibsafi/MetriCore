import { ScanRunStatus } from "@prisma/client";
import { db } from "../lib/db";

export async function getScanRunById(scanRunId: string) {
  return db.scanRun.findUnique({
    where: { id: scanRunId },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      type: true,
      status: true
    }
  });
}

export async function markScanRunRunning(scanRunId: string) {
  await db.scanRun.update({
    where: { id: scanRunId },
    data: {
      status: ScanRunStatus.running,
      startedAt: new Date(),
      error: null
    }
  });
}

export async function markScanRunCompleted(scanRunId: string) {
  await db.scanRun.update({
    where: { id: scanRunId },
    data: {
      status: ScanRunStatus.completed,
      completedAt: new Date(),
      error: null
    }
  });
}

export async function markScanRunFailed(scanRunId: string, errorMessage: string) {
  await db.scanRun.update({
    where: { id: scanRunId },
    data: {
      status: ScanRunStatus.failed,
      completedAt: new Date(),
      error: errorMessage.slice(0, 500)
    }
  });
}
