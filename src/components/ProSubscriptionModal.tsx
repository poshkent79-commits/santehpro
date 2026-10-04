import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  FileCheck,
  Crown,
  FileDown,
  Sliders,
  Flame,
  ShieldCheck,
  Gift,
  Zap,
  PhoneCall,
  GraduationCap,
  MessageSquare,
  Lock,
  Heart
} from 'lucide-react';

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProActivated?: () => void;
}

export const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onProActivated
}) => {
  const [view, setView] = useState<'main' | 'allFeatures'>('main');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    // Save PRO status to localStorage
    try {
      localStorage.setItem('santehpro_is_pro_user', 'true');
      localStorage.setItem('santehpro_pro_expiry', new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString());
    } catch {}
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      if (onProActivated) onProActivated();
      onClose();
    }, 1800);
  };

  // Modern engineering icons grid inspired by Sajda's colorful mosaic
  const engineeringIcons = [
    { icon: '🔧', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { icon: '🎛️', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { icon: '♨️', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { icon: '🛡️', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { icon: '📄', bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { icon: '🚿', bg: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    { icon: '⚡', bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { icon: '💧', bg: 'bg-blue-600/20 text-blue-300 border-blue-600/30' },
    { icon: '🧰', bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { icon: '🔥', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { icon: '🏠', bg: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    { icon: '⭐', bg: 'bg-amber-400/20 text-amber-300 border-amber-400/30' },
    { icon: '👑', bg: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    { icon: '📊', bg: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30' },
    { icon: '🚀', bg: 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30' }
  ];

  const proFeaturesList = [
    {
      id: 'branding',
      title: 'Фирменный брендинг в PDF',
      badge: 'НОВОЕ',
      desc: 'Экспорт смет без посторонних водяных знаков: ваш логотип, телефон, печать и контакты мастера.',
      icon: FileDown,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10'
    },
    {
      id: 'contracts',
      title: 'Юридические договоры и акты B2B',
      badge: 'НОВОЕ',
      desc: 'Генерация официальных договоров подряда, актов сдачи-приемки и гарантийных талонов для солидных клиентов.',
      icon: FileCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 'unlimited',
      title: 'Безлимитные сметы и расчёты',
      badge: 'БЕЗЛИМИТ',
      desc: 'Сохраняйте неограниченное количество узлов ввода, теплых полов и спецификаций в облачный реестр смет.',
      icon: Sliders,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      id: 'top-catalog',
      title: 'Приоритет в каталоге мастеров',
      badge: 'ТОП-ВЫДАЧА',
      desc: 'Золотой статус «PRO-мастер», значок верификации и показ в самом верху каталога в вашем городе.',
      icon: Crown,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10'
    },
    {
      id: 'messengers',
      title: 'Отправка в WhatsApp и Telegram',
      badge: '1 КЛИК',
      desc: 'Мгновенная отправка готовой отформатированной сметы и коммерческого предложения заказчику в мессенджеры.',
      icon: MessageSquare,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10'
    },
    {
      id: 'courses',
      title: 'Закрытая база знаний и техкарты',
      badge: 'ВИДЕО',
      desc: 'Полный доступ к инженерным узлам Foriver, расчётам теплопотерь, схемам разводки Rehau/Stout и видеоразборам.',
      icon: GraduationCap,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10'
    },
    {
      id: 'support',
      title: 'Прямая связь с техподдержкой',
      badge: '24/7',
      desc: 'Персональная помощь инженера при сложных расчётах и консультации по проектным решениям.',
      icon: PhoneCall,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">СантехПро+ активирован!</h3>
            <p className="text-sm text-slate-300">
              Поздравляем! Вам открыт полный доступ ко всем профессиональным возможностям, договорам и приоритетному размещению.
            </p>
          </div>
        ) : view === 'main' ? (
          /* MAIN VIEW: Mosaic banner + Tariff Cards */
          <div className="flex-1 overflow-y-auto">
            {/* Colorful Mosaic Header like Sajda+ */}
            <div className="relative pt-8 pb-6 px-6 bg-gradient-to-b from-slate-800/70 via-slate-900 to-slate-900 border-b border-slate-800/60 flex flex-col items-center text-center">
              {/* Mosaic Grid of 15 rounded icons */}
              <div className="grid grid-cols-5 gap-2.5 max-w-[280px] mb-5">
                {engineeringIcons.map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border shadow-sm transition transform hover:scale-110 ${item.bg}`}
                  >
                    <span>{item.icon}</span>
                  </div>
                ))}
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <span>Оформить СантехПро</span>
                <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-base">
                  PRO+
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mt-2 leading-relaxed">
                Больше возможностей для расчётов и клиентов, а ваша подписка помогает проекту развиваться и оставаться независимым.
              </p>

              {/* "Все функции >" button */}
              <button
                type="button"
                onClick={() => setView('allFeatures')}
                className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition group cursor-pointer"
              >
                <span>Все функции</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </button>
            </div>

            {/* Plans Selector */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Monthly */}
                <div
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                    selectedPlan === 'monthly'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-300">Ежемесячно</div>
                  <div className="mt-2">
                    <span className="text-lg font-black text-white">199 ₽</span>
                    <span className="text-[11px] text-slate-400"> / мес</span>
                  </div>
                </div>

                {/* Yearly (-37%) */}
                <div
                  onClick={() => setSelectedPlan('yearly')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                    selectedPlan === 'yearly'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-md">
                    -37%
                  </div>
                  <div className="text-xs font-bold text-slate-300">Ежегодно</div>
                  <div className="mt-2">
                    <span className="text-lg font-black text-white">1 490 ₽</span>
                    <span className="text-[11px] text-slate-400"> / год</span>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">~124 ₽ в месяц</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSubscribe}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition transform active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Подключить СантехПро+</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-950/20 text-slate-950 font-black">
                  PRO
                </span>
              </button>

              {/* Legal & Restore Footer */}
              <div className="pt-2 text-center space-y-2">
                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                  <span className="hover:text-slate-200 cursor-pointer">Условия сервиса</span>
                  <span>•</span>
                  <span
                    onClick={() => {
                      localStorage.setItem('santehpro_is_pro_user', 'true');
                      setIsSuccess(true);
                      setTimeout(() => {
                        setIsSuccess(false);
                        onClose();
                      }, 1500);
                    }}
                    className="hover:text-emerald-400 transition cursor-pointer"
                  >
                    Восстановить PRO
                  </span>
                  <span>•</span>
                  <span className="hover:text-slate-200 cursor-pointer flex items-center gap-1">
                    <Gift className="w-3 h-3 text-amber-400" />
                    <span>Подарить</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Базовые калькуляторы и справочник всегда остаются бесплатными для всех пользователей.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ALL FEATURES VIEW: Detailed Scrollable Cards like Sajda+ */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setView('main')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад к тарифам</span>
              </button>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                СантехПро +
              </span>
            </div>

            <div className="text-center space-y-1 py-1">
              <h3 className="text-xl font-black text-white">Возможности подписки</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Инструменты, которые помогут мастерам выигрывать заказы, а заказчикам — экономить на ремонте.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {proFeaturesList.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex items-start gap-3.5"
                  >
                    <div className={`p-2.5 rounded-xl ${feature.bg} ${feature.color} shrink-0`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {feature.title}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                          {feature.badge}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-snug">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upcoming Features */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-800 space-y-2 mt-4">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>В разработке для подписчиков:</span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>3D-визуализатор коллекторного шкафа</span>
                  <span className="text-[9px] text-slate-500 font-bold">Скоро</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Экспорт смет напрямую в 1С и Excel (XLSX)</span>
                  <span className="text-[9px] text-slate-500 font-bold">Скоро</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setView('main')}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              Выбрать тариф подписки →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
