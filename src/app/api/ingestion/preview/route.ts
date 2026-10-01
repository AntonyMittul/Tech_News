import { NextRequest } from "next/server";

import { fetchProviderArticles } from "@/lib/ingestion";
import { providerNames, type ProviderName } from "@/lib/ingestion/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider") as ProviderName | null;
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "5");

  if (!provider || !providerNames.includes(provider)) {
    return Response.json(
      { error: `provider must be one of: ${providerNames.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const articles = await fetchProviderArticles(provider, {
      limit,
      feedUrl: request.nextUrl.searchParams.get("feedUrl") ?? undefined,
      sourceName: request.nextUrl.searchParams.get("sourceName") ?? undefined,
      sourceUrl: request.nextUrl.searchParams.get("sourceUrl") ?? undefined,
      query: request.nextUrl.searchParams.get("query") ?? undefined,
    });

    return Response.json({ provider, count: articles.length, articles });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Provider preview failed" },
      { status: 502 },
    );
  }
}
