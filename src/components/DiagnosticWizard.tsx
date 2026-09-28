import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  Clock,
  Gauge,
  AlertTriangle,
  BookOpen,
  Search,
  Check,
  X,
  Sparkles,
  ChevronRight,
  Hammer
} from 'lucide-react';
import { DIAGNOSTIC_FLOW } from '../data/initialData';
import { Article, DiagnosticSolution, DiagnosticOption } from '../types';
import { RepairMasterRecommendation } from './RepairMasterRecommendation';

interface DiagnosticWizardProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onOpenSpecialists?: () => void;
  selectedCity?: string;
}

interface ActiveSolutionState {
  solution: DiagnosticSolution;
  articleId?: string;
  sourceQuestionTitle?: string;
}

export const DiagnosticWizard: React.FC<DiagnosticWizardProps> = ({
  articles,
  onSelectArticle,
  onOpenSpecialists,
  selectedCity = 'Москва',
}) => {
  const [currentStepId, setCurrentStepId] = useState<string>('start');
  const [history, setHistory] = useState<string[]>([]);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);
  const [activeSolution, setActiveSolution] = useState<ActiveSolutionState | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const currentStep = DIAGNOSTIC_FLOW[currentStepId] || DIAGNOSTIC_FLOW['start'];

  // Quick symptom matches across all diagnostic questions and solutions
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results: Array<{
      stepId: string;
      questionTitle: string;
      option: DiagnosticOption;
    }> = [];

    Object.entries(DIAGNOSTIC_FLOW).forEach(([stepId, question]) => {
      question.options.forEach((opt) => {
        const textMatch = opt.text.toLowerCase().includes(q);
        const titleMatch = question.title.toLowerCase().includes(q);
        const solTitleMatch = opt.solution?.title.toLowerCase().includes(q);
        const solCauseMatch = opt.solution?.cause.toLowerCase().includes(q);
        const solStepsMatch = opt.solution?.steps.some((s) => s.toLowerCase().includes(q));

        if (textMatch || titleMatch || solTitleMatch || solCauseMatch || solStepsMatch) {
          results.push({
            stepId,
            questionTitle: question.title,
            option: opt,
          });
        }
      });
    });

    return results.slice(0, 8);
  }, [searchQuery]);

  const handleSelectOption = (opt: DiagnosticOption) => {
    // If the option has a rich solution
    if (opt.solution) {
      setActiveSolution({
        solution: opt.solution,
        articleId: opt.articleId,
        sourceQuestionTitle: currentStep.title,
      });
      setCompletedSteps({});
      if (opt.emergencyAdvice) {
        setEmergencyAlert(opt.emergencyAdvice);
      } else {
        setEmergencyAlert(null);
      }
      return;
    }

    if (opt.emergencyAdvice) {
      setEmergencyAlert(opt.emergencyAdvice);
      return;
    }

    if (opt.articleId) {
      const art = articles.find((a) => a.id === opt.articleId);
      if (art) {
        onSelectArticle(art);
      } else {
        setEmergencyAlert('Инструкция по данному узлу подготавливается экспертами. Вы можете воспользоваться справочником или вызвать мастера.');
      }
      return;
    }

    if (opt.nextStepId) {
      if (opt.nextStepId === 'call_master_emergency') {
        setEmergencyAlert(
          '🚨 СРОЧНО перекройте вентили ГВС/ХВС в сантехническом шкафу! Если краны закисли — срочно свяжитесь с аварийной службой вашего дома или вызовите круглосуточного мастера из раздела "Вызов мастера".'
        );
        return;
      }

      setHistory((prev) => [...prev, currentStepId]);
      setCurrentStepId(opt.nextStepId);
      setEmergencyAlert(null);
      setActiveSolution(null);
    }
  };

  const handleBack = () => {
    if (activeSolution) {
      setActiveSolution(null);
      return;
    }
    if (history.length === 0) return;
    const prevStep = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentStepId(prevStep);
    setEmergencyAlert(null);
    setActiveSolution(null);
  };

  const handleReset = () => {
    setCurrentStepId('start');
    setHistory([]);
    setEmergencyAlert(null);
    setActiveSolution(null);
    setSearchQuery('');
    setCompletedSteps({});
  };

  const jumpToStep = (stepId: string) => {
    setHistory((prev) => [...prev, currentStepId]);
    setCurrentStepId(stepId);
    setActiveSolution(null);
    setEmergencyAlert(null);
    setSearchQuery('');
  };

  const toggleStepCompleted = (stepIdx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepIdx]: !prev[stepIdx],
    }));
  };

  // Quick symptom shortcut buttons
  const quickPills = [
    { label: '💧 Капает кран / картридж', stepId: 'mixer_leak' },
    { label: '💨 Слабый напор воды', stepId: 'pressure_prob' },
    { label: '👃 Запах канализации', stepId: 'smell_prob' },
    { label: '🔥 Холодная батарея', stepId: 'heating_prob' },
    { label: '⚡ Капает клапан бойлера', stepId: 'boiler_valve_drip' },
    { label: '🚽 Вода течет в унитаз', stepId: 'toilet_leak' },
    { label: '🔊 Гудят трубы при открытии', stepId: 'noise_prob' },
    { label: '🧺 Не сливает стиралка', stepId: 'washer_drain_error' },
  ];

  const matchedArticle = activeSolution?.articleId
    ? articles.find((a) => a.id === activeSolution.articleId)
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold tracking-wider uppercase">
                Интерактивная диагностика
              </span>
              <span className="text-[11px] text-slate-400 font-medium">База 50+ решений</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white">
              Поиск поломок и пошаговые решения
            </h1>
          </div>

          {(history.length > 0 || activeSolution) && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-semibold flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>В начало</span>
            </button>
          )}
        </div>

        {/* Quick Symptom Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Быстрый поиск симптома (например: слабый напор, запах, бойлер, кран гудит...)"
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchQuery.trim().length >= 2 && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 max-h-72 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Найдено решений ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                По запросу ничего не найдено. Выберите категорию вручную в меню ниже.
              </div>
            ) : (
              searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleSelectOption(res.option);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between group"
                >
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-semibold text-white group-hover:text-cyan-400 transition">
                      {res.option.solution?.title || res.option.text}
                    </p>
                    <p className="text-[10px] text-slate-400">В разделе: {res.questionTitle}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                </button>
              ))
            )}
          </div>
        )}

        {/* Quick Shortcut Pills on start page */}
        {currentStepId === 'start' && !activeSolution && !searchQuery && (
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Частые запросы пользователей:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => jumpToStep(pill.stepId)}
                  className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-700/60 text-[11px] text-slate-300 hover:text-cyan-300 font-medium transition"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Emergency Alert Banner if triggered */}
      {emergencyAlert && (
        <div className="p-5 sm:p-6 rounded-3xl bg-rose-500/15 border-2 border-rose-500 text-rose-200 space-y-4 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-7 h-7 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white">Экстренная рекомендация</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-rose-100">{emergencyAlert}</p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3 border-t border-rose-500/30">
            {onOpenSpecialists && (
              <button
                onClick={onOpenSpecialists}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-rose-900/30"
              >
                <Wrench className="w-4 h-4" />
                <span>Вызвать аварийного сантехника</span>
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs hover:bg-slate-700 transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Начать заново</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE SOLUTION FULL CARD */}
      {activeSolution ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl animate-in fade-in duration-200">
          {/* Header of Solution */}
          <div className="space-y-3 border-b border-slate-800 pb-5">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад к вариантам</span>
              </button>

              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase">
                Готовое решение найдено
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {activeSolution.solution.title}
              </h2>
              <div className="mt-2 p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                <span className="text-xs font-bold text-cyan-400 block mb-0.5">
                  Причина поломки:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeSolution.solution.cause}
                </p>
              </div>
            </div>

            {/* Badges / Metrics */}
            <div className="flex flex-wrap gap-2 pt-1">
              {activeSolution.solution.difficulty && (
                <div className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-200 text-xs flex items-center space-x-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold">{activeSolution.solution.difficulty}</span>
                </div>
              )}
              {activeSolution.solution.estimatedTime && (
                <div className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-200 text-xs flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">{activeSolution.solution.estimatedTime}</span>
                </div>
              )}
              {activeSolution.solution.urgency && (
                <div
                  className={`px-2.5 py-1 rounded-xl border text-xs flex items-center space-x-1.5 ${
                    activeSolution.solution.urgency === 'critical'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 font-bold'
                      : activeSolution.solution.urgency === 'high'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold'
                      : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 font-bold'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    {activeSolution.solution.urgency === 'critical'
                      ? 'Экстренно'
                      : activeSolution.solution.urgency === 'high'
                      ? 'Высокая срочность'
                      : 'Плановый ремонт'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Warning Banner if present in solution */}
          {activeSolution.solution.warning && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Меры предосторожности:</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {activeSolution.solution.warning}
              </p>
            </div>
          )}

          {/* Tools & Materials Required */}
          {((activeSolution.solution.tools && activeSolution.solution.tools.length > 0) ||
            (activeSolution.solution.materials &&
              activeSolution.solution.materials.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeSolution.solution.tools && activeSolution.solution.tools.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Инструменты</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSolution.solution.tools.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700/60 text-[11px] text-slate-200 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeSolution.solution.materials &&
                activeSolution.solution.materials.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Материалы и запчасти</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeSolution.solution.materials.map((m, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700/60 text-[11px] text-slate-200 font-medium"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Action Steps Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <span>Пошаговый план устранения</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (отмечайте выполненные пункты)
                </span>
              </span>
              <span className="text-xs text-cyan-400 font-bold">
                {Object.values(completedSteps).filter(Boolean).length} /{' '}
                {activeSolution.solution.steps.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {activeSolution.solution.steps.map((stepText, idx) => {
                const isDone = !!completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStepCompleted(idx)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start space-x-3 select-none ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <p
                        className={`text-xs sm:text-sm leading-relaxed transition ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-200 font-normal'
                        }`}
                      >
                        {stepText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contextual Master Recommendation in Diagnostic Solution */}
          <div className="pt-2">
            <RepairMasterRecommendation
              repairTitle={activeSolution.solution.title}
              selectedCity={selectedCity}
              onFindMaster={() => {
                if (onOpenSpecialists) {
                  onOpenSpecialists();
                }
              }}
              onRequestCall={() => {
                if (onOpenSpecialists) {
                  onOpenSpecialists();
                }
              }}
              compact
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-3">
            {matchedArticle && (
              <button
                onClick={() => onSelectArticle(matchedArticle)}
                className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-900/30"
              >
                <BookOpen className="w-4 h-4" />
                <span>Читать подробное руководство с фото</span>
              </button>
            )}

            {onOpenSpecialists && (
              <button
                onClick={onOpenSpecialists}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition flex items-center space-x-2"
              >
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>Вызвать мастера для надежного ремонта</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-slate-200 font-medium text-xs transition flex items-center space-x-1.5 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Диагностика с нуля</span>
            </button>
          </div>
        </div>
      ) : (
        /* WIZARD QUESTION STEP CARD */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                <span>Шаг {history.length + 1}</span>
                {history.length > 0 && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span className="text-slate-400">Уточнение поломки</span>
                  </>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                {currentStep.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{currentStep.subtitle}</p>
            </div>

            {history.length > 0 && (
              <button
                onClick={handleBack}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition text-xs font-semibold flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>
            )}
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5">
            {currentStep.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition duration-150 flex items-center justify-between group cursor-pointer shadow-sm"
              >
                <div className="pr-4 space-y-1">
                  <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white block">
                    {opt.text}
                  </span>
                  {opt.solution && (
                    <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ✓ Есть пошаговое решение
                    </span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-900 group-hover:bg-cyan-500/20 border border-slate-800 group-hover:border-cyan-500/40 flex items-center justify-center shrink-0 transition">
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                </div>
              </button>
            ))}
          </div>

          {/* Helper notice at bottom */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Выберите наиболее подходящий вариант проблемы</span>
            {onOpenSpecialists && (
              <button
                onClick={onOpenSpecialists}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
              >
                Не нашли свою проблему? Вызовите мастера
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
