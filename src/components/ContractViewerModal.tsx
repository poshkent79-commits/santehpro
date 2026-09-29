import React, { useState } from 'react';
import {
  Printer,
  Share2,
  Copy,
  Download,
  X,
  Edit2,
  Check,
  ShieldCheck,
  FileText,
  FileCheck,
  Wrench,
  ExternalLink,
  MessageCircle,
  PenTool,
  Send,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { PlumbingContract } from '../types';
import { SignaturePadModal } from './SignaturePadModal';

export const getContractShareUrl = (contractId: string) => {
  if (typeof window === 'undefined') return `https://santehpro.info/?contractId=${contractId}`;
  return `${window.location.origin}/?contractId=${encodeURIComponent(contractId)}`;
};

interface ContractViewerModalProps {
  contract: PlumbingContract | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (contract: PlumbingContract) => void;
  onStatusChange?: (newStatus: PlumbingContract['status']) => void;
  onUpdateContract?: (updated: PlumbingContract) => void;
}

export const ContractViewerModal: React.FC<ContractViewerModalProps> = ({
  contract,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  onUpdateContract,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'contract' | 'act'>('contract');
  const [signingRole, setSigningRole] = useState<'master' | 'client' | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  if (!isOpen || !contract) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

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

  const statusLabel = {
    self_employed: 'Плательщик налога на профессиональный доход (Самозанятый)',
    individual: 'Физическое лицо',
    ip: 'Индивидуальный предприниматель',
    company: 'Юридическое лицо',
  }[contract.specialistStatus || 'self_employed'];

  const materialsLabel = {
    contractor: 'Материалы приобретаются Исполнителем за счёт Заказчика',
    client: 'Материалы приобретаются и предоставляются Заказчиком',
    mixed: 'По согласованию сторон (основные материалы Заказчика, расходные материалы Исполнителя)',
  }[contract.materialsResponsibility || 'mixed'];

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp sharing with remote approval link
  const handleShareWhatsApp = () => {
    const shareLink = getContractShareUrl(contract.id);
    const text = `Здравствуйте, ${contract.clientName}!\n\nНаправляю вам официальный договор подряда и акт № ${contract.contractNumber} от ${formatDate(contract.contractDate)} на выполнение сантехнических работ по адресу: ${contract.clientAddress}.\n\nСумма договора: ${contract.totalPrice.toLocaleString('ru-RU')} ₽.\nОфициальная гарантия на монтаж: ${contract.warrantyMonths} мес.\n\nОзнакомьтесь и согласуйте договор со своего смартфона по защищённой ссылке:\n${shareLink}\n\nС уважением, мастер ${contract.specialistName} (${contract.specialistPhone})\nСервис СантехПро: https://santehpro.info`;
    const url = `https://wa.me/${contract.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Quick copy link
  const handleCopyLink = async () => {
    const link = getContractShareUrl(contract.id);
    await navigator.clipboard.writeText(link);
    showToast('Ссылка на согласование договора скопирована в буфер обмена!');
  };

  // Copy full text
  const handleCopyText = async () => {
    const fullDocText = `ДОГОВОР ПОДРЯДА № ${contract.contractNumber}
на выполнение сантехнических работ
г. ${contract.specialistCity || 'Москва'}                                      ${formatDate(contract.contractDate)}

1. СТОРОНЫ:
Исполнитель: ${contract.specialistName} (${statusLabel}), тел: ${contract.specialistPhone}${contract.specialistInn ? `, ИНН: ${contract.specialistInn}` : ''}
Заказчик: ${contract.clientName}, тел: ${contract.clientPhone || '—'}, адрес объекта: ${contract.clientAddress}

2. ПРЕДМЕТ ДОГОВОРА:
${contract.title}
Перечень работ:
${contract.worksList}

3. СТОИМОСТЬ И ПОРЯДОК РАСЧЁТОВ:
Общая стоимость работ: ${contract.totalPrice.toLocaleString('ru-RU')} рублей.
Аванс: ${contract.advancePayment.toLocaleString('ru-RU')} рублей.
Остаток к оплате после подписания Акта сдачи-приёмки: ${contract.remainingPayment.toLocaleString('ru-RU')} рублей.

4. СРОКИ И ГАРАНТИЯ:
Срок выполнения: с ${formatDate(contract.startDate)} по ${formatDate(contract.endDate)}.
Гарантийный срок на монтажные работы: ${contract.warrantyMonths} месяцев со дня подписания Акта.

Сформировано в сервисе СантехПро: https://santehpro.info`;

    await navigator.clipboard.writeText(fullDocText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Download Word doc format (.doc html template)
  const handleDownloadDoc = () => {
    const docContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Договор № ${contract.contractNumber}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; color: #000; padding: 20px; }
    h1 { font-size: 14pt; text-align: center; text-transform: uppercase; margin-bottom: 5px; }
    h2 { font-size: 12pt; text-align: center; margin-top: 0; }
    .header-table { width: 100%; border: none; margin-bottom: 20px; }
    .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
    p { margin: 6px 0; text-align: justify; }
    .sign-table { width: 100%; margin-top: 40px; border-collapse: collapse; }
    .sign-table td { width: 50%; vertical-align: top; padding: 10px; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <h1>Договор подряда № ${contract.contractNumber}</h1>
  <h2>на выполнение сантехнических и монтажных работ</h2>
  <table class="header-table">
    <tr>
      <td>г. ${contract.specialistCity || 'Москва'}</td>
      <td style="text-align: right;">«___» _________ 202_ г.</td>
    </tr>
  </table>

  <p><b>Исполнитель:</b> ${contract.specialistName}, статус: ${statusLabel}${contract.specialistInn ? `, ИНН: ${contract.specialistInn}` : ''}, телефон: ${contract.specialistPhone}, с одной стороны, и</p>
  <p><b>Заказчик:</b> ${contract.clientName}${contract.clientPassport ? `, паспортные данные: ${contract.clientPassport}` : ''}, телефон: ${contract.clientPhone || '—'}, проживающий/объект по адресу: ${contract.clientAddress}, с другой стороны, заключили настоящий Договор о нижеследующем:</p>

  <div class="section-title">1. ПРЕДМЕТ ДОГОВОРА</div>
  <p>1.1. Заказчик поручает, а Исполнитель принимает на себя обязательства по выполнению комплекса сантехнических работ на объекте: <b>${contract.clientAddress}</b>.</p>
  <p>1.2. Наименование объекта/работ: <b>${contract.title}</b>.</p>
  <p>1.3. Перечень выполняемых работ:</p>
  <p style="white-space: pre-wrap; font-family: monospace; font-size: 11pt; padding-left: 20px;">${contract.worksList}</p>

  <div class="section-title">2. СРОКИ ВЫПОЛНЕНИЯ РАБОТ</div>
  <p>2.1. Дата начала работ: «${formatDate(contract.startDate)}».</p>
  <p>2.2. Плановая дата окончания работ: «${formatDate(contract.endDate)}».</p>
  <p>2.3. Сроки могут быть скорректированы по согласованию сторон в случае задержки подачи воды/электричества или задержки поставки материалов Заказчиком.</p>

  <div class="section-title">3. СТОИМОСТЬ И ПОРЯДОК РАСЧЁТОВ</div>
  <p>3.1. Общая стоимость работ по настоящему Договору составляет: <b>${contract.totalPrice.toLocaleString('ru-RU')} (рублей)</b>.</p>
  <p>3.2. Сумма авансового платежа (предоплаты): <b>${contract.advancePayment.toLocaleString('ru-RU')} рублей</b> (выплачивается до начала работ).</p>
  <p>3.3. Окончательный расчёт в размере <b>${contract.remainingPayment.toLocaleString('ru-RU')} рублей</b> производится Заказчиком в день подписания Сторонами Акта сдачи-приёмки выполненных работ.</p>
  <p>3.4. Условие по материалам: ${materialsLabel}.</p>

  <div class="section-title">4. КАЧЕСТВО И ГАРАНТИЙНЫЕ ОБЯЗАТЕЛЬСТВА</div>
  <p>4.1. Исполнитель гарантирует качество выполненных монтажных соединений и соблюдение действующих строительных норм (СП 73.13330 / СНиП 3.05.01-85).</p>
  <p>4.2. Перед сдачей работ Исполнитель обязан провести опрессовку (гидравлические испытания) смонтированной системы избыточным рабочим давлением в присутствии Заказчика.</p>
  <p>4.3. Гарантийный срок на выполненные монтажные работы составляет <b>${contract.warrantyMonths} месяцев</b> с момента подписания Акта сдачи-приёмки.</p>
  <p>4.4. Гарантия не распространяется на заводской брак сантехнических приборов и запорной арматуры, предоставленных Заказчиком, а также на дефекты, возникшие вследствие гидроударов в общедомовой сети сверх нормы или механических повреждений третьими лицами.</p>

  <div class="section-title">5. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</div>
  <table class="sign-table">
    <tr>
      <td>
        <b>ИСПОЛНИТЕЛЬ:</b><br><br>
        ${contract.specialistName}<br>
        Тел: ${contract.specialistPhone}<br>
        ${contract.specialistInn ? `ИНН: ${contract.specialistInn}<br>` : ''}
        Подпись: ________________ / ${contract.specialistName} /<br>
        М.П.
      </td>
      <td>
        <b>ЗАКАЗЧИК:</b><br><br>
        ${contract.clientName}<br>
        Тел: ${contract.clientPhone || '—'}<br>
        Адрес: ${contract.clientAddress}<br>
        Подпись: ________________ / ${contract.clientName} /
      </td>
    </tr>
  </table>

  <div class="page-break"></div>

  <h1>АКТ СДАЧИ-ПРИЁМКИ ВЫПОЛНЕННЫХ РАБОТ</h1>
  <h2>Приложение № 1 к Договору подряда № ${contract.contractNumber}</h2>
  <table class="header-table">
    <tr>
      <td>г. ${contract.specialistCity || 'Москва'}</td>
      <td style="text-align: right;">«___» _________ 202_ г.</td>
    </tr>
  </table>

  <p>Мы, нижеподписавшиеся, Исполнитель <b>${contract.specialistName}</b> и Заказчик <b>${contract.clientName}</b>, составили настоящий Акт о том, что:</p>
  <p>1. Исполнителем выполнены в полном объёме и в установленный срок сантехнические работы по объекту: <b>${contract.clientAddress}</b> в соответствии с Договором № ${contract.contractNumber}.</p>
  <p>2. Гидравлические испытания (опрессовка) системы проведены успешно, видимых и скрытых протечек не обнаружено.</p>
  <p>3. Стороны претензий по качеству, объёму и срокам выполненных работ друг к другу не имеют.</p>
  <p>4. Общая стоимость фактически выполненных работ составляет: <b>${contract.totalPrice.toLocaleString('ru-RU')} рублей</b>. Оплата произведена Заказчиком в полном объёме.</p>
  <p>5. Настоящий Акт подтверждает вступление в силу гарантийных обязательств сроком на <b>${contract.warrantyMonths} месяцев</b>.</p>

  <table class="sign-table" style="margin-top: 50px;">
    <tr>
      <td>
        <b>Работу сдал (Исполнитель):</b><br><br>
        Подпись: ________________ / ${contract.specialistName} /
      </td>
      <td>
        <b>Работу принял (Заказчик):</b><br><br>
        Подпись: ________________ / ${contract.clientName} /
      </td>
    </tr>
  </table>
  
  <p style="margin-top: 40px; font-size: 10pt; color: #666; text-align: center;">Документ оформлен с помощью сервиса «СантехПро» — santehpro.info</p>
</body>
</html>`;

    const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Договор_${contract.contractNumber.replace(/[\/\\:]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Save signed signature from SignaturePadModal
  const handleSignatureCaptured = (dataUrl: string) => {
    const nowIso = new Date().toISOString();
    let updated: PlumbingContract;

    if (signingRole === 'master') {
      updated = {
        ...contract,
        masterSignature: dataUrl,
        masterSignedAt: nowIso,
        updatedAt: nowIso,
      };
      showToast('Подпись мастера успешно сохранена в документе!');
    } else {
      // Client onsite signing
      const sealId = contract.digitalSealId || `ПЭП-RU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      updated = {
        ...contract,
        clientSignature: dataUrl,
        clientSignedAt: nowIso,
        clientSignMethod: 'onsite_finger',
        digitalSealId: sealId,
        status: contract.status === 'draft' ? 'active' : contract.status,
        updatedAt: nowIso,
      };
      showToast('Подпись заказчика успешно зафиксирована на месте!');
    }

    if (onUpdateContract) onUpdateContract(updated);
    setSigningRole(null);
  };

  const isMasterSigned = Boolean(contract.masterSignature);
  const isClientSigned = Boolean(contract.clientSignature || contract.clientSignedAt);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Control Bar */}
        <div className="p-3 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/95 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  Договор № {contract.contractNumber}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {contract.status === 'completed' ? 'Исполнен' : 'Действует'}
                </span>
                {isClientSigned && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-400" /> Подписан (ПЭП)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Заказчик: <span className="text-white font-semibold">{contract.clientName}</span> • Сумма:{' '}
                <span className="text-amber-400 font-bold">{contract.totalPrice.toLocaleString('ru-RU')} ₽</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              title="Распечатать или сохранить в PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Печать / PDF</span>
            </button>

            {/* WhatsApp with shareable link */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Отправить ссылку на согласование клиенту в WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Copy remote approval link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-sky-400 border border-slate-700/60 transition cursor-pointer"
              title="Скопировать ссылку для согласования клиентом"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Download Word */}
            <button
              type="button"
              onClick={handleDownloadDoc}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Скачать документ для Word (.doc)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Copy text */}
            <button
              type="button"
              onClick={handleCopyText}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Скопировать текст договора"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Edit */}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(contract)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Редактировать данные договора"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast message */}
        {toastMessage && (
          <div className="p-3 bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between px-6 animate-in slide-in-from-top duration-300">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage('')}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab switch between Contract and Act */}
        <div className="bg-slate-950/80 px-4 sm:px-6 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-bold print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('contract')}
              className={`px-4 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'contract'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Договор подряда</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('act')}
              className={`px-4 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'act'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>2. Акт сдачи-приёмки и гарантия</span>
            </button>
          </div>

          {/* Quick Onsite Signature Action buttons in Toolbar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSigningRole('master')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer border ${
                isMasterSigned
                  ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                  : 'bg-blue-600 text-white border-blue-500 shadow-sm'
              }`}
              title="Поставить подпись мастера пальцем"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isMasterSigned ? 'Переподписать мастеру' : 'Подпись мастера'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSigningRole('client')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer border ${
                isClientSigned
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                  : 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
              }`}
              title="Передать телефон заказчику для подписи пальцем на месте"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isClientSigned ? 'Подписано заказчиком' : 'Подпись заказчика на месте'}</span>
            </button>
          </div>
        </div>

        {/* Paper Document Preview (White Background Sheet) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-8 bg-slate-950/90 flex justify-center">
          <div
            id="printable-contract-sheet"
            className="w-full max-w-3xl bg-white text-slate-900 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-12 space-y-6 text-sm leading-relaxed font-sans"
            style={{ minHeight: '800px' }}
          >
            {/* Printable Official Header */}
            <div className="border-b-2 border-slate-900/80 pb-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-black tracking-tight">
                    <span className="text-red-600">Сантех</span>
                    <span className="text-blue-600">Про</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
                  Официальный сервис сантехнических услуг • santehpro.info
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-slate-800">
                  {contract.contractNumber}
                </div>
                <div className="text-[11px] text-slate-500">
                  г. {contract.specialistCity || 'Москва'}, от {formatDate(contract.contractDate)}
                </div>
              </div>
            </div>

            {/* Document Body: Tab 1 = Contract */}
            {activeTab === 'contract' && (
              <div className="space-y-5 text-slate-800 text-xs sm:text-sm">
                <div className="text-center space-y-1">
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                    ДОГОВОР ПОДРЯДА № {contract.contractNumber}
                  </h1>
                  <p className="text-xs font-medium text-slate-600">
                    на выполнение сантехнических и монтажных работ
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 leading-normal">
                  <p>
                    <b>Исполнитель:</b> {contract.specialistName}, юридический статус: {statusLabel}
                    {contract.specialistInn ? `, ИНН: ${contract.specialistInn}` : ''}, телефон: {contract.specialistPhone}, с одной стороны, и
                  </p>
                  <p>
                    <b>Заказчик:</b> {contract.clientName}
                    {contract.clientPassport ? `, паспортные данные: ${contract.clientPassport}` : ''}, телефон: {contract.clientPhone || '—'}, объект по адресу: <b>{contract.clientAddress}</b>, с другой стороны,
                  </p>
                  <p className="text-slate-500 italic">
                    вместе именуемые «Стороны», заключили настоящий Договор о нижеследующем:
                  </p>
                </div>

                {/* Section 1 */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                    1. ПРЕДМЕТ ДОГОВОРА
                  </h3>
                  <p>
                    1.1. Заказчик поручает, а Исполнитель принимает на себя обязательства собственными силами и квалифицированным инструментом выполнить комплекс сантехнических работ по объекту: <b>{contract.clientAddress}</b>.
                  </p>
                  <p>
                    1.2. Наименование объекта и работ: <b>{contract.title}</b>.
                  </p>
                  <p>1.3. Перечень выполняемых работ:</p>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs whitespace-pre-wrap text-slate-800">
                    {contract.worksList}
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                    2. СРОКИ ВЫПОЛНЕНИЯ РАБОТ
                  </h3>
                  <p>
                    2.1. Дата начала работ: <b>«{formatDate(contract.startDate)}»</b>.
                  </p>
                  <p>
                    2.2. Плановая дата завершения работ: <b>«{formatDate(contract.endDate)}»</b>.
                  </p>
                  <p>
                    2.3. Сроки могут быть продлены на соразмерный период в случае отсутствия воды/электричества на объекте по независящим от Исполнителя причинам или задержки поставки чистовых сантехприборов Заказчиком.
                  </p>
                </div>

                {/* Section 3 */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                    3. СТОИМОСТЬ РАБОТ И ПОРЯДОК РАСЧЁТОВ
                  </h3>
                  <p>
                    3.1. Общая стоимость работ по настоящему Договору составляет: <b>{contract.totalPrice.toLocaleString('ru-RU')} (рублей)</b>.
                  </p>
                  {contract.advancePayment > 0 ? (
                    <p>
                      3.2. Заказчик вносит авансовый платёж в размере <b>{contract.advancePayment.toLocaleString('ru-RU')} рублей</b> до начала монтажных работ.
                    </p>
                  ) : (
                    <p>3.2. Работы производятся без предварительного аванса.</p>
                  )}
                  <p>
                    3.3. Окончательный расчёт в размере <b>{contract.remainingPayment.toLocaleString('ru-RU')} рублей</b> производится Заказчиком в день завершения работ после проведения гидравлических испытаний и подписания Акта сдачи-приёмки (Приложение № 1).
                  </p>
                  <p>
                    3.4. Условия поставки материалов: <i>{materialsLabel}</i>.
                  </p>
                </div>

                {/* Section 4 */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                    4. КАЧЕСТВО, ПРИЁМКА И ГАРАНТИЯ
                  </h3>
                  <p>
                    4.1. Исполнитель гарантирует соответствие выполненных работ действующим строительным нормативам (СП 73.13330 / СНиП 3.05.01-85).
                  </p>
                  <p>
                    4.2. До зашивки труб в короба Исполнитель обязан провести опрессовку смонтированной системы избыточным рабочим давлением в присутствии Заказчика.
                  </p>
                  <p>
                    4.3. На выполненные монтажные соединения Исполнитель предоставляет гарантию сроком <b>{contract.warrantyMonths} месяцев</b>.
                  </p>
                  <p>
                    4.4. Гарантия не распространяется на механические повреждения третьими лицами и заводские дефекты сантехники, приобретенной Заказчиком самостоятельно.
                  </p>
                </div>

                {/* Section 5: Legal PEP Clause */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    ЮРИДИЧЕСКАЯ СИЛА ЭЛЕКТРОННОЙ ПОДПИСИ (ст. 434 ГК РФ):
                  </p>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    Стороны признают юридическую силу документов, подписанных простой электронной подписью (ПЭП) или факсимиле на платформе «СантехПро». Подтверждение условий через защищённую персональную ссылку признаётся равнозначным собственноручной подписи на бумажном носителе (в соответствии с Федеральным законом № 63-ФЗ «Об электронной подписи»).
                  </p>
                </div>

                {/* Signatures with Interactive Drawings & Official Stamps */}
                <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                  {/* Master Signature Box */}
                  <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold uppercase text-slate-900">ИСПОЛНИТЕЛЬ:</p>
                    <div className="space-y-1">
                      <p className="font-semibold">{contract.specialistName}</p>
                      <p>Телефон: {contract.specialistPhone}</p>
                      {contract.specialistInn && <p>ИНН: {contract.specialistInn}</p>}
                    </div>

                    {contract.masterSignature ? (
                      <div className="pt-2 space-y-1">
                        <div className="h-16 flex items-center">
                          <img
                            src={contract.masterSignature}
                            alt="Подпись мастера"
                            className="max-h-16 w-auto object-contain"
                          />
                        </div>
                        <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[10px] text-blue-800 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 text-blue-600" />
                          <span>Подписано мастером ({formatDate(contract.masterSignedAt || contract.contractDate)})</span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-8 flex items-end justify-between border-b border-slate-400">
                        <span className="text-[10px] text-slate-500">Подпись / М.П.</span>
                        <span className="font-semibold">{contract.specialistName}</span>
                      </div>
                    )}
                  </div>

                  {/* Client Signature Box */}
                  <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold uppercase text-slate-900">ЗАКАЗЧИК:</p>
                    <div className="space-y-1">
                      <p className="font-semibold">{contract.clientName}</p>
                      <p>Телефон: {contract.clientPhone || '—'}</p>
                      <p>Адрес: {contract.clientAddress}</p>
                    </div>

                    {isClientSigned ? (
                      <div className="pt-2 space-y-1.5">
                        {contract.clientSignature && (
                          <div className="h-16 flex items-center">
                            <img
                              src={contract.clientSignature}
                              alt="Подпись заказчика"
                              className="max-h-16 w-auto object-contain"
                            />
                          </div>
                        )}
                        {/* Official Russian Digital Signature Blue Stamp */}
                        <div className="p-2 rounded-lg bg-blue-50/90 border-2 border-blue-500/80 text-[10px] text-blue-900 space-y-0.5 shadow-sm">
                          <div className="font-extrabold flex items-center gap-1 text-blue-700 tracking-tight">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            ДОКУМЕНТ ПОДПИСАН ЭЛЕКТРОННОЙ ПОДПИСЬЮ
                          </div>
                          <div>Сертификат: <b>{contract.digitalSealId || 'ПЭП-RU-2026-8812'}</b></div>
                          <div>Владелец: <b>{contract.clientName}</b></div>
                          <div>Дата и время: {formatDate(contract.clientSignedAt || contract.contractDate)}</div>
                          <div className="text-[9px] text-blue-600">Сервис «СантехПро» • santehpro.info</div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-8 flex items-end justify-between border-b border-slate-400">
                        <span className="text-[10px] text-slate-500">Подпись</span>
                        <span className="font-semibold">{contract.clientName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Document Body: Tab 2 = Acceptance Act */}
            {activeTab === 'act' && (
              <div className="space-y-5 text-slate-800 text-xs sm:text-sm">
                <div className="text-center space-y-1">
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                    АКТ СДАЧИ-ПРИЁМКИ ВЫПОЛНЕННЫХ РАБОТ
                  </h1>
                  <p className="text-xs font-semibold text-slate-600">
                    Приложение № 1 к Договору подряда № {contract.contractNumber}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
                  <span>г. {contract.specialistCity || 'Москва'}</span>
                  <span>«___» _____________ 202_ г.</span>
                </div>

                <div className="space-y-3">
                  <p>
                    Мы, нижеподписавшиеся, Исполнитель <b>{contract.specialistName}</b>, с одной стороны, и Заказчик <b>{contract.clientName}</b>, с другой стороны, составили настоящий Акт о следующем:
                  </p>
                  <p>
                    1. Исполнителем в полном объёме выполнены работы по Договору подряда № <b>{contract.contractNumber}</b> на объекте по адресу: <b>{contract.clientAddress}</b>.
                  </p>
                  <p>
                    2. <b>Перечень фактически выполненных работ:</b>
                  </p>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs whitespace-pre-wrap text-slate-800">
                    {contract.worksList}
                  </div>
                  <p>
                    3. <b>Результаты гидравлических испытаний:</b> система проверена под рабочим давлением. Протечек, подтёков и дефектов монтажа не обнаружено. Приборы установлены строго по уровню, герметичность узлов подтверждена.
                  </p>
                  <p>
                    4. Заказчик подтверждает, что работы выполнены в полном объёме, в установленный срок и с надлежащим качеством. <b>Претензий по объёму, качеству и срокам выполненных работ Заказчик к Исполнителю не имеет.</b>
                  </p>
                  <p>
                    5. Общая стоимость фактически выполненных работ составляет: <b>{contract.totalPrice.toLocaleString('ru-RU')} (рублей)</b>. Оплата произведена Заказчиком полностью.
                  </p>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <b>ГАРАНТИЙНЫЙ ТАЛОН АКТИВИРОВАН:</b> Настоящий Акт подтверждает вступление в силу гарантийных обязательств сроком на <b>{contract.warrantyMonths} месяцев</b> со дня подписания.
                    </div>
                  </div>
                </div>

                {/* Signatures for Act */}
                <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                  <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold uppercase text-slate-900">РАБОТУ СДАЛ (Исполнитель):</p>
                    <p className="font-semibold">{contract.specialistName}</p>

                    {contract.masterSignature ? (
                      <div className="pt-2">
                        <img
                          src={contract.masterSignature}
                          alt="Подпись мастера"
                          className="h-14 w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="pt-10 flex items-end justify-between border-b border-slate-400">
                        <span className="text-[10px] text-slate-500">Подпись / М.П.</span>
                        <span className="font-semibold">{contract.specialistName}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold uppercase text-slate-900">РАБОТУ ПРИНЯЛ (Заказчик):</p>
                    <p className="font-semibold">{contract.clientName}</p>

                    {isClientSigned ? (
                      <div className="pt-2 space-y-1">
                        {contract.clientSignature && (
                          <img
                            src={contract.clientSignature}
                            alt="Подпись заказчика"
                            className="h-14 w-auto object-contain"
                          />
                        )}
                        <div className="p-2 rounded-lg bg-blue-50 border border-blue-400 text-[10px] text-blue-900 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Подписано ПЭП • Сертификат: {contract.digitalSealId || 'ПЭП-RU-2026-8812'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-10 flex items-end justify-between border-b border-slate-400">
                        <span className="text-[10px] text-slate-500">Подпись</span>
                        <span className="font-semibold">{contract.clientName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Verification Footer watermark */}
            <div className="pt-6 border-t border-slate-200 text-center space-y-0.5 text-[10px] text-slate-400">
              <p>
                Официальный типовой бланк сантехнических услуг сервиса <b>СантехПро</b> (Россия и СНГ)
              </p>
              <p>
                Проверка подлинности и поиск мастеров:{' '}
                <span className="text-blue-600 font-semibold">https://santehpro.info</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Status toggling & Remote link sharing */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-semibold">Статус:</span>
            {contract.status === 'completed' ? (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                Работы завершены и приняты
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                В процессе выполнения
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Link button */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Отправить ссылку на согласование клиенту в WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ссылка клиенту в WhatsApp</span>
            </button>

            {onStatusChange && (
              <>
                {contract.status !== 'completed' ? (
                  <button
                    type="button"
                    onClick={() => onStatusChange('completed')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Отметить как выполненный</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStatusChange('active')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                  >
                    Вернуть в статус «В работе»
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Signature Pad Modal for Onsite signing */}
      {signingRole && (
        <SignaturePadModal
          isOpen={Boolean(signingRole)}
          onClose={() => setSigningRole(null)}
          onSave={handleSignatureCaptured}
          title={signingRole === 'master' ? 'Подпись мастера' : 'Подпись заказчика на месте'}
          signerName={signingRole === 'master' ? contract.specialistName : contract.clientName}
          role={signingRole}
        />
      )}

      {/* Scoped Print Styles: Hide all modal controls and show full page white sheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-contract-sheet, #printable-contract-sheet * {
            visibility: visible;
          }
          #printable-contract-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
};
