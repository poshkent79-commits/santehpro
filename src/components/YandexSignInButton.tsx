import React from 'react';
import { Loader2 } from 'lucide-react';

interface YandexSignInButtonProps {
  onClick: () => void | Promise<void>;
  text?: string;
  subtext?: string;
  className?: string;
  variant?: 'solid' | 'outline' | 'card';
  disabled?: boolean;
  isLoading?: boolean;
}

export const YandexSignInButton: React.FC<YandexSignInButtonProps> = ({
  onClick,
  text = 'Войти с Яндекс ID',
  subtext,
  className = '',
  variant = 'solid',
  disabled = false,
  isLoading = false,
}) => {
  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`w-full group text-left p-3.5 rounded-2xl bg-gradient-to-r from-red-500/10 via-slate-900 to-slate-900 border border-red-500/30 hover:border-red-500/60 transition-all duration-200 shadow-md hover:shadow-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md group-hover:scale-105 transition-transform">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <span>Я</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white group-hover:text-red-300 transition-colors">
                {text}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                1 клик
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {subtext || 'Без паролей и SMS: автоматическое восстановление всех покупок'}
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        variant === 'outline'
          ? 'bg-slate-950 border border-red-500/40 hover:border-red-500 hover:bg-red-500/10 text-white'
          : 'bg-white hover:bg-slate-100 text-slate-950 shadow-md hover:shadow-lg'
      } ${className}`}
    >
      {/* Iconic Yandex Red Round Badge with white 'Я' */}
      <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm leading-none">
        {isLoading ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <span>Я</span>}
      </div>
      <span className="font-bold tracking-tight">
        {isLoading ? 'Авторизация в Яндекс...' : text}
      </span>
    </button>
  );
};
