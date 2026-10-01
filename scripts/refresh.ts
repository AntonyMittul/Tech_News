import { config } from "dotenv";

import { pool } from "../src/db";
import { runIngestion } from "../src/lib/ingestion";

config({ path: ".env.local" });
config();

const lookbackHours = Number(process.env.INGESTION_LOOKBACK_HOURS ?? "48");

runIngestion("thenewsapi", {
  limit: Number(process.env.INGESTION_LIMIT ?? "20"),
  publishedAfter: new Date(Date.now() - lookbackHours * 60 * 60 * 1000),
})
  .then((result) => console.log("Daily news refresh complete", result))
  .catch((error) => {
    console.error("Daily news refresh failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
