// Shared Contract & Estimate Works Data, Turnkey Packages and Smart Catalog

export interface PresetPackage {
  name: string;
  icon: string;
  title: string;
  works: string;
  price: number;
}

export interface WorkCatalogCategory {
  category: string;
  icon: string;
  items: string[];
}

// Complete turnkey work packages (unified with contracts)
export const PRESET_PACKAGES: PresetPackage[] = [
  {
    name: 'Санузел под ключ',
    icon: '🚿',
    title: 'Комплексный монтаж водоснабжения и канализации санузла под ключ',
    works:
      '1. Демонтаж старых труб, перегородок и сантехприборов\n2. Сборка распределительного коллекторного узла (Far, редукторы давления, фильтры 100 мкм, обратные клапаны)\n3. Разводка труб холодного и горячего водоснабжения (сшитый полиэтилен Rehau Rautitan)\n4. Монтаж бесшумной канализации с соблюдением нормативных уклонов\n5. Установка и крепление инсталляции подвесного унитаза\n6. Опрессовка смонтированной системы избыточным гидростатическим давлением 10 бар\n7. Установка и подключение чистовой сантехники (смесители, ванна, гигиенический душ, раковина)',
    price: 45000,
  },
  {
    name: 'Разводка Rehau + коллекторы',
    icon: '🔧',
    title: 'Монтаж коллекторного узла ввода и труб водоснабжения Rehau',
    works:
      '1. Монтаж вводных шаровых кранов и датчиков системы защиты от протечек\n2. Установка фильтров тонкой очистки и редукторов давления с манометрами\n3. Сборка распределительных коллекторов на ХВС и ГВС\n4. Лучевая прокладка труб сшитого полиэтилена Rehau к точкам водоразбора\n5. Гидравлические испытания (опрессовка) давлением 10 бар',
    price: 32000,
  },
  {
    name: 'Замена стояков и канализации',
    icon: '🚽',
    title: 'Замена общедомовых стояков водоснабжения и фановой канализации',
    works:
      '1. Демонтаж старого чугунного фанового стояка и стальных водопроводных труб\n2. Проход перекрытий и врезка в стояки соседей сверху и снизу\n3. Монтаж шумопоглощающего канализационного стояка с компенсационным патрубком\n4. Монтаж новых стояков ГВС и ХВС с установкой вводных кранов и байпаса полотенцесушителя\n5. Проверка стыков на герметичность под давлением',
    price: 18000,
  },
  {
    name: 'Отопление и радиаторы',
    icon: '♨️',
    title: 'Замена и монтаж радиаторов отопления',
    works:
      '1. Демонтаж старых конвекторов/чугунных радиаторов отопления\n2. Нарезка резьбы/сварка и установка терморегулирующей арматуры\n3. Навеска и выравнивание новых биметаллических радиаторов по лазерному уровню\n4. Подключение запорных кранов и кранов Маевского для спуска воздуха\n5. Опрессовка смонтированных радиаторов избыточным давлением',
    price: 15000,
  },
  {
    name: 'Чистовая сантехника',
    icon: '🛁',
    title: 'Установка и подключение чистовой сантехники',
    works:
      '1. Сборка и установка ванны с обвязкой сифоном и выставлением по уровню\n2. Монтаж подвесной тумбы, раковины и подключение смесителя\n3. Установка унитаза с подключением к фановой трубе и регулировкой арматуры бачка\n4. Монтаж душевой стойки / тропического душа и гигиенического душа\n5. Подключение стиральной машины и проверка всех узлов на отсутствие подтёков',
    price: 16000,
  },
];

// Quick-add popular work items (1-click chips)
export const POPULAR_WORK_CHIPS: string[] = [
  'Демонтаж старых труб и приборов',
  'Сборка коллекторного узла Far с фильтрами',
  'Разводка труб Rehau (сшитый полиэтилен)',
  'Опрессовка системы избыточным давлением 10 бар',
  'Монтаж инсталляции подвесного унитаза',
  'Монтаж шумопоглощающей канализации',
  'Установка системы защиты от протечек Neptun',
  'Установка и подключение ванны и смесителей',
  'Монтаж водонагревателя (бойлера)',
  'Установка фильтра обратного осмоса',
  'Монтаж душевого трапа с гидроизоляцией',
  'Установка полотенцесушителя',
];

