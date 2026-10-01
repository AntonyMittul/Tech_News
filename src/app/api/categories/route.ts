import { getCategories } from "@/lib/news";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ categories: await getCategories() });
}
