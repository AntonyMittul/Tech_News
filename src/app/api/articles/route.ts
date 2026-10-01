import { NextRequest } from "next/server";

import { getArticles } from "@/lib/news";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const result = await getArticles({
    page: Number(params.get("page") ?? "1"),
    limit: Number(params.get("limit") ?? "20"),
    query: params.get("q") ?? undefined,
    category: params.get("category") ?? undefined,
    source: params.get("source") ?? undefined,
  });

  return Response.json(result);
}
