"use client";

import { RecommendationPriority, RecommendationStatus } from "@prisma/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RecommendationDto = {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: "high" | "med" | "low";
  priority: RecommendationPriority;
  status: RecommendationStatus;
  createdAt: string;
  updatedAt: string;
};

type RecommendationsResponse = {
  canWrite: boolean;
  openCount: number;
  recommendations: RecommendationDto[];
  message?: string;
};

type BuildResponse = {
  scanRunId: string;
  jobId: string;
  message?: string;
};

type DoneResponse = {
  success: boolean;
  message?: string;
};

type JobStatusResponse = {
  status: "queued" | "running" | "completed" | "failed";
  message?: string;
};

type RecommendationsClientProps = {
  orgId: string;
  siteId: string;
};

export function RecommendationsClient({ orgId, siteId }: RecommendationsClientProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | RecommendationStatus>("open");
  const [priorityFilter, setPriorityFilter] = useState<"all" | RecommendationPriority>("all");
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [runningScanRunId, setRunningScanRunId] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadRecommendations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (priorityFilter !== "all") {
        params.set("priority", priorityFilter);
      }

      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`/api/orgs/${orgId}/sites/${siteId}/recommendations${query}`, {
        cache: "no-store"
      });
      const body = (await response.json()) as RecommendationsResponse;

      if (!response.ok) {
        setError(body.message ?? "Unable to load recommendations.");
        setData(null);
        return;
      }

      setError(null);
      setData(body);
    } catch {
      setError("Unable to load recommendations.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [orgId, siteId, statusFilter, priorityFilter]);

  useEffect(() => {
    void loadRecommendations();
  }, [loadRecommendations]);

  useEffect(() => {
    if (!runningScanRunId) {
      return;
    }

    pollTimerRef.current = setInterval(async () => {
      const response = await fetch(`/api/jobs/${runningScanRunId}`, { cache: "no-store" });
      const body = (await response.json()) as JobStatusResponse;

      if (!response.ok) {
        setActionError(body.message ?? "Unable to poll build status.");
        return;
      }

      if (body.status === "completed" || body.status === "failed") {
        setRunningScanRunId(null);
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        await loadRecommendations();
      }
    }, 2000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [runningScanRunId, loadRecommendations]);

  async function handleBuild() {
    setIsBuilding(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/orgs/${orgId}/sites/${siteId}/recommendations/build`, {
        method: "POST"
      });
      const body = (await response.json()) as BuildResponse;

      if (!response.ok) {
        setActionError(body.message ?? "Unable to trigger recommendations build.");
        return;
      }

      setRunningScanRunId(body.scanRunId);
    } catch {
      setActionError("Unable to trigger recommendations build.");
    } finally {
      setIsBuilding(false);
    }
  }

  async function handleMarkDone(recId: string) {
    setActionError(null);

    try {
      const response = await fetch(`/api/orgs/${orgId}/sites/${siteId}/recommendations/${recId}/done`, {
        method: "POST"
      });
      const body = (await response.json()) as DoneResponse;

      if (!response.ok) {
        setActionError(body.message ?? "Unable to mark recommendation done.");
        return;
      }

      if (body.success) {
        await loadRecommendations();
      }
    } catch {
      setActionError("Unable to mark recommendation done.");
    }
  }

  const recommendations = useMemo(() => data?.recommendations ?? [], [data?.recommendations]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Recommendations</h1>
        <p className="text-sm text-slate-600">Deterministic recommendations generated from latest PageSpeed, GA4, and GSC data.</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | RecommendationStatus)}
            className="rounded-[10px] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">All statuses</option>
            <option value={RecommendationStatus.open}>Open</option>
            <option value={RecommendationStatus.done}>Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as "all" | RecommendationPriority)}
            className="rounded-[10px] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">All priorities</option>
            <option value={RecommendationPriority.P0}>P0</option>
            <option value={RecommendationPriority.P1}>P1</option>
            <option value={RecommendationPriority.P2}>P2</option>
          </select>

          <span className="text-sm text-slate-600">Open count: {data?.openCount ?? 0}</span>
        </div>

        <button
          type="button"
          onClick={handleBuild}
          disabled={!data?.canWrite || isBuilding || runningScanRunId !== null}
          className="rounded-[10px] bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-60"
        >
          {isBuilding ? "Starting..." : "Build Recommendations"}
        </button>
      </div>

      {runningScanRunId ? <p className="text-sm text-slate-600">Build status: running…</p> : null}
      {loading ? <p className="text-sm text-slate-600">Loading recommendations…</p> : null}
      {error ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {actionError ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}

      {!loading && !error && recommendations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-900">No recommendations found</p>
          <p className="mt-1 text-sm text-slate-600">Trigger a build to generate recommendations from current data.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {recommendations.map((rec) => (
          <article key={rec.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{rec.category}</p>
                <h2 className="mt-1 text-base font-semibold text-slate-900">{rec.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={rec.priority} tone="slate" />
                <Badge label={rec.impact} tone="sky" />
                <Badge label={rec.status} tone={rec.status === RecommendationStatus.open ? "amber" : "green"} />
              </div>
            </div>

            <p className="text-sm text-slate-700">{rec.description}</p>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Updated {new Date(rec.updatedAt).toLocaleString()}</p>
              {rec.status === RecommendationStatus.open ? (
                <button
                  type="button"
                  onClick={() => void handleMarkDone(rec.id)}
                  disabled={!data?.canWrite}
                  className="rounded-[10px] border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Mark Done
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Badge({ label, tone }: { label: string; tone: "slate" | "sky" | "amber" | "green" }) {
  const className =
    tone === "sky"
      ? "bg-sky-50 text-sky-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : tone === "green"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-700";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{label}</span>;
}
