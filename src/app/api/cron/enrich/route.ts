import { NextRequest } from "next/server";
import { enrichPendingArticles } from "@/lib/ai/enrich-pending";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET ?? process.env.INGESTION_SECRET;
  const authHeader = request.headers.get("authorization");
  const providedSecret = 
    request.headers.get("x-cron-secret") ?? 
    request.headers.get("x-ingestion-secret") ??
    (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

  if (!expectedSecret) return Response.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  if (providedSecret !== expectedSecret) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const limit = Number(process.env.ENRICHMENT_LIMIT ?? "5");
    const result = await enrichPendingArticles(limit);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Scheduled enrichment failed" }, { status: 502 });
  }
}
