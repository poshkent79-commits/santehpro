import React from 'react';
import {
  ShieldCheck,
  Wrench,
  Star,
  MapPin,
  ArrowRight,
  PhoneCall,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface RepairMasterRecommendationProps {
  repairTitle: string;
  selectedCity: string;
  specialistsCount?: number;
  onFindMaster: () => void;
  onRequestCall?: () => void;
  className?: string;
  compact?: boolean;
}

export const RepairMasterRecommendation: React.FC<RepairMasterRecommendationProps> = ({
  repairTitle,
  selectedCity,
  specialistsCount = 4,
  onFindMaster,
  onRequestCall,
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 p-5 sm:p-6 shadow-xl ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header badge & title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Wrench className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Решение «под ключ» от СантехПро
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <MapPin className="w-3.5 h-3.5" />
              <span>г. {selectedCity}</span>
            </span>
            <span className="flex items-center space-x-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>4.9★</span>
            </span>
          </div>
        </div>

        {/* Core CTA message */}
        <div>
          <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
            Не уверены в своих силах или нет специнструмента для работы «{repairTitle}»?
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            В городе <strong className="text-white">г. {selectedCity}</strong> сейчас доступны{' '}
            <strong className="text-cyan-400 font-bold">
              {specialistsCount > 0 ? `${specialistsCount} проверенных мастера` : 'проверенные мастера'}
            </strong>{' '}
            с подтверждённой квалификацией, паспортом и реальными отзывами.
          </p>
        </div>

        {/* Value props bullets */}
        {!compact && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-300">
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Паспорта и квалификация проверены</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Срочный выезд от 30 минут</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Прямой контакт без комиссий</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onFindMaster}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 cursor-pointer group"
          >
            <span>Найти мастера в г. {selectedCity}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {onRequestCall && (
            <button
              type="button"
              onClick={onRequestCall}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-semibold text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>Быстрый вызов</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
