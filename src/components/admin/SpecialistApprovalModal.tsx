import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Send,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import { PlumbingSpecialist } from '../../types';

interface SpecialistApprovalModalProps {
  isOpen: boolean;
  specialist: PlumbingSpecialist | null;
  onClose: () => void;
  onConfirmApprove: (id: string, verified: boolean, welcomeComment?: string, notifyUser?: boolean) => Promise<void>;
}

export const SpecialistApprovalModal: React.FC<SpecialistApprovalModalProps> = ({
  isOpen,
  specialist,
  onClose,
  onConfirmApprove,
}) => {
  const [verified, setVerified] = useState<boolean>(true);
  const [welcomeComment, setWelcomeComment] = useState<string>('Кандидатура успешно прошла проверку квалификации и документов. Добро пожаловать в команду проверенных мастеров!');
  const [notifyUser, setNotifyUser] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !specialist) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirmApprove(specialist.id, verified, welcomeComment.trim(), notifyUser);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Ошибка при одобрении мастера');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-lg shadow-2xl shadow-emerald-950/40 overflow-hidden relative flex flex-col">
        {/* Top Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Одобрение и публикация мастера
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Мастер получит доступ в кабинет мастера и появится в каталоге
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Candidate Snapshot */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-3.5">
            <img
              src={specialist.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'}
              alt={specialist.name}
              className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30 shrink-0 bg-slate-900"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-bold text-white text-sm truncate">{specialist.name}</span>
                <span className="px-2 py-0.2 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[10px] font-semibold">
                  г. {specialist.city}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-400 mt-0.5">
                <span>Тел: <strong className="text-slate-300 font-mono">{specialist.phone}</strong></span>
                {specialist.email && (
                  <span className="text-cyan-400 truncate">Email: {specialist.email}</span>
                )}
                <span>Стаж: {specialist.experienceYears || 1} лет</span>
              </div>
            </div>
          </div>

          {/* Verification Badge Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-white">
                  Присвоить статус «Верифицированный мастер»
                </span>
              </div>
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </label>
            <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
              Отображает зелёный знак верификации в каталоге и открывает полный доступ к сметному калькулятору, договорам и портфолио работ.
            </p>
          </div>

          {/* Welcome Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Приветственный комментарий (будет включен в письмо):
            </label>
            <textarea
              rows={2}
              value={welcomeComment}
              onChange={(e) => setWelcomeComment(e.target.value)}
              placeholder="Поздравление и напутствие для мастера..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none leading-relaxed resize-none"
            />
          </div>

          {/* Email Notification Option */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">
                  Автоматически отправить поздравление и инструкцию на email
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </label>
            <div className="flex items-start space-x-2 text-[11px] text-slate-400 pl-6">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                {specialist.email ? (
                  <>Письмо будет отправлено на <strong className="text-cyan-300 font-mono">{specialist.email}</strong>.</>
                ) : (
                  <>У мастера не указан email. При входе по телефону или Яндекс ID кабинет будет автоматически активирован.</>
                )}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Одобрение...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Одобрить и верифицировать</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
