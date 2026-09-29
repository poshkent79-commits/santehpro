import { db, withDbRetry } from './index.ts';
import { specialists, deletedSpecialists } from './schema.ts';
import { eq, desc, ne } from 'drizzle-orm';
import { PlumbingSpecialist, DeletedSpecialistRecord } from '../types.ts';
import { INITIAL_SPECIALISTS } from '../data/initialData.ts';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const SPECIALISTS_STORE_FILE = path.join(DATA_DIR, 'specialists_store.json');

export function getCachedSpecialists(): PlumbingSpecialist[] {
  try {
    if (fs.existsSync(SPECIALISTS_STORE_FILE)) {
      const data = fs.readFileSync(SPECIALISTS_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read cached specialists from disk:', err);
  }
  return INITIAL_SPECIALISTS.map((s) => ({
    ...s,
    dataConsent: true,
    consentTimestamp: '2026-01-01T00:00:00.000Z',
  }));
}

export function saveCachedSpecialists(list: PlumbingSpecialist[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SPECIALISTS_STORE_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save cached specialists to disk:', err);
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

  // If still not found, check if it exists in INITIAL_SPECIALISTS
  if (existingIdx === -1) {
    const initMatch = INITIAL_SPECIALISTS.find((s) => s.id === id);
    if (initMatch) {
      inMemorySpecialists.push({
        ...initMatch,
        dataConsent: true,
        consentTimestamp: new Date().toISOString(),
      });
      existingIdx = inMemorySpecialists.length - 1;
    } else {
      return null;
    }
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

export async function deleteDbSpecialist(id: string): Promise<DeletedSpecialistRecord | null> {
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
    deletedBy: 'Администратор',
  };

  // 2. Permanently remove from active catalog
  inMemorySpecialists = inMemorySpecialists.filter((s) => s.id !== id);

  // 3. Add to deleted archive store
  inMemoryDeletedSpecialists = inMemoryDeletedSpecialists.filter((d) => d.masterId !== id);
  inMemoryDeletedSpecialists.unshift(auditRecord);
  saveCachedSpecialists(inMemorySpecialists);

  // 4. Persist to Cloud SQL:
  // In the database, the specialist is deleted permanently, and ONLY audit info (when registered and when deleted) remains
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
        deletedBy: auditRecord.deletedBy || 'Администратор',
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
