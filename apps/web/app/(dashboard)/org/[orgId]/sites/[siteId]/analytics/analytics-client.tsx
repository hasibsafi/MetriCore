"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DeltaIndicator } from "../../../../../../../src/components/charts/delta-indicator";
import { RangeSelector } from "../../../../../../../src/components/charts/range-selector";
import { SkeletonCards, SkeletonChart } from "../../../../../../../src/components/charts/skeleton-chart";

type TrendDirection = "up" | "down" | "flat";

type IntegrationsDto = {
  ga4PropertyId: string | null;
  googleEmail: string | null;
  connectedAt: string | null;
  connected: boolean;
};

type AnalyticsHistoryResponse = {
  site: {
    id: string;
    displayName: string;
    url: string;
  };
  integrations: IntegrationsDto | null;
  range: "7d" | "30d" | "90d";
  points: Array<{ date: string; sessions: number; users: number }>;
  topPages: Array<{ path: string; sessions: number; users: number }>;
  delta: {
    current: { date: string; sessions: number; users: number };
    previous: { date: string; sessions: number; users: number };
    changes: {
      sessions: { absolute: number; percent: number; direction: TrendDirection };
      users: { absolute: number; percent: number; direction: TrendDirection };
    };
  } | null;
  message?: string;
};

type JobStatusResponse = {
  status: "queued" | "running" | "completed" | "failed";
  message?: string;
};

type AnalyticsClientProps = {
  orgId: string;
  siteId: string;
};

export function AnalyticsClient({ orgId, siteId }: AnalyticsClientProps) {
  const [data, setData] = useState<AnalyticsHistoryResponse | null>(null);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [runningScanRunId, setRunningScanRunId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadLatest = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/orgs/${orgId}/sites/${siteId}/analytics/history?range=${range}`, {
        cache: "no-store"
      });

      const body = (await response.json()) as AnalyticsHistoryResponse;

      if (!response.ok) {
        setError(body.message ?? "Unable to load GA4 snapshot.");
        setData(null);
        return;
      }

      setError(null);
      setData(body);
    } catch {
      setError("Unable to load GA4 snapshot.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [orgId, range, siteId]);

  useEffect(() => {
    void loadLatest();
  }, [loadLatest]);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (runningScanRunId) {
      return;
    }

    void handleFetchSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  useEffect(() => {
    if (!runningScanRunId) {
      return;
    }

    pollTimerRef.current = setInterval(async () => {
      const response = await fetch(`/api/jobs/${runningScanRunId}`, { cache: "no-store" });
      const body = (await response.json()) as JobStatusResponse;

      if (!response.ok) {
        setActionError(body.message ?? "Unable to poll snapshot status.");
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

  async function handleFetchSnapshot() {
    setIsFetching(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/orgs/${orgId}/sites/${siteId}/snapshots/ga4`, {
        method: "POST"
      });

      const body = (await response.json()) as { scanRunId?: string; message?: string };

      if (!response.ok) {
        setActionError(body.message ?? "Unable to trigger GA4 snapshot.");
        return;
      }

      if (body.scanRunId) {
        setRunningScanRunId(body.scanRunId);
      }
    } catch {
      setActionError("Unable to trigger GA4 snapshot.");
    } finally {
      setIsFetching(false);
    }
  }

  const trendPoints = data?.points.map((item) => ({
    ...item,
    label: new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  })) ?? [];
  const latestPoint = data?.points[data.points.length - 1];
  const hasSnapshot = Boolean(latestPoint);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-600">GA4 snapshots and traffic trends for this site.</p>
        </div>
        <RangeSelector value={range} onChange={setRange} />
      </header>

      {error ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {actionError ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}

      {loading ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:p-6">
          <SkeletonCards count={3} />
          <SkeletonChart />
          <SkeletonChart heightClassName="h-[240px]" />
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
              onClick={handleFetchSnapshot}
              disabled={isFetching || runningScanRunId !== null}
              className="rounded-[10px] bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-60"
            >
              {isFetching ? "Starting..." : "Fetch GA4 Snapshot"}
            </button>
          </div>

          {!data.integrations?.connected ? (
            <p className="rounded-[10px] bg-amber-50 px-3 py-2 text-sm text-amber-700">Google is not connected. Configure and connect from Settings.</p>
          ) : null}

          {data.integrations?.connected && data.integrations.ga4PropertyId ? (
            <p className="rounded-[10px] bg-sky-50 px-3 py-2 text-sm text-sky-700">
              Connected as {data.integrations.googleEmail ?? "Google account"} · {data.integrations.ga4PropertyId}
            </p>
          ) : null}

          {runningScanRunId ? <p className="text-sm text-slate-600">Snapshot status: fetching…</p> : null}

          {hasSnapshot ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  label="Sessions"
                  value={new Intl.NumberFormat().format(latestPoint?.sessions ?? 0)}
                  change={data.delta?.changes.sessions}
                />
                <MetricCard
                  label="Users"
                  value={new Intl.NumberFormat().format(latestPoint?.users ?? 0)}
                  change={data.delta?.changes.users}
                />
                <article className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Traffic trend</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {data.delta ? (
                      <>
                        {data.delta.changes.sessions.percent > 0 ? "+" : ""}
                        {data.delta.changes.sessions.percent.toFixed(1)}%
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </article>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-700">Sessions over time</p>
                <div className="mt-3 h-[220px] w-full sm:h-[260px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendPoints}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="sessions" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="users" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-700">Top pages</p>
                <div className="mt-3 h-[240px] w-full sm:h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data.topPages} margin={{ left: 8 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis type="category" width={120} dataKey="path" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-900">No analytics data for this period</p>
              <p className="mt-1 text-sm text-slate-600">Fetch a GA4 snapshot after connecting Google in Settings.</p>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function MetricCard({
  label,
  value,
  change
}: {
  label: string;
  value: string;
  change?: { percent: number; direction: TrendDirection };
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {change ? <DeltaIndicator percent={change.percent} direction={change.direction} /> : null}
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
