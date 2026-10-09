import { config } from "dotenv";
config({ path: ".env.local" });
import { clampLimit, fetchJson } from "../src/lib/ingestion/utils";

async function test() {
  const apiToken = process.env.THENEWSAPI_API_TOKEN ?? process.env.THENEWSAPI_TOKEN;
  const search = '("artificial intelligence" | "machine learning" | "data science" | "data scientist" | "software engineering" | cybersecurity | "tech hiring" | "technology hiring" | "software engineer hiring" | "developer hiring" | "AI hiring" | "tech layoffs" | "technology layoffs" | "software layoffs" | "AI layoffs" | "workforce reduction" | "cloud computing" | semiconductor | startup)';
  
  const params = new URLSearchParams({
    api_token: apiToken!,
    categories: "tech",
    language: "en",
    sort: "published_at",
    limit: "10",
    search,
    search_fields: "title,description,keywords",
  });
  
  // Try with published_after
  const publishedAfter = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
  params.set("published_after", publishedAfter.toISOString().replace(/\.\d{3}Z$/, ""));

  const url = `https://api.thenewsapi.com/v1/news/all?${params}`;
  console.log("Calling URL (with token hidden):", url.replace(apiToken!, "HIDDEN"));
  
  try {
    const response = await fetchJson<any>(url);
    console.log(`Found ${response.data?.length ?? 0} raw articles.`);
    if (response.data && response.data.length > 0) {
      console.log(response.data.map((a: any) => ({ title: a.title, published_at: a.published_at })));
    } else {
      console.log(response);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
