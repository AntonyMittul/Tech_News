import { config } from "dotenv";
config({ path: ".env.local" });
import { clampLimit, fetchJson } from "../src/lib/ingestion/utils";

const query = '("new model" | "model release" | GPT | OpenAI | Anthropic | "Google DeepMind" | "Meta AI" | benchmark | "AI research" | "AI safety")';

async function test() {
  const apiToken = process.env.THENEWSAPI_API_TOKEN ?? process.env.THENEWSAPI_TOKEN;
  const publishedAfter = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, "");

  console.log("Testing /news/top");
  try {
    const params1 = new URLSearchParams({ api_token: apiToken!, categories: "tech", language: "en", search: query, published_after: publishedAfter, limit: "10" });
    const start1 = Date.now();
    const res1 = await fetchJson<any>(`https://api.thenewsapi.com/v1/news/top?${params1}`);
    console.log(`Top News found ${res1.meta?.found} in ${Date.now() - start1}ms`);
  } catch (e) {
    console.error("Top News Error:", e);
  }

  console.log("Testing /news/all");
  try {
    const params2 = new URLSearchParams({ api_token: apiToken!, categories: "tech", language: "en", search: query, published_after: publishedAfter, limit: "10" });
    const start2 = Date.now();
    const res2 = await fetchJson<any>(`https://api.thenewsapi.com/v1/news/all?${params2}`);
    console.log(`All News found ${res2.meta?.found} in ${Date.now() - start2}ms`);
  } catch (e) {
    console.error("All News Error:", e);
  }
}
test();
