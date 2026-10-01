import { and, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";

import { db } from "@/db";
import { articleCategories, articleSummaries, articles, categories, sources } from "@/db/schema";

export type ArticleQuery = {
  page?: number;
  limit?: number;
  query?: string;
  category?: string;
  source?: string;
};

export async function getArticles(input: ArticleQuery = {}) {
  const page = Math.max(input.page ?? 1, 1);
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
  const filters = [ne(articles.status, "hidden")];

  if (input.query) {
    filters.push(or(ilike(articles.title, `%${input.query}%`), ilike(articles.description, `%${input.query}%`))!);
  }
  if (input.source) filters.push(eq(sources.slug, input.source));
  if (input.category) {
    filters.push(inArray(articles.id, db.select({ articleId: articleCategories.articleId }).from(articleCategories).innerJoin(categories, eq(articleCategories.categoryId, categories.id)).where(eq(categories.slug, input.category))));
  }

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      url: articles.canonicalUrl,
      sourceName: sources.name,
      sourceSlug: sources.slug,
      publishedAt: articles.publishedAt,
      imageUrl: articles.imageUrl,
      description: articles.description,
      summary: articleSummaries.summary,
      status: articles.status,
    })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .leftJoin(articleSummaries, eq(articleSummaries.articleId, articles.id))
    .where(and(...filters))
    .orderBy(desc(articles.publishedAt))
    .limit(limit + 1)
    .offset((page - 1) * limit);

  return { articles: rows.slice(0, limit), page, limit, hasMore: rows.length > limit };
}

export async function getLatestArticles(limit = 20) {
  return db
    .select({
      id: articles.id,
      title: articles.title,
      url: articles.canonicalUrl,
      sourceName: sources.name,
      sourceUrl: sources.baseUrl,
      publishedAt: articles.publishedAt,
      author: articles.author,
      imageUrl: articles.imageUrl,
      description: articles.description,
      summary: articleSummaries.summary,
      keyPoints: articleSummaries.keyPoints,
      whyItMatters: articleSummaries.whyItMatters,
      status: articles.status,
    })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .leftJoin(articleSummaries, eq(articleSummaries.articleId, articles.id))
    .where(ne(articles.status, "hidden"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function getArticleBySlug(slug: string) {
  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      url: articles.canonicalUrl,
      sourceName: sources.name,
      sourceUrl: sources.baseUrl,
      publishedAt: articles.publishedAt,
      author: articles.author,
      imageUrl: articles.imageUrl,
      description: articles.description,
      summary: articleSummaries.summary,
      keyPoints: articleSummaries.keyPoints,
      whyItMatters: articleSummaries.whyItMatters,
    })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .leftJoin(articleSummaries, eq(articleSummaries.articleId, articles.id))
    .where(and(eq(articles.slug, slug), ne(articles.status, "hidden")))
    .limit(1);

  return article;
}

export async function getCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .orderBy(categories.sortOrder);
}
