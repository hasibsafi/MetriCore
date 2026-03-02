import { decryptAes256Gcm, validateEncryptionKey } from "@metricore/shared";
import { clearGoogleConnection, touchGoogleTokenExpiry } from "../repositories/site-integrations-repository";
import { createWorkerAuditLog } from "../repositories/audit-log-repository";

const DEFAULT_TIMEOUT_MS = 90_000;
const RETRY_DELAYS_MS = [1000, 4000, 16000, 30000] as const;

export class GoogleAuthRevokedError extends Error {
  constructor() {
    super("Google authorization revoked. Please reconnect.");
    this.name = "GoogleAuthRevokedError";
  }
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function getEncryptionKey(): string {
  const encryptionKey = getRequiredEnv("ENCRYPTION_KEY");
  validateEncryptionKey(encryptionKey);
  return encryptionKey;
}

function getOauthClient() {
  return {
    clientId: getRequiredEnv("GOOGLE_INTEGRATION_CLIENT_ID"),
    clientSecret: getRequiredEnv("GOOGLE_INTEGRATION_CLIENT_SECRET")
  };
}

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const causeCode =
      typeof (error as { cause?: { code?: string } }).cause?.code === "string"
        ? (error as { cause?: { code?: string } }).cause?.code
        : null;
    const suffix = causeCode ? ` (${causeCode})` : "";
    return `${error.message.slice(0, 260)}${suffix}`;
  }

  return "Unexpected error";
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function refreshGoogleAccessToken(input: {
  orgId: string;
  siteId: string;
  encryptedRefreshToken: string;
}) {
  const encryptionKey = getEncryptionKey();
  const refreshToken = decryptAes256Gcm(input.encryptedRefreshToken, encryptionKey);
  const oauthClient = getOauthClient();

  let retry429Consumed = false;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetchWithTimeout("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: oauthClient.clientId,
          client_secret: oauthClient.clientSecret,
          grant_type: "refresh_token"
        })
      });

      const body = (await response.json()) as {
        access_token?: string;
        expires_in?: number;
        error?: string;
        error_description?: string;
      };

      if (!response.ok) {
        if (body.error === "invalid_grant") {
          await clearGoogleConnection(input.orgId, input.siteId);
          await createWorkerAuditLog({
            orgId: input.orgId,
            action: "google.token_revoked",
            entityType: "site",
            entityId: input.siteId,
            metadataJson: {
              reason: "invalid_grant"
            }
          });

          throw new GoogleAuthRevokedError();
        }

        if (response.status === 429 && !retry429Consumed) {
          retry429Consumed = true;
          const retryAfterHeader = response.headers.get("retry-after");
          const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : 1;
          await sleep(Number.isFinite(retryAfterSeconds) ? Math.max(retryAfterSeconds, 1) * 1000 : 1000);
          continue;
        }

        if (response.status >= 500 && attempt < RETRY_DELAYS_MS.length - 1) {
          await sleep(RETRY_DELAYS_MS[attempt]);
          continue;
        }

        throw new Error(body.error_description ?? body.error ?? "Google OAuth refresh failed");
      }

      if (!body.access_token) {
        throw new Error("Google OAuth refresh returned no access token");
      }

      const expiresInSeconds = Number.isFinite(body.expires_in) ? Math.max(0, Number(body.expires_in)) : 3600;
      const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);
      await touchGoogleTokenExpiry(input.orgId, input.siteId, tokenExpiresAt);

      return {
        accessToken: body.access_token,
        tokenExpiresAt
      };
    } catch (error) {
      if (error instanceof GoogleAuthRevokedError) {
        throw error;
      }

      if (attempt >= RETRY_DELAYS_MS.length - 1) {
        const message = safeErrorMessage(error);
        console.error("[worker] Google OAuth refresh failed", message);
        throw new Error(message.includes("aborted") ? "Google API temporarily unavailable" : message);
      }

      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw new Error("Google API temporarily unavailable");
}
