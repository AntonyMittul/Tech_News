import { config } from "dotenv";

import { pool } from "../src/db";
import { runIngestion } from "../src/lib/ingestion";

config({ path: ".env.local" });
config();

const lookbackHours = Number(process.env.INGESTION_LOOKBACK_HOURS ?? "48");
const publishedAfter = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
const limit = Number(process.env.INGESTION_LIMIT ?? "10");
const focusedQueries = [
  undefined,
  '(hiring | layoffs | recruiting | recruitment | "workforce reduction" | headcount | "open roles")',
  '("data science" | "data scientist" | analytics | statistics | "data platform")',
];

async function refresh() {
  for (const query of focusedQueries) {
    const result = await runIngestion("thenewsapi", { limit, query, publishedAfter });
    console.log("Refresh batch complete", { query: query ?? "general technology", ...result });
  }
}

refresh()
  .then(() => console.log("Daily news refresh complete"))
  .catch((error) => {
    console.error("Daily news refresh failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
