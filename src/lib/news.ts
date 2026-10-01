import { desc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { articles, categories, sources } from "@/db/schema";

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
      status: articles.status,
    })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .where(ne(articles.status, "hidden"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
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
