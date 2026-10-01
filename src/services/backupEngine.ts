import fs from 'fs';
import path from 'path';
import { PlumbingSpecialist, ServiceCallRequest, Article } from '../types.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

export interface SystemBackupMetadata {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  label: string;
  counts: {
    specialists: number;
    users: number;
    requests: number;
    articles: number;
  };
}

export function ensureBackupDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

/**
 * Creates a full JSON snapshot of all essential database records
 */
export function createSystemSnapshot(
  specialists: PlumbingSpecialist[],
  users: any[],
  requests: ServiceCallRequest[],
  articles: Article[],
  label = 'Автоматическая точка восстановления'
): SystemBackupMetadata {
  ensureBackupDir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_${timestamp}.json`;
  const latestFilename = `backup_latest.json`;
  const filePath = path.join(BACKUPS_DIR, filename);
  const latestFilePath = path.join(BACKUPS_DIR, latestFilename);

  const payload = {
    version: '2026.10',
    createdAt: new Date().toISOString(),
    label,
    counts: {
      specialists: Array.isArray(specialists) ? specialists.length : 0,
      users: Array.isArray(users) ? users.length : 0,
      requests: Array.isArray(requests) ? requests.length : 0,
      articles: Array.isArray(articles) ? articles.length : 0,
    },
    data: {
      specialists: Array.isArray(specialists) ? specialists : [],
      users: Array.isArray(users) ? users : [],
      requests: Array.isArray(requests) ? requests : [],
      articles: Array.isArray(articles) ? articles : [],
    },
  };

  const jsonContent = JSON.stringify(payload, null, 2);
  fs.writeFileSync(filePath, jsonContent, 'utf-8');
  fs.writeFileSync(latestFilePath, jsonContent, 'utf-8');

  // Prune older backups if more than 30
  try {
    const all = fs.readdirSync(BACKUPS_DIR)
      .filter((f) => f.startsWith('backup_') && f.endsWith('.json') && f !== 'backup_latest.json')
      .sort();
    if (all.length > 30) {
      const toDelete = all.slice(0, all.length - 30);
      for (const oldFile of toDelete) {
        fs.unlinkSync(path.join(BACKUPS_DIR, oldFile));
      }
    }
  } catch {}

  const stats = fs.statSync(filePath);
  return {
    id: filename,
    filename,
    createdAt: payload.createdAt,
    sizeBytes: stats.size,
    label,
    counts: payload.counts,
  };
}

/**
 * List all available backups on disk
 */
export function listAllBackups(): SystemBackupMetadata[] {
  ensureBackupDir();
  try {
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter((f) => f.endsWith('.json') && f !== 'backup_latest.json')
      .sort()
      .reverse();

    const result: SystemBackupMetadata[] = [];
    for (const f of files) {
      try {
        const fullPath = path.join(BACKUPS_DIR, f);
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const parsed = JSON.parse(content);
        result.push({
          id: f,
          filename: f,
          createdAt: parsed.createdAt || stats.mtime.toISOString(),
          sizeBytes: stats.size,
          label: parsed.label || 'Резервная копия',
          counts: parsed.counts || {
            specialists: Array.isArray(parsed.data?.specialists) ? parsed.data.specialists.length : 0,
            users: Array.isArray(parsed.data?.users) ? parsed.data.users.length : 0,
            requests: Array.isArray(parsed.data?.requests) ? parsed.data.requests.length : 0,
            articles: Array.isArray(parsed.data?.articles) ? parsed.data.articles.length : 0,
          },
        });
      } catch {}
    }
    return result;
  } catch (err) {
    console.warn('[Backups] List backups failed:', err);
    return [];
  }
}

/**
 * Read backup content from filename
 */
export function readBackupPayload(filename: string): any {
  ensureBackupDir();
  const safeFilename = path.basename(filename);
  const fullPath = path.join(BACKUPS_DIR, safeFilename);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Файл резервной копии не найден: ${safeFilename}`);
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content);
}
