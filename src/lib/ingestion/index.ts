import { and, eq, gte, ne } from "drizzle-orm";

import { db } from "@/db";
import { articleCategories, articleTags, articles, categories, ingestionRuns, sources, tags } from "@/db/schema";
import { classifyArticle, titleSimilarity } from "./classify";
import type { FetchArticlesInput, NormalizedArticle, ProviderName } from "./types";
import { getProvider } from "./providers";
import { canonicalizeUrl, fingerprintArticle, slugify } from "./utils";

export async function fetchProviderArticles(providerName: ProviderName, input?: FetchArticlesInput) {
  return getProvider(providerName).fetchArticles(input);
}

export async function persistArticles(providerName: ProviderName, sourceId: string, items: NormalizedArticle[]) {
  let inserted = 0;
  let skipped = 0;
  let duplicates = 0;
  const categoryRows = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  const recentArticles = await db
    .select({ id: articles.id, title: articles.title, publishedAt: articles.publishedAt })
    .from(articles)
    .where(and(ne(articles.status, "hidden"), gte(articles.publishedAt, new Date(Date.now() - 72 * 60 * 60 * 1000))));

  for (const item of items) {
    const canonicalUrl = canonicalizeUrl(item.url);
    const semanticDuplicate = recentArticles.some(
      (existing) => Math.abs(existing.publishedAt.getTime() - item.publishedAt.getTime()) < 72 * 60 * 60 * 1000 && titleSimilarity(existing.title, item.title) >= 0.82,
    );
    if (semanticDuplicate) {
      skipped += 1;
      duplicates += 1;
      continue;
    }

    const fingerprint = fingerprintArticle(item.title, canonicalUrl);
    const slug = `${slugify(item.title) || "article"}-${fingerprint.slice(0, 10)}`;

    const [created] = await db
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
      .onConflictDoNothing({ target: articles.canonicalUrl })
      .returning({ id: articles.id });

    if (!created) {
      skipped += 1;
      continue;
    }

    const classification = classifyArticle(item.title, item.description, item.contentExcerpt);
    const matchedCategories = categoryRows.filter((category) => classification.categorySlugs.includes(category.slug));
    if (matchedCategories.length > 0) {
      await db.insert(articleCategories).values(matchedCategories.map((category) => ({ articleId: created.id, categoryId: category.id }))).onConflictDoNothing();
    }

    for (const tagSlug of classification.tags) {
      const tagName = tagSlug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
      await db.insert(tags).values({ name: tagName, slug: tagSlug }).onConflictDoNothing({ target: tags.slug });
      const [tag] = await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, tagSlug)).limit(1);
      if (tag) await db.insert(articleTags).values({ articleId: created.id, tagId: tag.id, confidence: 0.75 }).onConflictDoNothing();
    }

    recentArticles.push({ id: created.id, title: item.title, publishedAt: item.publishedAt });
    inserted += 1;
  }

  return { inserted, skipped, duplicates };
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
        thenewsapi: "the-news-api",
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
        articlesDuplicated: result.duplicates,
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