// Interactive Plumbing Work Catalog organized by categories
export const WORK_CATALOG: WorkCatalogCategory[] = [
  {
    category: 'Водоснабжение и гребенки',
    icon: '🚿',
    items: [
      'Монтаж распределительного коллекторного узла Far с фильтрами тонкой очистки и редукторами давления',
      'Разводка труб холодного и горячего водоснабжения (сшитый полиэтилен Rehau / Tece)',
      'Монтаж системы защиты от протечек воды с автоматическими кранами (Neptun / Аквасторож)',
      'Опрессовка смонтированной системы избыточным гидростатическим давлением 10 бар',
      'Установка магистральных фильтров тонкой очистки Big Blue (10/20 дюймов)',
      'Установка и подключение накопительного / проточного водонагревателя (бойлера) с группой безопасности',
      'Монтаж гасителей гидроударов Caleffi и обратных клапанов',
      'Штробление стен под трубы водоснабжения и канализации с пылесосом',
    ],
  },
  {
    category: 'Канализация и инсталляции',
    icon: '🚽',
    items: [
      'Монтаж и надёжное крепление инсталляции подвесного унитаза с регулировкой высоты',
      'Монтаж шумопоглощающей канализации (Ostendorf Skolan / Rehau Raupiano)',
      'Замена чугунного общедомового стояка канализации на шумопоглощающий пластик',
      'Монтаж трапа душевого поддона с гидроизоляцией и нормативным уклоном',
      'Установка обратного канализационного клапана 110 мм против подтопления',
      'Подключение инсталляции унитаза и биде к фановой трубе',
    ],
  },
  {
    category: 'Чистовая сантехника и приборы',
    icon: '🛁',
    items: [
      'Сборка, выставление по уровню и герметизация ванны (акрил / чугун / искусственный камень)',
      'Монтаж подвесной тумбы, раковины и подключение сифона',
      'Установка смесителя настенного / врезного / скрытого монтажа (iBox)',
      'Монтаж гигиенического душа со встроенным термостатическим смесителем',
      'Монтаж душевой стойки / тропического душа',
      'Установка подвесного унитаза и регулировка двухрежимной клавиши смыва',
      'Установка и подключение полотенцесушителя (электрического / водяного)',
      'Установка системы очистки питьевой воды (обратный осмос с отдельным краном)',
      'Подключение стиральной и сушильной машин с сифоном сухого затвора',
    ],
  },
  {
    category: 'Отопление и радиаторы',
    icon: '♨️',
    items: [
      'Монтаж и навеска биметаллических / панельных радиаторов отопления по лазерному уровню',
      'Установка терморегулирующих вентилей Oventrop / Danfoss и запорных кранов',
      'Нарезка резьбы на стояках отопления и монтаж байпаса',
      'Монтаж контуров водяного тёплого пола с коллекторной группой и насосно-смесительным узлом',
      'Опрессовка системы отопления давлением',
    ],
  },
  {
    category: 'Демонтажные и подготовительные работы',
    icon: '🔨',
    items: [
      'Демонтаж старых чугунных и стальных труб водоснабжения и канализации',
      'Демонтаж старых сантехприборов (ванны, унитаза, раковины, смесителей)',
      'Демонтаж сантехнической кабины / коробов из ГКЛ',
      'Упаковка и вынос строительного мусора',
    ],
  },
];

