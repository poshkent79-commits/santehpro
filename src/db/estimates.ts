import { db, withDbRetry, isSqlConfigured } from './index.ts';
import { savedEstimates } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const ESTIMATES_STORE_FILE = path.join(DATA_DIR, 'saved_estimates_store.json');

export interface SavedEstimateRecord {
  id: string;
  name: string;
  summary: string;
  totalPrice: number;
  itemsJson: string;
  createdAt?: string;
}

function getCachedEstimates(): SavedEstimateRecord[] {
  try {
    if (fs.existsSync(ESTIMATES_STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(ESTIMATES_STORE_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveCachedEstimates(estimates: SavedEstimateRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ESTIMATES_STORE_FILE, JSON.stringify(estimates, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

let inMemoryEstimates: SavedEstimateRecord[] = getCachedEstimates();

export async function getDbSavedEstimates(): Promise<SavedEstimateRecord[]> {
  if (!isSqlConfigured()) {
    return inMemoryEstimates;
  }

  try {
    return await withDbRetry(async () => {
      const rows = await db.select().from(savedEstimates).orderBy(desc(savedEstimates.createdAt));
      const mapped = rows.map(r => ({
        id: r.id,
        name: r.name,
        summary: r.summary,
        totalPrice: r.totalPrice,
        itemsJson: r.itemsJson,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      }));
      inMemoryEstimates = mapped;
      saveCachedEstimates(mapped);
      return mapped;
    });
  } catch (_error) {
    return inMemoryEstimates;
  }
}

export async function createDbSavedEstimate(est: SavedEstimateRecord): Promise<SavedEstimateRecord> {
  const newEst: SavedEstimateRecord = {
    ...est,
    createdAt: est.createdAt || new Date().toISOString(),
  };

  inMemoryEstimates.unshift(newEst);
  saveCachedEstimates(inMemoryEstimates);

  if (isSqlConfigured()) {
    try {
      await withDbRetry(async () => {
        await db.insert(savedEstimates).values({
          id: newEst.id,
          name: newEst.name,
          summary: newEst.summary,
          totalPrice: newEst.totalPrice,
          itemsJson: newEst.itemsJson,
          createdAt: new Date(),
        });
      });
    } catch (_error) {
      // Gracefully preserved in local store
    }
  }

  return newEst;
}

export async function deleteDbSavedEstimate(id: string): Promise<void> {
  inMemoryEstimates = inMemoryEstimates.filter((e) => e.id !== id);
  saveCachedEstimates(inMemoryEstimates);

  if (isSqlConfigured()) {
    try {
      await withDbRetry(async () => {
        await db.delete(savedEstimates).where(eq(savedEstimates.id, id));
      });
    } catch (_error) {
      // Gracefully deleted from local store
    }
  }
}

export async function getDbSavedEstimateById(id: string): Promise<SavedEstimateRecord | null> {
  const fromMemory = inMemoryEstimates.find((e) => e.id === id);
  if (fromMemory) return fromMemory;

  if (!isSqlConfigured()) {
    return null;
  }

  try {
    return await withDbRetry(async () => {
      const rows = await db.select().from(savedEstimates).where(eq(savedEstimates.id, id));
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        summary: r.summary,
        totalPrice: r.totalPrice,
        itemsJson: r.itemsJson,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      };
    });
  } catch (_error) {
    return null;
  }
}

export async function updateDbSavedEstimate(id: string, updates: Partial<SavedEstimateRecord>): Promise<SavedEstimateRecord | null> {
  let updatedRecord: SavedEstimateRecord | null = null;

  const idx = inMemoryEstimates.findIndex((e) => e.id === id);
  if (idx !== -1) {
    inMemoryEstimates[idx] = {
      ...inMemoryEstimates[idx],
      ...updates,
    };
    updatedRecord = inMemoryEstimates[idx];
    saveCachedEstimates(inMemoryEstimates);
  }

  if (isSqlConfigured()) {
    try {
      await withDbRetry(async () => {
        const values: any = {};
        if (updates.name !== undefined) values.name = updates.name;
        if (updates.summary !== undefined) values.summary = updates.summary;
        if (updates.totalPrice !== undefined) values.totalPrice = updates.totalPrice;
        if (updates.itemsJson !== undefined) values.itemsJson = updates.itemsJson;
        await db.update(savedEstimates).set(values).where(eq(savedEstimates.id, id));
      });
    } catch (_error) {
      // Gracefully updated in local store
    }
  }

  return updatedRecord;
}
