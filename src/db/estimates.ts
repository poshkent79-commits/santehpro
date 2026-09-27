import { db, withDbRetry } from './index.ts';
import { savedEstimates } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export interface SavedEstimateRecord {
  id: string;
  name: string;
  summary: string;
  totalPrice: number;
  itemsJson: string;
  createdAt?: string;
}

export async function getDbSavedEstimates(): Promise<SavedEstimateRecord[]> {
  try {
    return await withDbRetry(async () => {
      const rows = await db.select().from(savedEstimates).orderBy(desc(savedEstimates.createdAt));
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        summary: r.summary,
        totalPrice: r.totalPrice,
        itemsJson: r.itemsJson,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      }));
    });
  } catch (error) {
    console.error('Database query note in getDbSavedEstimates:', error);
    return [];
  }
}

export async function createDbSavedEstimate(est: SavedEstimateRecord): Promise<SavedEstimateRecord> {
  try {
    return await withDbRetry(async () => {
      await db.insert(savedEstimates).values({
        id: est.id,
        name: est.name,
        summary: est.summary,
        totalPrice: est.totalPrice,
        itemsJson: est.itemsJson,
        createdAt: new Date(),
      });
      return est;
    });
  } catch (error) {
    console.error('Database query failed in createDbSavedEstimate:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteDbSavedEstimate(id: string): Promise<void> {
  try {
    await withDbRetry(async () => {
      await db.delete(savedEstimates).where(eq(savedEstimates.id, id));
    });
  } catch (error) {
    console.error('Database query failed in deleteDbSavedEstimate:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getDbSavedEstimateById(id: string): Promise<SavedEstimateRecord | null> {
  try {
    return await withDbRetry(async () => {
      const rows = await db.select().from(savedEstimates).where(eq(savedEstimates.id, id)).limit(1);
      if (!rows || rows.length === 0) return null;
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
  } catch (error) {
    console.error('Database query error in getDbSavedEstimateById:', error);
    return null;
  }
}

export async function updateDbSavedEstimate(
  id: string,
  updates: Partial<SavedEstimateRecord>
): Promise<SavedEstimateRecord | null> {
  try {
    return await withDbRetry(async () => {
      const existing = await db.select().from(savedEstimates).where(eq(savedEstimates.id, id)).limit(1);
      if (!existing || existing.length === 0) return null;

      const valuesToSet: Record<string, any> = {};
      if (updates.name !== undefined) valuesToSet.name = updates.name;
      if (updates.summary !== undefined) valuesToSet.summary = updates.summary;
      if (updates.totalPrice !== undefined) valuesToSet.totalPrice = updates.totalPrice;
      if (updates.itemsJson !== undefined) valuesToSet.itemsJson = updates.itemsJson;

      await db.update(savedEstimates).set(valuesToSet).where(eq(savedEstimates.id, id));

      const updated = await db.select().from(savedEstimates).where(eq(savedEstimates.id, id)).limit(1);
      if (!updated || updated.length === 0) return null;
      const r = updated[0];
      return {
        id: r.id,
        name: r.name,
        summary: r.summary,
        totalPrice: r.totalPrice,
        itemsJson: r.itemsJson,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error('Database query failed in updateDbSavedEstimate:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
