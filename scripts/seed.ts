import "dotenv/config";

import { eq } from "drizzle-orm";

import { db, pool } from "../src/db";
import { categories, sources } from "../src/db/schema";

const sourceSeed = [
  {
    name: "Hacker News",
    slug: "hacker-news",
    baseUrl: "https://news.ycombinator.com",
    type: "community" as const,
    trustScore: 80,
  },
  {
    name: "The Guardian",
    slug: "the-guardian",
    baseUrl: "https://www.theguardian.com",
    type: "api" as const,
    trustScore: 90,
  },
  {
    name: "Technology RSS",
    slug: "technology-rss",
    baseUrl: "https://example.com",
    feedUrl: "https://example.com/feed.xml",
    type: "rss" as const,
    trustScore: 50,
  },
];

const categorySeed = [
  ["Artificial Intelligence", "artificial-intelligence", "AI models, products, research, and policy.", "cyan", 1],
  ["Software Engineering", "software-engineering", "Programming, architecture, tools, and developer workflows.", "pink", 2],
  ["Data Science", "data-science", "Data platforms, analytics, and applied science.", "amber", 3],
  ["Machine Learning", "machine-learning", "ML research, systems, and production applications.", "cyan", 4],
  ["Corporate Technology", "corporate-technology", "Technology companies, earnings, products, and strategy.", "pink", 5],
  ["Hiring & Layoffs", "hiring-layoffs", "Technology careers, hiring trends, and workforce changes.", "amber", 6],
  ["Cybersecurity", "cybersecurity", "Security incidents, research, tools, and defense.", "cyan", 7],
] as const;

async function seed() {
  for (const source of sourceSeed) {
    const existing = await db.query.sources.findFirst({
      where: eq(sources.slug, source.slug),
    });

    if (!existing) {
      await db.insert(sources).values(source);
    }
  }

  for (const [name, slug, description, color, sortOrder] of categorySeed) {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });

    if (!existing) {
      await db.insert(categories).values({
        name,
        slug,
        description,
        color,
        sortOrder,
      });
    }
  }

  console.log("Seed complete: sources and categories are ready.");
}

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
