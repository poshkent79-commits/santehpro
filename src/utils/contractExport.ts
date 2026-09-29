import { PlumbingContract } from '../types';

export const formatDateRu = (isoStr?: string): string => {
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

export const getStatusLabel = (status?: string): string => {
  const map: Record<string, string> = {
    self_employed: 'Плательщик налога на профессиональный доход (Самозанятый)',
    individual: 'Физическое лицо',
    ip: 'Индивидуальный предприниматель (ИП)',
    company: 'Юридическое лицо (ООО)',
  };
  return map[status || 'self_employed'] || 'Самозанятый специалист';
};

export const getMaterialsLabel = (mat?: string): string => {
  const map: Record<string, string> = {
    contractor: 'Материалы приобретаются Исполнителем за счёт Заказчика',
    client: 'Материалы приобретаются и предоставляются Заказчиком',
    mixed: 'По согласованию сторон (основные материалы Заказчика, расходные материалы Исполнителя)',
  };
  return map[mat || 'mixed'] || 'По согласованию сторон';
};

/**
 * Generates official HTML representation of Contract, Act and Warranty.
 * Includes official Russian electronic signature stamps, signatures and styling.
 */
export function generateContractHtmlDocument(contract: PlumbingContract, section: 'all' | 'contract' | 'act' | 'warranty' = 'all'): string {
  const dateStr = formatDateRu(contract.contractDate);
  const startDateStr = formatDateRu(contract.startDate);
  const endDateStr = formatDateRu(contract.endDate);
  const actDateStr = formatDateRu(contract.actDate || contract.endDate || contract.contractDate);
  const warrantyMonths = contract.warrantyMonths || 24;

  // Calculate warranty valid until date
  let warrantyUntilStr = contract.warrantyValidUntil ? formatDateRu(contract.warrantyValidUntil) : '';
  if (!warrantyUntilStr) {
    try {
      const base = new Date(contract.actDate || contract.endDate || contract.contractDate);
      base.setMonth(base.getMonth() + warrantyMonths);
      warrantyUntilStr = formatDateRu(base.toISOString().slice(0, 10));
    } catch {
      warrantyUntilStr = 'В течение срока гарантии';
    }
  }

  const statusTitle = getStatusLabel(contract.specialistStatus);
  const materialsTitle = getMaterialsLabel(contract.materialsResponsibility);
  const certNumber = contract.warrantyCertificateNumber || `ГАР-${contract.contractNumber.replace(/\D/g, '') || '2026-01'}`;

  // Master Signature block
  const masterSignBlock = contract.masterSignature
    ? `<div style="margin-top: 8px;">
        <img src="${contract.masterSignature}" alt="Подпись мастера" style="max-height: 48px; max-width: 150px; display: block;" />
        <div style="font-size: 8.5pt; color: #1e40af; font-weight: bold; margin-top: 3px;">
          ✓ Подписано мастером (${formatDateRu(contract.masterSignedAt || contract.contractDate)})
        </div>
       </div>`
    : `<div style="margin-top: 25px; border-bottom: 1px solid #94a3b8; width: 85%; font-size: 8pt; color: #64748b; padding-bottom: 2px;">
        Подпись мастера: _________________ / М.П.
       </div>`;

  // Client Signature / Digital Seal block
  const clientSignBlock = (contract.clientSignature || contract.clientSignedAt)
    ? `<div style="margin-top: 8px;">
        ${contract.clientSignature ? `<img src="${contract.clientSignature}" alt="Подпись заказчика" style="max-height: 48px; max-width: 150px; display: block;" />` : ''}
        <div style="margin-top: 6px; padding: 6px 10px; border: 2px solid #2563eb; background-color: #eff6ff; border-radius: 6px; font-size: 8pt; color: #1e3a8a; line-height: 1.35;">
          <div style="font-weight: bold; text-transform: uppercase; color: #1d4ed8;">ДОКУМЕНТ ПОДПИСАН ЭЛЕКТРОННОЙ ПОДПИСЬЮ (ПЭП)</div>
          <div>Сертификат: <b>${contract.digitalSealId || 'ПЭП-RU-2026-8812'}</b></div>
          <div>Владелец: <b>${contract.clientName}</b></div>
          <div>Дата и время: ${formatDateRu(contract.clientSignedAt || contract.contractDate)}</div>
          <div style="font-size: 7pt; color: #3b82f6;">СантехПро • ст. 434 ГК РФ, 63-ФЗ</div>
        </div>
       </div>`
    : `<div style="margin-top: 25px; border-bottom: 1px solid #94a3b8; width: 85%; font-size: 8pt; color: #64748b; padding-bottom: 2px;">
        Подпись заказчика: _________________
       </div>`;

  const includeContract = section === 'all' || section === 'contract';
  const includeAct = section === 'all' || section === 'act';
  const includeWarranty = section === 'all' || section === 'warranty';

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Договор № ${contract.contractNumber} — СантехПро</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }
    body {
      font-family: 'Times New Roman', 'Liberation Serif', Georgia, serif;
      font-size: 11pt;
      line-height: 1.35;
      color: #0f172a;
      background-color: #ffffff;
      padding: 20px;
      margin: 0 auto;
      max-width: 820px;
    }
    h1 {
      font-size: 13pt;
      text-align: center;
      text-transform: uppercase;
      margin: 10px 0 3px 0;
      font-weight: bold;
      color: #000;
    }
    h2 {
      font-size: 10.5pt;
      text-align: center;
      margin: 0 0 12px 0;
      font-weight: normal;
      color: #334155;
    }
    .brand-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-name {
      font-size: 15pt;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .brand-red { color: #dc2626; }
    .brand-blue { color: #2563eb; }
    .brand-tag { font-size: 8pt; color: #64748b; }
    .doc-meta { text-align: right; font-size: 9pt; }
    .meta-table { width: 100%; border: none; margin-bottom: 12px; font-size: 10pt; }
    .section-title {
      font-weight: bold;
      margin-top: 14px;
      margin-bottom: 4px;
      font-size: 10.5pt;
      text-transform: uppercase;
      color: #000;
    }
    p { margin: 5px 0; text-align: justify; }
    .works-box {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 10px 14px;
      border-radius: 6px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 9.5pt;
      white-space: pre-wrap;
      margin: 6px 0 10px 0;
      line-height: 1.35;
    }
    .sign-table {
      width: 100%;
      margin-top: 24px;
      border-collapse: collapse;
      page-break-inside: avoid;
    }
    .sign-table td {
      width: 50%;
      vertical-align: top;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      background-color: #f8fafc;
    }
    .warranty-card {
      border: 3px double #2563eb;
      background-color: #f8fafc;
      padding: 18px 24px;
      border-radius: 12px;
      margin-top: 14px;
      page-break-inside: avoid;
    }
    .warranty-seal {
      display: inline-block;
      border: 2px solid #16a34a;
      color: #166534;
      background-color: #f0fdf4;
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 9.5pt;
      margin-top: 8px;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
      margin-top: 28px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
    }
    @media print {
      body { padding: 0; }
      .page-break { border-top: none; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

${includeContract ? `
  <!-- ==================== СЕКЦИЯ 1: ДОГОВОР ПОДРЯДА ==================== -->
  <div class="brand-header">
    <div>
      <div class="brand-name"><span class="brand-red">Сантех</span><span class="brand-blue">Про</span></div>
      <div class="brand-tag">Официальный сервис сантехнических услуг • santehpro.info</div>
    </div>
    <div class="doc-meta">
      <b>Договор № ${contract.contractNumber}</b><br>
      г. ${contract.specialistCity || 'Москва'}
    </div>
  </div>

  <h1>ДОГОВОР ПОДРЯДА № ${contract.contractNumber}</h1>
  <h2>на выполнение сантехнических и монтажных работ</h2>

  <table class="meta-table">
    <tr>
      <td>г. ${contract.specialistCity || 'Москва'}</td>
      <td style="text-align: right;">«${dateStr}»</td>
    </tr>
  </table>

  <p><b>Исполнитель:</b> ${contract.specialistName}, статус: ${statusTitle}${contract.specialistInn ? `, ИНН: ${contract.specialistInn}` : ''}, телефон: ${contract.specialistPhone}, с одной стороны, и</p>
  <p><b>Заказчик:</b> ${contract.clientName}${contract.clientPassport ? `, паспорт: ${contract.clientPassport}` : ''}, телефон: ${contract.clientPhone || '—'}, адрес объекта: <b>${contract.clientAddress}</b>, с другой стороны, заключили настоящий Договор о нижеследующем:</p>

  <div class="section-title">1. ПРЕДМЕТ ДОГОВОРА</div>
  <p>1.1. Заказчик поручает, а Исполнитель принимает на себя обязательства собственными силами и специализированным инструментом выполнить сантехнические работы на объекте по адресу: <b>${contract.clientAddress}</b>.</p>
  <p>1.2. Наименование объекта/комплекса работ: <b>${contract.title}</b>.</p>
  <p>1.3. Перечень выполняемых работ:</p>
  <div class="works-box">${contract.worksList}</div>

  <div class="section-title">2. СРОКИ ВЫПОЛНЕНИЯ РАБОТ</div>
  <p>2.1. Дата начала работ: «${startDateStr}».</p>
  <p>2.2. Плановая дата окончания работ: «${endDateStr}».</p>
  <p>2.3. Сроки могут быть продлены в случае задержки подачи воды/электроэнергии или задержки предоставления чистовых материалов Заказчиком.</p>

  <div class="section-title">3. СТОИМОСТЬ И ПОРЯДОК РАСЧЁТОВ</div>
  <p>3.1. Общая стоимость работ по настоящему Договору составляет: <b>${contract.totalPrice.toLocaleString('ru-RU')} (рублей)</b>.</p>
  ${contract.advancePayment > 0
    ? `<p>3.2. Сумма авансового платежа: <b>${contract.advancePayment.toLocaleString('ru-RU')} рублей</b> (выплачивается до начала монтажа).</p>`
    : `<p>3.2. Работы производятся без предварительного аванса.</p>`}
  <p>3.3. Окончательный расчёт в размере <b>${contract.remainingPayment.toLocaleString('ru-RU')} рублей</b> производится Заказчиком в день завершения работ после проведения опрессовки и подписания Акта сдачи-приёмки (Приложение № 1).</p>
  <p>3.4. Условие по материалам: <i>${materialsTitle}</i>.</p>

  <div class="section-title">4. КАЧЕСТВО И ГАРАНТИЙНЫЕ ОБЯЗАТЕЛЬСТВА</div>
  <p>4.1. Исполнитель гарантирует соблюдение требований действующих строительных норм (СП 73.13330 / СНиП 3.05.01-85).</p>
  <p>4.2. До скрытия коммуникаций Исполнитель обязан провести опрессовку смонтированной системы избыточным давлением в присутствии Заказчика.</p>
  <p>4.3. Гарантийный срок на выполненные монтажные соединения составляет <b>${warrantyMonths} месяцев</b> со дня подписания Акта сдачи-приёмки.</p>

  <div class="section-title">5. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</div>
  <table class="sign-table">
    <tr>
      <td>
        <b>ИСПОЛНИТЕЛЬ:</b><br>
        <b>${contract.specialistName}</b><br>
        Тел: ${contract.specialistPhone}<br>
        ${contract.specialistInn ? `ИНН: ${contract.specialistInn}<br>` : ''}
        ${masterSignBlock}
      </td>
      <td>
        <b>ЗАКАЗЧИК:</b><br>
        <b>${contract.clientName}</b><br>
        Тел: ${contract.clientPhone || '—'}<br>
        Адрес: ${contract.clientAddress}<br>
        ${clientSignBlock}
      </td>
    </tr>
  </table>
` : ''}

${includeAct ? `
  <!-- ==================== СЕКЦИЯ 2: АКТ СДАЧИ-ПРИЁМКИ ==================== -->
  <div class="${includeContract ? 'page-break' : ''}">
    <div class="brand-header">
      <div>
        <div class="brand-name"><span class="brand-red">Сантех</span><span class="brand-blue">Про</span></div>
        <div class="brand-tag">Приложение № 1 к Договору подряда № ${contract.contractNumber}</div>
      </div>
      <div class="doc-meta">
        <b>АКТ № 1</b><br>
        от «${actDateStr}»
      </div>
    </div>

    <h1>АКТ СДАЧИ-ПРИЁМКИ ВЫПОЛНЕННЫХ РАБОТ</h1>
    <h2>к Договору подряда № ${contract.contractNumber} от «${dateStr}»</h2>

    <table class="meta-table">
      <tr>
        <td>г. ${contract.specialistCity || 'Москва'}</td>
        <td style="text-align: right;">«${actDateStr}»</td>
      </tr>
    </table>

    <p>Мы, нижеподписавшиеся, Исполнитель <b>${contract.specialistName}</b>, с одной стороны, и Заказчик <b>${contract.clientName}</b>, с другой стороны, составили настоящий Акт о следующем:</p>
    <p>1. Исполнителем в полном объёме выполнены работы по Договору подряда № <b>${contract.contractNumber}</b> на объекте по адресу: <b>${contract.clientAddress}</b>.</p>
    <p>2. Перечень фактически выполненных работ:</p>
    <div class="works-box">${contract.worksList}</div>
    <p>3. <b>Результаты гидравлических испытаний (опрессовки):</b> система проверена избыточным давлением. Соединения герметичны, видимых подтёков и дефектов не выявлено.</p>
    <p>4. Заказчик подтверждает, что работы выполнены качественно, в полном объёме и в установленный срок. <b>Претензий по качеству, объёму и срокам Заказчик к Исполнителю не имеет.</b></p>
    <p>5. Общая стоимость фактически выполненных работ составляет: <b>${contract.totalPrice.toLocaleString('ru-RU')} рублей</b>. Расчёт между Сторонами произведён полностью.</p>
    <p>6. С момента подписания настоящего Акта вступает в силу Гарантийный сертификат сроком на <b>${warrantyMonths} месяцев</b>.</p>

    <table class="sign-table">
      <tr>
        <td>
          <b>РАБОТУ СДАЛ (Исполнитель):</b><br>
          <b>${contract.specialistName}</b><br>
          Тел: ${contract.specialistPhone}<br>
          ${contract.actMasterSignature ? `<div style="margin-top: 8px;"><img src="${contract.actMasterSignature}" alt="Подпись мастера" style="max-height: 48px;" /><div style="font-size: 8pt; color: #1e40af;">✓ Подписано мастером (${actDateStr})</div></div>` : masterSignBlock}
        </td>
        <td>
          <b>РАБОТУ ПРИНЯЛ (Заказчик):</b><br>
          <b>${contract.clientName}</b><br>
          Тел: ${contract.clientPhone || '—'}<br>
          ${contract.actClientSignature ? `<div style="margin-top: 8px;"><img src="${contract.actClientSignature}" alt="Подпись заказчика" style="max-height: 48px;" /><div style="font-size: 8pt; color: #1e40af;">✓ Принято заказчиком (${actDateStr})</div></div>` : clientSignBlock}
        </td>
      </tr>
    </table>
  </div>
` : ''}

${includeWarranty ? `
  <!-- ==================== СЕКЦИЯ 3: ГАРАНТИЙНЫЙ ТАЛОН ==================== -->
  <div class="${(includeContract || includeAct) ? 'page-break' : ''}">
    <div class="brand-header">
      <div>
        <div class="brand-name"><span class="brand-red">Сантех</span><span class="brand-blue">Про</span></div>
        <div class="brand-tag">Приложение № 2 к Договору подряда № ${contract.contractNumber}</div>
      </div>
      <div class="doc-meta">
        <b>Сертификат: ${certNumber}</b><br>
        Срок: ${warrantyMonths} мес.
      </div>
    </div>

    <h1>ГАРАНТИЙНЫЙ СЕРТИФИКАТ (ТАЛОН)</h1>
    <h2>на монтаж сантехнических систем и оборудования</h2>

    <div class="warranty-card">
      <div style="font-size: 11pt; line-height: 1.5;">
        <p><b>Номер сертификата:</b> <span style="font-family: monospace; font-weight: bold; color: #1d4ed8;">${certNumber}</span></p>
        <p><b>Основание выдачи:</b> Договор подряда № ${contract.contractNumber} и Акт сдачи-приёмки от ${actDateStr}</p>
        <p><b>Адрес объекта:</b> <b>${contract.clientAddress}</b></p>
        <p><b>Заказчик:</b> ${contract.clientName} (тел: ${contract.clientPhone || '—'})</p>
        <p><b>Исполнитель (мастер):</b> ${contract.specialistName} (тел: ${contract.specialistPhone})</p>
        <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 12px 0;">
        <p><b>Срок гарантии:</b> <b style="color: #166534; font-size: 12pt;">${warrantyMonths} месяцев</b> (до «${warrantyUntilStr}» включительно).</p>
        <p><b>Условия гарантии:</b></p>
        <ul style="margin: 6px 0; padding-left: 20px; font-size: 9.5pt; color: #334155;">
          <li>Гарантия распространяется на герметичность всех выполненных монтажных стыков (пресс-фитинги, резьбовые соединения, пайки).</li>
          <li>В случае выявления течи или дефекта монтажа Исполнитель обязуется прибыть на объект и устранить неполадку <b>бесплатно</b>.</li>
          <li>Гарантия не действует при механических повреждениях третьими лицами и заводских дефектах приборов, приобретенных Заказчиком.</li>
        </ul>
        <div class="warranty-seal">
          ✓ ГАРАНТИЯ АКТИВИРОВАНА В СИСТЕМЕ «САНТЕХПРО»
        </div>
      </div>
    </div>
  </div>
` : ''}

</body>
</html>`;
}

/**
 * Downloads Word (.doc) with strict UTF-8 Byte Order Mark (\uFEFF)
 * preventing all Cyrillic mojibake (Ð”Ð¾Ð³Ð¾Ð²Ð¾Ñ€) across all Android & iOS apps!
 */
export function downloadContractWordDoc(contract: PlumbingContract, section: 'all' | 'contract' | 'act' | 'warranty' = 'all'): void {
  const htmlContent = generateContractHtmlDocument(contract, section);
  
  // CRITICAL: \uFEFF Byte Order Mark tells Windows and Android Word readers it is UTF-8!
  const blob = new Blob(['\uFEFF', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const cleanNumber = (contract.contractNumber || 'БН').replace(/[^a-zA-Z0-9а-яА-Я._-]/g, '_');
  link.download = `Договор_№_${cleanNumber}.doc`;
  
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    if (link.parentNode) link.parentNode.removeChild(link);
    URL.revokeObjectURL(url);
  }, 600);
}

/**
 * Downloads offline standalone HTML document with embedded styling
 */
export function downloadContractHtmlFile(contract: PlumbingContract): void {
  const htmlContent = generateContractHtmlDocument(contract, 'all');
  const blob = new Blob(['\uFEFF', htmlContent], {
    type: 'text/html;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const cleanNumber = (contract.contractNumber || 'БН').replace(/[^a-zA-Z0-9а-яА-Я._-]/g, '_');
  link.download = `Договор_и_Акт_№_${cleanNumber}.html`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (link.parentNode) link.parentNode.removeChild(link);
    URL.revokeObjectURL(url);
  }, 600);
}

/**
 * Triggers clean, vector print/PDF generation using an offscreen iframe.
 * Compatible with mobile Chrome "Сохранить как PDF" and iOS AirPrint.
 */
export function printContractPdfDocument(contract: PlumbingContract, section: 'all' | 'contract' | 'act' | 'warranty' = 'all'): void {
  const htmlContent = generateContractHtmlDocument(contract, section);

  // Hidden print iframe to prevent whole-app layout deformation
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('title', 'Печать договора');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Give fonts and images time to render before triggering print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 3000);
    }
  }, 350);
}