// Reference standard pricing and units for services/works
export const STANDARD_WORK_RATES: { pattern: RegExp; price: number; unit: string; category: string }[] = [
  { pattern: /инсталляци/i, price: 4500, unit: 'шт', category: 'Канализация и инсталляции' },
  { pattern: /ванн/i, price: 4500, unit: 'шт', category: 'Чистовая сантехника' },
  { pattern: /смесител/i, price: 1500, unit: 'шт', category: 'Чистовая сантехника' },
  { pattern: /душев.*трап|трап/i, price: 4800, unit: 'шт', category: 'Канализация и инсталляции' },
  { pattern: /гигиеническ.*душ/i, price: 2500, unit: 'шт', category: 'Чистовая сантехника' },
  { pattern: /душ.*стойк|тропическ/i, price: 2800, unit: 'шт', category: 'Чистовая сантехника' },
  { pattern: /раковин|умывальник|тумб/i, price: 2500, unit: 'шт', category: 'Чистовая сантехника' },
  { pattern: /унитаз/i, price: 2500, unit: 'шт', category: 'Чистовая сантехника' },
  { pattern: /полотенцесушител/i, price: 2800, unit: 'шт', category: 'Чистовая сантехника' },
  { pattern: /водонагреват|бойлер/i, price: 3800, unit: 'шт', category: 'Водоснабжение' },
  { pattern: /фильтр.*осмос/i, price: 2200, unit: 'компл', category: 'Водоснабжение' },
  { pattern: /разводк.*труб|прокладк.*труб/i, price: 2500, unit: 'точка', category: 'Водоснабжение' },
  { pattern: /коллектор.*узел|гребенк/i, price: 4500, unit: 'компл', category: 'Водоснабжение' },
  { pattern: /защит.*протечек|нептун|аквасторож/i, price: 4000, unit: 'компл', category: 'Водоснабжение' },
  { pattern: /опрессовк/i, price: 3000, unit: 'услуга', category: 'Испытания и пусконаладка' },
  { pattern: /штроблен/i, price: 600, unit: 'м.п.', category: 'Подготовительные работы' },
  { pattern: /демонтаж.*труб/i, price: 500, unit: 'м.п.', category: 'Демонтаж' },
  { pattern: /демонтаж/i, price: 1000, unit: 'шт', category: 'Демонтаж' },
  { pattern: /радиатор|конвектор/i, price: 3500, unit: 'шт', category: 'Отопление' },
  { pattern: /тепл.*пол/i, price: 650, unit: 'м²', category: 'Отопление' },
  { pattern: /стояк.*канализац/i, price: 4500, unit: 'стояк', category: 'Канализация' },
  { pattern: /стояк.*вс|стояк.*гвс/i, price: 3800, unit: 'стояк', category: 'Водоснабжение' },
];

export interface SmartVoiceItem {
  id: string;
  name: string;
  type: 'work' | 'material';
  quantity: number;
  unit: string;
  pricePerUnit: number;
  category: string;
  isCustom?: boolean;
}

// Spoken numbers in Russian
const RUSSIAN_NUMBER_WORDS: Record<string, number> = {
  один: 1, одна: 1, одно: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5,
  шесть: 6, семь: 7, восемь: 8, девять: 9, десять: 10,
  одиннадцать: 11, двенадцать: 12, тринадцать: 13, четырнадцать: 14,
  пятнадцать: 15, шестнадцать: 16, семнадцать: 17, восемнадцать: 18,
  девятнадцать: 19, двадцать: 20, тридцать: 30, сорок: 40,
  пятьдесят: 50, шестьдесят: 60, семьдесят: 70, восемьдесят: 80,
  девяносто: 90, сто: 100, двести: 200,
};

/**
 * Universal voice parser for plumbing estimates and services.
 * Distinguishes works/services from materials/fittings, accurately detects
 * quantities, prices, and assigns realistic rates from catalog.
 */
