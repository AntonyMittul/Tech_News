import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

const globalForDatabase = globalThis as unknown as {
  signalPool?: Pool;
};

const pool =
  globalForDatabase.signalPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.signalPool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
