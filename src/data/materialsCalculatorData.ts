export type PipeMaterial = 'pex' | 'ppr' | 'metal_plastic' | 'copper' | 'stainless';
export type PipeType = PipeMaterial | 'ppr_20' | 'ppr_25' | 'pex_16' | 'pex_20' | 'metal_plastic_16';
export type WiringScheme = 'collector' | 'sequential';

export interface MaterialOption {
  id: PipeMaterial;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  connectionType: string;
}

export const MATERIAL_OPTIONS: MaterialOption[] = [
  {
    id: 'pex',
    name: 'Сшитый полиэтилен (PEX-A / EVOH)',
    shortName: 'PEX (Гильзы)',
    badge: 'Аксиальная надвижка',
    description: 'Надвижные аксиальные гильзы без резиновых колец. Высочайшая надёжность в стяжке пола.',
    connectionType: 'Надвижные латунные / PVDF гильзы',
  },
  {
    id: 'ppr',
    name: 'Полипропилен (PPR / PP-R армированный)',
    shortName: 'PPR (Пайка)',
    badge: 'Раструбная пайка',
    description: 'Диффузионная сварка при 260°C. Доступные жёсткие хлысты по 4 метра.',
    connectionType: 'Диффузионная сварка фитингов',
  },
  {
    id: 'metal_plastic',
    name: 'Металлопластик (PEX-AL-PEX)',
    shortName: 'Металлопластик (Пресс)',
    badge: 'Пресс-обжим',
    description: 'Многослойная труба с алюминиевым барьером и нержавеющими пресс-гильзами AISI 304.',
    connectionType: 'Пресс-гильзы нержавеющие AISI 304',
  },
  {
    id: 'copper',
    name: 'Медь сантехническая (Cu-DHP)',
    shortName: 'Медь (Пайка)',
    badge: 'Капиллярная пайка',
    description: 'Премиальный металл со сроком службы более 50 лет и бактерицидными свойствами.',
    connectionType: 'Капиллярная пайка припоем',
  },
  {
    id: 'stainless',
    name: 'Нержавеющая сталь (AISI 304)',
    shortName: 'Нержавейка (Пресс)',
    badge: 'Пресс-сталь',
    description: 'Высокопрочная нержавеющая труба для котельных и открытых элитных узлов ввода.',
    connectionType: 'Пресс-фитинги из нержавеющей стали',
  },
];

export interface MaterialDiameterSpec {
  value: number;
  label: string;
  role: string;
  wall: string;
  pipePrice: number;
  pipeName: string;
  sleevePrice?: number;
  sleeveName?: string;
  elbowPrice: number;
  elbowName: string;
  couplingPrice: number;
  couplingName: string;
  teePrice: number;
  teeName: string;
}

