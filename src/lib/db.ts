import { Pool, type QueryResultRow } from "pg";

declare global {
  var __dbPool: Pool | undefined;
}

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000,
  });
}

export const db = global.__dbPool ?? createPool();
if (process.env.NODE_ENV !== "production") global.__dbPool = db;

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  return db.query<T>(text, values);
}
