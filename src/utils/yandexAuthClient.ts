export const YANDEX_CLIENT_ID = 'f146aa1e2107499cb7d79aac0a771eeb';

/**
 * Builds the provider authorization URL directly (pure browser-compatible utility)
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
export function createYandexAuthUrl(
  sessionId: string,
  returnOrigin: string,
  redirectUri: string,
  role?: 'user' | 'specialist'
): string {
  const statePayload = JSON.stringify({ sessionId, returnOrigin, redirectUri, role: role || 'user' });
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
