import React, { useState } from 'react';
import {
  X,
  Star,
  Share2,
  Copy,
  Check,
  Send,
  Sparkles,
  Phone,
  MessageSquare,
  QrCode,
  User,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { PlumbingSpecialist, ServiceCallRequest } from '../types';

interface RequestReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialist: PlumbingSpecialist;
  request?: ServiceCallRequest | null;
}

export const RequestReviewModal: React.FC<RequestReviewModalProps> = ({
  isOpen,
  onClose,
  specialist,
  request,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  // Form customizer
  const [clientName, setClientName] = useState(request?.clientName || '');
  const [clientPhone, setClientPhone] = useState(request?.clientPhone || '');

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? (window.location.origin || 'https://santehpro.info') : 'https://santehpro.info';
  const cleanPhone = clientPhone.replace(/\D/g, '');

  const reviewUrl = `${origin}/?reviewMaster=${encodeURIComponent(specialist.id)}${request ? `&reqId=${encodeURIComponent(request.id)}` : ''}${clientName ? `&client=${encodeURIComponent(clientName)}` : ''}`;

  const messageText = `Здравствуйте${clientName ? `, ${clientName}` : ''}! Это мастер ${specialist.name} (сервис «СантехПро»). Я завершил сантехнические работы. Буду очень благодарен, если вы уделите 30 секунд и оцените качество моей работы: ${reviewUrl}\nСпасибо за доверие! 🤝`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {}
  };

  // Direct messenger links
  const whatsappUrl = cleanPhone.length >= 10
    ? `https://api.whatsapp.com/send?phone=${cleanPhone.startsWith('8') ? '7' + cleanPhone.slice(1) : cleanPhone}&text=${encodeURIComponent(messageText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(reviewUrl)}&text=${encodeURIComponent(`Мастер ${specialist.name} просит оставить отзыв о выполненной сантехнической работе`)}`;

  const smsUrl = cleanPhone.length >= 10
    ? `sms:${cleanPhone}?body=${encodeURIComponent(messageText)}`
    : `sms:?body=${encodeURIComponent(messageText)}`;

  // High resolution QR code URL via quick charts
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(reviewUrl)}&format=svg`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl text-slate-100 space-y-5 relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-1.5">
                <span>Запрос отзыва у заказчика</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Повышайте рейтинг мастера и привлекайте новых клиентов
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

        {/* Client quick info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Имя заказчика:
            </label>
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Иван"
                className="bg-transparent text-xs text-white outline-none w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Телефон заказчика (для WhatsApp / SMS):
            </label>
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="bg-transparent text-xs text-white outline-none w-full font-mono"
              />
            </div>
          </div>
        </div>

        {/* Pre-crafted message preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Готовое вежливое сообщение клиенту:</span>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 cursor-pointer transition text-[11px]"
            >
              {copiedMessage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Текст скопирован!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Копировать текст</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans select-all">
            {messageText}
          </div>
        </div>

        {/* Instant 1-Click Send Channels */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">
            Отправить клиенту в один клик:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 transition flex items-center space-x-2.5 group cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300">WhatsApp</div>
                <div className="text-[10px] text-slate-400">Открыть чат</div>
              </div>
            </a>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-500/50 transition flex items-center space-x-2.5 group cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-sky-300">Telegram</div>
                <div className="text-[10px] text-slate-400">В мессенджер</div>
              </div>
            </a>

            {/* SMS */}
            <a
              href={smsUrl}
              className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 transition flex items-center space-x-2.5 group cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                <MessageSquare className="w-4 h-4 fill-slate-950" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300">По SMS</div>
                <div className="text-[10px] text-slate-400">На телефон</div>
              </div>
            </a>
          </div>
        </div>

        {/* Copy Link & QR code on site */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
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
                  <span>Ссылка на отзыв скопирована!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Скопировать прямую ссылку на отзыв</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowQrCode((prev) => !prev)}
              className={`py-2.5 px-3.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 border cursor-pointer shrink-0 ${
                showQrCode
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400 hover:text-amber-300'
              }`}
              title="Показать QR-код для сканирования камерой клиента"
            >
              <QrCode className="w-4 h-4" />
              <span>QR-код</span>
            </button>
          </div>

          {/* QR code view for client to scan at site */}
          {showQrCode && (
            <div className="p-4 rounded-2xl bg-white text-slate-950 flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-200 text-center shadow-xl">
              <span className="text-xs font-bold text-slate-800">
                Покажите этот QR-код клиенту для сканирования камерой:
              </span>
              <img
                src={qrCodeUrl}
                alt="QR-код для отзыва"
                className="w-44 h-44 rounded-xl border border-slate-200 shadow-inner"
              />
              <span className="text-[11px] text-slate-500">
                Клиент сразу откроет карточку мастера {specialist.name} и поставит оценку
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
