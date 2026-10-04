import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Renders an HTML string into a downloadable PDF file.
 * Compatible with mobile Chrome (Android), iOS Safari, and desktop browsers.
 */
export async function downloadHtmlAsPdf(
  htmlContent: string,
  filename: string = 'santehpro-document.pdf'
): Promise<void> {
  // Create an off-screen container for rendering
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // ~ 210mm at 96 DPI (standard A4 width)
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.padding = '32px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    // Wait for any images/styles to settle
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(container, {
      scale: 2, // 2x for sharp retina/high-DPI text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    pdf.save(filename);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Generates and downloads a branded PDF for the Collector Unit Builder (Узел ввода)
 */
export async function downloadCollectorBoardPdf(opts: {
  presetName: string;
  coldItems: Array<{ name: string; badge?: string; quantity: number; unit: string; unitPrice: number }>;
  hotItems: Array<{ name: string; badge?: string; quantity: number; unit: string; unitPrice: number }>;
  sharedItems: Array<{ name: string; badge?: string; quantity: number; unit: string; unitPrice: number }>;
  totalMaterialsCost: number;
  laborCost: number;
  includeLabor: boolean;
  grandTotal: number;
  clientName?: string;
  clientPhone?: string;
  specialistName?: string;
  specialistPhone?: string;
}): Promise<void> {
  const docDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const docNum = `УВ-${Date.now().toString().slice(-6)}`;

  const renderTableRows = (
    items: Array<{ name: string; badge?: string; quantity: number; unit: string; unitPrice: number }>
  ) => {
    if (items.length === 0) {
      return `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 12px; font-style: italic;">Компоненты не выбраны</td></tr>`;
    }
    return items
      .map((it, idx) => {
        const rowTotal = it.quantity * it.unitPrice;
        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 7px 8px; text-align: center; color: #64748b; font-weight: 700;">${idx + 1}</td>
            <td style="padding: 7px 8px; color: #0f172a; font-weight: 600;">
              ${it.name}
              ${it.badge ? `<span style="display: inline-block; margin-left: 6px; padding: 1px 6px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 9px; font-weight: 700;">${it.badge}</span>` : ''}
            </td>
            <td style="padding: 7px 8px; text-align: center; font-weight: 700; color: #334155;">${it.quantity} ${it.unit}</td>
            <td style="padding: 7px 8px; text-align: right; color: #475569;">${it.unitPrice.toLocaleString('ru-RU')} ₽</td>
            <td style="padding: 7px 8px; text-align: right; font-weight: 700; color: #0f172a;">${rowTotal.toLocaleString('ru-RU')} ₽</td>
          </tr>
        `;
      })
      .join('');
  };

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.4;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #ef4444, #3b82f6); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 24px;">
            🔧
          </div>
          <div>
            <div style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a;">СантехПро</div>
            <div style="font-size: 11px; color: #64748b; font-weight: 600;">Твой карманный помощник по сантехнике • Спецификация узла ввода</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; font-weight: 800; color: #0284c7; text-transform: uppercase;">Спецификация оборудования</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Дата: <b>${docDate}</b></div>
          <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">№ ${docNum}</div>
        </div>
      </div>

      <!-- Info Box -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
        <div>
          <span style="color: #64748b;">Конфигурация узла ввода:</span>
          <b style="color: #0f172a; margin-left: 6px;">${opts.presetName}</b>
        </div>
        <div>
          <span style="color: #64748b;">Всего позиций оборудования:</span>
          <b style="color: #0f172a; margin-left: 6px;">${opts.coldItems.length + opts.hotItems.length + opts.sharedItems.length} шт</b>
        </div>
        ${opts.specialistName ? `
        <div>
          <span style="color: #64748b;">Мастер-исполнитель:</span>
          <b style="color: #0f172a; margin-left: 6px;">${opts.specialistName} ${opts.specialistPhone ? `(${opts.specialistPhone})` : ''}</b>
        </div>
        ` : ''}
        ${opts.clientName ? `
        <div>
          <span style="color: #64748b;">Заказчик:</span>
          <b style="color: #0f172a; margin-left: 6px;">${opts.clientName} ${opts.clientPhone ? `(${opts.clientPhone})` : ''}</b>
        </div>
        ` : ''}
      </div>

      <!-- Cold Water Line -->
      <div style="margin-bottom: 20px;">
        <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 6px 10px; font-size: 12px; font-weight: 800; color: #0369a1; text-transform: uppercase; margin-bottom: 8px;">
          🚰 1. Линия ХВС (Холодная вода)
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
          <thead>
            <tr style="background: #f1f5f9; font-size: 10px; color: #475569; text-transform: uppercase; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 6px 8px; width: 30px; text-align: center;">№</th>
              <th style="padding: 6px 8px; text-align: left;">Компонент узла</th>
              <th style="padding: 6px 8px; width: 70px; text-align: center;">Кол-во</th>
              <th style="padding: 6px 8px; width: 90px; text-align: right;">Цена за ед.</th>
              <th style="padding: 6px 8px; width: 95px; text-align: right;">Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${renderTableRows(opts.coldItems)}
          </tbody>
        </table>
      </div>

      <!-- Hot Water Line -->
      <div style="margin-bottom: 20px;">
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 6px 10px; font-size: 12px; font-weight: 800; color: #b91c1c; text-transform: uppercase; margin-bottom: 8px;">
          🔥 2. Линия ГВС (Горячая вода)
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
          <thead>
            <tr style="background: #f1f5f9; font-size: 10px; color: #475569; text-transform: uppercase; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 6px 8px; width: 30px; text-align: center;">№</th>
              <th style="padding: 6px 8px; text-align: left;">Компонент узла</th>
              <th style="padding: 6px 8px; width: 70px; text-align: center;">Кол-во</th>
              <th style="padding: 6px 8px; width: 90px; text-align: right;">Цена за ед.</th>
              <th style="padding: 6px 8px; width: 95px; text-align: right;">Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${renderTableRows(opts.hotItems)}
          </tbody>
        </table>
      </div>

      <!-- Shared & Service Systems -->
      ${
        opts.sharedItems.length > 0
          ? `
        <div style="margin-bottom: 20px;">
          <div style="background: #f5f3ff; border-left: 4px solid #8b5cf6; padding: 6px 10px; font-size: 12px; font-weight: 800; color: #6d28d9; text-transform: uppercase; margin-bottom: 8px;">
            🔄 3. Общие и сервисные системы
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
            <thead>
              <tr style="background: #f1f5f9; font-size: 10px; color: #475569; text-transform: uppercase; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 6px 8px; width: 30px; text-align: center;">№</th>
                <th style="padding: 6px 8px; text-align: left;">Компонент узла</th>
                <th style="padding: 6px 8px; width: 70px; text-align: center;">Кол-во</th>
                <th style="padding: 6px 8px; width: 90px; text-align: right;">Цена за ед.</th>
                <th style="padding: 6px 8px; width: 95px; text-align: right;">Сумма</th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRows(opts.sharedItems)}
            </tbody>
          </table>
        </div>
      `
          : ''
      }

      <!-- Total Calculation Box -->
      <div style="margin-top: 24px; padding: 16px 20px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #475569; margin-bottom: 6px;">
          <span>Стоимость материалов и арматуры:</span>
          <b>${opts.totalMaterialsCost.toLocaleString('ru-RU')} ₽</b>
        </div>
        ${
          opts.includeLabor
            ? `
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #b45309; margin-bottom: 6px;">
            <span>Монтажные и пусконаладочные работы узла:</span>
            <b>${opts.laborCost.toLocaleString('ru-RU')} ₽</b>
          </div>
        `
            : ''
        }
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #cbd5e1; padding-top: 10px; margin-top: 8px;">
          <span style="font-size: 15px; font-weight: 900; color: #0f172a;">ИТОГО К ОПЛАТЕ:</span>
          <span style="font-size: 20px; font-weight: 900; color: #0284c7; font-family: monospace;">${opts.grandTotal.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      <!-- Signatures -->
      <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 11px; color: #64748b;">
        <div>
          <div>Спецификацию составил (мастер):</div>
          <div style="border-bottom: 1px solid #94a3b8; height: 28px; margin-top: 4px;"></div>
        </div>
        <div>
          <div>Спецификацию согласовал (заказчик):</div>
          <div style="border-bottom: 1px solid #94a3b8; height: 28px; margin-top: 4px;"></div>
        </div>
      </div>

      <!-- Footer Note -->
      <div style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 8px; text-align: center; font-size: 10px; color: #94a3b8;">
        Сформировано в приложении «СантехПро» • Все права защищены • Официальная спецификация оборудования
      </div>
    </div>
  `;

  await downloadHtmlAsPdf(html, `СантехПро_Узел_Ввода_${Date.now().toString().slice(-4)}.pdf`);
}

/**
 * Generates and downloads a branded PDF for Underfloor Heating (Тёплый пол)
 */
export async function downloadUnderfloorHeatingPdf(opts: {
  floorType: 'water' | 'electric';
  systemName: string;
  totalArea: number;
  heatedArea: number;
  unheatedArea: number;
  roomsCount: number;
  materialsTotal: number;
  laborTotal: number;
  screedTotal: number;
  grandTotal: number;
  items: Array<{ name: string; quantity: string | number; unit: string; total: number }>;
  clientName?: string;
  clientPhone?: string;
  specialistName?: string;
  specialistPhone?: string;
}): Promise<void> {
  const docDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const docNum = `ТП-${Date.now().toString().slice(-6)}`;

  const rows = opts.items
    .map(
      (it, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
        <td style="padding: 7px 8px; text-align: center; color: #64748b; font-weight: 700;">${idx + 1}</td>
        <td style="padding: 7px 8px; color: #0f172a; font-weight: 600;">${it.name}</td>
        <td style="padding: 7px 8px; text-align: center; font-weight: 700; color: #334155;">${it.quantity} ${it.unit}</td>
        <td style="padding: 7px 8px; text-align: right; font-weight: 700; color: #0f172a;">${it.total.toLocaleString('ru-RU')} ₽</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.4;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #f59e0b, #ef4444); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 24px;">
            ♨️
          </div>
          <div>
            <div style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a;">СантехПро</div>
            <div style="font-size: 11px; color: #64748b; font-weight: 600;">Калькулятор тёплого пола • Смета под ключ</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; font-weight: 800; color: #d97706; text-transform: uppercase;">Сметный расчёт тёплого пола</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Дата: <b>${docDate}</b></div>
          <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">№ ${docNum}</div>
        </div>
      </div>

      <!-- Info Box -->
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
        <div>
          <span style="color: #92400e;">Тип системы:</span>
          <b style="color: #78350f; margin-left: 6px;">${opts.systemName}</b>
        </div>
        <div>
          <span style="color: #92400e;">Количество контуров/помещений:</span>
          <b style="color: #78350f; margin-left: 6px;">${opts.roomsCount} шт</b>
        </div>
        <div>
          <span style="color: #92400e;">Общая площадь объекта:</span>
          <b style="color: #78350f; margin-left: 6px;">${opts.totalArea} м²</b>
        </div>
        <div>
          <span style="color: #92400e;">Полезная площадь обогрева:</span>
          <b style="color: #78350f; margin-left: 6px;">${opts.heatedArea} м²</b>
        </div>
        ${opts.specialistName ? `
        <div>
          <span style="color: #92400e;">Мастер-исполнитель:</span>
          <b style="color: #78350f; margin-left: 6px;">${opts.specialistName} ${opts.specialistPhone ? `(${opts.specialistPhone})` : ''}</b>
        </div>
        ` : ''}
        ${opts.clientName ? `
        <div>
          <span style="color: #92400e;">Заказчик:</span>
          <b style="color: #78350f; margin-left: 6px;">${opts.clientName} ${opts.clientPhone ? `(${opts.clientPhone})` : ''}</b>
        </div>
        ` : ''}
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
          <thead>
            <tr style="background: #f1f5f9; font-size: 10px; color: #475569; text-transform: uppercase; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 6px 8px; width: 30px; text-align: center;">№</th>
              <th style="padding: 6px 8px; text-align: left;">Наименование работ и материалов</th>
              <th style="padding: 6px 8px; width: 100px; text-align: center;">Количество</th>
              <th style="padding: 6px 8px; width: 110px; text-align: right;">Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>

      <!-- Total Box -->
      <div style="margin-top: 24px; padding: 16px 20px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #475569; margin-bottom: 6px;">
          <span>Материалы и трубы:</span>
          <b>${opts.materialsTotal.toLocaleString('ru-RU')} ₽</b>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #b45309; margin-bottom: 6px;">
          <span>Монтаж тёплого пола под ключ:</span>
          <b>${opts.laborTotal.toLocaleString('ru-RU')} ₽</b>
        </div>
        ${
          opts.screedTotal > 0
            ? `
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #0284c7; margin-bottom: 6px;">
            <span>Полусухая механизированная стяжка:</span>
            <b>${opts.screedTotal.toLocaleString('ru-RU')} ₽</b>
          </div>
        `
            : ''
        }
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #cbd5e1; padding-top: 10px; margin-top: 8px;">
          <span style="font-size: 15px; font-weight: 900; color: #0f172a;">ИТОГО К ОПЛАТЕ:</span>
          <span style="font-size: 20px; font-weight: 900; color: #d97706; font-family: monospace;">${opts.grandTotal.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      <!-- Signatures -->
      <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 11px; color: #64748b;">
        <div>
          <div>Смету составил (мастер):</div>
          <div style="border-bottom: 1px solid #94a3b8; height: 28px; margin-top: 4px;"></div>
        </div>
        <div>
          <div>Смету согласовал (заказчик):</div>
          <div style="border-bottom: 1px solid #94a3b8; height: 28px; margin-top: 4px;"></div>
        </div>
      </div>

      <!-- Footer Note -->
      <div style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 8px; text-align: center; font-size: 10px; color: #94a3b8;">
        Сформировано в приложении «СантехПро» • Гарантия на монтаж и материалы
      </div>
    </div>
  `;

  await downloadHtmlAsPdf(html, `СантехПро_Тёплый_Пол_${Date.now().toString().slice(-4)}.pdf`);
}
