import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2, RefreshCw } from 'lucide-react';

interface NetworkStatusBannerProps {
  onReconnected?: () => void;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ onReconnected }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showRestored, setShowRestored] = useState<boolean>(false);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowRestored(true);
        onReconnected?.();
        const timer = setTimeout(() => {
          setShowRestored(false);
          setWasOffline(false);
        }, 3500);
        return () => clearTimeout(timer);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, onReconnected]);

  // If online and not showing the restored notice, render nothing
  if (isOnline && !showRestored) {
    return null;
  }

  return (
    <div
      id="network-status-banner"
      role="status"
      aria-live="polite"
      className="sticky top-16 z-40 w-full transition-all duration-300 animate-in fade-in slide-in-from-top-1"
    >
      {!isOnline ? (
        // OFFLINE BANNER
        <div className="bg-rose-950/95 border-b border-rose-500/40 backdrop-blur-md px-4 py-2 text-rose-200 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 animate-pulse">
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div>
                <span className="font-extrabold text-white mr-2 tracking-wide">
                  Интернета нет
                </span>
                <span className="text-rose-200/90 hidden sm:inline text-[11px]">
                  Приложение работает в автономном офлайн-режиме: пошаговые инструкции, статьи и калькуляторы доступны без сети.
                </span>
                <span className="text-rose-200/90 sm:hidden text-[11px]">
                  Офлайн-режим: статьи и калькуляторы доступны.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  if (navigator.onLine) {
                    setIsOnline(true);
                    setShowRestored(true);
                    onReconnected?.();
                    setTimeout(() => setShowRestored(false), 3500);
                  }
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800/80 border border-rose-500/30 text-[11px] font-semibold text-white flex items-center space-x-1.5 transition shrink-0 cursor-pointer"
              title="Проверить сетевое подключение"
            >
              <RefreshCw className="w-3 h-3 text-rose-300" />
              <span>Проверить сеть</span>
            </button>
          </div>
        </div>
      ) : (
        // RESTORED BANNER
        <div className="bg-emerald-950/95 border-b border-emerald-500/40 backdrop-blur-md px-4 py-2 text-emerald-200 shadow-lg animate-in fade-in duration-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <span className="font-extrabold text-white mr-2">
                  Соединение с интернетом восстановлено
                </span>
                <span className="text-emerald-200/90 text-[11px]">
                  Связь с сервером обновлена, актуальные данные загружены.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRestored(false)}
              className="p-1 rounded text-emerald-300 hover:text-white hover:bg-emerald-800/50 text-xs font-semibold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
