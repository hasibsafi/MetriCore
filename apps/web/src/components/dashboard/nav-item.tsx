"use client";

import Link from "next/link";
import { ReactNode } from "react";

type NavItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
  disabled?: boolean;
  compact?: boolean;
  responsiveCompact?: boolean;
  onNavigate?: () => void;
};

export function NavItem({
  href,
  label,
  icon,
  isActive,
  disabled = false,
  compact = false,
  responsiveCompact = false,
  onNavigate
}: NavItemProps) {
  const baseClasses = [
    "group flex items-center rounded-[10px] border px-3 py-2 text-sm transition",
    compact ? "justify-center px-2" : responsiveCompact ? "justify-center gap-0 px-2 xl:justify-start xl:gap-3" : "gap-3"
  ].join(" ");

  const content = (
    <>
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-700 group-hover:bg-slate-200">
        {icon}
      </span>
      {!compact ? <span className={responsiveCompact ? "hidden truncate xl:inline" : "truncate"}>{label}</span> : null}
    </>
  );

  if (disabled) {
    return (
      <span
        className={[
          baseClasses,
          "cursor-not-allowed border-transparent text-slate-400 opacity-70"
        ].join(" ")}
        aria-disabled="true"
        title={`${label} (add a site first)`}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        baseClasses,
        isActive
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
      ].join(" ")}
      title={label}
    >
      {content}
    </Link>
  );
}
