import React, { useState } from 'react';
import { Wrench, UserPlus, LogIn, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegistrationPromptBannerProps {
  onNavigateCabinet?: () => void;
}

export const RegistrationPromptBanner: React.FC<RegistrationPromptBannerProps> = ({ onNavigateCabinet }) => {
  const { currentUser, openAuthModal } = useAuth();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('reg_banner_dismissed') === 'true';
  });

  if (currentUser || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('reg_banner_dismissed', 'true');
  };

  return (
    <div className="mb-4 p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 relative z-10">
        {/* Left: Plumbing Wrench + Concise Text */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 shadow-xs flex items-center justify-center shrink-0 text-cyan-400">
            <Wrench className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="text-xs font-bold text-white truncate">
                Личный кабинет СантехПро
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate sm:whitespace-normal mt-0.5">
              Сохраняйте избранные статьи, сметы и обучающие материалы в своём профиле.
            </p>
          </div>
        </div>

        {/* Right: Actions (Яндекс ID + VK ID + Close) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 self-end sm:self-auto flex-wrap gap-y-1.5">
          {/* Яндекс ID */}
          <button
            type="button"
            onClick={() => openAuthModal('login', 'Вход в аккаунт через Яндекс ID', () => onNavigateCabinet ? onNavigateCabinet() : undefined)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-[11px] sm:text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95 shrink-0"
            title="Войти с Яндекс ID"
          >
            <span className="w-4 h-4 rounded-full bg-white text-red-600 text-[10px] font-black flex items-center justify-center shrink-0">Я</span>
            <span>Яндекс ID</span>
          </button>

          {/* VK ID */}
          <button
            type="button"
            onClick={() => openAuthModal('login', 'Вход в аккаунт через VK ID', () => onNavigateCabinet ? onNavigateCabinet() : undefined)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0077ff] hover:bg-[#0066ee] text-white font-extrabold text-[11px] sm:text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95 shrink-0"
            title="Войти через VK ID"
          >
            <span className="w-4 h-4 rounded-md bg-white/20 text-white text-[9px] font-black flex items-center justify-center shrink-0">VK</span>
            <span>VK ID</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            title="Закрыть уведомление"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer active:scale-95 shrink-0 ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
