import type { FetchArticlesInput, NewsProvider, NormalizedArticle } from "../types";
import { canonicalizeUrl, clampLimit, fetchJson, parseDate, stripHtml } from "../utils";

type GuardianResponse = {
  response?: {
    results?: Array<{
      id: string;
      webTitle: string;
      webUrl: string;
      webPublicationDate: string;
      fields?: {
        headline?: string;
        trailText?: string;
        thumbnail?: string;
        byline?: string;
        bodyText?: string;
      };
    }>;
  };
};

export const guardianProvider: NewsProvider = {
  name: "guardian",
  async fetchArticles(input: FetchArticlesInput = {}) {
    const apiKey = process.env.GUARDIAN_API_KEY;
    if (!apiKey) {
      throw new Error("GUARDIAN_API_KEY is not configured");
    }

    const params = new URLSearchParams({
      "api-key": apiKey,
      section: "technology",
      "show-fields": "headline,trailText,thumbnail,byline,bodyText",
      "order-by": "newest",
      "page-size": String(clampLimit(input.limit)),
    });
    if (input.query) params.set("q", input.query);

    const data = await fetchJson<GuardianResponse>(`https://content.guardianapis.com/search?${params}`);

    return (data.response?.results ?? []).map<NormalizedArticle>((item) => ({
      title: stripHtml(item.fields?.headline ?? item.webTitle) ?? "Untitled Guardian article",
      url: canonicalizeUrl(item.webUrl),
      sourceName: "The Guardian",
      sourceUrl: "https://www.theguardian.com/technology",
      publishedAt: parseDate(item.webPublicationDate),
      author: item.fields?.byline,
      imageUrl: item.fields?.thumbnail,
      description: stripHtml(item.fields?.trailText),
      contentExcerpt: stripHtml(item.fields?.bodyText),
      language: "en",
      externalId: item.id,
    }));
  },
};
