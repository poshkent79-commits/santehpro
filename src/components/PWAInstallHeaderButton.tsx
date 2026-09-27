import React from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallHeaderButton: React.FC = () => {
  const { isInstalled, triggerInstall } = usePWAInstall();

  // Hide if already running inside installed standalone PWA
  if (isInstalled) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={triggerInstall}
      title="Установить приложение на телефон или компьютер"
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 transition shadow-sm text-xs font-bold group"
    >
      <Smartphone className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition" />
      <span className="hidden sm:inline">Установить</span>
      <span className="sm:hidden">Приложение</span>
      <Download className="w-3 h-3 text-cyan-400 ml-0.5" />
    </button>
  );
};
