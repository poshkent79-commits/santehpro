// Utility for logging and rendering legally binding Simple Electronic Signature (ПЭП) audit trails
// (ст. 434 ГК РФ и Федеральный закон № 63-ФЗ «Об электронной подписи»)

export interface SignatureAuditMetadata {
  signedAt: string; // ISO 8601
  signedAtMsk: string; // e.g. "06.10.2026, 18:42:15 МСК (15:42:15 UTC)"
  ip: string; // e.g. "178.62.204.15"
  deviceId: string; // e.g. "DEV-SP-4F8A-9C12 (Android / Chrome)"
  authAccount: string; // e.g. "+7 (926) 555-01-23 • Аккаунт: poshkent79@gmail.com"
}

// Generate or retrieve persistent Device ID from localStorage
export function getPersistentDeviceId(): string {
  if (typeof window === 'undefined') return 'DEV-SERVER';
  try {
    let devId = localStorage.getItem('santehpro_device_id');
    if (!devId) {
      const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      devId = `DEV-SP-${part1}-${part2}`;
      localStorage.setItem('santehpro_device_id', devId);
    }
    return devId;
  } catch {
    return 'DEV-SP-BROWSER';
  }
}

// Extract human-friendly OS and Browser info
export function getDevicePlatformInfo(): string {
  if (typeof window === 'undefined') return 'Web Client';
  const ua = navigator.userAgent || '';
  let os = 'Неизвестная ОС';
  if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Браузер';
  if (/chrome|crios/i.test(ua) && !/edg|opr/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/yabrowser/i.test(ua)) browser = 'Яндекс Браузер';

  const isMobile = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
  return `${os} / ${browser} (${isMobile})`;
}

// Combine Device ID and Platform
export function getFullDeviceFingerprint(): string {
  const id = getPersistentDeviceId();
  const platform = getDevicePlatformInfo();
  return `${id} (${platform})`;
}

// Format double timestamp: MSK (UTC+3) and UTC
export function formatLegalTimestamp(dateOrIso?: string): { msk: string; utc: string; combined: string } {
  try {
    const date = dateOrIso ? new Date(dateOrIso) : new Date();
    if (isNaN(date.getTime())) {
      return { msk: 'Дата не указана', utc: 'UTC', combined: 'Время не зафиксировано' };
    }

    const mskFormatted = new Intl.DateTimeFormat('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);

    const utcFormatted = new Intl.DateTimeFormat('ru-RU', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);

    return {
      msk: `${mskFormatted} МСК`,
      utc: `${utcFormatted} UTC`,
      combined: `${mskFormatted} МСК (${utcFormatted} UTC)`,
    };
  } catch {
    const fallback = new Date().toLocaleString('ru-RU');
    return {
      msk: `${fallback} МСК`,
      utc: `${fallback} UTC`,
      combined: `${fallback} МСК`,
    };
  }
}

// Fetch current IP with timeout and cached fallback
let cachedClientIp = '';
export async function getClientIp(): Promise<string> {
  if (cachedClientIp) return cachedClientIp;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    const res = await fetch('/api/client-network-info', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) {
        cachedClientIp = data.ip;
        return data.ip;
      }
    }
  } catch {
    // ignore
  }

  // Fallback to local indicator; server will enrich real IP on POST /api/contracts/:id/sign
  return 'Определён сервером';
}

// Get the authenticated account identifier
export function getAuthAccountDescription(role: 'master' | 'client', fallbackPhone?: string): string {
  if (typeof window === 'undefined') return fallbackPhone || 'Аккаунт сервиса';
  try {
    const stored = localStorage.getItem('santehpro_current_user') || localStorage.getItem('santehpro_auth_user');
    if (stored) {
      const user = JSON.parse(stored);
      const parts: string[] = [];
      if (user.phone) parts.push(user.phone);
      else if (fallbackPhone) parts.push(fallbackPhone);

      if (user.email) {
        if (user.email.includes('vk.user') || user.email.includes('id.vk.com')) {
          parts.push(`VK ID (${user.name || user.uid || ''})`);
        } else if (user.email.includes('yandex')) {
          parts.push(`Яндекс ID (${user.email})`);
        } else {
          parts.push(user.email);
        }
      } else if (user.name) {
        parts.push(`ID: ${user.name}`);
      }

      if (parts.length > 0) return parts.join(' • ');
    }
  } catch {
    // fallback below
  }

  if (fallbackPhone) {
    return `${fallbackPhone} (подтверждён в сервисе)`;
  }
  return role === 'master' ? 'Аккаунт мастера «СантехПро»' : 'Авторизованный заказчик';
}

// Full helper to capture all audit fields before signing
export async function captureAuditTrail(role: 'master' | 'client', fallbackPhone?: string): Promise<SignatureAuditMetadata> {
  const now = new Date().toISOString();
  const timeObj = formatLegalTimestamp(now);
  const ip = await getClientIp();
  const deviceId = getFullDeviceFingerprint();
  const authAccount = getAuthAccountDescription(role, fallbackPhone);

  return {
    signedAt: now,
    signedAtMsk: timeObj.combined,
    ip,
    deviceId,
    authAccount,
  };
}
