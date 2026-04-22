"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const MANUAL_THEME_KEY = "mc-theme-manual";
const THEME_KEY = "mc-theme";

export function useDarkMode() {
  // Keep the first server/client render deterministic to avoid hydration mismatches.
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const dark = theme === "dark";

  useEffect(() => {
    try {
      const hasManualPreference = localStorage.getItem(MANUAL_THEME_KEY) === "1";
      const storedTheme = localStorage.getItem(THEME_KEY);
      const resolvedTheme: ThemeMode =
        hasManualPreference && storedTheme === "light" ? "light" : "dark";

      setTheme((current) => (current === resolvedTheme ? current : resolvedTheme));
    } catch {
      // Keep dark mode as the default when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setDark = (next: boolean) => {
    const nextTheme: ThemeMode = next ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem(MANUAL_THEME_KEY, "1");
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // localStorage may be blocked in private contexts.
    }
  };

  return [dark, setDark] as const;
}
