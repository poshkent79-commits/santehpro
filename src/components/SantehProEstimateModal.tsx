import React from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  Wrench,
  CheckCircle2
} from 'lucide-react';

export interface SantehProExportItem {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  brand?: string;
  note?: string;
  isCustom?: boolean;
}

interface SantehProEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onDownloadTxt: () => void;
  onCopyTxt: () => void;
  copied: boolean;
  buildingType: 'house' | 'apartment';
  materialName: string;
  materialBadge: string;
  connectionType: string;
  floorPipeMaterial?: 'pex' | 'metal_plastic';
  selectedDiameters: number[];
  summary: {
    includedCount: number;
    totalItems: number;
    totalSum: number;
  };
  items: SantehProExportItem[];
}

export const SantehProEstimateModal: React.FC<SantehProEstimateModalProps> = ({
  isOpen,
  onClose,
  onPrint,
  onDownloadTxt,
  onCopyTxt,
  copied,
  buildingType,
  materialName,
  materialBadge,
  connectionType,
  floorPipeMaterial,
  selectedDiameters,
  summary,
  items,
}) => {
  if (!isOpen) return null;

  const bldLabel = buildingType === 'house' ? 'Частный загородный дом 🏠' : 'Городская квартира 🏢';
  const docDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Group items by category
  const categories = Array.from(new Set(items.map((it) => it.categoryName)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 sm:py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Предпросмотр сметы</span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-xs font-bold font-mono">
                  СантехПро
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Официальный документ для согласования с заказчиком и закупки
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="p-3 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-300 font-medium">
            Позиций: <b className="text-white">{summary.includedCount}</b> | Сумма:{' '}
            <b className="text-amber-400 font-mono">~{summary.totalSum.toLocaleString('ru-RU')} ₽</b>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onPrint}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black transition flex items-center space-x-1.5 shadow-md shadow-sky-600/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Печать / Сохранить в PDF</span>
            </button>

            <button
              type="button"
              onClick={onDownloadTxt}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Скачать .TXT</span>
            </button>

            <button
              type="button"
              onClick={onCopyTxt}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Скопировано!' : 'Скопировать'}</span>
            </button>
          </div>
        </div>

        {/* Printable Document Paper View (White Background for crisp clarity) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60">
          <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 font-sans border border-slate-200">
            {/* Header with «СантехПро» Branding */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-sky-600 pb-4 mb-5 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-sky-700 tracking-tight">
                    СантехПро
                  </h1>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Твой карманный помощник по сантехнике • Спецификация материалов и оборудования
                </p>
              </div>

              <div className="sm:text-right text-xs text-slate-600">
                <div className="font-bold text-slate-800 text-sm">СМЕТНЫЙ РАСЧЁТ</div>
                <div>Дата: {docDate}</div>
                <div className="text-[11px] text-slate-500 font-mono">Документ № СП-{Date.now().toString().slice(-6)}</div>
              </div>
            </div>

            {/* Project Parameters Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Объект:</span>{' '}
                <b className="text-slate-800">{bldLabel}</b>
              </div>
              <div>
                <span className="text-slate-500">Материал системы:</span>{' '}
                <b className="text-slate-800">{materialName} ({materialBadge})</b>
              </div>
              <div>
                <span className="text-slate-500">Технология стыковки:</span>{' '}
                <b className="text-slate-800">{connectionType}</b>
              </div>
              <div>
                <span className="text-slate-500">Диаметры:</span>{' '}
                <b className="text-slate-800">
                  {selectedDiameters.length > 0
                    ? selectedDiameters.map((d) => `${d} мм`).join(', ')
                    : 'Все базовые'}
                </b>
              </div>
              {floorPipeMaterial && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Опция «Тёплый пол»:</span>{' '}
                  <b className="text-slate-800">
                    Стенка 2.0 мм, {floorPipeMaterial === 'pex' ? 'Сшитый полиэтилен (PEX/PE-RT)' : 'Металлопластик (PEX-AL-PEX)'}
                  </b>
                </div>
              )}
            </div>

            {/* Categorized Items Table */}
            <div className="space-y-4">
              {categories.map((catName) => {
                const catItems = items.filter((it) => it.categoryName === catName);
                if (catItems.length === 0) return null;

                return (
                  <div key={catName} className="space-y-2">
                    <div className="text-xs font-black uppercase tracking-wider text-sky-900 bg-sky-50 border-l-4 border-sky-600 px-3 py-1.5 rounded-r">
                      {catName}
                    </div>

                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-300 text-[11px] text-slate-600 bg-slate-100">
                          <th className="py-2 px-2.5 font-bold w-8 text-center">№</th>
                          <th className="py-2 px-2.5 font-bold">Наименование комплектующих</th>
                          <th className="py-2 px-2.5 font-bold text-center w-24">Кол-во</th>
                          <th className="py-2 px-2.5 font-bold text-right w-24">Цена</th>
                          <th className="py-2 px-2.5 font-bold text-right w-28">Сумма</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {catItems.map((item, idx) => {
                          const lineTotal = item.quantity * item.pricePerUnit;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="py-2 px-2.5 text-center text-slate-500 font-mono">{idx + 1}</td>
                              <td className="py-2 px-2.5 text-slate-800">
                                <div className="font-semibold">{item.name}</div>
                                {item.brand && (
                                  <div className="text-[10px] text-slate-500">{item.brand}</div>
                                )}
                              </td>
                              <td className="py-2 px-2.5 text-center font-mono font-medium text-slate-700">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="py-2 px-2.5 text-right font-mono text-slate-600">
                                {item.pricePerUnit.toLocaleString('ru-RU')} ₽
                              </td>
                              <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                                {lineTotal.toLocaleString('ru-RU')} ₽
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* Total Grand Summary Box */}
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                  Итоговая стоимость комплектации
                </div>
                <div className="text-[11px] text-emerald-700">
                  Всего включено: {summary.includedCount} позиций
                </div>
              </div>

              <div className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
                ~ {summary.totalSum.toLocaleString('ru-RU')} ₽
              </div>
            </div>

            {/* Signatures & Notes */}
            <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
              <div>
                <div>Спецификацию составил (монтажник):</div>
                <div className="border-b border-slate-300 h-8 mt-1"></div>
              </div>
              <div>
                <div>Спецификацию согласовал (заказчик):</div>
                <div className="border-b border-slate-300 h-8 mt-1"></div>
              </div>
            </div>

            <div className="mt-6 text-[10px] text-center text-slate-400">
              Сформировано в приложении «СантехПро». Цены являются ориентировочными и могут меняться в зависимости от поставщиков и региона.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
