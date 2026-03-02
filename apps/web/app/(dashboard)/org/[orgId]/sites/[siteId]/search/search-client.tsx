"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DeltaIndicator } from "../../../../../../../src/components/charts/delta-indicator";
import { RangeSelector } from "../../../../../../../src/components/charts/range-selector";
import { SkeletonCards, SkeletonChart } from "../../../../../../../src/components/charts/skeleton-chart";

type TrendDirection = "up" | "down" | "flat";

type IntegrationsDto = {
  gscSiteUrl: string | null;
  googleEmail: string | null;
  connectedAt: string | null;
  connected: boolean;
};

type SearchHistoryResponse = {
  site: {
    id: string;
    displayName: string;
    url: string;
  };
  integrations: IntegrationsDto | null;
  range: "7d" | "30d" | "90d";
  points: Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>;
  topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: number }>;
  topPages: Array<{ page: string; clicks: number; impressions: number; ctr: number }>;
  delta: {
    current: { date: string; clicks: number; impressions: number; ctr: number; position: number };
    previous: { date: string; clicks: number; impressions: number; ctr: number; position: number };
    changes: {
      clicks: { absolute: number; percent: number; direction: TrendDirection };
      impressions: { absolute: number; percent: number; direction: TrendDirection };
      ctr: { absolute: number; percent: number; direction: TrendDirection };
      position: { absolute: number; percent: number; direction: TrendDirection };
    };
  } | null;
  message?: string;
};

type JobStatusResponse = {
  status: "queued" | "running" | "completed" | "failed";
  message?: string;
};

type SearchClientProps = {
  orgId: string;
  siteId: string;
};

function truncateLabel(value: string, maxLength = 28) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

export function SearchClient({ orgId, siteId }: SearchClientProps) {
  const [data, setData] = useState<SearchHistoryResponse | null>(null);
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
      const response = await fetch(`/api/orgs/${orgId}/sites/${siteId}/search/history?range=${range}`, {
        cache: "no-store"
      });

      const body = (await response.json()) as SearchHistoryResponse;

      if (!response.ok) {
        setError(body.message ?? "Unable to load GSC snapshot.");
        setData(null);
        return;
      }

      setError(null);
      setData(body);
    } catch {
      setError("Unable to load GSC snapshot.");
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
      const response = await fetch(`/api/orgs/${orgId}/sites/${siteId}/snapshots/gsc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ range })
      });

      const body = (await response.json()) as { scanRunId?: string; message?: string };

      if (!response.ok) {
        setActionError(body.message ?? "Unable to trigger GSC snapshot.");
        return;
      }

      if (body.scanRunId) {
        setRunningScanRunId(body.scanRunId);
      }
    } catch {
      setActionError("Unable to trigger GSC snapshot.");
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
  const totalTopQueryClicks = data?.topQueries.reduce((sum, item) => sum + item.clicks, 0) ?? 0;
  const totalTopQueryImpressions = data?.topQueries.reduce((sum, item) => sum + item.impressions, 0) ?? 0;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Search</h1>
          <p className="text-sm text-slate-600">Google Search Console trends and comparisons.</p>
        </div>
        <RangeSelector value={range} onChange={setRange} />
      </header>

      {error ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {actionError ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}

      {loading ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:p-6">
          <SkeletonCards />
          <SkeletonChart />
          <SkeletonChart heightClassName="h-[260px]" />
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
              {isFetching ? "Starting..." : "Fetch GSC Snapshot"}
            </button>
          </div>

          {!data.integrations?.connected ? (
            <p className="rounded-[10px] bg-amber-50 px-3 py-2 text-sm text-amber-700">Google is not connected. Configure and connect from Settings.</p>
          ) : null}

          {data.integrations?.connected && data.integrations.gscSiteUrl ? (
            <p className="rounded-[10px] bg-sky-50 px-3 py-2 text-sm text-sky-700">
              Connected as {data.integrations.googleEmail ?? "Google account"} · {data.integrations.gscSiteUrl}
            </p>
          ) : null}

          {runningScanRunId ? <p className="text-sm text-slate-600">Snapshot status: fetching…</p> : null}

          {hasSnapshot ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Clicks"
                  value={new Intl.NumberFormat().format(latestPoint?.clicks ?? 0)}
                  change={data.delta?.changes.clicks}
                />
                <MetricCard
                  label="Impressions"
                  value={new Intl.NumberFormat().format(latestPoint?.impressions ?? 0)}
                  change={data.delta?.changes.impressions}
                />
                <MetricCard
                  label="CTR"
                  value={`${((latestPoint?.ctr ?? 0) * 100).toFixed(2)}%`}
                  change={data.delta?.changes.ctr}
                />
                <MetricCard
                  label="Avg Position"
                  value={(latestPoint?.position ?? 0).toFixed(1)}
                  change={data.delta?.changes.position}
                  invertSentiment
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-700">Clicks & impressions over time</p>
                <div className="mt-3 h-[220px] w-full sm:h-[260px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendPoints}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                      <Line yAxisId="right" type="monotone" dataKey="impressions" stroke="#7dd3fc" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-700">Top queries</p>
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-100">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-3 py-2 font-medium">Keyword</th>
                          <th className="px-3 py-2 text-right font-medium">Clicks</th>
                          <th className="px-3 py-2 text-right font-medium">Impressions</th>
                          <th className="px-3 py-2 text-right font-medium">CTR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.topQueries.map((item) => {
                          const clickPercent = totalTopQueryClicks > 0 ? (item.clicks / totalTopQueryClicks) * 100 : 0;
                          const impressionPercent =
                            totalTopQueryImpressions > 0 ? (item.impressions / totalTopQueryImpressions) * 100 : 0;
                          return (
                            <tr key={item.query} className="text-slate-700">
                              <td className="px-3 py-2">
                                <span className="block truncate" title={item.query}>
                                  {item.query}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-slate-900">
                                {new Intl.NumberFormat().format(item.clicks)}
                                <span className="ml-2 text-xs text-slate-500">{clickPercent.toFixed(1)}%</span>
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-slate-900">
                                {new Intl.NumberFormat().format(item.impressions)}
                                <span className="ml-2 text-xs text-slate-500">{impressionPercent.toFixed(1)}%</span>
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-slate-900">
                                {(item.ctr * 100).toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-700">Top pages</p>
                  <div className="mt-3 h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={data.topPages} margin={{ left: 12 }}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
                        <YAxis
                          type="category"
                          width={180}
                          dataKey="page"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          tickFormatter={(value: string) => truncateLabel(value)}
                        />
                        <Tooltip />
                        <Bar dataKey="clicks" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-900">No search data for this period</p>
              <p className="mt-1 text-sm text-slate-600">Fetch a GSC snapshot after connecting Google in Settings.</p>
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
