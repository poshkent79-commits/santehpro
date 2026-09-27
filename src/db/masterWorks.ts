import { db, withDbRetry } from './index.ts';
import { masterWorks } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { MasterWork } from '../types.ts';

// Initial sample works for approved masters so portfolios have realistic photos from the start
export const INITIAL_MASTER_WORKS: MasterWork[] = [
  {
    id: 'work-1',
    specialistId: 'spec-1', // Александр Ковалев (Москва, рейтинг 4.9)
    specialistName: 'Александр Ковалев',
    title: 'Монтаж коллекторного узла водоснабжения Rehau и системы защиты от протечек Neptun',
    description: 'Комплексный монтаж сантехнического узла в новостройке (ЖК «Сердце Столицы»). Установлены компенсаторы гидроударов FAR, самопромывные фильтры тонкой очистки с манометрами, коллекторы Oventrop, редукторы давления и система защиты от протечек Neptun ProW+. Разводка выполнена трубой Rehau Rautitan Stabil.',
    category: 'water',
    photos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
    ],
    completedAt: '2026-03-12',
    createdAt: '2026-03-13T10:00:00.000Z',
    status: 'approved',
  },
  {
    id: 'work-2',
    specialistId: 'spec-1',
    specialistName: 'Александр Ковалев',
    title: 'Установка и скрытый монтаж инсталляции Geberit Duofix с гигиеническим душем',
    description: 'Скрытый монтаж инсталляции для подвесного унитаза в капитальную стену. Точная выверка горизонта по лазерному уровню, шумоизоляция стояка канализации STP, подключение гигиенического душа со встроенным термостатом Grohe.',
    category: 'bath',
    photos: [
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80'
    ],
    completedAt: '2026-02-28',
    createdAt: '2026-03-01T12:00:00.000Z',
    status: 'approved',
  },
  {
    id: 'work-3',
    specialistId: 'spec-2', // Иван Петровский (СПб, рейтинг 4.8)
    specialistName: 'Иван Петровский',
    title: 'Разводка труб водоснабжения и канализации в ванной комнате под ключ',
    description: 'Штробление стен без пыли с промышленным пылесосом. Прокладка труб PEX-a с гильзами надвижного типа, вывод водорозеток строго в проектных осях, опрессовка давлением 10 бар в течение суток перед укладкой плитки.',
    category: 'water',
    photos: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80'
    ],
    completedAt: '2026-03-05',
    createdAt: '2026-03-06T15:30:00.000Z',
    status: 'approved',
  },
  {
    id: 'work-4',
    specialistId: 'spec-3', // Дмитрий Соколов (Новосибирск, рейтинг 5.0)
    specialistName: 'Дмитрий Соколов',
    title: 'Монтаж котельной и водяного теплого пола в загородном доме 220 кв.м',
    description: 'Полная обвязка газового конденсационного котла Viessmann и резервного электрического котла Protherm. Коллекторный шкаф на 9 контуров теплого пола с сервоприводами и автоматическими комнатными термостатами.',
    category: 'heating',
    photos: [
      'https://images.unsplash.com/photo-1518737083073-2287714856f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80'
    ],
    completedAt: '2026-02-20',
    createdAt: '2026-02-21T09:00:00.000Z',
    status: 'approved',
  }
];

let inMemoryMasterWorks: MasterWork[] = [...INITIAL_MASTER_WORKS];

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
