/**
 * Intelligent Russian Voice & Text Parser for Plumbing Estimates
 * Parses spoken phrases into structured MasterEstimateItem
 * e.g. "труба 20 мм, 5 м" -> { name: "Труба 20 мм", quantity: 5, unit: "м.п.", type: "material", price: 290 }
 * e.g. "штробление бетон 8 метров" -> { name: "Штробление стен (бетон/монолит)", quantity: 8, unit: "м.п.", type: "work", price: 850 }
 */

import { MasterEstimateItem } from '../types';

// Russian number word conversions
const RUSSIAN_NUMBERS: Record<string, number> = {
  'ноль': 0,
  'один': 1,
  'одна': 1,
  'одно': 1,
  'два': 2,
  'две': 2,
  'три': 3,
  'четыре': 4,
  'пять': 5,
  'шесть': 6,
  'семь': 7,
  'восемь': 8,
  'девять': 9,
  'десять': 10,
  'одиннадцать': 11,
  'двенадцать': 12,
  'тринадцать': 13,
  'четырнадцать': 14,
  'пятнадцать': 15,
  'шестнадцать': 16,
  'семнадцать': 17,
  'восемнадцать': 18,
  'девятнадцать': 19,
  'двадцать': 20,
  'тридцать': 30,
  'сорок': 40,
  'пятьдесят': 50,
  'шестьдесят': 60,
  'семьдесят': 70,
  'восемьдесят': 80,
  'девяносто': 90,
  'сто': 100,
  'двести': 200,
  'полтора': 1.5,
  'полторы': 1.5,
};

// Known plumbing work patterns with standard catalog defaults
interface KnownPattern {
  keywords: string[];
  suggestedName: string;
  category: string;
  type: 'work' | 'material';
  defaultUnit: string;
  defaultPrice: number;
}

