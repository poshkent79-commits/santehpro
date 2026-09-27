import React from 'react';
import { MapPin, Check, ChevronRight } from 'lucide-react';

interface CityConfirmationBannerProps {
  city: string;
  onConfirm: () => void;
  onChangeCity: () => void;
}

export const CityConfirmationBanner: React.FC<CityConfirmationBannerProps> = ({
  city,
  onConfirm,
  onChangeCity,
}) => {
  return (
    <aside
      aria-label="Подтверждение города"
      className="mb-4 sm:mb-6 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900/95 border border-slate-800/90 shadow-lg shadow-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-200"
    >
      <div className="flex items-center space-x-2 sm:space-x-3 text-slate-200">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-slate-400 font-medium">Ваш город:</span>
          <span className="text-white font-bold tracking-tight text-sm sm:text-base">{city}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg sm:rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1 transition shadow-sm cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Да</span>
        </button>

        <button
          type="button"
          onClick={onChangeCity}
          className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg sm:rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs flex items-center justify-center space-x-1 transition cursor-pointer"
        >
          <span>Выбрать другой город</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </aside>
  );
};
