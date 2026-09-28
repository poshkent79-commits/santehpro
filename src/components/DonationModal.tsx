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
  Smartphone,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
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
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'phone'>('card');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isThankYouOpen, setIsThankYouOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
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
                    100% бесплатно • Добровольная поддержка
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span
                className={`rounded-full bg-white/25 text-white font-black uppercase tracking-wider backdrop-blur-sm shadow-sm transition-all duration-300 ease-out ${
                  isScrolled
                    ? 'px-2 py-0.5 text-[9px] hidden sm:inline-block'
                    : 'px-3 py-1 text-[10px] sm:text-xs'
                }`}
              >
                100% БЕСПЛАТНО
              </span>
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
              Поддержать<br />проект<br />СантехПро
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

          {/* Payment Method Selector Tabs */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-slate-300">Способ перевода средств:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-xl border text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition cursor-pointer text-center ${
                  paymentMethod === 'card'
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Карта «Мир»</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('phone')}
                className={`p-2.5 rounded-xl border text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition cursor-pointer text-center ${
                  paymentMethod === 'phone'
                    ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Перевод через СБП</span>
              </button>
            </div>
          </div>

          {/* METHOD 1: CARD «МИР» (2200 7020 1270 2739, Достонджон Т.) */}
          {paymentMethod === 'card' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Virtual Realistic Bank Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/40 p-4 sm:p-5 text-white shadow-xl shadow-emerald-950/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-200 flex items-center justify-center shadow-inner">
                      <div className="w-5 h-3 border-y border-amber-700/60 rounded-sm" />
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Карта для переводов</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40">
                    <span className="text-[11px] font-black tracking-widest text-emerald-400">МИР</span>
                  </div>
                </div>

                <div className="my-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Номер банковской карты:
                  </div>
                  <div className="font-mono text-base sm:text-xl font-black tracking-widest text-emerald-300 select-all flex items-center justify-between bg-slate-950/70 p-2 sm:p-2.5 rounded-xl border border-slate-800">
                    <span>2200 7020 1270 2739</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('2200702012702739', 'card')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1 transition cursor-pointer shrink-0 ml-2"
                      title="Скопировать номер карты"
                    >
                      {copiedField === 'card' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-slate-950" />
                          <span>Скопировано!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-950" />
                          <span>Копировать</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-slate-800/80 pt-2 text-xs">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">Получатель:</div>
                    <div className="font-bold text-white tracking-wide text-xs sm:text-sm">ДОСТОНДЖОН Т.</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">Сумма к переводу:</div>
                    <div className="text-xs sm:text-sm text-emerald-400 font-extrabold">{currentSum.toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-white flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Как отправить поддержку по номеру карты:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                  <li>Нажмите кнопку <strong>«Копировать»</strong> выше (скопируется номер 2200702012702739).</li>
                  <li>Откройте приложение любого вашего банка (Сбербанк, Т-Банк, ВТБ, Альфа и др.).</li>
                  <li>Выберите <strong>«Перевод по номеру карты»</strong>, вставьте скопированный номер, укажите <strong>{currentSum} ₽</strong> и подтвердите перевод.</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsThankYouOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center space-x-2 transition shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Я перевёл на карту — Спасибо автору!</span>
                </button>
              </div>
            </div>
          )}

          {/* METHOD 2: SBP REQUISITES (+7 924 788 99 00, Достонджон Т.) */}
          {paymentMethod === 'phone' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/40 space-y-3 shadow-lg shadow-cyan-950/30">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      Реквизиты для перевода через СБП:
                    </div>
                    <div className="font-mono text-lg sm:text-xl font-black text-white tracking-wide mt-0.5 select-all">
                      +7 924 788 99 00
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-black tracking-wider text-cyan-300">
                    СБП 0%
                  </div>
                </div>

                {/* SBP Details box */}
                <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Номер телефона для СБП:</span>
                    <span className="font-mono font-bold text-cyan-300 select-all">+7 924 788 99 00</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                    <span className="text-slate-400">Получатель:</span>
                    <span className="font-bold text-white">Достонджон Т.</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                    <span className="text-slate-400">Банк получателя:</span>
                    <span className="font-bold text-amber-400">Т-Банк (Тинькофф)</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                    <span className="text-slate-400">Сумма к переводу:</span>
                    <span className="font-bold text-emerald-400">{currentSum.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>

                {/* Quick Copy Button for SBP */}
                <button
                  type="button"
                  onClick={() => handleCopy('+79247889900', 'sbp')}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-xs font-bold text-cyan-200 flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  {copiedField === 'sbp' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Номер для СБП скопирован!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-cyan-300" />
                      <span>Скопировать номер для СБП (+7 924 788 99 00)</span>
                    </>
                  )}
                </button>

                {/* Instructions */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-white flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Инструкция по переводу через СБП:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 pt-1">
                    <li>Скопируйте номер телефона <strong>+7 924 788 99 00</strong>.</li>
                    <li>В мобильном приложении любого банка перейдите в <strong>«Переводы через СБП»</strong> (по номеру телефона).</li>
                    <li>Вставьте скопированный номер, выберите банк получателя (<strong>Т-Банк</strong>) и сумму <strong>{currentSum} ₽</strong>.</li>
                  </ol>
                </div>

                <button
                  type="button"
                  onClick={() => setIsThankYouOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center space-x-2 transition shadow-md cursor-pointer mt-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Я перевёл через СБП — Спасибо автору!</span>
                </button>
              </div>
            </div>
          )}

          {/* EMAIL SUPPORT IN BOTTOM OF DOCUMENT (Адрес электронной почты в нижней части документа) */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Электронная почта для связи и предложений:
                </div>
                <a
                  href="mailto:santehpro.info@gmail.com"
                  className="font-medium text-slate-200 hover:text-cyan-300 transition truncate block"
                >
                  santehpro.info@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleCopy('santehpro.info@gmail.com', 'email')}
                className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 transition cursor-pointer border border-slate-700"
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
              <a
                href="mailto:santehpro.info@gmail.com"
                className="px-2.5 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 text-xs font-semibold flex items-center justify-center space-x-1 transition"
              >
                <span>Написать</span>
              </a>
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

          {/* Footnote reassurance without phone */}
          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-2 gap-y-1">
            <span>СантехПро • Самозанятый Туйчиев Д. Н. (ИНН 250900981804)</span>
            <span>E-mail: santehpro.info@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
