import type { FetchArticlesInput, NewsProvider, NormalizedArticle } from "../types";
import { canonicalizeUrl, clampLimit, fetchJson, parseDate } from "../utils";

type TheNewsApiResponse = {
  data?: Array<{
    uuid: string;
    title: string;
    description?: string;
    snippet?: string;
    url: string;
    image_url?: string;
    language?: string;
    published_at: string;
    source?: string;
  }>;
};

function sourceUrl(source?: string) {
  if (!source) return "https://www.thenewsapi.com";
  return source.startsWith("http") ? source : `https://${source}`;
}

export const theNewsApiProvider: NewsProvider = {
  name: "thenewsapi",
  async fetchArticles(input: FetchArticlesInput = {}) {
    const apiToken = process.env.THENEWSAPI_API_TOKEN ?? process.env.THENEWSAPI_TOKEN;
    if (!apiToken) {
      throw new Error("THENEWSAPI_API_TOKEN is not configured");
    }

    const search = input.query ?? '("artificial intelligence" | "machine learning" | "data science" | "software engineering" | cybersecurity | hiring | layoffs | "cloud computing" | semiconductor | startup)';
    const params = new URLSearchParams({
      api_token: apiToken,
      categories: "tech",
      language: "en",
      sort: "published_on",
      limit: String(clampLimit(input.limit, 10)),
      search,
      search_fields: "title,description,keywords",
    });

    const response = await fetchJson<TheNewsApiResponse>(`https://api.thenewsapi.com/v1/news/top?${params}`);

    return (response.data ?? []).map<NormalizedArticle>((item) => ({
      title: item.title,
      url: canonicalizeUrl(item.url),
      sourceName: item.source ?? "The News API",
      sourceUrl: sourceUrl(item.source),
      publishedAt: parseDate(item.published_at),
      imageUrl: item.image_url,
      description: item.description,
      contentExcerpt: item.snippet,
      language: item.language ?? "en",
      externalId: item.uuid,
    }));
  },
};
