import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, ShieldCheck, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { PaymentMethodId, PaymentRegion, PaymentMethodOption, SmartPaymentInitResponse } from '../../types/payment';
import { PaymentMethodTile } from './PaymentMethodTile';

const RU_PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'sbp',
    title: 'СБП',
    subtitle: 'Без комиссии • 0%',
    badge: '0% СБП',
    badgeColor: 'emerald',
    iconType: 'sbp',
    popular: true,
  },
  {
    id: 'sberpay',
    title: 'SberPay',
    subtitle: 'СберБанк Онлайн',
    badge: 'Быстро',
    badgeColor: 'emerald',
    iconType: 'sberpay',
  },
  {
    id: 'tpay',
    title: 'T-Pay',
    subtitle: 'Т-Банк в 1 клик',
    iconType: 'tpay',
  },
  {
    id: 'card_ru',
    title: 'Карта РФ',
    subtitle: 'МИР, Visa, Mastercard',
    iconType: 'card',
  },
];

const CIS_INTL_PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'card_intl',
    title: 'Карта СНГ / Зарубеж',
    subtitle: 'Visa, MC, Uzcard, Humo, Mir',
    badge: 'СНГ и Мир',
    badgeColor: 'blue',
    iconType: 'globe',
    popular: true,
  },
  {
    id: 'wallets',
    title: 'Электронные кошельки',
    subtitle: 'ЮMoney, баланс и сервисы',
    iconType: 'wallet',
  },
];

const CIS_COUNTRIES = ['UZ', 'TJ', 'KZ', 'BY', 'AM', 'KG', 'AZ', 'MD', 'TM', 'GE'];

interface SmartPaymentModuleProps {
  amount: number;
  description?: string;
  type?: 'donation' | 'course' | 'estimate' | 'service';
  targetId?: string;
  userUid?: string;
  userName?: string;
  userEmail?: string;
  phone?: string;
  onPaymentInitiated?: (paymentUrl: string) => void;
}

