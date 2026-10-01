import "server-only";

import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool?: Pool };

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return new Pool({ connectionString, max: 10 });
}

export const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}
