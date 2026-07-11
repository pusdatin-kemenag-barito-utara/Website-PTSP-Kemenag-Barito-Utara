import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const isProd = process.env.NODE_ENV === "production";
const createPool = () => new Pool({
  connectionString: process.env.DATABASE_URL,
  max: isProd ? 15 : 5, 
  idleTimeoutMillis: 60000, 
  connectionTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Cache the pool in development to avoid connection exhaustion during hot reload
const globalForDb = globalThis as unknown as {
  dbPool: Pool | undefined;
};

const pool = globalForDb.dbPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbPool = pool;
}

export const db = drizzle(pool, { schema });


/**
 * Helper to convert BigInt values to numbers/strings for JSON serialization
 */
export function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}
