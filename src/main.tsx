import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker in production for instant offline loading in RF
try {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker) {
    if (import.meta.env.PROD) {
      // Auto-refresh when new service worker takes over so user immediately gets the new version
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      window.addEventListener('load', () => {
        try {
          navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .then((reg) => {
              console.log('СантехПро PWA ServiceWorker успешно зарегистрирован:', reg.scope);
              // Proactively check for SW updates (ensures auth endpoints bypass immediately)
              try {
                reg.update().catch(() => {});
              } catch {}
            })
            .catch((err) => {
              console.warn('Ошибка регистрации ServiceWorker:', err);
            });
        } catch (e) {
          console.warn('ServiceWorker register ignored:', e);
        }
      });
    } else {
      // In dev mode, unregister any active service worker to prevent Vite module cache interception
      if (typeof navigator.serviceWorker.getRegistrations === 'function') {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            for (const reg of registrations) {
              reg.unregister().catch(() => {});
            }
          })
          .catch(() => {});
      }
    }
  }
} catch (e) {
  console.warn('ServiceWorker check ignored:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Dismiss splash screen smoothly right as React mounts into DOM
if (typeof window !== 'undefined') {
  const dismissSplash = () => {
    if (typeof (window as any).__dismissSplash === 'function') {
      (window as any).__dismissSplash();
    } else {
      const splash = document.getElementById('initial-splash');
      if (splash && splash.style.opacity !== '0') {
        splash.style.opacity = '0';
        splash.style.pointerEvents = 'none';
        setTimeout(() => {
          try {
            if (splash.parentNode) splash.parentNode.removeChild(splash);
          } catch (e) {}
        }, 500);
      }
    }
  };

  requestAnimationFrame(() => {
    setTimeout(dismissSplash, 120);
  });
}
