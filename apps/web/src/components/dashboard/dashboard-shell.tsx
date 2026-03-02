"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type DashboardShellProps = {
  orgId: string;
  userEmail: string | null;
  primarySiteId: string | null;
  children: React.ReactNode;
};

export function DashboardShell({ orgId, userEmail, primarySiteId, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full">
        <Sidebar orgId={orgId} primarySiteId={primarySiteId} mobileOpen={mobileOpen} onCloseMobile={(): void => setMobileOpen(false)} />

        <div className="flex min-h-screen w-full flex-1 flex-col md:ml-0">
          <Topbar userEmail={userEmail} onOpenMobileSidebar={(): void => setMobileOpen(true)} />
          <main className="w-full flex-1 px-4 py-6 sm:px-6 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
