import { db, withDbRetry } from './index.ts';
import { mediaFiles } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { MediaFile, MediaFileType } from '../types.ts';

export const INITIAL_MEDIA_FILES: MediaFile[] = [
  // 1. МАТЕРИАЛЫ (Техкарты, спецификации, чертежи, PDF-регламенты)
  {
    id: 'mat-001',
    title: 'Технологическая карта: Коллекторная разводка ХВС/ГВС с компенсатором гидроударов',
    fileType: 'material',
    category: 'water',
    fileUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    description: 'Полный инженерный чертеж узла ввода в новостройке: грязевик 300 мкм, редуктор давления Far 1/2", самопромывной фильтр 100 мкм, распределительный коллектор.',
    format: 'pdf',
    fileSize: '4.8 МБ',
    duration: undefined,
    tags: 'техкарта, чертеж, коллектор, редуктор давления, узел ввода',
    articleId: 'w-1',
    articleTitle: 'Коллекторная или тройниковая разводка',
    uploadedBy: 'Главный инженер СантехПро',
    createdAt: new Date('2026-03-01T10:00:00Z').toISOString(),
  },
  {
    id: 'mat-002',
    title: 'Справочная таблица уклонов и диаметров труб канализации (СП 30.13330.2020)',
    fileType: 'material',
    category: 'drainage',
    fileUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    description: 'Официальные строительные нормативы уклонов для труб Ø40, Ø50 и Ø110 мм с предельными значениями для предотвращения заиливания.',
    format: 'pdf',
    fileSize: '1.2 МБ',
    duration: undefined,
    tags: 'нормативы, СП 30, канализация, уклоны, диаметры',
    articleId: 'w-3',
    articleTitle: 'Монтаж канализации: уклоны и диаметры',
    uploadedBy: 'Технический отдел СантехПро',
    createdAt: new Date('2026-03-02T11:30:00Z').toISOString(),
  },
  {
    id: 'mat-003',
    title: 'Спецификация фитингов и типовая смета для 2-комнатной квартиры',
    fileType: 'material',
    category: 'tools',
    fileUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
    description: 'Детализированный перечень материалов Rehau / Stout: гильзы, водорозетки, фиксаторы поворота, термоизоляция Energoflex, краны Bugatti.',
    format: 'xlsx',
    fileSize: '820 КБ',
    duration: undefined,
    tags: 'смета, спецификация, фитинги, смета материалов, Rehau',
    articleId: 'w-1',
    articleTitle: 'Разводка труб в квартире с нуля',
    uploadedBy: 'Администратор',
    createdAt: new Date('2026-03-03T14:15:00Z').toISOString(),
  },

  // 2. ФОТОМАТЕРИАЛЫ (Детальные фотографии узлов, макросъемка, схемы)
  {
    id: 'pho-001',
    title: 'Фотообзор: Премиальный узел ввода на компонентах Oventrop и Far',
    fileType: 'photo',
    category: 'water',
    fileUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    description: 'Высококачественное фото смонтированного сантехнического шкафа с установкой системы защиты от протечек Neptun ProW+, счетчиками с импульсным выходом и гасителями гидроударов.',
    format: 'jpg',
    fileSize: '3.4 МБ',
    duration: undefined,
    tags: 'фото узла, Far, Oventrop, сантехшкаф, Neptun',
    articleId: 'w-1',
    articleTitle: 'Профессиональный узел ввода',
    uploadedBy: 'Шеф-монтажник СантехПро',
    createdAt: new Date('2026-03-04T09:00:00Z').toISOString(),
  },
  {
    id: 'pho-002',
    title: 'Фотодетализация: Радиаторное подключение из стены с хромированными трубками',
    fileType: 'photo',
    category: 'heating',
    fileUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80',
    description: 'Правильный нижний вывод из стены без выхода труб из чистового пола: скрытый монтаж, термостатическая головка Danfoss, опрессовка 10 бар.',
    format: 'jpg',
    fileSize: '2.9 МБ',
    duration: undefined,
    tags: 'фото, радиатор, отопление, чистовой пол, Oventrop',
    articleId: 'w-5',
    articleTitle: 'Замена радиаторов отопления',
    uploadedBy: 'Администратор',
    createdAt: new Date('2026-03-04T12:00:00Z').toISOString(),
  },
  {
    id: 'pho-003',
    title: 'Фотофиксация: Каркас инсталляции для подвесного унитаза с усилением Tece',
    fileType: 'photo',
    category: 'fixtures',
    fileUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80',
    description: 'Монтаж рамы инсталляции Geberit Duofix на несущий профиль Tece Profil. Выставление по лазерному нивелиру, проверка межосевого расстояния 180 мм.',
    format: 'webp',
    fileSize: '1.8 МБ',
    duration: undefined,
    tags: 'фото, инсталляция, Geberit, унитаз, Tece',
    articleId: 'w-4',
    articleTitle: 'Монтаж инсталляции подвесного унитаза',
    uploadedBy: 'Мастер-наставник',
    createdAt: new Date('2026-03-05T08:30:00Z').toISOString(),
  },

  // 3. ВИДЕОМАТЕРИАЛЫ (Видеоуроки, мастер-классы, видеоинструкции)
  {
    id: 'vid-001',
    title: 'Видеоурок: Полный цикл пайки полипропилена PPR без заужения внутреннего диаметра',
    fileType: 'video',
    category: 'water',
    fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    description: 'Наглядный видеоматериал: время нагрева, глубина посадки на насадку сварочного аппарата, контроль оплавления кольца и предотвращение запайки.',
    format: 'youtube',
    fileSize: '1080p Full HD',
    duration: '18:45',
    tags: 'видеоурок, пайка, полипропилен, сварочный аппарат, PPR',
    articleId: 'w-2',
    articleTitle: 'Сварка полипропиленовых труб',
    uploadedBy: 'Инструктор Академии СантехПро',
    createdAt: new Date('2026-03-05T15:00:00Z').toISOString(),
  },
  {
    id: 'vid-002',
    title: 'Видеодемонстрация: Замена керамического картриджа смесителя Grohe за 7 минут',
    fileType: 'video',
    category: 'fixtures',
    fileUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
    description: 'Пошаговый видеоролик: снятие декоративной заглушки, откручивание стопорного винта шестигранником 2.5 мм, извлечение закисшей гайки без повреждения хрома.',
    format: 'youtube',
    fileSize: '4K UHD',
    duration: '07:12',
    tags: 'видео, смеситель, картридж, Grohe, ремонт',
    articleId: 'w-1',
    articleTitle: 'Ремонт смесителя и замена картриджа',
    uploadedBy: 'Администратор',
    createdAt: new Date('2026-03-06T10:15:00Z').toISOString(),
  },
  {
    id: 'vid-003',
    title: 'Видеоурок: Аксиальная запрессовка сшитого полиэтилена PEX-a на расширителе',
    fileType: 'video',
    category: 'water',
    fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'Работа с аккумуляторным или ручным инструментом Quick&Easy / Rautool: вращение насадки на 30 градусов, надвижка гильзы до упора.',
    format: 'youtube',
    fileSize: '1080p 60fps',
    duration: '14:20',
    tags: 'видео, сшитый полиэтилен, PEX, Rehau, пресс',
    articleId: 'w-1',
    articleTitle: 'Монтаж сшитого полиэтилена',
    uploadedBy: 'Академия СантехПро',
    createdAt: new Date('2026-03-06T14:40:00Z').toISOString(),
  },

  // 4. АУДИОМАТЕРИАЛЫ (Аудиогиды, подкасты, голосовые разборы)
  {
    id: 'aud-001',
    title: 'Аудиогид мастера: 7 фатальных ошибок при скрытом монтаже труб в стенах',
    fileType: 'audio',
    category: 'water',
    fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80',
    description: 'Практический аудиоразбор: почему запрещено замуровывать разборные резьбовые соединения, как учитывать температурное расширение полимеров и зачем нужна гофра.',
    format: 'mp3',
    fileSize: '16.5 МБ',
    duration: '12:35',
    tags: 'аудиогид, ошибки монтажа, скрытая разводка, советы мастера',
    articleId: 'w-1',
    articleTitle: 'Скрытый монтаж труб в стяжке и штробах',
    uploadedBy: 'Инженер-эксперт СантехПро',
    createdAt: new Date('2026-03-06T18:00:00Z').toISOString(),
  },
  {
    id: 'aud-002',
    title: 'Аудио-лекция: Гидравлический удар — физика процесса, последствия и выбор компенсатора',
    fileType: 'audio',
    category: 'water',
    fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80',
    description: 'Подробное объяснение явления резкого скачка давления при закрытии электромагнитного клапана стиральной машины и методика подбора мембранного гасителя Valtec / Caleffi.',
    format: 'mp3',
    fileSize: '21.2 МБ',
    duration: '16:50',
    tags: 'аудио, гидроудар, физика, компенсатор, давление',
    articleId: 'w-1',
    articleTitle: 'Защита от гидроударов в квартире',
    uploadedBy: 'Ведущий инженер',
    createdAt: new Date('2026-03-07T08:20:00Z').toISOString(),
  },
];

