import { db, withDbRetry } from './index.ts';
import { articles } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { Article } from '../types.ts';
import { INITIAL_ARTICLES } from '../data/initialData.ts';
import { HANDBOOK_IMAGE_TITLES, generateImageTitleFromTextTitle } from '../utils/handbookHelpers.ts';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const ARTICLES_STORE_FILE = path.join(DATA_DIR, 'articles_store.json');
const PERSISTED_DIR = path.resolve(process.cwd(), 'src/data/persisted');
const PERSISTED_ARTICLES_FILE = path.join(PERSISTED_DIR, 'articles.json');
const DELETED_ARTICLES_FILE = path.join(DATA_DIR, 'deleted_articles.json');
const PERSISTED_DELETED_FILE = path.join(PERSISTED_DIR, 'deleted_articles.json');

/**
 * Returns the set of IDs of articles that have been explicitly deleted.
 * Prevents deleted default/initial articles from resurrecting after restart or deployment.
 */
export function getDeletedArticleIds(): Set<string> {
  const ids = new Set<string>();
  try {
    if (fs.existsSync(DELETED_ARTICLES_FILE)) {
      const data = JSON.parse(fs.readFileSync(DELETED_ARTICLES_FILE, 'utf-8'));
      if (Array.isArray(data)) data.forEach((id: string) => ids.add(id));
    }
  } catch {}
  try {
    if (fs.existsSync(PERSISTED_DELETED_FILE)) {
      const data = JSON.parse(fs.readFileSync(PERSISTED_DELETED_FILE, 'utf-8'));
      if (Array.isArray(data)) data.forEach((id: string) => ids.add(id));
    }
  } catch {}
  return ids;
}

export function saveDeletedArticleId(id: string): void {
  try {
    const ids = getDeletedArticleIds();
    ids.add(id);
    const arr = Array.from(ids);
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(PERSISTED_DIR)) fs.mkdirSync(PERSISTED_DIR, { recursive: true });
    fs.writeFileSync(DELETED_ARTICLES_FILE, JSON.stringify(arr, null, 2), 'utf-8');
    fs.writeFileSync(PERSISTED_DELETED_FILE, JSON.stringify(arr, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Articles] Failed to save deleted article id tombstone:', err);
  }
}

export function removeDeletedArticleId(id: string): void {
  try {
    const ids = getDeletedArticleIds();
    if (ids.has(id)) {
      ids.delete(id);
      const arr = Array.from(ids);
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      if (!fs.existsSync(PERSISTED_DIR)) fs.mkdirSync(PERSISTED_DIR, { recursive: true });
      fs.writeFileSync(DELETED_ARTICLES_FILE, JSON.stringify(arr, null, 2), 'utf-8');
      fs.writeFileSync(PERSISTED_DELETED_FILE, JSON.stringify(arr, null, 2), 'utf-8');
    }
  } catch {}
}

/**
 * Read cached articles from disk storage (.data/articles_store.json & src/data/persisted/articles.json).
 * Guarantees that any articles, step-by-step guides, or courses added or edited
 * by the administrator persist across server restarts, app updates, and deployments.
 */
