export type PreferenceArticle = {
  id: string;
  slug: string;
  title: string;
  url: string;
  sourceName: string;
  publishedAt: string;
  imageUrl: string | null;
  description: string | null;
  summary: string | null;
  readTimeMinutes: number | null;
  categories: string[];
};

export const preferenceKeys = {
  bookmarks: "signal-bookmarks",
  read: "signal-read-articles",
  categories: "signal-preferred-categories",
  hideRead: "signal-hide-read",
} as const;

export function readPreference<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writePreference<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("signal-preferences-changed"));
}

export function toggleStoredId(key: string, id: string) {
  const ids = readPreference<string[]>(key, []);
  const next = ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
  writePreference(key, next);
  return next;
}
