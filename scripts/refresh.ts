import { config } from "dotenv";

import { pool } from "../src/db";
import { refreshLiveNews } from "../src/lib/refresh";

config({ path: ".env.local" });
config();

refreshLiveNews()
  .then((result) => console.log("Daily news refresh complete", result))
  .catch((error) => {
    console.error("Daily news refresh failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
