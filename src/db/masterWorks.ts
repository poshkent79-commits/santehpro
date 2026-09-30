import { db, withDbRetry } from './index.ts';
import { masterWorks } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { MasterWork } from '../types.ts';

// Initial sample works
export const INITIAL_MASTER_WORKS: MasterWork[] = [];

let inMemoryMasterWorks: MasterWork[] = [];

export async function getDbMasterWorks(params?: {
  specialistId?: string;
  status?: string;
  includeAll?: boolean;
}): Promise<MasterWork[]> {
  try {
    return await withDbRetry(async () => {
      let query = db.select().from(masterWorks).orderBy(desc(masterWorks.createdAt));
      const rows = await query;
      if (rows && rows.length > 0) {
        let mapped: MasterWork[] = rows.map((r) => {
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

        if (params?.specialistId) {
          mapped = mapped.filter((w) => w.specialistId === params.specialistId);
        }
        if (!params?.includeAll) {
          if (params?.status) {
            mapped = mapped.filter((w) => w.status === params.status);
          } else {
            // Default to approved for public views
            mapped = mapped.filter((w) => w.status === 'approved');
          }
        }
        return mapped;
      }

      // Fallback
      let fallback = [...inMemoryMasterWorks];
      if (params?.specialistId) {
        fallback = fallback.filter((w) => w.specialistId === params.specialistId);
      }
      if (!params?.includeAll) {
        if (params?.status) {
          fallback = fallback.filter((w) => w.status === params.status);
        } else {
          fallback = fallback.filter((w) => w.status === 'approved');
        }
      }
      return fallback;
    });
  } catch (error) {
    console.error('Error in getDbMasterWorks:', error);
    let fallback = [...inMemoryMasterWorks];
    if (params?.specialistId) {
      fallback = fallback.filter((w) => w.specialistId === params.specialistId);
    }
    if (!params?.includeAll) {
      if (params?.status) {
        fallback = fallback.filter((w) => w.status === params.status);
      } else {
        fallback = fallback.filter((w) => w.status === 'approved');
      }
    }
    return fallback;
  }
}

export async function createDbMasterWork(work: MasterWork): Promise<MasterWork> {
  const photos = Array.isArray(work.photos) ? work.photos.slice(0, 15) : []; // Up to 15 photos
  const newWork: MasterWork = {
    ...work,
    id: work.id || `work-${Date.now()}`,
    photos,
    status: work.status || 'pending',
    createdAt: work.createdAt || new Date().toISOString(),
  };

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
  } catch (err) {
    console.error('Failed to insert master work into Cloud SQL:', err);
  }

  inMemoryMasterWorks.unshift(newWork);
  return newWork;
}

export async function updateDbMasterWork(
  id: string,
  updates: Partial<MasterWork>
): Promise<MasterWork | null> {
  let updatedWork: MasterWork | null = null;

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
  } catch (err) {
    console.error('Failed to update master work in Cloud SQL:', err);
  }

  const idx = inMemoryMasterWorks.findIndex((w) => w.id === id);
  if (idx !== -1) {
    inMemoryMasterWorks[idx] = {
      ...inMemoryMasterWorks[idx],
      ...updates,
      photos: updates.photos ? updates.photos.slice(0, 15) : inMemoryMasterWorks[idx].photos,
    };
    updatedWork = inMemoryMasterWorks[idx];
  }

  return updatedWork;
}

export async function deleteDbMasterWork(id: string): Promise<boolean> {
  try {
    await withDbRetry(async () => {
      await db.delete(masterWorks).where(eq(masterWorks.id, id));
    });
  } catch (err) {
    console.error('Failed to delete master work in Cloud SQL:', err);
  }

  inMemoryMasterWorks = inMemoryMasterWorks.filter((w) => w.id !== id);
  return true;
}
