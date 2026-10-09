import { NextRequest } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { articles, ingestionRuns } from "@/db/schema";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET ?? process.env.INGESTION_SECRET;
  const providedSecret = request.headers.get("authorization")?.replace("Bearer ", "") ?? request.nextUrl.searchParams.get("secret");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const recentRuns = await db.query.ingestionRuns.findMany({
      orderBy: [desc(ingestionRuns.startedAt)],
      limit: 10,
    });

    const [latestArticle] = await db.select({ publishedAt: articles.publishedAt }).from(articles).orderBy(desc(articles.publishedAt)).limit(1);

    return Response.json({
      status: "ok",
      database: {
        latestArticlePublishedAt: latestArticle?.publishedAt ?? null,
      },
      recentRuns,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
