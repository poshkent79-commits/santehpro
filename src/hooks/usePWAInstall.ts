import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const INSTALLED_KEY = 'santehpro_pwa_installed';
const DISMISSED_KEY = 'santehpro_pwa_dismissed_time';
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // If dismissed, do not bother for 3 days

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && (window as any).__deferredInstallPrompt) {
      return (window as any).__deferredInstallPrompt;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(INSTALLED_KEY);
      if (stored === 'true') return true;
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isAndroidReferrer = document.referrer.includes('android-app://');
      return isStandaloneMedia || isIOSStandalone || isAndroidReferrer;
    } catch {
      return false;
    }
  });

  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isYandex, setIsYandex] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isPrompting, setIsPrompting] = useState<boolean>(false);
  const [installAttempted, setInstallAttempted] = useState<boolean>(false);
  const [installStatusMessage, setInstallStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check standalone display mode or android wrapper
    const checkIsStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isAndroidReferrer = document.referrer.includes('android-app://');
      return isStandaloneMedia || isIOSStandalone || isAndroidReferrer;
    };

    const standalone = checkIsStandalone();
    const storedInstalled = localStorage.getItem(INSTALLED_KEY) === 'true';

    if (standalone || storedInstalled) {
      setIsInstalled(true);
      if (standalone && !storedInstalled) {
        try {
          localStorage.setItem(INSTALLED_KEY, 'true');
        } catch {
          // ignore localStorage failure in private mode
        }
      }
      setShowBanner(false);
      return; // Do NOT set up banner timers or display prompts if app is installed
    }

    // User agent detection for tailored guides
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isAndroidDevice = /android/.test(ua);
    const isYandexBrowser = /yabrowser|yandexsearch/i.test(ua);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsYandex(isYandexBrowser);

    // Check dismissal cooldown from localStorage
    const lastDismissed = localStorage.getItem(DISMISSED_KEY);
    const isCooldownActive = lastDismissed && Date.now() - parseInt(lastDismissed, 10) < DISMISS_DURATION_MS;

    // Listen for beforeinstallprompt (Chromium, Chrome on Android, Yandex Browser, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      try {
        e.preventDefault();
        const promptEvent = e as BeforeInstallPromptEvent;
        setDeferredPrompt(promptEvent);

        // Verify app wasn't marked as installed before showing banner
        if (localStorage.getItem(INSTALLED_KEY) === 'true') {
          return;
        }

        if (!isCooldownActive) {
          const timer = setTimeout(() => {
            if (localStorage.getItem(INSTALLED_KEY) !== 'true') {
              setShowBanner(true);
            }
          }, 1500);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.warn('Install prompt capture error:', err);
      }
    };

    // System event triggered when the PWA is successfully installed
    const handleAppInstalled = () => {
      try {
        localStorage.setItem(INSTALLED_KEY, 'true');
        localStorage.removeItem(DISMISSED_KEY);
      } catch {
        // ignore
      }
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowBanner(false);
      setShowGuideModal(false);
      setInstallStatusMessage('Приложение СантехПро успешно установлено на ваш смартфон!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS Safari or when native prompt event doesn't fire immediately
    if (!isCooldownActive && localStorage.getItem(INSTALLED_KEY) !== 'true') {
      const timer = setTimeout(() => {
        if (localStorage.getItem(INSTALLED_KEY) !== 'true') {
          setShowBanner(true);
        }
      }, 2500);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Mark app as installed permanently (prevents any future banners)
  const markAsInstalled = useCallback(() => {
    try {
      localStorage.setItem(INSTALLED_KEY, 'true');
      localStorage.removeItem(DISMISSED_KEY);
    } catch {
      // ignore
    }
    setIsInstalled(true);
    setShowBanner(false);
    setShowGuideModal(false);
    setDeferredPrompt(null);
  }, []);

  const triggerInstall = useCallback(async () => {
    setInstallAttempted(true);
    setIsPrompting(true);

    const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__deferredInstallPrompt : null);

    // If native prompt is available (Chrome, Android, Edge, Yandex Browser with active event)
    if (promptToUse) {
      try {
        setInstallStatusMessage('Запуск диалога установки в браузере...');
        await promptToUse.prompt();
        const choice = await promptToUse.userChoice;
        setIsPrompting(false);
        if (choice.outcome === 'accepted') {
          setInstallStatusMessage('Приложение успешно добавляется на ваш экран!');
          markAsInstalled();
          return true;
        } else {
          setInstallStatusMessage('Установка отклонена в диалоге браузера. Вы можете установить приложение через меню браузера ⋮');
          return false;
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err);
        setIsPrompting(false);
      }
    }

    setIsPrompting(false);

    // If native prompt is unavailable or requires user confirmation via browser menu
    setShowGuideModal(true);

    if (isYandex) {
      setInstallStatusMessage('В Яндекс Браузере: нажмите кнопку меню ⋮ (три точки) и выберите «Добавить на главный экран» или «Установить»');
    } else if (isAndroid) {
      setInstallStatusMessage('В меню браузера (три точки ⋮) выберите «Установить приложение» или «Добавить на главный экран»');
    } else if (isIOS) {
      setInstallStatusMessage('В Safari нажмите кнопку «Поделиться» и выберите «На экран „Домой“»');
    } else {
      setInstallStatusMessage('Нажмите значок установки в строке адреса или через меню браузера');
    }

    return false;
  }, [deferredPrompt, markAsInstalled, isYandex, isAndroid, isIOS]);

  const downloadAppShortcut = useCallback(() => {
    try {
      const currentOrigin = window.location.origin;
      const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>СантехПро — Мобильное приложение</title>
  <meta name="theme-color" content="#0f172a">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <style>
    body { background: #0f172a; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 24px; max-width: 360px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .btn { background: #06b6d4; color: #020617; font-weight: bold; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 16px; display: inline-block; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="margin:0 0 10px; color:#38bdf8;">СантехПро</h2>
    <p style="font-size:13px; color:#94a3b8; margin:0 0 16px;">Запуск мобильного приложения...</p>
    <a class="btn" href="${currentOrigin}">Открыть СантехПро</a>
  </div>
  <script>
    window.location.replace("${currentOrigin}");
  </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SantehPro-App.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setInstallStatusMessage('Файл быстрого запуска SantehPro-App.html успешно скачан на телефон!');
    } catch (e) {
      console.warn('Failed to download shortcut:', e);
    }
  }, []);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    } catch {
      // ignore
    }
  }, []);

  const openInstallGuide = useCallback(() => {
    setShowGuideModal(true);
  }, []);

  const closeInstallGuide = useCallback(() => {
    setShowGuideModal(false);
  }, []);

  return {
    isInstallable: !!deferredPrompt || isIOS || isAndroid,
    hasNativePrompt: !!deferredPrompt || (typeof window !== 'undefined' && !!(window as any).__deferredInstallPrompt),
    isInstalled,
    isIOS,
    isAndroid,
    isYandex,
    showBanner: showBanner && !isInstalled,
    showGuideModal,
    isPrompting,
    installAttempted,
    installStatusMessage,
    triggerInstall,
    downloadAppShortcut,
    dismissBanner,
    markAsInstalled,
    openInstallGuide,
    closeInstallGuide,
  };
}