export const SmartPaymentModule: React.FC<SmartPaymentModuleProps> = ({
  amount,
  description = 'Добровольное пожертвование на развитие сервиса СантехПро',
  type = 'donation',
  targetId,
  userUid,
  userName,
  userEmail,
  phone,
  onPaymentInitiated,
}) => {
  const [region, setRegion] = useState<PaymentRegion>('RU');
  const [detectedCountry, setDetectedCountry] = useState<string>('RU');
  const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethodId>('sbp');
  const [email, setEmail] = useState<string>(userEmail || '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // 1. Автоматическое определение геолокации при загрузке
  useEffect(() => {
    let isMounted = true;
    const detectGeo = async () => {
      try {
        const res = await fetch('/api/geo/my-location');
        if (res.ok) {
          const data = await res.json();
          const country = (data.country || 'RU').toUpperCase();
          if (isMounted) {
            setDetectedCountry(country);
            if (country !== 'RU' && (CIS_COUNTRIES.includes(country) || country.length === 2)) {
              setRegion('CIS_INTL');
              setPaymentMethodId('card_intl');
            } else {
              setRegion('RU');
              setPaymentMethodId('sbp');
            }
          }
        }
      } catch (_e) {
        // Fallback default RU
      }
    };
    detectGeo();
    return () => {
      isMounted = false;
    };
  }, []);

  // Переключение региона пользователем
  const toggleRegion = () => {
    if (region === 'RU') {
      setRegion('CIS_INTL');
      setPaymentMethodId('card_intl');
    } else {
      setRegion('RU');
      setPaymentMethodId('sbp');
    }
    setPaymentError(null);
  };

  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setEmailError(null);
      return true;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val.trim())) {
      setEmailError('Введите корректный email (например, name@mail.ru)');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handlePay = async () => {
    if (amount <= 0 || isProcessing) return;

    if (email && !validateEmail(email)) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const response = await fetch('/api/payment/smart-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: `${description} (${amount} ₽)`,
          type,
          targetId,
          email: email.trim() || undefined,
          phone,
          userUid,
          userName,
          countryCode: region === 'CIS_INTL' ? (detectedCountry !== 'RU' ? detectedCountry : 'KZ') : 'RU',
          paymentMethodId,
        }),
      });

      const data: SmartPaymentInitResponse = await response.json();

      if (!response.ok || !data.success || !data.paymentUrl) {
        throw new Error(data.error || 'Не удалось сформировать платёж. Пожалуйста, попробуйте снова.');
      }

      if (onPaymentInitiated) {
        onPaymentInitiated(data.paymentUrl);
      } else {
        window.location.href = data.paymentUrl;
      }
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setPaymentError(err.message || 'Ошибка запуска онлайн-оплаты. Попробуйте повторить попытку.');
      setIsProcessing(false);
    }
  };

  const currentMethods = region === 'RU' ? RU_PAYMENT_METHODS : CIS_INTL_PAYMENT_METHODS;

  return (
    <div className="space-y-4 pt-1">
      {/* Сетка методов оплаты */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Способ оплаты:</span>
          </label>
          <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
            {region === 'RU' ? 'РФ • 0% комиссии' : 'СНГ / Зарубеж • 0%'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {currentMethods.map((method) => (
            <PaymentMethodTile
              key={method.id}
              method={method}
              isSelected={paymentMethodId === method.id}
              onSelect={setPaymentMethodId}
            />
          ))}
        </div>
      </div>

      {/* Поле Email для отправки чека — с пометкой (необязательно), чисто и минималистично */}
      <div className="space-y-1.5">
        <label
          htmlFor="smart-pay-email"
          className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
        >
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>E-mail для чека</span>
          <span className="text-[10px] text-slate-400 font-normal">(необязательно)</span>
        </label>
        <div className="relative">
          <input
            id="smart-pay-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) validateEmail(e.target.value);
            }}
            onBlur={() => validateEmail(email)}
            placeholder="pochta@mail.ru"
            className={`w-full bg-slate-900/80 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
              emailError
                ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-800 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30'
            }`}
          />
        </div>
        {emailError && (
          <p className="text-[10px] text-rose-400 font-medium">{emailError}</p>
        )}
      </div>

      {/* Ошибка оплаты с быстрым повтором в один клик */}
      {paymentError && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div>{paymentError}</div>
            <button
              type="button"
              onClick={handlePay}
              className="text-[11px] font-bold text-cyan-300 underline hover:text-cyan-200 cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Повторить попытку</span>
            </button>
          </div>
        </div>
      )}

      {/* Единая главная кнопка подтверждения: «Оплатить [Сумма] ₽» (dark mode fintech style) */}
      <div className="pt-1">
        <button
          type="button"
          disabled={isProcessing || amount <= 0}
          onClick={handlePay}
          className="relative group w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:via-teal-300 hover:to-emerald-300 active:scale-[0.98] disabled:opacity-50 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center space-x-2.5 transition-all shadow-xl shadow-cyan-950/40 hover:shadow-cyan-500/30 cursor-pointer overflow-hidden border border-cyan-300/40"
        >
          {/* Световой блик при наведении */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {isProcessing ? (
            <div className="flex items-center space-x-2 text-slate-950 font-black">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Формирование платежа...</span>
            </div>
          ) : (
            <>
              <div className="w-7 h-7 rounded-xl bg-slate-950/15 flex items-center justify-center">
                <Lock className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="tracking-tight">
                Оплатить {amount > 0 ? `${amount.toLocaleString('ru-RU')} ₽` : '0 ₽'}
              </span>
              <ArrowRight className="w-5 h-5 text-slate-950 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Безопасность транзакции */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Безопасная оплата • Защита 3-D Secure • 0% комиссии</span>
        </div>
      </div>

      {/* Аккуратная ссылка-переключатель региона внизу экрана */}
      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={toggleRegion}
          className="text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer"
        >
          {region === 'RU' ? (
            <>
              <span>🌐</span>
              <span className="underline decoration-slate-600 underline-offset-4 hover:decoration-cyan-400">
                Оплата из стран СНГ / другой страны
              </span>
            </>
          ) : (
            <>
              <span>🇷🇺</span>
              <span className="underline decoration-slate-600 underline-offset-4 hover:decoration-cyan-400">
                Оплата картой РФ / СБП
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
