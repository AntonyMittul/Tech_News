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
      className="focus-ring flex h-10 w-10 items-center justify-center border border-[var(--line)] font-mono text-lg leading-none text-[var(--muted)] transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      aria-pressed={theme === "light"}
      onClick={toggleTheme}
    >
      <span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span>
    </button>
  );
}
