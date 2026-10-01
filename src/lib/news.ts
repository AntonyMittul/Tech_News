import { and, count, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";

import { db } from "@/db";
import { articleCategories, articleSummaries, articleTags, articles, categories, sources, tags } from "@/db/schema";

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
      readTimeMinutes: articles.readTimeMinutes,
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

  const visibleRows = rows.slice(0, limit);
  const categoryRows = visibleRows.length
    ? await db
        .select({ articleId: articleCategories.articleId, name: categories.name })
        .from(articleCategories)
        .innerJoin(categories, eq(articleCategories.categoryId, categories.id))
        .where(inArray(articleCategories.articleId, visibleRows.map((article) => article.id)))
    : [];
  const categoryMap = new Map<string, string[]>();
  for (const category of categoryRows) {
    const names = categoryMap.get(category.articleId) ?? [];
    names.push(category.name);
    categoryMap.set(category.articleId, names);
  }

  return {
    articles: visibleRows.map((article) => ({ ...article, categories: categoryMap.get(article.id) ?? [] })),
    page,
    limit,
    hasMore: rows.length > limit,
  };
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
      readTimeMinutes: articles.readTimeMinutes,
      summary: articleSummaries.summary,
      keyPoints: articleSummaries.keyPoints,
      whyItMatters: articleSummaries.whyItMatters,
    })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .leftJoin(articleSummaries, eq(articleSummaries.articleId, articles.id))
    .where(and(eq(articles.slug, slug), ne(articles.status, "hidden")))
    .limit(1);

  if (!article) return undefined;

  const [categoryRows, tagRows] = await Promise.all([
    db
      .select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(articleCategories)
      .innerJoin(categories, eq(articleCategories.categoryId, categories.id))
      .where(eq(articleCategories.articleId, article.id)),
    db
      .select({ name: tags.name, slug: tags.slug })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, article.id)),
  ]);

  const relatedCategoryIds = categoryRows.map((category) => category.id);
  const relatedIds = relatedCategoryIds.length
    ? await db
        .select({ articleId: articleCategories.articleId })
        .from(articleCategories)
        .where(and(inArray(articleCategories.categoryId, relatedCategoryIds), ne(articleCategories.articleId, article.id)))
    : [];
  const related = relatedIds.length
    ? await db
        .select({
          id: articles.id,
          slug: articles.slug,
          title: articles.title,
          sourceName: sources.name,
          publishedAt: articles.publishedAt,
        })
        .from(articles)
        .innerJoin(sources, eq(articles.sourceId, sources.id))
        .where(and(inArray(articles.id, relatedIds.map((row) => row.articleId)), ne(articles.status, "hidden")))
        .orderBy(desc(articles.publishedAt))
        .limit(4)
    : [];

  return { ...article, categories: categoryRows, tags: tagRows, related };
}

export async function getCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      sortOrder: categories.sortOrder,
      slug: categories.slug,
      articleCount: count(articles.id),
    })
    .from(categories)
    .leftJoin(articleCategories, eq(articleCategories.categoryId, categories.id))
    .leftJoin(articles, and(eq(articleCategories.articleId, articles.id), ne(articles.status, "hidden")))
    .groupBy(categories.id)
    .orderBy(categories.sortOrder);
}
