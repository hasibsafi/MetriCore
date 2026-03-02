"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DeltaIndicator } from "../../../../../../../src/components/charts/delta-indicator";
import { RangeSelector } from "../../../../../../../src/components/charts/range-selector";
import { SkeletonCards, SkeletonChart } from "../../../../../../../src/components/charts/skeleton-chart";

type TrendDirection = "up" | "down" | "flat";

type HealthHistoryResponse = {
  site: {
    id: string;
    orgId: string;
    url: string;
    displayName: string;
    createdAt: string;
  };
  range: "7d" | "30d" | "90d";
  points: Array<{
    date: string;
    performanceScore: number | null;
    lcpMs: number | null;
    cls: number | null;
    tbtMs: number | null;
    fcpMs: number | null;
    ttfbMs: number | null;
    desktopPerformanceScore: number | null;
    desktopLcpMs: number | null;
    desktopCls: number | null;
    desktopTbtMs: number | null;
    desktopFcpMs: number | null;
    desktopTtfbMs: number | null;
  }>;
  delta: {
    current: {
      date: string;
      performanceScore: number | null;
      lcpMs: number | null;
      cls: number | null;
      tbtMs: number | null;
      fcpMs: number | null;
      ttfbMs: number | null;
    };
    previous: {
      date: string;
      performanceScore: number | null;
      lcpMs: number | null;
      cls: number | null;
      tbtMs: number | null;
      fcpMs: number | null;
      ttfbMs: number | null;
    };
    changes: {
      performanceScore: { absolute: number; percent: number; direction: TrendDirection };
      lcpMs: { absolute: number; percent: number; direction: TrendDirection };
      cls: { absolute: number; percent: number; direction: TrendDirection };
      tbtMs: { absolute: number; percent: number; direction: TrendDirection };
    };
  } | null;
  message?: string;
};

type JobStatusResponse = {
  scanRunId: string;
  status: "queued" | "running" | "completed" | "failed";
  message?: string;
};

type HealthClientProps = {
  orgId: string;
  siteId: string;
};

function formatMetric(value: number | null, unit: string) {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  if (unit === "s") {
    return `${(value / 1000).toFixed(2)}s`;
  }

  if (unit === "ms") {
    return `${Math.round(value)}ms`;
  }

  if (unit === "score") {
    return `${Math.round(value)}`;
  }

  return `${value.toFixed(3)}`;
}

