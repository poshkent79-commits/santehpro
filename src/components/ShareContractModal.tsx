import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  MessageCircle,
  Send,
  Phone,
  Copy,
  Check,
  Share2,
  FileText,
  Download,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { PlumbingContract } from '../types';

interface ShareContractModalProps {
  contract: PlumbingContract;
  isOpen: boolean;
  onClose: () => void;
  onDownloadDoc?: () => void;
  onPrint?: () => void;
  shareUrl: string;
}

export const ShareContractModal: React.FC<ShareContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  onDownloadDoc,
  shareUrl,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const cleanPhone = (contract.clientPhone || '').replace(/\D/g, '');

  // Formatted message text
  const shareMessage = `Здравствуйте, ${contract.clientName}!\n\nНаправляю вам официальный договор подряда и акт № ${contract.contractNumber} от ${formatDate(contract.contractDate)} на выполнение сантехнических работ по адресу: ${contract.clientAddress}.\n\nСумма договора: ${contract.totalPrice.toLocaleString('ru-RU')} ₽.\nОфициальная гарантия на монтаж: ${contract.warrantyMonths} мес.\n\nПожалуйста, ознакомьтесь и подпишите договор со своего смартфона по защищённой ссылке:\n${shareUrl}\n\nС уважением, мастер ${contract.specialistName} (${contract.specialistPhone})\nСервис «СантехПро»: https://santehpro.info`;

  // WhatsApp
  const handleSendWhatsApp = () => {
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
  };

  // Telegram
  const handleSendTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
      `Договор подряда № ${contract.contractNumber} на сантехнические работы по адресу: ${contract.clientAddress}. Сумма: ${contract.totalPrice.toLocaleString('ru-RU')} ₽.`
    )}`;
    window.open(tgUrl, '_blank');
  };

  // SMS
  const handleSendSMS = () => {
    const smsText = `Договор подряда № ${contract.contractNumber} (${contract.specialistName}): ${shareUrl}`;
    const smsUrl = cleanPhone ? `sms:${cleanPhone}?body=${encodeURIComponent(smsText)}` : `sms:?body=${encodeURIComponent(smsText)}`;
    window.location.href = smsUrl;
  };

  // Copy Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // fallback
    }
  };

  // Copy Full Text
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    } catch {
      // fallback
    }
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Договор № ${contract.contractNumber}`,
          text: `Официальный договор подряда № ${contract.contractNumber} (${contract.specialistName})`,
          url: shareUrl,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white text-slate-900 border border-slate-200 rounded-3xl max-w-md w-full max-h-[92dvh] sm:max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed & Always Visible at Top */}
        <div className="px-3.5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          {/* Prominent Back Button on Left */}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
            title="Вернуться назад к договору"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
            <span>Назад</span>
          </button>

          {/* Centered Title */}
          <div className="text-center min-w-0 px-2 flex-1">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
              Отправка договора
            </h3>
            <p className="text-[11px] text-slate-500 truncate">
              № {contract.contractNumber}
            </p>
          </div>

          {/* Close Button on Right */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer active:scale-95"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client preview info card */}
        <div className="px-4 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs shrink-0">
          <div className="min-w-0 pr-2">
            <div className="font-bold text-blue-950 truncate">{contract.clientName}</div>
            <div className="text-slate-600 font-mono text-[11px] truncate">
              {contract.clientPhone || 'Номер не указан'}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] text-slate-500">Сумма договора</div>
            <div className="font-extrabold text-blue-700 text-sm">
              {contract.totalPrice.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        {/* Action Menu List - Scrollable Inside Card */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-2">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition flex items-center justify-between shadow-xs cursor-pointer active:scale-98"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-black truncate">Отправить в WhatsApp</div>
                <div className="text-[10px] text-emerald-100 font-normal truncate">
                  Ссылка на согласование и текст в чат клиента
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-100 shrink-0 ml-2" />
          </button>

          {/* Telegram */}
          <button
            type="button"
            onClick={handleSendTelegram}
            className="w-full p-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition flex items-center justify-between shadow-xs cursor-pointer active:scale-98"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-black truncate">Отправить в Telegram</div>
                <div className="text-[10px] text-sky-100 font-normal truncate">
                  Переслать ссылку через Telegram
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-sky-100 shrink-0 ml-2" />
          </button>

          {/* SMS */}
          <button
            type="button"
            onClick={handleSendSMS}
            className="w-full p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center justify-between border border-slate-200 cursor-pointer active:scale-98"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Отправить через СМС</div>
                <div className="text-[10px] text-slate-500 font-normal truncate">
                  Быстрое SMS на телефон {contract.clientPhone || 'заказчика'}
                </div>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-semibold shrink-0 ml-2">SMS</span>
          </button>

          {/* Copy Shareable Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center justify-between border border-slate-200 cursor-pointer active:scale-98"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {copiedLink ? 'Ссылка скопирована в буфер!' : 'Скопировать ссылку для согласования'}
                </div>
                <div className="text-[10px] text-slate-500 font-normal truncate">
                  Прямая ссылка для отправки в любой мессенджер
                </div>
              </div>
            </div>
            {copiedLink ? (
              <span className="text-[11px] font-bold text-emerald-600 shrink-0 ml-2">Готово!</span>
            ) : (
              <Copy className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            )}
          </button>

          {/* Copy Full Text */}
          <button
            type="button"
            onClick={handleCopyText}
            className="w-full p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center justify-between border border-slate-200 cursor-pointer active:scale-98"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4" />}
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {copiedText ? 'Текст скопирован!' : 'Скопировать текст сообщения'}
                </div>
                <div className="text-[10px] text-slate-500 font-normal truncate">
                  Готовый сопроводительный текст с суммой и реквизитами
                </div>
              </div>
            </div>
            {copiedText ? (
              <span className="text-[11px] font-bold text-emerald-600 shrink-0 ml-2">Готово!</span>
            ) : (
              <Copy className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            )}
          </button>

          {/* System Share (Android / iOS) */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center justify-between border border-slate-200 cursor-pointer active:scale-98"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Другие приложения телефона</div>
                <div className="text-[10px] text-slate-500 font-normal truncate">
                  ВКонтакте, Почта, Viber, MAX и другие
                </div>
              </div>
            </div>
            <Share2 className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
          </button>

          {/* Download Word single instance */}
          {onDownloadDoc && (
            <button
              type="button"
              onClick={() => {
                onDownloadDoc();
                onClose();
              }}
              className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold transition flex items-center justify-between border border-slate-200 cursor-pointer active:scale-98"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Скачать файл для Word (.doc)</div>
                  <div className="text-[10px] text-slate-500 font-normal truncate">
                    Сохранить 1 экземпляр документа на устройство
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            </button>
          )}
        </div>

        {/* Footer - Fixed at Bottom with Back Button & Legal Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
            <span>Вернуться к просмотру договора</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Защищено простой электронной подписью (ст. 434 ГК РФ)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
