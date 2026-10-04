import type { FetchArticlesInput, NewsProvider, NormalizedArticle } from "../types";
import { clampLimit, fetchJson, parseDate, stripHtml, extractOgImage } from "../utils";

type HackerNewsItem = {
  id: number;
  type?: string;
  by?: string;
  time?: number;
  title?: string;
  url?: string;
  text?: string;
  dead?: boolean;
  deleted?: boolean;
};

const baseUrl = "https://hacker-news.firebaseio.com/v0";

export const hackerNewsProvider: NewsProvider = {
  name: "hacker-news",
  async fetchArticles(input: FetchArticlesInput = {}) {
    const limit = clampLimit(input.limit, 30);
    const ids = await fetchJson<number[]>(`${baseUrl}/topstories.json`);
    const stories = await Promise.all(
      ids.slice(0, limit * 2).map((id) => fetchJson<HackerNewsItem>(`${baseUrl}/item/${id}.json`)),
    );

    const validStories = stories
      .filter((item) => item && item.type === "story" && item.title && item.url && !item.dead && !item.deleted)
      .slice(0, limit);

    // Fetch Open Graph images for all valid stories concurrently
    const ogImages = await Promise.all(validStories.map((item) => extractOgImage(item.url!)));

    return validStories.map<NormalizedArticle>((item, index) => ({
      title: stripHtml(item.title) ?? "Untitled Hacker News story",
      url: item.url!,
      sourceName: "Hacker News",
      sourceUrl: "https://news.ycombinator.com",
      publishedAt: parseDate(item.time ? item.time * 1000 : undefined),
      author: item.by,
      imageUrl: ogImages[index], // Use the dynamically fetched OG image
      description: stripHtml(item.text),
      language: "en",
      externalId: String(item.id),
    }));
  },
};
