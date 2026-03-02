"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RangeSelector } from "../../../../../src/components/charts/range-selector";

type SiteSummary = {
  id: string;
  displayName: string;
  url: string;
};

type OverviewResponse = {
  site: {
    id: string;
    displayName: string;
    url: string;
  };
  range: "7d" | "30d" | "90d";
  ga4: {
    sessions: number;
    users: number;
    dateStart: string;
    dateEnd: string;
    createdAt: string;
  } | null;
  gsc: {
    clicks: number;
    impressions: number;
    dateStart: string;
    dateEnd: string;
    createdAt: string;
  } | null;
  message?: string;
};

type AnalyticsHistoryResponse = {
  range: "7d" | "30d" | "90d";
  points: Array<{ date: string; sessions: number; users: number }>;
  message?: string;
};

type SearchHistoryResponse = {
  range: "7d" | "30d" | "90d";
  points: Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>;
  message?: string;
};

type OverviewClientProps = {
  orgId: string;
};

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat().format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function OverviewClient({ orgId }: OverviewClientProps) {
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [analyticsHistory, setAnalyticsHistory] = useState<AnalyticsHistoryResponse | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSites() {
      try {
        const response = await fetch(`/api/orgs/${orgId}/sites`, { cache: "no-store" });
        const body = (await response.json()) as { message?: string; sites?: SiteSummary[] };

        if (!response.ok) {
          throw new Error(body.message ?? "Unable to load sites.");
        }

        if (!cancelled) {
          const nextSites = body.sites ?? [];
          setSites(nextSites);
          if (!selectedSiteId && nextSites.length > 0) {
            setSelectedSiteId(nextSites[0]?.id ?? "");
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setSites([]);
          setError(loadError instanceof Error ? loadError.message : "Unable to load sites.");
        }
      }
    }

    void loadSites();

    return () => {
      cancelled = true;
    };
  }, [orgId]);

  const loadOverview = useCallback(async () => {
    if (!selectedSiteId) {
      setLoading(false);
      setAnalyticsHistory(null);
      setSearchHistory(null);
      return;
    }

    setLoading(true);

    try {
      const [overviewResponse, analyticsResponse, searchResponse] = await Promise.all([
        fetch(`/api/orgs/${orgId}/sites/${selectedSiteId}/overview?range=${range}`, { cache: "no-store" }),
        fetch(`/api/orgs/${orgId}/sites/${selectedSiteId}/analytics/history?range=${range}`, { cache: "no-store" }),
        fetch(`/api/orgs/${orgId}/sites/${selectedSiteId}/search/history?range=${range}`, { cache: "no-store" })
      ]);

      const overviewBody = (await overviewResponse.json()) as OverviewResponse;
      if (!overviewResponse.ok) {
        setError(overviewBody.message ?? "Unable to load overview.");
        setData(null);
      } else {
        setError(null);
        setData(overviewBody);
      }

      const analyticsBody = (await analyticsResponse.json()) as AnalyticsHistoryResponse;
      const searchBody = (await searchResponse.json()) as SearchHistoryResponse;

      if (!analyticsResponse.ok) {
        setChartError(analyticsBody.message ?? "Unable to load analytics history.");
        setAnalyticsHistory(null);
      } else {
        setChartError(null);
        setAnalyticsHistory(analyticsBody);
      }

      if (!searchResponse.ok) {
        setChartError(searchBody.message ?? "Unable to load search history.");
        setSearchHistory(null);
      } else {
        setSearchHistory(searchBody);
      }
    } catch {
      setError("Unable to load overview.");
      setData(null);
      setChartError("Unable to load charts.");
      setAnalyticsHistory(null);
      setSearchHistory(null);
    } finally {
      setLoading(false);
    }
  }, [orgId, range, selectedSiteId]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const latestUpdate = useMemo(() => {
    if (!data) {
      return null;
    }

    const ga4Date = data.ga4?.createdAt ? new Date(data.ga4.createdAt) : null;
    const gscDate = data.gsc?.createdAt ? new Date(data.gsc.createdAt) : null;

    if (!ga4Date && !gscDate) {
      return null;
    }

    if (!ga4Date) {
      return gscDate;
    }

    if (!gscDate) {
      return ga4Date;
    }

    return ga4Date > gscDate ? ga4Date : gscDate;
  }, [data]);

  const analyticsChartData = useMemo(() => {
    return (analyticsHistory?.points ?? []).map((item) => ({
      ...item,
      label: new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    }));
  }, [analyticsHistory]);

  const searchChartData = useMemo(() => {
    return (searchHistory?.points ?? []).map((item) => ({
      ...item,
      label: new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    }));
  }, [searchHistory]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-600">Snapshot of health, analytics, and recommendations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSiteId}
            onChange={(event) => setSelectedSiteId(event.target.value)}
            className="rounded-[10px] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-sky-300 focus:ring-2"
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.displayName || site.url}
              </option>
            ))}
          </select>
          <RangeSelector value={range} onChange={setRange} />
        </div>
      </header>

      {error ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {chartError ? <p className="rounded-[10px] bg-amber-50 px-3 py-2 text-sm text-amber-700">{chartError}</p> : null}

      {!selectedSiteId && !loading ? (
        <p className="rounded-[10px] bg-amber-50 px-3 py-2 text-sm text-amber-700">Add a site to see overview data.</p>
      ) : null}

      {!loading && data ? (
        <p className="text-xs text-slate-500">
          Site: <span className="font-medium text-slate-700">{data.site.displayName}</span> · {data.site.url}
          {latestUpdate ? ` · Updated ${latestUpdate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-slate-500">GA4 Sessions</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(data?.ga4?.sessions)}</p>
          <p className="mt-2 text-xs text-slate-500">
            {data?.ga4 ? `${formatDate(data.ga4.dateStart)} – ${formatDate(data.ga4.dateEnd)}` : "No snapshot"}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-slate-500">GA4 Users</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(data?.ga4?.users)}</p>
          <p className="mt-2 text-xs text-slate-500">
            {data?.ga4 ? `${formatDate(data.ga4.dateStart)} – ${formatDate(data.ga4.dateEnd)}` : "No snapshot"}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-slate-500">GSC Clicks</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(data?.gsc?.clicks)}</p>
          <p className="mt-2 text-xs text-slate-500">
            {data?.gsc ? `${formatDate(data.gsc.dateStart)} – ${formatDate(data.gsc.dateEnd)}` : "No snapshot"}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-slate-500">GSC Impressions</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(data?.gsc?.impressions)}</p>
          <p className="mt-2 text-xs text-slate-500">
            {data?.gsc ? `${formatDate(data.gsc.dateStart)} – ${formatDate(data.gsc.dateEnd)}` : "No snapshot"}
          </p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Traffic Overview</p>
              <p className="text-xs text-slate-500">Sessions and users</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{range}</span>
          </div>
          <div className="mt-4 h-[260px] w-full">
            {analyticsChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsChartData}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sessions" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="users" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                No analytics data yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Search Performance</p>
              <p className="text-xs text-slate-500">Clicks and impressions</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{range}</span>
          </div>
          <div className="mt-4 h-[260px] w-full">
            {searchChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={searchChartData}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="impressions" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                No search data yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
