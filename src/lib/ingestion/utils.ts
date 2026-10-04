import { createHash } from "node:crypto";

export function clampLimit(limit = 20, max = 50) {
  return Math.min(Math.max(Math.floor(limit), 1), max);
}

export function stripHtml(value?: string | null) {
  if (!value) return undefined;

  const text = (decodeHtmlEntities(value) ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text || undefined;
}

export function decodeHtmlEntities(value?: string | null) {
  if (!value) return value ?? undefined;

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

export function canonicalizeUrl(value: string) {
  const url = new URL(value);
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => {
    url.searchParams.delete(key);
  });
  url.hash = "";
  return url.toString();
}

export function fingerprintArticle(title: string, url: string) {
  return createHash("sha256")
    .update(`${title.trim().toLowerCase()}|${canonicalizeUrl(url)}`)
    .digest("hex");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "User-Agent": "Signal-Tech-News/0.1 (+https://github.com/AntonyMittul/Tech_News)",
      ...init?.headers,
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const safeUrl = new URL(url);
    if (safeUrl.searchParams.has("api_token")) safeUrl.searchParams.set("api_token", "[redacted]");
    throw new Error(`Provider request failed (${response.status}): ${safeUrl}`);
  }

  return (await response.json()) as T;
}

export function parseDate(value?: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export async function extractOgImage(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    clearTimeout(id);
    
    if (!response.ok) return undefined;
    
    // We only need the first chunk of HTML (head tag) to find meta tags, but for simplicity we get text
    const html = await response.text();
    
    // Regex to match og:image or twitter:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) 
                 || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
                 
    if (ogMatch && ogMatch[1]) return ogMatch[1];
    
    const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
                      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
                      
    if (twitterMatch && twitterMatch[1]) return twitterMatch[1];
    
    return undefined;
  } catch (error) {
    return undefined; // Ignore timeouts and fetch errors
  }
}
