import React, { useState } from 'react';
import { Sparkles, UserPlus, LogIn, X } from 'lucide-react';
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
        {/* Left: Sparkles + Concise Text */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
            <Sparkles className="w-4 h-4" />
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

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => openAuthModal('login', 'Вход в аккаунт через Яндекс ID для доступа ко всем материалам', () => onNavigateCabinet ? onNavigateCabinet() : undefined)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs transition shadow-sm flex items-center space-x-1.5"
          >
            <span className="w-4 h-4 rounded-full bg-white text-red-600 text-[10px] font-black flex items-center justify-center">Я</span>
            <span>Войти с Яндекс ID</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            title="Закрыть уведомление"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
