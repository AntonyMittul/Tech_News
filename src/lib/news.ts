import { and, count, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { articleCategories, articleSummaries, articleTags, articles, categories, sources, tags } from "@/db/schema";
import { decodeHtmlEntities } from "./ingestion/utils";
import { isUsefulHeadline, pickCompleteSummary } from "./content-quality";

function readableArticleFilter() {
  return sql`(
    ${articles.title} NOT ILIKE '%best %'
    AND ${articles.title} NOT ILIKE '%top %'
    AND ${articles.title} NOT ILIKE '%deals%'
    AND ${articles.title} NOT ILIKE '%sale%'
    AND ${articles.title} NOT ILIKE '%buying guide%'
    AND ${articles.title} NOT ILIKE '%gift guide%'
    AND ${articles.title} NOT ILIKE '%podcast%'
    AND ${articles.title} NOT ILIKE '%review%'
    AND ${articles.title} NOT ILIKE '%sponsored%'
    AND ${articles.title} NOT ILIKE '%discount%'
    AND (
      ${articles.title} ILIKE '%openai%'
      OR ${articles.title} ILIKE '%anthropic%'
      OR ${articles.title} ILIKE '%deepmind%'
      OR ${articles.title} ILIKE '%microsoft%'
      OR ${articles.title} ILIKE '%nvidia%'
      OR ${articles.title} ILIKE '%github%'
      OR ${articles.title} ILIKE '%linux%'
      OR ${articles.title} ILIKE '%gpt%'
      OR ${articles.title} ILIKE '%gemini%'
      OR ${articles.title} ILIKE '%claude%'
      OR ${articles.title} ILIKE '%llm%'
      OR ${articles.title} ILIKE '% AI %'
      OR ${articles.title} ILIKE 'AI%'
      OR ${articles.title} ILIKE '% AI'
      OR ${articles.title} ILIKE '%artificial intelligence%'
      OR ${articles.title} ILIKE '%model%'
      OR ${articles.title} ILIKE '%research%'
      OR ${articles.title} ILIKE '%benchmark%'
      OR ${articles.title} ILIKE '%open source%'
      OR ${articles.title} ILIKE '%programming%'
      OR ${articles.title} ILIKE '%database%'
      OR ${articles.title} ILIKE '%cloud%'
      OR ${articles.title} ILIKE '%semiconductor%'
      OR ${articles.title} ILIKE '%cve%'
      OR ${articles.title} ILIKE '%vulnerability%'
      OR ${articles.title} ILIKE '%cybersecurity%'
      OR ${articles.title} ILIKE '%hiring%'
      OR ${articles.title} ILIKE '%layoff%'
      OR ${articles.title} ILIKE '%recruit%'
      OR ${articles.title} ILIKE '%workforce%'
      OR ${articles.title} ILIKE '%data scientist%'
      OR ${articles.title} ILIKE '%analytics%'
      OR ${articles.title} ILIKE '%funding%'
      OR ${articles.title} ILIKE '%acquisition%'
      OR ${articles.title} ILIKE '%earnings%'
      OR ${articles.title} ILIKE '%regulation%'
    )
    AND (
      (${articles.title} NOT ILIKE '%hiring%' AND ${articles.title} NOT ILIKE '%jobs%' AND ${articles.title} NOT ILIKE '%layoff%' AND ${articles.title} NOT ILIKE '%workforce%')
      OR ${articles.title} ILIKE '%technology%'
      OR ${articles.title} ILIKE '%software%'
      OR ${articles.title} ILIKE '%developer%'
      OR ${articles.title} ILIKE '%engineer%'
      OR ${articles.title} ILIKE '%data%'
      OR ${articles.title} ILIKE '%cloud%'
      OR ${articles.title} ILIKE '%cyber%'
      OR ${articles.title} ILIKE '% AI %'
      OR ${articles.title} ILIKE 'AI%'
      OR ${articles.title} ILIKE '% AI'
      OR ${articles.title} ILIKE '%robotics%'
      OR ${articles.title} ILIKE '%startup%'
    )
    AND
    (${articleSummaries.summary} IS NOT NULL AND length(trim(${articleSummaries.summary})) >= 100 AND ${articleSummaries.summary} NOT LIKE '%...%' AND ${articleSummaries.summary} NOT LIKE '%…%')
    OR (${articles.description} IS NOT NULL AND length(trim(${articles.description})) >= 100 AND ${articles.description} NOT LIKE '%...%' AND ${articles.description} NOT LIKE '%…%')
    OR (${articles.contentExcerpt} IS NOT NULL AND length(trim(${articles.contentExcerpt})) >= 100 AND ${articles.contentExcerpt} NOT LIKE '%...%' AND ${articles.contentExcerpt} NOT LIKE '%…%')
  )`;
}

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
  const filters = [ne(articles.status, "hidden"), readableArticleFilter()];

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
      contentExcerpt: articles.contentExcerpt,
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

  const visibleRows = rows.filter((article) => isUsefulHeadline(article.title)).slice(0, limit);
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
    articles: visibleRows.map((article) => {
      const description = decodeHtmlEntities(article.description);
      const contentExcerpt = decodeHtmlEntities(article.contentExcerpt);
      return {
        id: article.id,
        title: decodeHtmlEntities(article.title) ?? article.title,
        slug: article.slug,
        url: article.url,
        sourceName: article.sourceName,
        sourceSlug: article.sourceSlug,
        publishedAt: article.publishedAt,
        imageUrl: article.imageUrl,
        description,
        readTimeMinutes: article.readTimeMinutes,
        summary: pickCompleteSummary(decodeHtmlEntities(article.summary), description, contentExcerpt) ?? "Read the original source for the complete report.",
        status: article.status,
        categories: categoryMap.get(article.id) ?? [],
      };
    }),
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
      contentExcerpt: articles.contentExcerpt,
      readTimeMinutes: articles.readTimeMinutes,
      summary: articleSummaries.summary,
      keyPoints: articleSummaries.keyPoints,
      whyItMatters: articleSummaries.whyItMatters,
    })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .leftJoin(articleSummaries, eq(articleSummaries.articleId, articles.id))
    .where(and(eq(articles.slug, slug), ne(articles.status, "hidden"), readableArticleFilter()))
    .limit(1);

  if (!article) return undefined;
  if (!isUsefulHeadline(article.title)) return undefined;

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
        .leftJoin(articleSummaries, eq(articleSummaries.articleId, articles.id))
        .where(and(inArray(articles.id, relatedIds.map((row) => row.articleId)), ne(articles.status, "hidden"), readableArticleFilter()))
        .orderBy(desc(articles.publishedAt))
        .limit(4)
    : [];

  return {
    ...article,
    title: decodeHtmlEntities(article.title) ?? article.title,
    description: decodeHtmlEntities(article.description),
    contentExcerpt: decodeHtmlEntities(article.contentExcerpt),
    summary: pickCompleteSummary(decodeHtmlEntities(article.summary), decodeHtmlEntities(article.description), decodeHtmlEntities(article.contentExcerpt)),
    keyPoints: article.keyPoints?.map((point) => decodeHtmlEntities(point) ?? point) ?? null,
    whyItMatters: decodeHtmlEntities(article.whyItMatters),
    categories: categoryRows,
    tags: tagRows,
    related: related.filter((item) => isUsefulHeadline(item.title)).map((item) => ({ ...item, title: decodeHtmlEntities(item.title) ?? item.title })),
  };
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
    .leftJoin(articleSummaries, eq(articleSummaries.articleId, articleCategories.articleId))
    .leftJoin(articles, and(eq(articleCategories.articleId, articles.id), ne(articles.status, "hidden"), readableArticleFilter()))
    .groupBy(categories.id)
    .orderBy(categories.sortOrder);
}
