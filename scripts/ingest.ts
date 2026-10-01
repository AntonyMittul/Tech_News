import { config } from "dotenv";

import { pool } from "../src/db";
import { runIngestion } from "../src/lib/ingestion";
import { providerNames, type ProviderName } from "../src/lib/ingestion/types";

config({ path: ".env.local" });
config();

const provider = process.argv[2] as ProviderName | undefined;

if (!provider || !providerNames.includes(provider)) {
  console.error(`Usage: npm run ingest -- <${providerNames.join("|")}>`);
  process.exitCode = 1;
} else {
  runIngestion(provider, {
    limit: Number(process.env.INGESTION_LIMIT ?? "20"),
    feedUrl: process.env.RSS_FEED_URL,
    sourceName: process.env.RSS_SOURCE_NAME,
    sourceUrl: process.env.RSS_SOURCE_URL,
  })
    .then((result) => console.log("Ingestion complete", result))
    .catch((error) => {
      console.error("Ingestion failed", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}
