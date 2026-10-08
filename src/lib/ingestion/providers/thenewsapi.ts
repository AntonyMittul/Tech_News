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

function relevanceScore(title: string, description?: string, source?: string) {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  const highSignal = [
    "openai", "anthropic", "google", "microsoft", "amazon", "meta", "apple", "nvidia", "intel", "github", "linux", "gpt", "gemini", "claude", "llm",
    "new model", "model release", "launches", "released", "research", "benchmark", "open source",
    "api", "framework", "programming language", "database", "cloud infrastructure", "semiconductor",
    "cve-", "zero-day", "vulnerability", "ransomware", "data breach", "layoffs", "hiring", "headcount",
    "data science", "data scientist", "data pipeline", "acquisition", "funding", "earnings", "regulation",
  ];
  const lowSignal = [
    "best ", "top ", "review", "deals", "sale", "discount", "sponsored", "founder-led sales", "meeting assistants",
    "how to", "buying guide", "gift guide", "opinion", "podcast", "newsletter",
  ];
  const trustedSource = ["openai.com", "anthropic.com", "blog.google", "github.blog", "microsoft.com", "arstechnica.com", "theregister.com", "bleepingcomputer.com"];
  const titleText = title.toLowerCase();
  const titleSignals = highSignal.filter((term) => titleText.includes(term)).length;
  const technicalTitleSignals = ["technology", "tech", "software", "developer", "engineer", "programming", "ai", "data", "cloud", "cyber", "computer", "robotics", "startup", "openai", "anthropic", "google", "microsoft", "amazon", "meta", "apple", "nvidia", "intel"].filter((term) => term.length <= 3 ? new RegExp(`\\b${term}\\b`).test(titleText) : titleText.includes(term)).length;
  let score = highSignal.reduce((total, term) => total + (text.includes(term) ? 2 : 0), 0);
  score -= lowSignal.reduce((total, term) => total + (text.includes(term) ? 3 : 0), 0);
  if (trustedSource.some((domain) => source?.toLowerCase().includes(domain))) score += 2;
  return score;
}

export const theNewsApiProvider: NewsProvider = {
  name: "thenewsapi",
  async fetchArticles(input: FetchArticlesInput = {}) {
    const apiToken = process.env.THENEWSAPI_API_TOKEN ?? process.env.THENEWSAPI_TOKEN;
    if (!apiToken) {
      throw new Error("THENEWSAPI_API_TOKEN is not configured");
    }

    const search = input.query ?? '("artificial intelligence" | "machine learning" | "data science" | "data scientist" | "software engineering" | cybersecurity | "tech hiring" | "technology hiring" | "software engineer hiring" | "developer hiring" | "AI hiring" | "tech layoffs" | "technology layoffs" | "software layoffs" | "AI layoffs" | "workforce reduction" | "cloud computing" | semiconductor | startup)';
    const params = new URLSearchParams({
      api_token: apiToken,
      categories: "tech",
      language: "en",
      sort: "published_at",
      limit: String(clampLimit(input.limit, 50)),
      search,
      search_fields: "title,description,keywords",
    });
    if (input.publishedAfter) {
      params.set("published_after", input.publishedAfter.toISOString().replace(/\.\d{3}Z$/, ""));
    }

    const response = await fetchJson<TheNewsApiResponse>(`https://api.thenewsapi.com/v1/news/all?${params}`);

    return (response.data ?? []).filter((item) => relevanceScore(item.title, item.description, item.source) >= 0).map<NormalizedArticle>((item) => ({
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
