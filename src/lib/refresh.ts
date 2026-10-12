import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { ingestionRuns } from "@/db/schema";
import { runIngestion } from "./ingestion";
import { enrichPendingArticles } from "./ai/enrich-pending";

const focusedQueries = [
  '("artificial intelligence" | "new model" | "model release" | GPT | OpenAI | Anthropic | "Google DeepMind" | "Meta AI" | LLM | benchmark | "AI research" | "AI safety")',
  '("open source" | GitHub | Linux | Kubernetes | database | compiler | "programming language" | "cloud infrastructure" | semiconductor | "software engineering")',
  '("data science" | "data scientist" | analytics | statistics | "data platform")',
  '(CVE | "zero-day" | vulnerability | ransomware | "data breach" | cybersecurity | malware)',
  '(acquisition | funding | earnings | regulation | "tech company" | startup | valuation)',
];

export async function refreshLiveNews() {
  const lookbackHours = Number(process.env.INGESTION_LOOKBACK_HOURS ?? "48");
  const publishedAfter = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
  const limit = Math.max(Number(process.env.INGESTION_LIMIT ?? "15"), 15);
  const ingestion = [];

  // 1. Ingest from Hacker News (Free public API, zero authentication required, always live)
  try {
    ingestion.push(await runIngestion("hacker-news", { limit }));
  } catch (error) {
    console.error("Hacker News ingestion failed:", error);
  }

  // 2. Ingest from TheNewsAPI (If token is available) with broadened AI & tech focus
  const thenewsapiToken = process.env.THENEWSAPI_API_TOKEN ?? process.env.THENEWSAPI_TOKEN;
  if (thenewsapiToken) {
    const combinedQuery = focusedQueries.join(" | ");
    try {
      ingestion.push(await runIngestion("thenewsapi", { limit: limit * 2, publishedAfter, query: combinedQuery }));
    } catch (error) {
      console.error("TheNewsAPI ingestion failed:", error);
    }
  } else {
    console.warn("THENEWSAPI_API_TOKEN is not configured; skipped thenewsapi provider.");
  }

  // 3. Trigger AI enrichment for pending articles if GEMINI_API_KEY is configured
  if (process.env.GEMINI_API_KEY) {
    try {
      await enrichPendingArticles(5);
    } catch (error) {
      console.error("Auto-enrichment after refresh failed:", error);
    }
  }

  return { ingestion };
}

let refreshPromise: Promise<{ ingestion: any[] }> | null = null;
let lastAttemptTime = 0;

/**
 * Checks if the last completed ingestion run is older than the threshold (default 3 hours).
 * If stale, triggers a background refresh asynchronously without blocking user traffic.
 */
export async function triggerAutoRefreshIfStale(staleThresholdHours = 3) {
  const now = Date.now();
  // Throttle database check so we don't query ingestion_runs on every rapid request
  if (now - lastAttemptTime < 5 * 60 * 1000) return;
  if (refreshPromise) return;

  lastAttemptTime = now;

  try {
    const [latestRun] = await db
      .select({ completedAt: ingestionRuns.completedAt })
      .from(ingestionRuns)
      .where(eq(ingestionRuns.status, "completed"))
      .orderBy(desc(ingestionRuns.completedAt))
      .limit(1);

    const thresholdMs = staleThresholdHours * 60 * 60 * 1000;
    const isStale = !latestRun?.completedAt || now - latestRun.completedAt.getTime() > thresholdMs;

    if (isStale) {
      console.log(`[Auto-Refresh] Ingestion is older than ${staleThresholdHours} hours. Refreshing in background...`);
      refreshPromise = refreshLiveNews()
        .catch((error) => {
          console.error("[Auto-Refresh Error]", error);
          return { ingestion: [] };
        })
        .finally(() => {
          refreshPromise = null;
        });
    }
  } catch (error) {
    console.error("[Auto-Refresh Check Failed]", error);
  }
}
