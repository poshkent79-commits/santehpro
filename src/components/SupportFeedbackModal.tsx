import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  UploadCloud,
  ShieldCheck,
  User,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SupportFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

interface AttachedFile {
  filename: string;
  content: string; // base64
  contentType: string;
  size: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const TOPIC_OPTIONS = [
  'Вопрос по функционалу сервиса',
  'Помощь со сметой или расчётом',
  'Предложение по улучшению сайта',
  'Сообщение об ошибке или сбое',
  'Сотрудничество и партнёрство',
  'Другой вопрос',
];

export const SupportFeedbackModal: React.FC<SupportFeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = 'Вопрос по функционалу сервиса',
}) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [topic, setTopic] = useState<string>(defaultTopic);
  const [message, setMessage] = useState<string>('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>('');

  // Prefill from current authenticated user
  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        setName((prev) => prev || currentUser.name || '');
        setEmail((prev) => prev || currentUser.email || '');
        setPhone((prev) => prev || currentUser.phone || '');
      }
      setIsSuccess(false);
      setErrorMsg(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);

    fileList.forEach((file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMsg(`Файл «${file.name}» превышает лимит 10 МБ (${(file.size / (1024 * 1024)).toFixed(1)} МБ).`);
        return;
      }

      // Check max count
      if (attachments.length >= 5) {
        setErrorMsg('Можно прикрепить не более 5 файлов.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setAttachments((prev) => [
            ...prev,
            {
              filename: file.name,
              content: base64,
              contentType: file.type || 'application/octet-stream',
              size: file.size,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    const cleanMsg = message.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Пожалуйста, введите корректный адрес электронной почты для ответа.');
      return;
    }

    if (!cleanMsg) {
      setErrorMsg('Пожалуйста, напишите текст вашего сообщения.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          topic,
          message: cleanMsg,
          attachments,
          userUid: currentUser?.uid,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка при отправке обращения. Попробуйте позже.');
      }

      setTicketId(data.ticketId || '');
      setIsSuccess(true);
      setMessage('');
      setAttachments([]);
    } catch (err: any) {
      console.error('Support submit error:', err);
      setErrorMsg(err.message || 'Не удалось отправить сообщение. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Служба поддержки СантехПро
              </h2>
              <p className="text-xs text-sky-100 flex items-center gap-1.5 font-medium">
                <span>Обращения поступают на:</span>
                <span className="font-mono bg-sky-950/40 px-1.5 py-0.5 rounded text-white font-semibold">
                  santehpro.info@yandex.ru
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/50">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-white">
                  Обращение успешно отправлено!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Ваше сообщение и прикреплённые файлы переданы на адрес <strong className="text-cyan-300">santehpro.info@yandex.ru</strong>.
                </p>
                <p className="text-xs text-slate-400">
                  Мы внимательно изучим обращение и свяжемся с вами по электронной почте <strong className="text-white">{email}</strong>.
                </p>
              </div>

              {ticketId && (
                <div className="inline-block bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-mono text-slate-400">
                  Номер заявки: <span className="text-sky-300 font-bold">{ticketId}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  Закрыть окно
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start space-x-2 text-xs text-rose-200 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Ваше имя
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Иван Петров"
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    E-mail для ответа <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Topic Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Телефон (необязательно)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (900) 000-00-00"
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Тема обращения
                  </label>
                  <div className="relative">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      {TOPIC_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Текст сообщения <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Опишите ваш вопрос, предложение или возникшую ситуацию..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none leading-relaxed"
                />
              </div>

              {/* Attachments Section (up to 10 MB each) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold uppercase tracking-wider">Прикрепить файлы (до 10 МБ):</span>
                  <span className="text-slate-500">{attachments.length}/5 файлов</span>
                </div>

                {/* Dropzone / Upload button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/80 bg-slate-900/40 hover:bg-slate-900 text-slate-300 flex items-center justify-center gap-2 text-xs font-medium transition cursor-pointer group"
                >
                  <UploadCloud className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                  <span>Нажмите, чтобы прикрепить фото, PDF или документ (до 10 МБ)</span>
                </button>

                {/* Attached files list */}
                {attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="text-slate-200 font-medium truncate max-w-[220px] sm:max-w-xs">
                            {att.filename}
                          </span>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            ({formatFileSize(att.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                          title="Удалить файл"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 hover:from-sky-400 hover:via-cyan-400 hover:to-teal-400 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-950/40 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Отправка обращения...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-slate-950" />
                      <span>Отправить обращение</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Все обращения отправляются напрямую на santehpro.info@yandex.ru</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
