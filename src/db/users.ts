import { db } from './index.ts';
import { users, userPurchases, userFavorites } from './schema.ts';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Super Admin emails & phones configuration with automatic admin privileges
export const SUPER_ADMIN_EMAILS = [
  'poshkent79@gmail.com',
  'admin@santehpro.ru',
  'admin@santehpro.info',
];

export const SUPER_ADMIN_PHONES = [
  '+79247889900',
  '79247889900',
  '89247889900',
  '+7 (924) 788-99-00',
  '+7 (924) 788-9900',
  '9247889900',
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function isSuperAdminPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return (
    SUPER_ADMIN_PHONES.some((p) => p.replace(/\D/g, '') === digits) ||
    digits === '79247889900' ||
    digits === '89247889900' ||
    digits.endsWith('9247889900')
  );
}

export function isSuperAdmin(user?: { email?: string | null; phone?: string | null } | null): boolean {
  if (!user) return false;
  return isSuperAdminEmail(user.email) || isSuperAdminPhone(user.phone);
}

// Password hashing helper using Node.js built-in crypto (PBKDF2)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash) return false;
    if (!storedHash.includes(':')) {
      // Direct comparison fallback if legacy plaintext was stored
      return password === storedHash;
    }
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const bufOriginal = Buffer.from(originalHash, 'hex');
    const bufCheck = Buffer.from(checkHash, 'hex');
    if (bufOriginal.length !== bufCheck.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufOriginal, bufCheck);
  } catch (err) {
    console.error('Error verifying password:', err);
    return false;
  }
}

// In-memory user store and persistent file cache for preview resilience
interface CachedUser {
  id: number;
  uid: string;
  email: string;
  name: string;
  phone?: string | null;
  city?: string | null;
  passwordHash?: string | null;
  role: string;
  dataConsent: boolean;
  consentTimestamp: Date;
  legalConsent?: boolean;
  legalConsentTimestamp?: Date;
  legalChecklistJson?: string | null;
  createdAt: Date;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const USERS_STORE_FILE = path.join(DATA_DIR, 'users_store.json');

function loadInitialUsers(): CachedUser[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(USERS_STORE_FILE)) {
      const content = fs.readFileSync(USERS_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((u: any) => ({
          ...u,
          consentTimestamp: new Date(u.consentTimestamp || Date.now()),
          legalConsentTimestamp: new Date(u.legalConsentTimestamp || Date.now()),
          createdAt: new Date(u.createdAt || Date.now()),
        }));
      }
    }
  } catch (err) {
    console.warn('Could not read users_store.json, initializing defaults:', err);
  }

  // Pre-seed default accounts
  const defaults: CachedUser[] = [
    {
      id: 1,
      uid: 'usr-admin-poshkent',
      email: 'poshkent79@gmail.com',
      name: 'Главный Администратор',
      phone: '+7 (999) 000-79-79',
      city: 'Москва',
      passwordHash: hashPassword('Sol20252026@'),
      role: 'admin',
      dataConsent: true,
      consentTimestamp: new Date(),
      legalConsent: true,
      legalConsentTimestamp: new Date(),
      legalChecklistJson: null,
      createdAt: new Date(),
    },
    {
      id: 2,
      uid: 'usr-admin-master',
      email: 'admin@santehpro.ru',
      name: 'Администратор СантехПро',
      phone: '+7 (999) 000-00-00',
      city: 'Москва',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      dataConsent: true,
      consentTimestamp: new Date(),
      legalConsent: true,
      legalConsentTimestamp: new Date(),
      legalChecklistJson: null,
      createdAt: new Date(),
    },
    {
      id: 3,
      uid: 'usr-demo-master',
      email: 'user@santehpro.ru',
      name: 'Мастер-Пользователь',
      phone: '+7 (999) 111-22-33',
      city: 'Москва',
      passwordHash: hashPassword('123456'),
      role: 'user',
      dataConsent: true,
      consentTimestamp: new Date(),
      legalConsent: true,
      legalConsentTimestamp: new Date(),
      legalChecklistJson: null,
      createdAt: new Date(),
    },
  ];

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_STORE_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
  } catch (e) {
    // ignore
  }

  return defaults;
}

