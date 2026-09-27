import React, { useState } from 'react';
import { Construction, X, Sparkles } from 'lucide-react';

export const BetaDevelopmentBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('santehpro_dev_banner_closed') === 'true';
    } catch {
      return false;
    }
  });

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('santehpro_dev_banner_closed', 'true');
    } catch {}
  };

  return (
    <aside
      role="status"
      aria-label="Уведомление о разработке сервиса"
      className="mb-4 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/95 to-cyan-500/10 border border-amber-500/30 shadow-md shadow-amber-950/20 flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute -left-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Content */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 relative z-10">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
          <Construction className="w-4 h-4 animate-pulse" />
        </div>

        <div className="min-w-0 flex flex-wrap sm:flex-nowrap items-baseline sm:items-center gap-x-2 gap-y-0.5">
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Бета
            </span>
            <strong className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">
              Продукт ещё дорабатывается
            </strong>
          </div>
          <span className="text-slate-400 text-[11px] sm:text-xs truncate sm:whitespace-normal">
            — мы активно обновляем материалы, улучшаем функции и добавляем новые возможности.
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1.5 shrink-0 relative z-10">
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Скрыть уведомление"
          aria-label="Закрыть уведомление о доработке"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
