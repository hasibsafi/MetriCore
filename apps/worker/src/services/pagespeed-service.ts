import { PageSpeedScanPayload, ScanRunType, validatePublicHttpUrl } from "@metricore/shared";
import { Prisma } from "@prisma/client";
import { getScanRunById, markScanRunCompleted, markScanRunRunning } from "../repositories/scan-run-repository";
import { upsertResult } from "../repositories/page-speed-repository";

type LighthouseAudit = {
  numericValue?: number;
};

type LighthouseResponse = {
  lighthouseResult?: {
    categories?: {
      performance?: {
        score?: number;
      };
    };
    audits?: Record<string, LighthouseAudit | undefined>;
  };
};

const PAGESPEED_FETCH_TIMEOUT_MS = 90000;
const PAGESPEED_FETCH_MAX_ATTEMPTS = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSafeFetchErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "PageSpeed API request failed";
  }

  const causeCode =
    typeof (error as { cause?: { code?: string } }).cause?.code === "string"
      ? (error as { cause?: { code?: string } }).cause?.code
      : null;

  return causeCode ? `${error.message} (${causeCode})` : error.message;
}

function parseMetrics(data: LighthouseResponse) {
  const audits = data.lighthouseResult?.audits ?? {};
  const performanceScoreRaw = data.lighthouseResult?.categories?.performance?.score;

  const performanceScore = typeof performanceScoreRaw === "number" ? Math.round(performanceScoreRaw * 100) : null;
  const lcpMs = audits["largest-contentful-paint"]?.numericValue ?? null;
  const cls = audits["cumulative-layout-shift"]?.numericValue ?? null;
  const tbtMs = audits["total-blocking-time"]?.numericValue ?? null;
  const fcpMs = audits["first-contentful-paint"]?.numericValue ?? null;
  const ttfbMs = audits["server-response-time"]?.numericValue ?? null;

  return {
    performanceScore,
    lcpMs,
    cls,
    tbtMs,
    fcpMs,
    ttfbMs
  };
}

async function fetchPageSpeedData(url: string, strategy: "mobile" | "desktop") {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error("PAGESPEED_API_KEY is required");
  }

  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", strategy);
  endpoint.searchParams.set("key", apiKey);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= PAGESPEED_FETCH_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PAGESPEED_FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        signal: controller.signal
      });

      if (!response.ok) {
        const responseText = await response.text();
        const bodySnippet = responseText.slice(0, 160).replace(/\s+/g, " ");
        throw new Error(`PageSpeed API request failed with status ${response.status}${bodySnippet ? `: ${bodySnippet}` : ""}`);
      }

      return (await response.json()) as LighthouseResponse;
    } catch (error) {
      const message = getSafeFetchErrorMessage(error);
      lastError = new Error(`PageSpeed API request failed (attempt ${attempt}/${PAGESPEED_FETCH_MAX_ATTEMPTS}): ${message}`);

      if (attempt < PAGESPEED_FETCH_MAX_ATTEMPTS) {
        await sleep(1000 * attempt);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError ?? new Error("PageSpeed API request failed.");
}

export async function processPageSpeedScan(payload: PageSpeedScanPayload, jobId: string) {
  const validatedUrl = validatePublicHttpUrl(payload.url);

  const scanRun = await getScanRunById(payload.scanRunId);
  if (!scanRun || scanRun.orgId !== payload.orgId || scanRun.siteId !== payload.siteId || scanRun.type !== ScanRunType.PAGESPEED_SCAN) {
    throw new Error("Scan run ownership check failed.");
  }

  await markScanRunRunning(payload.scanRunId);
  console.log(
    `[worker] PAGESPEED_SCAN running jobId=${jobId} orgId=${payload.orgId} siteId=${payload.siteId} scanRunId=${payload.scanRunId}`
  );

  const [mobileData, desktopData] = await Promise.all([
    fetchPageSpeedData(validatedUrl.normalizedUrl, "mobile"),
    fetchPageSpeedData(validatedUrl.normalizedUrl, "desktop")
  ]);
  const mobileMetrics = parseMetrics(mobileData);
  const desktopMetrics = parseMetrics(desktopData);

  await upsertResult({
    orgId: payload.orgId,
    scanRunId: payload.scanRunId,
    performanceScore: mobileMetrics.performanceScore,
    lcpMs: mobileMetrics.lcpMs,
    cls: mobileMetrics.cls,
    tbtMs: mobileMetrics.tbtMs,
    fcpMs: mobileMetrics.fcpMs,
    ttfbMs: mobileMetrics.ttfbMs,
    desktopPerformanceScore: desktopMetrics.performanceScore,
    desktopLcpMs: desktopMetrics.lcpMs,
    desktopCls: desktopMetrics.cls,
    desktopTbtMs: desktopMetrics.tbtMs,
    desktopFcpMs: desktopMetrics.fcpMs,
    desktopTtfbMs: desktopMetrics.ttfbMs,
    rawJson: mobileData as Prisma.InputJsonValue,
    rawJsonDesktop: desktopData as Prisma.InputJsonValue
  });

  await markScanRunCompleted(payload.scanRunId);
  console.log(
    `[worker] PAGESPEED_SCAN completed jobId=${jobId} orgId=${payload.orgId} siteId=${payload.siteId} scanRunId=${payload.scanRunId}`
  );
}
