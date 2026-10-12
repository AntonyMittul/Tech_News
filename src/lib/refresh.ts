import { runIngestion } from "./ingestion";
import { enrichPendingArticles } from "./ai/enrich-pending";
import { classifyStoredArticles } from "./classify-articles";

const focusedQueries = [
  '("new model" | "model release" | GPT | OpenAI | Anthropic | "Google DeepMind" | "Meta AI" | benchmark | "AI research" | "AI safety")',
  '("open source" | GitHub | Linux | Kubernetes | database | compiler | "programming language" | "cloud infrastructure" | semiconductor | "software engineering")',
  '("tech hiring" | "technology hiring" | "software engineer hiring" | "developer hiring" | "AI hiring" | "data scientist hiring" | "tech layoffs" | "technology layoffs" | "software layoffs" | "AI layoffs" | "workforce reduction" | "engineering headcount")',
  '("data science" | "data scientist" | analytics | statistics | "data platform")',
  '(CVE | "zero-day" | vulnerability | ransomware | "data breach" | cybersecurity | malware)',
  '(acquisition | funding | earnings | regulation | "tech company" | startup | valuation)',
];

export async function refreshLiveNews() {
  const lookbackHours = Number(process.env.INGESTION_LOOKBACK_HOURS ?? "48");
  const publishedAfter = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
  const limit = Number(process.env.INGESTION_LIMIT ?? "10");
  const ingestion = [];

  // 1. Ingest from Hacker News (Free public API, zero authentication required, always live)
  try {
    ingestion.push(await runIngestion("hacker-news", { limit }));
  } catch (error) {
    console.error("Hacker News ingestion failed:", error);
  }

  // 2. Ingest from TheNewsAPI (If token is available)
  const thenewsapiToken = process.env.THENEWSAPI_API_TOKEN ?? process.env.THENEWSAPI_TOKEN;
  if (thenewsapiToken) {
    try {
      ingestion.push(await runIngestion("thenewsapi", { limit: limit * 2, publishedAfter }));
    } catch (error) {
      console.error("TheNewsAPI ingestion failed:", error);
    }
  } else {
    console.warn("THENEWSAPI_API_TOKEN is not configured; skipped thenewsapi provider.");
  }

  return { ingestion };
}
