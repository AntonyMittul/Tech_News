import { NextRequest } from "next/server";

import { getArticles } from "@/lib/news";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    
    let page = Number(params.get("page") ?? "1");
    if (isNaN(page) || page < 1) page = 1;

    let limit = Number(params.get("limit") ?? "20");
    if (isNaN(limit) || limit < 1) limit = 20;
    limit = Math.min(limit, 50);

    const result = await getArticles({
      page,
      limit,
      query: params.get("q") ?? undefined,
      category: params.get("category") ?? undefined,
      source: params.get("source") ?? undefined,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Articles API Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
