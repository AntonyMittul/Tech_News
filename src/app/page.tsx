const categories = [
  { label: "All signals", count: "128", active: true },
  { label: "Artificial intelligence", count: "42" },
  { label: "Software engineering", count: "28" },
  { label: "Startups & funding", count: "19" },
  { label: "Corporate tech", count: "16" },
  { label: "Hiring & layoffs", count: "14" },
  { label: "Cybersecurity", count: "09" },
];

const stories = [
  {
    category: "ARTIFICIAL INTELLIGENCE",
    accent: "cyan",
    time: "12 min ago",
    title: "The next wave of AI infrastructure is being built for smaller, smarter models",
    summary:
      "A shift toward efficient models is changing how teams think about inference, deployment, and the economics of building with AI.",
    source: "Signal Research Desk",
    readTime: "6 min read",
  },
  {
    category: "SOFTWARE ENGINEERING",
    accent: "pink",
    time: "38 min ago",
    title: "Why platform engineering is becoming the new default for growing teams",
    summary:
      "Internal developer platforms are moving from an experiment to a core part of how engineering organizations ship reliably.",
    source: "Engineering Weekly",
    readTime: "4 min read",
  },
  {
    category: "HIRING & LAYOFFS",
    accent: "amber",
    time: "1 hr ago",
    title: "The tech job market is splitting into specialist and systems-builder roles",
    summary:
      "Hiring signals show continued demand for people who can connect software, data, and business outcomes across the stack.",
    source: "Workforce Monitor",
    readTime: "5 min read",
  },
];

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
      <header className="relative z-10 border-b border-[var(--line)] bg-[#080a0f]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <SignalMark />
            <div>
              <p className="font-mono text-sm font-bold tracking-[0.2em] text-white">SIGNAL</p>
              <p className="font-mono text-[9px] tracking-[0.16em] text-[var(--muted)]">TECH INTELLIGENCE / 01</p>
            </div>
          </div>
          <div className="hidden items-center gap-5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] md:flex">
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--cyan)]" />Live ingestion</span>
            <span>30 Sep 2026</span>
          </div>
          <button className="focus-ring border border-[var(--line)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]" type="button">
            [ connect ]
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1500px] px-5 py-8 lg:px-8 lg:py-12">
        <section className="mb-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-[var(--cyan)]">{"// curated intelligence feed"}</p>
            <h1 className="text-glow max-w-4xl text-4xl font-bold leading-[0.98] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              The signal beneath<br /><span className="text-[var(--cyan)]">the noise.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              One focused stream for the people building, studying, and shaping technology.
              AI, code, companies, careers, and the ideas moving the industry forward.
            </p>
          </div>
          <div className="w-full max-w-sm border border-[var(--line)] bg-[var(--panel)] p-4 panel-glow">
            <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
              <span>System status</span><span className="text-[var(--cyan)]">Nominal</span>
            </div>
            <div className="h-1 bg-[#1a2730]"><div className="h-full w-[78%] bg-[var(--cyan)] shadow-[0_0_12px_var(--cyan)]" /></div>
            <div className="mt-3 flex justify-between font-mono text-[10px] text-[var(--muted)]"><span>Sources monitored</span><span className="text-white">086</span></div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr] xl:grid-cols-[250px_1fr_250px]">
          <aside className="hidden lg:block">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Channels / 07</p>
            <nav className="space-y-1">
              {categories.map((category) => (
                <button key={category.label} className={`focus-ring flex w-full items-center justify-between border px-3 py-3 text-left text-xs transition ${category.active ? "border-[var(--cyan)]/40 bg-[var(--cyan)]/10 text-[var(--cyan)]" : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--panel)] hover:text-white"}`} type="button">
                  <span>{category.label}</span><span className="font-mono text-[10px] opacity-60">{category.count}</span>
                </button>
              ))}
            </nav>
          </aside>

          <section>
            <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-3"><span className="font-mono text-xs uppercase tracking-[0.18em] text-white">Latest signals</span><span className="bg-[var(--cyan)] px-2 py-0.5 font-mono text-[9px] font-bold text-[#07100f]">LIVE</span></div>
              <button className="focus-ring font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] transition hover:text-[var(--cyan)]" type="button">Sort: newest ↓</button>
            </div>
            <div className="space-y-4">
              {stories.map((story, index) => (
                <article key={story.title} className="panel-glow group grid gap-5 border border-[var(--line)] bg-[var(--panel)] p-5 transition hover:border-[var(--cyan)]/50 sm:grid-cols-[150px_1fr] lg:grid-cols-[190px_1fr]">
                  <div className={`relative min-h-32 overflow-hidden border border-white/10 bg-gradient-to-br ${story.accent === "cyan" ? "from-cyan-950 via-[#0b2930] to-[#14201d]" : story.accent === "pink" ? "from-fuchsia-950 via-[#271326] to-[#15121e]" : "from-amber-950 via-[#302516] to-[#191817]"}`}>
                    <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,.2) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
                    <span className="absolute bottom-3 left-3 font-mono text-3xl font-bold text-white/20">0{index + 1}</span>
                    <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-white/60 shadow-[0_0_12px_white]" />
                  </div>
                  <div className="flex flex-col justify-between gap-5">
                    <div><div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--cyan)]"><span>{story.category}</span><span className="text-[var(--muted)]">{story.time}</span></div><h2 className="max-w-2xl text-xl font-semibold leading-tight text-white transition group-hover:text-[var(--cyan)] sm:text-2xl">{story.title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{story.summary}</p></div>
                    <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]"><span>{story.source}</span><span>{story.readTime} <span className="ml-2 text-[var(--cyan)]">↗</span></span></div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="hidden xl:block">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Briefing / 03</p>
            <div className="space-y-3">
              {[
                ["01", "AI agents are moving from demos to dependable workflows"],
                ["02", "Open source infrastructure is quietly getting easier to run"],
                ["03", "Security teams are preparing for post-quantum migration"],
              ].map(([number, title]) => <div key={number} className="border-l border-[var(--pink)]/60 bg-[var(--panel)] p-4"><span className="font-mono text-[10px] text-[var(--pink)]">{number}</span><p className="mt-3 text-sm leading-5 text-white/80">{title}</p></div>)}
            </div>
            <div className="mt-8 border border-[var(--line)] p-4"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Your feed</p><p className="mt-3 text-sm leading-6 text-white/80">Connect to tune the signal to your interests and save stories for later.</p><button className="focus-ring mt-4 w-full border border-[var(--pink)]/60 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--pink)] transition hover:bg-[var(--pink)]/10" type="button">Initialize profile</button></div>
          </aside>
        </div>
      </main>
    </div>
  );
}
