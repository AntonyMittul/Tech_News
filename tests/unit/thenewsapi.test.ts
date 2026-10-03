import { afterEach, describe, expect, it, vi } from "vitest";

import { theNewsApiProvider } from "@/lib/ingestion/providers/thenewsapi";

describe("The News API provider", () => {
  afterEach(() => vi.restoreAllMocks());

  it("normalizes valid provider responses and filters low-signal jobs", async () => {
    process.env.THENEWSAPI_API_TOKEN = "test-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: [
        { uuid: "1", title: "Google expands software engineering hiring", description: "The technology company is opening engineering roles across its cloud and AI teams for the next hiring cycle.", url: "https://example.com/news?utm_source=test", published_at: "2026-10-02T10:00:00Z", source: "example.com" },
        { uuid: "2", title: "Local railway announces clerical jobs", description: "Applications are now open for clerical positions.", url: "https://example.com/jobs", published_at: "2026-10-02T09:00:00Z", source: "example.com" },
      ],
    }), { status: 200 })));

    const articles = await theNewsApiProvider.fetchArticles({ limit: 10 });
    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({ title: "Google expands software engineering hiring", externalId: "1", url: "https://example.com/news" });
  });

  it("requires an API token", async () => {
    delete process.env.THENEWSAPI_API_TOKEN;
    delete process.env.THENEWSAPI_TOKEN;
    await expect(theNewsApiProvider.fetchArticles()).rejects.toThrow("THENEWSAPI_API_TOKEN is not configured");
  });
});
