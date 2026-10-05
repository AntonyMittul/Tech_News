import { NextRequest } from "next/server";

import { refreshLiveNews } from "@/lib/refresh";

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
    return Response.json(await refreshLiveNews());
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Scheduled refresh failed" }, { status: 502 });
  }
}
