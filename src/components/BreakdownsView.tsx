import React, { useState } from 'react';
import { DiagnosticWizard } from './DiagnosticWizard';
import { ServiceAndPartsToolkit } from './ServiceAndPartsToolkit';
import { Article } from '../types';
import { Wrench, Stethoscope, Compass, Gauge } from 'lucide-react';

interface BreakdownsViewProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onOpenSpecialists?: () => void;
  initialSubTab?: 'chat' | 'diagnostic' | 'parts' | 'drawings' | 'calculator';
  initialPrompt?: string;
  onNavigateToCabinet?: (tab?: string) => void;
  selectedCity?: string;
}

export const BreakdownsView: React.FC<BreakdownsViewProps> = ({
  articles,
  onSelectArticle,
  onOpenSpecialists,
  selectedCity,
  initialSubTab,
}) => {
  // Default is 'wizard' (Пошаговый мастер поиска поломок) as explicitly requested by user
  const [activeSubMode, setActiveSubMode] = useState<'wizard' | 'parts' | 'drawings' | 'calculator'>(
    initialSubTab === 'parts'
      ? 'parts'
      : initialSubTab === 'drawings'
      ? 'drawings'
      : initialSubTab === 'calculator'
      ? 'calculator'
      : 'wizard'
  );

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Компактные структурированные текстовые блоки подразделов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
        {/* 1. Пошаговый мастер поиска (Основной по умолчанию) */}
        <button
          type="button"
          onClick={() => setActiveSubMode('wizard')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
            activeSubMode === 'wizard'
              ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center space-x-1.5">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  activeSubMode === 'wizard'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-cyan-400'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-xs font-black tracking-tight ${
                  activeSubMode === 'wizard' ? 'text-cyan-300' : 'text-slate-200'
                }`}
              >
                Пошаговый мастер поиска
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
              Основной
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
            Интерактивный опросник симптомов и готовые пошаговые инструкции
          </p>
        </button>

        {/* 2. Подбор запчастей */}
        <button
          type="button"
          onClick={() => setActiveSubMode('parts')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
            activeSubMode === 'parts'
              ? 'bg-slate-900 border-amber-500 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center space-x-1.5">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  activeSubMode === 'parts'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-amber-400'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-xs font-black tracking-tight ${
                  activeSubMode === 'parts' ? 'text-amber-300' : 'text-slate-200'
                }`}
              >
                Подбор запчастей
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              Каталог
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
            ТЭНы, аноды, термостаты, фланцы и прокладки по моделям
          </p>
        </button>

        {/* 3. Инженерные чертежи */}
        <button
          type="button"
          onClick={() => setActiveSubMode('drawings')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
            activeSubMode === 'drawings'
              ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center space-x-1.5">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  activeSubMode === 'drawings'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800 text-indigo-400'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-xs font-black tracking-tight ${
                  activeSubMode === 'drawings' ? 'text-indigo-300' : 'text-slate-200'
                }`}
              >
                Инженерные чертежи
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              CAD схемы
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
            Точные чертежи обвязки водонагревателя и разрезы пайки PPR
          </p>
        </button>

        {/* 4. Калькулятор бойлера */}
        <button
          type="button"
          onClick={() => setActiveSubMode('calculator')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
            activeSubMode === 'calculator'
              ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center space-x-1.5">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  activeSubMode === 'calculator'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-emerald-400'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-xs font-black tracking-tight ${
                  activeSubMode === 'calculator' ? 'text-emerald-300' : 'text-slate-200'
                }`}
              >
                Калькулятор бойлера
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              Расчеты
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
            Время нагрева, объем расширительного бака, кабель и автоматы
          </p>
        </button>
      </div>

      {/* Main Content Component */}
      {activeSubMode === 'wizard' ? (
        <DiagnosticWizard
          articles={articles}
          onSelectArticle={onSelectArticle}
          onOpenSpecialists={onOpenSpecialists}
          selectedCity={selectedCity}
        />
      ) : (
        <ServiceAndPartsToolkit
          initialSubTab={
            activeSubMode === 'drawings'
              ? 'drawings'
              : activeSubMode === 'calculator'
              ? 'calculator'
              : 'parts'
          }
          onOpenArticleById={(artId) => {
            const found = articles.find((a) => a.id === artId);
            if (found) onSelectArticle(found);
          }}
          onNavigateToDiagnostic={() => setActiveSubMode('wizard')}
        />
      )}
    </div>
  );
};
