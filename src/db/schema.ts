import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const sourceTypeEnum = pgEnum("source_type", [
  "rss",
  "api",
  "community",
  "official",
]);

export const articleStatusEnum = pgEnum("article_status", [
  "pending",
  "published",
  "hidden",
  "failed",
]);

export const enrichmentStatusEnum = pgEnum("enrichment_status", [
  "pending",
  "completed",
  "failed",
]);

export const ingestionStatusEnum = pgEnum("ingestion_status", [
  "running",
  "completed",
  "failed",
]);

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    baseUrl: text("base_url").notNull(),
    feedUrl: text("feed_url"),
    type: sourceTypeEnum("type").notNull(),
    trustScore: integer("trust_score").notNull().default(50),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("sources_slug_idx").on(table.slug),
    index("sources_active_idx").on(table.isActive),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    description: text("description"),
    color: varchar("color", { length: 32 }).notNull().default("cyan"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("categories_slug_idx").on(table.slug)],
);

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    canonicalUrl: text("canonical_url").notNull(),
    author: varchar("author", { length: 160 }),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    imageUrl: text("image_url"),
    description: text("description"),
    contentExcerpt: text("content_excerpt"),
    language: varchar("language", { length: 12 }).notNull().default("en"),
    fingerprint: varchar("fingerprint", { length: 128 }).notNull(),
    status: articleStatusEnum("status").notNull().default("pending"),
    readTimeMinutes: integer("read_time_minutes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("articles_slug_idx").on(table.slug),
    uniqueIndex("articles_canonical_url_idx").on(table.canonicalUrl),
    uniqueIndex("articles_fingerprint_idx").on(table.fingerprint),
    index("articles_published_at_idx").on(table.publishedAt),
    index("articles_source_id_idx").on(table.sourceId),
    index("articles_status_idx").on(table.status),
  ],
);

export const articleCategories = pgTable(
  "article_categories",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.categoryId] })],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("tags_slug_idx").on(table.slug)],
);

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    confidence: real("confidence"),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.tagId] })],
);

export const articleSummaries = pgTable(
  "article_summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 80 }).notNull().default("gemini"),
    model: varchar("model", { length: 120 }).notNull(),
    summary: text("summary").notNull(),
    keyPoints: jsonb("key_points").$type<string[]>().notNull(),
    whyItMatters: text("why_it_matters"),
    status: enrichmentStatusEnum("status").notNull().default("pending"),
    promptVersion: varchar("prompt_version", { length: 32 }).notNull().default("v1"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("article_summaries_article_id_idx").on(table.articleId),
    index("article_summaries_status_idx").on(table.status),
  ],
);

export const ingestionRuns = pgTable(
  "ingestion_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
    provider: varchar("provider", { length: 80 }).notNull(),
    status: ingestionStatusEnum("status").notNull().default("running"),
    articlesFetched: integer("articles_fetched").notNull().default(0),
    articlesInserted: integer("articles_inserted").notNull().default(0),
    articlesSkipped: integer("articles_skipped").notNull().default(0),
    articlesDuplicated: integer("articles_duplicated").notNull().default(0),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("ingestion_runs_source_id_idx").on(table.sourceId),
    index("ingestion_runs_started_at_idx").on(table.startedAt),
  ],
);

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
