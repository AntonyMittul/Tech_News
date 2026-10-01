import type { FetchArticlesInput, NewsProvider, NormalizedArticle } from "../types";
import { canonicalizeUrl, clampLimit, fetchJson, parseDate } from "../utils";

type GNewsResponse = {
  articles?: Array<{
    title: string;
    description?: string;
    content?: string;
    url: string;
    image?: string;
    publishedAt: string;
    source?: { name?: string; url?: string };
  }>;
};

export const gnewsProvider: NewsProvider = {
  name: "gnews",
  async fetchArticles(input: FetchArticlesInput = {}) {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      throw new Error("GNEWS_API_KEY is not configured");
    }

    const params = new URLSearchParams({
      apikey: apiKey,
      category: "technology",
      lang: "en",
      max: String(clampLimit(input.limit)),
    });
    if (input.query) params.set("q", input.query);

    const data = await fetchJson<GNewsResponse>(`https://gnews.io/api/v4/top-headlines?${params}`);

    return (data.articles ?? []).map<NormalizedArticle>((item) => ({
      title: item.title,
      url: canonicalizeUrl(item.url),
      sourceName: item.source?.name ?? "GNews",
      sourceUrl: item.source?.url ?? "https://gnews.io",
      publishedAt: parseDate(item.publishedAt),
      imageUrl: item.image,
      description: item.description,
      contentExcerpt: item.content,
      language: "en",
    }));
  },
};
