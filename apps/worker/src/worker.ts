import {
  buildRecommendationsPayloadSchema,
  JobType,
  ga4SnapshotPayloadSchema,
  gscSnapshotPayloadSchema,
  jobTypeSchema,
  pageSpeedScanPayloadSchema,
  pingPayloadSchema,
  queueName
} from "@metricore/shared";
import { Job, Worker } from "bullmq";
import IORedis from "ioredis";
import { markScanRunCompleted, markScanRunFailed, markScanRunRunning } from "./repositories/scan-run-repository";
import { createWorkerAuditLog } from "./repositories/audit-log-repository";
import { processPageSpeedScan } from "./services/pagespeed-service";
import { processBuildRecommendations } from "./services/recommendation-service";
import { processGa4Snapshot, processGscSnapshot } from "./services/snapshot-service";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is required for worker");
}

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null
});

async function handlePing(job: Job): Promise<void> {
  const parsedPayload = pingPayloadSchema.parse(job.data);

  await markScanRunRunning(parsedPayload.scanRunId);
  console.log(`[worker] PING running jobId=${job.id} orgId=${parsedPayload.orgId} scanRunId=${parsedPayload.scanRunId}`);

  await markScanRunCompleted(parsedPayload.scanRunId);
  console.log(`[worker] PING completed jobId=${job.id} orgId=${parsedPayload.orgId} scanRunId=${parsedPayload.scanRunId}`);
}

async function processJob(job: Job): Promise<void> {
  const parsedJobName = jobTypeSchema.parse(job.name);

  switch (parsedJobName) {
    case JobType.PING:
      await handlePing(job);
      return;
    case JobType.PAGESPEED_SCAN:
      await processPageSpeedScan(pageSpeedScanPayloadSchema.parse(job.data), String(job.id ?? "unknown"));
      return;
    case JobType.GA4_SNAPSHOT:
      await processGa4Snapshot(ga4SnapshotPayloadSchema.parse(job.data), String(job.id ?? "unknown"));
      return;
    case JobType.GSC_SNAPSHOT:
      await processGscSnapshot(gscSnapshotPayloadSchema.parse(job.data), String(job.id ?? "unknown"));
      return;
    case JobType.BUILD_RECOMMENDATIONS:
      await processBuildRecommendations(buildRecommendationsPayloadSchema.parse(job.data), String(job.id ?? "unknown"));
      return;
    default:
      throw new Error("Unsupported job type");
  }
}

export function createScansWorker(): Worker {
  return new Worker(
    queueName,
    async (job) => {
      try {
        await processJob(job);
      } catch (error) {
        const scanRunId = typeof job.data?.scanRunId === "string" ? job.data.scanRunId : null;
        const orgId = typeof job.data?.orgId === "string" ? job.data.orgId : "unknown";
        const siteId = typeof job.data?.siteId === "string" ? job.data.siteId : "none";
        const safeMessage = error instanceof Error ? error.message.slice(0, 300) : "Unknown error";

        if (scanRunId) {
          await markScanRunFailed(scanRunId, safeMessage);

          const parsedJobType = typeof job.name === "string" ? job.name : null;
          if (parsedJobType === JobType.GA4_SNAPSHOT || parsedJobType === JobType.GSC_SNAPSHOT) {
            await createWorkerAuditLog({
              orgId,
              action: "snapshot.pull.failed",
              entityType: "scanRun",
              entityId: scanRunId,
              metadataJson: {
                siteId,
                type: parsedJobType
              }
            });
          }
        }

        console.log(
          `[worker] job failed jobId=${String(job.id ?? "unknown")} orgId=${orgId} siteId=${siteId} scanRunId=${scanRunId ?? "unknown"} status=failed reason=${safeMessage}`
        );

        throw new Error(safeMessage);
      }
    },
    {
      connection
    }
  );
}
