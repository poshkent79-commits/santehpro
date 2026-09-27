import { db, withDbRetry } from './index.ts';
import { userFavorites } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { UserFavorite } from '../types.ts';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const FAVORITES_STORE_FILE = path.join(DATA_DIR, 'favorites_store.json');

function getCachedFavorites(): UserFavorite[] {
  try {
    if (fs.existsSync(FAVORITES_STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(FAVORITES_STORE_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveCachedFavorites(favorites: UserFavorite[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FAVORITES_STORE_FILE, JSON.stringify(favorites, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

export async function getUserFavoritesByUid(userUid: string): Promise<UserFavorite[]> {
  try {
    const list = await withDbRetry(async () => {
      const rows = await db
        .select()
        .from(userFavorites)
        .where(eq(userFavorites.userUid, userUid))
        .orderBy(desc(userFavorites.createdAt));

      return rows.map((r) => ({
        id: r.id,
        userUid: r.userUid,
        articleId: r.articleId,
        articleTitle: r.articleTitle,
        category: r.category || undefined,
        coverImage: r.coverImage || undefined,
        type: r.type || undefined,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      }));
    });

    // Update cache
    try {
      const otherCached = getCachedFavorites().filter((f) => f.userUid !== userUid);
      saveCachedFavorites([...otherCached, ...list]);
    } catch {
      // ignore
    }

    return list;
  } catch (error) {
    console.warn('Database note in getUserFavoritesByUid, serving local cache:', (error as any)?.message || error);
    return getCachedFavorites().filter((f) => f.userUid === userUid);
  }
}

export async function toggleUserFavorite(data: {
  userUid: string;
  articleId: string;
  articleTitle: string;
  category?: string;
  coverImage?: string;
  type?: string;
}): Promise<{ added: boolean; id?: string }> {
  let isAdded = false;
  let newId: string | undefined;

  // Update local cache immediately
  try {
    const current = getCachedFavorites();
    const existingIndex = current.findIndex((f) => f.userUid === data.userUid && f.articleId === data.articleId);
    if (existingIndex >= 0) {
      current.splice(existingIndex, 1);
      isAdded = false;
    } else {
      newId = `fav-${Date.now()}`;
      current.unshift({
        id: newId,
        userUid: data.userUid,
        articleId: data.articleId,
        articleTitle: data.articleTitle,
        category: data.category,
        coverImage: data.coverImage,
        type: data.type,
        createdAt: new Date().toISOString(),
      });
      isAdded = true;
    }
    saveCachedFavorites(current);
  } catch {
    // ignore
  }

  try {
    return await withDbRetry(async () => {
      const existing = await db
        .select()
        .from(userFavorites)
        .where(and(eq(userFavorites.userUid, data.userUid), eq(userFavorites.articleId, data.articleId)));

      if (existing.length > 0) {
        await db.delete(userFavorites).where(eq(userFavorites.id, existing[0].id));
        return { added: false };
      } else {
        const id = newId || `fav-${Date.now()}`;
        await db.insert(userFavorites).values({
          id,
          userUid: data.userUid,
          articleId: data.articleId,
          articleTitle: data.articleTitle,
          category: data.category || null,
          coverImage: data.coverImage || null,
          type: data.type || null,
          createdAt: new Date(),
        });
        return { added: true, id };
      }
    });
  } catch (error) {
    console.warn('Could not sync favorite to Cloud SQL immediately, cached locally:', (error as any)?.message || error);
    return { added: isAdded, id: newId };
  }
}

export async function deleteUserFavorite(userUid: string, articleId: string): Promise<void> {
  // Update local cache
  try {
    const current = getCachedFavorites().filter((f) => !(f.userUid === userUid && f.articleId === articleId));
    saveCachedFavorites(current);
  } catch {
    // ignore
  }

  try {
    await withDbRetry(async () => {
      await db
        .delete(userFavorites)
        .where(and(eq(userFavorites.userUid, userUid), eq(userFavorites.articleId, articleId)));
    });
  } catch (error) {
    console.warn('Could not delete favorite from Cloud SQL immediately, deleted from local cache:', (error as any)?.message || error);
  }
}
