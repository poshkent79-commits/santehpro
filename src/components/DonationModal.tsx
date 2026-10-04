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

/**
 * Authentic Russian SBP (Система быстрых платежей) emblem matching Screenshot 1
 */
const SbpLogo: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Логотип СБП"
  >
    {/* Left arrow: purple / violet */}
    <polygon points="6,50 18,25 35,46" fill="#4B3F8A" />
    <polygon points="6,50 18,75 35,54" fill="#882C7C" />

    {/* Top vertical arrow: gold-yellow / orange */}
    <polygon points="50,5 36,28 50,49" fill="#FAB614" />
    <polygon points="50,5 68,25 50,33" fill="#F47B20" />

    {/* Top-right arrow: red-orange / crimson */}
    <polygon points="95,33 68,25 50,33" fill="#ED5729" />
    <polygon points="95,33 68,44 50,33" fill="#D3254B" />

    {/* Interlocking central diagonal ribbon: cyan / sky-blue */}
    <polygon points="18,25 95,71 78,81 6,35" fill="#00A2E2" />
    <polygon points="35,46 95,71 78,81 20,56" fill="#0077B6" />

    {/* Bottom vertical arrow: lime green / forest green */}
    <polygon points="50,95 36,72 50,51" fill="#78BE20" />
    <polygon points="50,95 68,75 50,67" fill="#009A44" />

    {/* Bottom-right teal facet */}
    <polygon points="95,71 68,75 50,67" fill="#007A3D" />
  </svg>
);

/**
 * Authentic T-Pay pill badge with yellow shield and "PAY" text matching Screenshot 2
 */
const TPayBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#202022] border border-slate-700/80 shadow-md ${className}`}
    title="T-Pay"
  >
    {/* T-Bank Yellow Shield */}
    <svg viewBox="0 0 24 28" className="w-4 h-4 shrink-0" fill="none">
      <path
        d="M2 2h20v14c0 6.5-10 11.5-10 11.5S2 22.5 2 16V2z"
        fill="#FED800"
      />
      {/* Letter T */}
      <path
        d="M6 6h12v3.6h-3.8v8.8h-4.4V9.6H6V6z"
        fill="#121212"
      />
    </svg>
    <span className="text-white font-black text-[11px] tracking-wider leading-none">PAY</span>
  </div>
);

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
  const [paymentMethod, setPaymentMethod] = useState<'ALL' | 'SBP' | 'BankCard' | 'TinkoffPay'>('SBP');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsThankYouOpen(false);
      setIsScrolled(false);
      if (currentUser?.email) {
        setClientEmail(currentUser.email);
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      if (initialAmount) {
        setSelectedAmount(initialAmount);
        setIsCustom(false);
      }
    }
  }, [isOpen, initialAmount, currentUser]);

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
          email: clientEmail.trim() || currentUser?.email || undefined,
          phone: currentUser?.phone,
          incCurrLabel: paymentMethod === 'ALL' ? undefined : paymentMethod,
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
          {/* Engineering Mosaic Grid inspired by Sajda design */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1">
            {[
              { icon: '🔧', bg: 'bg-emerald-500/15 border-emerald-500/30' },
              { icon: '🎛️', bg: 'bg-cyan-500/15 border-cyan-500/30' },
              { icon: '♨️', bg: 'bg-amber-500/15 border-amber-500/30' },
              { icon: '🛡️', bg: 'bg-blue-500/15 border-blue-500/30' },
              { icon: '💧', bg: 'bg-sky-500/15 border-sky-500/30' },
              { icon: '🏠', bg: 'bg-teal-500/15 border-teal-500/30' },
              { icon: '⚡', bg: 'bg-yellow-500/15 border-yellow-500/30' },
              { icon: '⭐', bg: 'bg-rose-500/15 border-rose-500/30' },
            ].map((it, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-lg border shadow-sm transition transform hover:scale-110 ${it.bg}`}
              >
                <span>{it.icon}</span>
              </div>
            ))}
          </div>

          {/* Manifesto Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Польза для клиентов, заказы и расчёты для мастеров</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[12px] sm:text-[13px]">
              Мы помогаем пользователям разбираться в сантехнике, а профи — находить клиентов и быстро считать сметы. Мы развиваем проект на добровольные донаты: поддержите СантехПро любой суммой, чтобы сервис оставался бесплатным!
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
                    onChange={(e) => {
                      const v = e.target.value;
                      setCustomAmount(v === '' ? '' : v.replace(/^0+([1-9])/, '$1'));
                    }}
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

            {/* ВЫБЕРИТЕ УДОБНЫЙ СПОСОБ ОПЛАТЫ */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Выберите способ оплаты:</span>
                </label>
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                  0% комиссии
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. СБП 0% (По QR-коду) */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('SBP')}
                  className={`relative p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center space-x-3 cursor-pointer group active:scale-95 ${
                    paymentMethod === 'SBP'
                      ? 'bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-900 border-emerald-400 text-white shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-400/80 scale-[1.02]'
                      : 'bg-slate-950/80 border-slate-800/90 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-900/60'
                  }`}
                >
                  {paymentMethod === 'SBP' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-sm">
                      ✓
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <SbpLogo className="w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm font-black text-white truncate">СБП 0%</span>
                    </div>
                    <div className="text-[11px] font-medium text-emerald-400 truncate">По QR-коду</div>
                  </div>
                </button>

                {/* 2. T-Pay (Т-Банк) */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('TinkoffPay')}
                  className={`relative p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center space-x-3 cursor-pointer group active:scale-95 ${
                    paymentMethod === 'TinkoffPay'
                      ? 'bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border-amber-400 text-white shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/80 scale-[1.02]'
                      : 'bg-slate-950/80 border-slate-800/90 text-slate-300 hover:border-amber-500/50 hover:bg-slate-900/60'
                  }`}
                >
                  {paymentMethod === 'TinkoffPay' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-sm">
                      ✓
                    </span>
                  )}
                  <div className="shrink-0">
                    <TPayBadge />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-black text-white truncate">T-Pay</div>
                    <div className="text-[11px] font-medium text-amber-300 truncate">Т-Банк в 1 клик</div>
                  </div>
                </button>

                {/* 3. Банковской картой */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BankCard')}
                  className={`relative p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center space-x-3 cursor-pointer group active:scale-95 ${
                    paymentMethod === 'BankCard'
                      ? 'bg-gradient-to-br from-blue-500/20 via-slate-900 to-slate-900 border-blue-400 text-white shadow-xl shadow-blue-500/20 ring-2 ring-blue-400/80 scale-[1.02]'
                      : 'bg-slate-950/80 border-slate-800/90 text-slate-300 hover:border-blue-500/50 hover:bg-slate-900/60'
                  }`}
                >
                  {paymentMethod === 'BankCard' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-sm">
                      ✓
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-black text-white truncate">Картой</div>
                    <div className="text-[11px] font-medium text-cyan-300 truncate">МИР, Visa, MC</div>
                  </div>
                </button>

                {/* 4. Все способы (на странице кассы) */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ALL')}
                  className={`relative p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center space-x-3 cursor-pointer group active:scale-95 ${
                    paymentMethod === 'ALL'
                      ? 'bg-gradient-to-br from-indigo-500/20 via-slate-900 to-slate-900 border-indigo-400 text-white shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-400/80 scale-[1.02]'
                      : 'bg-slate-950/80 border-slate-800/90 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-900/60'
                  }`}
                >
                  {paymentMethod === 'ALL' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-sm">
                      ✓
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg shrink-0 shadow-md shadow-indigo-500/30">
                    🌐
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-black text-white truncate">Все способы</div>
                    <div className="text-[11px] font-medium text-indigo-300 truncate">Выбор в кассе</div>
                  </div>
                </button>
              </div>
            </div>

            {paymentError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <span>⚠️</span>
                <span>{paymentError}</span>
              </div>
            )}

            {/* STUNNING HIGH-CONVERSION PAY BUTTON */}
            <div className="pt-1">
              <button
                type="button"
                disabled={isProcessingPayment || currentSum <= 0}
                onClick={handleRobokassaPay}
                className="relative group w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:via-teal-300 hover:to-cyan-200 active:scale-[0.98] disabled:opacity-50 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center space-x-2.5 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer overflow-hidden border border-emerald-300/60"
              >
                {/* Glowing light sweep effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                {isProcessingPayment ? (
                  <div className="flex items-center space-x-2 text-slate-950 font-black">
                    <span className="animate-spin text-lg">⏳</span>
                    <span>Перенаправление в кассу...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-xl bg-slate-950/15 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    </div>
                    <span className="tracking-tight">
                      Оплатить {currentSum > 0 ? `${currentSum.toLocaleString('ru-RU')} ₽` : '0 ₽'}
                    </span>
                    <ArrowRight className="w-5 h-5 text-slate-950 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Trust footer note */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Данные защищены по стандарту PCI DSS</span>
              </div>
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