export const KNOWN_PLUMBING_PATTERNS: KnownPattern[] = [
  // --- ЧЕРНОВЫЕ РАБОТЫ ---
  {
    keywords: ['штроблен', 'штроба', 'штроб'],
    suggestedName: 'Штробление стен под трубы',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'м.п.',
    defaultPrice: 550,
  },
  {
    keywords: ['штроблен', 'бетон'],
    suggestedName: 'Штробление стен (бетон / монолит)',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'м.п.',
    defaultPrice: 850,
  },
  {
    keywords: ['штроблен', 'кирпич'],
    suggestedName: 'Штробление стен (кирпич / пеноблок)',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'м.п.',
    defaultPrice: 450,
  },
  {
    keywords: ['штроблен', 'канализац'],
    suggestedName: 'Штробление под канализацию 50-110 мм',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'м.п.',
    defaultPrice: 950,
  },
  {
    keywords: ['прокладка', 'трасс'],
    suggestedName: 'Прокладка трасс водоснабжения (Rehau/Stout)',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'м.п.',
    defaultPrice: 250,
  },
  {
    keywords: ['разводк', 'точк'],
    suggestedName: 'Разводка труб ХВС/ГВС (водорозетка)',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'точка',
    defaultPrice: 2200,
  },
  {
    keywords: ['разводк', 'канализац'],
    suggestedName: 'Монтаж точки канализации (слив)',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'точка',
    defaultPrice: 1500,
  },
  {
    keywords: ['коллектор', 'узел', 'монтаж'],
    suggestedName: 'Монтаж коллекторного узла (пара гребенок)',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'компл',
    defaultPrice: 4500,
  },
  {
    keywords: ['узел', 'ввод'],
    suggestedName: 'Сборка и монтаж узла ввода ХВС/ГВС с фильтрами и редукторами',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'компл',
    defaultPrice: 7500,
  },
  {
    keywords: ['инсталляц'],
    suggestedName: 'Монтаж инсталляции подвесного унитаза (черновой)',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'шт',
    defaultPrice: 4500,
  },
  {
    keywords: ['трап', 'душев'],
    suggestedName: 'Монтаж душевого трапа с уклоном в пол',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'шт',
    defaultPrice: 4800,
  },
  {
    keywords: ['шумоизоляц', 'стояк'],
    suggestedName: 'Шумоизоляция фанового канализационного стояка',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'компл',
    defaultPrice: 3000,
  },
  {
    keywords: ['опрессовк'],
    suggestedName: 'Опрессовка системы водоснабжения давлением',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'услуга',
    defaultPrice: 3000,
  },
  {
    keywords: ['заделк', 'штроб'],
    suggestedName: 'Заделка штроб и ниш ремонтным раствором',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'м.п.',
    defaultPrice: 350,
  },
  {
    keywords: ['бурен', 'отверсти'],
    suggestedName: 'Алмазное бурение технологических отверстий',
    category: 'Черновые работы',
    type: 'work',
    defaultUnit: 'шт',
    defaultPrice: 2000,
  },
  {
    keywords: ['тепл', 'пол', 'монтаж'],
    suggestedName: 'Монтаж водяного тёплого пола с балансировкой',
    category: 'Отопление и полы',
    type: 'work',
    defaultUnit: 'м²',
    defaultPrice: 650,
  },
  {
    keywords: ['демонтаж'],
    suggestedName: 'Демонтаж старых труб и приборов',
    category: 'Демонтаж',
    type: 'work',
    defaultUnit: 'услуга',
    defaultPrice: 2000,
  },

  // --- ЧЕРНОВЫЕ МАТЕРИАЛЫ ---
  {
    keywords: ['труба', '20', 'мм'],
    suggestedName: 'Труба сшитый полиэтилен PE-Xa Ø20 мм',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'м.п.',
    defaultPrice: 290,
  },
  {
    keywords: ['труба', '16', 'мм'],
    suggestedName: 'Труба сшитый полиэтилен PE-Xa Ø16 мм',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'м.п.',
    defaultPrice: 220,
  },
  {
    keywords: ['труба', '25', 'мм'],
    suggestedName: 'Труба сшитый полиэтилен PE-Xa Ø25 мм',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'м.п.',
    defaultPrice: 420,
  },
  {
    keywords: ['труба', '32', 'мм'],
    suggestedName: 'Труба полипропиленовая PP-R Ø32 мм',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'м.п.',
    defaultPrice: 350,
  },
  {
    keywords: ['труба', 'канализац', '110'],
    suggestedName: 'Труба канализационная Ø110 мм',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'м.п.',
    defaultPrice: 380,
  },
  {
    keywords: ['труба', 'канализац', '50'],
    suggestedName: 'Труба канализационная Ø50 мм',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'м.п.',
    defaultPrice: 220,
  },
  {
    keywords: ['труба', 'канализац', 'бесшум'],
    suggestedName: 'Труба бесшумная канализация Ø110/50 (Ostendorf)',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'м.п.',
    defaultPrice: 850,
  },
  {
    keywords: ['изоляц', 'труб'],
    suggestedName: 'Теплоизоляция для труб (энергофлекс 9 мм)',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'м.п.',
    defaultPrice: 55,
  },
  {
    keywords: ['кран', '1/2'],
    suggestedName: 'Кран шаровый латунный усиленный 1/2" (Valtec/Bugatti)',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'шт',
    defaultPrice: 850,
  },
  {
    keywords: ['кран', '3/4'],
    suggestedName: 'Кран шаровый латунный усиленный 3/4" (Valtec/Bugatti)',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'шт',
    defaultPrice: 1100,
  },
  {
    keywords: ['фильтр', '100'],
    suggestedName: 'Фильтр самопромывной с манометром 100 мкм',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'шт',
    defaultPrice: 4200,
  },
  {
    keywords: ['редуктор', 'давлен'],
    suggestedName: 'Редуктор давления мембранный 1/2" (FAR/Valtec)',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'шт',
    defaultPrice: 3600,
  },
  {
    keywords: ['коллектор', 'выход'],
    suggestedName: 'Коллектор распределительный 3/4" с регулировочными кранами',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'шт',
    defaultPrice: 3800,
  },
  {
    keywords: ['фитинг'],
    suggestedName: 'Комплект аксиальных пресс-фитингов и гильз',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'компл',
    defaultPrice: 2800,
  },
  {
    keywords: ['водорозетк'],
    suggestedName: 'Водорозетка латунная настенная 16×1/2"',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'шт',
    defaultPrice: 480,
  },
  {
    keywords: ['хомут', 'креп'],
    suggestedName: 'Хомуты сантехнические со шпильками и виброгасителями',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'компл',
    defaultPrice: 850,
  },
  {
    keywords: ['заглушк'],
    suggestedName: 'Комплект опрессовочных заглушек 1/2"',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'компл',
    defaultPrice: 450,
  },
  {
    keywords: ['смесь', 'штукатур'],
    suggestedName: 'Сухая смесь / ремонтный состав для заделки штроб',
    category: 'Черновые материалы',
    type: 'material',
    defaultUnit: 'мешок',
    defaultPrice: 480,
  },

  // --- ЧИСТОВЫЕ РАБОТЫ И САНТЕХПРИБОРЫ ---
  {
    keywords: ['смесител', 'установк'],
    suggestedName: 'Установка смесителя (раковина/ванна)',
    category: 'Сантехприборы',
    type: 'work',
    defaultUnit: 'шт',
    defaultPrice: 1500,
  },
  {
    keywords: ['унитаз', 'установк'],
    suggestedName: 'Установка подвесного унитаза на инсталляцию',
    category: 'Сантехприборы',
    type: 'work',
    defaultUnit: 'шт',
    defaultPrice: 2500,
  },
  {
    keywords: ['раковин', 'установк'],
    suggestedName: 'Монтаж раковины / тумбы с подключением сифона',
    category: 'Сантехприборы',
    type: 'work',
    defaultUnit: 'шт',
    defaultPrice: 2500,
  },
  {
    keywords: ['ванн', 'монтаж'],
    suggestedName: 'Монтаж акриловой ванны с герметизацией швов',
    category: 'Сантехприборы',
    type: 'work',
    defaultUnit: 'шт',
    defaultPrice: 4500,
  },
];

