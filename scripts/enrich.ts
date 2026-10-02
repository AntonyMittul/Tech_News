import { config } from "dotenv";
import { pool } from "../src/db";
import { enrichPendingArticles } from "../src/lib/ai/enrich-pending";

config({ path: ".env.local" });
config();

async function enrichPending() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured. Add a real key to .env.local before running npm run enrich.");
  }

  console.log("Enrichment complete", await enrichPendingArticles(Number(process.env.ENRICHMENT_LIMIT ?? "5")));
}

enrichPending()
  .catch((error) => {
    console.error("Enrichment failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
