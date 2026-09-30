import { Article } from '../types';

/**
 * Maps any plumbing guide / instruction to an authentic, high-quality
 * illustrative photograph corresponding directly to its sanitary/engineering topic.
 */
export const getInstructionImage = (art: { id?: string; title: string; category?: string; coverImage?: string }): string => {
  // If an explicit, updated, or custom coverImage is present:
  if (art && art.coverImage && typeof art.coverImage === 'string') {
    const trimmed = art.coverImage.trim();
    if (trimmed.length > 0) {
      if (
        (trimmed.startsWith('data:') ||
        trimmed.startsWith('/uploads/') ||
        trimmed.startsWith('blob:') ||
        trimmed.startsWith('/') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://')) &&
        !trimmed.includes('images.unsplash.com')
      ) {
        return trimmed;
      }
    }
  }
  return '';
};

export const HANDBOOK_IMAGE_TITLES: Record<string, string> = {};

/**
 * Generates calibrated title
 */
export const generateImageTitleFromTextTitle = (title: string, id?: string): string => {
  if (id && HANDBOOK_IMAGE_TITLES && HANDBOOK_IMAGE_TITLES[id]) {
    return HANDBOOK_IMAGE_TITLES[id];
  }

  let t = title.trim();

  // Strip prefixes
  t = t
    .replace(/^(Справочник|Видеоурок|Пошаговый гайд|Инструкция|Регламент):\s*/i, '')
    .replace(/^Монтаж и крепление\s+/i, 'Монтаж ')
    .replace(/^Установка и подключение\s+/i, 'Установка ')
    .replace(/^Правильная укладка\s+/i, 'Укладка ')
    .replace(/^Диагностика и устранение\s+/i, 'Устранение ')
    .replace(/^Правила работы с\s+/i, 'Работа с ')
    .trim();

  // Strip verbose suffixes
  t = t
    .replace(/:\s*Полная пошаговая технология.*/i, '')
    .replace(/:\s*пошаговый алгоритм.*/i, '')
    .replace(/:\s*пошаговое руководство.*/i, '')
    .replace(/:\s*инженерный регламент.*/i, '')
    .replace(/\s+по ГОСТ и СНиП.*/i, '')
    .trim();

  // Capitalize first letter
  if (t.length > 0) {
    t = t.charAt(0).toUpperCase() + t.slice(1);
  }

  return t;
};

/**
 * Returns the image title for an article, preferring an explicit imageTitle,
 * falling back to the curated dictionary or the dynamic text-to-title generator.
 */
export const getInstructionImageTitle = (art: { id?: string; title: string; category?: string; imageTitle?: string }): string => {
  if (art.imageTitle && art.imageTitle.trim().length > 0) {
    return art.imageTitle.trim();
  }
  return generateImageTitleFromTextTitle(art.title, art.id);
};

/**
 * Backward compatibility alias for article card short titles
 */
export const getInstructionShortTitle = (title: string, id?: string): string => {
  return generateImageTitleFromTextTitle(title, id);
};

/**
 * Generates an SVG Data URL technical blueprint banner rendering the image title directly on the graphic.
 */
export const generateTechnicalSvgBanner = (art: { id?: string; title: string; category?: string; imageTitle?: string }): string => {
  const imageTitle = getInstructionImageTitle(art);
  const category = art.category || 'water';

  const colors: Record<string, { bg: string; accent: string; text: string; label: string }> = {
    water: { bg: '#082f49', accent: '#0284c7', text: '#38bdf8', label: 'ВОДОПРОВОД И ТРУБЫ' },
    fixtures: { bg: '#022c22', accent: '#059669', text: '#34d399', label: 'САНТЕХНИКА И СМЕСИТЕЛИ' },
    heating: { bg: '#451a03', accent: '#d97706', text: '#fbbf24', label: 'ОТОПЛЕНИЕ И РАДИАТОРЫ' },
    appliances: { bg: '#2e1065', accent: '#7c3aed', text: '#c084fc', label: 'ОБОРУДОВАНИЕ И БОЙЛЕРЫ' },
    drainage: { bg: '#0f172a', accent: '#3b82f6', text: '#60a5fa', label: 'КАНАЛИЗАЦИЯ И СЛИВ' },
    tools: { bg: '#1e1b4b', accent: '#4f46e5', text: '#818cf8', label: 'ИНСТРУМЕНТ И МОНТАЖ' },
    emergency: { bg: '#4c0519', accent: '#e11d48', text: '#fb7185', label: 'АВАРИЙНЫЕ РАБОТЫ' },
  };

  const scheme = colors[category] || colors.water;

  const escapeXml = (str: string) => str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });

  const safeTitle = escapeXml(imageTitle);
  const safeLabel = escapeXml(scheme.label);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020617" />
        <stop offset="60%" stop-color="${scheme.bg}" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${scheme.accent}" stop-opacity="0.9" />
        <stop offset="100%" stop-color="${scheme.text}" stop-opacity="0.3" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="450" fill="url(#bg)" />
    <rect width="800" height="450" fill="url(#grid)" />
    
    <path d="M 40 90 L 220 90 L 280 150 L 520 150 L 580 90 L 760 90" fill="none" stroke="${scheme.accent}" stroke-opacity="0.2" stroke-width="2" />
    <path d="M 40 360 L 220 360 L 280 300 L 520 300 L 580 360 L 760 360" fill="none" stroke="${scheme.accent}" stroke-opacity="0.2" stroke-width="2" />
    <circle cx="280" cy="150" r="5" fill="${scheme.accent}" fill-opacity="0.5" />
    <circle cx="520" cy="150" r="5" fill="${scheme.accent}" fill-opacity="0.5" />

    <rect x="50" y="45" width="230" height="30" rx="15" fill="${scheme.accent}" fill-opacity="0.2" stroke="${scheme.accent}" stroke-width="1.2" />
    <text x="68" y="65" fill="${scheme.text}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" letter-spacing="1">${safeLabel}</text>

    <text x="750" y="66" text-anchor="end" fill="#64748b" font-family="monospace" font-size="12" font-weight="600">СП 30.13330 / СТАНДАРТ</text>

    <rect x="50" y="125" width="700" height="190" rx="16" fill="rgba(2, 6, 23, 0.85)" stroke="${scheme.accent}" stroke-opacity="0.35" stroke-width="1.5" />
    <rect x="50" y="125" width="700" height="4" fill="url(#glow)" />
    
    <text x="80" y="170" fill="${scheme.text}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1">ТЕХНИЧЕСКАЯ ИЛЛЮСТРАЦИЯ:</text>
    <text x="80" y="225" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="800">${safeTitle}</text>
    <text x="80" y="275" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="14">Пошаговый инженерный регламент и технологическая карта</text>

    <text x="50" y="410" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="12">Инженерный справочник сантехника • Мастер-Профи</text>
    <text x="750" y="410" text-anchor="end" fill="${scheme.text}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600">ПРОВЕРЕНО ЭКСПЕРТОМ</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
