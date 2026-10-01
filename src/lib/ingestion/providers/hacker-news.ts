import type { FetchArticlesInput, NewsProvider, NormalizedArticle } from "../types";
import { clampLimit, fetchJson, parseDate, stripHtml } from "../utils";

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

    return stories
      .filter((item) => item && item.type === "story" && item.title && item.url && !item.dead && !item.deleted)
      .slice(0, limit)
      .map<NormalizedArticle>((item) => ({
        title: stripHtml(item.title) ?? "Untitled Hacker News story",
        url: item.url!,
        sourceName: "Hacker News",
        sourceUrl: "https://news.ycombinator.com",
        publishedAt: parseDate(item.time ? item.time * 1000 : undefined),
        author: item.by,
        description: stripHtml(item.text),
        language: "en",
        externalId: String(item.id),
      }));
  },
};
