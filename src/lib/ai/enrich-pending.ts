import { and, eq, isNull, ne } from "drizzle-orm";

import { db } from "@/db";
import { articleSummaries, articles, sources } from "@/db/schema";
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
    })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .leftJoin(articleSummaries, eq(articleSummaries.articleId, articles.id))
    .where(and(ne(articles.status, "hidden"), isNull(articleSummaries.id)))
    .orderBy(articles.publishedAt)
    .limit(limit);

  let completed = 0;
  let failed = 0;
  for (const article of pendingArticles) {
    try {
      const enrichment = await enrichArticle(article);
      await db.insert(articleSummaries).values({
        articleId: article.id,
        provider: "gemini",
        model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
        summary: enrichment.summary,
        keyPoints: enrichment.keyPoints,
        whyItMatters: enrichment.whyItMatters,
        status: "completed",
        promptVersion: "v1",
      });
      completed += 1;
    } catch {
      failed += 1;
    }
  }

  return { completed, failed, skipped: false, pending: pendingArticles.length };
}
