import { z } from "zod";

export const queueName = "scans" as const;

export const JobType = {
  PING: "PING",
  PAGESPEED_SCAN: "PAGESPEED_SCAN",
  GA4_SNAPSHOT: "GA4_SNAPSHOT",
  GSC_SNAPSHOT: "GSC_SNAPSHOT",
  BUILD_RECOMMENDATIONS: "BUILD_RECOMMENDATIONS"
} as const;

export const jobTypeSchema = z.enum([
  JobType.PING,
  JobType.PAGESPEED_SCAN,
  JobType.GA4_SNAPSHOT,
  JobType.GSC_SNAPSHOT,
  JobType.BUILD_RECOMMENDATIONS
]);

export type JobTypeValue = z.infer<typeof jobTypeSchema>;

export const ScanRunType = {
  PING: "PING",
  PAGESPEED_SCAN: "PAGESPEED_SCAN",
  GA4_SNAPSHOT: "GA4_SNAPSHOT",
  GSC_SNAPSHOT: "GSC_SNAPSHOT",
  BUILD_RECOMMENDATIONS: "BUILD_RECOMMENDATIONS"
} as const;

export const scanRunTypeSchema = z.enum([
  ScanRunType.PING,
  ScanRunType.PAGESPEED_SCAN,
  ScanRunType.GA4_SNAPSHOT,
  ScanRunType.GSC_SNAPSHOT,
  ScanRunType.BUILD_RECOMMENDATIONS
]);

export const ScanRunStatus = {
  queued: "queued",
  running: "running",
  completed: "completed",
  failed: "failed"
} as const;

export const scanRunStatusSchema = z.enum([
  ScanRunStatus.queued,
  ScanRunStatus.running,
  ScanRunStatus.completed,
  ScanRunStatus.failed
]);

const commonJobPayloadSchema = z.object({
  orgId: z.string().min(1, "orgId is required"),
  scanRunId: z.string().min(1, "scanRunId is required")
});

export const pingPayloadSchema = commonJobPayloadSchema.extend({
  timestamp: z.string().datetime()
});

export const pageSpeedScanPayloadSchema = commonJobPayloadSchema.extend({
  siteId: z.string().min(1),
  url: z.string().url()
});

export const ga4SnapshotPayloadSchema = commonJobPayloadSchema.extend({
  siteId: z.string().min(1)
});

export const gscSnapshotPayloadSchema = commonJobPayloadSchema.extend({
  siteId: z.string().min(1),
  range: z.enum(["7d", "30d", "90d"]).optional()
});

export const buildRecommendationsPayloadSchema = commonJobPayloadSchema.extend({
  siteId: z.string().min(1)
});

export const jobPayloadSchemas = {
  [JobType.PING]: pingPayloadSchema,
  [JobType.PAGESPEED_SCAN]: pageSpeedScanPayloadSchema,
  [JobType.GA4_SNAPSHOT]: ga4SnapshotPayloadSchema,
  [JobType.GSC_SNAPSHOT]: gscSnapshotPayloadSchema,
  [JobType.BUILD_RECOMMENDATIONS]: buildRecommendationsPayloadSchema
} as const;

export type PingPayload = z.infer<typeof pingPayloadSchema>;
export type PageSpeedScanPayload = z.infer<typeof pageSpeedScanPayloadSchema>;
export type Ga4SnapshotPayload = z.infer<typeof ga4SnapshotPayloadSchema>;
export type GscSnapshotPayload = z.infer<typeof gscSnapshotPayloadSchema>;
export type BuildRecommendationsPayload = z.infer<typeof buildRecommendationsPayloadSchema>;
