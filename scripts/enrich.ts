import { config } from "dotenv";
import { and, eq, isNull, ne } from "drizzle-orm";

import { db, pool } from "../src/db";
import { articleSummaries, articles, sources } from "../src/db/schema";
import { enrichArticle } from "../src/lib/ai/gemini";

config({ path: ".env.local" });
config();

async function enrichPendingArticles() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured. Add a real key to .env.local before running npm run enrich.");
  }

  const limit = Math.min(Math.max(Number(process.env.ENRICHMENT_LIMIT ?? "5"), 1), 20);
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

  if (pendingArticles.length === 0) {
    console.log("No articles are waiting for Gemini enrichment.");
    return;
  }

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
      console.log(`Enriched: ${article.title}`);
    } catch (error) {
      failed += 1;
      console.error(`Failed: ${article.title}`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`Enrichment complete: ${completed} completed, ${failed} failed.`);
}

enrichPendingArticles()
  .catch((error) => {
    console.error("Enrichment failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