export interface ParsedVoiceItemResult {
  rawPhrase: string;
  item: MasterEstimateItem;
  matchedPattern?: KnownPattern;
  confidence: number;
}

/**
 * Normalizes text phrase by converting Russian written numbers, trimming punctuation
 */
function normalizePhrase(rawText: string): string {
  let text = rawText.toLowerCase().replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim();

  // Replace compound Russian numbers (e.g., "двадцать пять" -> 25)
  const words = text.split(' ');
  const replacedWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const nextW = words[i + 1];

    if (w === 'двадцать' && nextW && RUSSIAN_NUMBERS[nextW] && RUSSIAN_NUMBERS[nextW] < 10) {
      replacedWords.push(String(20 + RUSSIAN_NUMBERS[nextW]));
      i++;
      continue;
    }
    if (w === 'тридцать' && nextW && RUSSIAN_NUMBERS[nextW] && RUSSIAN_NUMBERS[nextW] < 10) {
      replacedWords.push(String(30 + RUSSIAN_NUMBERS[nextW]));
      i++;
      continue;
    }
    if (w === 'сорок' && nextW && RUSSIAN_NUMBERS[nextW] && RUSSIAN_NUMBERS[nextW] < 10) {
      replacedWords.push(String(40 + RUSSIAN_NUMBERS[nextW]));
      i++;
      continue;
    }
    if (w === 'пятьдесят' && nextW && RUSSIAN_NUMBERS[nextW] && RUSSIAN_NUMBERS[nextW] < 10) {
      replacedWords.push(String(50 + RUSSIAN_NUMBERS[nextW]));
      i++;
      continue;
    }

    if (RUSSIAN_NUMBERS[w] !== undefined) {
      replacedWords.push(String(RUSSIAN_NUMBERS[w]));
    } else {
      replacedWords.push(w);
    }
  }

  return replacedWords.join(' ');
}

