export const providerNames = ["rss", "hacker-news", "guardian", "gnews", "thenewsapi"] as const;

export type ProviderName = (typeof providerNames)[number];

export type FetchArticlesInput = {
  limit?: number;
  publishedAfter?: Date;
  feedUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  query?: string;
};

export type NormalizedArticle = {
  title: string;
  url: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: Date;
  author?: string;
  imageUrl?: string;
  description?: string;
  contentExcerpt?: string;
  language?: string;
  externalId?: string;
};

export type NewsProvider = {
  name: ProviderName;
  fetchArticles(input?: FetchArticlesInput): Promise<NormalizedArticle[]>;
};
