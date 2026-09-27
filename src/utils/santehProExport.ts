import { SantehProExportItem } from '../components/SantehProEstimateModal';

export interface SantehProExportOptions {
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

/**
 * Builds clean plain-text specification with prominent «САНТЕХПРО» header
 */
export function getFormattedTxtSpecification(opts: SantehProExportOptions): string {
  const bldName = opts.buildingType === 'house' ? 'Частный загородный дом' : 'Городская квартира';
  const docDate = new Date().toLocaleDateString('ru-RU');
  const docTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  let text = `======================================================================\n`;
  text += `                            САНТЕХПРО\n`;
  text += `              Твой карманный помощник по сантехнике\n`;
  text += `            СПЕЦИФИКАЦИЯ МАТЕРИАЛОВ И КОМПЛЕКТУЮЩИХ\n`;
  text += `======================================================================\n\n`;

  text += `Объект монтажа:          ${bldName}\n`;
  text += `Материал системы:        ${opts.materialName} (${opts.materialBadge})\n`;
  text += `Технология соединения:   ${opts.connectionType}\n`;

  if (opts.floorPipeMaterial) {
    text += `Опция «Тёплый пол»:      Стенка 2.0 мм, ${
      opts.floorPipeMaterial === 'pex'
        ? 'Сшитый полиэтилен (PEX/PE-RT)'
        : 'Металлопластик (PEX-AL-PEX)'
    }\n`;
  }

  text += `Диаметры в смете:        ${
    opts.selectedDiameters.length > 0
      ? opts.selectedDiameters.map((d) => `${d} мм`).join(', ')
      : 'Все стандартные'
  }\n`;
  text += `Дата формирования:       ${docDate} в ${docTime}\n`;
  text += `Всего позиций:           ${opts.summary.includedCount} из ${opts.summary.totalItems}\n`;
  text += `----------------------------------------------------------------------\n\n`;

  // Categories
  const categories = Array.from(new Set(opts.items.map((it) => it.categoryName)));

  categories.forEach((catName) => {
    const catItems = opts.items.filter((it) => it.categoryName === catName);
    if (catItems.length === 0) return;

    text += `[ ${catName.toUpperCase()} ]\n`;
    catItems.forEach((it, idx) => {
      const lineTotal = it.quantity * it.pricePerUnit;
      text += `  ${idx + 1}. ${it.name}${it.isCustom ? ' (Своя позиция)' : ''}\n`;
      if (it.brand) {
        text += `     • Артикул/модель: ${it.brand}\n`;
      }
      text += `     • Количество: ${it.quantity} ${it.unit} × ${it.pricePerUnit.toLocaleString('ru-RU')} ₽ = ${lineTotal.toLocaleString('ru-RU')} ₽\n`;
    });
    text += `\n`;
  });

  text += `======================================================================\n`;
  text += `ИТОГОВАЯ ОРИЕНТИРОВОЧНАЯ СТОИМОСТЬ: ~ ${opts.summary.totalSum.toLocaleString('ru-RU')} ₽\n`;
  text += `======================================================================\n`;
  text += `Сформировано в приложении «СантехПро»\n`;

  return text;
}

/**
 * Downloads a .txt file directly to user device
 */
export function downloadTxtSpecification(opts: SantehProExportOptions): void {
  const text = getFormattedTxtSpecification(opts);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const bldShort = opts.buildingType === 'house' ? 'Дом' : 'Квартира';
  link.download = `СантехПро_Смета_${bldShort}_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an official PDF printable document with «СантехПро» header
 * and opens print/PDF dialog.
 */
export function printPdfSpecification(opts: SantehProExportOptions): void {
  const bldLabel = opts.buildingType === 'house' ? 'Частный загородный дом' : 'Городская квартира';
  const docDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const docNum = `СП-${Date.now().toString().slice(-6)}`;

  const categories = Array.from(new Set(opts.items.map((it) => it.categoryName)));

  let categoriesHtml = '';
  categories.forEach((catName) => {
    const catItems = opts.items.filter((it) => it.categoryName === catName);
    if (catItems.length === 0) return;

    let rowsHtml = '';
    catItems.forEach((it, idx) => {
      const lineTotal = it.quantity * it.pricePerUnit;
      rowsHtml += `
        <tr>
          <td class="col-num">${idx + 1}</td>
          <td class="col-name">
            <div class="item-name">${it.name}${it.isCustom ? ' <span class="custom-badge">[Своя позиция]</span>' : ''}</div>
            ${it.brand ? `<div class="item-brand">${it.brand}</div>` : ''}
          </td>
          <td class="col-qty">${it.quantity} ${it.unit}</td>
          <td class="col-price">${it.pricePerUnit.toLocaleString('ru-RU')} ₽</td>
          <td class="col-total">${lineTotal.toLocaleString('ru-RU')} ₽</td>
        </tr>
      `;
    });

    categoriesHtml += `
      <div class="category-block">
        <div class="category-header">${catName}</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 32px; text-align: center;">№</th>
              <th>Наименование комплектующих</th>
              <th style="width: 90px; text-align: center;">Кол-во</th>
              <th style="width: 100px; text-align: right;">Цена за ед.</th>
              <th style="width: 115px; text-align: right;">Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  });

  const html = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="utf-8">
      <title>СантехПро — Спецификация материалов (${bldLabel})</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          font-size: 10pt;
          line-height: 1.4;
          padding: 10px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2.5px solid #0284c7;
          padding-bottom: 10px;
          margin-bottom: 14px;
        }
        .brand-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-logo {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #0284c7;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 18pt;
        }
        .brand-title {
          font-size: 24pt;
          font-weight: 900;
          color: #0369a1;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .brand-subtitle {
          font-size: 9.5pt;
          color: #64748b;
          margin-top: 3px;
          font-weight: 600;
        }
        .doc-meta {
          text-align: right;
          font-size: 9pt;
          color: #475569;
        }
        .doc-title {
          font-weight: 900;
          font-size: 12pt;
          color: #0f172a;
        }
        .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 16px;
          font-size: 9pt;
        }
        .info-row span {
          color: #64748b;
        }
        .info-row b {
          color: #1e293b;
        }
        .category-block {
          margin-bottom: 14px;
          break-inside: avoid;
        }
        .category-header {
          background: #f0f9ff;
          font-weight: 800;
          font-size: 9.5pt;
          color: #0369a1;
          padding: 5px 10px;
          border-left: 3.5px solid #0284c7;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8.5pt;
        }
        .items-table th {
          background: #f1f5f9;
          color: #334155;
          font-weight: 700;
          padding: 5px 8px;
          border: 1px solid #cbd5e1;
          text-transform: uppercase;
          font-size: 8pt;
        }
        .items-table td {
          padding: 5px 8px;
          border: 1px solid #e2e8f0;
          vertical-align: middle;
        }
        .items-table tr:nth-child(even) td {
          background-color: #f8fafc;
        }
        .col-num {
          text-align: center;
          color: #64748b;
          font-family: monospace;
        }
        .col-name .item-name {
          font-weight: 600;
          color: #0f172a;
        }
        .col-name .item-brand {
          font-size: 7.5pt;
          color: #64748b;
        }
        .custom-badge {
          color: #d97706;
          font-size: 7.5pt;
          font-weight: bold;
        }
        .col-qty {
          text-align: center;
          font-family: monospace;
          font-weight: 600;
        }
        .col-price {
          text-align: right;
          font-family: monospace;
          color: #475569;
        }
        .col-total {
          text-align: right;
          font-family: monospace;
          font-weight: 700;
          color: #0f172a;
        }
        .total-box {
          margin-top: 14px;
          padding: 10px 14px;
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          break-inside: avoid;
        }
        .total-title {
          font-size: 11pt;
          font-weight: 800;
          color: #166534;
        }
        .total-sum {
          font-size: 16pt;
          font-weight: 900;
          color: #15803d;
          font-family: monospace;
        }
        .signatures {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          font-size: 8.5pt;
          color: #475569;
          break-inside: avoid;
        }
        .sig-line {
          border-bottom: 1px solid #94a3b8;
          height: 28px;
          margin-top: 4px;
        }
        .footer-note {
          margin-top: 18px;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
          font-size: 7.5pt;
          color: #94a3b8;
          text-align: center;
          break-inside: avoid;
        }
        @media print {
          body { padding: 0; }
          .category-block { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <!-- Prominent «СантехПро» Header -->
      <div class="header">
        <div class="brand-box">
          <div class="brand-logo">🔧</div>
          <div>
            <div class="brand-title">СантехПро</div>
            <div class="brand-subtitle">Твой карманный помощник по сантехнике • Спецификация оборудования</div>
          </div>
        </div>

        <div class="doc-meta">
          <div class="doc-title">СМЕТНЫЙ РАСЧЁТ</div>
          <div>Дата: ${docDate}</div>
          <div style="font-family: monospace; font-size: 8pt; color: #64748b;">№ ${docNum}</div>
        </div>
      </div>

      <!-- Project Metadata -->
      <div class="info-card">
        <div class="info-row"><span>Объект:</span> <b>${bldLabel}</b></div>
        <div class="info-row"><span>Система трубопровода:</span> <b>${opts.materialName} (${opts.materialBadge})</b></div>
        <div class="info-row"><span>Технология стыковки:</span> <b>${opts.connectionType}</b></div>
        <div class="info-row"><span>Диаметры:</span> <b>${
          opts.selectedDiameters.length > 0 ? opts.selectedDiameters.map((d) => `${d} мм`).join(', ') : 'Все базовые'
        }</b></div>
        ${
          opts.floorPipeMaterial
            ? `<div class="info-row" style="grid-column: span 2;"><span>Опция «Тёплый пол»:</span> <b>Стенка 2.0 мм, ${
                opts.floorPipeMaterial === 'pex' ? 'Сшитый полиэтилен (PEX/PE-RT)' : 'Металлопластик (PEX-AL-PEX)'
              }</b></div>`
            : ''
        }
      </div>

      <!-- Items List -->
      ${categoriesHtml}

      <!-- Total Box -->
      <div class="total-box">
        <div>
          <div class="total-title">ИТОГО К ЗАКУПКЕ И МОНТАЖУ</div>
          <div style="font-size: 8.5pt; color: #166534;">Выбрано позиций: ${opts.summary.includedCount} из ${opts.summary.totalItems}</div>
        </div>
        <div class="total-sum">~ ${opts.summary.totalSum.toLocaleString('ru-RU')} ₽</div>
      </div>

      <!-- Signatures -->
      <div class="signatures">
        <div>
          <div>Спецификацию составил (специалист):</div>
          <div class="sig-line"></div>
        </div>
        <div>
          <div>Спецификацию согласовал (заказчик):</div>
          <div class="sig-line"></div>
        </div>
      </div>

      <div class="footer-note">
        Документ сформирован в приложении «СантехПро». Цены являются ориентировочными и могут отличаться в зависимости от оптовых скидок и региона.
      </div>
    </body>
    </html>
  `;

  // Use hidden iframe to avoid popup blockers and print cleanly
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }
  }, 250);
}

export interface CalculatorExportOptions {
  title?: string;
  pipeLength: number;
  reserveMargin: number;
  finalPipeLength: number;
  totalPointsCount: number;
  totalLinesCount: number;
  wiringScheme: string;
  materialName: string;
  selectedDiameters: number[];
  items: Array<{
    category: string;
    name: string;
    quantity: string;
    unitPrice: number;
    totalPrice: number;
    note?: string;
    badge?: string;
  }>;
  customMaterials?: Array<{
    item: {
      name: string;
      categoryName?: string;
      unit: string;
      price: number;
    };
    quantity: number;
  }>;
  grandTotal: number;
}

/**
 * Exports calculator components list to clean .txt file with prominent «СантехПро» heading
 */
export function exportCalculatorSpecificationToTxt(opts: CalculatorExportOptions): void {
  const docDate = new Date().toLocaleDateString('ru-RU');
  const docTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  let text = `======================================================================\n`;
  text += `                            САНТЕХПРО\n`;
  text += `              Твой карманный помощник по сантехнике\n`;
  text += `            ИТОГОВАЯ ВЕДОМОСТЬ КОМПЛЕКТУЮЩИХ И МАТЕРИАЛОВ\n`;
  text += `======================================================================\n\n`;

  text += `Дата формирования:       ${docDate} в ${docTime}\n`;
  text += `Длина трассы:            ${opts.pipeLength} м (с запасом +${opts.reserveMargin}% = ${opts.finalPipeLength} м)\n`;
  text += `Точки водоразбора:       ${opts.totalPointsCount} шт (${opts.totalLinesCount} линий ХВС/ГВС)\n`;
  text += `Схема разводки:          ${opts.wiringScheme === 'collector' ? 'Коллекторная (гребёнка)' : 'Тройниковая (последовательная)'}\n`;
  text += `Материал труб:           ${opts.materialName}\n`;
  text += `Диаметры в смете:        ${opts.selectedDiameters.length > 0 ? opts.selectedDiameters.map(d => `${d} мм`).join(', ') : 'Все базовые'}\n`;
  text += `----------------------------------------------------------------------\n\n`;

  text += `[ ВЕДОМОСТЬ ТРУБ, ФИТИНГОВ И КОМПЛЕКТУЮЩИХ ]\n`;
  opts.items.forEach((item, idx) => {
    text += `  ${idx + 1}. [${item.category}] ${item.name}\n`;
    text += `     • Количество: ${item.quantity} × ${item.unitPrice.toLocaleString('ru-RU')} ₽ = ${item.totalPrice.toLocaleString('ru-RU')} ₽\n`;
    if (item.note) {
      text += `     • Назначение: ${item.note}\n`;
    }
  });
  text += `\n`;

  if (opts.customMaterials && opts.customMaterials.length > 0) {
    text += `[ ДОПОЛНИТЕЛЬНОЕ ОБОРУДОВАНИЕ ИЗ РАЗДЕЛА МАТЕРИАЛЫ ]\n`;
    opts.customMaterials.forEach((m, idx) => {
      const lineTotal = m.quantity * m.item.price;
      text += `  ${idx + 1}. ${m.item.name}\n`;
      text += `     • Количество: ${m.quantity} ${m.item.unit} × ${m.item.price.toLocaleString('ru-RU')} ₽ = ${lineTotal.toLocaleString('ru-RU')} ₽\n`;
    });
    text += `\n`;
  }

  text += `======================================================================\n`;
  text += `ИТОГОВАЯ ОРИЕНТИРОВОЧНАЯ СТОИМОСТЬ: ~ ${opts.grandTotal.toLocaleString('ru-RU')} ₽\n`;
  text += `======================================================================\n`;
  text += `Сформировано в приложении «СантехПро»\n`;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `СантехПро_Ведомость_Комплектующих_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an official PDF printable document with «СантехПро» header for Calculator
 */
export function exportCalculatorSpecificationToPdf(opts: CalculatorExportOptions): void {
  const docDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const docNum = `СП-К-${Date.now().toString().slice(-6)}`;

  let rowsHtml = '';
  opts.items.forEach((it, idx) => {
    rowsHtml += `
      <tr>
        <td style="width: 32px; text-align: center; color: #64748b; font-weight: bold;">${idx + 1}</td>
        <td>
          <div style="font-weight: 600; color: #0f172a;">${it.name}</div>
          <div style="font-size: 8pt; color: #0284c7; margin-top: 2px;">Категория: ${it.category}${it.note ? ` • ${it.note}` : ''}</div>
        </td>
        <td style="width: 90px; text-align: center; font-weight: 600;">${it.quantity}</td>
        <td style="width: 100px; text-align: right; color: #475569;">${it.unitPrice.toLocaleString('ru-RU')} ₽</td>
        <td style="width: 115px; text-align: right; font-weight: 700; color: #0369a1;">${it.totalPrice.toLocaleString('ru-RU')} ₽</td>
      </tr>
    `;
  });

  if (opts.customMaterials && opts.customMaterials.length > 0) {
    opts.customMaterials.forEach((m, idx) => {
      const lineTotal = m.quantity * m.item.price;
      rowsHtml += `
        <tr>
          <td style="width: 32px; text-align: center; color: #64748b; font-weight: bold;">${opts.items.length + idx + 1}</td>
          <td>
            <div style="font-weight: 600; color: #0f172a;">${m.item.name} <span style="font-size: 7.5pt; color: #d97706; background: #fef3c7; padding: 2px 6px; border-radius: 4px;">[Оборудование]</span></div>
            <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">Каталог СантехПро</div>
          </td>
          <td style="width: 90px; text-align: center; font-weight: 600;">${m.quantity} ${m.item.unit}</td>
          <td style="width: 100px; text-align: right; color: #475569;">${m.item.price.toLocaleString('ru-RU')} ₽</td>
          <td style="width: 115px; text-align: right; font-weight: 700; color: #0369a1;">${lineTotal.toLocaleString('ru-RU')} ₽</td>
        </tr>
      `;
    });
  }

  const html = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="utf-8">
      <title>СантехПро — Итоговая ведомость комплектующих</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          font-size: 9.5pt;
          line-height: 1.4;
          padding: 10px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2.5px solid #0284c7;
          padding-bottom: 10px;
          margin-bottom: 14px;
        }
        .brand-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-logo {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #0284c7;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 18pt;
        }
        .brand-title {
          font-size: 24pt;
          font-weight: 900;
          color: #0369a1;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .brand-subtitle {
          font-size: 9pt;
          color: #64748b;
          margin-top: 3px;
          font-weight: 600;
        }
        .doc-meta {
          text-align: right;
          font-size: 8.5pt;
          color: #475569;
        }
        .doc-title {
          font-weight: 900;
          font-size: 11pt;
          color: #0f172a;
        }
        .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 16px;
          font-size: 8.5pt;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
        }
        .info-row span {
          color: #64748b;
        }
        .info-row b {
          color: #0f172a;
          font-weight: 600;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 8.5pt;
        }
        th {
          background: #0f172a;
          color: #ffffff;
          padding: 7px 10px;
          font-weight: 700;
          font-size: 8pt;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td {
          padding: 7px 10px;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: top;
        }
        tr:nth-child(even) td {
          background: #f8fafc;
        }
        .total-box {
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          page-break-inside: avoid;
        }
        .total-title {
          font-size: 10pt;
          font-weight: 800;
          color: #166534;
        }
        .total-sum {
          font-size: 15pt;
          font-weight: 900;
          color: #15803d;
        }
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 20px;
          padding-top: 14px;
          border-top: 1px dashed #cbd5e1;
          font-size: 8.5pt;
          color: #475569;
          page-break-inside: avoid;
        }
        .sig-line {
          border-bottom: 1px solid #94a3b8;
          height: 28px;
          margin-top: 4px;
        }
        .footer-note {
          margin-top: 16px;
          text-align: center;
          font-size: 7.5pt;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <!-- Header with prominent СантехПро -->
      <div class="header">
        <div class="brand-box">
          <div class="brand-logo">🔧</div>
          <div>
            <div class="brand-title">СантехПро</div>
            <div class="brand-subtitle">Твой карманный помощник по сантехнике • santehpro.app</div>
          </div>
        </div>
        <div class="doc-meta">
          <div class="doc-title">ИТОГОВАЯ ВЕДОМОСТЬ КОМПЛЕКТУЮЩИХ</div>
          <div style="margin-top: 2px;">Дата: ${docDate}</div>
          <div style="font-family: monospace; font-size: 8pt; color: #64748b;">№ ${docNum}</div>
        </div>
      </div>

      <!-- Project Metadata -->
      <div class="info-card">
        <div class="info-row"><span>Длина трассы:</span> <b>${opts.pipeLength} м (+${opts.reserveMargin}% запас = ${opts.finalPipeLength} м)</b></div>
        <div class="info-row"><span>Точки водоразбора:</span> <b>${opts.totalPointsCount} шт (${opts.totalLinesCount} линий)</b></div>
        <div class="info-row"><span>Схема разводки:</span> <b>${opts.wiringScheme === 'collector' ? 'Коллекторная (гребёнка)' : 'Тройниковая'}</b></div>
        <div class="info-row"><span>Материал труб:</span> <b>${opts.materialName}</b></div>
        <div class="info-row" style="grid-column: span 2;"><span>Диаметры:</span> <b>${
          opts.selectedDiameters.length > 0 ? opts.selectedDiameters.map((d) => `${d} мм`).join(', ') : 'Все базовые'
        }</b></div>
      </div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th style="width: 32px; text-align: center;">№</th>
            <th>Наименование комплектующих</th>
            <th style="width: 90px; text-align: center;">Кол-во</th>
            <th style="width: 100px; text-align: right;">Цена за ед.</th>
            <th style="width: 115px; text-align: right;">Сумма</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- Total Box -->
      <div class="total-box">
        <div>
          <div class="total-title">ИТОГО К ЗАКУПКЕ И МОНТАЖУ</div>
          <div style="font-size: 8.5pt; color: #166534;">Проверено позиций: ${opts.items.length + (opts.customMaterials?.length || 0)}</div>
        </div>
        <div class="total-sum">~ ${opts.grandTotal.toLocaleString('ru-RU')} ₽</div>
      </div>

      <!-- Signatures -->
      <div class="signatures">
        <div>
          <div>Спецификацию проверил специалист:</div>
          <div class="sig-line"></div>
        </div>
        <div>
          <div>Согласовано заказчиком:</div>
          <div class="sig-line"></div>
        </div>
      </div>

      <div class="footer-note">
        Документ сформирован в приложении «СантехПро». Цены являются ориентировочными и могут отличаться в зависимости от оптовых скидок и региона.
      </div>
    </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }
  }, 250);
}
