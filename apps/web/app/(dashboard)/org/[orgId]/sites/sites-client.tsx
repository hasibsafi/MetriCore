"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type SiteDto = {
  id: string;
  orgId: string;
  url: string;
  displayName: string;
  createdAt: string;
};

type SitesClientProps = {
  orgId: string;
};

export function SitesClient({ orgId }: SitesClientProps) {
  const [sites, setSites] = useState<SiteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadSites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orgs/${orgId}/sites`, { cache: "no-store" });
      const body = (await response.json()) as { message?: string; sites?: SiteDto[] };

      if (!response.ok) {
        setError(body.message ?? "Unable to load sites.");
        setSites([]);
        return;
      }

      setSites(body.sites ?? []);
    } catch {
      setError("Unable to load sites.");
      setSites([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void loadSites();
  }, [loadSites]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      url: String(formData.get("url") ?? "").trim(),
      displayName: String(formData.get("displayName") ?? "").trim()
    };

    setSubmitting(true);

    try {
      const response = await fetch(`/api/orgs/${orgId}/sites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        setFormError(body.message ?? "Unable to create site.");
        return;
      }

      setIsModalOpen(false);
      await loadSites();
      (event.currentTarget as HTMLFormElement).reset();
    } catch {
      setFormError("Unable to create site.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Sites</h1>
          <p className="mt-1 text-sm text-slate-600">Manage monitored sites and create new entries.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="rounded-[10px] bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          Add site
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading sites…</p> : null}
      {error ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {!loading && !error && sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <p className="text-base font-medium text-slate-900">No sites yet</p>
          <p className="mt-2 text-sm text-slate-600">Add your first site to begin tracking performance and analytics.</p>
        </div>
      ) : null}

      {!loading && !error && sites.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-3 font-medium">Display name</th>
                  <th className="px-3 py-3 font-medium">URL</th>
                  <th className="px-3 py-3 font-medium">Site ID</th>
                  <th className="px-3 py-3 font-medium">Created</th>
                  <th className="px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id} className="border-b border-slate-100 text-slate-700 last:border-b-0">
                    <td className="px-3 py-3 font-medium text-slate-900">{site.displayName}</td>
                    <td className="px-3 py-3">{site.url}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{site.id}</td>
                    <td className="px-3 py-3">{new Date(site.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/org/${orgId}/sites/${site.id}/health`}
                          className="inline-flex rounded-[10px] border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Health
                        </Link>
                        <button
                          type="button"
                          onClick={async () => {
                            setDeleteError(null);
                            const confirmed = window.confirm(`Delete ${site.displayName}? This removes all site data.`);
                            if (!confirmed) {
                              return;
                            }

                            setDeletingSiteId(site.id);
                            try {
                              const response = await fetch(`/api/orgs/${orgId}/sites/${site.id}`, {
                                method: "DELETE"
                              });
                              const body = (await response.json()) as { message?: string };
                              if (!response.ok) {
                                setDeleteError(body.message ?? "Unable to delete site.");
                                return;
                              }

                              await loadSites();
                            } catch {
                              setDeleteError("Unable to delete site.");
                            } finally {
                              setDeletingSiteId(null);
                            }
                          }}
                          disabled={deletingSiteId === site.id}
                          className="inline-flex rounded-[10px] border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          {deletingSiteId === site.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {deleteError ? <p className="mt-4 rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{deleteError}</p> : null}
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Add site</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-slate-200 text-slate-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-slate-700">
                  Display name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  required
                  minLength={2}
                  maxLength={80}
                  className="w-full rounded-[10px] border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-300 focus:ring-2"
                />
              </div>

              <div>
                <label htmlFor="url" className="mb-1 block text-sm font-medium text-slate-700">
                  Site URL
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  required
                  placeholder="https://example.com"
                  className="w-full rounded-[10px] border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-300 focus:ring-2"
                />
              </div>

              {formError ? <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-[10px] bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create site"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
