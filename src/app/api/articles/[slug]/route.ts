import { getArticleBySlug } from "@/lib/news";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const article = await getArticleBySlug(slug);

  if (!article) return Response.json({ error: "Article not found" }, { status: 404 });
  return Response.json(article);
}
