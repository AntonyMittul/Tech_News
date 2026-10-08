import { config } from "dotenv";
config({ path: ".env.local" });

import { refreshLiveNews } from "../src/lib/refresh";
import { pool } from "../src/db";

async function test() {
  try {
    const result = await refreshLiveNews();
    console.log("Refresh result:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Refresh error:", e);
  } finally {
    await pool.end();
  }
}
test();
