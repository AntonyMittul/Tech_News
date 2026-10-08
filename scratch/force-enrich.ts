import { config } from "dotenv";
config({ path: ".env.local" });

import { enrichPendingArticles } from "../src/lib/ai/enrich-pending";
import { pool } from "../src/db";

async function test() {
  try {
    const result = await enrichPendingArticles(20);
    console.log("Enrichment complete:", result);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}
test();
