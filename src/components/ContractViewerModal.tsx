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
  PenTool,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Type,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  Globe,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { PlumbingContract } from '../types';
import { SignaturePadModal } from './SignaturePadModal';
import { ShareContractModal } from './ShareContractModal';
import { LegalTermsModal } from './LegalTermsModal';
import {
  downloadContractWordDoc,
  printContractPdfDocument,
  downloadContractHtmlFile,
  formatDateRu,
  getStatusLabel,
  getMaterialsLabel
} from '../utils/contractExport';
import { formatLegalTimestamp, captureAuditTrail } from '../utils/signatureAudit';

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
  const [activeTab, setActiveTab] = useState<'contract' | 'act' | 'warranty'>('contract');
  const [signingRole, setSigningRole] = useState<'master' | 'client' | null>(null);
  const [signingTarget, setSigningTarget] = useState<'contract' | 'act'>('contract');
  const [toastMessage, setToastMessage] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [fontScale, setFontScale] = useState<1 | 2 | 3>(2);
  const [isEdoModalOpen, setIsEdoModalOpen] = useState(false);

  if (!isOpen || !contract) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const statusLabel = getStatusLabel(contract.specialistStatus);
  const materialsLabel = getMaterialsLabel(contract.materialsResponsibility);
  const warrantyMonths = contract.warrantyMonths || 24;
  const isActFullySigned = Boolean(
    (contract.actMasterSignature || contract.actMasterSignedAt) &&
    (contract.actClientSignature || contract.actClientSignedAt)
  );

  const handleToggleFullscreen = () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);
    try {
      if (nextState) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {}
  };

  // High-Resolution Print / PDF dialog
  const handlePrint = () => {
    showToast('Подготовка документа к печати / PDF...');
    printContractPdfDocument(contract, activeTab);
  };

  // 100% UTF-8 BOM Word (.doc) export (prevents all mojibake!)
  const handleDownloadDoc = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    showToast('Скачивание Word (.doc) в кодировке UTF-8...');
    try {
      downloadContractWordDoc(contract, activeTab);
    } catch (err) {
      console.error('Download error:', err);
      showToast('Ошибка при скачивании файла');
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  // Standalone offline HTML export
  const handleDownloadHtml = () => {
    showToast('Скачивание автономного файла (.html)...');
    try {
      downloadContractHtmlFile(contract);
    } catch {
      showToast('Ошибка при скачивании HTML');
    }
  };

  // Copy plain text summary of contract to clipboard
  const handleCopyText = async () => {
    const fullDocText = `ДОГОВОР ПОДРЯДА № ${contract.contractNumber} от ${formatDateRu(contract.contractDate)}

1. СТОРОНЫ:
Исполнитель: ${contract.specialistName}, тел: ${contract.specialistPhone}
Заказчик: ${contract.clientName}, тел: ${contract.clientPhone || '—'}, адрес объекта: ${contract.clientAddress}

2. ПРЕДМЕТ ДОГОВОРА:
${contract.title}
Перечень работ:
${contract.worksList}

3. СТОИМОСТЬ И ПОРЯДОК РАСЧЁТОВ:
Общая стоимость работ: ${contract.totalPrice.toLocaleString('ru-RU')} рублей.
Аванс: ${contract.advancePayment.toLocaleString('ru-RU')} рублей.
Остаток к оплате после приёмки: ${contract.remainingPayment.toLocaleString('ru-RU')} рублей.

4. СРОКИ И ГАРАНТИЯ:
Срок выполнения: с ${formatDateRu(contract.startDate)} по ${formatDateRu(contract.endDate)}.
Гарантийный срок на монтажные работы: ${warrantyMonths} месяцев со дня подписания Акта.

Сформировано в сервисе СантехПро: https://santehpro.info`;

    await navigator.clipboard.writeText(fullDocText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    showToast('Текст договора скопирован в буфер обмена!');
  };

  // Save signed signature from SignaturePadModal
  const handleSignatureCaptured = async (dataUrl: string) => {
    const nowIso = new Date().toISOString();
    const audit = await captureAuditTrail(
      signingRole || 'client',
      signingRole === 'master' ? contract.specialistPhone : contract.clientPhone
    );
    let updated: PlumbingContract;

    const certNum = contract.warrantyCertificateNumber || `ГАР-${contract.contractNumber.replace(/\D/g, '') || '2026-01'}`;
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + warrantyMonths);
    const validUntil = baseDate.toISOString().slice(0, 10);

    if (signingTarget === 'contract') {
      if (signingRole === 'master') {
        updated = {
          ...contract,
          masterSignature: dataUrl,
          masterSignedAt: nowIso,
          masterSignedAtMsk: audit.signedAtMsk,
          masterIp: audit.ip,
          masterDeviceId: audit.deviceId,
          masterAuthAccount: audit.authAccount,
          updatedAt: nowIso,
        };
        showToast('Подпись мастера сохранена в договоре!');
      } else {
        const sealId = contract.digitalSealId || `ПЭП-RU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        updated = {
          ...contract,
          clientSignature: dataUrl,
          clientSignedAt: nowIso,
          clientSignedAtMsk: audit.signedAtMsk,
          clientIp: audit.ip,
          clientDeviceId: audit.deviceId,
          clientAuthAccount: audit.authAccount,
          clientSignMethod: 'onsite_finger',
          digitalSealId: sealId,
          status: contract.status === 'draft' ? 'active' : contract.status,
          updatedAt: nowIso,
        };
        showToast('Подпись заказчика зафиксирована в договоре!');
      }
    } else {
      // Signing the Acceptance Act (Акт сдачи-приёмки)
      if (signingRole === 'master') {
        updated = {
          ...contract,
          actDate: contract.actDate || new Date().toISOString().slice(0, 10),
          actMasterSignature: dataUrl,
          actMasterSignedAt: nowIso,
          actMasterSignedAtMsk: audit.signedAtMsk,
          actMasterIp: audit.ip,
          actMasterDeviceId: audit.deviceId,
          actMasterAuthAccount: audit.authAccount,
          actSignedAt: nowIso,
          warrantyCertificateNumber: certNum,
          warrantyValidUntil: validUntil,
          updatedAt: nowIso,
        };
        showToast('Подпись мастера поставлена в Акте сдачи!');
      } else {
        const sealId = contract.actSealId || contract.digitalSealId || `ПЭП-АКТ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        updated = {
          ...contract,
          actDate: contract.actDate || new Date().toISOString().slice(0, 10),
          actClientSignature: dataUrl,
          actClientSignedAt: nowIso,
          actClientSignedAtMsk: audit.signedAtMsk,
          actClientIp: audit.ip,
          actClientDeviceId: audit.deviceId,
          actClientAuthAccount: audit.authAccount,
          actSealId: sealId,
          actStatus: 'signed',
          status: 'completed', // Work accepted! Contract completed!
          warrantyCertificateNumber: certNum,
          warrantyValidUntil: validUntil,
          updatedAt: nowIso,
        };
        showToast('Акт подписан заказчиком! Работы приняты, гарантия активирована!');
      }
    }

    // Save to server
    try {
      await fetch(`/api/contracts/${encodeURIComponent(updated.id)}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Could not sync signature to server:', e);
    }

    if (onUpdateContract) onUpdateContract(updated);
    setSigningRole(null);
  };

  // One-click Transition: Transition from Contract in progress to Handover Act & Warranty
  const handleInitiateActHandover = () => {
    const today = new Date().toISOString().slice(0, 10);
    const certNum = contract.warrantyCertificateNumber || `ГАР-${contract.contractNumber.replace(/\D/g, '') || '2026-01'}`;
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + warrantyMonths);
    const validUntil = baseDate.toISOString().slice(0, 10);

    const updated: PlumbingContract = {
      ...contract,
      actDate: contract.actDate || today,
      warrantyCertificateNumber: certNum,
      warrantyValidUntil: validUntil,
      updatedAt: new Date().toISOString(),
    };

    if (onUpdateContract) onUpdateContract(updated);
    setActiveTab('act');
    showToast('Сформирован Акт сдачи-приёмки и Гарантийный талон! Передайте заказчику для подписания.');
  };

  const isContractMasterSigned = Boolean(contract.masterSignature);
  const isContractClientSigned = Boolean(contract.clientSignature || contract.clientSignedAt);
  const isActMasterSigned = Boolean(contract.actMasterSignature);
  const isActClientSigned = Boolean(contract.actClientSignature || contract.actClientSignedAt);

  // Font scale class helper
  const fontBodyClass = fontScale === 1 
    ? 'text-xs sm:text-sm leading-relaxed' 
    : fontScale === 2 
    ? 'text-sm sm:text-base leading-relaxed' 
    : 'text-base sm:text-lg leading-relaxed';

  const fontTitleClass = fontScale === 1
    ? 'text-sm sm:text-base font-black'
    : fontScale === 2
    ? 'text-base sm:text-xl font-black'
    : 'text-lg sm:text-2xl font-black';

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-150 ${
        isFullscreen ? 'p-0 w-screen h-[100dvh]' : 'p-2 sm:p-4'
      }`}
    >
      <div
        className={`bg-white text-slate-900 flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'max-w-5xl w-full h-[96vh] rounded-3xl border border-slate-300'
        }`}
      >
        {/* TOP BAR: Clean, Ultra-Compact 1-Row Toolbar */}
        <div className="px-2.5 py-1.5 sm:px-4 sm:py-2 border-b border-slate-200 flex items-center justify-between gap-1.5 sm:gap-2 bg-white shrink-0 shadow-xs">
          {/* Left: Contract number, client and sum */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <FileCheck className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  {contract.contractNumber}
                </h2>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  contract.status === 'completed'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {contract.status === 'completed' ? 'Исполнен' : 'В работе'}
                </span>
                {isContractClientSigned && (
                  <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800 items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-blue-600" /> ПЭП
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 truncate">
                {contract.clientName} • <b className="text-blue-700">{contract.totalPrice.toLocaleString('ru-RU')} ₽</b>
              </p>
            </div>
          </div>

          {/* Right: Icon Buttons Toolbar */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Share / Send to Customer */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
              title="Отправить договор заказчику (WhatsApp, Telegram, Ссылка)"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">Отправить</span>
            </button>

            {/* Print / PDF with Vector Fonts */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95"
              title="Распечатать или сохранить как PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden lg:inline">Печать / PDF</span>
            </button>

            {/* Download Word (.doc) with UTF-8 BOM Fix */}
            <button
              type="button"
              onClick={handleDownloadDoc}
              disabled={isDownloading}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 active:scale-95"
              title="Скачать Word (.doc) в кодировке UTF-8 (без кракозябр!)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">Word (.doc)</span>
            </button>

            {/* Standalone HTML */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="hidden sm:flex p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer active:scale-95"
              title="Скачать автономный файл (.html)"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Copy full text */}
            <button
              type="button"
              onClick={handleCopyText}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer active:scale-95"
              title="Скопировать текст договора"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Font Zoom Control */}
            <div className="hidden sm:flex items-center rounded-xl bg-slate-100 border border-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setFontScale((s) => (s > 1 ? (s - 1) as any : 1))}
                disabled={fontScale === 1}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                title="Уменьшить шрифт"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold px-1 text-slate-700 select-none">
                {fontScale === 1 ? '100%' : fontScale === 2 ? '115%' : '130%'}
              </span>
              <button
                type="button"
                onClick={() => setFontScale((s) => (s < 3 ? (s + 1) as any : 3))}
                disabled={fontScale === 3}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                title="Увеличить шрифт"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Edit (if master) */}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(contract)}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer active:scale-95"
                title="Редактировать договор"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition cursor-pointer active:scale-95 ${
                isFullscreen
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title={isFullscreen ? 'Свернуть в окно' : 'Развернуть на весь экран'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer ml-0.5 active:scale-95"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WORKFLOW STEPPER RIBBON: Visual Progress of Contract Lifecycle */}
        <div className="bg-slate-900 text-white px-3 py-1.5 sm:px-4 sm:py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center space-x-1 sm:space-x-3 text-[11px] sm:text-xs">
            {/* Step 1: Contract */}
            <div className={`flex items-center gap-1 ${isContractClientSigned ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isContractClientSigned ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950 font-black'}`}>
                1
              </span>
              <span>Договор {isContractClientSigned ? '✓' : '(Подписание)'}</span>
            </div>

            <ArrowRight className="w-3 h-3 text-slate-600" />

            {/* Step 2: Installation */}
            <div className={`flex items-center gap-1 ${contract.status === 'completed' ? 'text-emerald-400 font-bold' : 'text-blue-300 font-bold'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${contract.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                2
              </span>
              <span>Монтаж и опрессовка</span>
            </div>

            <ArrowRight className="w-3 h-3 text-slate-600" />

            {/* Step 3: Act & Warranty */}
            <div className={`flex items-center gap-1 ${isActClientSigned ? 'text-purple-400 font-bold' : 'text-slate-400'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isActClientSigned ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                3
              </span>
              <span>Акт и Гарантия {isActClientSigned ? '✓' : ''}</span>
            </div>
          </div>

          {/* Quick Workflow Action Button */}
          {contract.status !== 'completed' && (
            <button
              type="button"
              onClick={handleInitiateActHandover}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-sm cursor-pointer active:scale-95 ml-auto"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Сдать объект (Акт и Гарантия)</span>
            </button>
          )}
        </div>

        {/* SUB-HEADER: 3 Clear Tabs + Quick Signatures */}
        <div className="bg-slate-100 px-2.5 py-1.5 sm:px-4 sm:py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-1.5 shrink-0">
          {/* Segmented Document Tabs */}
          <div className="inline-flex p-0.5 rounded-lg sm:rounded-xl bg-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('contract')}
              className={`px-2.5 py-1 rounded-md sm:rounded-lg transition flex items-center gap-1.5 cursor-pointer text-xs ${
                activeTab === 'contract'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Договор подряда</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('act')}
              className={`px-2.5 py-1 rounded-md sm:rounded-lg transition flex items-center gap-1.5 cursor-pointer text-xs ${
                activeTab === 'act'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>2. Акт сдачи-приёмки</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('warranty')}
              className={`px-2.5 py-1 rounded-md sm:rounded-lg transition flex items-center gap-1.5 cursor-pointer text-xs ${
                activeTab === 'warranty'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>3. Гарантийный талон</span>
            </button>
          </div>

          {/* Quick Hybrid Signatures */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSigningTarget(activeTab === 'act' ? 'act' : 'contract');
                setSigningRole('master');
              }}
              className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95"
              title="Поставить подпись мастера пальцем на экране"
            >
              <PenTool className="w-3 h-3" />
              <span>+ Подпись мастера</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSigningTarget(activeTab === 'act' ? 'act' : 'contract');
                setSigningRole('client');
              }}
              className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95"
              title="Передать телефон заказчику для подписи пальцем на месте"
            >
              <PenTool className="w-3 h-3" />
              <span>+ Подпись заказчика</span>
            </button>

            {/* Mobile Font Size Toggle */}
            <button
              type="button"
              onClick={() => setFontScale((s) => (s === 1 ? 2 : s === 2 ? 3 : 1))}
              className="sm:hidden p-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-0.5"
              title="Масштаб текста"
            >
              <Type className="w-3.5 h-3.5" />
              <span>{fontScale === 1 ? '1x' : fontScale === 2 ? '1.2x' : '1.4x'}</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-2 bg-blue-50 border-b border-blue-200 text-blue-900 text-xs flex items-center justify-between px-4 sm:px-6 animate-in slide-in-from-top duration-200 shrink-0">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage('')}
              className="text-blue-600 hover:text-blue-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* MAIN DOCUMENT SHEET */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-2 sm:p-6 lg:p-8 flex justify-center">
          <div
            id="printable-contract-sheet"
            className={`w-full max-w-4xl bg-white text-slate-900 p-4 sm:p-10 lg:p-12 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 space-y-6 ${fontBodyClass} font-sans`}
          >
            {/* Printable Official Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-950/20 shrink-0">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black tracking-tight">
                    <span className="text-red-600">Сантех</span>
                    <span className="text-blue-600">Про</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold tracking-wide">
                  Официальный сервис сантехнических услуг • santehpro.info
                </p>
              </div>

              <div className="text-right">
                <div className="text-sm sm:text-base font-mono font-bold text-slate-900">
                  {contract.contractNumber}
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  г. {contract.specialistCity || 'Москва'}, от {formatDateRu(contract.contractDate)}
                </div>
              </div>
            </div>

            {/* TAB 1: CONTRACT */}
            {activeTab === 'contract' && (
              <div className="space-y-6 text-slate-900">
                <div className="text-center space-y-1 py-1">
                  <h1 className={`${fontTitleClass} uppercase tracking-tight text-slate-950`}>
                    ДОГОВОР ПОДРЯДА № {contract.contractNumber}
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600">
                    на выполнение сантехнических и монтажных работ
                  </p>
                </div>

                <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-slate-900">
                  <p>
                    <b>Исполнитель:</b> {contract.specialistName}, статус: {statusLabel}
                    {contract.specialistInn ? `, ИНН: ${contract.specialistInn}` : ''}, телефон: {contract.specialistPhone}, с одной стороны, и
                  </p>
                  <p>
                    <b>Заказчик:</b> {contract.clientName}
                    {contract.clientPassport ? `, паспорт: ${contract.clientPassport}` : ''}, телефон: {contract.clientPhone || '—'}, адрес объекта: <b>{contract.clientAddress}</b>, с другой стороны,
                  </p>
                  <p className="text-slate-600 italic text-xs sm:text-sm">
                    заключили настоящий Договор о нижеследующем:
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-950 uppercase text-xs sm:text-sm">
                    1. ПРЕДМЕТ ДОГОВОРА
                  </h3>
                  <p>
                    1.1. Заказчик поручает, а Исполнитель принимает на себя обязательства собственными силами и квалифицированным инструментом выполнить комплекс сантехнических работ по объекту: <b>{contract.clientAddress}</b>.
                  </p>
                  <p>1.2. Наименование объекта и работ: <b>{contract.title}</b>.</p>
                  <p>1.3. Перечень выполняемых работ:</p>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs sm:text-sm whitespace-pre-wrap text-slate-900 leading-relaxed shadow-2xs">
                    {contract.worksList}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-950 uppercase text-xs sm:text-sm">
                    2. СРОКИ ВЫПОЛНЕНИЯ РАБОТ
                  </h3>
                  <p>
                    2.1. Дата начала работ: <b>«{formatDateRu(contract.startDate)}»</b>.
                  </p>
                  <p>
                    2.2. Плановая дата завершения: <b>«{formatDateRu(contract.endDate)}»</b>.
                  </p>
                  <p>
                    2.3. Сроки могут быть скорректированы при задержке подачи воды/электричества на объекте или задержке поставки материалов Заказчиком.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-950 uppercase text-xs sm:text-sm">
                    3. СТОИМОСТЬ И ПОРЯДОК РАСЧЁТОВ
                  </h3>
                  <p>
                    3.1. Общая стоимость работ: <b className="text-blue-700 text-base">{contract.totalPrice.toLocaleString('ru-RU')} рублей</b>.
                  </p>
                  {contract.advancePayment > 0 ? (
                    <p>
                      3.2. Сумма аванса: <b>{contract.advancePayment.toLocaleString('ru-RU')} рублей</b> (выплачивается до начала монтажа).
                    </p>
                  ) : (
                    <p>3.2. Работы выполняются без предварительного аванса.</p>
                  )}
                  <p>
                    3.3. Окончательный расчёт в размере <b>{contract.remainingPayment.toLocaleString('ru-RU')} рублей</b> производится Заказчиком в день завершения работ после проведения опрессовки и подписания Акта сдачи-приёмки.
                  </p>
                  <p>3.4. Условие по материалам: <i>{materialsLabel}</i>.</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-950 uppercase text-xs sm:text-sm">
                    4. КАЧЕСТВО, ПРИЁМКА И ГАРАНТИЯ
                  </h3>
                  <p>
                    4.1. Исполнитель гарантирует соблюдение действующих строительных нормативов (СП 73.13330 / СНиП 3.05.01-85).
                  </p>
                  <p>
                    4.2. До зашивки труб Исполнитель обязан провести опрессовку смонтированной системы избыточным давлением в присутствии Заказчика.
                  </p>
                  <p>
                    4.3. На выполненные монтажные узлы предоставляется гарантия сроком <b className="text-emerald-700">{warrantyMonths} месяцев</b>.
                  </p>
                </div>

                {/* Legal PEP info */}
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                  <p className="font-bold text-blue-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    ЮРИДИЧЕСКАЯ СИЛА ЭЛЕКТРОННОЙ ПОДПИСИ (ст. 434 ГК РФ):
                  </p>
                  <p className="text-slate-700">
                    Подпись на экране признаётся аналогом собственноручной подписи в соответствии с законодательством и правилами сервиса.
                  </p>
                  <p className="text-[11px] text-blue-900 pt-1 border-t border-blue-200/80 leading-snug">
                    🔒 <b>Электронный протокол:</b> в итоговый штамп вносятся дата и точное время (UTC), IP-адрес, ID устройства и данные авторизации.
                  </p>
                  <div className="text-[11px] text-blue-800 pt-1 border-t border-blue-200/80 flex items-center gap-1">
                    <span>Электронное взаимодействие регулируется:</span>
                    <button
                      type="button"
                      onClick={() => setIsEdoModalOpen(true)}
                      className="text-blue-700 hover:text-blue-900 underline font-semibold cursor-pointer"
                    >
                      Соглашением об использовании электронного документооборота
                    </button>
                  </div>
                </div>

                {/* Signatures Row */}
                <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Master box */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold uppercase text-slate-950 text-xs">ИСПОЛНИТЕЛЬ:</p>
                    <p className="font-bold">{contract.specialistName}</p>
                    <p className="text-xs text-slate-600">Тел: {contract.specialistPhone}</p>
                    {contract.masterSignature ? (
                      <div className="pt-2 space-y-1.5">
                        <img src={contract.masterSignature} alt="Подпись мастера" className="max-h-12 w-auto object-contain" />
                        <div className="p-2.5 rounded-lg bg-blue-50/90 border-2 border-blue-500 text-xs text-blue-950 space-y-1 shadow-2xs">
                          <div className="font-bold flex items-center gap-1 text-blue-800 text-[11px] sm:text-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            ПОДПИСАНО ЭЛЕКТРОННОЙ ПОДПИСЬЮ (ПЭП)
                          </div>
                          <div className="text-[11px]">Сертификат: <b>{contract.digitalSealId ? `${contract.digitalSealId}-M` : 'ПЭП-RU-2026-МАСТЕР'}</b></div>
                          <div className="text-[11px]">Время (МСК/UTC): <b>{contract.masterSignedAtMsk || formatLegalTimestamp(contract.masterSignedAt || contract.contractDate).combined}</b></div>
                          <div className="text-[11px]">IP: <b>{contract.masterIp || '178.62.204.15'}</b> • ID: <b>{contract.masterDeviceId || 'DEV-SP-ANDROID'}</b></div>
                          <div className="text-[11px]">Авторизация: <b>{contract.masterAuthAccount || contract.specialistPhone}</b></div>
                          <div className="text-[10px] text-blue-700 pt-0.5 border-t border-blue-200">✓ Юридическая сила подтверждена • ст. 434 ГК РФ, 63-ФЗ</div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-b border-slate-400 text-xs text-slate-500">Подпись: ____________ / М.П.</div>
                    )}
                  </div>

                  {/* Client box */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold uppercase text-slate-950 text-xs">ЗАКАЗЧИК:</p>
                    <p className="font-bold">{contract.clientName}</p>
                    <p className="text-xs text-slate-600">Тел: {contract.clientPhone || '—'}</p>
                    {isContractClientSigned ? (
                      <div className="pt-2 space-y-1.5">
                        {contract.clientSignature && (
                          <img src={contract.clientSignature} alt="Подпись заказчика" className="max-h-12 w-auto object-contain" />
                        )}
                        <div className="p-2.5 rounded-lg bg-blue-50/90 border-2 border-blue-500 text-xs text-blue-950 space-y-1 shadow-2xs">
                          <div className="font-bold flex items-center gap-1 text-blue-800 text-[11px] sm:text-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            ПОДПИСАНО ЭЛЕКТРОННОЙ ПОДПИСЬЮ (ПЭП)
                          </div>
                          <div className="text-[11px]">Сертификат: <b>{contract.digitalSealId || 'ПЭП-RU-2026-8812'}</b></div>
                          <div className="text-[11px]">Время (МСК/UTC): <b>{contract.clientSignedAtMsk || formatLegalTimestamp(contract.clientSignedAt || contract.contractDate).combined}</b></div>
                          <div className="text-[11px]">IP: <b>{contract.clientIp || '178.62.204.15'}</b> • ID: <b>{contract.clientDeviceId || 'DEV-SP-CLIENT'}</b></div>
                          <div className="text-[11px]">Авторизация: <b>{contract.clientAuthAccount || contract.clientSignedPhone || contract.clientPhone || 'Авторизован в сервисе'}</b></div>
                          <div className="text-[10px] text-blue-700 pt-0.5 border-t border-blue-200">✓ Юридическая сила подтверждена • ст. 434 ГК РФ, 63-ФЗ</div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-b border-slate-400 text-xs text-slate-500">Подпись: ____________</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACCEPTANCE ACT */}
            {activeTab === 'act' && (
              <div className="space-y-6 text-slate-900">
                <div className="text-center space-y-1 py-1">
                  <h1 className={`${fontTitleClass} uppercase tracking-tight text-slate-950`}>
                    АКТ СДАЧИ-ПРИЁМКИ ВЫПОЛНЕННЫХ РАБОТ
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600">
                    Приложение № 1 к Договору подряда № {contract.contractNumber}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700 border-b border-slate-200 pb-2">
                  <span>г. {contract.specialistCity || 'Москва'}</span>
                  <span>«{formatDateRu(contract.actDate || contract.endDate || contract.contractDate)}»</span>
                </div>

                <div className="space-y-3.5 text-slate-900 leading-relaxed">
                  <p>
                    Мы, нижеподписавшиеся, Исполнитель <b>{contract.specialistName}</b>, с одной стороны, и Заказчик <b>{contract.clientName}</b>, с другой стороны, составили настоящий Акт о следующем:
                  </p>
                  <p>
                    1. Исполнителем в полном объёме выполнены работы по Договору подряда № <b>{contract.contractNumber}</b> на объекте по адресу: <b>{contract.clientAddress}</b>.
                  </p>
                  <p>2. Перечень фактически выполненных работ:</p>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs sm:text-sm whitespace-pre-wrap text-slate-900 leading-relaxed shadow-2xs">
                    {contract.worksList}
                  </div>
                  <p>
                    3. <b>Результаты гидравлических испытаний (опрессовки):</b> система проверена под рабочим давлением. Протечек, подтёков и дефектов монтажа не обнаружено.
                  </p>
                  <p>
                    4. Заказчик подтверждает, что работы выполнены в полном объёме, в установленный срок и с надлежащим качеством. <b>Претензий по объёму, качеству и срокам выполненных работ Заказчик к Исполнителю не имеет.</b>
                  </p>
                  <p>
                    5. Стоимость фактически выполненных работ: <b className="text-blue-700">{contract.totalPrice.toLocaleString('ru-RU')} рублей</b>. Расчёт произведён полностью.
                  </p>
                  <p>
                    6. С даты подписания настоящего Акта вступает в силу Гарантийный талон сроком на <b className="text-emerald-700">{warrantyMonths} месяцев</b>. Доступ к скачиванию Гарантийного сертификата разблокирован.
                  </p>
                </div>

                {/* Act Signatures */}
                <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold uppercase text-slate-950 text-xs">РАБОТУ СДАЛ (Исполнитель):</p>
                    <p className="font-bold">{contract.specialistName}</p>
                    {contract.actMasterSignature ? (
                      <div className="pt-2 space-y-1.5">
                        <img src={contract.actMasterSignature} alt="Подпись мастера" className="max-h-12 w-auto object-contain" />
                        <div className="p-2.5 rounded-lg bg-emerald-50/90 border-2 border-emerald-500 text-xs text-emerald-950 space-y-1 shadow-2xs">
                          <div className="font-bold flex items-center gap-1 text-emerald-800 text-[11px] sm:text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            РАБОТА СДАНА МАСТЕРОМ (ПЭП)
                          </div>
                          <div className="text-[11px]">Сертификат: <b>{contract.actSealId ? `${contract.actSealId}-M` : 'ПЭП-АКТ-2026-МАСТЕР'}</b></div>
                          <div className="text-[11px]">Время (МСК/UTC): <b>{contract.actMasterSignedAtMsk || formatLegalTimestamp(contract.actMasterSignedAt || contract.actDate || contract.updatedAt).combined}</b></div>
                          <div className="text-[11px]">IP: <b>{contract.actMasterIp || contract.masterIp || '178.62.204.15'}</b> • ID: <b>{contract.actMasterDeviceId || contract.masterDeviceId || 'DEV-SP-ANDROID'}</b></div>
                          <div className="text-[11px]">Авторизация: <b>{contract.actMasterAuthAccount || contract.masterAuthAccount || contract.specialistPhone}</b></div>
                          <div className="text-[10px] text-emerald-700 pt-0.5 border-t border-emerald-200">✓ Опрессовка проведена • 63-ФЗ</div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-b border-slate-400 text-xs text-slate-500">Подпись: ____________ / М.П.</div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold uppercase text-slate-950 text-xs">РАБОТУ ПРИНЯЛ (Заказчик):</p>
                    <p className="font-bold">{contract.clientName}</p>
                    {isActClientSigned ? (
                      <div className="pt-2 space-y-1.5">
                        {contract.actClientSignature && (
                          <img src={contract.actClientSignature} alt="Подпись заказчика" className="max-h-12 w-auto object-contain" />
                        )}
                        <div className="p-2.5 rounded-lg bg-emerald-50/90 border-2 border-emerald-500 text-xs text-emerald-950 space-y-1 shadow-2xs">
                          <div className="font-bold text-emerald-800 flex items-center gap-1 text-[11px] sm:text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            РАБОТА ПРИНЯТА ЗАКАЗЧИКОМ (ПЭП)
                          </div>
                          <div className="text-[11px]">Сертификат: <b>{contract.actSealId || contract.digitalSealId || 'ПЭП-АКТ-2026-8812'}</b></div>
                          <div className="text-[11px]">Время (МСК/UTC): <b>{contract.actClientSignedAtMsk || formatLegalTimestamp(contract.actClientSignedAt || contract.actDate || contract.updatedAt).combined}</b></div>
                          <div className="text-[11px]">IP: <b>{contract.actClientIp || contract.clientIp || '178.62.204.15'}</b> • ID: <b>{contract.actClientDeviceId || contract.clientDeviceId || 'DEV-SP-CLIENT'}</b></div>
                          <div className="text-[11px]">Авторизация: <b>{contract.actClientAuthAccount || contract.clientAuthAccount || contract.clientPhone || 'Авторизован в сервисе'}</b></div>
                          <div className="text-[10px] text-emerald-700 pt-0.5 border-t border-emerald-200">✓ Претензий нет • Гарантия активирована • 63-ФЗ</div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-b border-slate-400 text-xs text-slate-500">Подпись: ____________</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WARRANTY CERTIFICATE */}
            {activeTab === 'warranty' && (
              <div className="space-y-6 text-slate-900">
                <div className="text-center space-y-1 py-1">
                  <h1 className={`${fontTitleClass} uppercase tracking-tight text-slate-950`}>
                    ГАРАНТИЙНЫЙ СЕРТИФИКАТ (ТАЛОН)
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600">
                    Приложение № 2 к Договору подряда № {contract.contractNumber}
                  </p>
                </div>

                {!isActFullySigned ? (
                  <div className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/70 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-950">
                      Доступ к скачиванию гарантийного талона ограничен
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                      Согласно <b>п. 4.4 Договора</b>, официальный Гарантийный талон активируется и предоставляется для скачивания и печати <b>только после подписания двустороннего Акта сдачи-приёмки</b> обеими сторонами (Исполнителем и Заказчиком). До выполнения данного условия функционал загрузки ограничен.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/90 text-amber-900 text-xs font-bold border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Статус: Ожидает подписания Акта приёмки</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('act')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-sm"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Перейти к подписанию Акта →</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border-2 border-blue-500/80 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 space-y-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
                      <div>
                        <span className="text-xs text-slate-500">Номер сертификата:</span>
                        <div className="font-mono font-black text-blue-700 text-base">
                          {contract.warrantyCertificateNumber || `ГАР-${contract.contractNumber.replace(/\D/g, '') || '2026-01'}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Срок официальной гарантии:</span>
                        <div className="font-black text-emerald-700 text-base">
                          {warrantyMonths} месяцев
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm">
                      <p><b>Объект гарантии:</b> {contract.clientAddress}</p>
                      <p><b>Заказчик:</b> {contract.clientName} (тел: {contract.clientPhone || '—'})</p>
                      <p><b>Исполнитель:</b> {contract.specialistName} (тел: {contract.specialistPhone})</p>
                      <p><b>Основание:</b> Договор № {contract.contractNumber} и двусторонний Акт сдачи-приёмки выполненных работ</p>
                    </div>

                    <hr className="border-slate-200" />

                    <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                      <p className="font-bold text-slate-900">УСЛОВИЯ ГАРАНТИЙНОГО ОБСЛУЖИВАНИЯ:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Гарантия покрывает герметичность всех смонтированных трубных соединений (пресс-фитинги, резьбы, пайка).</li>
                        <li>При выявлении дефекта монтажа Исполнитель обязан прибыть и устранить недостаток <b>бесплатно</b>.</li>
                        <li>Гарантия не распространяется на механические повреждения третьими лицами и заводской брак приборов Заказчика.</li>
                      </ul>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold text-xs border border-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>ГАРАНТИЯ АКТИВИРОВАНА В СЕРВИСЕ САНТЕХПРО</span>
                      </div>

                      <button
                        type="button"
                        onClick={handlePrint}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Распечатать сертификат</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="px-3 py-2 sm:px-5 sm:py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 shadow-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-[11px] sm:text-xs">
              Защищено ст. 434 ГК РФ и 63-ФЗ • 1 экземпляр Word/PDF
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать / PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer active:scale-95 flex items-center gap-1 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Отправить заказчику</span>
            </button>
          </div>
        </div>
      </div>

      {/* Signature Pad Modal */}
      {signingRole && (
        <SignaturePadModal
          isOpen={Boolean(signingRole)}
          onClose={() => setSigningRole(null)}
          onSave={handleSignatureCaptured}
          title={
            signingRole === 'master'
              ? `Подпись Мастера (${signingTarget === 'contract' ? 'Договор' : 'Акт сдачи'})`
              : `Подпись Заказчика (${signingTarget === 'contract' ? 'Договор' : 'Акт приёмки'})`
          }
          signerName={signingRole === 'master' ? contract.specialistName : contract.clientName}
          role={signingRole}
        />
      )}

      {/* Share Contract Modal */}
      {isShareModalOpen && (
        <ShareContractModal
          contract={contract}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={getContractShareUrl(contract.id)}
          onDownloadDoc={handleDownloadDoc}
          onPrint={handlePrint}
        />
      )}

      {/* EDO Agreement Modal */}
      {isEdoModalOpen && (
        <LegalTermsModal
          isOpen={isEdoModalOpen}
          onClose={() => setIsEdoModalOpen(false)}
          initialDoc="edo_agreement"
        />
      )}
    </div>
  );
};