export const MATERIAL_DIAMETERS_CATALOG: Record<PipeMaterial, MaterialDiameterSpec[]> = {
  pex: [
    {
      value: 16,
      label: '16 мм',
      role: 'Подводка к водорозеткам смесителей, унитаза, инсталляции и стиральной машины',
      wall: '16×2.2 мм',
      pipePrice: 210,
      pipeName: 'Труба PEX-A / EVOH 16×2.2 мм (бухта)',
      sleevePrice: 85,
      sleeveName: 'Гильза надвижная аксиальная PEX 16 мм (латунь CW617N / PVDF)',
      elbowPrice: 180,
      elbowName: 'Угольник 90° аксиальный PEX 16 мм (латунь CW617N)',
      couplingPrice: 120,
      couplingName: 'Муфта соединительная равнопроходная PEX 16-16 (латунь CW617N)',
      teePrice: 240,
      teeName: 'Тройник равнопроходной PEX 16-16-16 (латунь CW617N)',
    },
    {
      value: 20,
      label: '20 мм',
      role: 'Магистральная линия от коллектора к ванне, душевой системе и бойлеру',
      wall: '20×2.8 мм',
      pipePrice: 290,
      pipeName: 'Труба PEX-A / EVOH 20×2.8 мм (бухта)',
      sleevePrice: 110,
      sleeveName: 'Гильза надвижная аксиальная PEX 20 мм (латунь CW617N / PVDF)',
      elbowPrice: 240,
      elbowName: 'Угольник 90° аксиальный PEX 20 мм (латунь CW617N)',
      couplingPrice: 160,
      couplingName: 'Муфта соединительная равнопроходная PEX 20-20 (латунь CW617N)',
      teePrice: 320,
      teeName: 'Тройник равнопроходной PEX 20-20-20 (латунь CW617N)',
    },
    {
      value: 25,
      label: '25 мм',
      role: 'Вводная магистраль, мощные накопительные бойлеры и главные гребёнки',
      wall: '25×3.5 мм',
      pipePrice: 420,
      pipeName: 'Труба PEX-A / EVOH 25×3.5 мм (бухта)',
      sleevePrice: 165,
      sleeveName: 'Гильза надвижная аксиальная PEX 25 мм (латунь CW617N / PVDF)',
      elbowPrice: 360,
      elbowName: 'Угольник 90° аксиальный PEX 25 мм (латунь CW617N)',
      couplingPrice: 240,
      couplingName: 'Муфта соединительная равнопроходная PEX 25-25 (латунь CW617N)',
      teePrice: 480,
      teeName: 'Тройник равнопроходной PEX 25-25-25 (латунь CW617N)',
    },
    {
      value: 32,
      label: '32 мм',
      role: 'Центральный домовой ввод от колодца/скважины и общие стояки здания',
      wall: '32×4.4 мм',
      pipePrice: 680,
      pipeName: 'Труба PEX-A 32×4.4 мм (бухта/хлыст)',
      sleevePrice: 290,
      sleeveName: 'Гильза надвижная аксиальная PEX 32 мм (латунь CW617N / PVDF)',
      elbowPrice: 540,
      elbowName: 'Угольник 90° аксиальный PEX 32 мм (латунь CW617N)',
      couplingPrice: 380,
      couplingName: 'Муфта соединительная равнопроходная PEX 32-32 (латунь CW617N)',
      teePrice: 720,
      teeName: 'Тройник равнопроходной PEX 32-32-32 (латунь CW617N)',
    },
  ],
  ppr: [
    {
      value: 20,
      label: '20 мм',
      role: 'Подводка к сантехприборам и смесителям',
      wall: 'PN20 (стекловолокно)',
      pipePrice: 85,
      pipeName: 'Труба PPR 20 мм PN20 армированная стекловолокном (хлыст 4м)',
      elbowPrice: 22,
      elbowName: 'Угольник 90° PPR 20 мм (под пайку)',
      couplingPrice: 18,
      couplingName: 'Муфта соединительная PPR 20 мм',
      teePrice: 28,
      teeName: 'Тройник равнопроходной PPR 20 мм',
    },
    {
      value: 25,
      label: '25 мм',
      role: 'Распределительные магистрали и подвод к коллекторам',
      wall: 'PN25 (магистральная)',
      pipePrice: 135,
      pipeName: 'Труба PPR 25 мм PN25 армированная стекловолокном (хлыст 4м)',
      elbowPrice: 32,
      elbowName: 'Угольник 90° PPR 25 мм (под пайку)',
      couplingPrice: 24,
      couplingName: 'Муфта соединительная PPR 25 мм',
      teePrice: 42,
      teeName: 'Тройник равнопроходной PPR 25 мм',
    },
    {
      value: 32,
      label: '32 мм',
      role: 'Стояки водоснабжения и подключение водонагревателей',
      wall: 'PN25 (стояковая)',
      pipePrice: 220,
      pipeName: 'Труба PPR 32 мм PN25 армированная (хлыст 4м)',
      elbowPrice: 55,
      elbowName: 'Угольник 90° PPR 32 мм (под пайку)',
      couplingPrice: 38,
      couplingName: 'Муфта соединительная PPR 32 мм',
      teePrice: 68,
      teeName: 'Тройник равнопроходной PPR 32 мм',
    },
    {
      value: 40,
      label: '40 мм',
      role: 'Главный ввод водопровода в дом и общие стояки',
      wall: 'PN25 (вводная)',
      pipePrice: 340,
      pipeName: 'Труба PPR 40 мм PN25 армированная (хлыст 4м)',
      elbowPrice: 95,
      elbowName: 'Угольник 90° PPR 40 мм (под пайку)',
      couplingPrice: 60,
      couplingName: 'Муфта соединительная PPR 40 мм',
      teePrice: 110,
      teeName: 'Тройник равнопроходной PPR 40 мм',
    },
  ],
  metal_plastic: [
    {
      value: 16,
      label: '16 мм',
      role: 'Подводка к сантехническим приборам',
      wall: '16×2.0 мм',
      pipePrice: 170,
      pipeName: 'Труба металлопластиковая бесшовная 16×2.0 мм (бухта)',
      sleevePrice: 55,
      sleeveName: 'Пресс-гильза нержавеющая AISI 304 для металлопластика 16 мм',
      elbowPrice: 150,
      elbowName: 'Угольник пресс 90° для металлопластика 16 мм (латунь CW617N)',
      couplingPrice: 110,
      couplingName: 'Муфта пресс соединительная прямая 16-16 мм',
      teePrice: 210,
      teeName: 'Тройник пресс равнопроходной 16-16-16 мм',
    },
    {
      value: 20,
      label: '20 мм',
      role: 'Магистральные подводы к коллекторам и ванне',
      wall: '20×2.0 мм',
      pipePrice: 230,
      pipeName: 'Труба металлопластиковая бесшовная 20×2.0 мм (бухта)',
      sleevePrice: 75,
      sleeveName: 'Пресс-гильза нержавеющая AISI 304 для металлопластика 20 мм',
      elbowPrice: 210,
      elbowName: 'Угольник пресс 90° для металлопластика 20 мм (латунь CW617N)',
      couplingPrice: 150,
      couplingName: 'Муфта пресс соединительная прямая 20-20 мм',
      teePrice: 290,
      teeName: 'Тройник пресс равнопроходной 20-20-20 мм',
    },
    {
      value: 26,
      label: '26 мм',
      role: 'Вводные трубы и подключение бойлеров',
      wall: '26×3.0 мм',
      pipePrice: 380,
      pipeName: 'Труба металлопластиковая бесшовная 26×3.0 мм (бухта/хлыст)',
      sleevePrice: 115,
      sleeveName: 'Пресс-гильза нержавеющая AISI 304 для металлопластика 26 мм',
      elbowPrice: 340,
      elbowName: 'Угольник пресс 90° для металлопластика 26 мм (латунь CW617N)',
      couplingPrice: 240,
      couplingName: 'Муфта пресс соединительная прямая 26-26 мм',
      teePrice: 460,
      teeName: 'Тройник пресс равнопроходной 26-26-26 мм',
    },
    {
      value: 32,
      label: '32 мм',
      role: 'Главный ввод водопровода и стояки',
      wall: '32×3.0 мм',
      pipePrice: 560,
      pipeName: 'Труба металлопластиковая бесшовная 32×3.0 мм (хлыст/бухта)',
      sleevePrice: 165,
      sleeveName: 'Пресс-гильза нержавеющая AISI 304 для металлопластика 32 мм',
      elbowPrice: 510,
      elbowName: 'Угольник пресс 90° для металлопластика 32 мм (латунь CW617N)',
      couplingPrice: 360,
      couplingName: 'Муфта пресс соединительная прямая 32-32 мм',
      teePrice: 680,
      teeName: 'Тройник пресс равнопроходной 32-32-32 мм',
    },
  ],
  copper: [
    {
      value: 15,
      label: '15 мм',
      role: 'Подводка к смесителям и приборам',
      wall: '15×1.0 мм',
      pipePrice: 620,
      pipeName: 'Труба медная отожженная/твердая 15×1.0 мм (Cu-DHP)',
      elbowPrice: 85,
      elbowName: 'Отвод 90° медный капиллярный 15 мм под пайку',
      couplingPrice: 65,
      couplingName: 'Муфта соединительная медная 15 мм под пайку',
      teePrice: 140,
      teeName: 'Тройник равнопроходной медный 15 мм под пайку',
    },
    {
      value: 18,
      label: '18 мм',
      role: 'Распределительные магистрали и стояки',
      wall: '18×1.0 мм',
      pipePrice: 820,
      pipeName: 'Труба медная твердая 18×1.0 мм (Cu-DHP)',
      elbowPrice: 120,
      elbowName: 'Отвод 90° медный капиллярный 18 мм под пайку',
      couplingPrice: 90,
      couplingName: 'Муфта соединительная медная 18 мм под пайку',
      teePrice: 190,
      teeName: 'Тройник равнопроходной медный 18 мм под пайку',
    },
    {
      value: 22,
      label: '22 мм',
      role: 'Вводные линии и подключение бойлеров',
      wall: '22×1.0 мм',
      pipePrice: 1100,
      pipeName: 'Труба медная твердая 22×1.0 мм (Cu-DHP)',
      elbowPrice: 175,
      elbowName: 'Отвод 90° медный капиллярный 22 мм под пайку',
      couplingPrice: 130,
      couplingName: 'Муфта соединительная медная 22 мм под пайку',
      teePrice: 280,
      teeName: 'Тройник равнопроходной медный 22 мм под пайку',
    },
    {
      value: 28,
      label: '28 мм',
      role: 'Главный ввод водопровода и котельное оборудование',
      wall: '28×1.0 мм',
      pipePrice: 1450,
      pipeName: 'Труба медная твердая 28×1.0 мм (Cu-DHP)',
      elbowPrice: 260,
      elbowName: 'Отвод 90° медный капиллярный 28 мм под пайку',
      couplingPrice: 190,
      couplingName: 'Муфта соединительная медная 28 мм под пайку',
      teePrice: 420,
      teeName: 'Тройник равнопроходной медный 28 мм под пайку',
    },
  ],
  stainless: [
    {
      value: 15,
      label: '15 мм',
      role: 'Подводка к водорозеткам и смесителям',
      wall: '15×1.0 мм',
      pipePrice: 580,
      pipeName: 'Труба нержавеющая прецизионная 15×1.0 мм AISI 304 (хлыст 4м)',
      elbowPrice: 320,
      elbowName: 'Угольник пресс 90° нержавеющая сталь AISI 304 15 мм',
      couplingPrice: 240,
      couplingName: 'Муфта пресс соединительная AISI 304 15 мм',
      teePrice: 480,
      teeName: 'Тройник пресс равнопроходной AISI 304 15 мм',
    },
    {
      value: 18,
      label: '18 мм',
      role: 'Магистральные подводы от узла ввода',
      wall: '18×1.0 мм',
      pipePrice: 750,
      pipeName: 'Труба нержавеющая прецизионная 18×1.0 мм AISI 304 (хлыст 4м)',
      elbowPrice: 390,
      elbowName: 'Угольник пресс 90° нержавеющая сталь AISI 304 18 мм',
      couplingPrice: 290,
      couplingName: 'Муфта пресс соединительная AISI 304 18 мм',
      teePrice: 580,
      teeName: 'Тройник пресс равнопроходной AISI 304 18 мм',
    },
    {
      value: 22,
      label: '22 мм',
      role: 'Вводные группы и распределительные узлы',
      wall: '22×1.2 мм',
      pipePrice: 980,
      pipeName: 'Труба нержавеющая прецизионная 22×1.2 мм AISI 304 (хлыст 4м)',
      elbowPrice: 510,
      elbowName: 'Угольник пресс 90° нержавеющая сталь AISI 304 22 мм',
      couplingPrice: 380,
      couplingName: 'Муфта пресс соединительная AISI 304 22 мм',
      teePrice: 740,
      teeName: 'Тройник пресс равнопроходной AISI 304 22 мм',
    },
    {
      value: 28,
      label: '28 мм',
      role: 'Главный ввод водопровода и стояки',
      wall: '28×1.2 мм',
      pipePrice: 1320,
      pipeName: 'Труба нержавеющая прецизионная 28×1.2 мм AISI 304 (хлыст 4м)',
      elbowPrice: 690,
      elbowName: 'Угольник пресс 90° нержавеющая сталь AISI 304 28 мм',
      couplingPrice: 490,
      couplingName: 'Муфта пресс соединительная AISI 304 28 мм',
      teePrice: 990,
      teeName: 'Тройник пресс равнопроходной AISI 304 28 мм',
    },
  ],
};