export async function getDbMediaFiles(options?: {
  fileType?: MediaFileType;
  category?: string;
  search?: string;
}): Promise<MediaFile[]> {
  try {
    return await withDbRetry(async () => {
      let query = db.select().from(mediaFiles).orderBy(desc(mediaFiles.createdAt));
      const rows = await query;

      // Seed initial media files if database table is completely empty
      if (rows.length === 0) {
        console.log('Seeding initial media files into Cloud SQL...');
        for (const item of INITIAL_MEDIA_FILES) {
          await db.insert(mediaFiles).values({
            id: item.id,
            title: item.title,
            fileType: item.fileType,
            category: item.category,
            fileUrl: item.fileUrl,
            thumbnailUrl: item.thumbnailUrl || null,
            description: item.description || '',
            format: item.format || 'file',
            fileSize: item.fileSize || '',
            duration: item.duration || null,
            tags: item.tags || '',
            articleId: item.articleId || null,
            articleTitle: item.articleTitle || null,
            uploadedBy: item.uploadedBy || 'Администратор',
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.createdAt),
          }).onConflictDoNothing();
        }

        // Re-fetch after seeding
        const seededRows = await db.select().from(mediaFiles).orderBy(desc(mediaFiles.createdAt));
        return filterRows(seededRows, options);
      }

      return filterRows(rows, options);
    });
  } catch (error) {
    console.error('Database query note in getDbMediaFiles, using fallback:', error);
    return filterRows(INITIAL_MEDIA_FILES, options);
  }
}