export function getCachedArticles(): Article[] {
  let diskArts: Article[] = [];
  let persistedArts: Article[] = [];
  const deletedIds = getDeletedArticleIds();

  try {
    if (fs.existsSync(ARTICLES_STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(ARTICLES_STORE_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        diskArts = data.filter((a: Article) => a && a.id && !deletedIds.has(a.id));
      }
    }
  } catch (err) {
    console.warn('[Articles] Failed to read cached articles from .data:', err);
  }

  try {
    if (fs.existsSync(PERSISTED_ARTICLES_FILE)) {
      const pData = JSON.parse(fs.readFileSync(PERSISTED_ARTICLES_FILE, 'utf-8'));
      if (Array.isArray(pData) && pData.length > 0) {
        persistedArts = pData.filter((a: Article) => a && a.id && !deletedIds.has(a.id));
      }
    }
  } catch (err) {
    console.warn('[Articles] Failed to read persisted articles from src/data/persisted:', err);
  }

  // Merge list: take all base articles, then override with custom/persisted/disk edits
  // Strictly ignore any articles present in deletedIds tombstone
  const map = new Map<string, Article>();
  for (const a of INITIAL_ARTICLES) {
    if (a && a.id && !deletedIds.has(a.id)) map.set(a.id, a);
  }
  for (const a of persistedArts) {
    if (a && a.id && !deletedIds.has(a.id)) map.set(a.id, a);
  }
  for (const a of diskArts) {
    if (a && a.id && !deletedIds.has(a.id)) map.set(a.id, a);
  }

  if (map.size > 0) {
    const merged = Array.from(map.values()).map((a: Article) => ({
      ...a,
      coverImage: a.coverImage || undefined,
      videoUrl: (a.videoUrl && !a.videoUrl.includes('dQw4w9WgXcQ') && !a.videoUrl.includes('732a3ea9c98cf85b244793f18e11a3ec')) ? a.videoUrl : undefined,
      videoEmbed: (a.videoEmbed && !a.videoEmbed.includes('dQw4w9WgXcQ') && !a.videoEmbed.includes('732a3ea9c98cf85b244793f18e11a3ec')) ? a.videoEmbed : undefined,
      rutubeUrl: (a.rutubeUrl && !a.rutubeUrl.includes('732a3ea9c98cf85b244793f18e11a3ec')) ? a.rutubeUrl : undefined,
      youtubeUrl: (a.youtubeUrl && !a.youtubeUrl.includes('dQw4w9WgXcQ')) ? a.youtubeUrl : undefined,
      steps: Array.isArray(a.steps) ? a.steps.map((s: any) => ({
        ...s,
        imageUrl: s.imageUrl || undefined,
        videoUrl: (s.videoUrl && !s.videoUrl.includes('dQw4w9WgXcQ')) ? s.videoUrl : undefined,
      })) : a.steps,
    }));

    // Auto-sync stores if needed
    try {
      if (!fs.existsSync(ARTICLES_STORE_FILE) || diskArts.length < merged.length) {
        saveCachedArticles(merged);
      }
    } catch {}

    return merged;
  }

  return [...INITIAL_ARTICLES];
}

/**
 * Safely persist articles list to disk (.data/articles_store.json & src/data/persisted/articles.json)
 */
export function saveCachedArticles(list: Article[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PERSISTED_DIR)) {
      fs.mkdirSync(PERSISTED_DIR, { recursive: true });
    }

    const jsonContent = JSON.stringify(list, null, 2);

    // Save to .data/articles_store.json
    const tempFile = `${ARTICLES_STORE_FILE}.tmp`;
    fs.writeFileSync(tempFile, jsonContent, 'utf-8');
    fs.renameSync(tempFile, ARTICLES_STORE_FILE);

    // Save to tracked persistent store (src/data/persisted/articles.json)
    fs.writeFileSync(PERSISTED_ARTICLES_FILE, jsonContent, 'utf-8');
  } catch (err) {
    console.error('[Articles] Failed to save cached articles to disk:', err);
  }
}

