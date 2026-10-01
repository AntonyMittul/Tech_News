"use client";

import { useEffect, useState } from "react";

import { PreferenceArticle, preferenceKeys, readPreference, toggleStoredId, writePreference } from "@/lib/preferences";

export function BookmarkButton({ article }: { article: PreferenceArticle }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readPreference<PreferenceArticle[]>(preferenceKeys.bookmarks, []).some((item) => item.id === article.id));
    sync();
    window.addEventListener("signal-preferences-changed", sync);
    return () => window.removeEventListener("signal-preferences-changed", sync);
  }, [article.id]);

  function toggleBookmark() {
    const bookmarks = readPreference<PreferenceArticle[]>(preferenceKeys.bookmarks, []);
    const next = saved ? bookmarks.filter((item) => item.id !== article.id) : [...bookmarks.filter((item) => item.id !== article.id), article];
    writePreference(preferenceKeys.bookmarks, next);
    setSaved(!saved);
  }

  return <button className="focus-ring border border-[var(--line)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]" type="button" onClick={toggleBookmark} aria-pressed={saved}>{saved ? "★ Saved" : "☆ Save"}</button>;
}

export function MarkArticleRead({ articleId }: { articleId: string }) {
  useEffect(() => {
    const read = readPreference<string[]>(preferenceKeys.read, []);
    if (!read.includes(articleId)) toggleStoredId(preferenceKeys.read, articleId);
  }, [articleId]);

  return null;
}
