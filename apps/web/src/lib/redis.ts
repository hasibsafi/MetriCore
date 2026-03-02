import IORedis from "ioredis";

let redisClient: IORedis | null = null;

export function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is required");
  }

  redisClient = new IORedis(redisUrl, {
    maxRetriesPerRequest: null
  });

  return redisClient;
}