export async function getDbArticles(): Promise<Article[]> {
  try {
    return await withDbRetry(async () => {
      const rows = await db.select().from(articles).orderBy(desc(articles.createdAt));

      // Seed initial articles if table is empty
      if (rows.length === 0) {
        console.log('Seeding articles into Cloud SQL from persistent store or initial data...');
        const seedSource = getCachedArticles();
        for (const art of seedSource) {
          await db.insert(articles).values({
            id: art.id,
            title: art.title,
            category: art.category,
            type: art.type,
            adminSection: art.adminSection || (art.type === 'video' ? 'courses' : 'handbook'),
            accessType: art.accessType || 'free',
            price: art.price || null,
            buyUrl: art.buyUrl || null,
            difficulty: art.difficulty || 'Новичок',
            timeEst: art.timeEst || '20 мин',
            description: art.description || '',
            coverImage: art.coverImage || null,
            imageTitle: art.imageTitle || (art.id ? HANDBOOK_IMAGE_TITLES[art.id] : undefined) || generateImageTitleFromTextTitle(art.title, art.id),
            videoUrl: art.videoUrl || null,
            videoEmbed: art.videoEmbed || null,
            rutubeUrl: art.rutubeUrl || null,
            youtubeUrl: art.youtubeUrl || null,
            vkVideoUrl: art.vkVideoUrl || null,
            videoTimestampsJson: art.videoTimestamps ? JSON.stringify(art.videoTimestamps) : null,
            audioUrl: art.audioUrl || null,
            audioTitle: art.audioTitle || null,
            authorAddress: art.authorAddress || null,
            galleryImagesJson: art.galleryImages ? JSON.stringify(art.galleryImages) : null,
            studentsCount: art.studentsCount ?? 0,
            rating: art.rating ? String(art.rating) : '5.0',
            certificate: art.certificate ?? false,
            toolsRequiredJson: art.toolsRequired ? JSON.stringify(art.toolsRequired) : null,
            materialsRequiredJson: art.materialsRequired ? JSON.stringify(art.materialsRequired) : null,
            stepsJson: art.steps ? JSON.stringify(art.steps) : null,
            author: art.author || 'Достонджон Туйчиев',
            authorMasterId: art.authorMasterId || null,
            moderationStatus: art.moderationStatus || 'approved',
            moderationComment: art.moderationComment || null,
            isPublished: art.isPublished !== undefined ? art.isPublished : true,
            views: art.views ?? 1,
            likes: art.likes ?? 0,
            isFeatured: art.isFeatured ?? false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }).onConflictDoNothing();
        }

        // Re-fetch after seeding
        const seededRows = await db.select().from(articles).orderBy(desc(articles.createdAt));
        const mapped = mapRowsToArticles(seededRows);
        saveCachedArticles(mapped);
        return mapped;
      }

      const mapped = mapRowsToArticles(rows);

      // Merge with disk store: if any admin-added article exists in disk store but not in DB yet, preserve it
      const cached = getCachedArticles();
      const deletedIds = getDeletedArticleIds();
      const dbIds = new Set(mapped.map((a) => a.id));
      const missingFromDb = cached.filter((c) => !dbIds.has(c.id) && !deletedIds.has(c.id));
      if (missingFromDb.length > 0) {
        for (const missingArt of missingFromDb) {
          try {
            await createDbArticle(missingArt);
            mapped.unshift(missingArt);
          } catch {
            mapped.unshift(missingArt);
          }
        }
      }

      saveCachedArticles(mapped);
      return mapped;
    });
  } catch (_error) {
    // Fallback to disk cached articles (preserves all admin edits, new guides, and courses)
    return getCachedArticles();
  }
}

