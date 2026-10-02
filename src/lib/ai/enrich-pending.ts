import { eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { articleSummaries, articles, sources } from "@/db/schema";
import { isCompleteSummary } from "@/lib/content-quality";
import { enrichArticle } from "./gemini";

export async function enrichPendingArticles(requestedLimit = 5) {
  if (!process.env.GEMINI_API_KEY) return { completed: 0, failed: 0, skipped: true };

  const limit = Math.min(Math.max(requestedLimit, 1), 20);
  const pendingArticles = await db
    .select({
      id: articles.id,
      title: articles.title,
      publishedAt: articles.publishedAt,
      description: articles.description,
      contentExcerpt: articles.contentExcerpt,
      sourceName: sources.name,
      summaryId: articleSummaries.id,
      existingSummary: articleSummaries.summary,
    })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .leftJoin(articleSummaries, eq(articleSummaries.articleId, articles.id))
    .where(ne(articles.status, "hidden"))
    .orderBy(articles.publishedAt)
    .limit(100);

  const candidates = pendingArticles.filter((article) => !isCompleteSummary(article.existingSummary)).slice(0, limit);

  let completed = 0;
  let failed = 0;
  for (const article of candidates) {
    try {
      const enrichment = await enrichArticle(article);
      const values = {
        articleId: article.id,
        provider: "gemini",
        model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
        summary: enrichment.summary,
        keyPoints: enrichment.keyPoints,
        whyItMatters: enrichment.whyItMatters,
        status: "completed" as const,
        promptVersion: "v1",
      };
      if (article.summaryId) {
        await db.update(articleSummaries).set(values).where(eq(articleSummaries.id, article.summaryId));
      } else {
        await db.insert(articleSummaries).values(values);
      }
      completed += 1;
    } catch (error) {
      failed += 1;
      console.error(`Enrichment failed for ${article.title}:`, error instanceof Error ? error.message : error);
    }
  }

  return { completed, failed, skipped: false, pending: candidates.length };
}