const inMemoryUsers: CachedUser[] = loadInitialUsers();

function persistUsersToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_STORE_FILE, JSON.stringify(inMemoryUsers, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write users to disk:', err);
  }
}

function sanitizeUserResult<T extends { email?: string | null; phone?: string | null; role?: string }>(user: T | null): T | null {
  if (!user) return null;
  if (isSuperAdmin(user)) {
    user.role = 'admin';
  }
  return user;
}

export async function getUserByEmail(email: string) {
  const normalized = email.toLowerCase().trim();
  try {
    const results = await db.select().from(users).where(eq(users.email, normalized));
    if (results[0]) {
      const sanitized = sanitizeUserResult(results[0] as any);
      const idx = inMemoryUsers.findIndex((u) => u.email === normalized);
      if (idx >= 0) inMemoryUsers[idx] = sanitized as any;
      else inMemoryUsers.push(sanitized as any);
      persistUsersToDisk();
      return sanitized;
    }
    const memUser = inMemoryUsers.find((u) => u.email.toLowerCase().trim() === normalized) || null;
    return sanitizeUserResult(memUser);
  } catch (error) {
    const memUser = inMemoryUsers.find((u) => u.email.toLowerCase().trim() === normalized) || null;
    return sanitizeUserResult(memUser);
  }
}

export async function getUserByUid(uid: string) {
  try {
    const results = await db.select().from(users).where(eq(users.uid, uid));
    if (results[0]) {
      const sanitized = sanitizeUserResult(results[0] as any);
      const idx = inMemoryUsers.findIndex((u) => u.uid === uid);
      if (idx >= 0) inMemoryUsers[idx] = sanitized as any;
      else inMemoryUsers.push(sanitized as any);
      persistUsersToDisk();
      return sanitized;
    }
    const memUser = inMemoryUsers.find((u) => u.uid === uid) || null;
    return sanitizeUserResult(memUser);
  } catch (error) {
    const memUser = inMemoryUsers.find((u) => u.uid === uid) || null;
    return sanitizeUserResult(memUser);
  }
}