export const DEFAULT_DIAMETERS_BY_MATERIAL: Record<PipeMaterial, number[]> = {
  pex: [16, 20],
  ppr: [20, 25],
  metal_plastic: [16, 20],
  copper: [15, 18],
  stainless: [15, 18],
};

export const getInitialMaterial = (pt?: string): PipeMaterial => {
  if (!pt) return 'pex';
  if (pt.startsWith('pex')) return 'pex';
  if (pt.startsWith('ppr')) return 'ppr';
  if (pt.includes('metal_plastic') || pt === 'mp') return 'metal_plastic';
  if (pt === 'copper' || pt === 'cu') return 'copper';
  if (pt === 'stainless' || pt === 'inox') return 'stainless';
  return 'pex';
};

export const PIPE_TYPE_DISPLAY: Record<string, string> = {
  ppr_20: 'ППР 20 мм (хлыст 4м)',
  ppr_25: 'ППР 25 мм (хлыст 4м)',
  pex_16: 'PEX-A 16 мм (бухта)',
  pex_20: 'PEX-A 20 мм (бухта)',
  metal_plastic_16: 'Металлопластик 16 мм (бухта)',
  pex: 'Сшитый полиэтилен PEX',
  ppr: 'Полипропилен PPR',
  metal_plastic: 'Металлопластик',
  copper: 'Медь сантехническая',
  stainless: 'Нержавеющая сталь',
};

