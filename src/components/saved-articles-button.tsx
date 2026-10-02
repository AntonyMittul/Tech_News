"use client";

export function SavedArticlesButton() {
  function toggleSavedArticles() {
    window.dispatchEvent(new Event("signal-toggle-saved"));
    document.getElementById("news-feed")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      className="focus-ring flex h-10 w-10 items-center justify-center border border-[var(--line)] font-mono text-lg leading-none text-[var(--muted)] transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
      type="button"
      aria-label="Toggle saved articles"
      title="Toggle saved articles"
      onClick={toggleSavedArticles}
    >
      <span aria-hidden="true">☆</span>
    </button>
  );
}
