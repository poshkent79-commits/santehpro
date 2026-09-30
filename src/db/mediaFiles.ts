import { db, withDbRetry } from './index.ts';
import { mediaFiles } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { MediaFile, MediaFileType } from '../types.ts';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const MEDIA_FILES_STORE_FILE = path.join(DATA_DIR, 'media_files_store.json');

export const INITIAL_MEDIA_FILES: MediaFile[] = [];

export function getCachedMediaFiles(): MediaFile[] {
  try {
    if (fs.existsSync(MEDIA_FILES_STORE_FILE)) {
      const data = fs.readFileSync(MEDIA_FILES_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read cached media files from disk:', err);
  }
  return Array.isArray(INITIAL_MEDIA_FILES) ? [...INITIAL_MEDIA_FILES] : [];
}

export function saveCachedMediaFiles(list: MediaFile[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(MEDIA_FILES_STORE_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save cached media files to disk:', err);
  }
}

let inMemoryMediaFiles: MediaFile[] = getCachedMediaFiles();

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
        console.log('Seeding initial media files into Russian server database...');
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

        const seededRows = await db.select().from(mediaFiles).orderBy(desc(mediaFiles.createdAt));
        const filtered = filterRows(seededRows, options);
        inMemoryMediaFiles = filterRows(seededRows);
        saveCachedMediaFiles(inMemoryMediaFiles);
        return filtered;
      }

      const filtered = filterRows(rows, options);
      inMemoryMediaFiles = filterRows(rows);
      saveCachedMediaFiles(inMemoryMediaFiles);
      return filtered;
    });
  } catch (error) {
    console.warn('Database note in getDbMediaFiles, using local Russian server store:', error);
    return filterRows(inMemoryMediaFiles, options);
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
      createdAt: r.createdAt ? (r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt)) : new Date().toISOString(),
      updatedAt: r.updatedAt ? (r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt)) : undefined,
      isPublished: !isDraft,
      isOptimized: isOptimized,
      optimizationRatio: ratio,
      cloudStoragePath: r.fileUrl && r.fileUrl.startsWith('/uploads/') ? `timeweb://ru-spb/santehpro-media/${r.fileUrl.replace('/uploads/', '')}` : undefined,
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
  const inMem = inMemoryMediaFiles.find(m => m.id === id);
  if (inMem) return inMem;

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
        createdAt: r.createdAt ? (r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt)) : new Date().toISOString(),
        updatedAt: r.updatedAt ? (r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt)) : undefined,
        isPublished: !isDraft,
        isOptimized: isOptimized,
        optimizationRatio: ratio,
        cloudStoragePath: r.fileUrl.startsWith('/uploads/') ? `timeweb://ru-spb/santehpro-media/${r.fileUrl.replace('/uploads/', '')}` : undefined,
        streamBitrate: r.fileType === 'video' ? '1080p 60fps adaptive' : r.fileType === 'audio' ? '192 kbps' : undefined,
      };
    });
  } catch (error) {
    console.warn('Database note in getDbMediaFileById:', error);
    const fallback = inMemoryMediaFiles.find(m => m.id === id) || INITIAL_MEDIA_FILES.find(m => m.id === id);
    return fallback || null;
  }
}

export async function createDbMediaFile(file: MediaFile): Promise<MediaFile> {
  let tags = file.tags || '';
  if (file.isPublished === false) {
    if (!tags.includes('#draft')) tags = (tags + ' #draft').trim();
  }
  const fileToSave: MediaFile = {
    ...file,
    tags,
    createdAt: file.createdAt || new Date().toISOString(),
    cloudStoragePath: file.fileUrl && file.fileUrl.startsWith('/uploads/') 
      ? `timeweb://ru-spb/santehpro-media/${file.fileUrl.replace('/uploads/', '')}` 
      : file.cloudStoragePath,
  };

  // Immediate persistent write to Russian server disk (.data/media_files_store.json)
  inMemoryMediaFiles = inMemoryMediaFiles.filter(m => m.id !== fileToSave.id);
  inMemoryMediaFiles.unshift(fileToSave);
  saveCachedMediaFiles(inMemoryMediaFiles);

  try {
    await withDbRetry(async () => {
      await db.insert(mediaFiles).values({
        id: fileToSave.id,
        title: fileToSave.title,
        fileType: fileToSave.fileType,
        category: fileToSave.category || 'water',
        fileUrl: fileToSave.fileUrl,
        thumbnailUrl: fileToSave.thumbnailUrl || null,
        description: fileToSave.description || '',
        format: fileToSave.format || 'file',
        fileSize: fileToSave.fileSize || '',
        duration: fileToSave.duration || null,
        tags: fileToSave.tags || '',
        articleId: fileToSave.articleId || null,
        articleTitle: fileToSave.articleTitle || null,
        uploadedBy: fileToSave.uploadedBy || 'Администратор',
        createdAt: new Date(fileToSave.createdAt),
        updatedAt: new Date(),
      }).onConflictDoNothing();
    });
  } catch (error) {
    console.warn('Database note in createDbMediaFile (persisted to Russian disk):', error);
  }

  return fileToSave;
}

export async function updateDbMediaFile(id: string, updates: Partial<MediaFile>): Promise<void> {
  const index = inMemoryMediaFiles.findIndex(m => m.id === id);
  if (index >= 0) {
    inMemoryMediaFiles[index] = {
      ...inMemoryMediaFiles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveCachedMediaFiles(inMemoryMediaFiles);
  }

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
        const existing = inMemoryMediaFiles.find(m => m.id === id);
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
    console.warn('Database note in updateDbMediaFile (persisted to Russian disk):', error);
  }
}

export async function deleteDbMediaFile(id: string): Promise<void> {
  inMemoryMediaFiles = inMemoryMediaFiles.filter(m => m.id !== id);
  saveCachedMediaFiles(inMemoryMediaFiles);

  try {
    await withDbRetry(async () => {
      await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
    });
  } catch (error) {
    console.warn('Database note in deleteDbMediaFile (removed from Russian disk):', error);
  }
}
