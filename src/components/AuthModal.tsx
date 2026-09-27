import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  Loader2,
  AlertCircle,
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
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            {/* Аккуратный синий логотип с гаечным ключом */}
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 text-white shrink-0">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            {/* Текст «Сантех» (красный), «Про» (синий) · Вход */}
            <div className="text-sm sm:text-base font-black tracking-tight">
              <span className="text-red-500">Сантех</span>
              <span className="text-blue-500">Про</span>
              <span className="text-slate-400 font-normal text-xs sm:text-sm"> · Вход</span>
            </div>
          </div>

          {/* Маленькая иконка закрытия крестик «✕» */}
          <button
            type="button"
            id="auth-modal-close-btn"
            onClick={closeAuthModal}
            aria-label="Закрыть окно"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= 2. ЦЕНТРАЛЬНЫЙ БЛОК АВТОРИЗАЦИИ ================= */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* По центру крупная скругленная красная иконка с белой буквой «Я» */}
          <div className="text-center space-y-2.5 pt-1">
            <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/30 font-black text-3xl mx-auto transform hover:scale-105 transition-transform duration-200 select-none">
              <span>Я</span>
            </div>

            {/* Четкий белый заголовок: «Вход в СантехПро» */}
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Вход в СантехПро
            </h2>

            {/* Подзаголовок приглушенным светло-серым цветом: «Единый личный кабинет для клиентов и мастеров» */}
            <p className="text-xs sm:text-sm text-slate-400 leading-snug">
              Единый личный кабинет для клиентов и мастеров
            </p>
          </div>

          {/* Сообщение об ошибке (если есть) */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Предупреждение о блокировке popup (при необходимости) */}
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

          {/* ================= 3. ОСНОВНАЯ КНОПКА ДЕЙСТВИЯ ================= */}
          <div className="space-y-4 pt-1">
            <button
              type="button"
              id="auth-yandex-primary-btn"
              disabled={isYandexLoading}
              onClick={handleYandexAuth}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center space-x-3 transition-all duration-200 shadow-xl shadow-red-600/10 hover:shadow-red-600/20 cursor-pointer border border-white active:scale-[0.99] disabled:opacity-60"
            >
              {/* Круглая красная иконка «Я» */}
              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {isYandexLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <span>Я</span>}
              </div>
              {/* Четкий черный текст «Войти с Яндекс ID» */}
              <span className="text-slate-950 font-extrabold tracking-tight">
                {isYandexLoading ? 'Подключение к Яндекс ID...' : 'Войти с Яндекс ID'}
              </span>
            </button>

            {/* ================= 4. БЛОК СОГЛАСИЙ (ВНИЗУ) ================= */}
            <div className="space-y-2 pt-1 text-xs text-slate-200">
              {/* Отмеченный чекбокс: белый текст «Согласен на обработку персональных данных (152-ФЗ)», фраза выделена как синяя кликабельная ссылка */}
              <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dataConsentAccepted}
                  onChange={(e) => setDataConsentAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-500 accent-blue-600 cursor-pointer shrink-0"
                />
                <span className="leading-snug text-slate-300">
                  Согласен на{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLegalDocType('privacy');
                      setIsLegalModalOpen(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 underline-offset-2 transition-colors cursor-pointer inline p-0 bg-transparent border-0 font-medium text-xs"
                  >
                    обработку персональных данных (152-ФЗ)
                  </button>
                </span>
              </label>

              {/* Отмеченный чекбокс: белый текст «Принимаю условия Пользовательского соглашения», фраза выделена как синяя кликабельная ссылка */}
              <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-500 accent-blue-600 cursor-pointer shrink-0"
                />
                <span className="leading-snug text-slate-300">
                  Принимаю условия{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLegalDocType('terms');
                      setIsLegalModalOpen(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 underline-offset-2 transition-colors cursor-pointer inline p-0 bg-transparent border-0 font-medium text-xs"
                  >
                    Пользовательского соглашения
                  </button>
                </span>
              </label>
            </div>
          </div>

          {/* ================= 5. ФУТЕР ================= */}
          <div className="pt-2 border-t border-slate-800/60 text-center">
            <a
              href="mailto:support@santehpro.info?subject=Вопрос%20по%20входу%20в%20СантехПро"
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors inline-block py-1"
            >
              Возникли сложности? Написать в поддержку
            </a>
          </div>
        </div>
      </div>

      {/* Юридическое модальное окно с полными текстами соглашений */}
      <LegalTermsModal
        isOpen={isLegalModalOpen}
        initialDoc={legalDocType}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
};
