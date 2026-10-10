import { Article, ArticleStep } from '../types';

/**
 * Technical CAD colors and themes for sanitary blueprints
 */
const CAD_THEME = {
  bg: '#071326',
  grid: 'rgba(56, 189, 248, 0.07)',
  frame: '#0284c7',
  frameBorder: 'rgba(56, 189, 248, 0.3)',
  primary: '#38bdf8',
  hot: '#f43f5e',
  cold: '#0ea5e9',
  pipe: '#94a3b8',
  brass: '#fbbf24',
  sewer: '#f97316',
  text: '#f8fafc',
  dim: '#94a3b8',
  accent: '#22d3ee',
  success: '#10b981',
  warning: '#fbbf24'
};

const escapeXml = (str: string = ''): string => {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

/**
 * Returns a tailored, detailed CAD SVG vector drawing for an article step
 */
export function generateStepBlueprint(step: ArticleStep, article: Article): string {
  const stepNum = step.number || 1;
  const stepTitle = escapeXml(step.title || `Шаг ${stepNum}`);
  const stepText = escapeXml(step.text || '');
  const artTitle = escapeXml(article.title || '');
  const artCategory = article.category || 'water';

  // Analyze keywords to select the exact visual diagram
  const combined = `${article.title} ${step.title} ${step.text} ${article.category || ''}`.toLowerCase();

  let diagramGraphic = '';

  // 1. ТЕРМОСТАТИЧЕСКИЙ СМЕСИТЕЛЬ (THERMOSTAT SHOWER MIXER)
  if (combined.includes('термостат') || combined.includes('смесител')) {
    if (combined.includes('подвод') || combined.includes('сторон') || combined.includes('гвс') || combined.includes('хвс') || stepNum === 1) {
      diagramGraphic = `
        <!-- Водорозетки ГВС слева и ХВС справа -->
        <g transform="translate(150, 110)">
          <!-- Стена плитка -->
          <rect x="-30" y="-10" width="460" height="180" rx="8" fill="#0b1b36" stroke="#1e3a8a" stroke-dasharray="4 4" />
          <text x="200" y="10" fill="#64748b" font-size="11" font-family="monospace" text-anchor="middle">СТЕКЛО / КАФЕЛЬНАЯ ПЛИТКА (ОСЬ 150 мм)</text>

          <!-- Левая розетка ГВС -->
          <circle cx="80" cy="80" r="34" fill="#1e293b" stroke="${CAD_THEME.hot}" stroke-width="3" />
          <circle cx="80" cy="80" r="16" fill="${CAD_THEME.hot}" fill-opacity="0.25" stroke="${CAD_THEME.hot}" stroke-width="2" />
          <text x="80" y="76" fill="${CAD_THEME.hot}" font-size="12" font-weight="900" font-family="sans-serif" text-anchor="middle">ГВС</text>
          <text x="80" y="93" fill="#fda4af" font-size="9" font-family="monospace" text-anchor="middle">СЛЕВА</text>

          <!-- Труба ГВС снизу -->
          <path d="M 80 170 L 80 114" stroke="${CAD_THEME.hot}" stroke-width="8" stroke-linecap="round" />
          <path d="M 75 140 L 85 140" stroke="#fff" stroke-width="2" />

          <!-- Правая розетка ХВС -->
          <circle cx="320" cy="80" r="34" fill="#1e293b" stroke="${CAD_THEME.cold}" stroke-width="3" />
          <circle cx="320" cy="80" r="16" fill="${CAD_THEME.cold}" fill-opacity="0.25" stroke="${CAD_THEME.cold}" stroke-width="2" />
          <text x="320" y="76" fill="${CAD_THEME.cold}" font-size="12" font-weight="900" font-family="sans-serif" text-anchor="middle">ХВС</text>
          <text x="320" y="93" fill="#bae6fd" font-size="9" font-family="monospace" text-anchor="middle">СПРАВА</text>

          <!-- Труба ХВС снизу -->
          <path d="M 320 170 L 320 114" stroke="${CAD_THEME.cold}" stroke-width="8" stroke-linecap="round" />

          <!-- Размерная линия 150 мм -->
          <line x1="80" y1="35" x2="320" y2="35" stroke="${CAD_THEME.accent}" stroke-width="2" />
          <polygon points="80,35 90,31 90,39" fill="${CAD_THEME.accent}" />
          <polygon points="320,35 310,31 310,39" fill="${CAD_THEME.accent}" />
          <line x1="80" y1="30" x2="80" y2="46" stroke="${CAD_THEME.accent}" stroke-width="1.5" />
          <line x1="320" y1="30" x2="320" y2="46" stroke="${CAD_THEME.accent}" stroke-width="1.5" />
          <rect x="160" y="24" width="80" height="22" rx="4" fill="#071326" stroke="${CAD_THEME.accent}" stroke-width="1" />
          <text x="200" y="39" fill="${CAD_THEME.accent}" font-size="12" font-weight="800" font-family="monospace" text-anchor="middle">150 ± 15 мм</text>

          <!-- Проверка горизонтали уровнем -->
          <rect x="130" y="72" width="140" height="16" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
          <circle cx="200" cy="80" r="5" fill="#22c55e" />
          <line x1="192" y1="80" x2="208" y2="80" stroke="#fff" stroke-width="1" />
          <text x="200" y="104" fill="#94a3b8" font-size="10" font-family="monospace" text-anchor="middle">СТРОГО ПО ГОРИЗОНТУ (УРОВЕНЬ)</text>
        </g>
      `;
    } else if (combined.includes('эксцентрик') || combined.includes('прокладк') || stepNum === 2) {
      diagramGraphic = `
        <!-- Эксцентрики и прокладки-фильтры -->
        <g transform="translate(130, 95)">
          <!-- Стена -->
          <rect x="0" y="10" width="40" height="170" fill="#1e293b" stroke="#334155" />
          <text x="20" y="100" fill="#64748b" font-size="10" font-family="monospace" text-anchor="middle" transform="rotate(-90 20 100)">СТЕНА G 1/2"</text>

          <!-- Эксцентрик латунный -->
          <rect x="40" y="70" width="70" height="40" rx="3" fill="${CAD_THEME.brass}" stroke="#d97706" stroke-width="2" />
          <rect x="110" y="60" width="50" height="60" rx="3" fill="#fef08a" stroke="#d97706" stroke-width="2" />
          <line x1="40" y1="90" x2="160" y2="90" stroke="#b45309" stroke-dasharray="3 3" />
          <text x="95" y="94" fill="#78350f" font-size="11" font-weight="900" font-family="monospace" text-anchor="middle">ЭКСЦЕНТРИК G 3/4"</text>

          <!-- Декоративная чашка -->
          <path d="M 160 45 C 180 45, 190 70, 190 90 C 190 110, 180 135, 160 135 Z" fill="#94a3b8" stroke="#cbd5e1" stroke-width="2" />
          <text x="175" y="150" fill="#cbd5e1" font-size="10" font-family="sans-serif" text-anchor="middle">Отражатель</text>

          <!-- Прокладка с металлической сеткой 100 мкм -->
          <rect x="220" y="65" width="16" height="50" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
          <line x1="228" y1="67" x2="228" y2="113" stroke="#38bdf8" stroke-width="2" stroke-dasharray="2 2" />
          <text x="228" y="55" fill="#38bdf8" font-size="10" font-weight="700" font-family="sans-serif" text-anchor="middle">СЕТКА 100 мкм</text>

          <!-- Гайка смесителя -->
          <rect x="260" y="55" width="80" height="70" rx="6" fill="#475569" stroke="#94a3b8" stroke-width="2" />
          <text x="300" y="95" fill="#f8fafc" font-size="11" font-weight="800" font-family="sans-serif" text-anchor="middle">ГАЙКА 3/4"</text>

          <!-- Выносная стрелка монтажа -->
          <path d="M 360 90 L 440 90" stroke="${CAD_THEME.accent}" stroke-width="3" stroke-linecap="round" />
          <polygon points="440,90 425,84 425,96" fill="${CAD_THEME.accent}" />
          <text x="400" y="78" fill="${CAD_THEME.accent}" font-size="11" font-weight="800" font-family="sans-serif" text-anchor="middle">МОНТАЖ</text>

          <rect x="350" y="115" width="130" height="30" rx="6" fill="#0369a1" fill-opacity="0.25" stroke="#38bdf8" />
          <text x="415" y="134" fill="#38bdf8" font-size="10" font-weight="700" font-family="monospace" text-anchor="middle">ЗАТЯЖКА: 25-30 Н·м</text>
        </g>
      `;
    } else {
      // Шаг 3: Калибровка картриджа 38°C
      diagramGraphic = `
        <!-- Схема калибровки термокартриджа -->
        <g transform="translate(140, 90)">
          <!-- Корпус термостата -->
          <rect x="20" y="40" width="260" height="110" rx="12" fill="#1e293b" stroke="#475569" stroke-width="3" />
          <rect x="20" y="85" width="260" height="20" fill="#334155" />

          <!-- Шкала 38°C со стопором -->
          <circle cx="340" cy="95" r="46" fill="#0f172a" stroke="${CAD_THEME.hot}" stroke-width="3" />
          <circle cx="340" cy="95" r="32" fill="#1e293b" stroke="#64748b" stroke-width="1.5" />
          <text x="340" y="90" fill="#f8fafc" font-size="18" font-weight="900" font-family="monospace" text-anchor="middle">38°C</text>
          <text x="340" y="106" fill="#f43f5e" font-size="9" font-weight="700" font-family="sans-serif" text-anchor="middle">SAFE LOCK</text>

          <!-- Кнопка фиксатор безопасности -->
          <rect x="330" y="38" width="20" height="16" rx="4" fill="${CAD_THEME.hot}" stroke="#fff" stroke-width="1.5" />

          <!-- Электронный термометр с датчиком -->
          <rect x="150" y="165" width="160" height="34" rx="8" fill="#022c22" stroke="#10b981" stroke-width="2" />
          <text x="230" y="187" fill="#34d399" font-size="14" font-weight="900" font-family="monospace" text-anchor="middle">ТЕМП: 38.0°C OK</text>
          <line x1="230" y1="165" x2="230" y2="135" stroke="#10b981" stroke-width="2" stroke-dasharray="3 3" />

          <!-- Шпиндель калибровки шестигранником -->
          <circle cx="100" cy="95" r="14" fill="${CAD_THEME.brass}" stroke="#b45309" stroke-width="2" />
          <rect x="96" y="91" width="8" height="8" fill="#78350f" />
          <text x="100" y="130" fill="#fbbf24" font-size="10" font-weight="700" font-family="sans-serif" text-anchor="middle">Шпиндель 2 мм</text>
        </g>
      `;
    }
  }

  // 2. МОНТАЖ ТРУБ ПНД (HDPE PIPE COMPRESSION FITTINGS)
  else if (combined.includes('пнд') || combined.includes('компрессион')) {
    if (combined.includes('фаск') || combined.includes('зачист') || combined.includes('рез') || stepNum === 1) {
      diagramGraphic = `
        <!-- Подготовка торца трубы ПНД: рез 90 и фаска 15 -->
        <g transform="translate(130, 95)">
          <!-- Труба ПНД черная с синей полосой -->
          <rect x="40" y="60" width="280" height="70" rx="4" fill="#020617" stroke="#334155" stroke-width="3" />
          <rect x="40" y="90" width="280" height="10" fill="#0284c7" />
          <text x="180" y="100" fill="#fff" font-size="9" font-weight="800" font-family="monospace" text-anchor="middle">ПНД ПЭ-100 SDR 11 PN16</text>

          <!-- Снятая фаска 15° -->
          <path d="M 320 60 L 338 72 L 338 118 L 320 130 Z" fill="#1e293b" stroke="${CAD_THEME.accent}" stroke-width="2.5" />
          <text x="360" y="98" fill="${CAD_THEME.accent}" font-size="12" font-weight="900" font-family="monospace">ФАСКА 15°</text>

          <!-- Линия разметки глубины захода в фитинг -->
          <line x1="260" y1="45" x2="260" y2="145" stroke="${CAD_THEME.hot}" stroke-width="2.5" stroke-dasharray="4 4" />
          <text x="260" y="38" fill="${CAD_THEME.hot}" font-size="11" font-weight="800" font-family="sans-serif" text-anchor="middle">МЕТКА ГЛУБИНЫ (L)</text>

          <!-- Размер L = 60-70 мм -->
          <line x1="260" y1="145" x2="338" y2="145" stroke="${CAD_THEME.hot}" stroke-width="2" />
          <polygon points="260,145 270,141 270,149" fill="${CAD_THEME.hot}" />
          <polygon points="338,145 328,141 328,149" fill="${CAD_THEME.hot}" />
          <text x="300" y="162" fill="${CAD_THEME.hot}" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">L = 65 мм</text>
        </g>
      `;
    } else {
      diagramGraphic = `
        <!-- Взрыв-схема компрессионного фитинга ПНД -->
        <g transform="translate(80, 85)">
          <!-- 1. Зажимная синяя гайка -->
          <rect x="30" y="50" width="60" height="90" rx="8" fill="#1d4ed8" stroke="#3b82f6" stroke-width="2" />
          <text x="60" y="100" fill="#fff" font-size="11" font-weight="900" font-family="sans-serif" text-anchor="middle">ГАЙКА</text>
          <text x="60" y="160" fill="#94a3b8" font-size="10" font-family="monospace" text-anchor="middle">1. Зажим</text>

          <!-- 2. Цанговое кольцо белое -->
          <rect x="120" y="60" width="35" height="70" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
          <line x1="137" y1="60" x2="137" y2="130" stroke="#0284c7" stroke-width="2" stroke-dasharray="4 2" />
          <text x="137" y="100" fill="#0f172a" font-size="9" font-weight="800" font-family="sans-serif" text-anchor="middle">ЦАНГА</text>
          <text x="137" y="160" fill="#94a3b8" font-size="10" font-family="monospace" text-anchor="middle">2. Захват</text>

          <!-- 3. Упорная втулка -->
          <rect x="180" y="65" width="30" height="60" rx="4" fill="#334155" stroke="#64748b" stroke-width="2" />
          <text x="195" y="100" fill="#fff" font-size="8" font-weight="700" font-family="sans-serif" text-anchor="middle">ВТУЛКА</text>
          <text x="195" y="160" fill="#94a3b8" font-size="10" font-family="monospace" text-anchor="middle">3. Упор</text>

          <!-- 4. Уплотнительное кольцо NBR черное -->
          <circle cx="245" cy="95" r="26" fill="#020617" stroke="#22d3ee" stroke-width="4" />
          <circle cx="245" cy="95" r="16" fill="#071326" />
          <text x="245" y="100" fill="#22d3ee" font-size="8" font-weight="900" font-family="sans-serif" text-anchor="middle">O-RING</text>
          <text x="245" y="160" fill="#94a3b8" font-size="10" font-family="monospace" text-anchor="middle">4. Резина</text>

          <!-- 5. Корпус фитинга с упором -->
          <rect x="300" y="45" width="160" height="100" rx="8" fill="#0f172a" stroke="#1d4ed8" stroke-width="3" />
          <line x1="380" y1="45" x2="380" y2="145" stroke="#ef4444" stroke-width="3" stroke-dasharray="4 4" />
          <text x="350" y="95" fill="#f8fafc" font-size="11" font-weight="800" font-family="sans-serif" text-anchor="middle">КОРПУС</text>
          <text x="380" y="160" fill="#ef4444" font-size="10" font-weight="700" font-family="monospace" text-anchor="middle">5. Упор трубы</text>

          <!-- Стрелка вставки трубы -->
          <path d="M 520 95 L 430 95" stroke="${CAD_THEME.accent}" stroke-width="4" stroke-linecap="round" />
          <polygon points="430,95 445,88 445,102" fill="${CAD_THEME.accent}" />
          <text x="500" y="80" fill="${CAD_THEME.accent}" font-size="11" font-weight="900" font-family="sans-serif">ТРУБА ПНД</text>
        </g>
      `;
    }
  }

  // 3. ПОЛИПРОПИЛЕН / ПАЙКА (PPR SOLDERING)
  else if (combined.includes('ппр') || combined.includes('пайк') || combined.includes('сварк')) {
    diagramGraphic = `
      <!-- Технологическая схема раструбной сварки ППР -->
      <g transform="translate(110, 85)">
        <!-- Сварочный нагреватель (утюг 260°C) -->
        <rect x="230" y="30" width="40" height="150" rx="6" fill="#f43f5e" stroke="#ffe4e6" stroke-width="2" />
        <text x="250" y="105" fill="#fff" font-size="13" font-weight="900" font-family="monospace" text-anchor="middle" transform="rotate(-90 250 105)">260 °C</text>

        <!-- Дорн (насадка для фитинга) слева -->
        <rect x="170" y="70" width="60" height="70" rx="4" fill="#334155" stroke="#64748b" stroke-width="2" />
        <text x="200" y="110" fill="#38bdf8" font-size="9" font-weight="700" font-family="sans-serif" text-anchor="middle">Дорн</text>

        <!-- Гильза (насадка для трубы) справа -->
        <rect x="270" y="70" width="60" height="70" rx="4" fill="#334155" stroke="#64748b" stroke-width="2" />
        <text x="300" y="110" fill="#38bdf8" font-size="9" font-weight="700" font-family="sans-serif" text-anchor="middle">Гильза</text>

        <!-- Фитинг ППР навстречу дорну -->
        <rect x="60" y="60" width="90" height="90" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="3" />
        <text x="105" y="110" fill="#0f172a" font-size="12" font-weight="900" font-family="sans-serif" text-anchor="middle">ФИТИНГ</text>
        <path d="M 60 45 L 140 45" stroke="${CAD_THEME.accent}" stroke-width="2.5" />
        <polygon points="140,45 130,40 130,50" fill="${CAD_THEME.accent}" />

        <!-- Труба ППР навстречу гильзе -->
        <rect x="350" y="75" width="140" height="60" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="3" />
        <text x="420" y="110" fill="#0f172a" font-size="12" font-weight="900" font-family="sans-serif" text-anchor="middle">ТРУБА ППР</text>
        <!-- Метка карандашом 15 мм -->
        <line x1="375" y1="75" x2="375" y2="135" stroke="#ef4444" stroke-width="3" />
        <text x="375" y="65" fill="#ef4444" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">15 мм</text>

        <!-- Тайминг: 5 сек нагрев / 4 сек сопряжение -->
        <rect x="150" y="190" width="220" height="30" rx="6" fill="#0f172a" stroke="#22d3ee" stroke-width="1.5" />
        <text x="260" y="210" fill="#22d3ee" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">ТАЙМИНГ: 5с НАГРЕВ / 4с СБОРКА</text>
      </g>
    `;
  }

  // 4. СШИТЫЙ ПОЛИЭТИЛЕН PEX / АКСИАЛЬНАЯ НАДВИЖКА
  else if (combined.includes('pex') || combined.includes('аксиал') || combined.includes('гильз')) {
    diagramGraphic = `
      <!-- Технологическая схема аксиальной запрессовки PEX-A -->
      <g transform="translate(100, 85)">
        <!-- Труба PEX с надетой гильзой -->
        <rect x="50" y="70" width="240" height="60" rx="4" fill="#cbd5e1" stroke="#475569" stroke-width="2.5" />
        <text x="140" y="105" fill="#0f172a" font-size="12" font-weight="800" font-family="sans-serif" text-anchor="middle">ТРУБА PEX-A</text>

        <!-- Надвижная латунная гильза -->
        <rect x="90" y="60" width="60" height="80" rx="6" fill="${CAD_THEME.brass}" stroke="#d97706" stroke-width="3" />
        <text x="120" y="105" fill="#78350f" font-size="11" font-weight="900" font-family="sans-serif" text-anchor="middle">ГИЛЬЗА</text>

        <!-- Расширенный конец трубы экспандером -->
        <path d="M 290 70 L 330 55 L 330 145 L 290 130 Z" fill="#e2e8f0" stroke="#475569" stroke-width="2" />
        <text x="310" y="45" fill="#38bdf8" font-size="10" font-weight="700" font-family="sans-serif" text-anchor="middle">Расширение</text>

        <!-- Штуцер фитинга с «елочкой» -->
        <rect x="330" y="65" width="120" height="70" rx="4" fill="${CAD_THEME.brass}" stroke="#b45309" stroke-width="3" />
        <line x1="360" y1="65" x2="360" y2="135" stroke="#78350f" stroke-width="3" />
        <line x1="390" y1="65" x2="390" y2="135" stroke="#78350f" stroke-width="3" />
        <text x="390" y="105" fill="#78350f" font-size="11" font-weight="900" font-family="sans-serif" text-anchor="middle">ФИТИНГ</text>

        <!-- Стрелка надвижки гильзы прессом -->
        <path d="M 120 165 L 300 165" stroke="${CAD_THEME.hot}" stroke-width="4" stroke-linecap="round" />
        <polygon points="300,165 285,158 285,172" fill="${CAD_THEME.hot}" />
        <text x="210" y="185" fill="${CAD_THEME.hot}" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">ХОД ПРЕССА ДО УПОРА</text>
      </g>
    `;
  }

  // 5. ИНСТАЛЛЯЦИЯ ПОДВЕСНОГО УНИТАЗА
  else if (combined.includes('инсталляц') || combined.includes('рама') || combined.includes('geberit')) {
    diagramGraphic = `
      <!-- Чертеж силовой рамы инсталляции с ключевыми отметками -->
      <g transform="translate(160, 65)">
        <!-- Стальная рама инсталляции -->
        <rect x="50" y="20" width="220" height="230" rx="8" fill="none" stroke="#0284c7" stroke-width="6" />
        <rect x="70" y="40" width="180" height="70" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
        <text x="160" y="80" fill="#38bdf8" font-size="13" font-weight="900" font-family="monospace" text-anchor="middle">БАЧОК 3/6 Л</text>

        <!-- Шпильки подвеса чаши 180 / 230 мм -->
        <circle cx="110" cy="170" r="7" fill="${CAD_THEME.brass}" stroke="#fff" stroke-width="2" />
        <circle cx="210" cy="170" r="7" fill="${CAD_THEME.brass}" stroke="#fff" stroke-width="2" />
        <line x1="110" y1="170" x2="210" y2="170" stroke="${CAD_THEME.accent}" stroke-width="2" stroke-dasharray="3 3" />
        <text x="160" y="162" fill="${CAD_THEME.accent}" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">180 / 230 мм</text>

        <!-- Фановый отвод 90/110 мм -->
        <circle cx="160" cy="205" r="22" fill="#020617" stroke="#f97316" stroke-width="4" />
        <text x="160" y="210" fill="#f97316" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">D110</text>

        <!-- Репер чистового пола +1.00 м -->
        <line x1="10" y1="70" x2="310" y2="70" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 4" />
        <text x="320" y="74" fill="#ef4444" font-size="12" font-weight="900" font-family="monospace">+1.00 МЕТР</text>

        <!-- Чистовой пол отметка 0.00 -->
        <line x1="10" y1="250" x2="310" y2="250" stroke="#22c55e" stroke-width="3" />
        <text x="320" y="254" fill="#22c55e" font-size="12" font-weight="900" font-family="monospace">0.00 (ПОЛ)</text>

        <!-- Высота чаши 400 мм -->
        <text x="320" y="174" fill="#38bdf8" font-size="11" font-weight="800" font-family="monospace">H = 400 мм</text>
      </g>
    `;
  }

  // 6. УНИВЕРСАЛЬНЫЙ ИНЖЕНЕРНЫЙ ЧЕРТЁЖ ДЛЯ ДРУГИХ РАБОТ
  else {
    diagramGraphic = `
      <!-- Инженерная принципиальная схема шага -->
      <g transform="translate(120, 80)">
        <!-- Основной функциональный блок -->
        <rect x="40" y="40" width="360" height="150" rx="12" fill="#0f172a" stroke="#0284c7" stroke-width="2.5" />
        
        <!-- Линии технологической разметки -->
        <line x1="40" y1="90" x2="400" y2="90" stroke="#1e293b" stroke-width="2" />
        <line x1="40" y1="140" x2="400" y2="140" stroke="#1e293b" stroke-width="2" />
        <line x1="160" y1="40" x2="160" y2="190" stroke="#1e293b" stroke-width="2" />
        <line x1="280" y1="40" x2="280" y2="190" stroke="#1e293b" stroke-width="2" />

        <!-- Индикатор выполнения узла -->
        <circle cx="100" cy="115" r="28" fill="#0369a1" fill-opacity="0.3" stroke="#38bdf8" stroke-width="3" />
        <text x="100" y="122" fill="#38bdf8" font-size="18" font-weight="900" font-family="monospace" text-anchor="middle">№${stepNum}</text>

        <!-- Стрелки движения и сборки -->
        <path d="M 170 115 L 250 115" stroke="${CAD_THEME.accent}" stroke-width="4" stroke-linecap="round" />
        <polygon points="250,115 238,108 238,122" fill="${CAD_THEME.accent}" />

        <rect x="290" y="85" width="90" height="60" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5" />
        <text x="335" y="112" fill="#10b981" font-size="11" font-weight="900" font-family="sans-serif" text-anchor="middle">ТЕСТ / ОК</text>
        <text x="335" y="130" fill="#94a3b8" font-size="9" font-family="monospace" text-anchor="middle">СП 30.13330</text>
      </g>
    `;
  }

  // Construct complete SVG Blueprint
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 380" width="760" height="380">
    <defs>
      <!-- CAD Grid background -->
      <pattern id="cadGridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${CAD_THEME.grid}" stroke-width="1"/>
      </pattern>
      <pattern id="cadGridBig" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="url(#cadGridSmall)"/>
        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(56, 189, 248, 0.16)" stroke-width="1.5"/>
      </pattern>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0369a1" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
    </defs>

    <!-- Blueprint Canvas Background -->
    <rect width="760" height="380" fill="${CAD_THEME.bg}" />
    <rect width="760" height="380" fill="url(#cadGridBig)" />

    <!-- Outer CAD Border -->
    <rect x="12" y="12" width="736" height="356" fill="none" stroke="${CAD_THEME.frameBorder}" stroke-width="2" rx="12" />
    <rect x="18" y="18" width="724" height="344" fill="none" stroke="rgba(56, 189, 248, 0.12)" stroke-width="1" rx="8" />

    <!-- Top Technical Header -->
    <rect x="25" y="25" width="710" height="42" rx="8" fill="#0f172a" stroke="#1e3a8a" stroke-width="1.5" />
    <circle cx="45" cy="46" r="6" fill="#38bdf8" />
    <text x="62" y="50" fill="#38bdf8" font-size="12" font-weight="900" font-family="system-ui, sans-serif" letter-spacing="1">ТЕХНИЧЕСКИЙ ЧЕРТЁЖ • ШАГ ${stepNum}</text>
    
    <rect x="520" y="32" width="205" height="28" rx="6" fill="#0369a1" fill-opacity="0.3" stroke="#0284c7" />
    <text x="622" y="50" fill="#e0f2fe" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">СП 30.13330 • СТАНДАРТ</text>

    <!-- Specific Diagram Graphic -->
    ${diagramGraphic}

    <!-- Bottom Engineering Stamp / Annotation Bar -->
    <rect x="25" y="310" width="710" height="44" rx="8" fill="#091427" stroke="#1e3a8a" stroke-width="1.5" />
    <text x="42" y="337" fill="#f8fafc" font-size="12" font-weight="800" font-family="system-ui, sans-serif">${stepTitle}</text>
    <text x="720" y="337" fill="#38bdf8" font-size="10" font-weight="800" font-family="monospace" text-anchor="end">САНТЕХПРО • ТЕХНОЛОГИЧЕСКАЯ КАРТА</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
