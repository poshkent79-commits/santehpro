import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertCircle,
  Wrench,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LegalTermsModal } from './LegalTermsModal';

interface AuthModalProps {
  selectedCity?: string;
  onNavigateTab?: (tab: 'handbook' | 'courses' | 'calculator' | 'specialists' | 'diagnostic' | 'admin' | 'cabinet') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onNavigateTab }) => {
  const {
    isAuthModalOpen,
    authModalReason,
    closeAuthModal,
    loginWithYandex,
  } = useAuth();

  const [dataConsentAccepted, setDataConsentAccepted] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isYandexLoading, setIsYandexLoading] = useState(false);
  const [popupBlockedUrl, setPopupBlockedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Legal modal state
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<'privacy' | 'terms'>('privacy');

  // Reset state when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
      setPopupBlockedUrl(null);
      setIsYandexLoading(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const formatErrorMessage = (err: any): string => {
    const raw = err?.message || String(err || '');
    if (
      raw.includes('Failed to fetch') ||
      raw.includes('NetworkError') ||
      raw.includes('перенести') ||
      raw.includes('Load failed')
    ) {
      return 'Временная задержка соединения с сервером. Пожалуйста, повторите попытку через несколько секунд.';
    }
    return raw || 'Произошла ошибка при выполнении операции. Попробуйте еще раз.';
  };

  // Unified Yandex ID OAuth
  const handleYandexAuth = async () => {
    if (!dataConsentAccepted || !termsAccepted) {
      setError('Для продолжения необходимо подтвердить согласие с Политикой обработки персональных данных и Пользовательским соглашением');
      return;
    }

    setIsYandexLoading(true);
    setError(null);
    setPopupBlockedUrl(null);

    try {
      await loginWithYandex(false);
      if (onNavigateTab) {
        onNavigateTab('cabinet');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.startsWith('POPUP_BLOCKED:')) {
        const directUrl = msg.replace('POPUP_BLOCKED:', '');
        setPopupBlockedUrl(directUrl);
        setError('Браузер заблокировал всплывающее окно. Нажмите кнопку ниже для прямого перехода в Яндекс.');
      } else {
        setError(formatErrorMessage(err));
      }
    } finally {
      setIsYandexLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm sm:max-w-md overflow-hidden shadow-2xl relative flex flex-col">
        {/* ================= 1. ШАПКА ================= */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-md shadow-red-600/20 text-white font-black text-sm">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black tracking-tight text-white">
                <span className="text-red-500">Сантех</span>
                <span className="text-blue-500">Про</span>
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">· Вход</span>
            </div>
          </div>

          <button
            type="button"
            id="auth-modal-close-btn"
            onClick={closeAuthModal}
            aria-label="Закрыть окно"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reason notice if triggered by protected action */}
        {authModalReason && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300 font-medium leading-relaxed">
              {authModalReason}
            </p>
          </div>
        )}

        {/* ================= 2. ОСНОВНОЙ КОНТЕНТ ================= */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Hero Branding */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/30 font-black text-3xl mx-auto transform hover:scale-105 transition-transform duration-200">
              <span>Я</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Вход через Яндекс ID
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Popup Blocked Warning & Direct Link */}
          {popupBlockedUrl && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-start space-x-2">
                <ExternalLink className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Браузер заблокировал всплывающее окно. Нажмите кнопку ниже для прямого перехода:
                </div>
              </div>
              <a
                href={popupBlockedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md"
              >
                <span>Перейти на страницу Яндекс ID ↗</span>
              </a>
            </div>
          )}

          {/* Primary Action Button: Unified Yandex ID */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              id="auth-yandex-primary-btn"
              disabled={isYandexLoading}
              onClick={handleYandexAuth}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm flex items-center justify-center space-x-3 transition-all duration-200 shadow-xl shadow-red-600/10 hover:shadow-red-600/20 cursor-pointer border border-white active:scale-[0.99] disabled:opacity-60"
            >
              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                {isYandexLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Я</span>}
              </div>
              <span>
                {isYandexLoading ? 'Подключение к Яндекс ID...' : 'Войти с Яндекс ID'}
              </span>
            </button>

            {/* ================= ЧЕКБОКСЫ ПОД КНОПКОЙ ================= */}
            {/* Ссылки не выделяются яркими цветами и открываются исключительно при клике на них */}
            <div className="space-y-2.5 pt-1 text-[11px] text-slate-400">
              <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dataConsentAccepted}
                  onChange={(e) => setDataConsentAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-950 cursor-pointer shrink-0"
                />
                <span className="leading-snug text-slate-400">
                  Согласен на{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLegalDocType('privacy');
                      setIsLegalModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-slate-200 underline decoration-slate-600/70 hover:decoration-slate-400 underline-offset-2 transition-colors cursor-pointer inline p-0 bg-transparent border-0 font-normal"
                  >
                    обработку персональных данных
                  </button>
                </span>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-950 cursor-pointer shrink-0"
                />
                <span className="leading-snug text-slate-400">
                  Принимаю условия{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLegalDocType('terms');
                      setIsLegalModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-slate-200 underline decoration-slate-600/70 hover:decoration-slate-400 underline-offset-2 transition-colors cursor-pointer inline p-0 bg-transparent border-0 font-normal"
                  >
                    пользовательского соглашения
                  </button>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Legal terms modal dialog with complete full texts */}
      <LegalTermsModal
        isOpen={isLegalModalOpen}
        initialDoc={legalDocType}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
};
