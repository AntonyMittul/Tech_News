"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("signal-theme-change", onStoreChange);
      return () => window.removeEventListener("signal-theme-change", onStoreChange);
    },
    () => (document.documentElement.dataset.theme as Theme | undefined) ?? "dark",
    () => "dark",
  );

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("signal-theme") as Theme | null;
    const preferredTheme = storedTheme ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.dataset.theme = preferredTheme;
    window.dispatchEvent(new Event("signal-theme-change"));
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("signal-theme", nextTheme);
    window.dispatchEvent(new Event("signal-theme-change"));
  }

  return (
    <button
      className="focus-ring border border-[var(--line)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      aria-pressed={theme === "light"}
      onClick={toggleTheme}
    >
      {theme === "dark" ? "[ light mode ]" : "[ dark mode ]"}
    </button>
  );
}
