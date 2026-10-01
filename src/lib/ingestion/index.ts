import { eq } from "drizzle-orm";

import { db } from "@/db";
import { articles, ingestionRuns, sources } from "@/db/schema";
import type { FetchArticlesInput, NormalizedArticle, ProviderName } from "./types";
import { getProvider } from "./providers";
import { canonicalizeUrl, fingerprintArticle, slugify } from "./utils";

export async function fetchProviderArticles(providerName: ProviderName, input?: FetchArticlesInput) {
  return getProvider(providerName).fetchArticles(input);
}

export async function persistArticles(providerName: ProviderName, sourceId: string, items: NormalizedArticle[]) {
  let inserted = 0;
  let skipped = 0;

  for (const item of items) {
    const canonicalUrl = canonicalizeUrl(item.url);
    const fingerprint = fingerprintArticle(item.title, canonicalUrl);
    const slug = `${slugify(item.title) || "article"}-${fingerprint.slice(0, 10)}`;

    const result = await db
      .insert(articles)
      .values({
        sourceId,
        title: item.title,
        slug,
        canonicalUrl,
        author: item.author,
        publishedAt: item.publishedAt,
        imageUrl: item.imageUrl,
        description: item.description,
        contentExcerpt: item.contentExcerpt,
        language: item.language ?? "en",
        fingerprint,
        readTimeMinutes: estimateReadTime(item.contentExcerpt ?? item.description),
        status: "pending",
      })
      .onConflictDoNothing({ target: articles.canonicalUrl });

    if (result.rowCount === 1) inserted += 1;
    else skipped += 1;
  }

  return { inserted, skipped };
}

export async function runIngestion(providerName: ProviderName, input: FetchArticlesInput = {}) {
  const provider = getProvider(providerName);
  const sourceSlug = input.sourceName
    ? slugify(input.sourceName)
    : ({
        "hacker-news": "hacker-news",
        guardian: "the-guardian",
        gnews: "gnews",
        rss: "technology-rss",
      } satisfies Record<ProviderName, string>)[providerName];
  const source = await db.query.sources.findFirst({ where: eq(sources.slug, sourceSlug) });
  if (!source) {
    throw new Error(`No source found for slug "${sourceSlug}". Run npm run db:seed first.`);
  }

  const [run] = await db
    .insert(ingestionRuns)
    .values({ provider: providerName, sourceId: source.id, status: "running" })
    .returning({ id: ingestionRuns.id });

  try {
    const items = await provider.fetchArticles(input);
    const result = await persistArticles(providerName, source.id, items);
    await db
      .update(ingestionRuns)
      .set({
        status: "completed",
        articlesFetched: items.length,
        articlesInserted: result.inserted,
        articlesSkipped: result.skipped,
        completedAt: new Date(),
      })
      .where(eq(ingestionRuns.id, run.id));

    return { provider: providerName, fetched: items.length, ...result };
  } catch (error) {
    await db
      .update(ingestionRuns)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown ingestion error",
        completedAt: new Date(),
      })
      .where(eq(ingestionRuns.id, run.id));
    throw error;
  }
}

function estimateReadTime(text?: string) {
  if (!text) return null;
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 220));
}