function mapRowsToArticles(rows: any[]): Article[] {
  return rows.map((r) => {
    let videoTimestamps = undefined;
    if (r.videoTimestampsJson) {
      try { videoTimestamps = JSON.parse(r.videoTimestampsJson); } catch (e) {}
    }

    let galleryImages = undefined;
    if (r.galleryImagesJson) {
      try { galleryImages = JSON.parse(r.galleryImagesJson); } catch (e) {}
    }

    let toolsRequired = undefined;
    if (r.toolsRequiredJson) {
      try { toolsRequired = JSON.parse(r.toolsRequiredJson); } catch (e) {}
    }

    let materialsRequired = undefined;
    if (r.materialsRequiredJson) {
      try { materialsRequired = JSON.parse(r.materialsRequiredJson); } catch (e) {}
    }

    let steps = [];
    if (r.stepsJson) {
      try { steps = JSON.parse(r.stepsJson); } catch (e) {}
    }

    return {
      id: r.id,
      title: r.title,
      category: r.category as any,
      type: r.type as any,
      adminSection: r.adminSection as any,
      accessType: r.accessType as any,
      price: r.price || undefined,
      buyUrl: r.buyUrl || undefined,
      difficulty: r.difficulty as any,
      timeEst: r.timeEst,
      description: r.description,
      coverImage: (r.coverImage && !r.coverImage.includes('images.unsplash.com')) ? r.coverImage : undefined,
      imageTitle: r.imageTitle || (r.id ? HANDBOOK_IMAGE_TITLES[r.id] : undefined) || generateImageTitleFromTextTitle(r.title, r.id),
      videoUrl: (r.videoUrl && !r.videoUrl.includes('dQw4w9WgXcQ') && !r.videoUrl.includes('732a3ea9c98cf85b244793f18e11a3ec')) ? r.videoUrl : undefined,
      videoEmbed: (r.videoEmbed && !r.videoEmbed.includes('dQw4w9WgXcQ') && !r.videoEmbed.includes('732a3ea9c98cf85b244793f18e11a3ec')) ? r.videoEmbed : undefined,
      rutubeUrl: (r.rutubeUrl && !r.rutubeUrl.includes('732a3ea9c98cf85b244793f18e11a3ec')) ? r.rutubeUrl : undefined,
      youtubeUrl: (r.youtubeUrl && !r.youtubeUrl.includes('dQw4w9WgXcQ')) ? r.youtubeUrl : undefined,
      vkVideoUrl: (r as any).vkVideoUrl || undefined,
      videoTimestamps,
      audioUrl: (r.audioUrl && !r.audioUrl.includes('soundhelix.com')) ? r.audioUrl : undefined,
      audioTitle: (r.audioUrl && !r.audioUrl.includes('soundhelix.com')) ? r.audioTitle : undefined,
      authorAddress: r.authorAddress || undefined,
      galleryImages: (galleryImages && galleryImages.some((g: string) => typeof g === 'string' && g.includes('images.unsplash.com'))) ? undefined : galleryImages,
      studentsCount: r.studentsCount ?? 0,
      rating: r.rating ? Number(r.rating) : 5.0,
      certificate: r.certificate ?? false,
      toolsRequired,
      materialsRequired,
      steps,
      author: r.author || 'Достонджон Туйчиев',
      authorMasterId: r.authorMasterId || undefined,
      moderationStatus: (r.moderationStatus as any) || 'approved',
      moderationComment: r.moderationComment || undefined,
      isPublished: r.isPublished !== undefined ? Boolean(r.isPublished) : true,
      views: r.views ?? 1,
      likes: r.likes ?? 0,
      isFeatured: r.isFeatured ?? false,
      createdAt: r.createdAt ? r.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  });
}

export async function createDbArticle(art: Article): Promise<Article> {
  // Remove from deleted tombstones if it was previously deleted
  removeDeletedArticleId(art.id);

  // Always update disk cache immediately to guarantee persistence across redeployments and restarts
  try {
    const cached = getCachedArticles();
    const filtered = cached.filter((a) => a.id !== art.id);
    saveCachedArticles([art, ...filtered]);
  } catch (e) {
    console.warn('[Articles] Failed to write article to disk cache on create:', e);
  }

  try {
    await db.insert(articles).values({
      id: art.id,
      title: art.title,
      category: art.category,
      type: art.type,
      adminSection: art.adminSection || (art.type === 'video' ? 'courses' : 'handbook'),
      accessType: art.accessType || 'free',
      price: art.price || null,
      buyUrl: art.buyUrl || null,
      difficulty: art.difficulty || 'Новичок',
      timeEst: art.timeEst || '20 мин',
      description: art.description || '',
      coverImage: art.coverImage || null,
      imageTitle: art.imageTitle || generateImageTitleFromTextTitle(art.title, art.id),
      videoUrl: art.videoUrl || null,
      videoEmbed: art.videoEmbed || null,
      rutubeUrl: art.rutubeUrl || null,
      youtubeUrl: art.youtubeUrl || null,
      vkVideoUrl: art.vkVideoUrl || null,
      videoTimestampsJson: art.videoTimestamps ? JSON.stringify(art.videoTimestamps) : null,
      audioUrl: art.audioUrl || null,
      audioTitle: art.audioTitle || null,
      authorAddress: art.authorAddress || null,
      galleryImagesJson: art.galleryImages ? JSON.stringify(art.galleryImages) : null,
      studentsCount: art.studentsCount ?? 0,
      rating: art.rating ? String(art.rating) : '5.0',
      certificate: art.certificate ?? false,
      toolsRequiredJson: art.toolsRequired ? JSON.stringify(art.toolsRequired) : null,
      materialsRequiredJson: art.materialsRequired ? JSON.stringify(art.materialsRequired) : null,
      stepsJson: art.steps ? JSON.stringify(art.steps) : null,
      author: art.author || 'Достонджон Туйчиев',
      authorMasterId: art.authorMasterId || null,
      moderationStatus: art.moderationStatus || 'approved',
      moderationComment: art.moderationComment || null,
      isPublished: art.isPublished !== undefined ? art.isPublished : true,
      views: art.views ?? 1,
      likes: art.likes ?? 0,
      isFeatured: art.isFeatured ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return art;
  } catch (error) {
    console.warn('[Articles] Database insert failed in createDbArticle (article preserved in persistent store):', error);
    return art;
  }
}

export async function updateDbArticle(id: string, updates: Partial<Article>): Promise<void> {
  // Always update disk cache immediately to guarantee persistence
  try {
    const cached = getCachedArticles();
    const index = cached.findIndex((a) => a.id === id);
    if (index !== -1) {
      cached[index] = { ...cached[index], ...updates };
      saveCachedArticles(cached);
    }
  } catch (e) {
    console.warn('[Articles] Failed to write update to disk cache:', e);
  }

  try {
    const values: Record<string, any> = {
      updatedAt: new Date(),
    };
    if (updates.title !== undefined) values.title = updates.title;
    if (updates.category !== undefined) values.category = updates.category;
    if (updates.type !== undefined) values.type = updates.type;
    if (updates.adminSection !== undefined) values.adminSection = updates.adminSection;
    if (updates.accessType !== undefined) values.accessType = updates.accessType;
    if (updates.price !== undefined) values.price = updates.price || null;
    if (updates.buyUrl !== undefined) values.buyUrl = updates.buyUrl || null;
    if (updates.difficulty !== undefined) values.difficulty = updates.difficulty;
    if (updates.timeEst !== undefined) values.timeEst = updates.timeEst;
    if (updates.description !== undefined) values.description = updates.description;
    if (updates.coverImage !== undefined) values.coverImage = updates.coverImage;
    if (updates.imageTitle !== undefined) values.imageTitle = updates.imageTitle;
    if (updates.videoUrl !== undefined) values.videoUrl = updates.videoUrl || null;
    if (updates.videoEmbed !== undefined) values.videoEmbed = updates.videoEmbed || null;
    if (updates.rutubeUrl !== undefined) values.rutubeUrl = updates.rutubeUrl || null;
    if (updates.youtubeUrl !== undefined) values.youtubeUrl = updates.youtubeUrl || null;
    if (updates.vkVideoUrl !== undefined) values.vkVideoUrl = updates.vkVideoUrl || null;
    if (updates.videoTimestamps !== undefined) values.videoTimestampsJson = updates.videoTimestamps ? JSON.stringify(updates.videoTimestamps) : null;
    if (updates.audioUrl !== undefined) values.audioUrl = updates.audioUrl || null;
    if (updates.audioTitle !== undefined) values.audioTitle = updates.audioTitle || null;
    if (updates.authorAddress !== undefined) values.authorAddress = updates.authorAddress || null;
    if (updates.galleryImages !== undefined) values.galleryImagesJson = updates.galleryImages ? JSON.stringify(updates.galleryImages) : null;
    if (updates.studentsCount !== undefined) values.studentsCount = updates.studentsCount;
    if (updates.rating !== undefined) values.rating = updates.rating ? String(updates.rating) : '5.0';
    if (updates.certificate !== undefined) values.certificate = updates.certificate;
    if (updates.toolsRequired !== undefined) values.toolsRequiredJson = updates.toolsRequired ? JSON.stringify(updates.toolsRequired) : null;
    if (updates.materialsRequired !== undefined) values.materialsRequiredJson = updates.materialsRequired ? JSON.stringify(updates.materialsRequired) : null;
    if (updates.steps !== undefined) values.stepsJson = updates.steps ? JSON.stringify(updates.steps) : null;
    if (updates.author !== undefined) values.author = updates.author;
    if (updates.authorMasterId !== undefined) values.authorMasterId = updates.authorMasterId;
    if (updates.moderationStatus !== undefined) values.moderationStatus = updates.moderationStatus;
    if (updates.moderationComment !== undefined) values.moderationComment = updates.moderationComment;
    if (updates.isPublished !== undefined) values.isPublished = updates.isPublished;
    if (updates.views !== undefined) values.views = updates.views;
    if (updates.likes !== undefined) values.likes = updates.likes;
    if (updates.isFeatured !== undefined) values.isFeatured = updates.isFeatured;

    await db.update(articles).set(values).where(eq(articles.id, id));
  } catch (error) {
    console.warn('[Articles] Database update failed in updateDbArticle (update preserved in disk store):', error);
  }
}

export async function deleteDbArticle(id: string): Promise<void> {
  // Permanently record deletion tombstone so default articles never resurrect
  saveDeletedArticleId(id);

  // Always update disk cache immediately
  try {
    const cached = getCachedArticles();
    saveCachedArticles(cached.filter((a) => a.id !== id));
  } catch (e) {
    console.warn('[Articles] Failed to remove article from disk cache:', e);
  }

  try {
    await db.delete(articles).where(eq(articles.id, id));
  } catch (error) {
    console.warn('[Articles] Database query failed in deleteDbArticle (removal processed in disk store):', error);
  }
}
