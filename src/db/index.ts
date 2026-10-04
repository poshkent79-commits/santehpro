import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as schema from './schema.ts';

// Cloud SQL is completely detached. Using local persistent disk & JSON database on Timeweb.
export function ensureCloudSqlProxy(_force = false) {
  // No-op: Cloud SQL proxy is detached
  return;
}

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Check if SQL database connection is actually configured and available
export function isSqlConfigured(): boolean {
  const sqlHost = process.env.SQL_HOST;
  if (!sqlHost || sqlHost.startsWith('/app/cloudsql/')) {
    return false;
  }
  return Boolean(process.env.SQL_USER && process.env.SQL_PASSWORD && process.env.SQL_DB_NAME);
}

// Function to create or retrieve the connection pool.
export const createPool = () => {
  if (!isSqlConfigured()) {
    // Return a dummy pool that immediately rejects without logging
    return new Pool({
      host: '127.0.0.1',
      port: 54329,
      max: 1,
      connectionTimeoutMillis: 10,
    });
  }

  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 3000,
      allowExitOnIdle: true,
    });

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      // Gracefully handle expected idle proxy disconnects in sandbox
      const code = (err as any)?.code || (err as any)?.cause?.code;
      const msg = err?.message || String(err);
      if (
        code === 'ECONNRESET' ||
        code === 'ECONNREFUSED' ||
        msg.includes('ECONNRESET') ||
        msg.includes('ECONNREFUSED')
      ) {
        return;
      }
      console.warn('SQL pool connection note:', err.message || err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });

/**
 * Executes a database operation with automatic retry on transient connection resets (ECONNRESET)
 * or connection refusals (ECONNREFUSED).
 */
export async function withDbRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
  if (!isSqlConfigured()) {
    throw new Error('SQL_NOT_CONFIGURED');
  }
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const causeMsg = (err as any)?.cause?.message || String((err as any)?.cause || '');
      const errCode = (err as any)?.code || (err as any)?.cause?.code;
      const isConnError =
        errCode === 'ECONNRESET' ||
        errCode === 'ECONNREFUSED' ||
        errCode === '57P01' ||
        errMsg.includes('ECONNRESET') ||
        errMsg.includes('ECONNREFUSED') ||
        errMsg.includes('57P01') ||
        errMsg.includes('connection terminated') ||
        errMsg.includes('Connection terminated') ||
        errMsg.includes('socket hang up') ||
        errMsg.includes('closed') ||
        causeMsg.includes('ECONNRESET') ||
        causeMsg.includes('ECONNREFUSED') ||
        causeMsg.includes('57P01') ||
        causeMsg.includes('connection terminated');

      if (isConnError && attempt < maxRetries) {
        // Force restart the proxy and recreate socket if connection was broken/refused
        ensureCloudSqlProxy(true);
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
