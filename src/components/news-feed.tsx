"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, ExternalLink, CircleAlert, Inbox, Loader2 } from "lucide-react";

import { BookmarkButton } from "@/components/bookmark-button";
import {
  PreferenceArticle,
  preferenceKeys,
  readPreference,
  writePreference,
} from "@/lib/preferences";

type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  articleCount: number;
};
type Article = {
  id: string;
  slug: string;
  title: string;
  url: string;
  sourceName: string;
  sourceSlug: string;
  publishedAt: string;
  imageUrl: string | null;
  description: string | null;
  summary: string | null;
  readTimeMinutes: number | null;
  categories: string[];
};

type ArticlesResponse = {
  articles: Article[];
  page: number;
  limit: number;
  hasMore: boolean;
};

function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function LoadingCards() {
  return (
    <div role="status" className="space-y-4" aria-label="Loading articles" aria-busy="true">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse border border-[var(--line)] bg-[var(--panel)] p-5"
        >
          <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
            <div className="min-h-32 bg-[var(--panel-raised)]" />
            <div>
              <div className="h-3 w-1/3 bg-[var(--panel-raised)]" />
              <div className="mt-5 h-6 w-4/5 bg-[var(--panel-raised)]" />
              <div className="mt-4 h-4 w-full bg-[var(--panel-raised)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewsFeed() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [savedArticles, setSavedArticles] = useState<PreferenceArticle[]>([]);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [hideRead, setHideRead] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    const sync = () => {
      setReadIds(readPreference<string[]>(preferenceKeys.read, []));
      setSavedArticles(
        readPreference<PreferenceArticle[]>(preferenceKeys.bookmarks, []),
      );
      setHideRead(readPreference<boolean>(preferenceKeys.hideRead, false));
    };
    sync();
    window.addEventListener("signal-preferences-changed", sync);
    return () => window.removeEventListener("signal-preferences-changed", sync);
  }, []);

  useEffect(() => {
    const toggleSaved = () => setSavedOnly((current) => !current);
    window.addEventListener("signal-toggle-saved", toggleSaved);
    return () => window.removeEventListener("signal-toggle-saved", toggleSaved);
  }, []);

  const loadArticles = useCallback(
    async (nextPage: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: "10",
        });
        if (activeCategory) params.set("category", activeCategory);
        if (submittedQuery) params.set("q", submittedQuery);
        const response = await fetch(`/api/articles?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("The live feed could not be loaded.");
        const data = (await response.json()) as ArticlesResponse;
        setArticles((current) =>
          append ? [...current, ...data.articles] : data.articles,
        );
        setPage(data.page);
        setHasMore(data.hasMore);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "The live feed could not be loaded.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, submittedQuery],
  );

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { categories: Category[] }) => {
        const activeCategories = data.categories;
        setCategories(activeCategories);
        const allCategorySlugs = activeCategories.map((category) => category.slug);
        setPreferredCategories(allCategorySlugs);
        writePreference(preferenceKeys.categories, allCategorySlugs);
      })
      .catch(() => setError("Categories could not be loaded."));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadArticles(1), 0);
    return () => window.clearTimeout(timer);
  }, [loadArticles]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  }

  function selectCategory(slug: string) {
    setActiveCategory(slug);
    setPage(1);
  }

  function setRead(articleId: string) {
    const next = readIds.includes(articleId)
      ? readIds
      : [...readIds, articleId];
    setReadIds(next);
    writePreference(preferenceKeys.read, next);
  }

  const preferredNames = categories
    .filter((category) => preferredCategories.includes(category.slug))
    .map((category) => category.name);
  const visibleCategories = categories.filter(
    (category) =>
      preferredCategories.length === 0 ||
      preferredCategories.includes(category.slug),
  );
  const visibleArticles = (savedOnly ? savedArticles : articles).filter(
    (article) => {
      const matchesPreferences =
        preferredNames.length === 0 ||
        article.categories.some((category) =>
          preferredNames.includes(category),
        );
      return matchesPreferences && (!hideRead || !readIds.includes(article.id));
    },
  );

  return (
    <section id="news-feed" className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Channels / {visibleCategories.length.toString().padStart(2, "0")}
        </p>
        <nav
          className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible"
          aria-label="News categories"
        >
          <button
            className={`focus-ring shrink-0 border px-3 py-3 text-left text-xs transition lg:w-full ${!activeCategory ? "border-[var(--cyan)]/40 bg-[var(--cyan)]/10 text-[var(--cyan)]" : "border-transparent text-[var(--muted)] hover:border-[var(--line)]"}`}
            type="button"
            onClick={() => selectCategory("")}
          >
            All live signals
          </button>
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              className={`focus-ring shrink-0 border px-3 py-3 text-left text-xs transition lg:w-full ${activeCategory === category.slug ? "border-[var(--cyan)]/40 bg-[var(--cyan)]/10 text-[var(--cyan)]" : "border-transparent text-[var(--muted)] hover:border-[var(--line)]"}`}
              type="button"
              onClick={() => selectCategory(category.slug)}
            >
              {category.name}
              <span className="ml-2 font-mono text-[9px] text-[var(--muted)]">
                {category.articleCount}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <div>
        <form className="mb-5 flex gap-2" onSubmit={submitSearch} role="search">
          <label className="sr-only" htmlFor="news-search">
            Search technology news
          </label>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              id="news-search"
              className="focus-ring w-full border border-[var(--line)] bg-[var(--panel)]/50 backdrop-blur-sm pl-11 pr-4 py-3 font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] transition-colors focus:bg-[var(--panel)]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the live signal..."
            />
          </div>
          <button
            className="focus-ring border border-[var(--cyan)] bg-[var(--cyan)]/10 text-[var(--cyan)] hover:bg-[var(--cyan)] hover:text-[var(--background)] px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)]"
            type="submit"
          >
            Search
          </button>
        </form>

        <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--foreground)]">
              Latest signals
            </span>
            <span className="bg-[var(--cyan)] px-2 py-0.5 font-mono text-[9px] font-bold text-[var(--background)]">
              LIVE
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
            Newest first
          </span>
        </div>

        {error ? (
          <div
            className="flex items-start gap-4 border border-[var(--pink)]/40 bg-[var(--pink)]/5 p-6 backdrop-blur-sm"
            role="alert"
          >
            <CircleAlert className="w-5 h-5 text-[var(--pink)] shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--pink)]">
                Feed error
              </p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{error}</p>
              <button
                className="focus-ring mt-4 border border-[var(--pink)]/30 hover:border-[var(--pink)]/80 hover:bg-[var(--pink)]/10 px-4 py-2 font-mono text-[10px] uppercase text-[var(--pink)] transition-colors"
                type="button"
                onClick={() => void loadArticles(1)}
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : null}
        {loading ? <LoadingCards /> : null}
        {!loading && !error && visibleArticles.length === 0 ? (
          <div className="panel-glow flex flex-col items-center justify-center border border-dashed border-[var(--line)] bg-[var(--panel)]/40 p-16 text-center backdrop-blur-sm">
            <Inbox className="w-12 h-12 text-[var(--cyan)]/50 mb-6" />
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--cyan)]">
              No matching local records
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
              {savedOnly
                ? "No saved articles yet."
                : hideRead
                  ? "All matching articles are marked read."
                  : "The feed returned no articles."}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">
              {savedOnly
                ? "Use Save on an article to keep it in this browser."
                : "Try another preference, search, or category. Only provider-backed articles are shown."}
            </p>
          </div>
        ) : null}

        {!loading && !error && visibleArticles.length > 0 ? (
          <div className="space-y-4">
            {visibleArticles.map((article, index) => (
              <article
                key={article.id}
                className="panel-glow group grid gap-5 border border-white/5 bg-[var(--panel)]/60 backdrop-blur-md p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--cyan)]/40 hover:shadow-[0_8px_30px_rgba(0,240,255,0.1)] sm:grid-cols-[150px_1fr] lg:grid-cols-[190px_1fr]"
              >
                <div className="relative min-h-32 overflow-hidden border border-white/10 bg-gradient-to-br from-cyan-950 via-[#0b2930] to-[#14201d]">
                  {article.imageUrl ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-75"
                      style={{ backgroundImage: `url(${article.imageUrl})` }}
                      aria-label="Article image"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      No image
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 font-mono text-3xl font-bold text-white/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col justify-between gap-5">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--cyan)]">
                      <span>{article.sourceName}</span>
                      <span className="text-[var(--muted)]">
                        {formatPublishedAt(article.publishedAt)}
                      </span>
                    </div>
                    <h2 className="max-w-2xl text-xl font-semibold leading-tight text-[var(--foreground)] transition group-hover:text-[var(--cyan)] sm:text-2xl">
                      <Link
                        href={`/articles/${article.slug}`}
                        onClick={() => setRead(article.id)}
                      >
                        {article.title}
                      </Link>
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {article.categories.map((category) => (
                        <span
                          key={category}
                          className="border border-[var(--line)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--muted)]"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                      {article.summary ?? article.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                    <span>
                      {article.readTimeMinutes
                        ? `${article.readTimeMinutes} min read`
                        : "Reading time unavailable"}
                    </span>
                    <div className="flex items-center gap-3">
                      <BookmarkButton article={article} />
                      <a
                        className="flex items-center gap-1 text-[var(--cyan)] hover:text-white transition-colors"
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Original source <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {hasMore && !savedOnly && !loading && !error ? (
          <button
            className="focus-ring mt-8 flex w-full items-center justify-center gap-2 border border-white/10 bg-[var(--panel)]/40 backdrop-blur-md py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] transition-all hover:border-[var(--cyan)]/50 hover:bg-[var(--cyan)]/5 hover:text-[var(--cyan)] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]"
            type="button"
            disabled={loadingMore}
            onClick={() => void loadArticles(page + 1, true)}
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Loading more signals...
              </>
            ) : (
              "Load more signals ↓"
            )}
          </button>
        ) : null}
      </div>
    </section>
  );
}
