import { JobType, JobTypeValue, jobPayloadSchemas, queueName } from "@metricore/shared";
import { Queue } from "bullmq";
import IORedis from "ioredis";

let scansQueue: Queue | null = null;

function getScansQueue(): Queue {
  if (scansQueue) {
    return scansQueue;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is required");
  }

  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null
  });

  scansQueue = new Queue(queueName, {
    connection
  });

  return scansQueue;
}

export async function enqueueJob<T extends JobTypeValue>(jobType: T, payload: unknown) {
  const schema = jobPayloadSchemas[jobType] ?? jobPayloadSchemas[JobType.PING];
  const parsedPayload = schema.parse(payload);
  const queue = getScansQueue();

  return queue.add(jobType, parsedPayload, {
    removeOnComplete: 100,
    removeOnFail: 100
  });
}
