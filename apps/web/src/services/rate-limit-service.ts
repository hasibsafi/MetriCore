import { getRedisClient } from "../lib/redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_IP = 10;
const MAX_REQUESTS_PER_ORG = 5;

export class RateLimitError extends Error {
  readonly status = 429;
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSeconds = Math.max(1, retryAfterSeconds);
  }
}

type TriggerKind = "pagespeed" | "ga4" | "gsc" | "recommendations";

async function incrementWithinWindow(key: string) {
  const redis = getRedisClient();
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  const ttl = await redis.ttl(key);

  return {
    count,
    retryAfterSeconds: ttl > 0 ? ttl : WINDOW_SECONDS
  };
}

async function enforceTriggerRateLimit(input: { orgId: string; ipAddress: string; kind: TriggerKind }) {
  const currentMinuteWindow = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const ipKey = `ratelimit:${input.kind}:ip:${input.ipAddress}:${currentMinuteWindow}`;
  const orgKey = `ratelimit:${input.kind}:org:${input.orgId}:${currentMinuteWindow}`;

  const [ipWindow, orgWindow] = await Promise.all([incrementWithinWindow(ipKey), incrementWithinWindow(orgKey)]);

  if (ipWindow.count > MAX_REQUESTS_PER_IP) {
    throw new RateLimitError("Too many trigger requests from this IP.", ipWindow.retryAfterSeconds);
  }

  if (orgWindow.count > MAX_REQUESTS_PER_ORG) {
    throw new RateLimitError("Too many trigger requests for this organization.", orgWindow.retryAfterSeconds);
  }
}

export async function enforcePageSpeedTriggerRateLimit(input: { orgId: string; ipAddress: string }) {
  return enforceTriggerRateLimit({
    orgId: input.orgId,
    ipAddress: input.ipAddress,
    kind: "pagespeed"
  });
}

export async function enforceSnapshotTriggerRateLimit(input: { orgId: string; ipAddress: string; kind: "ga4" | "gsc" }) {
  return enforceTriggerRateLimit({
    orgId: input.orgId,
    ipAddress: input.ipAddress,
    kind: input.kind
  });
}

export async function enforceRecommendationsTriggerRateLimit(input: { orgId: string; ipAddress: string }) {
  return enforceTriggerRateLimit({
    orgId: input.orgId,
    ipAddress: input.ipAddress,
    kind: "recommendations"
  });
}
