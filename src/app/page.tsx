import { getCategories, getLatestArticles } from "@/lib/news";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

const accentClasses = [
  "from-cyan-950 via-[#0b2930] to-[#14201d]",
  "from-fuchsia-950 via-[#271326] to-[#15121e]",
  "from-amber-950 via-[#302516] to-[#191817]",
];

function SignalMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center border border-[var(--cyan)] text-[var(--cyan)] shadow-[0_0_18px_rgba(69,244,209,0.25)]">
      <span className="h-2 w-2 rotate-45 bg-[var(--cyan)]" />
    </span>
  );
}

function formatPublishedAt(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function Home() {
  const [articles, categories] = await Promise.all([getLatestArticles(), getCategories()]);

  return (
    <div className="signal-grid relative min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="scanlines absolute inset-0 z-0 opacity-50" />
      <header className="relative z-10 border-b border-[var(--line)] bg-[var(--background)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <SignalMark />
            <div>
              <p className="font-mono text-sm font-bold tracking-[0.2em] text-[var(--foreground)]">SIGNAL</p>
              <p className="font-mono text-[9px] tracking-[0.16em] text-[var(--muted)]">TECH INTELLIGENCE / LIVE</p>
            </div>
          </div>
          <div className="hidden items-center gap-5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] md:flex">
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--cyan)]" />Database feed</span>
            <span>Real sources only</span>
          </div>
          <div className="flex items-center gap-2"><ThemeToggle /><a className="focus-ring hidden border border-[var(--line)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] transition hover:border-[var(--cyan)] hover:text-[var(--cyan)] sm:block" href="https://github.com/AntonyMittul/Tech_News" target="_blank" rel="noreferrer">[ source ]</a></div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1500px] px-5 py-8 lg:px-8 lg:py-12">
        <section className="mb-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-[var(--cyan)]">{"// curated intelligence feed"}</p>
            <h1 className="text-glow max-w-4xl text-4xl font-bold leading-[0.98] tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              The signal beneath<br /><span className="text-[var(--cyan)]">the noise.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Real technology news collected from configured sources and stored locally for a focused reading experience.
            </p>
          </div>
          <div className="w-full max-w-sm border border-[var(--line)] bg-[var(--panel)] p-4 panel-glow">
            <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
              <span>Live records</span><span className="text-[var(--cyan)]">{articles.length.toString().padStart(2, "0")}</span>
            </div>
            <div className="h-1 bg-[#1a2730]"><div className="h-full w-full bg-[var(--cyan)] shadow-[0_0_12px_var(--cyan)]" /></div>
            <div className="mt-3 flex justify-between font-mono text-[10px] text-[var(--muted)]"><span>Feed integrity</span><span className="text-[var(--foreground)]">Source-linked</span></div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Channels / {categories.length.toString().padStart(2, "0")}</p>
            <nav className="space-y-1">
              <div className="border border-[var(--cyan)]/40 bg-[var(--cyan)]/10 px-3 py-3 text-xs text-[var(--cyan)]">All live signals</div>
              {categories.map((category) => <div key={category.id} className="border border-transparent px-3 py-3 text-xs text-[var(--muted)]">{category.name}</div>)}
            </nav>
          </aside>

          <section>
            <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-3"><span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--foreground)]">Latest signals</span><span className="bg-[var(--cyan)] px-2 py-0.5 font-mono text-[9px] font-bold text-[var(--background)]">LIVE</span></div>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">Newest first</span>
            </div>

            {articles.length === 0 ? (
              <div className="panel-glow border border-dashed border-[var(--line)] bg-[var(--panel)] p-10 text-center">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--cyan)]">No live records</p>
                <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">The feed is waiting for real news.</h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">Run an ingestion provider to populate this dashboard. No placeholder articles are shown.</p>
                <code className="mt-6 inline-block border border-[var(--line)] bg-[var(--background)] px-4 py-3 font-mono text-xs text-[var(--cyan)]">npm run ingest -- hacker-news</code>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article, index) => (
                  <article key={article.id} className="panel-glow group grid gap-5 border border-[var(--line)] bg-[var(--panel)] p-5 transition hover:border-[var(--cyan)]/50 sm:grid-cols-[150px_1fr] lg:grid-cols-[190px_1fr]">
                    <div className={`relative min-h-32 overflow-hidden border border-white/10 bg-gradient-to-br ${accentClasses[index % accentClasses.length]}`}>
                      {article.imageUrl ? <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${article.imageUrl})` }} /> : null}
                      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,.2) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
                      <span className="absolute bottom-3 left-3 font-mono text-3xl font-bold text-[var(--foreground)]/20">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="flex flex-col justify-between gap-5">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--cyan)]"><span>{article.sourceName}</span><span className="text-[var(--muted)]">{formatPublishedAt(article.publishedAt)}</span></div>
                        <h2 className="max-w-2xl text-xl font-semibold leading-tight text-[var(--foreground)] transition group-hover:text-[var(--cyan)] sm:text-2xl"><a href={article.url} target="_blank" rel="noreferrer">{article.title}</a></h2>
                        {article.summary || article.description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{article.summary ?? article.description}</p> : null}
                      </div>
                      <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]"><span>{article.summary ? "Gemini enriched" : "Source excerpt"}</span><a className="text-[var(--cyan)]" href={article.url} target="_blank" rel="noreferrer">Original source ↗</a></div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