export function parseSmartVoicePhrase(rawPhrase: string): SmartVoiceItem | null {
  const clean = rawPhrase.trim();
  if (!clean || clean.length < 2) return null;

  const lower = clean.toLowerCase();

  // 1. Detect explicit price (e.g. "по 2500", "за 3000 руб", "цена 1500")
  let customPrice: number | null = null;
  const priceMatch = lower.match(/(?:по|за|цена|стоимость)?\s*(\d+[\d\s]*)\s*(?:руб|р|рублей|₽)/i) ||
                     lower.match(/(?:по|за)\s*(\d{2,6})\b/);
  if (priceMatch) {
    const rawP = parseInt(priceMatch[1].replace(/\s+/g, ''), 10);
    if (!isNaN(rawP) && rawP > 0) {
      customPrice = rawP;
    }
  }

  // 2. Detect quantity & unit
  let quantity = 1;
  let unit = 'шт';

  if (/метр|пог\.?\s*м|м\.п\./.test(lower)) {
    unit = 'м';
  } else if (/точка|точек|точки/.test(lower)) {
    unit = 'точка';
  } else if (/м²|кв\.?\s*м|квадрат/.test(lower)) {
    unit = 'м²';
  } else if (/комплект|компл/.test(lower)) {
    unit = 'компл';
  } else if (/услуг|работа/.test(lower)) {
    unit = 'услуга';
  } else if (/упаков|пач/.test(lower)) {
    unit = 'уп';
  } else if (/бухт/.test(lower)) {
    unit = 'бухта';
  }

  // Find explicit digits for quantity (e.g. "5 точек", "10 шт", "2 ванны")
  const qtyMatch = lower.match(/(\d+([\.,]\d+)?)\s*(?:шт|штук|штуки|штука|м|метр|метров|метра|точк|точек|точки|м²|кв\.?\s*м|компл|уп|бухт)?/);
  if (qtyMatch) {
    const val = parseFloat(qtyMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0 && val < 5000) {
      quantity = val;
    }
  } else {
    for (const [word, val] of Object.entries(RUSSIAN_NUMBER_WORDS)) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) {
        quantity = val;
        break;
      }
    }
  }

  // 3. Determine if it's a Work (service) or Material (fitting)
  const isWorkAction = /(монтаж|установк|демонтаж|сборк|разводк|прокладк|опрессовк|замен|штроблен|подключен|настройк|врезк|пайк|обвязк|укладк|испытани|прочистк|диагностик|навеск|герметизац)/.test(lower);

  let type: 'work' | 'material' = 'material';
  let category = 'Сантехнические работы';
  let finalPrice = customPrice || 1500;
  let itemName = clean;

  if (isWorkAction) {
    type = 'work';
    // Match against standard rates
    for (const rate of STANDARD_WORK_RATES) {
      if (rate.pattern.test(lower)) {
        if (!customPrice) finalPrice = rate.price;
        if (unit === 'шт') unit = rate.unit;
        category = rate.category;
        break;
      }
    }
  } else {
    // Check if it's a known service without explicit verb (e.g. "Инсталляция унитаза", "Теплый пол")
    for (const rate of STANDARD_WORK_RATES) {
      if (rate.pattern.test(lower)) {
        type = 'work';
        if (!customPrice) finalPrice = rate.price;
        if (unit === 'шт') unit = rate.unit;
        category = rate.category;
        break;
      }
    }

    // Otherwise check fitting/material patterns
    if (type === 'material') {
      category = 'Материалы и фитинги';
      if (/угол|отвод|колено/.test(lower)) {
        finalPrice = customPrice || 85;
      } else if (/тройник/.test(lower)) {
        finalPrice = customPrice || 120;
      } else if (/муфт/.test(lower)) {
        finalPrice = customPrice || 95;
      } else if (/кран|вентиль/.test(lower)) {
        finalPrice = customPrice || 750;
        category = 'Запорная арматура';
      } else if (/труб/.test(lower)) {
        finalPrice = customPrice || 140;
        unit = 'м';
        category = 'Трубы и изоляция';
      } else if (/фильтр/.test(lower)) {
        finalPrice = customPrice || 650;
      } else if (/коллектор|гребенк/.test(lower)) {
        finalPrice = customPrice || 3500;
        category = 'Коллекторный узел';
      } else {
        finalPrice = customPrice || 250;
      }
    }
  }

  // Capitalize name
  itemName = clean.charAt(0).toUpperCase() + clean.slice(1);

  return {
    id: 'sv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: itemName,
    type,
    quantity: Math.max(1, quantity),
    unit,
    pricePerUnit: finalPrice,
    category,
  };
}
