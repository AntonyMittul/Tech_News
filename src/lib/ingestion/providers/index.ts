import type { NewsProvider, ProviderName } from "../types";
import { gnewsProvider } from "./gnews";
import { guardianProvider } from "./guardian";
import { hackerNewsProvider } from "./hacker-news";
import { rssProvider } from "./rss";
import { theNewsApiProvider } from "./thenewsapi";

export const providers: Record<ProviderName, NewsProvider> = {
  rss: rssProvider,
  "hacker-news": hackerNewsProvider,
  guardian: guardianProvider,
  gnews: gnewsProvider,
  thenewsapi: theNewsApiProvider,
};

export function getProvider(name: ProviderName) {
  return providers[name];
}
