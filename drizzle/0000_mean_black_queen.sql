CREATE TYPE "public"."article_status" AS ENUM('pending', 'published', 'hidden', 'failed');--> statement-breakpoint
CREATE TYPE "public"."enrichment_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."ingestion_status" AS ENUM('running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('rss', 'api', 'community', 'official');--> statement-breakpoint
CREATE TABLE "article_categories" (
	"article_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "article_categories_article_id_category_id_pk" PRIMARY KEY("article_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "article_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"provider" varchar(80) DEFAULT 'gemini' NOT NULL,
	"model" varchar(120) NOT NULL,
	"summary" text NOT NULL,
	"key_points" jsonb NOT NULL,
	"why_it_matters" text,
	"status" "enrichment_status" DEFAULT 'pending' NOT NULL,
	"prompt_version" varchar(32) DEFAULT 'v1' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_tags" (
	"article_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"confidence" real,
	CONSTRAINT "article_tags_article_id_tag_id_pk" PRIMARY KEY("article_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" varchar(220) NOT NULL,
	"canonical_url" text NOT NULL,
	"author" varchar(160),
	"published_at" timestamp with time zone NOT NULL,
	"image_url" text,
	"description" text,
	"content_excerpt" text,
	"language" varchar(12) DEFAULT 'en' NOT NULL,
	"fingerprint" varchar(128) NOT NULL,
	"status" "article_status" DEFAULT 'pending' NOT NULL,
	"read_time_minutes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"description" text,
	"color" varchar(32) DEFAULT 'cyan' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid,
	"provider" varchar(80) NOT NULL,
	"status" "ingestion_status" DEFAULT 'running' NOT NULL,
	"articles_fetched" integer DEFAULT 0 NOT NULL,
	"articles_inserted" integer DEFAULT 0 NOT NULL,
	"articles_skipped" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"base_url" text NOT NULL,
	"feed_url" text,
	"type" "source_type" NOT NULL,
	"trust_score" integer DEFAULT 50 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_summaries" ADD CONSTRAINT "article_summaries_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "article_summaries_article_id_idx" ON "article_summaries" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "article_summaries_status_idx" ON "article_summaries" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "articles_canonical_url_idx" ON "articles" USING btree ("canonical_url");--> statement-breakpoint
CREATE UNIQUE INDEX "articles_fingerprint_idx" ON "articles" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "articles_source_id_idx" ON "articles" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "articles_status_idx" ON "articles" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ingestion_runs_source_id_idx" ON "ingestion_runs" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "ingestion_runs_started_at_idx" ON "ingestion_runs" USING btree ("started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sources_slug_idx" ON "sources" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sources_active_idx" ON "sources" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");