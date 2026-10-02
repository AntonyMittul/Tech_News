import { runIngestion } from "./ingestion";
import { enrichPendingArticles } from "./ai/enrich-pending";

const focusedQueries = [
  '("new model" | "model release" | GPT | OpenAI | Anthropic | "Google DeepMind" | "Meta AI" | benchmark | "AI research" | "AI safety")',
  '("open source" | GitHub | Linux | Kubernetes | database | compiler | "programming language" | "cloud infrastructure" | semiconductor | "software engineering")',
  '(hiring | layoffs | recruiting | recruitment | "workforce reduction" | headcount | "open roles")',
  '("data science" | "data scientist" | analytics | statistics | "data platform")',
  '(CVE | "zero-day" | vulnerability | ransomware | "data breach" | cybersecurity | malware)',
  '(acquisition | funding | earnings | regulation | "tech company" | startup | valuation)',
];

export async function refreshLiveNews() {
  const lookbackHours = Number(process.env.INGESTION_LOOKBACK_HOURS ?? "48");
  const publishedAfter = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
  const limit = Number(process.env.INGESTION_LIMIT ?? "10");
  const ingestion = [];

  for (const query of focusedQueries) {
    ingestion.push(await runIngestion("thenewsapi", { limit, query, publishedAfter }));
  }

  const enrichment = await enrichPendingArticles(Number(process.env.ENRICHMENT_LIMIT ?? "5"));
  return { ingestion, enrichment };
}
