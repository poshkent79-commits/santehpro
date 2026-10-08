import { db, withDbRetry } from './index.ts';
import { serviceRequests } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { ServiceCallRequest } from '../types.ts';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const REQUESTS_STORE_FILE = path.join(DATA_DIR, 'requests_store.json');
const PERSISTED_DIR = path.resolve(process.cwd(), 'src/data/persisted');
const PERSISTED_REQUESTS_FILE = path.join(PERSISTED_DIR, 'requests.json');

function getCachedRequests(): ServiceCallRequest[] {
  let diskList: ServiceCallRequest[] = [];
  try {
    if (fs.existsSync(REQUESTS_STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(REQUESTS_STORE_FILE, 'utf-8'));
      if (Array.isArray(data)) diskList = data;
    }
  } catch {}
  try {
    if (diskList.length === 0 && fs.existsSync(PERSISTED_REQUESTS_FILE)) {
      const pData = JSON.parse(fs.readFileSync(PERSISTED_REQUESTS_FILE, 'utf-8'));
      if (Array.isArray(pData)) diskList = pData;
    }
  } catch {}
  return diskList;
}

function saveCachedRequests(list: ServiceCallRequest[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(PERSISTED_DIR)) fs.mkdirSync(PERSISTED_DIR, { recursive: true });
    const jsonStr = JSON.stringify(list, null, 2);
    fs.writeFileSync(REQUESTS_STORE_FILE, jsonStr, 'utf-8');
    fs.writeFileSync(PERSISTED_REQUESTS_FILE, jsonStr, 'utf-8');
  } catch {}
}

let inMemoryRequests: ServiceCallRequest[] = getCachedRequests();

export async function getDbServiceRequests(): Promise<ServiceCallRequest[]> {
  try {
    return await withDbRetry(async () => {
      const rows = await db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
      const mapped = rows.map(r => ({
        id: r.id,
        clientName: r.clientName,
        clientPhone: r.clientPhone,
        city: r.city,
        address: r.address,
        problemDescription: r.problemDescription,
        category: r.category as any,
        emergency: r.emergency ?? false,
        preferredTime: r.preferredTime || undefined,
        preferredMasterId: r.preferredMasterId || undefined,
        preferredMasterName: r.preferredMasterName || undefined,
        status: r.status as any,
        adminNotes: r.adminNotes || undefined,
        userUid: r.userUid || undefined,
        clientEmail: r.clientEmail || undefined,
        rating: r.rating !== null && r.rating !== undefined ? Number(r.rating) : undefined,
        reviewComment: r.reviewComment || undefined,
        reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : undefined,
        masterReply: (r as any).masterReply || undefined,
        masterRepliedAt: (r as any).masterRepliedAt ? (r as any).masterRepliedAt.toISOString() : undefined,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      }));
      if (mapped.length > 0) {
        inMemoryRequests = mapped;
        saveCachedRequests(mapped);
      }
      return mapped.length > 0 ? mapped : inMemoryRequests;
    });
  } catch (_error) {
    return inMemoryRequests;
  }
}

export async function createDbServiceRequest(req: ServiceCallRequest): Promise<ServiceCallRequest> {
  inMemoryRequests.unshift(req);
  saveCachedRequests(inMemoryRequests);
  try {
    return await withDbRetry(async () => {
      await db.insert(serviceRequests).values({
        id: req.id,
        clientName: req.clientName,
        clientPhone: req.clientPhone,
        city: req.city,
        address: req.address || '',
        problemDescription: req.problemDescription,
        category: req.category || 'water',
        emergency: req.emergency ?? false,
        preferredTime: req.preferredTime || null,
        preferredMasterId: req.preferredMasterId || null,
        preferredMasterName: req.preferredMasterName || null,
        status: req.status || 'pending',
        adminNotes: req.adminNotes || null,
        userUid: req.userUid || null,
        clientEmail: req.clientEmail || null,
        rating: req.rating !== undefined ? req.rating : null,
        reviewComment: req.reviewComment || null,
        reviewedAt: req.reviewedAt ? new Date(req.reviewedAt) : null,
        createdAt: new Date(),
      });
      return req;
    });
  } catch (_error) {
    return req;
  }
}

export async function updateDbServiceRequest(id: string, updates: Partial<ServiceCallRequest>): Promise<void> {
  const idx = inMemoryRequests.findIndex(r => r.id === id);
  if (idx !== -1) {
    inMemoryRequests[idx] = { ...inMemoryRequests[idx], ...updates };
    saveCachedRequests(inMemoryRequests);
  }
  try {
    const values: Record<string, any> = {};
    if (updates.clientName !== undefined) values.clientName = updates.clientName;
    if (updates.clientPhone !== undefined) values.clientPhone = updates.clientPhone;
    if (updates.city !== undefined) values.city = updates.city;
    if (updates.address !== undefined) values.address = updates.address;
    if (updates.problemDescription !== undefined) values.problemDescription = updates.problemDescription;
    if (updates.category !== undefined) values.category = updates.category;
    if (updates.emergency !== undefined) values.emergency = updates.emergency;
    if (updates.preferredTime !== undefined) values.preferredTime = updates.preferredTime;
    if (updates.preferredMasterId !== undefined) values.preferredMasterId = updates.preferredMasterId;
    if (updates.preferredMasterName !== undefined) values.preferredMasterName = updates.preferredMasterName;
    if (updates.status !== undefined) values.status = updates.status;
    if (updates.adminNotes !== undefined) values.adminNotes = updates.adminNotes;
    if (updates.userUid !== undefined) values.userUid = updates.userUid;
    if (updates.clientEmail !== undefined) values.clientEmail = updates.clientEmail;
    if (updates.rating !== undefined) values.rating = updates.rating;
    if (updates.reviewComment !== undefined) values.reviewComment = updates.reviewComment;
    if (updates.masterReply !== undefined) values.masterReply = updates.masterReply;
    if (updates.masterRepliedAt !== undefined) {
      values.masterRepliedAt = updates.masterRepliedAt ? new Date(updates.masterRepliedAt) : null;
    }
    if (updates.reviewedAt !== undefined) {
      values.reviewedAt = updates.reviewedAt ? new Date(updates.reviewedAt) : null;
    }

    await db.update(serviceRequests).set(values).where(eq(serviceRequests.id, id));
  } catch (error) {
    console.warn('Database note in updateDbServiceRequest:', error);
  }
}

export async function deleteDbServiceRequest(id: string): Promise<void> {
  inMemoryRequests = inMemoryRequests.filter(r => r.id !== id);
  saveCachedRequests(inMemoryRequests);
  try {
    await db.delete(serviceRequests).where(eq(serviceRequests.id, id));
  } catch (error) {
    console.warn('Database note in deleteDbServiceRequest:', error);
  }
}
