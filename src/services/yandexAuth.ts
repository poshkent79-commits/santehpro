import fs from 'fs';
import path from 'path';

export interface YandexAuthConfig {
  clientId: string;
  clientSecret: string;
  enabled?: boolean;
}

export interface YandexUserInfo {
  id: string;
  login: string;
  client_id?: string;
  default_email?: string;
  emails?: string[];
  first_name?: string;
  last_name?: string;
  real_name?: string;
  display_name?: string;
  default_avatar_id?: string;
  is_avatar_empty?: boolean;
  default_phone?: {
    id?: number;
    number: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const YANDEX_CONFIG_FILE = path.join(DATA_DIR, 'yandex_config.json');

/**
 * Returns saved Yandex OAuth configuration from disk or process.env
 */
export function getYandexAuthConfig(): YandexAuthConfig | null {
  try {
    if (fs.existsSync(YANDEX_CONFIG_FILE)) {
      const raw = fs.readFileSync(YANDEX_CONFIG_FILE, 'utf-8');
      const saved = JSON.parse(raw) as YandexAuthConfig;
      if (saved && saved.clientId?.trim() && saved.clientSecret?.trim()) {
        return {
          clientId: saved.clientId.trim(),
          clientSecret: saved.clientSecret.trim(),
          enabled: saved.enabled !== false,
        };
      }
    }
  } catch {
    // ignore
  }

  const envClientId = process.env.YANDEX_CLIENT_ID?.trim();
  const envClientSecret = process.env.YANDEX_CLIENT_SECRET?.trim();

  if (envClientId && envClientSecret) {
    return {
      clientId: envClientId,
      clientSecret: envClientSecret,
      enabled: true,
    };
  }

  return null;
}

export function saveYandexAuthConfig(config: YandexAuthConfig): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      YANDEX_CONFIG_FILE,
      JSON.stringify(
        {
          clientId: config.clientId.trim(),
          clientSecret: config.clientSecret.trim(),
          enabled: config.enabled ?? true,
          updatedAt: new Date().toISOString(),
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch (err) {
    console.error('Failed to save Yandex OAuth config:', err);
    throw new Error('Не удалось сохранить конфигурацию Яндекс OAuth на диск');
  }
}

export const YANDEX_CLIENT_ID = 'f146aa1e2107499cb7d79aac0a771eeb';

/**
 * Builds the provider authorization URL directly (per OAuth skill guidelines)
 */
export function buildYandexAuthorizeUrl(clientId: string, redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    force_confirm: 'no',
    scope: 'login:email login:info login:avatar',
  });
  if (state) {
    params.set('state', state);
  }
  return `https://oauth.yandex.ru/authorize?${params.toString()}`;
}

/**
 * Synchronously generates a complete Yandex authorization URL with encoded state.
 * Because this is synchronous, window.open() can be called immediately inside the user click handler
 * without losing the transient user-activation permission (preventing popup blocker issues).
 */
export function createYandexAuthUrl(sessionId: string, returnOrigin: string, redirectUri: string): string {
  const statePayload = JSON.stringify({ sessionId, returnOrigin, redirectUri });
  let stateParam = '';
  try {
    stateParam = btoa(unescape(encodeURIComponent(statePayload)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    stateParam = encodeURIComponent(statePayload);
  }
  return buildYandexAuthorizeUrl(YANDEX_CLIENT_ID, redirectUri, stateParam);
}

/**
 * Exchanges authorization code for access token
 */
export async function exchangeYandexCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number }> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const res = await fetch('https://oauth.yandex.ru/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    const desc = data.error_description || data.error || 'Ошибка обмена токена в Яндекс OAuth';
    throw new Error(desc);
  }

  return data;
}

/**
 * Fetches user profile information from Yandex
 */
export async function fetchYandexUserInfo(accessToken: string): Promise<YandexUserInfo> {
  const res = await fetch('https://login.yandex.ru/info?format=json', {
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Ошибка получения данных профиля Яндекс: статус ${res.status}`);
  }

  const data = (await res.json()) as YandexUserInfo;
  return data;
}
