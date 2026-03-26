import { Pool, PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  // If no DB URL is provided, we throw an error. For local testing without a DB, 
  // you might want to mock this or provide a local postgres connection string.
  console.warn("WARNING: DATABASE_URL is not set. Ensure this is configured in Replit Secrets or AWS environment variables.");
}

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/chitfund",
};

export const pool = new Pool(poolConfig);

export const db = drizzle(pool, { schema });