export interface WaterPointPreset {
  id: string;
  label: string;
  pipesCount: number; // 1 = cold only, 2 = cold + hot
}

export const WATER_POINT_PRESETS: WaterPointPreset[] = [
  { id: 'sink_kitchen', label: 'Смеситель на кухне (ХВС + ГВС)', pipesCount: 2 },
  { id: 'sink_bath', label: 'Умывальник в ванной (ХВС + ГВС)', pipesCount: 2 },
  { id: 'bathtub', label: 'Ванна / Душевая кабина (ХВС + ГВС)', pipesCount: 2 },
  { id: 'toilet', label: 'Унитаз / Инсталляция (ХВС)', pipesCount: 1 },
  { id: 'bidet', label: 'Гигиенический душ (ХВС + ГВС)', pipesCount: 2 },
  { id: 'washing_machine', label: 'Стиральная машина (ХВС)', pipesCount: 1 },
  { id: 'dishwasher', label: 'Посудомоечная машина (ХВС)', pipesCount: 1 },
  { id: 'boiler', label: 'Водонагреватель / Бойлер (ХВС + ГВС)', pipesCount: 2 },
  { id: 'filter', label: 'Фильтр питьевой воды (ХВС)', pipesCount: 1 },
];

export interface PopularAddition {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  specs: string;
}

