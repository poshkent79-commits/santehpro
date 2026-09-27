import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as schema from './schema.ts';

export function ensureCloudSqlProxy(force = false) {
  const sqlHost = process.env.SQL_HOST;
  if (!sqlHost || !sqlHost.startsWith('/app/cloudsql/')) return;
  const instanceName = sqlHost.replace('/app/cloudsql/', '').trim();
  const socketPath = `${sqlHost}/.s.PGSQL.5432`;

  if (fs.existsSync('/app/cloud_sql_proxy')) {
    // 1. Terminate any proxy processes started with --impersonate-service-account
    // because GCP rejects token impersonation in this environment with 403.
    try {
      const pids = execSync('pgrep -x cloud_sql_proxy || true', { encoding: 'utf-8' }).trim();
      if (pids) {
        for (const pidStr of pids.split(/\s+/)) {
          const pid = Number(pidStr);
          if (pid && !isNaN(pid)) {
            try {
              const cmd = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8');
              if (cmd.includes('impersonate-service-account')) {
                process.kill(pid, 'SIGKILL');
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // 2. Check if a clean proxy (without impersonate) is currently active for this instance
    let isCleanRunning = false;
    if (!force) {
      try {
        const pids = execSync('pgrep -x cloud_sql_proxy || true', { encoding: 'utf-8' }).trim();
        if (pids) {
          for (const pidStr of pids.split(/\s+/)) {
            const pid = Number(pidStr);
            if (pid && !isNaN(pid)) {
              try {
                const cmd = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8');
                if (cmd.includes(instanceName) && !cmd.includes('impersonate-service-account')) {
                  isCleanRunning = true;
                  break;
                }
              } catch {
                // ignore
              }
            }
          }
        }
      } catch {
        isCleanRunning = false;
      }
    }

    // 3. If force restart requested, proxy is not running, or socket is missing/stale
    if (force || !isCleanRunning || !fs.existsSync(socketPath)) {
      if (force || !isCleanRunning) {
        try {
          const pids = execSync('pgrep -x cloud_sql_proxy || true', { encoding: 'utf-8' }).trim();
          if (pids) {
            for (const pidStr of pids.split(/\s+/)) {
              const pid = Number(pidStr);
              if (pid && !isNaN(pid)) {
                try {
                  process.kill(pid, 'SIGKILL');
                } catch {
                  // ignore
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

      try {
        if (fs.existsSync(socketPath)) {
          fs.unlinkSync(socketPath);
        }
      } catch {
        // ignore
      }

      try {
        const dir = path.dirname(socketPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      } catch {
        // ignore
      }

      try {
        const child = spawn('/app/cloud_sql_proxy', [
          instanceName,
          '--unix-socket=/app/cloudsql',
          '--sql-data',
          '--sql-data-endpoint=sqladmin.googleapis.com',
          '--sqladmin-api-endpoint=sqladmin.googleapis.com',
        ], {
          detached: true,
          stdio: 'ignore',
        });
        child.unref();
        if (child.pid) {
          fs.writeFileSync('/app/.cloud_sql_proxy.pid', String(child.pid));
        }
        // Wait for unix socket to appear
        for (let i = 0; i < 30; i++) {
          if (fs.existsSync(socketPath)) {
            try {
              Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
            } catch {
              // ignore
            }
            break;
          }
          try {
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error('Failed to auto-spawn cloud_sql_proxy:', err);
      }
    }
  }
}

// Ensure proxy is up when initializing DB
ensureCloudSqlProxy();

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool.
export const createPool = () => {
  ensureCloudSqlProxy();
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 15000,
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
