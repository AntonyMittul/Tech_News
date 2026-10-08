import { config } from "dotenv";
config({ path: ".env.local" });
import { clampLimit, fetchJson } from "../src/lib/ingestion/utils";

const query = '("new model" | "model release" | GPT | OpenAI | Anthropic | "Google DeepMind" | "Meta AI" | benchmark | "AI research" | "AI safety" | "open source" | GitHub | Linux | Kubernetes | database | compiler | "programming language" | "cloud infrastructure" | semiconductor | "software engineering" | "tech hiring" | "technology hiring" | "software engineer hiring" | "developer hiring" | "AI hiring" | "data scientist hiring" | "tech layoffs" | "technology layoffs" | "software layoffs" | "AI layoffs" | "workforce reduction" | "engineering headcount" | "data science" | "data scientist" | analytics | statistics | "data platform" | CVE | "zero-day" | vulnerability | ransomware | "data breach" | cybersecurity | malware | acquisition | funding | earnings | regulation | "tech company" | startup | valuation)';

async function test() {
  const apiToken = process.env.THENEWSAPI_API_TOKEN ?? process.env.THENEWSAPI_TOKEN;
  const publishedAfter = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, "");

  console.log("Testing /news/all with combined query");
  try {
    const params = new URLSearchParams({ api_token: apiToken!, categories: "tech", language: "en", search: query, published_after: publishedAfter, limit: "10" });
    const start = Date.now();
    const res = await fetchJson<any>(`https://api.thenewsapi.com/v1/news/all?${params}`);
    console.log(`All News found ${res.meta?.found} in ${Date.now() - start}ms`);
  } catch (e) {
    console.error("All News Error:", e);
  }
}
test();
