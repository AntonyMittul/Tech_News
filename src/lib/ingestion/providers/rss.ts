import Parser from "rss-parser";

import type { FetchArticlesInput, NewsProvider, NormalizedArticle } from "../types";
import { canonicalizeUrl, clampLimit, parseDate, stripHtml } from "../utils";

const parser = new Parser();

export const rssProvider: NewsProvider = {
  name: "rss",
  async fetchArticles(input: FetchArticlesInput = {}) {
    if (!input.feedUrl) {
      throw new Error("RSS provider requires a feedUrl");
    }

    const feed = await parser.parseURL(input.feedUrl);

    return feed.items
      .filter((item) => item.title && item.link)
      .slice(0, clampLimit(input.limit))
      .map<NormalizedArticle>((item) => ({
        title: stripHtml(item.title) ?? "Untitled article",
        url: canonicalizeUrl(item.link!),
        sourceName: input.sourceName ?? feed.title ?? "RSS source",
        sourceUrl: input.sourceUrl ?? feed.link ?? input.feedUrl!,
        publishedAt: parseDate(item.isoDate ?? item.pubDate),
        author: item.creator ?? item.author,
        imageUrl: item.enclosure?.url,
        description: stripHtml(item.contentSnippet ?? item.content),
        contentExcerpt: stripHtml(item.content),
        language: feed.language ?? "en",
        externalId: item.guid,
      }));
  },
};