/**
 * Main parser function: takes spoken phrase and turns it into MasterEstimateItem
 */
export function parsePlumbingVoicePhrase(rawPhrase: string): ParsedVoiceItemResult {
  const cleanRaw = rawPhrase.trim();
  const normalized = normalizePhrase(cleanRaw);

  // 1. Extract Unit
  let unit = 'шт';
  let unitMatchStr = '';

  if (/\b(м\.?п\.?|погонных|погон|п\.?м\.?)\b/i.test(normalized)) {
    unit = 'м.п.';
    unitMatchStr = 'м.п.';
  } else if (/\b(метров|метра|метр|м)\b/i.test(normalized)) {
    const isMm = /\b\d+\s*мм\b/i.test(normalized);
    if (!isMm || /\b\d+\s*(?:метров|метра|метр)\b/i.test(normalized) || /\b\d+\s*м\b(?!\w)/i.test(normalized)) {
      unit = 'м.п.';
      unitMatchStr = 'м';
    }
  } else if (/\b(точ(?:ек|ка|ки|ку))\b/i.test(normalized)) {
    unit = 'точка';
    unitMatchStr = 'точка';
  } else if (/\b(компл(?:ект(?:а|ов)?)?)\b/i.test(normalized)) {
    unit = 'компл';
    unitMatchStr = 'компл';
  } else if (/\b(услуг(?:а|и)?)\b/i.test(normalized)) {
    unit = 'услуга';
    unitMatchStr = 'услуга';
  } else if (/\b(меш(?:ок|ка|ков))\b/i.test(normalized)) {
    unit = 'мешок';
    unitMatchStr = 'мешок';
  } else if (/\b(пар(?:а|ы|)?)\b/i.test(normalized)) {
    unit = 'пара';
    unitMatchStr = 'пара';
  } else if (/\b(кв\.?м\.?|м2|квадрат(?:ов|а)?)\b/i.test(normalized)) {
    unit = 'м²';
    unitMatchStr = 'м²';
  } else if (/\b(час(?:а|ов)?)\b/i.test(normalized)) {
    unit = 'час';
    unitMatchStr = 'час';
  }

  // 2. Extract explicit price if dictated (e.g. "по 300 рублей", "цена 500", "по 1500")
  let explicitPrice: number | null = null;
  const priceRegex = /(?:по|цена|стоимость|стоят|рублей|руб)\s*(\d+(?:[.,]\d+)?)/i;
  const priceMatch = normalized.match(priceRegex);
  if (priceMatch) {
    const val = parseFloat(priceMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      explicitPrice = Math.round(val);
    }
  }

  // 3. Extract quantity
  let quantity = 1;

  const numBeforeUnitRegex = /(\d+(?:[.,]\d+)?)\s*(?:м\.?п\.?|метров|метра|метр|м|точек|точки|точка|штук|штуки|штука|шт|комплектов|комплекта|комплект|компл|услуг|услуги|услуга|мешков|мешка|мешок|пар|пары|пара|м2|кв\.?м|квадратов|квадрата|квадрат)(?!\w)/i;
  const matchNumBefore = normalized.match(numBeforeUnitRegex);

  if (matchNumBefore) {
    const q = parseFloat(matchNumBefore[1].replace(',', '.'));
    if (!isNaN(q) && q > 0) {
      quantity = q;
    }
  } else {
    const wordsList = normalized.split(' ');
    for (let i = wordsList.length - 1; i >= 0; i--) {
      const w = wordsList[i];
      const nextW = wordsList[i + 1];

      if (nextW === 'мм' || w.endsWith('мм')) {
        continue;
      }
      const num = parseFloat(w.replace(',', '.'));
      if (!isNaN(num) && num > 0) {
        quantity = num;
        break;
      }
    }
  }

  // 4. Match against Known Patterns
  let bestPattern: KnownPattern | null = null;
  let maxScore = 0;

  for (const pattern of KNOWN_PLUMBING_PATTERNS) {
    let score = 0;
    for (const kw of pattern.keywords) {
      if (normalized.includes(kw)) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestPattern = pattern;
    }
  }

  // 5. Determine Type (work vs material)
  const isWorkWord = /\b(штроб|монтаж|установ|развод|демонтаж|опрессов|бурен|прокладк|заделк|обвязк|врезк|подключ|пайк|сварк)\b/i.test(normalized);
  const isMaterialWord = /\b(труб|кран|коллектор|фильтр|редуктор|фитинг|муфт|угол|уголок|инсталляц|герметик|лен|паст|изоляц|энергофлекс|трап|сифон|шпильк|хомут|крепеж|дюбел|пен|смес|мешок|водорозетк|заглушк)\b/i.test(normalized);

  let type: 'work' | 'material' = 'material';
  if (bestPattern) {
    type = bestPattern.type;
  } else if (isWorkWord) {
    type = 'work';
  } else if (isMaterialWord) {
    type = 'material';
  } else {
    type = unit === 'точка' || unit === 'услуга' || unit === 'час' ? 'work' : 'material';
  }

  // 6. Category
  let category = type === 'work' ? 'Черновые работы' : 'Черновые материалы';
  if (bestPattern) {
    category = bestPattern.category;
    if (unitMatchStr === '' && bestPattern.defaultUnit) {
      unit = bestPattern.defaultUnit;
    }
  }

  // 7. Determine clean Item Name
  let finalName = '';
  if (bestPattern && maxScore >= 4) {
    finalName = bestPattern.suggestedName;
  } else {
    let cleaned = cleanRaw;

    cleaned = cleaned.replace(/(?:по|цена|стоимость|стоят|рублей|руб)\s*\d+(?:[.,]\d+)?\s*(?:рублей|руб)?/gi, '');
    cleaned = cleaned.replace(/[,;]\s*(\d+(?:[.,]\d+)?)\s*(?:м\.?п\.?|метров|метра|метр|м|точек|точки|точка|штук|штуки|штука|шт|комплектов|комплекта|комплект|компл|услуг|услуги|услуга|мешков|мешка|мешок|пар|пары|пара|м2|кв\.?м|квадратов|квадрата|квадрат)\s*$/i, '');
    cleaned = cleaned.replace(/\s+(\d+(?:[.,]\d+)?)\s*(?:м\.?п\.?|метров|метра|метр|м|точек|точки|точка|штук|штуки|штука|шт|комплектов|комплекта|комплект|компл|услуг|услуги|услуга|мешков|мешка|мешок|пар|пары|пара|м2|кв\.?м|квадратов|квадрата|квадрат)\s*$/i, '');
    cleaned = cleaned.trim().replace(/^[,.\s-]+|[,.\s-]+$/g, '');

    if (cleaned.length > 0) {
      finalName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    } else {
      finalName = bestPattern ? bestPattern.suggestedName : (type === 'work' ? 'Сантехническая работа' : 'Расходный материал');
    }
  }

  // 8. Determine Price
  let finalPrice = 1000;
  if (explicitPrice !== null) {
    finalPrice = explicitPrice;
  } else if (bestPattern) {
    finalPrice = bestPattern.defaultPrice;
  } else if (type === 'work') {
    finalPrice = unit === 'м.п.' ? 500 : unit === 'точка' ? 2200 : unit === 'услуга' ? 3000 : 1500;
  } else {
    finalPrice = unit === 'м.п.' ? 280 : unit === 'мешок' ? 480 : unit === 'компл' ? 1800 : 850;
  }

  const total = Math.round(quantity * finalPrice);

  const item: MasterEstimateItem = {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    name: finalName,
    category,
    unit,
    quantity,
    price: finalPrice,
    total,
  };

  return {
    rawPhrase: cleanRaw,
    item,
    matchedPattern: bestPattern || undefined,
    confidence: maxScore > 0 ? 0.9 : 0.7,
  };
}
