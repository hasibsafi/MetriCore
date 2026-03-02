"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type SiteOption = {
  id: string;
  displayName: string;
  url: string;
};

type SitesResponse = {
  sites: SiteOption[];
  message?: string;
};

type IntegrationResponse = {
  connected: boolean;
  googleEmail: string | null;
  connectedAt: string | null;
  ga4PropertyId: string | null;
  gscSiteUrl: string | null;
  message?: string;
};

type SettingsClientProps = {
  orgId: string;
};

export function SettingsClient({ orgId }: SettingsClientProps) {
  const searchParams = useSearchParams();
  const googleError = searchParams.get("googleError");

  const [sites, setSites] = useState<SiteOption[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [integration, setIntegration] = useState<IntegrationResponse | null>(null);
  const [ga4PropertyId, setGa4PropertyId] = useState("");
  const [gscSiteUrl, setGscSiteUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSite = useMemo(() => sites.find((site) => site.id === selectedSiteId) ?? null, [sites, selectedSiteId]);

  const loadIntegration = useCallback(
    async (siteId: string) => {
      try {
        const response = await fetch(`/api/orgs/${orgId}/sites/${siteId}/integrations/google`, { cache: "no-store" });
        const body = (await response.json()) as IntegrationResponse;

        if (!response.ok) {
          setError(body.message ?? "Unable to load integration.");
          return;
        }

        setIntegration(body);
        setGa4PropertyId(body.ga4PropertyId ?? "");
        setGscSiteUrl(body.gscSiteUrl ?? "");
      } catch {
        setError("Unable to load integration.");
      }
    },
    [orgId]
  );

  useEffect(() => {
    let mounted = true;

    async function loadSites() {
      try {
        const response = await fetch(`/api/orgs/${orgId}/sites`, { cache: "no-store" });
        const body = (await response.json()) as SitesResponse;

        if (!response.ok) {
          if (mounted) {
            setError(body.message ?? "Unable to load sites.");
            setLoading(false);
          }
          return;
        }

        if (!mounted) {
          return;
        }

        setSites(body.sites);

        const firstSiteId = body.sites[0]?.id ?? "";
        setSelectedSiteId(firstSiteId);

        if (firstSiteId) {
          await loadIntegration(firstSiteId);
        }
      } catch {
        if (mounted) {
          setError("Unable to load sites.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadSites();

    return () => {
      mounted = false;
    };
  }, [orgId, loadIntegration]);

  useEffect(() => {
    if (!selectedSiteId) {
      setIntegration(null);
      return;
    }

    void loadIntegration(selectedSiteId);
  }, [selectedSiteId, loadIntegration]);

  async function handleSaveConfig() {
    if (!selectedSiteId) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload: Record<string, string> = {};
      if (ga4PropertyId.trim()) {
        payload.ga4PropertyId = ga4PropertyId.trim();
      }
      if (gscSiteUrl.trim()) {
        payload.gscSiteUrl = gscSiteUrl.trim();
      }

      const response = await fetch(`/api/orgs/${orgId}/sites/${selectedSiteId}/integrations/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const body = (await response.json()) as IntegrationResponse;

      if (!response.ok) {
        setError(body.message ?? "Unable to save integration settings.");
        return;
      }

      setIntegration(body);
      setMessage("Integration settings saved.");
    } catch {
      setError("Unable to save integration settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    if (!selectedSiteId) {
      return;
    }

    setDisconnecting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/orgs/${orgId}/sites/${selectedSiteId}/integrations/google`, {
        method: "DELETE"
      });

      const body = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok) {
        setError(body.message ?? "Unable to disconnect Google.");
        return;
      }

      setMessage("Google integration disconnected.");
      await loadIntegration(selectedSiteId);
    } catch {
      setError("Unable to disconnect Google.");
    } finally {
      setDisconnecting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading settings…</p>;
  }

  if (!sites.length) {
    return <p className="rounded-[10px] bg-sky-50 px-3 py-2 text-sm text-sky-700">Add a site first to connect Google.</p>;
  }

  const connectHref = selectedSiteId
    ? `/api/google/connect?orgId=${encodeURIComponent(orgId)}&siteId=${encodeURIComponent(selectedSiteId)}&returnTo=${encodeURIComponent(
        `/org/${orgId}/settings`
      )}`
    : "#";

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Google integrations</h2>
        <p className="text-sm text-slate-600">Configure GA4 and GSC IDs, then connect Google for the selected site.</p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <label className="block text-sm font-medium text-slate-700" htmlFor="site-select">
          Site
        </label>
        <select
          id="site-select"
          className="mt-2 w-full rounded-[10px] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          value={selectedSiteId}
          onChange={(event) => setSelectedSiteId(event.target.value)}
        >
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.displayName} ({site.url})
            </option>
          ))}
        </select>

        {selectedSite ? <p className="mt-2 text-xs text-slate-500">Site ID: {selectedSite.id}</p> : null}

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="ga4-property-id">
              GA4 Property ID
            </label>
            <input
              id="ga4-property-id"
              type="text"
              value={ga4PropertyId}
              onChange={(event) => setGa4PropertyId(event.target.value)}
              placeholder="properties/123456789"
              className="mt-2 w-full rounded-[10px] border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="gsc-site-url">
              GSC Site URL
            </label>
            <input
              id="gsc-site-url"
              type="text"
              value={gscSiteUrl}
              onChange={(event) => setGscSiteUrl(event.target.value)}
              placeholder="sc-domain:example.com"
              className="mt-2 w-full rounded-[10px] border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={saving}
            className="rounded-[10px] bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save integration settings"}
          </button>

          <a
            href={connectHref}
            className="rounded-[10px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Connect Google
          </a>

          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting || !integration?.connected}
            className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
          >
            {disconnecting ? "Disconnecting..." : "Disconnect Google"}
          </button>
        </div>
      </div>

      {googleError ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">Google connect failed: {googleError}</p> : null}
      {error ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-[10px] bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-slate-900">Connection status</h3>
        <p className="mt-2 text-sm text-slate-700">Connected: {integration?.connected ? "Yes" : "No"}</p>
        <p className="text-sm text-slate-700">Google account: {integration?.googleEmail ?? "-"}</p>
        <p className="text-sm text-slate-700">
          Connected at: {integration?.connectedAt ? new Date(integration.connectedAt).toLocaleString() : "-"}
        </p>
      </div>
    </section>
  );
}
