import { config } from "dotenv";
config({ path: ".env.local" });
import { clampLimit, fetchJson } from "../src/lib/ingestion/utils";

const focusedQueries = [
  '("new model" | "model release" | GPT | OpenAI | Anthropic | "Google DeepMind" | "Meta AI" | benchmark | "AI research" | "AI safety")',
  '("open source" | GitHub | Linux | Kubernetes | database | compiler | "programming language" | "cloud infrastructure" | semiconductor | "software engineering")',
  '("tech hiring" | "technology hiring" | "software engineer hiring" | "developer hiring" | "AI hiring" | "data scientist hiring" | "tech layoffs" | "technology layoffs" | "software layoffs" | "AI layoffs" | "workforce reduction" | "engineering headcount")',
  '("data science" | "data scientist" | analytics | statistics | "data platform")',
  '(CVE | "zero-day" | vulnerability | ransomware | "data breach" | cybersecurity | malware)',
  '(acquisition | funding | earnings | regulation | "tech company" | startup | valuation)',
];

async function test() {
  const apiToken = process.env.THENEWSAPI_API_TOKEN ?? process.env.THENEWSAPI_TOKEN;
  
  let totalFound = 0;
  for (const query of focusedQueries) {
    const params = new URLSearchParams({
      api_token: apiToken!,
      categories: "tech",
      language: "en",
      sort: "published_on",
      limit: "10",
      search: query,
      search_fields: "title,description,keywords",
    });
    const publishedAfter = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
    params.set("published_after", publishedAfter.toISOString().replace(/\.\d{3}Z$/, ""));

    const url = `https://api.thenewsapi.com/v1/news/top?${params}`;
    try {
      const response = await fetchJson<any>(url);
      console.log(`Query: ${query.substring(0, 30)}... found ${response.data?.length ?? 0} articles.`);
      totalFound += response.data?.length ?? 0;
    } catch (error) {
      console.error("Error for query:", query, error);
    }
  }
  console.log(`Total raw articles found across all queries: ${totalFound}`);
}
test();
