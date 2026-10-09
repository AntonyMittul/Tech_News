import { config } from "dotenv";
config({ path: ".env.local" });

import { runIngestion } from "../src/lib/ingestion/index";

const focusedQueries = [
  '("new model" | "model release" | GPT | OpenAI | Anthropic | "Google DeepMind" | "Meta AI" | benchmark | "AI research" | "AI safety")',
  '("open source" | GitHub | Linux | Kubernetes | database | compiler | "programming language" | "cloud infrastructure" | semiconductor | "software engineering")',
  '("tech hiring" | "technology hiring" | "software engineer hiring" | "developer hiring" | "AI hiring" | "data scientist hiring" | "tech layoffs" | "technology layoffs" | "software layoffs" | "AI layoffs" | "workforce reduction" | "engineering headcount")',
  '("data science" | "data scientist" | analytics | statistics | "data platform")',
  '(CVE | "zero-day" | vulnerability | ransomware | "data breach" | cybersecurity | malware)',
  '(acquisition | funding | earnings | regulation | "tech company" | startup | valuation)',
];

async function test() {
  const lookbackHours = Number(process.env.INGESTION_LOOKBACK_HOURS ?? "48");
  const publishedAfter = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
  const limit = Number(process.env.INGESTION_LIMIT ?? "10");

  console.log("Running unconstrained ingestion");

  try {
    const result = await runIngestion("thenewsapi", { limit: limit * 2, publishedAfter });
    console.log("Ingestion result:", result);
  } catch (error) {
    console.error("Ingestion failed:", error);
  }
}
test();