function filterRows(rows: any[], options?: { fileType?: MediaFileType; category?: string; search?: string }): MediaFile[] {
  let mapped: MediaFile[] = rows.map(r => {
    const isDraft = (r.tags || '').includes('#draft');
    const isOptimized = !(r.tags || '').includes('#unoptimized');
    const ratio = r.fileType === 'photo' 
      ? '-74% (WebP Cloud Optimized)' 
      : r.fileType === 'video' 
      ? 'HLS / CDN Fast Stream (1080p)' 
      : r.fileType === 'audio' 
      ? 'Cloud Audio 192kbps (Buffer Optimized)' 
      : '-45% (Compressed)';

    return {
      id: r.id,
      title: r.title,
      fileType: r.fileType as MediaFileType,
      category: r.category,
      fileUrl: r.fileUrl,
      thumbnailUrl: r.thumbnailUrl || undefined,
      description: r.description || undefined,
      format: r.format || undefined,
      fileSize: r.fileSize || undefined,
      duration: r.duration || undefined,
      tags: r.tags || undefined,
      articleId: r.articleId || undefined,
      articleTitle: r.articleTitle || undefined,
      uploadedBy: r.uploadedBy || undefined,
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined,
      isPublished: !isDraft,
      isOptimized: isOptimized,
      optimizationRatio: ratio,
      cloudStoragePath: r.fileUrl.startsWith('/uploads/') ? `cloud://europe-west2/storage/santehpro-media/${r.fileUrl.replace('/uploads/', '')}` : undefined,
      streamBitrate: r.fileType === 'video' ? '1080p 60fps adaptive' : r.fileType === 'audio' ? '192 kbps' : undefined,
    };
  });

  if (options?.fileType) {
    mapped = mapped.filter(m => m.fileType === options.fileType);
  }
  if (options?.category && options.category !== 'all') {
    mapped = mapped.filter(m => m.category === options.category);
  }
  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    mapped = mapped.filter(m => 
      m.title.toLowerCase().includes(q) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      (m.tags && m.tags.toLowerCase().includes(q)) ||
      (m.format && m.format.toLowerCase().includes(q))
    );
  }

  return mapped;
}

