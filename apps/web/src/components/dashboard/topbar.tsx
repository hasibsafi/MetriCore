"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type TopbarProps = {
  userEmail: string | null;
  onOpenMobileSidebar: () => void;
};

export function Topbar({ userEmail, onOpenMobileSidebar }: TopbarProps) {
  const [rangeLabel, setRangeLabel] = useState("Last 28 days");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("metricore:date-range");
    if (stored) {
      setRangeLabel(stored);
    }
  }, []);

  function setRange(nextLabel: string) {
    setRangeLabel(nextLabel);
    window.localStorage.setItem("metricore:date-range", nextLabel);
    setRangeOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-slate-200 text-slate-700 md:hidden"
          aria-label="Open sidebar"
        >
          ☰
        </button>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-slate-200 text-slate-700 md:hidden"
          aria-label="Toggle search"
          onClick={() => setMobileSearchOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="M16 16l4 4" strokeLinecap="round" />
          </svg>
        </button>

        <label className="hidden flex-1 items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
          <span className="text-slate-500" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="11" cy="11" r="6" />
              <path d="M16 16l4 4" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => {
              setRangeOpen((open) => !open);
              setAccountOpen(false);
            }}
            className="rounded-[10px] border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
            aria-expanded={rangeOpen}
          >
            {rangeLabel}
          </button>
          {rangeOpen ? (
            <div className="absolute right-0 mt-2 w-44 rounded-[10px] border border-slate-200 bg-white p-2 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              {["Last 7 days", "Last 28 days", "Last 90 days"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setRange(label)}
                  className="w-full rounded-[8px] px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-slate-200 text-slate-700"
          aria-label="Notifications"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 12 0c0 6 2 6 2 8H4c0-2 2-2 2-8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setAccountOpen((open) => !open);
              setRangeOpen(false);
            }}
            className="rounded-[10px] border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
            aria-expanded={accountOpen}
          >
            Account
          </button>
          {accountOpen ? (
            <div className="absolute right-0 mt-2 w-56 rounded-[10px] border border-slate-200 bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              <p className="truncate text-xs text-slate-500">Signed in as</p>
              <p className="truncate text-sm font-medium text-slate-900">{userEmail ?? "unknown"}</p>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="mt-3 w-full rounded-[10px] bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {mobileSearchOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6 md:hidden">
          <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-slate-500" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="11" cy="11" r="6" />
                <path d="M16 16l4 4" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>
      ) : null}
    </header>
  );
}
