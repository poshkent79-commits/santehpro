import { db, withDbRetry, isSqlConfigured } from './index.ts';
import { userPurchases } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { UserPurchase } from '../types.ts';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const PURCHASES_STORE_FILE = path.join(DATA_DIR, 'purchases_store.json');

function getCachedPurchases(): UserPurchase[] {
  try {
    if (fs.existsSync(PURCHASES_STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(PURCHASES_STORE_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveCachedPurchases(purchases: UserPurchase[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PURCHASES_STORE_FILE, JSON.stringify(purchases, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

export async function getUserPurchasesByUid(userUid: string): Promise<UserPurchase[]> {
  if (!isSqlConfigured()) {
    return getCachedPurchases().filter((p) => p.userUid === userUid);
  }

  try {
    const list = await withDbRetry(async () => {
      const rows = await db
        .select()
        .from(userPurchases)
        .where(eq(userPurchases.userUid, userUid))
        .orderBy(desc(userPurchases.purchasedAt));

      return rows.map((r) => ({
        id: r.id,
        userUid: r.userUid,
        userEmail: r.userEmail,
        courseId: r.courseId,
        courseTitle: r.courseTitle,
        price: r.price,
        paymentMethod: r.paymentMethod || 'Банковская карта',
        purchasedAt: r.purchasedAt ? r.purchasedAt.toISOString() : new Date().toISOString(),
        status: (r.status as 'active' | 'completed') || 'active',
      }));
    });

    // Update cache with fresh data for this user
    try {
      const allCached = getCachedPurchases().filter((p) => p.userUid !== userUid);
      saveCachedPurchases([...allCached, ...list]);
    } catch {
      // ignore
    }

    return list;
  } catch (_error) {
    return getCachedPurchases().filter((p) => p.userUid === userUid);
  }
}

export async function checkUserCourseAccess(userUid: string, courseId: string): Promise<boolean> {
  if (!isSqlConfigured()) {
    return getCachedPurchases().some((p) => p.userUid === userUid && p.courseId === courseId);
  }

  try {
    return await withDbRetry(async () => {
      const rows = await db
        .select()
        .from(userPurchases)
        .where(and(eq(userPurchases.userUid, userUid), eq(userPurchases.courseId, courseId)));

      return rows.length > 0;
    });
  } catch (_error) {
    return getCachedPurchases().some((p) => p.userUid === userUid && p.courseId === courseId);
  }
}

export async function createDbPurchase(data: {
  userUid: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  price: string;
  paymentMethod?: string;
}): Promise<UserPurchase> {
  const id = `purch-${Date.now()}`;
  const newRecord: UserPurchase = {
    id,
    userUid: data.userUid,
    userEmail: data.userEmail,
    courseId: data.courseId,
    courseTitle: data.courseTitle,
    price: data.price,
    paymentMethod: data.paymentMethod || 'Банковская карта (Мир/Visa/Mastercard)',
    purchasedAt: new Date().toISOString(),
    status: 'active' as const,
  };

  // Always update cache immediately
  try {
    const allCached = getCachedPurchases();
    saveCachedPurchases([newRecord, ...allCached]);
  } catch {
    // ignore
  }

  if (isSqlConfigured()) {
    try {
      await withDbRetry(async () => {
        await db.insert(userPurchases).values({
          id: newRecord.id,
          userUid: newRecord.userUid,
          userEmail: newRecord.userEmail,
          courseId: newRecord.courseId,
          courseTitle: newRecord.courseTitle,
          price: newRecord.price,
          paymentMethod: newRecord.paymentMethod,
          purchasedAt: new Date(newRecord.purchasedAt),
          status: newRecord.status,
        });
      });
    } catch (_error) {
      // Gracefully saved in local cache
    }
  }

  return newRecord;
}
