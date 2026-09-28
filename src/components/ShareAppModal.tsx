import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  customText?: string;
  customUrl?: string;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  customText,
  customUrl,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const defaultUrl = 'https://santehpro.info';
  const shareUrl = customUrl || defaultUrl;

  const shareText =
    customText ||
    'СантехПро — отличный бесплатный сервис по сантехнике: пошаговые инструкции, обучающие курсы, расчёт материалов и база проверенных мастеров по всей России и СНГ! Рекомендую 👍';

  const fullMessage = `${shareText}\n\n👉 Открыть сервис: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyFullMessage = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'СантехПро — Справочник и мастера сантехники',
          text: shareText,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('Native share error:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Messenger URL generators
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
  const maxUrl = `https://max.ru/:share?text=${encodeURIComponent(fullMessage)}`;
  const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('СантехПро — Справочник и мастера')}&comment=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl text-slate-100 space-y-5 relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-1.5">
                <span>Поделиться СантехПро</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Отправьте ссылку в любой удобный мессенджер
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message preview */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Текст сообщения для отправки:</span>
            <button
              type="button"
              onClick={handleCopyFullMessage}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 cursor-pointer transition"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Копировать всё</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            {shareText}
            <span className="block mt-1.5 text-cyan-400 font-mono text-[11px]">
              {shareUrl}
            </span>
          </p>
        </div>

        {/* Messengers Grid */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">
            Выберите мессенджер для отправки:
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-500/50 transition flex items-center space-x-3 group shadow-sm cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shrink-0 shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                  Telegram
                </div>
                <div className="text-[10px] text-slate-400">В чат или канал</div>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 transition flex items-center space-x-3 group shadow-sm cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.33C9.33 7.33 9.03 7.41 8.77 7.69C8.5 7.97 7.76 8.67 7.76 10.1C7.76 11.53 8.8 12.91 8.95 13.11C9.1 13.31 11 16.24 13.9 17.49C14.59 17.79 15.13 17.97 15.55 18.1C16.24 18.32 16.87 18.29 17.37 18.22C17.93 18.14 19.09 17.52 19.33 16.84C19.57 16.16 19.57 15.58 19.5 15.46C19.43 15.34 19.24 15.27 18.95 15.13C18.66 14.99 17.24 14.29 16.98 14.19C16.72 14.09 16.53 14.04 16.34 14.33C16.15 14.62 15.58 15.29 15.41 15.48C15.24 15.67 15.07 15.7 14.78 15.56C14.49 15.42 13.56 15.11 12.46 14.13C11.61 13.37 11.03 12.43 10.87 12.14C10.7 11.85 10.85 11.69 11 11.55C11.13 11.42 11.29 11.21 11.44 11.04C11.59 10.87 11.64 10.75 11.74 10.55C11.84 10.35 11.79 10.18 11.72 10.04C11.65 9.9 11.07 8.47 10.83 7.89C10.6 7.33 10.37 7.41 10.19 7.41C10.03 7.4 9.83 7.33 9.53 7.33Z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                  WhatsApp
                </div>
                <div className="text-[10px] text-slate-400">Лично или в чат</div>
              </div>
            </a>

            {/* MAX (Макс) */}
            <a
              href={maxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 transition flex items-center space-x-3 group shadow-sm cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 text-white flex items-center justify-center shrink-0 shadow-md font-black text-xs tracking-wider">
                MAX
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                  Max (Макс)
                </div>
                <div className="text-[10px] text-slate-400">Мессенджер Max</div>
              </div>
            </a>

            {/* Системное меню / Ещё приложения */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="p-3.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 transition flex items-center space-x-3 group shadow-sm cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md font-bold">
                <Smartphone className="w-5 h-5 text-slate-950" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                  Ещё приложения
                </div>
                <div className="text-[10px] text-slate-400">Системное меню</div>
              </div>
            </button>
          </div>
        </div>

        {/* Direct Link Copy & Native Share */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 border shadow-sm cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Ссылка скопирована в буфер!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Скопировать прямую ссылку</span>
                </>
              )}
            </button>

            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="py-2.5 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-500/20 cursor-pointer shrink-0"
                title="Открыть системное меню «Поделиться»"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Ещё...</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