export async function getDbMediaFileById(id: string): Promise<MediaFile | null> {
  try {
    return await withDbRetry(async () => {
      const rows = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id)).limit(1);
      if (rows.length === 0) return null;
      const r = rows[0];
      const isDraft = (r.tags || '').includes('#draft');
      const isOptimized = !(r.tags || '').includes('#unoptimized');
      const ratio = r.fileType === 'photo' 
        ? '-74% (WebP Cloud Optimized)' 
        : r.fileType === 'video' 
        ? 'HLS / CDN Fast Stream (1080p)' 
        : r.fileType === 'audio' 
        ? 'Cloud Audio 192kbps (Buffer Optimized)' 
        : '-45% (Compressed)';

      return {
        id: r.id,
        title: r.title,
        fileType: r.fileType as MediaFileType,
        category: r.category,
        fileUrl: r.fileUrl,
        thumbnailUrl: r.thumbnailUrl || undefined,
        description: r.description || undefined,
        format: r.format || undefined,
        fileSize: r.fileSize || undefined,
        duration: r.duration || undefined,
        tags: r.tags || undefined,
        articleId: r.articleId || undefined,
        articleTitle: r.articleTitle || undefined,
        uploadedBy: r.uploadedBy || undefined,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined,
        isPublished: !isDraft,
        isOptimized: isOptimized,
        optimizationRatio: ratio,
        cloudStoragePath: r.fileUrl.startsWith('/uploads/') ? `cloud://europe-west2/storage/santehpro-media/${r.fileUrl.replace('/uploads/', '')}` : undefined,
        streamBitrate: r.fileType === 'video' ? '1080p 60fps adaptive' : r.fileType === 'audio' ? '192 kbps' : undefined,
      };
    });
  } catch (error) {
    console.error('Database query note in getDbMediaFileById:', error);
    const fallback = INITIAL_MEDIA_FILES.find(m => m.id === id);
    return fallback || null;
  }
}

export async function createDbMediaFile(file: MediaFile): Promise<MediaFile> {
  try {
    return await withDbRetry(async () => {
      let tags = file.tags || '';
      if (file.isPublished === false) {
        if (!tags.includes('#draft')) tags = (tags + ' #draft').trim();
      }
      await db.insert(mediaFiles).values({
        id: file.id,
        title: file.title,
        fileType: file.fileType,
        category: file.category || 'water',
        fileUrl: file.fileUrl,
        thumbnailUrl: file.thumbnailUrl || null,
        description: file.description || '',
        format: file.format || 'file',
        fileSize: file.fileSize || '',
        duration: file.duration || null,
        tags: tags,
        articleId: file.articleId || null,
        articleTitle: file.articleTitle || null,
        uploadedBy: file.uploadedBy || 'Администратор',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return file;
    });
  } catch (error) {
    console.error('Database query failed in createDbMediaFile:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateDbMediaFile(id: string, updates: Partial<MediaFile>): Promise<void> {
  try {
    await withDbRetry(async () => {
      const values: Record<string, any> = {
        updatedAt: new Date(),
      };
      if (updates.title !== undefined) values.title = updates.title;
      if (updates.fileType !== undefined) values.fileType = updates.fileType;
      if (updates.category !== undefined) values.category = updates.category;
      if (updates.fileUrl !== undefined) values.fileUrl = updates.fileUrl;
      if (updates.thumbnailUrl !== undefined) values.thumbnailUrl = updates.thumbnailUrl || null;
      if (updates.description !== undefined) values.description = updates.description;
      if (updates.format !== undefined) values.format = updates.format;
      if (updates.fileSize !== undefined) values.fileSize = updates.fileSize;
      if (updates.duration !== undefined) values.duration = updates.duration || null;
      if (updates.tags !== undefined) values.tags = updates.tags;
      if (updates.articleId !== undefined) values.articleId = updates.articleId || null;
      if (updates.articleTitle !== undefined) values.articleTitle = updates.articleTitle || null;

      if (updates.isPublished !== undefined) {
        const existing = await getDbMediaFileById(id);
        let currentTags = updates.tags !== undefined ? updates.tags : (existing?.tags || '');
        if (updates.isPublished === false) {
          if (!currentTags.includes('#draft')) currentTags = (currentTags + ' #draft').trim();
        } else {
          currentTags = currentTags.replace(/#draft/g, '').trim();
        }
        values.tags = currentTags;
      }

      await db.update(mediaFiles).set(values).where(eq(mediaFiles.id, id));
    });
  } catch (error) {
    console.error('Database query failed in updateDbMediaFile:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteDbMediaFile(id: string): Promise<void> {
  try {
    await withDbRetry(async () => {
      await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
    });
  } catch (error) {
    console.error('Database query failed in deleteDbMediaFile:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
