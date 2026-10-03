import { ThemeToggle } from "@/components/theme-toggle";
import { NewsFeed } from "@/components/news-feed";
import { SavedArticlesButton } from "@/components/saved-articles-button";

export const dynamic = "force-dynamic";

function SignalMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center border border-[var(--cyan)] text-[var(--cyan)] shadow-[0_0_18px_rgba(69,244,209,0.25)]">
      <span className="h-2 w-2 rotate-45 bg-[var(--cyan)]" />
    </span>
  );
}

export default function Home() {
  return (
    <div className="signal-grid relative min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="scanlines absolute inset-0 z-0 opacity-50" />
      <header className="relative z-10 border-b border-[var(--line)] bg-[var(--background)]/70 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <SignalMark />
            <div>
              <p className="font-mono text-sm font-bold tracking-[0.2em] text-[var(--foreground)]">
                BYTEBRIEF
              </p>
              <p className="font-mono text-[9px] tracking-[0.16em] text-[var(--muted)]">
                TECH INTELLIGENCE / LIVE
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] md:flex">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--cyan)]" />
              Database feed
            </span>
            <span>Real sources only</span>
          </div>
          <div className="flex items-center gap-2">
            <SavedArticlesButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-[1500px] px-5 py-8 lg:px-8 lg:py-12">
        <section className="mb-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-[var(--cyan)]">
              {"// curated intelligence feed"}
            </p>
            <h1 className="text-glow max-w-4xl text-4xl font-bold leading-[0.98] tracking-[-0.05em] text-transparent bg-clip-text bg-gradient-to-br from-[var(--foreground)] to-[var(--muted)] sm:text-6xl lg:text-7xl">
              The signal beneath
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[var(--cyan)] to-[var(--cyan)]/50">the noise.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Real technology news collected from configured sources and stored
              locally for a focused reading experience.
            </p>
          </div>

        </section>
        <NewsFeed />
      </main>
    </div>
  );
}
