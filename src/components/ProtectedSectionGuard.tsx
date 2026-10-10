import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  UserCheck,
  User,
  Users,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ProtectedSectionType = 'courses' | 'calculator' | 'specialists' | 'diagnostic' | 'article' | 'cabinet';

interface ProtectedSectionGuardProps {
  section: ProtectedSectionType;
  customTitle?: string;
  onBackToHandbook: () => void;
  onRegister: () => void;
  onLogin: () => void;
  onOpenLegalModal?: () => void;
  onOpenProPurchase?: () => void;
}

const SECTION_CONFIG: Record<
  ProtectedSectionType,
  {
    title: string;
    subtitle: string;
  }
> = {
  courses: {
    title: 'Раздел «Курсы и видеоуроки»',
    subtitle: 'Практические видеокурсы и монтажные схемы от практикующих инженеров',
  },
  calculator: {
    title: 'Раздел «Материалы»',
    subtitle: 'Калькулятор смет, подбор диаметров труб и ведомость закупки',
  },
  diagnostic: {
    title: 'Раздел «Диагностика»',
    subtitle: 'Пошаговый интерактивный алгоритм точного поиска и устранения неисправностей',
  },
  article: {
    title: 'Обучающая инструкция',
    subtitle: 'Пошаговое руководство повышенной сложности со схемами монтажа',
  },
  specialists: {
    title: 'Каталог мастеров',
    subtitle: 'Для связи со специалистами войдите в аккаунт или зарегистрируйтесь',
  },
  cabinet: {
    title: 'Личный кабинет',
    subtitle: 'Доступен всем пользователям бесплатно. Войдите через VK ID или Яндекс ID для синхронизации данных.',
  },
};

export const ProtectedSectionGuard: React.FC<ProtectedSectionGuardProps> = ({
  section,
  customTitle,
  onBackToHandbook,
  onLogin,
}) => {
  const { isLoading } = useAuth();
  const cfg = SECTION_CONFIG[section] || SECTION_CONFIG.cabinet;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Проверка авторизации...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
        {/* Header with Title and Icon */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
            {section === 'specialists' ? (
              <Users className="w-6 h-6 stroke-[2.2]" />
            ) : section === 'cabinet' ? (
              <UserCheck className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% бесплатный доступ для всех</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {customTitle || cfg.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {cfg.subtitle}
          </p>
        </div>

        {/* Value Box: Free Account Benefits */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-left">
          <div className="text-xs font-bold text-slate-300 border-b border-slate-800/80 pb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Возможности личного профиля:</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Бесплатно
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-start space-x-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Сохранение избранных статей и схем</span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>История расчёта смет и материалов</span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Отслеживание заявок и вызовов мастеров</span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Синхронизация на телефоне и компьютере</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={onLogin}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2.5 shadow-md cursor-pointer"
          >
            <User className="w-4 h-4 text-white" />
            <span>Войти через VK ID или Яндекс ID</span>
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={onBackToHandbook}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Вернуться в Справочник</span>
          </button>
        </div>
      </div>
    </div>
  );
};