export function HealthClient({ orgId, siteId }: HealthClientProps) {
  const [data, setData] = useState<HealthHistoryResponse | null>(null);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [runningScanRunId, setRunningScanRunId] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadLatest = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/orgs/${orgId}/sites/${siteId}/health/history?range=${range}`, {
        cache: "no-store"
      });

      const body = (await response.json()) as HealthHistoryResponse;

      if (!response.ok) {
        setError(body.message ?? "Unable to load health data.");
        setData(null);
        return;
      }

      setError(null);
      setData(body);
    } catch {
      setError("Unable to load health data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [orgId, range, siteId]);

  useEffect(() => {
    void loadLatest();
  }, [loadLatest]);

  useEffect(() => {
    if (!runningScanRunId) {
      return;
    }

    pollTimerRef.current = setInterval(async () => {
      const response = await fetch(`/api/jobs/${runningScanRunId}`, { cache: "no-store" });
      const body = (await response.json()) as JobStatusResponse;

      if (!response.ok) {
        setActionError(body.message ?? "Unable to poll scan status.");
        return;
      }

      if (body.status === "completed" || body.status === "failed") {
        setRunningScanRunId(null);
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        await loadLatest();
      }
    }, 2000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [runningScanRunId, loadLatest]);

  async function handleRunScan() {
    setIsTriggering(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/orgs/${orgId}/sites/${siteId}/scan/pagespeed`, {
        method: "POST"
      });

      const body = (await response.json()) as { scanRunId?: string; message?: string };

      if (!response.ok) {
        setActionError(body.message ?? "Unable to trigger scan.");
        return;
      }

      if (body.scanRunId) {
        setRunningScanRunId(body.scanRunId);
      }

      await loadLatest();
    } catch {
      setActionError("Unable to trigger scan.");
    } finally {
      setIsTriggering(false);
    }
  }

  const trendPoints = data?.points.map((item) => ({
    ...item,
    label: new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    lcpSec: item.lcpMs ? Number((item.lcpMs / 1000).toFixed(2)) : 0,
    tbtMs: item.tbtMs ?? 0,
    cls: item.cls ? Number(item.cls.toFixed(3)) : 0
  })) ?? [];
  const latestPoint = data?.points[data.points.length - 1];
  const hasSnapshot = Boolean(latestPoint);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Site Health</h1>
          <p className="text-sm text-slate-600">Run PageSpeed scans and monitor core performance metrics.</p>
        </div>
        <RangeSelector value={range} onChange={setRange} />
      </header>

      {error ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {actionError ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}

      {loading ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:p-6">
          <SkeletonCards />
          <SkeletonChart />
          <SkeletonChart heightClassName="h-[220px] sm:h-[240px]" />
        </div>
      ) : null}

      {!loading && data ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Site</p>
              <p className="text-base font-semibold text-slate-900">{data.site.displayName}</p>
              <p className="text-sm text-slate-600">{data.site.url}</p>
            </div>
            <button
              type="button"
              onClick={handleRunScan}
              disabled={isTriggering || runningScanRunId !== null}
              className="rounded-[10px] bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-60"
            >
              {isTriggering ? "Starting..." : "Run Health Scan"}
            </button>
          </div>

          {hasSnapshot ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Performance"
                value={formatMetric(latestPoint?.performanceScore ?? null, "score")}
                change={data.delta?.changes.performanceScore}
              />
              <MetricCard
                label="LCP"
                value={formatMetric(latestPoint?.lcpMs ?? null, "s")}
                change={data.delta?.changes.lcpMs}
                invertSentiment
              />
              <MetricCard
                label="CLS"
                value={formatMetric(latestPoint?.cls ?? null, "cls")}
                change={data.delta?.changes.cls}
                invertSentiment
              />
              <MetricCard
                label="TBT"
                value={formatMetric(latestPoint?.tbtMs ?? null, "ms")}
                change={data.delta?.changes.tbtMs}
                invertSentiment
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-700">Mobile snapshot</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <MetricCard label="Performance" value={formatMetric(latestPoint?.performanceScore ?? null, "score")} />
                <MetricCard label="LCP" value={formatMetric(latestPoint?.lcpMs ?? null, "s")} />
                <MetricCard label="FCP" value={formatMetric(latestPoint?.fcpMs ?? null, "s")} />
                <MetricCard label="TTFB" value={formatMetric(latestPoint?.ttfbMs ?? null, "ms")} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-700">Desktop snapshot</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <MetricCard label="Performance" value={formatMetric(latestPoint?.desktopPerformanceScore ?? null, "score")} />
                <MetricCard label="LCP" value={formatMetric(latestPoint?.desktopLcpMs ?? null, "s")} />
                <MetricCard label="FCP" value={formatMetric(latestPoint?.desktopFcpMs ?? null, "s")} />
                <MetricCard label="TTFB" value={formatMetric(latestPoint?.desktopTtfbMs ?? null, "ms")} />
              </div>
            </div>
          </div>

          {trendPoints.length ? (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-700">Performance score over time</p>
                <div className="mt-3 h-[220px] w-full sm:h-[260px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendPoints}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="performanceScore" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-700">LCP / CLS / TBT trend</p>
                <div className="mt-3 h-[220px] w-full sm:h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendPoints}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="lcpSec" fill="#0ea5e9" name="LCP (s)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tbtMs" fill="#38bdf8" name="TBT (ms)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cls" fill="#7dd3fc" name="CLS" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-900">No scan data for this period</p>
              <p className="mt-1 text-sm text-slate-600">Run a health scan to start trend tracking.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Last scan" value={latestPoint ? new Date(latestPoint.date).toLocaleString() : "—"} />
          </div>
        </div>
      ) : null}

      {!loading && !data ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-900">Unable to load health history</p>
          <p className="mt-1 text-sm text-slate-600">You can still run a new scan to generate results.</p>
          <button
            type="button"
            onClick={handleRunScan}
            disabled={isTriggering || runningScanRunId !== null}
            className="mt-4 rounded-[10px] bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-60"
          >
            {isTriggering ? "Starting..." : "Run Health Scan"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function MetricCard({
  label,
  value,
  change,
  invertSentiment = false
}: {
  label: string;
  value: string;
  change?: { percent: number; direction: TrendDirection };
  invertSentiment?: boolean;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {change ? <DeltaIndicator percent={change.percent} direction={change.direction} invertSentiment={invertSentiment} /> : null}
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