export async function registerDbUser(data: {
  email: string;
  password?: string;
  name: string;
  phone?: string;
  city?: string;
  uid?: string;
  role?: 'user' | 'specialist' | 'admin';
  dataConsent?: boolean;
  legalConsent?: boolean;
  legalChecklistJson?: string;
}) {
  const normalizedEmail = data.email.toLowerCase().trim();
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('Пользователь с таким Email уже зарегистрирован');
  }

  const userRole = data.role === 'specialist' ? 'specialist' : 'user';
  const uid = data.uid || `usr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const passwordHash = data.password ? hashPassword(data.password) : null;
  const now = new Date();
  const fallbackRecord: CachedUser = {
    id: inMemoryUsers.length + 1,
    uid,
    email: normalizedEmail,
    name: data.name || 'Пользователь',
    phone: data.phone || null,
    city: data.city || 'Москва',
    passwordHash,
    role: userRole,
    dataConsent: data.dataConsent !== undefined ? data.dataConsent : true,
    consentTimestamp: now,
    legalConsent: data.legalConsent !== undefined ? data.legalConsent : true,
    legalConsentTimestamp: now,
    legalChecklistJson: data.legalChecklistJson || null,
    createdAt: now,
  };

  try {
    const result = await db.insert(users).values({
      uid,
      email: normalizedEmail,
      name: data.name || 'Пользователь',
      phone: data.phone || null,
      city: data.city || 'Москва',
      passwordHash,
      role: userRole,
      dataConsent: data.dataConsent !== undefined ? data.dataConsent : true,
      consentTimestamp: now,
      legalConsent: data.legalConsent !== undefined ? data.legalConsent : true,
      legalConsentTimestamp: now,
      legalChecklistJson: data.legalChecklistJson || null,
      createdAt: now,
    }).returning();

    if (result && result[0]) {
      inMemoryUsers.push(result[0] as any);
      persistUsersToDisk();
      return result[0];
    }
  } catch {
    // Silent fallback to resilient local file store
  }

  inMemoryUsers.push(fallbackRecord);
  persistUsersToDisk();
  return fallbackRecord;
}

export async function syncGoogleDbUser(data: {
  uid: string;
  email: string;
  name: string;
  photoUrl?: string;
  dataConsent?: boolean;
  legalConsent?: boolean;
  legalChecklistJson?: string | null;
}) {
  const normalizedEmail = data.email.toLowerCase().trim();
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    return existing;
  }

  const now = new Date();
  const fallbackRecord: CachedUser = {
    id: inMemoryUsers.length + 1,
    uid: data.uid,
    email: normalizedEmail,
    name: data.name || 'Google Пользователь',
    phone: null,
    city: 'Москва',
    passwordHash: null,
    role: 'user',
    dataConsent: data.dataConsent ?? true,
    consentTimestamp: now,
    legalConsent: data.legalConsent ?? true,
    legalConsentTimestamp: now,
    legalChecklistJson: data.legalChecklistJson || JSON.stringify({
      source: 'google_auth',
      termsAccepted: true,
      dataConsentAccepted: true,
      serviceName: 'СантехПро',
      timestamp: now.toISOString(),
    }),
    createdAt: now,
  };

  try {
    const result = await db.insert(users).values({
      uid: data.uid,
      email: normalizedEmail,
      name: data.name || 'Google Пользователь',
      phone: null,
      city: 'Москва',
      passwordHash: null,
      role: 'user',
      dataConsent: data.dataConsent ?? true,
      consentTimestamp: now,
      legalConsent: data.legalConsent ?? true,
      legalConsentTimestamp: now,
      legalChecklistJson: data.legalChecklistJson || JSON.stringify({
        source: 'google_auth',
        termsAccepted: true,
        dataConsentAccepted: true,
        serviceName: 'СантехПро',
        timestamp: now.toISOString(),
      }),
      createdAt: now,
    }).returning();

    if (result && result[0]) {
      inMemoryUsers.push(result[0] as any);
      persistUsersToDisk();
      return result[0];
    }
  } catch {
    // Resilient fallback to local store
  }

  inMemoryUsers.push(fallbackRecord);
  persistUsersToDisk();
  return fallbackRecord;
}

export async function syncYandexDbUser(data: {
  yandexId: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role?: 'user' | 'specialist';
  dataConsent?: boolean;
  legalConsent?: boolean;
}) {
  const normalizedEmail = (data.email || `yandex_${data.yandexId}@yandex.ru`).toLowerCase().trim();
  const yandexUid = `yandex_${data.yandexId}`;

  // 1. Check if user already exists by Yandex UID
  const existingByUid = await getUserByUid(yandexUid);
  if (existingByUid) {
    return existingByUid;
  }

  // 2. Check if user already exists by Email - RESTORE PREVIOUS DATA, PURCHASES, REVIEWS, ETC.!
  const existingByEmail = await getUserByEmail(normalizedEmail);
  if (existingByEmail) {
    // If user previously registered with this email, link and restore their profile!
    return existingByEmail;
  }

  // 3. Check by Phone if phone was provided
  if (data.phone) {
    const cleanPhone = data.phone.replace(/[^\d+]/g, '');
    const foundByPhone = inMemoryUsers.find(
      (u) => u.phone && u.phone.replace(/[^\d+]/g, '') === cleanPhone
    );
    if (foundByPhone) {
      return foundByPhone;
    }
  }

  // 4. Create new user profile
  const now = new Date();
  const userName = data.name?.trim() || 'Пользователь Яндекс';
  const userRole = data.role === 'specialist' ? 'specialist' : 'user';

  const fallbackRecord: CachedUser = {
    id: inMemoryUsers.length + 1,
    uid: yandexUid,
    email: normalizedEmail,
    name: userName,
    phone: data.phone || null,
    city: 'Москва',
    passwordHash: null,
    role: userRole,
    dataConsent: data.dataConsent ?? true,
    consentTimestamp: now,
    legalConsent: data.legalConsent ?? true,
    legalConsentTimestamp: now,
    legalChecklistJson: JSON.stringify({
      source: 'yandex_id_oauth',
      termsAccepted: true,
      dataConsentAccepted: true,
      serviceName: 'СантехПро',
      timestamp: now.toISOString(),
    }),
    createdAt: now,
  };

  try {
    const result = await db.insert(users).values({
      uid: yandexUid,
      email: normalizedEmail,
      name: userName,
      phone: data.phone || null,
      city: 'Москва',
      passwordHash: null,
      role: userRole,
      dataConsent: data.dataConsent ?? true,
      consentTimestamp: now,
      legalConsent: data.legalConsent ?? true,
      legalConsentTimestamp: now,
      legalChecklistJson: JSON.stringify({
        source: 'yandex_id_oauth',
        termsAccepted: true,
        dataConsentAccepted: true,
        serviceName: 'СантехПро',
        timestamp: now.toISOString(),
      }),
      createdAt: now,
    }).returning();

    if (result && result[0]) {
      inMemoryUsers.push(result[0] as any);
      persistUsersToDisk();
      return result[0];
    }
  } catch {
    // Local fallback
  }

  inMemoryUsers.push(fallbackRecord);
  persistUsersToDisk();
  return fallbackRecord;
}

export async function loginDbUser(identifier: string, password?: string) {
  const trimmed = (identifier || '').trim();
  const normalizedEmail = trimmed.toLowerCase();

  // 1. Dedicated test account for App Store / RuStore / VK ID moderation and technical reviews
  const isModeratorIdentifier =
    normalizedEmail === 'moderator@santehpro.ru' ||
    normalizedEmail === 'demo@santehpro.ru' ||
    normalizedEmail === 'moderator' ||
    normalizedEmail === 'user@santehpro.ru';

  const isAcceptedModeratorPassword =
    password === 'demo123' ||
    password === '123456' ||
    password === 'Password123!' ||
    password === 'moderator123';

  if (isModeratorIdentifier && isAcceptedModeratorPassword) {
    let modUser = await getUserByEmail('moderator@santehpro.ru');
    if (!modUser) {
      modUser = await getUserByEmail('user@santehpro.ru');
    }
    if (!modUser) {
      modUser = await registerDbUser({
        email: 'moderator@santehpro.ru',
        password: password,
        name: 'Модератор (Пользователь)',
        phone: '+7 (999) 777-00-11',
        city: 'Москва',
        role: 'user',
        dataConsent: true,
        legalConsent: true,
      });
    }
    // Return with role 'user' (regular user access)
    return {
      ...modUser,
      role: 'user',
    };
  }

  let user = await getUserByEmail(normalizedEmail);

  if (!user) {
    // Try finding by phone number if identifier is not an email
    const cleanPhone = trimmed.replace(/\D/g, '');
    if (cleanPhone.length >= 7) {
      user = inMemoryUsers.find((u) => {
        if (!u.phone) return false;
        const uClean = u.phone.replace(/\D/g, '');
        return uClean === cleanPhone || (uClean.length >= 10 && cleanPhone.endsWith(uClean.slice(-10)));
      }) || null;
    }
  }

  if (!user) {
    throw new Error('Пользователь с указанным Email или телефоном не найден. Пожалуйста, проверьте данные или зарегистрируйтесь.');
  }

  if (!password || !password.trim()) {
    throw new Error('Пожалуйста, введите пароль.');
  }

  if (!user.passwordHash) {
    throw new Error('Для этой учетной записи не задан пароль (аккаунт создан через сторонний сервис). Воспользуйтесь быстрым входом или восстановлением пароля.');
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Неверный пароль. Пожалуйста, проверьте правильность ввода.');
  }

  return user;
}

export async function updateUserProfile(uid: string, updates: { name?: string; phone?: string; city?: string; role?: 'user' | 'specialist' | 'admin' }) {
  const setValues: Record<string, any> = {};
  if (updates.name !== undefined) setValues.name = updates.name;
  if (updates.phone !== undefined) setValues.phone = updates.phone;
  if (updates.city !== undefined) setValues.city = updates.city;
  if (updates.role !== undefined) setValues.role = updates.role;

  try {
    const result = await db.update(users).set(setValues).where(eq(users.uid, uid)).returning();
    if (result && result[0]) {
      const idx = inMemoryUsers.findIndex((u) => u.uid === uid);
      if (idx >= 0) inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...setValues };
      persistUsersToDisk();
      return result[0];
    }
  } catch {
    // Resilient fallback to local store
  }

  const idx = inMemoryUsers.findIndex((u) => u.uid === uid);
  if (idx >= 0) {
    inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...setValues };
    persistUsersToDisk();
    return inMemoryUsers[idx];
  }

  throw new Error('Пользователь не найден');
}

// Password recovery reset tokens cache with file persistence
interface PasswordResetRecord {
  identifier: string;
  code: string;
  userUid: string;
  email: string;
  phone?: string | null;
  expiresAt: number;
}

const RESET_TOKENS_FILE = path.join(DATA_DIR, 'reset_tokens.json');

function loadResetTokens(): Map<string, PasswordResetRecord> {
  const map = new Map<string, PasswordResetRecord>();
  try {
    if (fs.existsSync(RESET_TOKENS_FILE)) {
      const raw = fs.readFileSync(RESET_TOKENS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        const now = Date.now();
        for (const record of data) {
          if (record && record.expiresAt > now) {
            if (record.identifier) map.set(record.identifier, record);
            if (record.email) map.set(record.email.toLowerCase().trim(), record);
            if (record.phone) map.set(record.phone.replace(/[^\d+]/g, ''), record);
            if (record.userUid) map.set(record.userUid, record);
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return map;
}

function persistResetTokens() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const unique = Array.from(new Set(resetTokens.values()));
    fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify(unique, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

const resetTokens = loadResetTokens();

export async function getUserByIdentifier(rawIdentifier: string) {
  const identifier = rawIdentifier.trim();
  if (!identifier) return null;

  // If contains @, try email
  if (identifier.includes('@')) {
    return await getUserByEmail(identifier);
  }

  // Check phone (strip non-digits for flexible match)
  const cleanPhone = identifier.replace(/[^\d+]/g, '');
  const digitsOnly = identifier.replace(/\D/g, '');

  try {
    const all = await getUsers();
    const found = all.find((u) => {
      if (!u.phone) return false;
      const uDigits = u.phone.replace(/\D/g, '');
      return u.phone === cleanPhone || (digitsOnly.length >= 7 && uDigits.includes(digitsOnly));
    });
    if (found) {
      return await getUserByUid(found.uid);
    }
  } catch {}

  // Fallback to in-memory search
  const memFound = inMemoryUsers.find((u) => {
    if (u.email.toLowerCase() === identifier.toLowerCase()) return true;
    if (u.phone) {
      const uDigits = u.phone.replace(/\D/g, '');
      return u.phone === cleanPhone || (digitsOnly.length >= 7 && uDigits.includes(digitsOnly));
    }
    return false;
  });

  return memFound || null;
}

export async function changeUserPassword(uid: string, currentPassword?: string, newPassword?: string) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Новый пароль должен содержать не менее 6 символов');
  }

  const user = await getUserByUid(uid);
  if (!user) {
    throw new Error('Пользователь не найден');
  }

  // If existing password hash exists, verify current password
  if (user.passwordHash) {
    if (!currentPassword) {
      throw new Error('Укажите текущий пароль для подтверждения смены');
    }
    const isValid = verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Неверный текущий пароль');
    }
  }

  const newHash = hashPassword(newPassword);

  try {
    const result = await db.update(users).set({ passwordHash: newHash }).where(eq(users.uid, uid)).returning();
    if (result && result[0]) {
      const idx = inMemoryUsers.findIndex((u) => u.uid === uid);
      if (idx >= 0) inMemoryUsers[idx].passwordHash = newHash;
      persistUsersToDisk();
      return result[0];
    }
  } catch {
    // Resilient fallback to local store
  }

  const idx = inMemoryUsers.findIndex((u) => u.uid === uid);
  if (idx >= 0) {
    inMemoryUsers[idx].passwordHash = newHash;
    persistUsersToDisk();
    return inMemoryUsers[idx];
  }

  return user;
}

export async function createPasswordResetCode(rawIdentifier: string) {
  const user = await getUserByIdentifier(rawIdentifier);
  if (!user) {
    throw new Error('Пользователь с указанным Email или номером телефона не зарегистрирован');
  }

  // Generate a random 6-digit confirmation code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const normalizedKey = user.email.toLowerCase().trim();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  const record: PasswordResetRecord = {
    identifier: normalizedKey,
    code,
    userUid: user.uid,
    email: user.email,
    phone: user.phone,
    expiresAt,
  };

  resetTokens.set(normalizedKey, record);
  if (user.phone) {
    resetTokens.set(user.phone.replace(/[^\d+]/g, ''), record);
  }
  resetTokens.set(user.uid, record);
  if (rawIdentifier.trim().toLowerCase() !== normalizedKey) {
    resetTokens.set(rawIdentifier.trim().toLowerCase(), record);
  }
  persistResetTokens();

  return {
    code,
    email: user.email,
    phone: user.phone,
    name: user.name,
    expiresInMinutes: 15,
  };
}

export async function resetPasswordWithCode(rawIdentifier: string, code: string, newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Новый пароль должен содержать минимум 6 символов');
  }

  // Sanitize input code: strip non-digits and whitespaces
  const cleanCode = (code || '').replace(/\D/g, '').trim();
  if (!cleanCode) {
    throw new Error('Неверный код подтверждения. Пожалуйста, проверьте код.');
  }

  const user = await getUserByIdentifier(rawIdentifier);
  if (!user) {
    throw new Error('Пользователь не найден');
  }

  const normalizedKey = user.email.toLowerCase().trim();
  const cleanPhone = user.phone ? user.phone.replace(/[^\d+]/g, '') : null;
  const rawClean = rawIdentifier.trim().toLowerCase();

  const record =
    resetTokens.get(normalizedKey) ||
    (cleanPhone ? resetTokens.get(cleanPhone) : null) ||
    resetTokens.get(rawClean) ||
    resetTokens.get(user.uid);

  if (!record || record.code !== cleanCode) {
    throw new Error('Неверный код подтверждения. Пожалуйста, проверьте код.');
  }

  if (Date.now() > record.expiresAt) {
    resetTokens.delete(normalizedKey);
    if (cleanPhone) resetTokens.delete(cleanPhone);
    resetTokens.delete(user.uid);
    resetTokens.delete(rawClean);
    persistResetTokens();
    throw new Error('Срок действия кода истек. Запросите новый код восстановления.');
  }

  const newHash = hashPassword(newPassword);

  try {
    const result = await db.update(users).set({ passwordHash: newHash }).where(eq(users.uid, user.uid)).returning();
    if (result && result[0]) {
      const idx = inMemoryUsers.findIndex((u) => u.uid === user.uid);
      if (idx >= 0) inMemoryUsers[idx].passwordHash = newHash;
      persistUsersToDisk();
    }
  } catch {
    // Database connection may be unavailable in container; safely continue with resilient local store
  }

  const idx = inMemoryUsers.findIndex((u) => u.uid === user.uid || u.email.toLowerCase().trim() === normalizedKey);
  if (idx >= 0) {
    inMemoryUsers[idx].passwordHash = newHash;
  } else {
    inMemoryUsers.push({
      ...user,
      passwordHash: newHash,
    });
  }
  persistUsersToDisk();

  // Invalidate used code across all keys
  resetTokens.delete(normalizedKey);
  if (cleanPhone) resetTokens.delete(cleanPhone);
  resetTokens.delete(user.uid);
  resetTokens.delete(rawClean);
  persistResetTokens();

  return inMemoryUsers[idx >= 0 ? idx : inMemoryUsers.length - 1];
}

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await getUserByUid(uid);
  if (existing) {
    return existing;
  }

  const byEmail = await getUserByEmail(normalizedEmail);
  if (byEmail) {
    try {
      const updated = await db.update(users).set({ uid }).where(eq(users.id, byEmail.id)).returning();
      if (updated && updated[0]) {
        persistUsersToDisk();
        return updated[0];
      }
    } catch {}
    byEmail.uid = uid;
    persistUsersToDisk();
    return byEmail;
  }

  const now = new Date();
  const fallbackRecord: CachedUser = {
    id: inMemoryUsers.length + 1,
    uid,
    email: normalizedEmail,
    name: name || 'Пользователь',
    phone: null,
    city: 'Москва',
    passwordHash: null,
    role: 'user',
    dataConsent: true,
    consentTimestamp: now,
    createdAt: now,
  };

  try {
    const result = await db.insert(users)
      .values({
        uid,
        email: normalizedEmail,
        name: name || 'Пользователь',
        city: 'Москва',
        dataConsent: true,
        consentTimestamp: now,
        createdAt: now,
      })
      .returning();

    if (result && result[0]) {
      inMemoryUsers.push(result[0] as any);
      persistUsersToDisk();
      return result[0];
    }
  } catch {
    // Fallback to in-memory store
  }

  inMemoryUsers.push(fallbackRecord);
  persistUsersToDisk();
  return fallbackRecord;
}

export async function getUsers() {
  try {
    const list = await db.select({
      id: users.id,
      uid: users.uid,
      email: users.email,
      name: users.name,
      phone: users.phone,
      city: users.city,
      role: users.role,
      dataConsent: users.dataConsent,
      consentTimestamp: users.consentTimestamp,
      createdAt: users.createdAt,
    }).from(users);
    if (list && list.length > 0) return list;
  } catch {
    // Fallback to in-memory store
  }

  return inMemoryUsers.map((u) => ({
    id: u.id,
    uid: u.uid,
    email: u.email,
    name: u.name,
    phone: u.phone || null,
    city: u.city || 'Москва',
    role: u.role,
    dataConsent: u.dataConsent,
    consentTimestamp: u.consentTimestamp,
    createdAt: u.createdAt,
  }));
}

export async function deleteDbUser(uid: string) {
  try {
    await db.delete(userPurchases).where(eq(userPurchases.userUid, uid));
    await db.delete(userFavorites).where(eq(userFavorites.userUid, uid));
    const deleted = await db.delete(users).where(eq(users.uid, uid)).returning();
    const idx = inMemoryUsers.findIndex((u) => u.uid === uid);
    if (idx >= 0) inMemoryUsers.splice(idx, 1);
    persistUsersToDisk();
    return deleted[0] || null;
  } catch (error) {
    const idx = inMemoryUsers.findIndex((u) => u.uid === uid);
    if (idx >= 0) {
      const removed = inMemoryUsers.splice(idx, 1)[0];
      persistUsersToDisk();
      return removed;
    }
    return null;
  }
}

