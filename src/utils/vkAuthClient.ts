/**
 * VK ID SDK Integration for SantehPro
 * Official App ID: 54798550
 */

export const VK_APP_ID = 54798550;
export const VK_REDIRECT_URL = 'https://santehpro.info/api/auth/vk/callback';

declare global {
  interface Window {
    VKIDSDK?: any;
  }
}

let isVkInitialized = false;

export const initVkIdSdk = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (!window.VKIDSDK) return false;

  if (isVkInitialized) return true;

  try {
    const VKID = window.VKIDSDK;
    VKID.Config.init({
      app: VK_APP_ID,
      redirectUrl: VK_REDIRECT_URL,
      responseMode: VKID.ConfigResponseMode?.Callback || 'callback',
      source: VKID.ConfigSource?.LOWCODE || 1,
      scope: 'email phone',
    });
    isVkInitialized = true;
    return true;
  } catch (err) {
    console.warn('[VK ID] Config init error:', err);
    return false;
  }
};

export interface VkAuthUser {
  id: number | string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  token?: string;
}

export const renderVkOneTapWidget = (
  container: HTMLElement,
  onSuccess: (user: VkAuthUser) => void,
  onError: (err: any) => void
): (() => void) | null => {
  if (!initVkIdSdk() || !window.VKIDSDK) return null;

  try {
    const VKID = window.VKIDSDK;
    const oneTap = new VKID.OneTap();

    oneTap
      .render({
        container,
        showAlternativeLogin: true,
        styles: {
          width: Math.min(container.clientWidth || 340, 360),
          borderRadius: 16,
        },
        oauthList: ['mail_ru'],
      })
      .on(VKID.WidgetEvents?.ERROR || 'error', (err: any) => {
        console.warn('[VK ID Widget Error]:', err);
        onError(err);
      })
      .on(VKID.OneTapInternalEvents?.LOGIN_SUCCESS || 'login:success', async (payload: any) => {
        try {
          const code = payload.code;
          const deviceId = payload.device_id;

          if (VKID.Auth && VKID.Auth.exchangeCode) {
            const data = await VKID.Auth.exchangeCode(code, deviceId);
            const user = data.user || data;
            onSuccess({
              id: user.id || user.user_id || payload.user_id,
              first_name: user.first_name || '',
              last_name: user.last_name || '',
              avatar: user.avatar || user.photo_200 || user.photo_100 || '',
              phone: user.phone || '',
              email: user.email || '',
              token: data.access_token || '',
            });
          } else {
            // Direct payload fallback
            onSuccess({
              id: payload.user_id || `vk_${Date.now()}`,
              first_name: payload.first_name || 'Пользователь',
              last_name: payload.last_name || 'ВКонтакте',
              token: payload.token || '',
            });
          }
        } catch (exchangeErr) {
          console.error('[VK ID Code Exchange Error]:', exchangeErr);
          onError(exchangeErr);
        }
      });

    return () => {
      try {
        if (oneTap.destroy) oneTap.destroy();
      } catch {}
    };
  } catch (err) {
    console.warn('[VK ID OneTap render error]:', err);
    return null;
  }
};
