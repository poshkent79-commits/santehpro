import { Article } from '../types';

const OFFLINE_ARTICLES_KEY = 'santehpro_offline_articles';
const OFFLINE_EVENT_NAME = 'santehpro_offline_articles_updated';

/**
 * Get list of articles saved on the user's device for offline reading.
 * Persists across application updates, browser restarts, and offline sessions.
 */
export function getOfflineArticles(): Article[] {
  try {
    const raw = localStorage.getItem(OFFLINE_ARTICLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read offline articles from localStorage:', err);
    return [];
  }
}

/**
 * Check if a specific article is currently saved offline on this device.
 */
export function isArticleSavedForOffline(articleId: string): boolean {
  if (!articleId) return false;
  const current = getOfflineArticles();
  return current.some((a) => a.id === articleId);
}

/**
 * Save an entire step-by-step guide / article onto the user's device for offline access.
 */
export function saveArticleForOffline(article: Article): boolean {
  try {
    const current = getOfflineArticles();
    const filtered = current.filter((a) => a.id !== article.id);
    const updated = [article, ...filtered];
    localStorage.setItem(OFFLINE_ARTICLES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(OFFLINE_EVENT_NAME, { detail: { articleId: article.id, saved: true } }));
    return true;
  } catch (err) {
    console.error('Failed to save article offline:', err);
    return false;
  }
}

/**
 * Remove an article from offline storage on this device.
 */
export function removeArticleFromOffline(articleId: string): boolean {
  try {
    const current = getOfflineArticles();
    const updated = current.filter((a) => a.id !== articleId);
    localStorage.setItem(OFFLINE_ARTICLES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(OFFLINE_EVENT_NAME, { detail: { articleId, saved: false } }));
    return true;
  } catch (err) {
    console.error('Failed to remove article from offline storage:', err);
    return false;
  }
}

/**
 * Export a step-by-step instruction as a self-contained offline HTML file
 * with clean styling, checklists, and illustrations so the user can keep it forever
 * or print it out at the installation site.
 */
export function exportArticleAsHtml(article: Article): void {
  try {
    const safeTitle = (article.title || 'Инструкция').replace(/[/\\?%*:|"<>]/g, '_');
    const filename = `СантехПро_Инструкция_${safeTitle}.html`;

    const stepsHtml = (article.steps || [])
      .map(
        (st, idx) => `
      <div class="step-card">
        <div class="step-header">
          <span class="step-badge">Этап ${idx + 1}</span>
          <h3 class="step-title">${st.title || `Шаг ${idx + 1}`}</h3>
        </div>
        <p class="step-text">${st.text || ''}</p>
        ${
          st.imageUrl
            ? `<div class="step-image-wrap"><img src="${st.imageUrl}" alt="${st.title}" class="step-image"/></div>`
            : ''
        }
        ${
          st.warning
            ? `<div class="step-box warning-box"><strong>⚠️ Внимание:</strong> ${st.warning}</div>`
            : ''
        }
        ${
          st.tip
            ? `<div class="step-box tip-box"><strong>💡 Совет мастера:</strong> ${st.tip}</div>`
            : ''
        }
      </div>`
      )
      .join('\n');

    const toolsHtml = (article.toolsRequired || [])
      .map((t) => `<li class="tool-item">🔧 ${t}</li>`)
      .join('\n');

    const materialsHtml = (article.materialsRequired || [])
      .map((m) => `<li class="material-item">📦 ${m}</li>`)
      .join('\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} — СантехПро</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.6;
      padding: 24px 16px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      background: #e0f2fe;
      color: #0284c7;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      line-height: 1.3;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #64748b;
      margin-top: 12px;
    }
    .desc {
      font-size: 15px;
      color: #334155;
      margin: 20px 0;
      line-height: 1.6;
    }
    .requirements-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 32px;
    }
    @media (max-width: 600px) {
      .requirements-grid { grid-template-columns: 1fr; }
    }
    .req-card {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .req-card h4 {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #0f172a;
    }
    .req-card ul {
      list-style: none;
      font-size: 13px;
      color: #334155;
    }
    .req-card li { margin-bottom: 4px; }
    .step-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .step-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .step-badge {
      background: #0284c7;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
    }
    .step-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    .step-text {
      font-size: 14px;
      color: #334155;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .step-image-wrap {
      margin: 12px 0;
      border-radius: 12px;
      overflow: hidden;
      max-height: 380px;
      background: #000;
    }
    .step-image {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
    }
    .step-box {
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      margin-top: 10px;
      line-height: 1.5;
    }
    .warning-box {
      background: #fff1f2;
      border: 1px solid #fecdd3;
      color: #9f1239;
    }
    .tip-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">СантехПро • Офлайн инструкция</span>
      <h1>${article.title}</h1>
      <div class="meta">
        <span>⏱️ Время: ${article.timeEst || '20 мин'}</span>
        <span>⚡ Сложность: ${article.difficulty || 'Новичок'}</span>
        <span>👤 Автор: ${article.author || 'Достонджон Туйчиев'}</span>
      </div>
    </div>

    ${article.description ? `<p class="desc">${article.description}</p>` : ''}

    ${
      toolsHtml || materialsHtml
        ? `<div class="requirements-grid">
            ${
              toolsHtml
                ? `<div class="req-card"><h4>Необходимый инструмент:</h4><ul>${toolsHtml}</ul></div>`
                : ''
            }
            ${
              materialsHtml
                ? `<div class="req-card"><h4>Материалы и расходники:</h4><ul>${materialsHtml}</ul></div>`
                : ''
            }
          </div>`
        : ''
    }

    <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 16px;">Пошаговое руководство:</h2>
    <div class="steps-container">
      ${stepsHtml || '<p>Инструкция не содержит текстовых шагов.</p>'}
    </div>

    <div class="footer">
      Сохранено из мобильного приложения «СантехПро». Материал доступен офлайн без интернета.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export article as HTML:', err);
  }
}