export const POPULAR_ADDITIONS: PopularAddition[] = [
  {
    id: 'add_water_hammer',
    name: 'Компенсатор гидроударов мембранный 1/2" (нерж. сталь)',
    category: 'Безопасность',
    unit: 'шт',
    price: 2100,
    specs: 'Гашение волн давления до 20 бар при закрытии керамических картриджей',
  },
  {
    id: 'add_fine_filter',
    name: 'Самопромывной фильтр тонкой очистки 100 мкм с манометром 1/2"',
    category: 'Фильтрация',
    unit: 'шт',
    price: 2850,
    specs: 'Сетчатый картридж из нерж. стали AISI 316 с прямым сливом в канализацию',
  },
  {
    id: 'add_leak_valve',
    name: 'Кран шаровый полнопроходной 1/2" с электроприводом (система защиты от протечек)',
    category: 'Автоматика',
    unit: 'шт',
    price: 3400,
    specs: '12V, крутящий момент 10 Н·м, аварийное перекрытие за 5 секунд',
  },
  {
    id: 'add_thermo_valve',
    name: 'Термостатический смесительный клапан 3/4" (30-65°C)',
    category: 'Регулировка',
    unit: 'шт',
    price: 3200,
    specs: 'Защита от ошпаривания и стабильная температура для гигиенического душа',
  },
  {
    id: 'add_check_valve',
    name: 'Обратный клапан латунный 1/2" с латунным золотником',
    category: 'Запорная арматура',
    unit: 'шт',
    price: 450,
    specs: 'Предотвращение перетока между стояками ХВС и ГВС через смесители',
  },
  {
    id: 'add_manometer',
    name: 'Манометр радиальный 1/4" (0–10 бар)',
    category: 'КИПиА',
    unit: 'шт',
    price: 580,
    specs: 'Визуальный контроль давления на входе и после редуктора в коллекторе',
  },
  {
    id: 'add_heat_cable',
    name: 'Саморегулирующийся греющий кабель 16 Вт/м (10 м с евровилкой)',
    category: 'Обогрев',
    unit: 'компл',
    price: 2600,
    specs: 'Защита от промерзания подземного или цокольного ввода водопровода',
  },
  {
    id: 'add_water_meter',
    name: 'Счётчик воды крыльчатый универсальный 1/2" (ХВС/ГВС с импульсным выходом)',
    category: 'Учёт',
    unit: 'шт',
    price: 950,
    specs: 'Межповерочный интервал 6 лет, латунный корпус, штуцеры с обратным клапаном',
  },
];
