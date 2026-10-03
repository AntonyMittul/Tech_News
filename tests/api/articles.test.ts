import { beforeEach, describe, expect, it, vi } from "vitest";

const getArticles = vi.fn();
vi.mock("@/lib/news", () => ({ getArticles }));

describe("articles API", () => {
  beforeEach(() => vi.resetAllMocks());

  it("passes query parameters to the article service", async () => {
    getArticles.mockResolvedValue({ articles: [], page: 1, limit: 10, hasMore: false });
    const { GET } = await import("@/app/api/articles/route");
    const response = await GET({
      nextUrl: new URL("http://localhost/api/articles?page=2&limit=10&category=hiring-layoffs&q=google"),
    } as never);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ articles: [], page: 1, limit: 10, hasMore: false });
    expect(getArticles).toHaveBeenCalledWith({ page: 2, limit: 10, query: "google", category: "hiring-layoffs", source: undefined });
  });
});
