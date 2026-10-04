import { db, withDbRetry, isSqlConfigured } from './index.ts';
import { masterWorks } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { MasterWork } from '../types.ts';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const MASTER_WORKS_STORE_FILE = path.join(DATA_DIR, 'master_works_store.json');

function getCachedMasterWorks(): MasterWork[] {
  try {
    if (fs.existsSync(MASTER_WORKS_STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(MASTER_WORKS_STORE_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveCachedMasterWorks(works: MasterWork[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(MASTER_WORKS_STORE_FILE, JSON.stringify(works, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

// Initial sample works
export const INITIAL_MASTER_WORKS: MasterWork[] = [];

let inMemoryMasterWorks: MasterWork[] = getCachedMasterWorks();

export async function getDbMasterWorks(params?: {
  specialistId?: string;
  status?: string;
  includeAll?: boolean;
}): Promise<MasterWork[]> {
  const filterList = (list: MasterWork[]) => {
    let res = [...list];
    if (params?.specialistId) {
      res = res.filter((w) => w.specialistId === params.specialistId);
    }
    if (!params?.includeAll) {
      if (params?.status) {
        res = res.filter((w) => w.status === params.status);
      } else {
        res = res.filter((w) => w.status === 'approved');
      }
    }
    return res;
  };

  if (!isSqlConfigured()) {
    return filterList(inMemoryMasterWorks);
  }

  try {
    return await withDbRetry(async () => {
      const query = db.select().from(masterWorks).orderBy(desc(masterWorks.createdAt));
      const rows = await query;
      if (rows && rows.length > 0) {
        const mapped: MasterWork[] = rows.map((r) => {
          let photos: string[] = [];
          try {
            photos = JSON.parse(r.photosJson || '[]');
          } catch {
            photos = [];
          }
          return {
            id: r.id,
            specialistId: r.specialistId,
            specialistName: r.specialistName || undefined,
            title: r.title,
            description: r.description,
            category: r.category || 'water',
            photos,
            completedAt: r.completedAt || undefined,
            createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
            status: (r.status as 'pending' | 'approved' | 'rejected') || 'pending',
            moderationComment: r.moderationComment || undefined,
          };
        });

        inMemoryMasterWorks = mapped;
        saveCachedMasterWorks(mapped);
        return filterList(mapped);
      }

      return filterList(inMemoryMasterWorks);
    });
  } catch (_error) {
    return filterList(inMemoryMasterWorks);
  }
}

export async function createDbMasterWork(work: MasterWork): Promise<MasterWork> {
  const photos = Array.isArray(work.photos) ? work.photos.slice(0, 15) : [];
  const newWork: MasterWork = {
    ...work,
    id: work.id || `work-${Date.now()}`,
    photos,
    status: work.status || 'pending',
    createdAt: work.createdAt || new Date().toISOString(),
  };

  inMemoryMasterWorks.unshift(newWork);
  saveCachedMasterWorks(inMemoryMasterWorks);

  if (isSqlConfigured()) {
    try {
      await withDbRetry(async () => {
        await db.insert(masterWorks).values({
          id: newWork.id,
          specialistId: newWork.specialistId,
          specialistName: newWork.specialistName || null,
          title: newWork.title,
          description: newWork.description,
          category: typeof newWork.category === 'string' ? newWork.category : 'water',
          photosJson: JSON.stringify(newWork.photos),
          completedAt: newWork.completedAt || null,
          status: newWork.status,
          moderationComment: newWork.moderationComment || null,
        });
      });
    } catch (_err) {
      // Gracefully saved in local cache
    }
  }

  return newWork;
}

export async function updateDbMasterWork(
  id: string,
  updates: Partial<MasterWork>
): Promise<MasterWork | null> {
  let updatedWork: MasterWork | null = null;

  const idx = inMemoryMasterWorks.findIndex((w) => w.id === id);
  if (idx !== -1) {
    inMemoryMasterWorks[idx] = {
      ...inMemoryMasterWorks[idx],
      ...updates,
      photos: updates.photos ? updates.photos.slice(0, 15) : inMemoryMasterWorks[idx].photos,
    };
    updatedWork = inMemoryMasterWorks[idx];
    saveCachedMasterWorks(inMemoryMasterWorks);
  }

  if (isSqlConfigured()) {
    try {
      await withDbRetry(async () => {
        const values: any = { updatedAt: new Date() };
        if (updates.title !== undefined) values.title = updates.title;
        if (updates.description !== undefined) values.description = updates.description;
        if (updates.category !== undefined) values.category = updates.category;
        if (updates.completedAt !== undefined) values.completedAt = updates.completedAt;
        if (updates.photos !== undefined) {
          values.photosJson = JSON.stringify(updates.photos.slice(0, 15));
        }
        if (updates.status !== undefined) values.status = updates.status;
        if (updates.moderationComment !== undefined) values.moderationComment = updates.moderationComment;

        await db.update(masterWorks).set(values).where(eq(masterWorks.id, id));
      });
    } catch (_err) {
      // Gracefully saved in local cache
    }
  }

  return updatedWork;
}

export async function deleteDbMasterWork(id: string): Promise<boolean> {
  inMemoryMasterWorks = inMemoryMasterWorks.filter((w) => w.id !== id);
  saveCachedMasterWorks(inMemoryMasterWorks);

  if (isSqlConfigured()) {
    try {
      await withDbRetry(async () => {
        await db.delete(masterWorks).where(eq(masterWorks.id, id));
      });
    } catch (_err) {
      // Gracefully deleted in local cache
    }
  }

  return true;
}
