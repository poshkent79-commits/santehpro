import React, { useState } from 'react';
import {
  FileText,
  FileCheck,
  CheckCircle2,
  Printer,
  Download,
  X,
  ShieldCheck,
  PenTool,
  Check,
  Wrench,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Type,
  Award
} from 'lucide-react';
import { PlumbingContract } from '../types';
import { SignaturePadModal } from './SignaturePadModal';
import {
  downloadContractWordDoc,
  printContractPdfDocument,
  formatDateRu,
  getStatusLabel,
  getMaterialsLabel
} from '../utils/contractExport';

interface ClientContractModalProps {
  contract: PlumbingContract | null;
  isOpen: boolean;
  onClose: () => void;
  onSigned?: (updatedContract: PlumbingContract) => void;
}

export const ClientContractModal: React.FC<ClientContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSigned,
}) => {
  const [activeTab, setActiveTab] = useState<'contract' | 'act' | 'warranty'>('contract');
  const [isSigningPadOpen, setIsSigningPadOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localContract, setLocalContract] = useState<PlumbingContract | null>(contract);
  const [successToast, setSuccessToast] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [fontScale, setFontScale] = useState<1 | 2 | 3>(2);

  if (!isOpen || !contract) return null;

  const current = localContract || contract;

  const isContractClientSigned = Boolean(current.clientSignature || current.clientSignedAt);
  const isActClientSigned = Boolean(current.actClientSignature || current.actClientSignedAt);

  const warrantyMonths = current.warrantyMonths || 24;
  const certNumber = current.warrantyCertificateNumber || `ГАР-${current.contractNumber.replace(/\D/g, '') || '2026-01'}`;

  // Digital Sign action (either drawn finger signature or 1-click legal acceptance)
  const handleApplySignature = async (signatureDataUrl?: string) => {
    setIsSubmitting(true);
    const nowIso = new Date().toISOString();
    let updated: PlumbingContract;

    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + warrantyMonths);
    const validUntil = baseDate.toISOString().slice(0, 10);

    if (activeTab === 'contract') {
      const sealId = current.digitalSealId || `ПЭП-RU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      updated = {
        ...current,
        clientSignature: signatureDataUrl || current.clientSignature,
        clientSignedAt: nowIso,
        clientSignMethod: signatureDataUrl ? 'onsite_finger' : 'remote_link',
        clientSignedPhone: current.clientPhone,
        digitalSealId: sealId,
        status: current.status === 'draft' ? 'active' : current.status,
        updatedAt: nowIso,
      };
      setSuccessToast('Договор успешно подписан простой электронной подписью (ПЭП)!');
    } else {
      // Signing the Acceptance Act (Акт приёма-передачи)
      const sealId = current.actSealId || current.digitalSealId || `ПЭП-АКТ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      updated = {
        ...current,
        actDate: current.actDate || new Date().toISOString().slice(0, 10),
        actClientSignature: signatureDataUrl || current.actClientSignature,
        actClientSignedAt: nowIso,
        actSealId: sealId,
        actStatus: 'signed',
        status: 'completed', // Handover complete!
        warrantyCertificateNumber: certNumber,
        warrantyValidUntil: validUntil,
        updatedAt: nowIso,
      };
      setSuccessToast('Акт сдачи-приёмки подписан! Работы приняты, гарантия активирована!');
    }

    setLocalContract(updated);

    // Save to server
    try {
      await fetch(`/api/contracts/${encodeURIComponent(updated.id)}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Error syncing signed contract to server:', e);
    }

    // Save to master's local contracts if available
    try {
      const key = `santehpro_master_contracts_${updated.specialistId}`;
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      const newArr = saved.map((c: any) => (c.id === updated.id ? updated : c));
      localStorage.setItem(key, JSON.stringify(newArr));
    } catch {}

    setIsSubmitting(false);
    if (onSigned) onSigned(updated);
  };

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

  const handlePrint = () => {
    printContractPdfDocument(current, activeTab);
  };

  const handleDownloadDoc = () => {
    downloadContractWordDoc(current, activeTab);
  };

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
        {/* Header */}
        <div className="px-2.5 py-1.5 sm:px-4 sm:py-2 border-b border-slate-200 flex items-center justify-between gap-1.5 sm:gap-2 bg-white sticky top-0 z-20 shadow-xs shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  Договор № {current.contractNumber}
                </h2>
                {isActClientSigned ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    Работы приняты
                  </span>
                ) : isContractClientSigned ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Договор подписан
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                    Ожидает подписи
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 truncate">
                {current.specialistName} • <b className="text-blue-700">{current.totalPrice.toLocaleString('ru-RU')} ₽</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Print / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95"
              title="Распечатать или сохранить как PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Печать / PDF</span>
            </button>

            {/* Word .doc with UTF-8 BOM */}
            <button
              type="button"
              onClick={handleDownloadDoc}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer active:scale-95"
              title="Скачать Word (.doc)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Font Zoom */}
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

            {/* Fullscreen */}
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
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer active:scale-95 ml-0.5"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success toast if signed */}
        {successToast && (
          <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center justify-between px-4 sm:px-6 animate-in slide-in-from-top duration-200 shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{successToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessToast('')}
              className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 3 Document Tabs */}
        <div className="bg-slate-100 px-2.5 py-1.5 sm:px-4 sm:py-2 border-b border-slate-200 flex items-center justify-between gap-1.5 text-xs font-bold shrink-0">
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

        {/* Document Sheet */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-6 lg:p-8 bg-slate-100 flex justify-center">
          <div
            id="printable-client-contract"
            className={`w-full max-w-4xl bg-white text-slate-900 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-10 lg:p-12 space-y-6 ${fontBodyClass} font-sans border border-slate-200`}
          >
            {/* Official SantehPro Data Exchange Banner (1790635194201.jpg) */}
            <div className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-950">
              <img
                src="/santehpro-exchange-banner.jpg"
                alt="СантехПро — Электронный обмен договорами"
                className="w-full h-24 sm:h-32 object-cover object-center"
              />
            </div>

            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black tracking-tight">
                    <span className="text-red-600">Сантех</span>
                    <span className="text-blue-600">Про</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                  Официальный сервис сантехнических услуг • santehpro.info
                </p>
              </div>

              <div className="text-right">
                <div className="text-sm sm:text-base font-mono font-bold text-slate-900">{current.contractNumber}</div>
                <div className="text-xs sm:text-sm text-slate-600">от {formatDateRu(current.contractDate)}</div>
              </div>
            </div>

            {/* TAB 1: CONTRACT */}
            {activeTab === 'contract' && (
              <div className="space-y-6 text-slate-900">
                <div className="text-center space-y-1">
                  <h1 className={`${fontTitleClass} uppercase text-slate-950`}>
                    ДОГОВОР ПОДРЯДА № {current.contractNumber}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold">на выполнение сантехнических работ</p>
                </div>

                <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-slate-900">
                  <p>
                    <b>Исполнитель:</b> {current.specialistName}, тел: {current.specialistPhone}
                    {current.specialistInn ? `, ИНН: ${current.specialistInn}` : ''}
                  </p>
                  <p>
                    <b>Заказчик:</b> {current.clientName}, тел: {current.clientPhone || '—'}, адрес объекта: <b>{current.clientAddress}</b>
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-950 uppercase text-xs sm:text-base">1. ПРЕДМЕТ РАБОТ</h3>
                  <p>1.1. Наименование: <b>{current.title}</b></p>
                  <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm whitespace-pre-wrap text-slate-900 leading-relaxed shadow-2xs">
                    {current.worksList}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-950 uppercase text-xs sm:text-base">2. СТОИМОСТЬ И СРОКИ</h3>
                  <p>
                    2.1. Общая стоимость: <b className="text-blue-700 text-base sm:text-lg">{current.totalPrice.toLocaleString('ru-RU')} ₽</b>
                  </p>
                  {current.advancePayment > 0 && (
                    <p>2.2. Предоплата: <b>{current.advancePayment.toLocaleString('ru-RU')} ₽</b></p>
                  )}
                  <p>2.3. Сроки: с «{formatDateRu(current.startDate)}» по «{formatDateRu(current.endDate)}»</p>
                  <p>
                    2.4. Гарантийный срок на монтаж: <b className="text-emerald-700">{warrantyMonths} месяцев</b> со дня подписания Акта.
                  </p>
                </div>

                {/* Signatures Row */}
                <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Master signature box */}
                  <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                    <p className="font-bold uppercase text-slate-950 text-xs sm:text-sm">ИСПОЛНИТЕЛЬ:</p>
                    <p className="font-bold text-xs sm:text-sm">{current.specialistName}</p>
                    {current.masterSignature ? (
                      <div className="space-y-1">
                        <img src={current.masterSignature} alt="Подпись мастера" className="max-h-12 w-auto object-contain" />
                        <div className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-blue-600" /> Подписано мастером
                        </div>
                      </div>
                    ) : (
                      <div className="pt-6 border-b border-slate-400 text-xs text-slate-500">Подпись: ____________ / М.П.</div>
                    )}
                  </div>

                  {/* Client signature box */}
                  <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                    <p className="font-bold uppercase text-slate-950 text-xs sm:text-sm">ЗАКАЗЧИК:</p>
                    <p className="font-bold text-xs sm:text-sm">{current.clientName}</p>
                    {isContractClientSigned ? (
                      <div className="space-y-1.5">
                        {current.clientSignature && (
                          <img src={current.clientSignature} alt="Подпись заказчика" className="max-h-12 w-auto object-contain" />
                        )}
                        <div className="p-2.5 rounded-lg bg-blue-50/90 border-2 border-blue-500 text-xs text-blue-950 space-y-0.5 shadow-xs">
                          <div className="font-bold flex items-center gap-1 text-blue-800">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            ПОДПИСАНО ЭЛЕКТРОННОЙ ПОДПИСЬЮ (ПЭП)
                          </div>
                          <div>Сертификат: <b>{current.digitalSealId}</b></div>
                          <div>Дата: {formatDateRu(current.clientSignedAt)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-6 border-b border-dashed border-amber-400 text-xs text-amber-700 font-semibold">
                        Ожидает вашей подписи ниже ↓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACCEPTANCE ACT */}
            {activeTab === 'act' && (
              <div className="space-y-6 text-slate-900">
                <div className="text-center space-y-1">
                  <h1 className={`${fontTitleClass} uppercase text-slate-950`}>
                    АКТ СДАЧИ-ПРИЁМКИ ВЫПОЛНЕННЫХ РАБОТ
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                    Приложение № 1 к Договору подряда № {current.contractNumber}
                  </p>
                </div>

                <div className="space-y-3.5 text-slate-900 leading-relaxed">
                  <p>
                    Настоящим Заказчик <b>{current.clientName}</b> подтверждает, что Исполнитель <b>{current.specialistName}</b> выполнил сантехнические работы по адресу: <b>{current.clientAddress}</b> в полном объёме.
                  </p>
                  <p>
                    Гидравлические испытания (опрессовка) проведены, протечек не обнаружено. Претензий по качеству и срокам Заказчик к Исполнителю не имеет.
                  </p>
                  <p>
                    Сумма к оплате: <b className="text-blue-700">{current.totalPrice.toLocaleString('ru-RU')} ₽</b>.
                  </p>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm flex items-center space-x-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Гарантийные обязательства активированы на <b>{warrantyMonths} мес.</b></span>
                  </div>
                </div>

                {/* Act signatures */}
                <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold uppercase text-slate-950 text-xs">РАБОТУ СДАЛ (Исполнитель):</p>
                    <p className="font-bold">{current.specialistName}</p>
                    {current.actMasterSignature ? (
                      <div>
                        <img src={current.actMasterSignature} alt="Подпись мастера" className="max-h-12 w-auto object-contain" />
                        <div className="text-xs text-blue-700 font-semibold">✓ Работа сдана мастером</div>
                      </div>
                    ) : (
                      <div className="pt-4 border-b border-slate-400 text-xs text-slate-500">Подпись: ____________ / М.П.</div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold uppercase text-slate-950 text-xs">РАБОТУ ПРИНЯЛ (Заказчик):</p>
                    <p className="font-bold">{current.clientName}</p>
                    {isActClientSigned ? (
                      <div className="space-y-1">
                        {current.actClientSignature && (
                          <img src={current.actClientSignature} alt="Подпись заказчика" className="max-h-12 w-auto object-contain" />
                        )}
                        <div className="p-2.5 rounded-lg bg-emerald-50 border-2 border-emerald-500 text-xs text-emerald-950">
                          <div className="font-bold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            РАБОТА ПРИНЯТА (ПЭП)
                          </div>
                          <div>Дата: {formatDateRu(current.actClientSignedAt || current.actDate)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-b border-dashed border-amber-400 text-xs text-amber-700 font-semibold">
                        Ожидает подписания Акта приёмки ниже ↓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WARRANTY CERTIFICATE */}
            {activeTab === 'warranty' && (
              <div className="space-y-6 text-slate-900">
                <div className="text-center space-y-1">
                  <h1 className={`${fontTitleClass} uppercase text-slate-950`}>
                    ГАРАНТИЙНЫЙ СЕРТИФИКАТ (ТАЛОН)
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                    Приложение № 2 к Договору подряда № {current.contractNumber}
                  </p>
                </div>

                <div className="p-6 rounded-2xl border-2 border-blue-500/80 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
                    <div>
                      <span className="text-xs text-slate-500">Номер сертификата:</span>
                      <div className="font-mono font-black text-blue-700 text-base">{certNumber}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Срок официальной гарантии:</span>
                      <div className="font-black text-emerald-700 text-base">{warrantyMonths} месяцев</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <p><b>Объект:</b> {current.clientAddress}</p>
                    <p><b>Заказчик:</b> {current.clientName}</p>
                    <p><b>Исполнитель:</b> {current.specialistName} (тел: {current.specialistPhone})</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>ГАРАНТИЯ АКТИВИРОВАНА</span>
                    </div>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Сохранить в PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Client Bottom Action Banner */}
        <div className="px-3 py-2 sm:px-5 sm:py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-xs shrink-0">
          {(activeTab === 'contract' && !isContractClientSigned) || (activeTab === 'act' && !isActClientSigned) ? (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-slate-800 text-center sm:text-left">
                <p className="font-extrabold text-slate-950 text-xs sm:text-sm">
                  {activeTab === 'contract' ? 'Вы согласны с условиями договора?' : 'Вы принимаете выполненные работы?'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Подтвердите {activeTab === 'contract' ? 'договор' : 'акт приёмки'} простой электронной подписью (ст. 434 ГК РФ)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsSigningPadOpen(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-300 cursor-pointer active:scale-95"
                >
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  <span>Распишитесь пальцем</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplySignature()}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/25 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{activeTab === 'contract' ? 'Подписать договор (ПЭП)' : 'Принять работы и подписать Акт'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-700">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-extrabold text-xs sm:text-sm">
                  {isActClientSigned ? 'Договор и Акт сдачи-приёмки подписаны обеими сторонами' : 'Договор подписан обеими сторонами'}
                </span>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Сохранить в PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Signature Pad Modal for Client */}
      {isSigningPadOpen && (
        <SignaturePadModal
          isOpen={isSigningPadOpen}
          onClose={() => setIsSigningPadOpen(false)}
          onSave={(dataUrl) => {
            handleApplySignature(dataUrl);
            setIsSigningPadOpen(false);
          }}
          title={activeTab === 'contract' ? 'Электронная подпись договора' : 'Электронная подпись Акта приёмки'}
          signerName={current.clientName}
          role="client"
        />
      )}
    </div>
  );
};
