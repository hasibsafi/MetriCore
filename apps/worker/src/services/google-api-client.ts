const DEFAULT_TIMEOUT_MS = 30_000;
const RETRY_DELAYS_MS = [1000, 4000, 16000] as const;

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

export async function fetchGoogleJsonWithRetry<T>(input: {
  url: string;
  accessToken: string;
  method?: "GET" | "POST";
  body?: unknown;
}) {
  let retry429Consumed = false;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetchWithTimeout(input.url, {
        method: input.method ?? "GET",
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
          "Content-Type": "application/json"
        },
        body: input.body ? JSON.stringify(input.body) : undefined
      });

      const body = (await response.json()) as T & { error?: { message?: string } };

      if (!response.ok) {
        if (response.status === 429 && !retry429Consumed) {
          retry429Consumed = true;
          const retryAfterHeader = response.headers.get("retry-after");
          const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : 1;
          await sleep(Number.isFinite(retryAfterSeconds) ? Math.max(1, retryAfterSeconds) * 1000 : 1000);
          continue;
        }

        if (response.status >= 500 && attempt < RETRY_DELAYS_MS.length - 1) {
          await sleep(RETRY_DELAYS_MS[attempt]);
          continue;
        }

        throw new Error(body.error?.message ?? `Google API request failed (${response.status})`);
      }

      return body;
    } catch (error) {
      if (attempt >= RETRY_DELAYS_MS.length - 1) {
        if (error instanceof Error && error.message.includes("aborted")) {
          throw new Error("Google API temporarily unavailable");
        }

        throw error;
      }

      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw new Error("Google API temporarily unavailable");
}
