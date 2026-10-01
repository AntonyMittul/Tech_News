import { NextRequest } from "next/server";

import { runIngestion } from "@/lib/ingestion";
import { providerNames, type ProviderName } from "@/lib/ingestion/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.INGESTION_SECRET;
  const providedSecret = request.headers.get("x-ingestion-secret");
  if (!expectedSecret) return Response.json({ error: "INGESTION_SECRET is not configured" }, { status: 503 });
  if (providedSecret !== expectedSecret) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { provider?: ProviderName };
  if (!body.provider || !providerNames.includes(body.provider)) {
    return Response.json({ error: `provider must be one of: ${providerNames.join(", ")}` }, { status: 400 });
  }

  try {
    return Response.json(await runIngestion(body.provider));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Ingestion failed" }, { status: 502 });
  }
}
