"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { useDarkMode } from "./hooks/use-dark-mode";
import { Icons } from "./icons";
import { LogoMark } from "./logo-mark";

const NAV_ITEMS: Array<[label: string, id: string]> = [
  ["Product", "product"],
  ["Metrics", "metrics"],
  ["Recommendations", "recs"],
  ["Integrations", "integrations"]
];

export function Topbar() {
  const [dark, setDark] = useDarkMode();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onNavClick = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 72, behavior: "smooth" });
    }
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: scrolled ? "var(--topbar-bg-scrolled)" : "var(--topbar-bg)",
        backdropFilter: scrolled ? "saturate(180%) blur(12px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--border-default)" : "transparent"}`,
        transition: "all 200ms"
      }}
    >
      <div
        className="mc-container"
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 24
        }}
      >
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <LogoMark size={30} />
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--fg-primary)",
              letterSpacing: "-0.01em"
            }}
          >
            MetriCore
          </span>
        </a>

        <nav
          className="mc-topnav"
          style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}
        >
          {NAV_ITEMS.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={onNavClick(id)}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--fg-secondary)",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: 8,
                transition: "all 150ms"
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = "var(--fg-primary)";
                event.currentTarget.style.background = "var(--bg-muted)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = "var(--fg-secondary)";
                event.currentTarget.style.background = "transparent";
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1px solid var(--border-default)",
              background: "var(--bg-surface)",
              color: "var(--fg-body)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 150ms"
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "var(--bg-muted)";
              event.currentTarget.style.color = "var(--fg-primary)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "var(--bg-surface)";
              event.currentTarget.style.color = "var(--fg-body)";
            }}
          >
            {dark ? <Icons.Sun width={16} height={16} /> : <Icons.Moon width={16} height={16} />}
          </button>

          <Link
            href="/sign-in"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--fg-body)",
              textDecoration: "none",
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid transparent"
            }}
          >
            Sign in
          </Link>

          <Link
            href="/sign-up"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              background: "var(--accent)",
              textDecoration: "none",
              padding: "9px 16px",
              borderRadius: 10,
              transition: "background 150ms",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "var(--accent-hover)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "var(--accent)";
            }}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
