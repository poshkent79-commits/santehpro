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
  Clock,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { PlumbingContract } from '../types';
import { SignaturePadModal } from './SignaturePadModal';

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
  const [activeTab, setActiveTab] = useState<'contract' | 'act'>('contract');
  const [isSigningPadOpen, setIsSigningPadOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localContract, setLocalContract] = useState<PlumbingContract | null>(contract);
  const [successToast, setSuccessToast] = useState('');

  if (!isOpen || !contract) return null;

  const current = localContract || contract;

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

  const isClientSigned = Boolean(current.clientSignature || current.clientSignedAt);

  // Digital Sign action (either drawn finger signature or 1-click legal acceptance)
  const handleApplySignature = async (signatureDataUrl?: string) => {
    setIsSubmitting(true);
    const nowIso = new Date().toISOString();
    const sealId = current.digitalSealId || `ПЭП-RU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updated: PlumbingContract = {
      ...current,
      clientSignature: signatureDataUrl || current.clientSignature,
      clientSignedAt: nowIso,
      clientSignMethod: signatureDataUrl ? 'onsite_finger' : 'remote_link',
      clientSignedPhone: current.clientPhone,
      digitalSealId: sealId,
      status: current.status === 'draft' ? 'active' : current.status,
      updatedAt: nowIso,
    };

    setLocalContract(updated);

    // Save to server
    try {
      await fetch(`/api/contracts/${encodeURIComponent(updated.id)}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSignature: updated.clientSignature,
          clientSignedAt: nowIso,
          clientSignMethod: updated.clientSignMethod,
          digitalSealId: sealId,
        }),
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
    setSuccessToast('Договор успешно подписан простой электронной подписью (ПЭП)!');
    if (onSigned) onSigned(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Header */}
        <div className="p-3 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  Согласование договора № {current.contractNumber}
                </h2>
                {isClientSigned ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Подписан вами
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Ожидает вашего подтверждения
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Исполнитель: <span className="text-white font-semibold">{current.specialistName}</span> • Сумма:{' '}
                <span className="text-amber-400 font-bold">{current.totalPrice.toLocaleString('ru-RU')} ₽</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Распечатать / Сохранить в PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success toast if signed */}
        {successToast && (
          <div className="p-3.5 bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between px-6 animate-in slide-in-from-top duration-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{successToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessToast('')}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab switch */}
        <div className="bg-slate-950/80 px-4 sm:px-6 py-2 border-b border-slate-800 flex items-center gap-2 text-xs font-bold print:hidden">
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

        {/* Document Sheet */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950/90 flex justify-center">
          <div
            id="printable-client-contract"
            className="w-full max-w-3xl bg-white text-slate-900 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-10 space-y-6 text-xs sm:text-sm leading-relaxed font-sans"
          >
            {/* Header */}
            <div className="border-b-2 border-slate-900/80 pb-3 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                    <Wrench className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-lg font-black tracking-tight">
                    <span className="text-red-600">Сантех</span>
                    <span className="text-blue-600">Про</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  Официальный сервис сантехнических услуг • santehpro.info
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-slate-800">{current.contractNumber}</div>
                <div className="text-[10px] text-slate-500">от {formatDate(current.contractDate)}</div>
              </div>
            </div>

            {/* TAB 1: Contract */}
            {activeTab === 'contract' && (
              <div className="space-y-4 text-slate-800">
                <div className="text-center space-y-1">
                  <h1 className="text-base sm:text-lg font-black uppercase text-slate-900">
                    ДОГОВОР ПОДРЯДА № {current.contractNumber}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">на выполнение сантехнических работ</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 leading-normal">
                  <p>
                    <b>Исполнитель:</b> {current.specialistName}, тел: {current.specialistPhone}
                    {current.specialistInn ? `, ИНН: ${current.specialistInn}` : ''}
                  </p>
                  <p>
                    <b>Заказчик:</b> {current.clientName}, тел: {current.clientPhone || '—'}, адрес объекта: <b>{current.clientAddress}</b>
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 uppercase text-xs">1. ПРЕДМЕТ РАБОТ</h3>
                  <p>1.1. Наименование: <b>{current.title}</b></p>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs whitespace-pre-wrap">
                    {current.worksList}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 uppercase text-xs">2. СТОИМОСТЬ И СРОКИ</h3>
                  <p>2.1. Общая стоимость: <b>{current.totalPrice.toLocaleString('ru-RU')} ₽</b></p>
                  {current.advancePayment > 0 && (
                    <p>2.2. Предоплата: <b>{current.advancePayment.toLocaleString('ru-RU')} ₽</b></p>
                  )}
                  <p>2.3. Сроки: с «{formatDate(current.startDate)}» по «{formatDate(current.endDate)}»</p>
                  <p>2.4. Гарантийный срок на монтаж: <b>{current.warrantyMonths} месяцев</b> с момента подписания Акта.</p>
                </div>

                {/* Signatures Row */}
                <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  {/* Master signature box */}
                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold uppercase text-slate-900">ИСПОЛНИТЕЛЬ:</p>
                    <p>{current.specialistName}</p>
                    {current.masterSignature ? (
                      <div className="space-y-1">
                        <img
                          src={current.masterSignature}
                          alt="Подпись мастера"
                          className="h-12 w-auto object-contain"
                        />
                        <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 text-blue-600" /> Подписано мастером ({formatDate(current.masterSignedAt || current.contractDate)})
                        </div>
                      </div>
                    ) : (
                      <div className="pt-6 border-b border-slate-400 text-[10px] text-slate-500">
                        Подпись мастера: {current.specialistName}
                      </div>
                    )}
                  </div>

                  {/* Client signature box */}
                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold uppercase text-slate-900">ЗАКАЗЧИК:</p>
                    <p>{current.clientName}</p>
                    {isClientSigned ? (
                      <div className="space-y-1">
                        {current.clientSignature && (
                          <img
                            src={current.clientSignature}
                            alt="Подпись заказчика"
                            className="h-12 w-auto object-contain"
                          />
                        )}
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-300 text-[10px] text-emerald-800 space-y-0.5">
                          <div className="font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ПОДПИСАНО ЭЛЕКТРОННОЙ ПОДПИСЬЮ (ПЭП)
                          </div>
                          <div>Сертификат: <b>{current.digitalSealId}</b></div>
                          <div>Дата: {formatDate(current.clientSignedAt)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-6 border-b border-dashed border-amber-400 text-[10px] text-amber-700 font-semibold">
                        Ожидает вашей подписи ниже ↓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Acceptance Act */}
            {activeTab === 'act' && (
              <div className="space-y-4 text-slate-800">
                <div className="text-center space-y-1">
                  <h1 className="text-base sm:text-lg font-black uppercase text-slate-900">
                    АКТ СДАЧИ-ПРИЁМКИ ВЫПОЛНЕННЫХ РАБОТ
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    Приложение № 1 к Договору подряда № {current.contractNumber}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <p>
                    Настоящим Заказчик <b>{current.clientName}</b> подтверждает, что Исполнитель <b>{current.specialistName}</b> выполнил сантехнические работы по адресу: <b>{current.clientAddress}</b> в полном объёме.
                  </p>
                  <p>
                    Гидравлические испытания (опрессовка) проведены, протечек не обнаружено. Претензий по качеству и срокам Заказчик к Исполнителю не имеет.
                  </p>
                  <p>
                    Сумма к оплате: <b>{current.totalPrice.toLocaleString('ru-RU')} ₽</b>.
                  </p>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Гарантийные обязательства активированы на <b>{current.warrantyMonths} мес.</b></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Client Bottom Action Banner */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {!isClientSigned ? (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-slate-300 text-center sm:text-left">
                <p className="font-bold text-white">Вы согласны с условиями договора?</p>
                <p className="text-[11px] text-slate-400">
                  Подтвердите договор простой электронной подписью (ст. 434 ГК РФ)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {/* Option 1: Draw Finger Signature */}
                <button
                  type="button"
                  onClick={() => setIsSigningPadOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <PenTool className="w-4 h-4 text-sky-400" />
                  <span>Распишитесь пальцем</span>
                </button>

                {/* Option 2: 1-Click Fast PEP Acceptance */}
                <button
                  type="button"
                  onClick={() => handleApplySignature()}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Согласен, подписать (ПЭП)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold">Договор подписан обеими сторонами</span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
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
          title="Электронная подпись Заказчика"
          signerName={current.clientName}
          role="client"
        />
      )}
    </div>
  );
};
