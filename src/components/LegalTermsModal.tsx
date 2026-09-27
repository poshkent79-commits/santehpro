import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Scale,
  FileCheck2,
  FileText,
} from 'lucide-react';
import {
  PRIVACY_POLICY_SECTIONS,
  TERMS_OF_USE_SECTIONS,
  OFERTA_SECTIONS,
} from '../data/legalTerms';

export type LegalDocType = 'privacy' | 'terms' | 'offer';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocType;
  docType?: LegalDocType;
  initialSection?: string;
  role?: 'user' | 'specialist';
  onAcceptAll?: () => void;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  isOpen,
  onClose,
  initialDoc,
  docType,
  initialSection,
  onAcceptAll,
}) => {
  const effectiveDoc = docType || initialDoc || 'privacy';
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(effectiveDoc);

  React.useEffect(() => {
    setActiveDoc(docType || initialDoc || 'privacy');
  }, [initialDoc, docType, isOpen]);

  React.useEffect(() => {
    if (initialSection) {
      setTimeout(() => {
        const el = document.getElementById(initialSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [initialSection, isOpen]);

  if (!isOpen) return null;

  const currentSections =
    activeDoc === 'privacy'
      ? PRIVACY_POLICY_SECTIONS
      : activeDoc === 'offer'
      ? OFERTA_SECTIONS
      : TERMS_OF_USE_SECTIONS;

  const currentTitle =
    activeDoc === 'privacy'
      ? 'Политика конфиденциальности (152-ФЗ)'
      : activeDoc === 'offer'
      ? 'Публичная оферта о добровольном пожертвовании'
      : 'Пользовательское соглашение сервиса';

  const CurrentIcon =
    activeDoc === 'privacy'
      ? ShieldCheck
      : activeDoc === 'offer'
      ? FileText
      : Scale;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl h-[92vh] max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Document Switcher Tabs */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-950/90 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <CurrentIcon className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {currentTitle}
              </h2>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick tab switcher between all 3 legal documents */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveDoc('offer')}
              className={`flex-1 min-w-[130px] px-3 py-1.5 rounded-lg font-medium transition cursor-pointer text-center whitespace-nowrap ${
                activeDoc === 'offer'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Публичная оферта (пожертвования)
            </button>
            <button
              type="button"
              onClick={() => setActiveDoc('terms')}
              className={`flex-1 min-w-[160px] px-3 py-1.5 rounded-lg font-medium transition cursor-pointer text-center whitespace-nowrap ${
                activeDoc === 'terms'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Пользовательское соглашение
            </button>
            <button
              type="button"
              onClick={() => setActiveDoc('privacy')}
              className={`flex-1 min-w-[160px] px-3 py-1.5 rounded-lg font-medium transition cursor-pointer text-center whitespace-nowrap ${
                activeDoc === 'privacy'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Политика конфиденциальности
            </button>
          </div>
        </div>

        {/* Document Reader with comfortable, readable font */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-7 space-y-6 overscroll-contain">
          {currentSections.map((sec) => (
            <div
              key={sec.id}
              id={sec.id}
              className="space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80"
            >
              <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2.5">
                <FileCheck2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {sec.title}
                </h3>
              </div>
              <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
                {sec.content}
              </div>
            </div>
          ))}
        </div>

        {/* Clean Footer Bar */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span>Редакция 3.0 от 26 сентября 2026 года • Самозанятый Туйчиев Д. Н. • E-mail для обращений:{' '}
              <a href="mailto:santehpro.info@gmail.com" className="text-cyan-400 hover:underline">
                santehpro.info@gmail.com
              </a>
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onAcceptAll && (
              <button
                onClick={onAcceptAll}
                type="button"
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Принять условия
              </button>
            )}

            <button
              onClick={onClose}
              type="button"
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Понятно, закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
