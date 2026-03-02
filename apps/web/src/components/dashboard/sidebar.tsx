"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ReactNode } from "react";
import { NavItem } from "./nav-item";

type SidebarProps = {
  orgId: string;
  primarySiteId: string | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

type NavLinkItem = {
  label: string;
  href: string;
  icon: ReactNode;
  disabled?: boolean;
};

type SiteSummary = {
  id: string;
  displayName: string;
  url: string;
};

function IconOverview() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M4 11.5 12 5l8 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 10.5V19h9v-8.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSites() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M7 7h12" strokeLinecap="round" />
      <path d="M7 12h12" strokeLinecap="round" />
      <path d="M7 17h12" strokeLinecap="round" />
      <circle cx="4" cy="7" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function IconHealth() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11h3l1.5-3 2.5 6 1.5-3H19" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAnalytics() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M4 18h16" strokeLinecap="round" />
      <path d="M7 15l4-4 3 3 4-6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="11" r="1" fill="currentColor" />
      <circle cx="14" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" strokeLinecap="round" />
    </svg>
  );
}

function IconRecommendations() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M12 3 14.2 8l5.3.4-4 3.4 1.3 5.2L12 14l-4.8 3 1.3-5.2-4-3.4 5.3-.4L12 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path
        d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12h2l1-2 2-1 2 1 2-1 2 1 2-1 2 1 1 2h2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getNav(orgId: string, siteId: string | null): NavLinkItem[] {
  const siteBasePath = siteId ? `/org/${orgId}/sites/${siteId}` : `/org/${orgId}/sites`;
  const siteMissing = !siteId;

  return [
    { label: "Overview", href: `/org/${orgId}/overview`, icon: <IconOverview /> },
    { label: "Sites", href: `/org/${orgId}/sites`, icon: <IconSites /> },
    { label: "Health", href: `${siteBasePath}/health`, icon: <IconHealth />, disabled: siteMissing },
    { label: "Analytics", href: `${siteBasePath}/analytics`, icon: <IconAnalytics />, disabled: siteMissing },
    { label: "Search", href: `${siteBasePath}/search`, icon: <IconSearch />, disabled: siteMissing },
    { label: "Recommendations", href: `${siteBasePath}/recommendations`, icon: <IconRecommendations />, disabled: siteMissing },
    { label: "Settings", href: `/org/${orgId}/settings`, icon: <IconSettings /> }
  ];
}

function getSiteIdFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const sitesIndex = segments.indexOf("sites");
  if (sitesIndex === -1) {
    return null;
  }

  return segments[sitesIndex + 1] ?? null;
}

function buildSiteHref(pathname: string, orgId: string, siteId: string) {
  const segments = pathname.split("/").filter(Boolean);
  const sitesIndex = segments.indexOf("sites");

  if (sitesIndex !== -1 && segments[sitesIndex + 1]) {
    const rest = segments.slice(sitesIndex + 2);
    const suffix = rest.length > 0 ? `/${rest.join("/")}` : "/health";
    return `/org/${orgId}/sites/${siteId}${suffix}`;
  }

  return `/org/${orgId}/sites/${siteId}/health`;
}

function SidebarContent({
  orgId,
  primarySiteId,
  compact,
  responsiveCompact,
  onNavigate
}: {
  orgId: string;
  primarySiteId: string | null;
  compact?: boolean;
  responsiveCompact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const currentSiteId = getSiteIdFromPath(pathname);
  const [selectedSiteId, setSelectedSiteId] = useState(currentSiteId ?? primarySiteId ?? "");

  useEffect(() => {
    setSelectedSiteId(currentSiteId ?? primarySiteId ?? "");
  }, [currentSiteId, primarySiteId]);

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
          setSites(body.sites ?? []);
          setSitesError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setSites([]);
          setSitesError(error instanceof Error ? error.message : "Unable to load sites.");
        }
      }
    }

    void loadSites();

    return () => {
      cancelled = true;
    };
  }, [orgId]);

  const items = useMemo(() => getNav(orgId, selectedSiteId || null), [orgId, selectedSiteId]);
  const canSwitchSites = sites.length > 0;

  function handleSiteChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextSiteId = event.target.value;
    setSelectedSiteId(nextSiteId);
    const target = buildSiteHref(pathname, orgId, nextSiteId);
    router.push(target);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-sky-500 text-sm font-semibold text-white">
          IP
        </div>
        {!compact ? (
          <p className={responsiveCompact ? "mt-3 hidden text-sm font-semibold text-slate-900 xl:block" : "mt-3 text-sm font-semibold text-slate-900"}>
            MetriCore
          </p>
        ) : null}
      </div>

        {!compact ? (
          <div className={responsiveCompact ? "border-b border-slate-200 px-4 py-3 hidden xl:block" : "border-b border-slate-200 px-4 py-3"}>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Site</label>
            {canSwitchSites ? (
              <select
                value={selectedSiteId}
                onChange={handleSiteChange}
                className="mt-2 w-full rounded-[10px] border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 outline-none ring-sky-300 focus:ring-2"
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.displayName || site.url}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-2 text-xs text-slate-500">{sitesError ?? "No sites available."}</p>
            )}
          </div>
        ) : null}

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            compact={compact}
            responsiveCompact={responsiveCompact}
            isActive={!item.disabled && pathname === item.href}
            disabled={item.disabled}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </div>
  );
}

export function Sidebar({ orgId, primarySiteId, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-900/40 md:hidden" onClick={onCloseMobile} aria-hidden="true" />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-[260px] border-r border-slate-200 bg-white shadow-sm transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        ].join(" ")}
        aria-label="Mobile sidebar"
      >
        <div className="flex h-14 items-center justify-end border-b border-slate-200 px-3">
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 text-slate-600"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <SidebarContent orgId={orgId} primarySiteId={primarySiteId} onNavigate={onCloseMobile} />
      </aside>

      <aside className="hidden border-r border-slate-200 bg-white md:block md:w-[72px] xl:w-[260px]" aria-label="Desktop sidebar">
        <SidebarContent orgId={orgId} primarySiteId={primarySiteId} responsiveCompact={true} />
      </aside>
    </>
  );
}
