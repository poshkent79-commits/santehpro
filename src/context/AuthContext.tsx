import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserPurchase, UserFavorite, Article } from '../types';
import { getFirebaseAuth, getGoogleAuthProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { createYandexAuthUrl } from '../utils/yandexAuthClient';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  purchases: UserPurchase[];
  favorites: UserFavorite[];
  loginWithGoogle: (legalConsentData?: {
    dataConsentAccepted?: boolean;
    termsAccepted?: boolean;
  }) => Promise<UserProfile>;
  logoutGoogle: () => Promise<void>;
  loginWithYandex: (demoDirect?: boolean, selectedRole?: 'user' | 'specialist') => Promise<UserProfile>;
  loginWithVk: (userData: any, selectedRole?: 'user' | 'specialist') => Promise<UserProfile>;
  register: (
    data: {
      email: string;
      password?: string;
      name: string;
      phone?: string;
      city?: string;
      dataConsent?: boolean;
      legalConsent?: boolean;
      legalChecklist?: Record<string, boolean>;
    },
    options?: { autoLogin?: boolean }
  ) => Promise<UserProfile>;
  login: (data: { email: string; password?: string }) => Promise<UserProfile>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; city?: string }) => Promise<void>;
  changePassword: (data: { currentPassword?: string; newPassword: string }) => Promise<void>;
  requestPasswordReset: (identifier: string) => Promise<{ message: string; email: string; phone?: string; expiresInMinutes?: number; isSmtp?: boolean }>;
  resetPassword: (data: { identifier: string; code: string; newPassword: string }) => Promise<UserProfile>;
  refreshPurchases: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  hasPurchasedCourse: (courseId: string) => boolean;
  isProMember: boolean;
  isFavorite: (articleId: string) => boolean;
  toggleFavorite: (article: Article) => Promise<boolean>;
  buyCourse: (course: Article, paymentMethod?: string) => Promise<UserPurchase>;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  authModalReason: string;
  openAuthModal: (mode?: 'login' | 'register' | 'forgot', reason?: string, onComplete?: () => void) => void;
  closeAuthModal: () => void;
  authNotice: { title: string; message: string; type: 'login' | 'register'; timestamp: number } | null;
  dismissAuthNotice: () => void;
  triggerAuthNotice: (title?: string, message?: string, type?: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'santehpro_auth_user';
const GUEST_FAVORITES_KEY = 'santehpro_guest_favorites';
const SUPER_ADMIN_EMAILS = [
  'poshkent79@gmail.com',
  'santehpro.info@yandex.ru',
  'admin@santehpro.ru',
  'admin@santehpro.info',
];
const SUPER_ADMIN_PHONES = ['+79247889900', '79247889900', '89247889900', '9247889900'];

const isSuperAdminUser = (user?: Partial<UserProfile> | null): boolean => {
  if (!user) return false;
  const email = user.email?.toLowerCase().trim();
  if (
    email === 'buyer@santehpro.info' ||
    email === 'yookassa@santehpro.info' ||
    String(user.id) === 'yookassa-buyer-audit-id' ||
    String(user.id) === 'yookassa-inspector-user-id'
  ) {
    return false;
  }
  if (email && SUPER_ADMIN_EMAILS.includes(email)) return true;
  const phoneDigits = user.phone?.replace(/\D/g, '') || '';
  if (phoneDigits === '79247889900' || phoneDigits === '89247889900' || phoneDigits.endsWith('9247889900')) return true;
  return user.role === 'admin';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem('santehpro_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isSuperAdminUser(parsed)) {
          parsed.role = 'admin';
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [favorites, setFavorites] = useState<UserFavorite[]>(() => {
    try {
      const saved = localStorage.getItem(GUEST_FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [authNotice, setAuthNotice] = useState<{
    title: string;
    message: string;
    type: 'login' | 'register';
    timestamp: number;
  } | null>(null);

  const triggerAuthNotice = (
    title: string = 'Успешный вход',
    message: string = 'Вы успешно вошли в аккаунт. Доступ ко всем возможностям справочника открыт.',
    type: 'login' | 'register' = 'login'
  ) => {
    setAuthNotice({
      title,
      message,
      type,
      timestamp: Date.now(),
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('santehpro_auth_success', {
          detail: { title, message, type },
        })
      );
    }
  };

  const dismissAuthNotice = () => {
    setAuthNotice(null);
  };

  useEffect(() => {
    if (!authNotice) return;
    const timer = setTimeout(() => {
      setAuthNotice(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [authNotice]);

  // Auth modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('register');
  const [authModalReason, setAuthModalReason] = useState<string>('');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // 1. Initial check for URL query redirect params (?code=... or ?auth=success&uid=... or ?auth=success&sessionId=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const authState = urlParams.get('state');
    const authSuccess = urlParams.get('auth');
    const authUid = urlParams.get('uid');
    const authSessionId = urlParams.get('sessionId');

    if (authCode || (authSuccess === 'success' && (authUid || authSessionId))) {
      (async () => {
        try {
          let profile: UserProfile | null = null;

          // Flow A: Direct code exchange (works seamlessly in SPA redirects and mobile browsers)
          if (authCode) {
            console.log('[Yandex OAuth Client] Exchanging authorization code directly via API...');
            const exRes = await fetch('/api/auth/yandex/exchange', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: authCode,
                state: authState || undefined,
                redirectUri: `${window.location.origin}/auth/yandex/callback`,
              }),
            });
            if (exRes.ok) {
              const exData = await exRes.json();
              if (exData?.user?.uid) {
                profile = exData.user;
              }
            } else {
              console.warn('[Yandex OAuth Client] Code exchange failed:', await exRes.text());
            }
          }
          // Flow B: Session activation via UID
          else if (authUid) {
            const res = await fetch('/api/auth/activate-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uid: authUid }),
            });
            if (res.ok) {
              const data = await res.json();
              profile = data.user;
            }
          }
          // Flow C: Session activation via Session ID
          else if (authSessionId) {
            const res = await fetch(`/api/auth/session-status?sessionId=${encodeURIComponent(authSessionId)}`);
            if (res.ok) {
              const data = await res.json();
              if (data.status === 'success' && data.user) {
                profile = data.user;
              }
            }
          }

          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
            localStorage.setItem('santehpro_current_user', JSON.stringify(profile));
            triggerAuthNotice('Успешный вход', 'Вы успешно вошли через Яндекс ID. Доступ в личный кабинет открыт.', 'login');
            setIsAuthModalOpen(false);

            // Notify app to navigate straight to cabinet tab
            window.dispatchEvent(new CustomEvent('santehpro_auth_success', { detail: profile }));

            try {
              sessionStorage.removeItem('santehpro_oauth_state');
            } catch {}
          }
        } catch (e) {
          console.error('Error activating session from URL params:', e);
        } finally {
          try {
            const cleanUrl = window.location.pathname === '/auth/yandex/callback' || window.location.pathname === '/auth/yandex/callback/'
              ? '/'
              : window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
          } catch {}
        }
      })();
    }
  }, []);

  // 2. Global cross-tab and cross-window sync (BroadcastChannel + storage events)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY || e.key === 'santehpro_current_user') {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed?.uid) {
              setCurrentUser(parsed);
              triggerAuthNotice('Успешный вход', 'Сессия активирована. Личный кабинет открыт.', 'login');
              setIsAuthModalOpen(false);
            }
          } catch {}
        } else if (!e.newValue && currentUser) {
          // Check if both keys are truly gone before logging out
          const user1 = localStorage.getItem(AUTH_STORAGE_KEY);
          const user2 = localStorage.getItem('santehpro_current_user');
          if (!user1 && !user2) {
            setCurrentUser(null);
          }
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('santehpro_auth_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'YANDEX_AUTH_SUCCESS' && event.data?.user) {
            const user = event.data.user;
            setCurrentUser(user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
            localStorage.setItem('santehpro_current_user', JSON.stringify(user));
            triggerAuthNotice('Успешный вход', 'Вы успешно вошли через Яндекс ID. Доступ в личный кабинет открыт.', 'login');
            setIsAuthModalOpen(false);
          } else if (event.data?.type === 'AUTH_LOGOUT') {
            setCurrentUser(null);
          }
        };
      }
    } catch {}

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, [currentUser]);

  // 3. Fallback server cookie check if currentUser is null on mount
  useEffect(() => {
    if (!currentUser) {
      fetch('/api/auth/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user?.uid) {
            setCurrentUser(data.user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
            localStorage.setItem('santehpro_current_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async (): Promise<UserProfile> => {
    throw new Error('Вход через Google отключен. Для приложения «СантехПро» используется исключительно безопасный и стабильный вход через Яндекс ID.');
  };

  const logoutGoogle = async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
    }
  };

  const loginWithVk = async (
    userData: any,
    selectedRole: 'user' | 'specialist' = 'user'
  ): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const vkId = String(userData.id || userData.user_id || Date.now());
      const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(' ') || userData.name || 'Пользователь VK ID';
      const email = userData.email || `vk_${vkId}@vk.id`;
      const phone = userData.phone || '';

      const res = await fetch('/api/auth/vk/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vkId,
          name: fullName,
          email,
          phone,
          avatar: userData.avatar || userData.photo_200 || '',
          role: selectedRole,
        }),
      });

      let profile: UserProfile;
      if (res.ok) {
        const data = await res.json();
        profile = data.user;
      } else {
        profile = {
          uid: `vk_${vkId}`,
          email,
          name: fullName,
          phone,
          role: selectedRole,
          dataConsent: true,
          legalConsent: true,
          createdAt: new Date().toISOString(),
        };
      }

      setCurrentUser(profile);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        localStorage.setItem('santehpro_current_user', JSON.stringify(profile));
      } catch {}

      triggerAuthNotice('Успешный вход', `Вы вошли как ${fullName} через VK ID`, 'login');
      closeAuthModal();

      if (pendingCallback) {
        const cb = pendingCallback;
        setPendingCallback(null);
        cb();
      }

      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithYandex = async (
    demoDirect?: boolean,
    selectedRole: 'user' | 'specialist' = 'user'
  ): Promise<UserProfile> => {
    // 1. If demoDirect requested (e.g. preview testing before OAuth keys are configured in Yandex Console)
    if (demoDirect) {
      const res = await fetch('/api/auth/yandex/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'yandex_user@yandex.ru',
          name: selectedRole === 'specialist' ? 'Иван Иванов (мастер Яндекс)' : 'Иван Иванов (Яндекс ID)',
          phone: '+7 (999) 777-12-34',
          role: selectedRole,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Ошибка тестовой авторизации Яндекс ID');
      }
      const data = await res.json();
      const profile: UserProfile = data.user;
      setCurrentUser(profile);
      triggerAuthNotice('Успешный вход', 'Вы успешно вошли через Яндекс ID. Доступ ко всем возможностям открыт.', 'login');
      closeAuthModal();
      if (pendingCallback) {
        const cb = pendingCallback;
        setPendingCallback(null);
        cb();
      }
      return profile;
    }

    // 2. Synchronously generate authorization URL immediately (preserving transient user gesture token)
    const currentOrigin = window.location.origin;
    const redirectUri = `${currentOrigin}/auth/yandex/callback`;
    const sessionId = `ya_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const returnOrigin = currentOrigin;

    // Detect if running inside an iframe (e.g., Google AI Studio preview)
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

    const authUrl = createYandexAuthUrl(sessionId, returnOrigin, redirectUri, selectedRole);

    try {
      sessionStorage.setItem('santehpro_oauth_state', JSON.stringify({
        sessionId,
        returnOrigin,
        role: selectedRole,
        timestamp: Date.now(),
        returnTab: 'cabinet',
      }));
    } catch {}

    // 3. Open OAuth provider authorization URL in popup or new tab
    return new Promise((resolve, reject) => {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      let popup: Window | null = null;
      try {
        // Called synchronously inside user click event - never blocked by mobile Chrome or desktop
        popup = window.open(
          authUrl,
          '_blank',
          `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
        );
      } catch (e) {
        console.warn('[Yandex Auth] window.open failed:', e);
      }

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Fallback handling when popup is blocked
        if (!isInIframe) {
          // If in a top-level tab (e.g. on santehpro.info directly), same-tab navigation is safe
          window.location.assign(authUrl);
          return;
        }
        // When running in an iframe (like AI Studio preview), location.assign fails because
        // Yandex OAuth denies rendering in iframes (X-Frame-Options: SAMEORIGIN).
        // Pass POPUP_BLOCKED error with direct authUrl so the UI displays a direct anchor link!
        reject(new Error('POPUP_BLOCKED:' + authUrl));
        return;
      }

      let cleanupDone = false;
      let pollingTimer: any = null;
      let checkTimer: any = null;
      let channel: BroadcastChannel | null = null;

      const cleanup = () => {
        if (cleanupDone) return;
        cleanupDone = true;
        window.removeEventListener('message', handleMessage);
        window.removeEventListener('storage', handleStorage);
        if (pollingTimer) clearInterval(pollingTimer);
        if (checkTimer) clearInterval(checkTimer);
        if (channel) {
          try {
            channel.close();
          } catch {}
        }
      };

      const handleSuccess = (profile: UserProfile) => {
        cleanup();
        setCurrentUser(profile);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          localStorage.setItem('santehpro_current_user', JSON.stringify(profile));
          sessionStorage.removeItem('santehpro_oauth_state');
        } catch {}
        triggerAuthNotice('Успешный вход', 'Вы успешно вошли через Яндекс ID. Доступ в личный кабинет открыт.', 'login');
        closeAuthModal();

        // Notify app to switch tab to cabinet
        window.dispatchEvent(new CustomEvent('santehpro_auth_success', { detail: profile }));

        if (pendingCallback) {
          const cb = pendingCallback;
          setPendingCallback(null);
          cb();
        }
        resolve(profile);
      };

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'YANDEX_AUTH_SUCCESS' && event.data?.user) {
          handleSuccess(event.data.user);
        } else if (event.data?.type === 'YANDEX_AUTH_ERROR') {
          cleanup();
          reject(new Error(event.data.error || 'Ошибка входа через Яндекс ID'));
        }
      };

      const handleStorage = (event: StorageEvent) => {
        if ((event.key === AUTH_STORAGE_KEY || event.key === 'santehpro_current_user') && event.newValue) {
          try {
            const user = JSON.parse(event.newValue);
            if (user?.uid) {
              handleSuccess(user);
            }
          } catch {}
        }
      };

      // BroadcastChannel listener
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          channel = new BroadcastChannel('santehpro_auth_channel');
          channel.onmessage = (event) => {
            if (event.data?.type === 'YANDEX_AUTH_SUCCESS' && event.data?.user) {
              handleSuccess(event.data.user);
            }
          };
        }
      } catch {}

      window.addEventListener('message', handleMessage);
      window.addEventListener('storage', handleStorage);

      // Active polling of session status on the backend every 600ms
      pollingTimer = setInterval(async () => {
        if (cleanupDone) return;
        try {
          const res = await fetch(`/api/auth/session-status?sessionId=${encodeURIComponent(sessionId)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'success' && data.user) {
              handleSuccess(data.user);
            } else if (data.status === 'error') {
              cleanup();
              reject(new Error(data.error || 'Ошибка входа через Яндекс ID'));
            }
          }
        } catch {}
      }, 600);

      // Check if popup was closed by user with resilient multi-attempt checks
      checkTimer = setInterval(() => {
        if (popup.closed) {
          if (checkTimer) {
            clearInterval(checkTimer);
            checkTimer = null;
          }
          let retries = 6;
          const retryCheck = async () => {
            if (cleanupDone) return;
            try {
              // 1. Session status on server
              const res = await fetch(`/api/auth/session-status?sessionId=${encodeURIComponent(sessionId)}`);
              if (res.ok) {
                const data = await res.json();
                if (data.status === 'success' && data.user) {
                  handleSuccess(data.user);
                  return;
                }
              }
              // 2. Local storage check
              const saved = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem('santehpro_current_user');
              if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.uid) {
                  handleSuccess(parsed);
                  return;
                }
              }
              // 3. Check /api/auth/me
              const meRes = await fetch('/api/auth/me');
              if (meRes.ok) {
                const meData = await meRes.json();
                if (meData?.user?.uid) {
                  handleSuccess(meData.user);
                  return;
                }
              }
            } catch {}

            retries--;
            if (retries > 0) {
              setTimeout(retryCheck, 500);
            } else {
              if (!cleanupDone) {
                cleanup();
                reject(new Error('Окно авторизации Яндекс ID было закрыто до завершения входа'));
              }
            }
          };
          setTimeout(retryCheck, 300);
        }
      }, 700);
    });
  };

  // Synchronize currentUser to localStorage across all keys
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      localStorage.setItem('santehpro_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('santehpro_current_user');
    }
  }, [currentUser]);

  // Fetch purchases from Cloud SQL with graceful offline caching
  const refreshPurchases = async () => {
    if (!currentUser?.uid) {
      setPurchases([]);
      return;
    }
    const userPurchasesKey = `santehpro_purchases_${currentUser.uid}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`/api/user/purchases?uid=${encodeURIComponent(currentUser.uid)}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPurchases(data);
          try {
            localStorage.setItem(userPurchasesKey, JSON.stringify(data));
          } catch {}
        }
      }
    } catch (_err) {
      // Graceful offline fallback: read from local cache if present
      try {
        const cached = localStorage.getItem(userPurchasesKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setPurchases(parsed);
          }
        }
      } catch {}
    }
  };

  // Fetch favorites from Cloud SQL (or fallback to local)
  const refreshFavorites = async () => {
    if (!currentUser?.uid) {
      try {
        const saved = localStorage.getItem(GUEST_FAVORITES_KEY);
        if (saved) setFavorites(JSON.parse(saved));
      } catch {}
      return;
    }
    const userFavoritesKey = `santehpro_favorites_${currentUser.uid}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`/api/user/favorites?uid=${encodeURIComponent(currentUser.uid)}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFavorites(data);
          try {
            localStorage.setItem(userFavoritesKey, JSON.stringify(data));
            localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(data));
          } catch {}
        }
      }
    } catch (_err) {
      // Graceful offline fallback: read from local cache
      try {
        const cached = localStorage.getItem(userFavoritesKey) || localStorage.getItem(GUEST_FAVORITES_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
          }
        }
      } catch {}
    }
  };

  // On mount or user change, load purchases and favorites
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      if (currentUser?.uid) {
        try {
          // Verify profile from server with safe timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const profRes = await fetch(`/api/user/profile?uid=${encodeURIComponent(currentUser.uid)}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' }
          });
          clearTimeout(timeoutId);

          if (profRes.ok) {
            const freshUser = await profRes.json();
            if (freshUser && freshUser.uid) {
              if (isSuperAdminUser(freshUser)) {
                freshUser.role = 'admin';
              }
              setCurrentUser(freshUser);
            }
          }
        } catch (_e) {
          // Offline or transient server boot - continue with cached local user profile
        }
        await Promise.all([refreshPurchases(), refreshFavorites()]);
      } else {
        setPurchases([]);
        try {
          const saved = localStorage.getItem(GUEST_FAVORITES_KEY);
          setFavorites(saved ? JSON.parse(saved) : []);
        } catch {
          setFavorites([]);
        }
      }
      setIsLoading(false);
    };

    loadUserData();
  }, [currentUser?.uid]);

  const register = async (data: {
    email: string;
    password?: string;
    name: string;
    phone?: string;
    city?: string;
    dataConsent?: boolean;
    legalConsent?: boolean;
    legalChecklist?: Record<string, boolean>;
  }, options?: { autoLogin?: boolean }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Ошибка при регистрации');
    }

    const user: UserProfile = result.user;
    if (options?.autoLogin !== false) {
      setCurrentUser(user);
      triggerAuthNotice('Успешный вход', 'Регистрация прошла успешно! Доступ ко всем разделам справочника открыт.', 'register');
      closeAuthModal();

      if (pendingCallback) {
        const cb = pendingCallback;
        setPendingCallback(null);
        cb();
      }
    }

    return user;
  };

  const login = async (data: { email: string; password?: string }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Ошибка при входе');
    }

    const user: UserProfile = result.user;
    setCurrentUser(user);
    triggerAuthNotice('Успешный вход', 'Вы успешно вошли в аккаунт. Доступ ко всем возможностям справочника открыт.', 'login');
    closeAuthModal();

    if (pendingCallback) {
      const cb = pendingCallback;
      setPendingCallback(null);
      cb();
    }

    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    setPurchases([]);
    setFavorites([]);
    setAuthNotice(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('santehpro_current_user');
      localStorage.removeItem('santehpro_master_specialist_id');
      localStorage.removeItem('santehpro_cached_master_profile');
      localStorage.removeItem('santehpro_last_master_application');
      localStorage.removeItem('santehpro_master_profile_cache');
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('santehpro_master_') || k.startsWith('santehpro_cached_master_'))) {
          localStorage.removeItem(k);
        }
      }
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('santehpro_auth_channel');
        ch.postMessage({ type: 'AUTH_LOGOUT' });
        ch.close();
      }
    } catch {}
    const auth = getFirebaseAuth();
    if (auth) {
      signOut(auth).catch(() => {});
    }
  };

  const deleteAccount = async () => {
    if (!currentUser?.uid) throw new Error('Пользователь не авторизован');

    const res = await fetch('/api/user/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: currentUser.uid }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Не удалось удалить аккаунт из базы данных');
    }

    logout();
  };

  const updateProfile = async (data: { name?: string; phone?: string; city?: string }) => {
    if (!currentUser?.uid) throw new Error('Пользователь не авторизован');

    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: currentUser.uid, ...data }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Не удалось обновить профиль');
    }

    const updated = await res.json();
    setCurrentUser(updated);
  };

  const changePassword = async (data: { currentPassword?: string; newPassword: string }) => {
    if (!currentUser?.uid) throw new Error('Пользователь не авторизован');

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: currentUser.uid, ...data }),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Не удалось изменить пароль');
    }
  };

  const requestPasswordReset = async (identifier: string) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim() }),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Не удалось отправить инструкции по сбросу пароля');
    }

    return result;
  };

  const resetPassword = async (data: { identifier: string; code: string; newPassword: string }): Promise<UserProfile> => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Не удалось сбросить пароль');
    }

    const user: UserProfile = result.user;
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem('santehpro_current_user', JSON.stringify(user));
    } catch {}
    triggerAuthNotice('Пароль обновлен', 'Вы успешно вошли в аккаунт с новым паролем. Личный кабинет открыт.', 'login');
    closeAuthModal();

    if (pendingCallback) {
      const cb = pendingCallback;
      setPendingCallback(null);
      cb();
    }

    return user;
  };

  // All features and courses are 100% free with donation model; PRO subscriptions removed
  const isProMember = false;

  const hasPurchasedCourse = (_courseId: string) => {
    return true;
  };

  const isFavorite = (articleId: string) => {
    return favorites.some((f) => f.articleId === articleId);
  };

  const toggleFavorite = async (article: Article): Promise<boolean> => {
    const isCurrentlyFav = favorites.some((f) => f.articleId === article.id);

    if (isCurrentlyFav) {
      // Remove from favorites immediately
      const updated = favorites.filter((f) => f.articleId !== article.id);
      setFavorites(updated);
      try {
        localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(updated));
      } catch {}

      if (currentUser?.uid) {
        try {
          await fetch(`/api/user/favorites/${encodeURIComponent(article.id)}?uid=${encodeURIComponent(currentUser.uid)}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.error('Failed to remove favorite from server:', err);
        }
      }
      return false;
    } else {
      // Add to favorites immediately
      const newFav: UserFavorite = {
        id: `fav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userUid: currentUser?.uid || 'guest',
        articleId: article.id,
        articleTitle: article.title,
        category: article.category,
        coverImage: article.coverImage,
        type: article.type || 'instruction',
        createdAt: new Date().toISOString(),
      };
      const updated = [newFav, ...favorites];
      setFavorites(updated);
      try {
        localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(updated));
      } catch {}

      if (currentUser?.uid) {
        try {
          await fetch('/api/user/favorites/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userUid: currentUser.uid,
              articleId: article.id,
              articleTitle: article.title,
              category: article.category,
              coverImage: article.coverImage,
              type: article.type,
            }),
          });
        } catch (err) {
          console.error('Failed to add favorite to server:', err);
        }
      }
      return true;
    }
  };

  const buyCourse = async (course: Article, paymentMethod: string = 'Банковская карта'): Promise<UserPurchase> => {
    if (!currentUser?.uid) {
      throw new Error('Для покупки курса необходимо войти в аккаунт');
    }

    const res = await fetch('/api/user/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userUid: currentUser.uid,
        userEmail: currentUser.email,
        courseId: course.id,
        courseTitle: course.title,
        price: course.price || '1 990 ₽',
        paymentMethod,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Не удалось оформить покупку');
    }

    const purchase: UserPurchase = await res.json();
    setPurchases((prev) => [purchase, ...prev]);
    return purchase;
  };

  const openAuthModal = (
    mode: 'login' | 'register' | 'forgot' = 'register',
    reason: string = '',
    onComplete?: () => void
  ) => {
    setAuthModalMode(mode);
    setAuthModalReason(reason);
    if (onComplete) {
      setPendingCallback(() => onComplete);
    } else {
      setPendingCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason('');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        purchases,
        favorites,
        loginWithGoogle,
        logoutGoogle,
        loginWithYandex,
        loginWithVk,
        register,
        login,
        logout,
        deleteAccount,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        refreshPurchases,
        refreshFavorites,
        hasPurchasedCourse,
        isProMember,
        isFavorite,
        toggleFavorite,
        buyCourse,
        isAuthModalOpen,
        authModalMode,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        authNotice,
        dismissAuthNotice,
        triggerAuthNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
