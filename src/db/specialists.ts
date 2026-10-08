import { db, withDbRetry } from './index.ts';
import { specialists, deletedSpecialists } from './schema.ts';
import { eq, desc, ne } from 'drizzle-orm';
import { PlumbingSpecialist, DeletedSpecialistRecord } from '../types.ts';
import { INITIAL_SPECIALISTS } from '../data/initialData.ts';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const SPECIALISTS_STORE_FILE = path.join(DATA_DIR, 'specialists_store.json');
const SPECIALISTS_BACKUP_FILE = path.join(DATA_DIR, 'specialists_store.backup.json');
const PERSISTED_DIR = path.resolve(process.cwd(), 'src/data/persisted');
const PERSISTED_STORE_FILE = path.join(PERSISTED_DIR, 'specialists.json');
const DELETED_SPECIALISTS_FILE = path.join(DATA_DIR, 'deleted_specialists.json');
const PERSISTED_DELETED_FILE = path.join(PERSISTED_DIR, 'deleted_specialists.json');

function loadDeletedSpecialistsSync(): DeletedSpecialistRecord[] {
  try {
    if (fs.existsSync(DELETED_SPECIALISTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(DELETED_SPECIALISTS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
    if (fs.existsSync(PERSISTED_DELETED_FILE)) {
      const data = JSON.parse(fs.readFileSync(PERSISTED_DELETED_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}

function persistDeletedSpecialistsSync(records: DeletedSpecialistRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(PERSISTED_DIR)) fs.mkdirSync(PERSISTED_DIR, { recursive: true });
    const jsonStr = JSON.stringify(records, null, 2);
    fs.writeFileSync(DELETED_SPECIALISTS_FILE, jsonStr, 'utf-8');
    fs.writeFileSync(PERSISTED_DELETED_FILE, jsonStr, 'utf-8');
  } catch {}
}

export function getCachedSpecialists(): PlumbingSpecialist[] {
  let diskList: PlumbingSpecialist[] = [];
  let persistedList: PlumbingSpecialist[] = [];
  const deletedRecords = loadDeletedSpecialistsSync();
  const deletedIds = new Set(deletedRecords.map((r) => r.masterId));

  try {
    // 1. Try main .data store file
    if (fs.existsSync(SPECIALISTS_STORE_FILE)) {
      const data = fs.readFileSync(SPECIALISTS_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        diskList = parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read .data cached specialists:', err);
  }

  try {
    // 2. Try committed persistent store (src/data/persisted/specialists.json)
    if (fs.existsSync(PERSISTED_STORE_FILE)) {
      const pData = fs.readFileSync(PERSISTED_STORE_FILE, 'utf-8');
      const pParsed = JSON.parse(pData);
      if (Array.isArray(pParsed)) {
        persistedList = pParsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read persisted specialists store:', err);
  }

  // Merge lists to ensure valid specialists are kept, excluding any deleted ones
  const map = new Map<string, PlumbingSpecialist>();
  for (const s of INITIAL_SPECIALISTS) {
    if (s && s.id && !deletedIds.has(s.id)) map.set(s.id, s);
  }
  for (const s of persistedList) {
    if (s && s.id && !deletedIds.has(s.id)) map.set(s.id, s);
  }
  for (const s of diskList) {
    if (s && s.id && !deletedIds.has(s.id)) map.set(s.id, s);
  }

  const merged = Array.from(map.values()).filter((s) => !deletedIds.has(s.id));
  return merged;
}

export function saveCachedSpecialists(list: PlumbingSpecialist[], allowWipe = false): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
    if (!fs.existsSync(PERSISTED_DIR)) {
      fs.mkdirSync(PERSISTED_DIR, { recursive: true });
    }

    // Safety guard: NEVER overwrite non-empty store with empty array unless explicitly requested!
    if (!allowWipe && (!list || list.length === 0)) {
      const existing = getCachedSpecialists();
      if (existing.length > 0) {
        console.warn(`[Safety Guard] Prevented wiping ${existing.length} specialists with empty array!`);
        return;
      }
    }

    const jsonStr = JSON.stringify(list, null, 2);

    // Save main .data file
    fs.writeFileSync(SPECIALISTS_STORE_FILE, jsonStr, 'utf-8');

    // Save safety mirror backup
    fs.writeFileSync(SPECIALISTS_BACKUP_FILE, jsonStr, 'utf-8');

    // Save tracked persisted store file (survives all app updates and restarts)
    fs.writeFileSync(PERSISTED_STORE_FILE, jsonStr, 'utf-8');
  } catch (err) {
    console.error('Failed to save cached specialists to disk:', err);
  }
}

export async function clearAllDbSpecialists(): Promise<void> {
  inMemorySpecialists = [];
  try {
    if (fs.existsSync(DATA_DIR)) {
      fs.writeFileSync(SPECIALISTS_STORE_FILE, '[]', 'utf-8');
      fs.writeFileSync(SPECIALISTS_BACKUP_FILE, '[]', 'utf-8');
    }
    if (fs.existsSync(BACKUPS_DIR)) {
      const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.startsWith('specialists_'));
      for (const f of files) {
        try { fs.unlinkSync(path.join(BACKUPS_DIR, f)); } catch {}
      }
    }
  } catch (err) {
    console.error('Failed to clear specialists store:', err);
  }
}

// In-memory cache & fallback store initialized with persistent disk specialist catalog
let inMemorySpecialists: PlumbingSpecialist[] = getCachedSpecialists();

// In-memory store for permanently deleted specialists (audit trail)
let inMemoryDeletedSpecialists: DeletedSpecialistRecord[] = [];

export async function getDbSpecialists(): Promise<PlumbingSpecialist[]> {
  try {
    return await withDbRetry(async () => {
      const rows = await db.select().from(specialists).where(ne(specialists.status, 'deleted')).orderBy(desc(specialists.createdAt));
      if (rows && rows.length > 0) {
        const mapped: PlumbingSpecialist[] = rows
          .filter((r) => r.status !== 'deleted')
          .map((r) => {
            let services: string[] = [];
            try {
              services = JSON.parse(r.servicesJson || '[]');
            } catch {
              services = ['Установка сантехники'];
            }

            let legalChecklist: Record<string, boolean> | undefined;
            if (r.legalChecklistJson) {
              try {
                legalChecklist = JSON.parse(r.legalChecklistJson);
              } catch {
                legalChecklist = undefined;
              }
            }

            let verificationDocs: any[] | undefined;
            if (r.verificationDocsJson) {
              try {
                verificationDocs = JSON.parse(r.verificationDocsJson);
              } catch {
                verificationDocs = undefined;
              }
            }

            return {
              id: r.id,
              name: r.name,
              photo: r.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
              city: r.city,
              experienceYears: r.experienceYears ?? 1,
              rating: Number(r.rating) || 5.0,
              reviewsCount: r.reviewsCount ?? 0,
              phone: r.phone,
              telegram: r.telegram || undefined,
              whatsapp: r.whatsapp || undefined,
              services,
              minPrice: r.minPrice ?? 1000,
              emergency247: r.emergency247 ?? false,
              verified: r.verified ?? false,
              badge: r.badge || undefined,
              bio: r.bio || '',
              status: (r.status as any) || 'pending',
              appliedAt: r.appliedAt || (r.createdAt ? r.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
              dataConsent: r.dataConsent ?? true,
              consentTimestamp: r.consentTimestamp ? r.consentTimestamp.toISOString() : undefined,
              deletedAt: r.deletedAt ? r.deletedAt.toISOString() : undefined,
              legalConsent: r.legalConsent ?? true,
              legalConsentTimestamp: r.legalConsentTimestamp ? r.legalConsentTimestamp.toISOString() : undefined,
              legalChecklist,
              legalChecklistJson: r.legalChecklistJson || undefined,
              verificationDocs,
              verificationDocsJson: r.verificationDocsJson || undefined,
              userUid: r.userUid || undefined,
              email: r.email || undefined,
              rejectionReason: r.rejectionReason || undefined,
              moderationComment: r.moderationComment || undefined,
              moderatedAt: r.moderatedAt ? r.moderatedAt.toISOString() : undefined,
              moderatedBy: r.moderatedBy || undefined,
            };
          });
        inMemorySpecialists = mapped;
        return mapped;
      }
      return inMemorySpecialists.filter((s) => s.status !== 'deleted');
    });
  } catch (_error) {
    // Graceful fallback to cached store
    return inMemorySpecialists.filter((s) => s.status !== 'deleted');
  }
}

export async function createDbSpecialist(spec: PlumbingSpecialist): Promise<PlumbingSpecialist> {
  const specWithConsent: PlumbingSpecialist = {
    ...spec,
    dataConsent: spec.dataConsent ?? true,
    consentTimestamp: spec.consentTimestamp || new Date().toISOString(),
    legalConsent: spec.legalConsent ?? true,
    legalConsentTimestamp: spec.legalConsentTimestamp || new Date().toISOString(),
    legalChecklistJson: spec.legalChecklistJson || (spec.legalChecklist ? JSON.stringify(spec.legalChecklist) : undefined),
    verificationDocsJson: spec.verificationDocsJson || (spec.verificationDocs ? JSON.stringify(spec.verificationDocs) : undefined),
  };

  // Update in-memory store
  const existingIdx = inMemorySpecialists.findIndex((s) => s.id === spec.id);
  if (existingIdx >= 0) {
    inMemorySpecialists[existingIdx] = specWithConsent;
  } else {
    inMemorySpecialists.unshift(specWithConsent);
  }

  try {
    await withDbRetry(async () => {
      const existingDb = await db.select().from(specialists).where(eq(specialists.id, specWithConsent.id)).limit(1);
      if (existingDb && existingDb.length > 0) {
        await db.update(specialists).set({
          name: specWithConsent.name,
          photo: specWithConsent.photo,
          city: specWithConsent.city,
          experienceYears: specWithConsent.experienceYears,
          rating: String(specWithConsent.rating),
          reviewsCount: specWithConsent.reviewsCount,
          phone: specWithConsent.phone,
          telegram: specWithConsent.telegram || null,
          whatsapp: specWithConsent.whatsapp || null,
          servicesJson: JSON.stringify(specWithConsent.services || []),
          minPrice: specWithConsent.minPrice,
          emergency247: specWithConsent.emergency247,
          verified: specWithConsent.verified,
          badge: specWithConsent.badge || null,
          bio: specWithConsent.bio || '',
          status: specWithConsent.status,
          appliedAt: specWithConsent.appliedAt,
          dataConsent: specWithConsent.dataConsent ?? true,
          consentTimestamp: specWithConsent.consentTimestamp ? new Date(specWithConsent.consentTimestamp) : new Date(),
          legalConsent: specWithConsent.legalConsent ?? true,
          legalConsentTimestamp: specWithConsent.legalConsentTimestamp ? new Date(specWithConsent.legalConsentTimestamp) : new Date(),
          legalChecklistJson: specWithConsent.legalChecklistJson || null,
          verificationDocsJson: specWithConsent.verificationDocsJson || null,
          userUid: specWithConsent.userUid || null,
          email: specWithConsent.email || null,
          rejectionReason: specWithConsent.rejectionReason || null,
          moderationComment: specWithConsent.moderationComment || null,
          moderatedAt: specWithConsent.moderatedAt ? new Date(specWithConsent.moderatedAt) : null,
          moderatedBy: specWithConsent.moderatedBy || null,
        }).where(eq(specialists.id, specWithConsent.id));
      } else {
        await db.insert(specialists).values({
          id: specWithConsent.id,
          name: specWithConsent.name,
          photo: specWithConsent.photo,
          city: specWithConsent.city,
          experienceYears: specWithConsent.experienceYears,
          rating: String(specWithConsent.rating),
          reviewsCount: specWithConsent.reviewsCount,
          phone: specWithConsent.phone,
          telegram: specWithConsent.telegram || null,
          whatsapp: specWithConsent.whatsapp || null,
          servicesJson: JSON.stringify(specWithConsent.services || []),
          minPrice: specWithConsent.minPrice,
          emergency247: specWithConsent.emergency247,
          verified: specWithConsent.verified,
          badge: specWithConsent.badge || null,
          bio: specWithConsent.bio || '',
          status: specWithConsent.status,
          appliedAt: specWithConsent.appliedAt,
          dataConsent: specWithConsent.dataConsent ?? true,
          consentTimestamp: specWithConsent.consentTimestamp ? new Date(specWithConsent.consentTimestamp) : new Date(),
          legalConsent: specWithConsent.legalConsent ?? true,
          legalConsentTimestamp: specWithConsent.legalConsentTimestamp ? new Date(specWithConsent.legalConsentTimestamp) : new Date(),
          legalChecklistJson: specWithConsent.legalChecklistJson || null,
          verificationDocsJson: specWithConsent.verificationDocsJson || null,
          userUid: specWithConsent.userUid || null,
          email: specWithConsent.email || null,
          rejectionReason: specWithConsent.rejectionReason || null,
          moderationComment: specWithConsent.moderationComment || null,
          moderatedAt: specWithConsent.moderatedAt ? new Date(specWithConsent.moderatedAt) : null,
          moderatedBy: specWithConsent.moderatedBy || null,
          createdAt: new Date(),
        });
      }
    });
  } catch (error) {
    console.error('DB error in createDbSpecialist:', error);
  }

  saveCachedSpecialists(inMemorySpecialists);
  return specWithConsent;
}

export async function updateDbSpecialist(id: string, updates: Partial<PlumbingSpecialist>): Promise<PlumbingSpecialist | null> {
  // 1. Try finding in memory first
  let existingIdx = inMemorySpecialists.findIndex((s) => s.id === id);

  // If not found in memory, try loading directly from DB
  if (existingIdx === -1) {
    try {
      const dbRows = await withDbRetry(async () => {
        return await db.select().from(specialists).where(eq(specialists.id, id)).limit(1);
      });
      if (dbRows && dbRows.length > 0) {
        const r = dbRows[0];
        let services: string[] = [];
        try { services = JSON.parse(r.servicesJson || '[]'); } catch { services = ['Установка сантехники']; }
        const loadedSpec: PlumbingSpecialist = {
          id: r.id,
          name: r.name,
          photo: r.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
          city: r.city,
          experienceYears: r.experienceYears ?? 1,
          rating: Number(r.rating) || 5.0,
          reviewsCount: r.reviewsCount ?? 0,
          phone: r.phone,
          telegram: r.telegram || undefined,
          whatsapp: r.whatsapp || undefined,
          services,
          minPrice: r.minPrice ?? 1000,
          emergency247: r.emergency247 ?? false,
          verified: r.verified ?? false,
          badge: r.badge || undefined,
          bio: r.bio || '',
          status: (r.status as any) || 'pending',
          appliedAt: r.appliedAt || undefined,
          dataConsent: r.dataConsent ?? true,
          consentTimestamp: r.consentTimestamp ? r.consentTimestamp.toISOString() : undefined,
          legalConsent: r.legalConsent ?? true,
          legalConsentTimestamp: r.legalConsentTimestamp ? r.legalConsentTimestamp.toISOString() : undefined,
          legalChecklistJson: r.legalChecklistJson || undefined,
          verificationDocsJson: r.verificationDocsJson || undefined,
        };
        inMemorySpecialists.push(loadedSpec);
        existingIdx = inMemorySpecialists.length - 1;
      }
    } catch (e) {
      console.error('Error fetching specialist from DB for update:', e);
    }
  }

  // If still not found
  if (existingIdx === -1) {
    return null;
  }

  const updated: PlumbingSpecialist = {
    ...inMemorySpecialists[existingIdx],
    ...updates,
  };
  inMemorySpecialists[existingIdx] = updated;

  try {
    await withDbRetry(async () => {
      const values: Record<string, any> = {};
      if (updates.name !== undefined) values.name = updates.name;
      if (updates.photo !== undefined) values.photo = updates.photo;
      if (updates.city !== undefined) values.city = updates.city;
      if (updates.experienceYears !== undefined) values.experienceYears = updates.experienceYears;
      if (updates.rating !== undefined) values.rating = String(updates.rating);
      if (updates.reviewsCount !== undefined) values.reviewsCount = updates.reviewsCount;
      if (updates.phone !== undefined) values.phone = updates.phone;
      if (updates.telegram !== undefined) values.telegram = updates.telegram;
      if (updates.whatsapp !== undefined) values.whatsapp = updates.whatsapp;
      if (updates.services !== undefined) values.servicesJson = JSON.stringify(updates.services);
      if (updates.minPrice !== undefined) values.minPrice = updates.minPrice;
      if (updates.emergency247 !== undefined) values.emergency247 = updates.emergency247;
      if (updates.verified !== undefined) values.verified = updates.verified;
      if (updates.badge !== undefined) values.badge = updates.badge;
      if (updates.bio !== undefined) values.bio = updates.bio;
      if (updates.status !== undefined) values.status = updates.status;
      if (updates.dataConsent !== undefined) values.dataConsent = updates.dataConsent;
      if (updates.legalConsent !== undefined) values.legalConsent = updates.legalConsent;
      if (updates.legalChecklistJson !== undefined) values.legalChecklistJson = updates.legalChecklistJson;
      if (updates.verificationDocsJson !== undefined) values.verificationDocsJson = updates.verificationDocsJson;
      if (updates.userUid !== undefined) values.userUid = updates.userUid;
      if (updates.email !== undefined) values.email = updates.email;
      if (updates.rejectionReason !== undefined) values.rejectionReason = updates.rejectionReason;
      if (updates.moderationComment !== undefined) values.moderationComment = updates.moderationComment;
      if (updates.moderatedAt !== undefined) values.moderatedAt = updates.moderatedAt ? new Date(updates.moderatedAt) : null;
      if (updates.moderatedBy !== undefined) values.moderatedBy = updates.moderatedBy;

      const existingRow = await db.select().from(specialists).where(eq(specialists.id, id)).limit(1);
      if (existingRow && existingRow.length > 0) {
        await db.update(specialists).set(values).where(eq(specialists.id, id));
      } else {
        await db.insert(specialists).values({
          id: updated.id,
          name: updated.name,
          photo: updated.photo,
          city: updated.city,
          experienceYears: updated.experienceYears,
          rating: String(updated.rating),
          reviewsCount: updated.reviewsCount,
          phone: updated.phone,
          telegram: updated.telegram || null,
          whatsapp: updated.whatsapp || null,
          servicesJson: JSON.stringify(updated.services || []),
          minPrice: updated.minPrice,
          emergency247: updated.emergency247,
          verified: updated.verified,
          badge: updated.badge || null,
          bio: updated.bio || '',
          status: updated.status,
          appliedAt: updated.appliedAt,
          dataConsent: updated.dataConsent ?? true,
          consentTimestamp: updated.consentTimestamp ? new Date(updated.consentTimestamp) : new Date(),
          legalConsent: updated.legalConsent ?? true,
          legalConsentTimestamp: updated.legalConsentTimestamp ? new Date(updated.legalConsentTimestamp) : new Date(),
          legalChecklistJson: updated.legalChecklistJson || null,
          verificationDocsJson: updated.verificationDocsJson || null,
          userUid: updated.userUid || null,
          email: updated.email || null,
          rejectionReason: updated.rejectionReason || null,
          moderationComment: updated.moderationComment || null,
          moderatedAt: updated.moderatedAt ? new Date(updated.moderatedAt) : null,
          moderatedBy: updated.moderatedBy || null,
          createdAt: new Date(),
        });
      }
    });
  } catch (error) {
    console.error('DB update error in updateDbSpecialist:', error);
  }

  saveCachedSpecialists(inMemorySpecialists);
  return updated;
}

export async function deleteDbSpecialist(id: string, reason = 'Пользователь'): Promise<DeletedSpecialistRecord | null> {
  const now = new Date();
  const deletedAtIso = now.toISOString();

  let masterName = 'Мастер';
  let masterCity = 'Не указан';
  let registeredAtDate = now;
  let appliedAtStr: string | undefined = undefined;

  // 1. Check existing record from DB first to get authentic registration date and name
  try {
    const existingRows = await withDbRetry(async () => {
      return await db.select().from(specialists).where(eq(specialists.id, id)).limit(1);
    });
    if (existingRows && existingRows.length > 0) {
      const row = existingRows[0];
      masterName = row.name || masterName;
      masterCity = row.city || masterCity;
      if (row.createdAt) {
        registeredAtDate = row.createdAt;
      } else if (row.consentTimestamp) {
        registeredAtDate = row.consentTimestamp;
      }
      appliedAtStr = row.appliedAt || undefined;
    }
  } catch (err) {
    // Check fallback in memory
  }

  // Fallback to in-memory specialist if DB row wasn't present
  const mem = inMemorySpecialists.find((s) => s.id === id);
  if (mem) {
    if (masterName === 'Мастер' && mem.name) masterName = mem.name;
    if (masterCity === 'Не указан' && mem.city) masterCity = mem.city;
    if (mem.consentTimestamp) {
      registeredAtDate = new Date(mem.consentTimestamp);
    } else if (mem.appliedAt) {
      appliedAtStr = mem.appliedAt;
    }
  }

  const auditRecord: DeletedSpecialistRecord = {
    id: `del-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    masterId: id,
    name: masterName,
    city: masterCity,
    registeredAt: registeredAtDate.toISOString(),
    appliedAt: appliedAtStr,
    deletedAt: deletedAtIso,
    deletedBy: reason,
  };

  // 2. Permanently remove from active catalog
  inMemorySpecialists = inMemorySpecialists.filter((s) => s.id !== id);

  // 3. Add to deleted archive store and persist to local TimWeb server
  inMemoryDeletedSpecialists = inMemoryDeletedSpecialists.filter((d) => d.masterId !== id);
  inMemoryDeletedSpecialists.unshift(auditRecord);
  persistDeletedSpecialistsSync(inMemoryDeletedSpecialists);
  saveCachedSpecialists(inMemorySpecialists, true);

  // 4. Persist to Cloud SQL / local DB:
  try {
    await withDbRetry(async () => {
      // Insert audit record into deleted_specialists
      await db.insert(deletedSpecialists).values({
        id: auditRecord.id,
        masterId: auditRecord.masterId,
        name: auditRecord.name,
        city: auditRecord.city || null,
        registeredAt: registeredAtDate,
        appliedAt: auditRecord.appliedAt || null,
        deletedAt: now,
        deletedBy: auditRecord.deletedBy || reason,
      }).onConflictDoNothing();

      // Delete permanently from specialists table so profile is gone forever
      await db.delete(specialists).where(eq(specialists.id, id));
    });
  } catch (error) {
    console.warn('DB note in deleteDbSpecialist:', (error as any)?.message || error);
  }

  return auditRecord;
}

export async function getDbDeletedSpecialists(): Promise<DeletedSpecialistRecord[]> {
  try {
    return await withDbRetry(async () => {
      const rows = await db.select().from(deletedSpecialists).orderBy(desc(deletedSpecialists.deletedAt));
      if (rows && rows.length > 0) {
        const mapped: DeletedSpecialistRecord[] = rows.map((r) => ({
          id: r.id,
          masterId: r.masterId,
          name: r.name,
          city: r.city || undefined,
          registeredAt: r.registeredAt ? r.registeredAt.toISOString() : undefined,
          appliedAt: r.appliedAt || undefined,
          deletedAt: r.deletedAt ? r.deletedAt.toISOString() : new Date().toISOString(),
          deletedBy: r.deletedBy || 'Администратор',
        }));
        inMemoryDeletedSpecialists = mapped;
        return mapped;
      }
      return inMemoryDeletedSpecialists;
    });
  } catch (error) {
    return inMemoryDeletedSpecialists;
  }
}
