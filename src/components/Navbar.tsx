import React from 'react';
import { BookOpen, Users, Stethoscope, ShieldCheck, Wrench, Lightbulb, Calculator, User, MapPin, Mail, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'handbook' | 'specialists' | 'diagnostic' | 'admin' | 'courses' | 'calculator' | 'cabinet';
  setActiveTab: (tab: 'handbook' | 'specialists' | 'diagnostic' | 'admin' | 'courses' | 'calculator' | 'cabinet') => void;
  selectedCity?: string;
  setSelectedCity?: (city: string) => void;
  pendingCount?: number;
  userBadgeCount?: number;
  isAdmin?: boolean;
  setIsAdmin?: (isAdmin: boolean) => void;
  onOpenAdminLogin?: () => void;
  onOpenCitySelect?: () => void;
  onOpenDonation?: () => void;
  onOpenSupport?: () => void;
  onOpenProSubscription?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCity = 'Москва',
  setSelectedCity,
  pendingCount = 0,
  userBadgeCount = 0,
  isAdmin = false,
  onOpenCitySelect,
  onOpenDonation,
  onOpenSupport,
  onOpenProSubscription,
}) => {
  const { currentUser, openAuthModal } = useAuth();

  const handleTabClick = (
    tab: 'handbook' | 'courses' | 'calculator' | 'specialists' | 'diagnostic' | 'admin' | 'cabinet'
  ) => {
    setActiveTab(tab);
  };
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg">
      {/* Top Brand Bar: Logo + Subtitles at Upper Left */}
      <div className="w-full px-3 sm:px-6 lg:px-8 2xl:px-12 py-2.5 sm:py-3 border-b border-slate-800/80 flex items-center justify-between gap-4">
        {/* Upper Left: Main Logo & Subtitles */}
        <div
          onClick={() => setActiveTab('handbook')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-500 via-red-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-rose-500/35 group-hover:scale-105 transition transform shrink-0 border border-white/20">
            <Wrench className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl font-black tracking-tight leading-none">
                <span className="text-red-500">Сантех</span>
                <span className="text-blue-500">Про</span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight mt-0.5">
              Твой карманный помощник по сантехнике
            </p>
          </div>
        </div>

        {/* Upper Right: Admin badge if logged in */}
        {isAdmin && (
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setActiveTab('admin')}
              className="flex items-center space-x-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-sm cursor-pointer shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Админ</span>
              {pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Sub-Bar: Navigation Menu */}
      <div className="w-full px-3 sm:px-6 lg:px-8 2xl:px-12 py-1.5 sm:py-2">
        <div className="flex items-center justify-between">
          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-2 overflow-x-auto w-full">
            {/* 1. Справочник */}
            <button
              onClick={() => handleTabClick('handbook')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'handbook'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Справочник</span>
            </button>

            {/* 2. Советы и опыт мастеров */}
            <button
              onClick={() => handleTabClick('courses')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'courses'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Lightbulb className={`w-4 h-4 ${activeTab === 'courses' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>Советы</span>
            </button>

            {/* 3. Калькулятор закупки & Экспресс-лист */}
            <button
              onClick={() => handleTabClick('calculator')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'calculator'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Calculator className={`w-4 h-4 ${activeTab === 'calculator' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Материалы</span>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                🛒 Закупки
              </span>
            </button>

            {/* 4. Вызов мастера */}
            <button
              onClick={() => handleTabClick('specialists')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'specialists'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Вызов мастера</span>
            </button>

            {/* 5. Диагностика */}
            <button
              onClick={() => handleTabClick('diagnostic')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'diagnostic'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>Диагностика</span>
            </button>

            {/* 6. Панель пользователя (с человечком) */}
            <button
              onClick={() => {
                if (!currentUser) {
                  openAuthModal('login', 'Выберите удобный способ входа');
                } else {
                  handleTabClick('cabinet');
                }
              }}
              className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'cabinet'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={currentUser ? "Панель пользователя (Личный кабинет)" : "Вход в личный кабинет"}
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>{currentUser ? 'Кабинет' : 'Войти'}</span>
              {userBadgeCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {userBadgeCount}
                </span>
              )}
            </button>


            {isAdmin && (
              <button
                onClick={() => handleTabClick('admin')}
                className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-amber-400 hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Панель Админа</span>
                {pendingCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Nav Bar: Optimized, non-truncating, with Crown PRO badges */}
      <div className="md:hidden border-t border-slate-800/90 bg-slate-950/95 backdrop-blur px-1.5 py-1.5 flex items-center justify-between gap-1 overflow-x-auto">
        <button
          onClick={() => handleTabClick('handbook')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[11px] font-medium transition ${
            activeTab === 'handbook'
              ? 'text-cyan-400 bg-slate-900 border border-slate-800 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5 text-emerald-400" />
          <span className="leading-tight">Справочник</span>
        </button>

        <button
          onClick={() => handleTabClick('courses')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[11px] font-medium transition ${
            activeTab === 'courses'
              ? 'text-amber-400 bg-slate-900 border border-slate-800 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-4 h-4 mb-0.5" />
          <span className="leading-tight">Советы</span>
        </button>

        <button
          onClick={() => handleTabClick('calculator')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[11px] font-medium transition ${
            activeTab === 'calculator'
              ? 'text-emerald-400 bg-slate-900 border border-slate-800 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4 mb-0.5" />
          <span className="leading-tight">Материалы</span>
        </button>

        <button
          onClick={() => handleTabClick('specialists')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[11px] font-medium transition ${
            activeTab === 'specialists'
              ? 'text-blue-400 bg-slate-900 border border-slate-800 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5 text-blue-400" />
          <span className="leading-tight">Мастера</span>
        </button>

        <button
          onClick={() => handleTabClick('diagnostic')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[11px] font-medium transition ${
            activeTab === 'diagnostic'
              ? 'text-cyan-400 bg-slate-900 border border-slate-800 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Stethoscope className="w-4 h-4 mb-0.5 text-cyan-400" />
          <span className="leading-tight">Диагностика</span>
        </button>

        {/* Панель пользователя (с человечком) */}
        <button
          onClick={() => {
            if (!currentUser) {
              openAuthModal('login', 'Выберите удобный способ входа');
            } else {
              handleTabClick('cabinet');
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[11px] font-medium transition relative ${
            activeTab === 'cabinet'
              ? 'text-cyan-400 bg-slate-900 border border-slate-800 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={currentUser ? "Панель пользователя (Личный кабинет)" : "Вход в личный кабинет"}
        >
          <User className="w-4 h-4 mb-0.5 text-cyan-400" />
          <span className="leading-tight">{currentUser ? 'Кабинет' : 'Войти'}</span>
          {userBadgeCount > 0 && (
            <span className="absolute top-0 right-1 bg-amber-500 text-slate-950 text-[9px] font-bold px-1 rounded-full">
              {userBadgeCount}
            </span>
          )}
        </button>

        {isAdmin && (
          <button
            onClick={() => handleTabClick('admin')}
            className={`flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl text-[11px] font-medium transition relative ${
              activeTab === 'admin'
                ? 'text-amber-400 bg-slate-900 border border-slate-800 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-0.5 text-amber-400" />
            <span className="leading-tight">Админ</span>
            {pendingCount > 0 && (
              <span className="absolute top-0 right-1 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
