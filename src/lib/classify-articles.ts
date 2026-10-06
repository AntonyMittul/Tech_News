import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articleCategories, articleTags, articles, categories, tags } from "@/db/schema";
import { classifyArticle } from "./ingestion/classify";

export async function classifyStoredArticles() {
  const [articleRows, categoryRows] = await Promise.all([
    db.select({ id: articles.id, title: articles.title, description: articles.description, contentExcerpt: articles.contentExcerpt }).from(articles),
    db.select({ id: categories.id, slug: categories.slug }).from(categories),
  ]);

  for (const article of articleRows) {
    const classification = classifyArticle(article.title, article.description ?? undefined, article.contentExcerpt ?? undefined);
    const matchedCategories = categoryRows.filter((category) => classification.categorySlugs.includes(category.slug));
    if (matchedCategories.length > 0) {
      await db.insert(articleCategories).values(matchedCategories.map((category) => ({ articleId: article.id, categoryId: category.id }))).onConflictDoNothing();
    }

    for (const tagSlug of classification.tags) {
      const tagName = tagSlug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
      await db.insert(tags).values({ name: tagName, slug: tagSlug }).onConflictDoNothing({ target: tags.slug });
      const [tag] = await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, tagSlug)).limit(1);
      if (tag) await db.insert(articleTags).values({ articleId: article.id, tagId: tag.id, confidence: 0.75 }).onConflictDoNothing();
    }
  }

  return articleRows.length;
}
