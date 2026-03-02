import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { queueName } from "@metricore/shared";
import { setDefaultResultOrder } from "node:dns";
import { createScansWorker } from "./worker";
import { db } from "./lib/db";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, "..", ".env") });

setDefaultResultOrder("ipv4first");

const worker = createScansWorker();

console.log(`[worker] listening on queue=${queueName}`);

worker.on("failed", (job, error) => {
  const jobId = job?.id ?? "unknown";
  const orgId = typeof job?.data?.orgId === "string" ? job.data.orgId : "unknown";
  const siteId = typeof job?.data?.siteId === "string" ? job.data.siteId : "none";
  const scanRunId = typeof job?.data?.scanRunId === "string" ? job.data.scanRunId : "unknown";
  const status = error ? "failed" : "unknown";
  const reason = error instanceof Error ? error.message.slice(0, 300) : "unknown";
  console.error(`[worker] failed jobId=${jobId} orgId=${orgId} siteId=${siteId} scanRunId=${scanRunId} status=${status} reason=${reason}`);
});

const shutdown = async () => {
  await worker.close();
  await db.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", () => {
  void shutdown();
});

process.on("SIGINT", () => {
  void shutdown();
});
