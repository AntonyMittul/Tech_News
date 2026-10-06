import { config } from "dotenv";
import { pool } from "../src/db";
import { classifyStoredArticles } from "../src/lib/classify-articles";

config({ path: ".env.local" });
config();

async function run() {
  const count = await classifyStoredArticles();
  console.log(`Classification complete: ${count} stored articles processed.`);
}

run()
  .catch((error) => {
    console.error("Classification failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
