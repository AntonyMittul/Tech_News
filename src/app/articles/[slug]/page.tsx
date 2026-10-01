import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { BookmarkButton, MarkArticleRead } from "@/components/bookmark-button";
import { getArticleBySlug } from "@/lib/news";

export const dynamic = "force-dynamic";

function SignalMark() {
  return <span className="flex h-8 w-8 items-center justify-center border border-[var(--cyan)] text-[var(--cyan)] shadow-[0_0_18px_rgba(69,244,209,0.25)]"><span className="h-2 w-2 rotate-45 bg-[var(--cyan)]" /></span>;
}

function formatPublishedAt(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function formatTextBlocks(value: string) {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return [];
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);
  const blocks: string[] = [];
  for (let index = 0; index < sentences.length; index += 3) blocks.push(sentences.slice(index, index + 3).join(" "));
  return blocks;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  return article ? { title: article.title, description: article.summary ?? article.description ?? "Technology news article" } : { title: "Article not found" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const summaryText = [article.summary, article.description, article.contentExcerpt].find((value) => Boolean(value?.trim())) ?? "The source did not provide a summary. Read the original article for the complete report.";
  const summaryBlocks = formatTextBlocks(summaryText);

  const bookmarkArticle = { id: article.id, slug: article.slug, title: article.title, url: article.url, sourceName: article.sourceName, publishedAt: article.publishedAt.toISOString(), imageUrl: article.imageUrl, description: article.description ?? null, summary: article.summary ?? null, readTimeMinutes: article.readTimeMinutes, categories: article.categories.map((category) => category.name) };
  return <div className="signal-grid relative min-h-screen overflow-hidden bg-[var(--background)]"><MarkArticleRead articleId={article.id} /><div className="scanlines absolute inset-0 z-0 opacity-50" /><header className="relative z-10 border-b border-[var(--line)] bg-[var(--background)]/90 backdrop-blur-md"><div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 py-4 lg:px-8"><Link className="flex items-center gap-3" href="/"><SignalMark /><div><p className="font-mono text-sm font-bold tracking-[0.2em] text-[var(--foreground)]">SIGNAL</p><p className="font-mono text-[9px] tracking-[0.16em] text-[var(--muted)]">TECH INTELLIGENCE / ARTICLE</p></div></Link><div className="flex items-center gap-2"><ThemeToggle /><Link className="focus-ring border border-[var(--line)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]" href="/">[ back to feed ]</Link></div></div></header><main className="relative z-10 mx-auto max-w-[1200px] px-5 py-8 lg:px-8 lg:py-14"><Link className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--cyan)]" href="/">← All live signals</Link><article className="mt-8"><div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start"><div><div className="mb-5 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--cyan)]"><span>{article.sourceName}</span><span className="text-[var(--muted)]">{formatPublishedAt(article.publishedAt)}</span>{article.readTimeMinutes ? <span className="text-[var(--muted)]">{article.readTimeMinutes} min read</span> : null}</div><h1 className="max-w-4xl text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-[var(--foreground)] sm:text-6xl">{article.title}</h1><div className="mt-6 flex flex-wrap items-center gap-2">{article.categories.map((category) => <span key={category.id} className="border border-[var(--cyan)]/40 bg-[var(--cyan)]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--cyan)]">{category.name}</span>)}{article.tags.map((tag) => <span key={tag.slug} className="border border-[var(--line)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">#{tag.name}</span>)}<BookmarkButton article={bookmarkArticle} /></div></div>{article.imageUrl ? <div className="min-h-52 border border-[var(--line)] bg-cover bg-center panel-glow" style={{ backgroundImage: `url(${article.imageUrl})` }} aria-label="Article image" /> : <div className="flex min-h-52 items-center justify-center border border-[var(--line)] bg-[var(--panel)] font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">No image available</div>}</div><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]"><div className="space-y-8"><section className="border border-[var(--line)] bg-[var(--panel)] p-6 panel-glow"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--cyan)]">Summary</p><div className="mt-4 space-y-4 text-base leading-8 text-[var(--foreground)]">{summaryBlocks.map((block) => <p key={block}>{block}</p>)}</div></section>{article.keyPoints?.length ? <section className="border border-[var(--line)] bg-[var(--panel)] p-6"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--cyan)]">Key points</p><ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">{article.keyPoints.map((point) => <li key={point} className="flex gap-3"><span className="mt-3 h-1.5 w-1.5 shrink-0 bg-[var(--cyan)]" />{point}</li>)}</ul></section> : null}{article.whyItMatters ? <section className="border border-[var(--line)] bg-[var(--panel)] p-6"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--cyan)]">Why it matters</p><p className="mt-4 text-sm leading-7 text-[var(--muted)]">{article.whyItMatters}</p></section> : null}<a className="focus-ring inline-flex border border-[var(--cyan)] bg-[var(--cyan)] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--background)] transition hover:brightness-110" href={article.url} target="_blank" rel="noreferrer">Read original article ↗</a></div><aside className="space-y-5"><section className="border border-[var(--line)] bg-[var(--panel)] p-5"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--cyan)]">Source</p><p className="mt-4 font-semibold text-[var(--foreground)]">{article.sourceName}</p><p className="mt-2 break-all text-xs leading-6 text-[var(--muted)]">{article.sourceUrl}</p></section>{article.related.length ? <section className="border border-[var(--line)] bg-[var(--panel)] p-5"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--cyan)]">Related articles</p><div className="mt-4 space-y-4">{article.related.map((related) => <Link key={related.id} className="block border-t border-[var(--line)] pt-4 first:border-t-0 first:pt-0" href={`/articles/${related.slug}`}><span className="text-sm font-semibold leading-6 text-[var(--foreground)] transition hover:text-[var(--cyan)]">{related.title}</span><span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">{related.sourceName}</span></Link>)}</div></section> : null}</aside></div></article></main></div>;
}
