import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  Mail,
  CheckCircle2,
  FileText,
  User,
  MapPin,
  Phone,
  ShieldAlert,
  Loader2,
  Info
} from 'lucide-react';
import { PlumbingSpecialist } from '../../types';

interface SpecialistRejectionModalProps {
  isOpen: boolean;
  specialist: PlumbingSpecialist | null;
  onClose: () => void;
  onConfirmReject: (id: string, reason: string, comment: string, notifyUser: boolean) => Promise<void>;
}

export const PRESET_REJECTION_REASONS = [
  {
    id: 'docs',
    label: 'Неполный пакет документов или нечитаемые сканы/фото',
    defaultComment: 'Пожалуйста, загрузите чёткие фотографии документов, удостоверяющих личность или квалификацию (паспорт, свидетельство самозанятого/ИП, сертификаты).',
  },
  {
    id: 'experience',
    label: 'Несоответствие опыта заявленным сложным инженерным услугам',
    defaultComment: 'Указанный опыт работы или портфолио пока не подтверждают квалификацию по сложным видам инженерного монтажа. Рекомендуем уточнить специализацию.',
  },
  {
    id: 'contacts',
    label: 'Некорректный номер телефона или невозможно связаться',
    defaultComment: 'Администратор не смог дозвониться по указанному телефону для подтверждения анкеты. Проверьте правильность номера и доступность связи.',
  },
  {
    id: 'photo',
    label: 'Несоответствие фотографии профиля требованиям сервиса',
    defaultComment: 'Пожалуйста, прикрепите реальное профессиональное фото мастера крупным планом (без посторонних лиц и сторонних логотипов).',
  },
  {
    id: 'bio',
    label: 'Неполное или неинформативное описание квалификации и услуг',
    defaultComment: 'Дополните раздел «О себе»: укажите используемый инструмент, гарантии на работы и перечень выполняемых задач.',
  },
  {
    id: 'other',
    label: 'Другая причина (укажите в комментарии ниже)',
    defaultComment: '',
  },
];

export const SpecialistRejectionModal: React.FC<SpecialistRejectionModalProps> = ({
  isOpen,
  specialist,
  onClose,
  onConfirmReject,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(PRESET_REJECTION_REASONS[0].label);
  const [comment, setComment] = useState<string>(PRESET_REJECTION_REASONS[0].defaultComment);
  const [notifyUser, setNotifyUser] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (specialist) {
      setSelectedReason(PRESET_REJECTION_REASONS[0].label);
      setComment(PRESET_REJECTION_REASONS[0].defaultComment);
      setNotifyUser(true);
      setError(null);
      setIsSubmitting(false);
    }
  }, [specialist]);

  if (!isOpen || !specialist) return null;

  const handleSelectPreset = (preset: typeof PRESET_REJECTION_REASONS[0]) => {
    setSelectedReason(preset.label);
    if (preset.id !== 'other') {
      setComment(preset.defaultComment);
    } else if (comment === PRESET_REJECTION_REASONS[0].defaultComment) {
      setComment('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason.trim()) {
      setError('Выберите или укажите причину отказа');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirmReject(specialist.id, selectedReason.trim(), comment.trim(), notifyUser);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Ошибка при отклонении заявки');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-xl shadow-2xl shadow-rose-950/40 overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Top Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-rose-600 via-red-500 to-amber-500" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Отклонение кандидатуры мастера
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Укажите причину отказа и рекомендации по устранению замечаний
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Candidate Snapshot */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-3.5">
            <img
              src={specialist.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'}
              alt={specialist.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-900"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-bold text-white text-sm truncate">{specialist.name}</span>
                <span className="px-2 py-0.2 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25 text-[10px] font-semibold">
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

          {/* Quick Preset Reasons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Выберите причину отказа:
            </label>
            <div className="space-y-1.5">
              {PRESET_REJECTION_REASONS.map((preset) => {
                const isSelected = selectedReason === preset.label;
                return (
                  <label
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-start space-x-2.5 p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-rose-500/10 border-rose-500/40 text-white font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      checked={isSelected}
                      onChange={() => handleSelectPreset(preset)}
                      className="mt-0.5 text-rose-500 focus:ring-rose-500 h-3.5 w-3.5 shrink-0"
                    />
                    <span className="leading-snug">{preset.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Detailed Custom Explanation / Recommendation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Рекомендации по исправлению для мастера:
              </label>
              <span className="text-[11px] text-slate-500">
                Будет показано в кабинете мастера
              </span>
            </div>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Напишите, что именно нужно исправить или догрузить мастеру для успешного прохождения повторной проверки..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none leading-relaxed resize-none"
            />
          </div>

          {/* Automated Notification Options */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">
                  Автоматически отправить уведомление на email
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </label>

            <div className="flex items-start space-x-2 text-[11px] text-slate-400 pl-6">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                {specialist.email ? (
                  <>Письмо будет отправлено на <strong className="text-cyan-300 font-mono">{specialist.email}</strong> с официальным уведомлением и кнопкой повторной подачи.</>
                ) : (
                  <>У кандидата не указан email. Уведомление гарантированно отобразится в его Личном кабинете при входе по номеру телефона / Яндекс ID.</>
                )}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
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
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow-lg shadow-rose-600/30 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Отправка решения...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Отклонить заявку и уведомить</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
