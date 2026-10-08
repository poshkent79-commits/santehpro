import React from 'react';
import { CreditCard, Globe, Wallet, Check } from 'lucide-react';
import { PaymentMethodId, PaymentMethodOption } from '../../types/payment';

/**
 * Официальный знак СБП (Система быстрых платежей)
 */
export const SbpIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 215 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M0 26.12l14.532 25.975v15.844L.017 93.863 0 26.12z" fill="#5B57A2" />
    <path d="M55.797 42.643l13.617-8.346 27.868-.026-41.485 25.414V42.643z" fill="#D90751" />
    <path d="M55.72 25.967l.077 34.39-14.566-8.95V0l14.49 25.967z" fill="#FAB718" />
    <path d="M97.282 34.271l-27.869.026-13.693-8.33L41.231 0l56.05 34.271z" fill="#ED6F26" />
    <path d="M55.797 94.007V77.322l-14.566-8.78.008 51.465 14.558-26z" fill="#63B22F" />
    <path d="M69.38 85.737L14.531 52.095 0 26.12l97.282 59.617h-27.902z" fill="#1487C9" />
    <path d="M41.24 120l14.556-25.993 13.583-8.27 27.903-.02-56.042 34.283z" fill="#017F36" />
    <path d="M.017 93.863l41.333-25.32-13.896-8.526-12.923 7.876v-15.798z" fill="#984995" />
    <path
      d="m 128.818,53.77 c 0,0 -2.474,1.426 -6.169,1.696 -4.248,0.126 -8.033,-2.557 -8.033,-7.324 0,-4.65 3.34,-7.315 7.926,-7.315 2.812,0 6.532,1.949 6.532,1.949 0,0 2.722,-4.995 4.132,-7.493 -2.582,-1.957 -6.021,-3.03 -10.021,-3.03 -10.095,0 -17.914,6.582 -17.914,15.83 0,9.366 7.349,15.795 17.914,15.601 2.953,-0.11 7.027,-1.147 9.51,-2.742 z"
      fill="#FFFFFF"
    />
    <path
      d="m 154.111,64.641 c 9.378,0 16.342,-5.75 16.342,-14.467 0,-8.437 -5.138,-13.915 -13.725,-13.915 -3.963,0 -7.233,1.395 -9.696,3.802 0.588,-4.975 4.795,-8.607 9.427,-8.607 1.069,0 9.117,-0.017 9.117,-0.017 l 4.551,-8.709 c 0,0 -10.104,0.23 -14.801,0.23 -10.732,0.187 -17.981,9.942 -17.981,21.79 0,13.803 7.07,19.893 16.766,19.893 z m 0.057,-20.668 c 3.482,0 5.896,2.288 5.896,6.2 0,3.521 -2.145,6.422 -5.896,6.43 -3.588,0 -6.002,-2.688 -6.002,-6.37 0,-3.913 2.414,-6.26 6.002,-6.26 z"
      fill="#FFFFFF"
    />
    <path
      d="m 206.665,34.254 v 29.338 h -10.476 v -20.58 h -10.087 v 20.58 h -10.476 v -29.34 h 31.039 z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Фирменный знак SberPay
 */
export const SberPayIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <div className={`rounded-xl bg-gradient-to-tr from-[#157e38] via-[#21a038] to-[#2ed844] flex items-center justify-center p-1.5 shadow-md shadow-emerald-950/40 ${className}`}>
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="2.4" strokeDasharray="50 15" strokeLinecap="round" />
      <path d="M7.5 12l3 3 6-6" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

/**
 * Фирменный знак T-Pay (Т-Банк)
 */
export const TPayIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <div className={`rounded-xl bg-[#202022] border border-slate-700/80 flex items-center justify-center px-1.5 py-1 gap-1 shadow-md ${className}`}>
    <svg viewBox="0 0 24 28" className="w-4 h-4 shrink-0" fill="none">
      <path d="M2 2h20v14c0 6.5-10 11.5-10 11.5S2 22.5 2 16V2z" fill="#FED800" />
      <path d="M6 6h12v3.6h-3.8v8.8h-4.4V9.6H6V6z" fill="#121212" />
    </svg>
    <span className="text-white font-black text-[10px] tracking-wider leading-none">PAY</span>
  </div>
);

interface PaymentMethodTileProps {
  method: PaymentMethodOption;
  isSelected: boolean;
  onSelect: (id: PaymentMethodId) => void;
}

export const PaymentMethodTile: React.FC<PaymentMethodTileProps> = ({
  method,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(method.id)}
      className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2.5 cursor-pointer group active:scale-[0.98] outline-none select-none ${
        isSelected
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-cyan-400/90 ring-2 ring-cyan-400/40 shadow-xl shadow-cyan-950/40 scale-[1.01]'
          : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
    >
      {/* Верхний ряд: Иконка + Радио-индикатор выбора */}
      <div className="flex items-center justify-between w-full">
        {/* Иконка метода */}
        <div className="shrink-0">
          {method.iconType === 'sbp' && (
            <div className="w-10 h-10 rounded-xl bg-[#202022] border border-slate-700/80 flex items-center justify-center px-2 shadow-sm">
              <SbpIcon className="w-full h-auto" />
            </div>
          )}
          {method.iconType === 'sberpay' && <SberPayIcon className="w-10 h-10" />}
          {method.iconType === 'tpay' && <TPayIcon className="w-10 h-10" />}
          {method.iconType === 'card' && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-950/40">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
          )}
          {method.iconType === 'globe' && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-sky-950/40">
              <Globe className="w-5 h-5 stroke-[2.2]" />
            </div>
          )}
          {method.iconType === 'wallet' && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-md shadow-purple-950/40">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
          )}
        </div>

        {/* Радио-кружок выбора */}
        <div className="flex items-center gap-2 shrink-0">
          {method.badge && (
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                method.badgeColor === 'emerald'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : method.badgeColor === 'amber'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {method.badge}
            </span>
          )}

          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'border-cyan-400 bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/30'
                : 'border-slate-700 bg-slate-900 group-hover:border-slate-600'
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
          </div>
        </div>
      </div>

      {/* Название и описание метода */}
      <div className="min-w-0 space-y-0.5 pt-0.5">
        <div className="text-xs sm:text-sm font-black text-white truncate group-hover:text-cyan-200 transition-colors">
          {method.title}
        </div>
        <div className="text-[11px] font-medium text-slate-400 truncate">
          {method.subtitle}
        </div>
      </div>
    </button>
  );
};
