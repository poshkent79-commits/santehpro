import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  Sparkles,
  CreditCard,
  Copy,
  Check,
  CheckCircle2,
  Gift,
  Mail,
  ShieldCheck,
  ArrowRight,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SupportFeedbackModal } from './SupportFeedbackModal';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  onOpenOffer?: () => void;
  onOpenPrivacy?: () => void;
}

const PRESET_AMOUNTS = [
  { amount: 150, label: 'Кофе автору', icon: '☕', description: 'Сказать простое спасибо' },
  { amount: 300, label: 'На чай и расходники', icon: '🧰', description: 'Приятная помощь в развитии' },
  { amount: 500, label: 'Вклад в проект', icon: '🚀', popular: true, description: 'Помощь в оплате серверов' },
  { amount: 1000, label: 'Ощутимая помощь', icon: '🌟', description: 'Поддержка выпуска новых схем' },
  { amount: 2500, label: 'Меценат СантехПро', icon: '👑', description: 'Серьёзный вклад в съёмки' },
];

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  initialAmount = 500,
  onOpenOffer,
  onOpenPrivacy,
}) => {
  const { currentUser } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isThankYouOpen, setIsThankYouOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsThankYouOpen(false);
      setIsScrolled(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      if (initialAmount) {
        setSelectedAmount(initialAmount);
        setIsCustom(false);
      }
    }
  }, [isOpen, initialAmount]);

  if (!isOpen) return null;

  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (top > 25 && !isScrolled) {
      setIsScrolled(true);
    } else if (top <= 10 && isScrolled) {
      setIsScrolled(false);
    }
  };

  const currentSum = isCustom ? Math.max(0, parseInt(customAmount, 10) || 0) : selectedAmount;

  const handleCopy = (text: string, fieldName: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    } catch (e) {
      console.error('Clipboard copy error:', e);
    }
  };

  const handleRobokassaPay = async () => {
    if (currentSum <= 0) return;
    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      const response = await fetch('/api/payment/robokassa/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: currentSum,
          description: `Добровольное пожертвование на развитие сервиса СантехПро (${currentSum} ₽)`,
          type: 'donation',
          userUid: currentUser?.uid,
          userName: currentUser?.name,
          email: currentUser?.email,
          phone: currentUser?.phone,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.paymentUrl) {
        throw new Error(data.error || 'Не удалось сформировать платёж');
      }
      // Redirect to official Robokassa checkout
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      console.error('Robokassa pay error:', err);
      setPaymentError(err.message || 'Ошибка запуска онлайн-оплаты. Попробуйте снова или воспользуйтесь переводом по номеру карты.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon (Оригинальный яркий баннер из дизайна, плавно сжимающийся в верхнюю компактную панель при скролле) */}
        <div
          className={`relative bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white overflow-hidden shrink-0 transition-all duration-300 ease-out z-20 ${
            isScrolled
              ? 'py-2.5 px-4 sm:px-5 shadow-lg shadow-rose-950/50 border-b border-rose-400/30'
              : 'p-5 sm:p-6 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shrink-0 transition-all duration-300 ease-out ${
                  isScrolled
                    ? 'w-9 h-9 rounded-xl shadow-sm'
                    : 'w-14 h-14 shadow-xl shadow-rose-950/20'
                }`}
              >
                <Heart
                  className={`fill-white text-white transition-all duration-300 ease-out ${
                    isScrolled ? 'w-5 h-5' : 'w-7 h-7'
                  }`}
                />
              </div>

              {isScrolled && (
                <div className="min-w-0 animate-in fade-in duration-200">
                  <h2 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                    Поддержать проект СантехПро
                  </h2>
                  <div className="text-[10px] text-rose-100 font-medium">
                    Добровольная поддержка проекта
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className={`rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition-all duration-300 ease-out cursor-pointer ${
                  isScrolled ? 'w-8 h-8' : 'w-9 h-9 sm:w-10 sm:h-10'
                }`}
                title="Закрыть"
              >
                <X className={isScrolled ? 'w-4 h-4' : 'w-5 h-5'} />
              </button>
            </div>
          </div>

          {/* Expanded text - hides smoothly when scrolled down */}
          <div
            className={`transition-all duration-300 ease-out overflow-hidden ${
              isScrolled
                ? 'max-h-0 opacity-0 mt-0 pointer-events-none'
                : 'max-h-48 opacity-100 mt-4 space-y-1.5'
            }`}
          >
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Поддержать проект<br />СантехПро
            </h2>
            <p className="text-xs sm:text-sm text-rose-100/90 font-medium leading-relaxed max-w-md">
              Мы сохраняем все справочники, курсы и калькулятор бесплатными для каждого мастера и пользователя!
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleBodyScroll}
          className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-100"
        >
          {/* Manifesto Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Проект открыт для всех без скрытых платных подписок</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[12px] sm:text-[13px]">
              Все пошаговые инструкции, видеоуроки, интерактивный калькулятор закупки труб и каталог проверенных мастеров остаются в свободном доступе.
            </p>
            <p className="text-slate-300 leading-relaxed text-[12px] sm:text-[13px]">
              Если справочник сэкономил вам деньги на ремонте, уберёг от протечки или научил тонкостям пайки и монтажа — вы можете поддержать развитие любой добровольной суммой на оплату серверов, хостинга и съёмку новых практических материалов.
            </p>
          </div>

          {/* Amount Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200">
              <span className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-rose-400" />
                <span>Выберите сумму поддержки:</span>
              </span>
              <span className="text-amber-400 font-black text-sm sm:text-base">
                {currentSum > 0 ? `${currentSum.toLocaleString('ru-RU')} ₽` : '0 ₽'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PRESET_AMOUNTS.map((item) => {
                const isSelected = !isCustom && selectedAmount === item.amount;
                return (
                  <button
                    key={item.amount}
                    type="button"
                    onClick={() => {
                      setIsCustom(false);
                      setSelectedAmount(item.amount);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer relative ${
                      isSelected
                        ? 'bg-rose-500/10 border-rose-500 text-white shadow-lg shadow-rose-950/40 ring-2 ring-rose-500'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    {item.popular && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white uppercase tracking-wider shadow">
                        ХИТ
                      </span>
                    )}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm sm:text-base font-black text-white">{item.amount} ₽</span>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white leading-tight">{item.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">{item.description}</div>
                    </div>
                  </button>
                );
              })}

              {/* Custom Amount Button/Input */}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                  isCustom
                    ? 'bg-rose-500/10 border-rose-500 text-white shadow-lg shadow-rose-950/40 ring-2 ring-rose-500'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xl">✍️</span>
                  <span className="text-xs sm:text-sm font-black text-slate-200">Своя сумма</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white leading-tight">Любая комфортная</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">от 50 рублей</div>
                </div>
              </button>
            </div>

            {/* Custom Amount Field when active */}
            {isCustom && (
              <div className="pt-1 animate-in fade-in duration-200">
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Введите сумму (например, 700)"
                    autoFocus
                    className="w-full bg-slate-900 border border-rose-500/80 rounded-xl px-3.5 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 pr-10"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ₽
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* MODERN SECURE ONLINE PAYMENT SECTION */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 space-y-4 shadow-2xl relative overflow-hidden">
            {/* Top row with modern payment badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/40 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Безопасная оплата</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                      СБП 0%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    СБП, карты МИР, СберБанк, Т-Банк
                  </div>
                </div>
              </div>

              {/* Supported payment badges */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700/60">
                  СБП
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700/60">
                  МИР
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700/60">
                  Любые карты
                </span>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">
                {paymentError}
              </div>
            )}

            {/* Official Robokassa Style Payment Widget Button */}
            <button
              type="button"
              disabled={isProcessingPayment || currentSum <= 0}
              onClick={handleRobokassaPay}
              className="w-full py-4 px-6 rounded-2xl bg-black hover:bg-neutral-900 border-2 border-neutral-700/80 active:scale-[0.99] disabled:opacity-50 text-white flex items-center justify-between transition shadow-2xl shadow-black/80 cursor-pointer group"
            >
              {isProcessingPayment ? (
                <div className="w-full flex items-center justify-center space-x-2 text-neutral-300">
                  <span className="animate-spin text-base">⏳</span>
                  <span className="font-semibold text-sm">Переход к безопасной оплате...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                        Перейти к оплате
                      </div>
                      <div className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                        {currentSum > 0 ? `${currentSum.toLocaleString('ru-RU')} ₽` : '0 ₽'}
                      </div>
                    </div>
                  </div>

                  {/* Official Robokassa Brand Mark */}
                  <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl shadow-inner shrink-0 group-hover:border-neutral-700 transition">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
                    <span className="text-sm font-black tracking-tight text-white lowercase select-none">
                      robo<span className="text-orange-500">kassa</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-white transition" />
                  </div>
                </>
              )}
            </button>

            {/* Trust footer note */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Защищённое соединение SSL • Официальный электронный чек</span>
            </div>
          </div>

          {/* EMAIL SUPPORT IN BOTTOM OF DOCUMENT (Служба поддержки и связь) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Служба поддержки и связи:
                </div>
                <a
                  href="mailto:santehpro.info@yandex.ru"
                  className="font-semibold text-slate-200 hover:text-cyan-300 transition truncate block font-mono"
                >
                  santehpro.info@yandex.ru
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleCopy('santehpro.info@yandex.ru', 'email')}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer border border-slate-700"
                title="Скопировать e-mail"
              >
                {copiedField === 'email' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Скопировать</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-md shadow-cyan-950/40"
                title="Написать в поддержку с файлами до 10 МБ"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Написать</span>
              </button>
            </div>
          </div>

          {/* Thank You Confirmation Popup View */}
          {isThankYouOpen && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 space-y-2.5 text-center animate-in zoom-in-95 duration-200">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <Heart className="w-5 h-5 fill-emerald-400 text-emerald-400" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Огромное спасибо за поддержку!
              </h3>
              <p className="text-xs text-emerald-200/90 leading-relaxed max-w-md mx-auto">
                Ваш вклад помогает сохранять «СантехПро» полностью бесплатным, развивать базу знаний, снимать новые уроки и поддерживать сообщество мастеров по всей стране.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition cursor-pointer mt-1"
              >
                Закрыть окно
              </button>
            </div>
          )}

          {/* LEGAL COMPLIANCE NOTICE FOR ROBOKASSA & PAYMENT PROVIDERS */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 text-center leading-relaxed space-y-1">
            <p>
              Совершая добровольный перевод, вы принимаете условия{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOffer?.();
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline cursor-pointer"
              >
                Публичной оферты о добровольном пожертвовании
              </button>{' '}
              и соглашаетесь с{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrivacy?.();
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline cursor-pointer"
              >
                Политикой конфиденциальности
              </button>
              .
            </p>
            <p className="text-[10px] text-slate-500">
              Пожертвование осуществляется в общеполезных целях на развитие открытого некоммерческого сервиса и серверов в соответствии со ст. 582 ГК РФ.
            </p>
          </div>

          {/* Footnote reassurance without phone */}
          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-2 gap-y-1">
            <span>СантехПро • Самозанятый Туйчиев Д. Н. (ИНН 250900981804)</span>
            <span>E-mail: santehpro.info@yandex.ru</span>
          </div>
        </div>
      </div>

      {isSupportModalOpen && (
        <SupportFeedbackModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          defaultTopic="Вопрос по работе сервиса"
        />
      )}
    </div>
  );
};
