import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Wrench,
  Package,
  FileCheck,
  CheckCircle2,
  Send,
  Sparkles,
  ExternalLink,
  DollarSign,
  Globe
} from 'lucide-react';
import { MasterPlumbingEstimate } from '../types';

export const SANTEHPRO_OFFICIAL_DOMAIN = 'https://santehpro.info';

export const getEstimateShareUrl = (estimateId: string) => {
  return `${SANTEHPRO_OFFICIAL_DOMAIN}/?estimate=${estimateId}`;
};

interface ClientEstimateModalProps {
  estimate: MasterPlumbingEstimate;
  isOpen?: boolean;
  onClose: () => void;
  onStatusChange?: (newStatus: MasterPlumbingEstimate['status']) => void;
  onEdit?: () => void;
  isMasterView?: boolean;
  onOpenMasterProfile?: (specialistIdOrName: string) => void;
}

export const ClientEstimateModal: React.FC<ClientEstimateModalProps> = ({
  estimate,
  isOpen = true,
  onClose,
  onStatusChange,
  onEdit,
  isMasterView = true,
  onOpenMasterProfile,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const works = estimate.items.filter((i) => i.type === 'work');
  const materials = estimate.items.filter((i) => i.type === 'material');

  // Master profile direct link
  const masterQuery = estimate.specialistId || (estimate.specialistPhone ? estimate.specialistPhone.replace(/\D/g, '') : '') || estimate.specialistName;
  const masterProfileUrl = masterQuery ? `${SANTEHPRO_OFFICIAL_DOMAIN}/?tab=specialists&master=${encodeURIComponent(masterQuery)}` : '';

  // Generate clean shareable text for messengers
  const generateMessengerText = () => {
    let text = `📋 *СМЕТА НА САНТЕХНИЧЕСКИЕ РАБОТЫ*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 *Мастер:* ${estimate.specialistName || 'Специалист СантехПро'}\n`;
    if (estimate.specialistPhone) text += `📞 *Тел. мастера:* ${estimate.specialistPhone}\n`;
    text += `👤 *Заказчик:* ${estimate.clientName || 'Клиент'}\n`;
    if (estimate.clientAddress) text += `📍 *Объект:* ${estimate.clientAddress}\n`;
    text += `📅 *Дата составления:* ${new Date(estimate.createdAt).toLocaleDateString('ru-RU')}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (works.length > 0) {
      text += `🔧 *РАБОТЫ (${works.length} поз.):*\n`;
      works.forEach((w, idx) => {
        text += `${idx + 1}. ${w.name} — ${w.quantity} ${w.unit} × ${w.price.toLocaleString('ru-RU')} ₽ = *${w.total.toLocaleString('ru-RU')} ₽*\n`;
      });
      text += `*Итого за работы:* ${estimate.worksTotal.toLocaleString('ru-RU')} ₽\n\n`;
    }

    if (materials.length > 0) {
      text += `📦 *МАТЕРИАЛЫ И РАСХОДНИКИ (${materials.length} поз.):*\n`;
      materials.forEach((m, idx) => {
        text += `${idx + 1}. ${m.name} — ${m.quantity} ${m.unit} × ${m.price.toLocaleString('ru-RU')} ₽ = *${m.total.toLocaleString('ru-RU')} ₽*\n`;
      });
      text += `*Итого за материалы:* ${estimate.materialsTotal.toLocaleString('ru-RU')} ₽\n\n`;
    }

    if (estimate.discountAmount && estimate.discountAmount > 0) {
      text += `🏷️ *Скидка:* -${estimate.discountAmount.toLocaleString('ru-RU')} ₽\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *ИТОГО К ОПЛАТЕ: ${estimate.grandTotal.toLocaleString('ru-RU')} ₽*\n`;
    if (estimate.advancePayment && estimate.advancePayment > 0) {
      text += `💵 *Аванс:* ${estimate.advancePayment.toLocaleString('ru-RU')} ₽\n`;
      text += `💳 *Остаток по завершении:* ${(estimate.remainingPayment || (estimate.grandTotal - estimate.advancePayment)).toLocaleString('ru-RU')} ₽\n`;
    }
    text += `🛡️ *Гарантия:* ${estimate.warrantyMonths} месяцев\n`;
    text += `⏱️ *Срок выполнения:* ${estimate.executionDays || 'По согласованию'}\n`;
    if (estimate.notes) {
      text += `📝 *Примечания:* ${estimate.notes}\n`;
    }
    text += `\n🌐 *Официальная смета СантехПро:* ${getEstimateShareUrl(estimate.id)}\n`;
    if (masterProfileUrl) {
      text += `👤 *Профиль и отзывы мастера:* ${masterProfileUrl}\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateMessengerText());
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    } catch (e) {
      console.error('Failed to copy text:', e);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = getEstimateShareUrl(estimate.id);
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      console.error('Failed to copy link:', e);
    }
  };

  const handleWhatsAppShare = () => {
    const rawText = generateMessengerText();
    const encoded = encodeURIComponent(rawText);
    const cleanPhone = (estimate.clientPhone || '').replace(/\D/g, '');
    const url = cleanPhone.length >= 10
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const rawText = generateMessengerText();
    const shareUrl = getEstimateShareUrl(estimate.id);
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(rawText)}`;
    window.open(url, '_blank');
  };

  const handleMaxShare = () => {
    const rawText = generateMessengerText();
    const encoded = encodeURIComponent(rawText);
    const url = `https://max.ru/:share?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (estimate.status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" /> Согласована клиентом
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Send className="w-3.5 h-3.5" /> Отправлена заказчику
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <FileCheck className="w-3.5 h-3.5" /> Работы завершены
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
            <X className="w-3.5 h-3.5" /> Отклонена
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">
            Черновик
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {estimate.title || 'Смета на сантехнические работы'}
                </h3>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-400">
                Смета № {estimate.id.slice(-6).toUpperCase()} • от {new Date(estimate.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMasterView && onEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                Редактировать
              </button>
            )}
            <button
              onClick={handlePrint}
              title="Распечатать или сохранить в PDF"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Печать / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Banner: Propose to Client Fast (WhatsApp, Telegram, Copy) (Hidden on Print) */}
        <div className="print:hidden bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/40 border-b border-slate-800/80 p-3 sm:p-4 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-white">Предложить смету клиенту:</strong> официальная ссылка на santehpro.info
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 transition cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>В WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleTelegramShare}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-sky-900/30 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>В Telegram</span>
              </button>
              <button
                type="button"
                onClick={handleMaxShare}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/30 transition cursor-pointer"
                title="Отправить смету через мессенджер MAX"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>В MAX</span>
              </button>
              <button
                type="button"
                onClick={handleCopyText}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Текст скопирован!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Скопировать текст</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
                title="Скопировать ссылку santehpro.info на смету"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Ссылка скопирована!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ссылка</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-xl">
            <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400">Официальная ссылка для клиента:</span>
            <span className="text-sky-300 font-mono font-semibold select-all break-all">
              {getEstimateShareUrl(estimate.id)}
            </span>
          </div>
        </div>

        {/* Main Printable Estimate Sheet */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 bg-slate-900 print:bg-white print:text-black">
          {/* Header of the Proposal / Invoice */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800 print:border-gray-300">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-blue-400 print:text-blue-700 tracking-tight">
                  СантехПро
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 print:border-gray-300 print:bg-gray-100 print:text-gray-700">
                  Официальное коммерческое предложение
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white print:text-black mt-2">
                {estimate.title || 'Смета на сантехнические работы'}
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                Дата формирования: {new Date(estimate.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Master Card Box */}
            <div className="bg-slate-950/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-2xl p-4 sm:w-72">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 print:text-gray-500 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                <span>Исполнитель работ</span>
              </div>
              <p className="text-sm font-bold text-white print:text-black">{estimate.specialistName}</p>
              {estimate.specialistPhone && (
                <p className="text-xs text-blue-400 print:text-blue-700 mt-0.5 flex items-center gap-1 font-semibold">
                  <Phone className="w-3 h-3" /> {estimate.specialistPhone}
                </p>
              )}
              {estimate.specialistCity && (
                <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {estimate.specialistCity}
                </p>
              )}

              {masterQuery && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenMasterProfile) {
                      onOpenMasterProfile(masterQuery);
                    } else {
                      window.open(masterProfileUrl, '_blank');
                    }
                  }}
                  className="mt-3 w-full py-1.5 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer print:hidden shadow-sm"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Профиль и отзывы мастера →</span>
                </button>
              )}
            </div>
          </div>

          {/* Client & Object Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 print:bg-gray-50 p-4 rounded-2xl border border-slate-800/80 print:border-gray-200">
            <div>
              <span className="text-xs font-semibold text-slate-400 print:text-gray-500">Заказчик / Клиент:</span>
              <p className="text-sm font-bold text-white print:text-black mt-0.5">
                {estimate.clientName || 'Заказчик'}
              </p>
              {estimate.clientPhone && (
                <p className="text-xs text-slate-300 print:text-gray-700 mt-0.5">
                  Тел: {estimate.clientPhone}
                </p>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 print:text-gray-500">Адрес объекта / помещения:</span>
              <p className="text-sm font-bold text-white print:text-black mt-0.5">
                {estimate.clientAddress || 'По согласованию на объекте'}
              </p>
              {estimate.objectType && (
                <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
                  Тип: {estimate.objectType}
                </p>
              )}
            </div>
          </div>

          {/* Section 1: Plumbing Works */}
          {works.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white print:text-black">
                <Wrench className="w-4 h-4 text-blue-400 print:text-blue-700" />
                <span>1. Сантехнические и монтажные работы ({works.length})</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-gray-300">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/80 print:bg-gray-100 text-slate-400 print:text-gray-700 font-semibold border-b border-slate-800 print:border-gray-300">
                    <tr>
                      <th className="py-2.5 px-3 w-10">№</th>
                      <th className="py-2.5 px-3">Наименование работы</th>
                      <th className="py-2.5 px-3 text-center w-24">Кол-во</th>
                      <th className="py-2.5 px-3 text-right w-28">Цена за ед.</th>
                      <th className="py-2.5 px-3 text-right w-28">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                    {works.map((w, idx) => (
                      <tr key={w.id} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                        <td className="py-2.5 px-3 text-slate-400 print:text-gray-500">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-white print:text-black">{w.name}</span>
                          {w.category && (
                            <span className="block text-[11px] text-slate-400 print:text-gray-500">
                              {w.category}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-300 print:text-gray-800">
                          {w.quantity} {w.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300 print:text-gray-800">
                          {w.price.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-white print:text-black">
                          {w.total.toLocaleString('ru-RU')} ₽
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-950/40 print:bg-gray-50 border-t border-slate-800 print:border-gray-300 font-bold">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3 text-right text-slate-300 print:text-gray-700">
                        Итого за работы:
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-400 print:text-blue-700">
                        {estimate.worksTotal.toLocaleString('ru-RU')} ₽
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Section 2: Materials & Consumables */}
          {materials.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white print:text-black">
                <Package className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                <span>2. Материалы, комплектующие и расходники ({materials.length})</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-gray-300">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/80 print:bg-gray-100 text-slate-400 print:text-gray-700 font-semibold border-b border-slate-800 print:border-gray-300">
                    <tr>
                      <th className="py-2.5 px-3 w-10">№</th>
                      <th className="py-2.5 px-3">Наименование материала</th>
                      <th className="py-2.5 px-3 text-center w-24">Кол-во</th>
                      <th className="py-2.5 px-3 text-right w-28">Цена за ед.</th>
                      <th className="py-2.5 px-3 text-right w-28">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                    {materials.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                        <td className="py-2.5 px-3 text-slate-400 print:text-gray-500">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-white print:text-black">{m.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-300 print:text-gray-800">
                          {m.quantity} {m.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300 print:text-gray-800">
                          {m.price.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-white print:text-black">
                          {m.total.toLocaleString('ru-RU')} ₽
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-950/40 print:bg-gray-50 border-t border-slate-800 print:border-gray-300 font-bold">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3 text-right text-slate-300 print:text-gray-700">
                        Итого за материалы:
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 print:text-emerald-700">
                        {estimate.materialsTotal.toLocaleString('ru-RU')} ₽
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Grand Totals & Terms Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            {/* Terms, Warranty, Deadlines */}
            <div className="space-y-3 bg-slate-950/50 print:bg-gray-50 p-4 sm:p-5 rounded-2xl border border-slate-800 print:border-gray-300 text-xs sm:text-sm">
              <h4 className="font-bold text-white print:text-black flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 print:text-amber-700" />
                <span>Условия выполнения и гарантии</span>
              </h4>
              <div className="space-y-2 text-slate-300 print:text-gray-700">
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-500">Гарантия на монтаж:</span>
                  <span className="font-bold text-emerald-400 print:text-emerald-700">
                    {estimate.warrantyMonths} месяцев
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-500">Срок выполнения:</span>
                  <span className="font-bold text-white print:text-black">
                    {estimate.executionDays || '1-3 рабочих дня'}
                  </span>
                </div>
                {estimate.paymentTerms && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-gray-500">Порядок оплаты:</span>
                    <span className="font-medium text-white print:text-black">
                      {estimate.paymentTerms}
                    </span>
                  </div>
                )}
                {estimate.notes && (
                  <div className="pt-2 border-t border-slate-800 print:border-gray-200">
                    <span className="text-slate-400 print:text-gray-500 block mb-1">
                      Примечания мастера:
                    </span>
                    <p className="text-xs text-slate-300 print:text-gray-800 italic">
                      "{estimate.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 print:bg-none print:bg-gray-100 p-4 sm:p-5 rounded-2xl border-2 border-blue-500/30 print:border-gray-300 space-y-2.5">
              <div className="flex justify-between text-xs sm:text-sm text-slate-300 print:text-gray-700">
                <span>Работы:</span>
                <span className="font-semibold">{estimate.worksTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-slate-300 print:text-gray-700">
                <span>Материалы и расходники:</span>
                <span className="font-semibold">{estimate.materialsTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              {estimate.discountAmount && estimate.discountAmount > 0 ? (
                <div className="flex justify-between text-xs sm:text-sm text-emerald-400 print:text-emerald-700">
                  <span>Скидка мастера:</span>
                  <span className="font-bold">-{estimate.discountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              ) : null}

              <div className="pt-2.5 border-t border-slate-800 print:border-gray-300 flex justify-between items-baseline">
                <span className="text-sm sm:text-base font-bold text-white print:text-black">
                  ИТОГО К ОПЛАТЕ:
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 print:text-black">
                  {estimate.grandTotal.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {estimate.advancePayment && estimate.advancePayment > 0 ? (
                <div className="pt-2 border-t border-slate-800/80 print:border-gray-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400 print:text-gray-600">
                    <span>Предоплата / Аванс:</span>
                    <span className="font-semibold text-white print:text-black">
                      {estimate.advancePayment.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 print:text-gray-600">
                    <span>Остаток по завершении:</span>
                    <span className="font-semibold text-white print:text-black">
                      {(estimate.remainingPayment || (estimate.grandTotal - estimate.advancePayment)).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Signatures & Stamp block for official look & print */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-slate-400 print:text-gray-600">
            <div className="border-t border-slate-700 print:border-gray-400 pt-2">
              <p className="font-bold text-white print:text-black">Исполнитель (Мастер):</p>
              <p className="mt-1">{estimate.specialistName}</p>
              <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500 print:text-gray-400">
                <span>Подпись: __________________</span>
                <span>М.П.</span>
              </div>
            </div>
            <div className="border-t border-slate-700 print:border-gray-400 pt-2">
              <p className="font-bold text-white print:text-black">Заказчик (Клиент):</p>
              <p className="mt-1">{estimate.clientName || 'Заказчик'}</p>
              <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500 print:text-gray-400">
                <span>Подпись: __________________</span>
                <span>Дата: ____.____.2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar Controls for Status (Hidden on Print) */}
        {isMasterView && onStatusChange && (
          <div className="print:hidden p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Изменить статус:</span>
              <select
                value={estimate.status}
                onChange={(e) => onStatusChange(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="draft">Черновик</option>
                <option value="sent">Отправлена клиенту</option>
                <option value="accepted">Согласована клиентом</option>
                <option value="completed">Работы завершены</option>
                <option value="declined">Отклонена</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {estimate.status !== 'accepted' && (
                <button
                  onClick={() => onStatusChange('accepted')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Клиент согласен со сметой</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
