import React, { useState, useMemo } from 'react';
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Printer,
  Save,
  Download,
  Flame,
  Zap,
  SlidersHorizontal,
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
  Layers,
  FileText,
  PhoneCall,
  X,
  GripVertical,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  ListOrdered,
  Package,
  PlusCircle,
  HelpCircle,
  RotateCcw,
  FileDown,
  Loader2,
  Share2,
  Send,
  Info
} from 'lucide-react';
import { SavedEstimate } from '../types';
import { downloadCollectorBoardPdf } from '../utils/pdfGenerator';

export interface BoardNodeItem {
  id: string;
  name: string;
  category: 'inlet' | 'filter' | 'pressure' | 'collector' | 'heater' | 'service' | 'custom';
  column: 'cold' | 'hot' | 'shared' | 'catalog';
  quantity: number;
  unit: string;
  unitPrice: number;
  brandSuggestion?: string;
  description?: string;
  badge?: string;
  pipeDiameter?: string;
  order: number;
}

interface CollectorUnitBuilderProps {
  onSaveEstimate?: (est: SavedEstimate) => void;
  onOpenSpecialists?: () => void;
}

// Initial full catalog of components available to drag onto the board
const CATALOG_ITEMS: Omit<BoardNodeItem, 'order'>[] = [
  // Ввод и защита
  {
    id: 'cat-neptun-smart-34',
    name: 'Кран с электроприводом Neptun Bugatti Pro 12V (3/4" Ду20)',
    category: 'inlet',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 14250,
    brandSuggestion: 'Neptun / Bugatti',
    badge: '3/4" с электроприводом',
    description: 'Система антипротечки с автоматическим перекрытием при аварии за 21 сек',
  },
  {
    id: 'cat-ball-valve-34',
    name: 'Кран шаровый усиленный полнопроходной Oventrop Optibal (3/4")',
    category: 'inlet',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 1850,
    brandSuggestion: 'Oventrop',
    badge: '3/4" Ру40',
    description: 'Первичный вводной шаровый кран с латунным штоком и ручкой-бабочкой',
  },
  {
    id: 'cat-coarse-filter-34',
    name: 'Грязевик фильтр грубой очистки 300-500 мкм (3/4")',
    category: 'filter',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 1950,
    brandSuggestion: 'FAR / Valtec',
    badge: '300-500 мкм',
    description: 'Задерживает окалину, песок и крупный абразив со стояков',
  },
  {
    id: 'cat-water-meter-34',
    name: 'Счётчик воды с импульсным выходом под телеметрию (Ду15/20)',
    category: 'inlet',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 2450,
    brandSuggestion: 'Itelma / Decast',
    badge: 'Импульсный',
    description: 'Учёт расхода с возможностью интеграции в умный дом и Neptun Smart',
  },
  {
    id: 'cat-check-valve-34',
    name: 'Обратный клапан латунный с металлическим седлом (3/4")',
    category: 'inlet',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 1200,
    brandSuggestion: 'Itap / Valtec',
    badge: 'Обратный клапан',
    description: 'Предотвращает переток воды между стояками ХВС и ГВС через смесители',
  },
  {
    id: 'cat-reducer-far-34',
    name: 'Редуктор давления мембранный FAR с манометром 0-10 бар (3/4")',
    category: 'pressure',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 6850,
    brandSuggestion: 'FAR (Италия)',
    badge: 'FAR Мембранный',
    description: 'Стабилизирует давление на 3.0-3.5 бар, защищает смесители и картриджи',
  },
  {
    id: 'cat-fine-filter-100',
    name: 'Промывной фильтр 100 мкм в нержавеющей колбе с манометром',
    category: 'filter',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 11900,
    brandSuggestion: 'Гейзер Премьер / FAR',
    badge: '100 мкм Нержавейка',
    description: 'Магистральная тонкая очистка в колбе из пищевой нержавеющей стали',
  },
  {
    id: 'cat-shock-arrestor',
    name: 'Компенсатор гидроударов пружинно-мембранный Caleffi / FAR (1/2")',
    category: 'pressure',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 4200,
    brandSuggestion: 'Caleffi / FAR',
    badge: 'Гаситель ударов',
    description: 'Гасит гидроудар при резком закрытии смесителей, стиралок и инсталляций',
  },
  {
    id: 'cat-collector-far-4',
    name: 'Распределительный коллектор FAR 3/4" на 4 выхода с отсечными кранами',
    category: 'collector',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 5600,
    brandSuggestion: 'FAR (Италия)',
    badge: '4 выхода 1/2"',
    description: 'Латунный коллектор с регулирующими вентилями и метками потребителей',
  },
  {
    id: 'cat-collector-far-6',
    name: 'Распределительный коллектор FAR 3/4" на 6 выходов с отсечными кранами',
    category: 'collector',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 8400,
    brandSuggestion: 'FAR (Италия)',
    badge: '6 выходов 1/2"',
    description: 'Коллекторная лучевая разводка без перепадов давления между точками',
  },
  {
    id: 'cat-reverse-flush',
    name: 'Линия обратной промывки фильтров (байпас ХВС ↔ ГВС с кранами)',
    category: 'service',
    column: 'catalog',
    quantity: 1,
    unit: 'компл',
    unitPrice: 5800,
    brandSuggestion: 'Valtec / FAR',
    badge: 'Байпас промывки',
    description: 'Промывка сеток фильтров горячей водой в канализацию без разборки колб',
  },
  {
    id: 'cat-water-heater-instant',
    name: 'Проточный электрический водонагреватель Stiebel Eltron / Clage (8.8-12 кВт)',
    category: 'heater',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 24500,
    brandSuggestion: 'Stiebel Eltron',
    badge: 'Проточник 8-12 кВт',
    description: 'Компактный нагреватель на период планового летнего отключения ГВС',
  },
  {
    id: 'cat-water-heater-boiler',
    name: 'Накопительный бойлер плоский Thermex / Electrolux 50-80 л',
    category: 'heater',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 21900,
    brandSuggestion: 'Electrolux',
    badge: 'Бойлер 50-80 л',
    description: 'Накопительный бак из нержавеющей стали с предохранительным клапаном',
  },
  {
    id: 'cat-frame-walraven',
    name: 'Монтажная консольная рама Walraven / Mupro для сборки сантехшкафа',
    category: 'service',
    column: 'catalog',
    quantity: 1,
    unit: 'компл',
    unitPrice: 18500,
    brandSuggestion: 'Walraven Strut',
    badge: 'Рама Walraven',
    description: 'Оцинкованный профиль, виброизолирующие хомуты и шпильки для жесткого узла',
  },
  {
    id: 'cat-drinking-filter',
    name: 'Фильтр питьевой воды обратного осмоса с насосом и минерализатором',
    category: 'filter',
    column: 'catalog',
    quantity: 1,
    unit: 'компл',
    unitPrice: 16500,
    brandSuggestion: 'Аквафор / Гейзер',
    badge: 'Осмос под мойку',
    description: 'Чистейшая питьевая вода высшей категории с отдельным краном на кухню',
  },
  {
    id: 'cat-dry-siphon',
    name: 'Сухой сифон для сброса дренажа фильтров и кондиционера McAlpine',
    category: 'service',
    column: 'catalog',
    quantity: 1,
    unit: 'шт',
    unitPrice: 2800,
    brandSuggestion: 'McAlpine (Шотландия)',
    badge: 'Сухой затвор',
    description: 'Исключает проникновение запахов из канализации даже при пересыхании гидрозатвора',
  },
];

// Helper to generate default preset items for the board
const createDefaultPreset = (preset: 'foriver_premium' | 'comfort' | 'optimum'): BoardNodeItem[] => {
  if (preset === 'foriver_premium') {
    return [
      // ХВС
      {
        id: 'hvs-neptun',
        name: 'Кран с электроприводом Neptun Bugatti Pro 12V (3/4")',
        category: 'inlet',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 14250,
        brandSuggestion: 'Neptun / Bugatti',
        badge: '3/4" Электропривод',
        description: 'Антипротечка ХВС с автоматическим закрытием',
        order: 1,
      },
      {
        id: 'hvs-coarse',
        name: 'Грязевик фильтр грубой очистки 300 мкм (3/4")',
        category: 'filter',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1950,
        brandSuggestion: 'FAR',
        badge: '300 мкм',
        description: 'Защита от ржавчины и окалины',
        order: 2,
      },
      {
        id: 'hvs-meter',
        name: 'Счётчик воды импульсный (Ду15/20)',
        category: 'inlet',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 2450,
        brandSuggestion: 'Itelma',
        badge: 'Учёт ХВС',
        description: 'С выходом под телеметрию',
        order: 3,
      },
      {
        id: 'hvs-check',
        name: 'Обратный клапан латунный 3/4"',
        category: 'inlet',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1200,
        brandSuggestion: 'Itap',
        badge: 'Защита от перетока',
        description: 'Блокирует переток холодной воды',
        order: 4,
      },
      {
        id: 'hvs-reducer',
        name: 'Редуктор давления мембранный FAR с манометром (3/4")',
        category: 'pressure',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 6850,
        brandSuggestion: 'FAR',
        badge: 'Редуктор 3.0 бар',
        description: 'Стабилизация давления ХВС',
        order: 5,
      },
      {
        id: 'hvs-fine-filter',
        name: 'Промывной фильтр 100 мкм в нержавеющей колбе',
        category: 'filter',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 11900,
        brandSuggestion: 'Гейзер Премьер',
        badge: '100 мкм Нержавейка',
        description: 'Тонкая фильтрация холодной воды',
        order: 6,
      },
      {
        id: 'hvs-arrestor',
        name: 'Компенсатор гидроударов Caleffi / FAR (1/2")',
        category: 'pressure',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 4200,
        brandSuggestion: 'Caleffi',
        badge: 'Гаситель ударов',
        description: 'Защита сантехприборов от гидроударов',
        order: 7,
      },
      {
        id: 'hvs-collector',
        name: 'Распределительный коллектор FAR на 6 выходов',
        category: 'collector',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 8400,
        brandSuggestion: 'FAR',
        badge: '6 выходов ХВС',
        description: 'Индивидуальная подача к каждой точке',
        order: 8,
      },

      // ГВС
      {
        id: 'gvs-neptun',
        name: 'Кран с электроприводом Neptun Bugatti Pro 12V (3/4")',
        category: 'inlet',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 14250,
        brandSuggestion: 'Neptun / Bugatti',
        badge: '3/4" Электропривод',
        description: 'Антипротечка ГВС с автоматическим закрытием',
        order: 1,
      },
      {
        id: 'gvs-coarse',
        name: 'Грязевик фильтр грубой очистки 300 мкм (3/4")',
        category: 'filter',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1950,
        brandSuggestion: 'FAR',
        badge: '300 мкм',
        description: 'Защита от ржавчины и окалины',
        order: 2,
      },
      {
        id: 'gvs-meter',
        name: 'Счётчик горячей воды импульсный (Ду15/20)',
        category: 'inlet',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 2450,
        brandSuggestion: 'Itelma',
        badge: 'Учёт ГВС',
        description: 'С выходом под телеметрию',
        order: 3,
      },
      {
        id: 'gvs-check',
        name: 'Обратный клапан латунный 3/4"',
        category: 'inlet',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1200,
        brandSuggestion: 'Itap',
        badge: 'Защита от перетока',
        description: 'Блокирует переток горячей воды',
        order: 4,
      },
      {
        id: 'gvs-reducer',
        name: 'Редуктор давления мембранный FAR с манометром (3/4")',
        category: 'pressure',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 6850,
        brandSuggestion: 'FAR',
        badge: 'Редуктор 3.0 бар',
        description: 'Стабилизация давления ГВС',
        order: 5,
      },
      {
        id: 'gvs-fine-filter',
        name: 'Промывной фильтр 100 мкм в нержавеющей колбе',
        category: 'filter',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 11900,
        brandSuggestion: 'Гейзер Премьер',
        badge: '100 мкм Нержавейка',
        description: 'Тонкая фильтрация горячей воды',
        order: 6,
      },
      {
        id: 'gvs-arrestor',
        name: 'Компенсатор гидроударов Caleffi / FAR (1/2")',
        category: 'pressure',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 4200,
        brandSuggestion: 'Caleffi',
        badge: 'Гаситель ударов',
        description: 'Защита сантехприборов от гидроударов',
        order: 7,
      },
      {
        id: 'gvs-collector',
        name: 'Распределительный коллектор FAR на 4 выхода',
        category: 'collector',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 5600,
        brandSuggestion: 'FAR',
        badge: '4 выхода ГВС',
        description: 'Индивидуальная подача к точкам ГВС',
        order: 8,
      },

      // Общие / Сервисные
      {
        id: 'shared-reverse-flush',
        name: 'Линия обратной промывки фильтров (байпас ХВС ↔ ГВС)',
        category: 'service',
        column: 'shared',
        quantity: 1,
        unit: 'компл',
        unitPrice: 5800,
        brandSuggestion: 'Valtec / FAR',
        badge: 'Обратная промывка',
        description: 'Сервисная промывка сеток фильтров горячей водой',
        order: 1,
      },
      {
        id: 'shared-water-heater',
        name: 'Проточный электрический водонагреватель Stiebel Eltron 8.8–12 кВт',
        category: 'heater',
        column: 'shared',
        quantity: 1,
        unit: 'шт',
        unitPrice: 24500,
        brandSuggestion: 'Stiebel Eltron',
        badge: 'Проточник 8-12 кВт',
        description: 'Горячая вода на весь период отключений',
        order: 2,
      },
      {
        id: 'shared-frame',
        name: 'Монтажная рама Walraven Strut с виброизолирующими хомутами',
        category: 'service',
        column: 'shared',
        quantity: 1,
        unit: 'компл',
        unitPrice: 18500,
        brandSuggestion: 'Walraven',
        badge: 'Рама Walraven',
        description: 'Силовой каркас сантехшкафа',
        order: 3,
      },
      {
        id: 'shared-siphon',
        name: 'Сухой сифон со сбросом дренажа McAlpine',
        category: 'service',
        column: 'shared',
        quantity: 1,
        unit: 'шт',
        unitPrice: 2800,
        brandSuggestion: 'McAlpine',
        badge: 'Сухой затвор',
        description: 'Отвод дренажа без запахов',
        order: 4,
      },
    ];
  } else if (preset === 'comfort') {
    return [
      // ХВС Комфорт
      {
        id: 'hvs-valve-comf',
        name: 'Кран шаровый усиленный Oventrop 1/2"',
        category: 'inlet',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1650,
        brandSuggestion: 'Oventrop',
        badge: '1/2" Вводной',
        order: 1,
      },
      {
        id: 'hvs-coarse-comf',
        name: 'Грязевик фильтр 300 мкм (1/2")',
        category: 'filter',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1750,
        brandSuggestion: 'FAR',
        badge: '300 мкм',
        order: 2,
      },
      {
        id: 'hvs-reducer-comf',
        name: 'Редуктор давления мембранный FAR (1/2")',
        category: 'pressure',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 6200,
        brandSuggestion: 'FAR',
        badge: 'Редуктор FAR',
        order: 3,
      },
      {
        id: 'hvs-fine-comf',
        name: 'Промывной фильтр 100 мкм в нержавеющей колбе',
        category: 'filter',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 11900,
        brandSuggestion: 'Гейзер',
        badge: '100 мкм',
        order: 4,
      },
      {
        id: 'hvs-coll-comf',
        name: 'Распределительный коллектор FAR 3/4" на 5 выходов',
        category: 'collector',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 7100,
        brandSuggestion: 'FAR',
        badge: '5 выходов ХВС',
        order: 5,
      },

      // ГВС Комфорт
      {
        id: 'gvs-valve-comf',
        name: 'Кран шаровый усиленный Oventrop 1/2"',
        category: 'inlet',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1650,
        brandSuggestion: 'Oventrop',
        badge: '1/2" Вводной',
        order: 1,
      },
      {
        id: 'gvs-coarse-comf',
        name: 'Грязевик фильтр 300 мкм (1/2")',
        category: 'filter',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1750,
        brandSuggestion: 'FAR',
        badge: '300 мкм',
        order: 2,
      },
      {
        id: 'gvs-reducer-comf',
        name: 'Редуктор давления мембранный FAR (1/2")',
        category: 'pressure',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 6200,
        brandSuggestion: 'FAR',
        badge: 'Редуктор FAR',
        order: 3,
      },
      {
        id: 'gvs-fine-comf',
        name: 'Промывной фильтр 100 мкм в нержавеющей колбе',
        category: 'filter',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 11900,
        brandSuggestion: 'Гейзер',
        badge: '100 мкм',
        order: 4,
      },
      {
        id: 'gvs-coll-comf',
        name: 'Распределительный коллектор FAR 3/4" на 4 выхода',
        category: 'collector',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 5600,
        brandSuggestion: 'FAR',
        badge: '4 выхода ГВС',
        order: 5,
      },

      // Общие
      {
        id: 'shared-boiler-comf',
        name: 'Накопительный плоский водонагреватель 50-80 л',
        category: 'heater',
        column: 'shared',
        quantity: 1,
        unit: 'шт',
        unitPrice: 21900,
        brandSuggestion: 'Electrolux',
        badge: 'Бойлер 50-80 л',
        order: 1,
      },
      {
        id: 'shared-neptun-base',
        name: 'Комплект защиты от протечек Neptun Base',
        category: 'inlet',
        column: 'shared',
        quantity: 1,
        unit: 'компл',
        unitPrice: 19800,
        brandSuggestion: 'Neptun',
        badge: 'Защита от протечек',
        order: 2,
      },
    ];
  } else {
    // Базовый
    return [
      {
        id: 'hvs-base-valve',
        name: 'Шаровый кран полнопроходной 1/2"',
        category: 'inlet',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1450,
        brandSuggestion: 'Bugatti',
        badge: '1/2" Кран',
        order: 1,
      },
      {
        id: 'hvs-base-coarse',
        name: 'Фильтр грубой очистки 500 мкм (1/2")',
        category: 'filter',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1250,
        brandSuggestion: 'Valtec',
        badge: '500 мкм',
        order: 2,
      },
      {
        id: 'hvs-base-red',
        name: 'Редуктор давления поршневой с манометром',
        category: 'pressure',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 3800,
        brandSuggestion: 'Valtec',
        badge: 'Поршневой',
        order: 3,
      },
      {
        id: 'hvs-base-coll',
        name: 'Коллектор с отсечными кранами на 4 выхода',
        category: 'collector',
        column: 'cold',
        quantity: 1,
        unit: 'шт',
        unitPrice: 3900,
        brandSuggestion: 'Stout',
        badge: '4 выхода',
        order: 4,
      },
      {
        id: 'gvs-base-valve',
        name: 'Шаровый кран полнопроходной 1/2"',
        category: 'inlet',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1450,
        brandSuggestion: 'Bugatti',
        badge: '1/2" Кран',
        order: 1,
      },
      {
        id: 'gvs-base-coarse',
        name: 'Фильтр грубой очистки 500 мкм (1/2")',
        category: 'filter',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 1250,
        brandSuggestion: 'Valtec',
        badge: '500 мкм',
        order: 2,
      },
      {
        id: 'gvs-base-red',
        name: 'Редуктор давления поршневой с манометром',
        category: 'pressure',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 3800,
        brandSuggestion: 'Valtec',
        badge: 'Поршневой',
        order: 3,
      },
      {
        id: 'gvs-base-coll',
        name: 'Коллектор с отсечными кранами на 3 выхода',
        category: 'collector',
        column: 'hot',
        quantity: 1,
        unit: 'шт',
        unitPrice: 3100,
        brandSuggestion: 'Stout',
        badge: '3 выхода',
        order: 4,
      },
    ];
  }
};

export const CollectorUnitBuilder: React.FC<CollectorUnitBuilderProps> = ({
  onSaveEstimate,
  onOpenSpecialists,
}) => {
  // Preset selector
  const [activePreset, setActivePreset] = useState<'foriver_premium' | 'comfort' | 'optimum'>('foriver_premium');

  // Board items placed by user
  const [boardItems, setBoardItems] = useState<BoardNodeItem[]>(() => createDefaultPreset('foriver_premium'));

  // Drag and Drop active states
  const [draggedItem, setDraggedItem] = useState<BoardNodeItem | (Omit<BoardNodeItem, 'order'> & { isCatalog?: boolean }) | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<'cold' | 'hot' | 'shared' | 'trash' | null>(null);

  // View Mode: Kanban Task Board vs Table Specification
  const [viewMode, setViewMode] = useState<'board' | 'spec'>('board');

  // Labor options
  const [includeLabor, setIncludeLabor] = useState<boolean>(false); // По умолчанию выключено (только чистые материалы)
  const [laborLevel, setLaborLevel] = useState<'custom' | 'premium' | 'standard'>('custom');
  const [customLaborCost, setCustomLaborCost] = useState<number>(130000); // Актуальная рыночная цена исполнителя (130 000 ₽)

  // Custom Item Modal
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number>(3500);
  const [customColumn, setCustomColumn] = useState<'cold' | 'hot' | 'shared'>('cold');
  const [customBadge, setCustomBadge] = useState<string>('Свой узел');

  // Modals & toast
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch preset
  const handleApplyPreset = (p: 'foriver_premium' | 'comfort' | 'optimum') => {
    setActivePreset(p);
    setBoardItems(createDefaultPreset(p));
    showToast(`Загружен шаблон узла: ${p === 'foriver_premium' ? 'Премиум Foriver' : p === 'comfort' ? 'Комфорт' : 'Базовый'}`);
  };

  const handleClearBoard = () => {
    setBoardItems([]);
    showToast('Доска очищена. Вы можете перетаскивать любые элементы из каталога справа!');
  };

  // Columns data
  const coldItems = useMemo(() => boardItems.filter((i) => i.column === 'cold').sort((a, b) => a.order - b.order), [boardItems]);
  const hotItems = useMemo(() => boardItems.filter((i) => i.column === 'hot').sort((a, b) => a.order - b.order), [boardItems]);
  const sharedItems = useMemo(() => boardItems.filter((i) => i.column === 'shared').sort((a, b) => a.order - b.order), [boardItems]);

  // Total calculations
  const totalMaterialsCost = useMemo(() => {
    return boardItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  }, [boardItems]);

  const laborCost = useMemo(() => {
    if (!includeLabor) return 0;
    if (laborLevel === 'custom') return customLaborCost;
    if (laborLevel === 'premium') {
      // Премиум монтаж на монтажной раме Walraven/Mupro с пресс-нержавейкой и автоматикой
      return 135000;
    }
    // Стандартный монтаж коллекторного узла ввода под ключ
    return 85000;
  }, [includeLabor, laborLevel, customLaborCost]);

  const grandTotal = totalMaterialsCost + laborCost;

  // Move item between columns
  const handleMoveColumn = (itemId: string, targetCol: 'cold' | 'hot' | 'shared') => {
    setBoardItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const targetItems = prev.filter((i) => i.column === targetCol);
          return {
            ...item,
            column: targetCol,
            order: targetItems.length + 1,
          };
        }
        return item;
      })
    );
  };

  // Reorder item up/down inside its column
  const handleReorder = (itemId: string, direction: 'up' | 'down') => {
    setBoardItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;
      const colItems = prev.filter((i) => i.column === item.column).sort((a, b) => a.order - b.order);
      const currIdx = colItems.findIndex((i) => i.id === itemId);
      if (currIdx === -1) return prev;
      const targetIdx = direction === 'up' ? currIdx - 1 : currIdx + 1;
      if (targetIdx < 0 || targetIdx >= colItems.length) return prev;

      const swapItem = colItems[targetIdx];
      const newOrder1 = swapItem.order;
      const newOrder2 = item.order;

      return prev.map((it) => {
        if (it.id === item.id) return { ...it, order: newOrder1 };
        if (it.id === swapItem.id) return { ...it, order: newOrder2 };
        return it;
      });
    });
  };

  // Change quantity
  const handleQuantityChange = (itemId: string, delta: number) => {
    setBoardItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const newQty = Math.max(1, it.quantity + delta);
          return { ...it, quantity: newQty };
        }
        return it;
      })
    );
  };

  // Delete item from board
  const handleDeleteItem = (itemId: string) => {
    setBoardItems((prev) => prev.filter((it) => it.id !== itemId));
    showToast('Элемент удален с доски');
  };

  // Duplicate item on board
  const handleDuplicateItem = (item: BoardNodeItem) => {
    const newItem: BoardNodeItem = {
      ...item,
      id: `${item.id}-copy-${Date.now()}`,
      order: boardItems.filter((i) => i.column === item.column).length + 1,
    };
    setBoardItems((prev) => [...prev, newItem]);
    showToast(`Создана копия узла «${item.name}»`);
  };

  // Add from Catalog to column
  const handleAddFromCatalog = (catItem: typeof CATALOG_ITEMS[0], targetCol: 'cold' | 'hot' | 'shared') => {
    const targetItems = boardItems.filter((i) => i.column === targetCol);
    const newItem: BoardNodeItem = {
      id: `board-${catItem.id}-${Date.now()}`,
      name: catItem.name,
      category: catItem.category,
      column: targetCol,
      quantity: 1,
      unit: catItem.unit,
      unitPrice: catItem.unitPrice,
      brandSuggestion: catItem.brandSuggestion,
      description: catItem.description,
      badge: catItem.badge,
      order: targetItems.length + 1,
    };
    setBoardItems((prev) => [...prev, newItem]);
    showToast(`Добавлено в ${targetCol === 'cold' ? 'ХВС' : targetCol === 'hot' ? 'ГВС' : 'Общее'}: ${catItem.badge || catItem.name}`);
  };

  // Native HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, item: BoardNodeItem | (typeof CATALOG_ITEMS[0] & { isCatalog?: boolean })) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragOver = (e: React.DragEvent, column: 'cold' | 'hot' | 'shared' | 'trash') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== column) {
      setDragOverColumn(column);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetCol: 'cold' | 'hot' | 'shared' | 'trash') => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedItem) return;

    if (targetCol === 'trash') {
      if ('column' in draggedItem && draggedItem.column !== 'catalog') {
        handleDeleteItem(draggedItem.id);
      }
      setDraggedItem(null);
      return;
    }

    // If dragged from catalog
    if ('column' in draggedItem && draggedItem.column === 'catalog') {
      handleAddFromCatalog(draggedItem as any, targetCol);
    } else {
      // Existing board item moved
      handleMoveColumn(draggedItem.id, targetCol);
      showToast(`Узел перемещён в колонку ${targetCol === 'cold' ? 'ХВС' : targetCol === 'hot' ? 'ГВС' : 'Общее'}`);
    }

    setDraggedItem(null);
  };

  // Add custom node
  const handleAddCustomNode = () => {
    if (!customName.trim()) {
      showToast('Введите название компонента');
      return;
    }
    const targetItems = boardItems.filter((i) => i.column === customColumn);
    const newItem: BoardNodeItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: 'custom',
      column: customColumn,
      quantity: 1,
      unit: 'шт',
      unitPrice: Math.max(0, customPrice),
      badge: customBadge.trim() || 'Свой узел',
      order: targetItems.length + 1,
    };
    setBoardItems((prev) => [...prev, newItem]);
    setCustomName('');
    setIsAddCustomModalOpen(false);
    showToast('Свой узел добавлен на доску!');
  };

  // Save to estimates
  const handleSaveToEstimates = () => {
    const est: SavedEstimate = {
      id: `collector-board-${Date.now()}`,
      name: `Коллекторный узел ввода (${activePreset === 'foriver_premium' ? 'Премиум Foriver' : activePreset === 'comfort' ? 'Комфорт' : 'Базовый'}, ${boardItems.length} узлов)`,
      createdAt: new Date().toISOString(),
      pipeLength: 0,
      selectedPoints: [],
      pipeType: 'stainless_22',
      pipeName: 'Пресс-нержавейка Valtec / Viega Sanpress',
      pipeMaterial: 'stainless',
      wiringScheme: 'collector',
      reserveMargin: 0,
      includePressureReducers: true,
      use45Elbows: true,
      includeBypasses: true,
      grandTotal: grandTotal,
      totalPointsCount: coldItems.length + hotItems.length,
      totalLinesCount: coldItems.length + hotItems.length,
      items: [
        ...boardItems.map((b) => ({
          name: `[${b.column === 'cold' ? 'ХВС' : b.column === 'hot' ? 'ГВС' : 'ОБЩЕЕ'}] ${b.name}`,
          quantity: `${b.quantity} ${b.unit}`,
          unit: b.unit,
          price: b.unitPrice,
          total: b.unitPrice * b.quantity,
          category: b.column === 'cold' ? 'Холодная вода (ХВС)' : b.column === 'hot' ? 'Горячая вода (ГВС)' : 'Общее оборудование',
        })),
        ...(includeLabor
          ? [
              {
                name: `Сборка и монтаж узла ввода (${laborLevel === 'premium' ? 'Премиум на раме Walraven' : 'Стандарт'})`,
                quantity: '1 узел',
                unit: 'узел',
                price: laborCost,
                total: laborCost,
                category: 'Монтажные работы',
              },
            ]
          : []),
      ],
      kitType: 'custom',
    };

    if (onSaveEstimate) {
      onSaveEstimate(est);
    }

    try {
      const existing = localStorage.getItem('plumbing_saved_estimates');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(est);
      localStorage.setItem('plumbing_saved_estimates', JSON.stringify(list));
      showToast('Доска узла успешно сохранена в "Мои сметы"!');
    } catch {
      showToast('Смета сохранена!');
    }
  };

  const handleCopyText = () => {
    let txt = `СМЕТА: КОЛЛЕКТОРНЫЙ УЗЕЛ ВОДОСНАБЖЕНИЯ (ДОСКА ЗАДАЧ САНТЕХПРО)\n`;
    txt += `Конфигурация: ${activePreset === 'foriver_premium' ? 'Премиум ЖК Foriver' : activePreset === 'comfort' ? 'Комфорт Плюс' : 'Базовый'}\n`;
    txt += `Всего компонентов на доске: ${boardItems.length} шт (ХВС: ${coldItems.length}, ГВС: ${hotItems.length}, Общих: ${sharedItems.length})\n\n`;

    txt += `--- ЛИНИЯ ХВС (ХОЛОДНАЯ ВОДА) ---\n`;
    coldItems.forEach((it, idx) => {
      txt += `${idx + 1}. ${it.name} [${it.badge || ''}] — ${it.quantity} ${it.unit} x ${it.unitPrice.toLocaleString('ru-RU')} ₽ = ${(it.unitPrice * it.quantity).toLocaleString('ru-RU')} ₽\n`;
    });

    txt += `\n--- ЛИНИЯ ГВС (ГОРЯЧАЯ ВОДА) ---\n`;
    hotItems.forEach((it, idx) => {
      txt += `${idx + 1}. ${it.name} [${it.badge || ''}] — ${it.quantity} ${it.unit} x ${it.unitPrice.toLocaleString('ru-RU')} ₽ = ${(it.unitPrice * it.quantity).toLocaleString('ru-RU')} ₽\n`;
    });

    txt += `\n--- ОБЩИЕ И СЕРВИСНЫЕ УЗЛЫ ---\n`;
    sharedItems.forEach((it, idx) => {
      txt += `${idx + 1}. ${it.name} [${it.badge || ''}] — ${it.quantity} ${it.unit} x ${it.unitPrice.toLocaleString('ru-RU')} ₽ = ${(it.unitPrice * it.quantity).toLocaleString('ru-RU')} ₽\n`;
    });

    txt += `\nИтого оборудование и материалы: ${totalMaterialsCost.toLocaleString('ru-RU')} ₽\n`;
    if (includeLabor) {
      txt += `Сборка и монтаж узла: ${laborCost.toLocaleString('ru-RU')} ₽ (${laborLevel === 'premium' ? 'Премиум на раме Walraven' : 'Стандарт'})\n`;
    }
    txt += `ИТОГО К ОПЛАТЕ: ${grandTotal.toLocaleString('ru-RU')} ₽\n`;

    navigator.clipboard.writeText(txt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      showToast('Смета узла скопирована в буфер обмена!');
    });
  };

  const handleDownloadTxt = () => {
    let txt = `======================================================================\n`;
    txt += `                            САНТЕХПРО\n`;
    txt += `       ИНТЕРАКТИВНАЯ ДОСКА УЗЛА ВВОДА ВОДОСНАБЖЕНИЯ\n`;
    txt += `======================================================================\n\n`;
    txt += `Конфигурация:      ${activePreset === 'foriver_premium' ? 'Премиум ЖК Foriver' : activePreset === 'comfort' ? 'Комфорт Плюс' : 'Базовый'}\n`;
    txt += `Дата:              ${new Date().toLocaleDateString('ru-RU')}\n`;
    txt += `Всего узлов:       ${boardItems.length} шт\n\n`;

    txt += `1. ЛИНИЯ ХВС (Холодная вода):\n`;
    coldItems.forEach((it, i) => {
      txt += `   ${i + 1}. ${it.name} (${it.badge || ''}) — ${it.quantity} ${it.unit} x ${it.unitPrice} ₽ = ${it.quantity * it.unitPrice} ₽\n`;
    });

    txt += `\n2. ЛИНИЯ ГВС (Горячая вода):\n`;
    hotItems.forEach((it, i) => {
      txt += `   ${i + 1}. ${it.name} (${it.badge || ''}) — ${it.quantity} ${it.unit} x ${it.unitPrice} ₽ = ${it.quantity * it.unitPrice} ₽\n`;
    });

    txt += `\n3. ОБЩИЕ И СЕРВИСНЫЕ СИСТЕМЫ:\n`;
    sharedItems.forEach((it, i) => {
      txt += `   ${i + 1}. ${it.name} (${it.badge || ''}) — ${it.quantity} ${it.unit} x ${it.unitPrice} ₽ = ${it.quantity * it.unitPrice} ₽\n`;
    });

    txt += `\n----------------------------------------------------------------------\n`;
    txt += `Итого материалы:   ${totalMaterialsCost} ₽\n`;
    if (includeLabor) {
      txt += `Монтаж узла:       ${laborCost} ₽\n`;
    }
    txt += `ИТОГО:             ${grandTotal} ₽\n`;

    // Add UTF-8 BOM (\uFEFF) so Android and Windows text viewers display Russian Cyrillic cleanly without mojibake
    const blob = new Blob(['\uFEFF' + txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `santehpro-board-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Текстовый файл сохранен (.txt)!');
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('Формирование официального PDF...');
      const presetLabel =
        activePreset === 'foriver_premium'
          ? 'Премиум Foriver'
          : activePreset === 'comfort'
          ? 'Комфорт Плюс'
          : activePreset === 'optimum'
          ? 'Базовый'
          : 'Индивидуальная конфигурация';

      await downloadCollectorBoardPdf({
        presetName: presetLabel,
        coldItems,
        hotItems,
        sharedItems,
        totalMaterialsCost,
        laborCost,
        includeLabor,
        grandTotal,
      });
      showToast('PDF-файл успешно скачан!');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Не удалось сформировать PDF. Используйте печать.');
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = () => {
    let msg = `Здравствуйте! Направляю вам расчёт сметы коллекторного узла ввода:\n`;
    msg += `• Комплектация: ${activePreset === 'foriver_premium' ? 'Премиум Foriver' : activePreset === 'comfort' ? 'Комфорт' : 'Базовый'}\n`;
    msg += `• Позиций оборудования: ${boardItems.length} шт\n`;
    msg += `• Оборудование и материалы: ${totalMaterialsCost.toLocaleString('ru-RU')} ₽\n`;
    if (includeLabor) {
      msg += `• Сборка и монтаж узла: ${laborCost.toLocaleString('ru-RU')} ₽\n`;
    }
    msg += `• ИТОГО ПО СМЕТЕ: ${grandTotal.toLocaleString('ru-RU')} ₽\n\n`;
    msg += `Сформировано сервисом «СантехПро».`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareTelegram = () => {
    let msg = `Смета узла ввода (${boardItems.length} поз.):\n`;
    msg += `Материалы: ${totalMaterialsCost.toLocaleString('ru-RU')} ₽\n`;
    if (includeLabor) {
      msg += `Монтаж: ${laborCost.toLocaleString('ru-RU')} ₽\n`;
    }
    msg += `ИТОГО: ${grandTotal.toLocaleString('ru-RU')} ₽`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in duration-200 text-xs sm:text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-slate-800 p-5 sm:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-3">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Интерактивная доска задач узла ввода</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Канбан-конструктор узла водоснабжения
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Перетаскивайте узлы мышкой или стрелочками между линиями <strong>ХВС</strong>, <strong>ГВС</strong> и <strong>Общими системами</strong>. Добавляйте краны, фильтры, редукторы и бойлеры прямо из каталога оборудования!
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSaveToEstimates}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>В мои сметы</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-cyan-950/40"
            >
              <Download className="w-4 h-4" />
              <span>Смета / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control bar: Presets, Views, Quick actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl">
        {/* Presets buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Готовые наборы:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset('foriver_premium')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
              activePreset === 'foriver_premium'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>🏆 Премиум Foriver</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('comfort')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
              activePreset === 'comfort'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>💎 Комфорт Плюс</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('optimum')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
              activePreset === 'optimum'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>⚡ Базовый узел</span>
          </button>
          <button
            type="button"
            onClick={handleClearBoard}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-bold transition cursor-pointer border border-slate-700/60"
            title="Очистить доску и собрать вручную"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View toggles & Add custom */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddCustomModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Добавить свой узел</span>
          </button>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                viewMode === 'board' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Доска задач</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('spec')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                viewMode === 'spec' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Спецификация</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {/* Column 1: Cold Water (ХВС) */}
          <div
            onDragOver={(e) => handleDragOver(e, 'cold')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'cold')}
            className={`rounded-2xl border transition-all duration-200 p-4 bg-slate-900/90 flex flex-col min-h-[580px] ${
              dragOverColumn === 'cold'
                ? 'border-cyan-400 ring-2 ring-cyan-500/50 bg-cyan-950/20'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                <h3 className="text-sm font-black text-white">Линия ХВС (Холодная)</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {coldItems.length}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 leading-snug">
              Последовательность холодной воды: отсечной кран ➔ грязевик ➔ счетчик ➔ редуктор ➔ фильтр 100 мкм ➔ коллектор
            </p>

            {/* Droppable cards list */}
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {coldItems.length === 0 ? (
                <div className="h-40 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs">
                  <span>Перетащите сюда элементы из склада справа</span>
                </div>
              ) : (
                coldItems.map((item, idx) => (
                  <BoardCard
                    key={item.id}
                    item={item}
                    index={idx}
                    totalInCol={coldItems.length}
                    colorClass="border-cyan-500/30 hover:border-cyan-400/60 bg-slate-950/80"
                    badgeClass="bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                    onDragStart={(e) => handleDragStart(e, item)}
                    onMoveCol={(col) => handleMoveColumn(item.id, col)}
                    onReorder={(dir) => handleReorder(item.id, dir)}
                    onQuantityChange={(delta) => handleQuantityChange(item.id, delta)}
                    onDelete={() => handleDeleteItem(item.id)}
                    onDuplicate={() => handleDuplicateItem(item)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 2: Hot Water (ГВС) */}
          <div
            onDragOver={(e) => handleDragOver(e, 'hot')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'hot')}
            className={`rounded-2xl border transition-all duration-200 p-4 bg-slate-900/90 flex flex-col min-h-[580px] ${
              dragOverColumn === 'hot'
                ? 'border-rose-400 ring-2 ring-rose-500/50 bg-rose-950/20'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 shadow-sm shadow-rose-400" />
                <h3 className="text-sm font-black text-white">Линия ГВС (Горячая)</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {hotItems.length}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 leading-snug">
              Последовательность горячей воды: ввод ➔ грязевик ➔ редуктор ➔ тонкая очистка ➔ гаситель гидроудара ➔ коллектор
            </p>

            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {hotItems.length === 0 ? (
                <div className="h-40 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs">
                  <span>Перетащите сюда элементы из склада справа</span>
                </div>
              ) : (
                hotItems.map((item, idx) => (
                  <BoardCard
                    key={item.id}
                    item={item}
                    index={idx}
                    totalInCol={hotItems.length}
                    colorClass="border-rose-500/30 hover:border-rose-400/60 bg-slate-950/80"
                    badgeClass="bg-rose-500/15 text-rose-300 border-rose-500/30"
                    onDragStart={(e) => handleDragStart(e, item)}
                    onMoveCol={(col) => handleMoveColumn(item.id, col)}
                    onReorder={(dir) => handleReorder(item.id, dir)}
                    onQuantityChange={(delta) => handleQuantityChange(item.id, delta)}
                    onDelete={() => handleDeleteItem(item.id)}
                    onDuplicate={() => handleDuplicateItem(item)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 3: Shared & Service Equipment (Общие) */}
          <div
            onDragOver={(e) => handleDragOver(e, 'shared')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'shared')}
            className={`rounded-2xl border transition-all duration-200 p-4 bg-slate-900/90 flex flex-col min-h-[580px] ${
              dragOverColumn === 'shared'
                ? 'border-emerald-400 ring-2 ring-emerald-500/50 bg-emerald-950/20'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                <h3 className="text-sm font-black text-white">Общие и сервисные узлы</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {sharedItems.length}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 leading-snug">
              Водонагреватели, байпас обратной промывки, питьевой осмос, монтажная консольная рама Walraven
            </p>

            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {sharedItems.length === 0 ? (
                <div className="h-40 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs">
                  <span>Перетащите сюда бойлер, раму или байпас</span>
                </div>
              ) : (
                sharedItems.map((item, idx) => (
                  <BoardCard
                    key={item.id}
                    item={item}
                    index={idx}
                    totalInCol={sharedItems.length}
                    colorClass="border-emerald-500/30 hover:border-emerald-400/60 bg-slate-950/80"
                    badgeClass="bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    onDragStart={(e) => handleDragStart(e, item)}
                    onMoveCol={(col) => handleMoveColumn(item.id, col)}
                    onReorder={(dir) => handleReorder(item.id, dir)}
                    onQuantityChange={(delta) => handleQuantityChange(item.id, delta)}
                    onDelete={() => handleDeleteItem(item.id)}
                    onDuplicate={() => handleDuplicateItem(item)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 4: Catalog Equipment / Warehouse (Склад) */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-4 flex flex-col min-h-[580px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-amber-300">Склад оборудования</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-bold">
                {CATALOG_ITEMS.length} поз.
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 leading-snug">
              Зажмите карточку и <strong>перетащите в нужную колонку</strong>, либо нажмите кнопки быстрой отправки:
            </p>

            {/* Catalog items list */}
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[640px] pr-1">
              {CATALOG_ITEMS.map((cat) => (
                <div
                  key={cat.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, { ...cat, column: 'catalog' } as any)}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/50 transition cursor-grab active:cursor-grabbing group shadow-sm"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-white leading-tight truncate">
                        {cat.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">
                    <span className="text-xs font-black text-amber-400">
                      {cat.unitPrice.toLocaleString('ru-RU')} ₽
                    </span>

                    {/* Quick add buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleAddFromCatalog(cat, 'cold')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-black bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 transition cursor-pointer"
                        title="Добавить в ХВС"
                      >
                        + ХВС
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddFromCatalog(cat, 'hot')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-slate-950 transition cursor-pointer"
                        title="Добавить в ГВС"
                      >
                        + ГВС
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddFromCatalog(cat, 'shared')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 transition cursor-pointer"
                        title="Добавить в Общие"
                      >
                        + Общ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* View Mode: Full Table Specification */
        <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-white">Сводная спецификация узла ввода</h3>
              <p className="text-xs text-slate-400">Сформирована на основе установленных карточек на доске</p>
            </div>
            <span className="text-xs font-bold text-cyan-400">{boardItems.length} позиций</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {boardItems.map((item, idx) => (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/30 px-2 rounded-xl transition">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 w-5">#{idx + 1}</span>
                    <span className="text-xs sm:text-sm font-bold text-white">{item.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      item.column === 'cold' ? 'bg-cyan-500/20 text-cyan-300' : item.column === 'hot' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {item.column === 'cold' ? 'Линия ХВС' : item.column === 'hot' ? 'Линия ГВС' : 'Общее оборудование'}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <div className="text-[11px] text-slate-400 pl-7 mt-0.5">{item.description}</div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 pl-7 sm:pl-0 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-black text-white">
                      {(item.unitPrice * item.quantity).toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.quantity} {item.unit} x {item.unitPrice.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Labor Settings and Summary Footer Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Labor Settings & Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLabor}
                  onChange={(e) => setIncludeLabor(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
                <span className="text-sm font-bold text-white">
                  Включить сборку и шеф-монтаж узла ввода мастером
                </span>
              </label>
              <span className="text-xs font-black text-cyan-400">
                {includeLabor ? `${laborCost.toLocaleString('ru-RU')} ₽` : 'Без монтажа'}
              </span>
            </div>

            {includeLabor && (
              <div className="space-y-3 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Расценка исполнителя за сборку узла:</span>
                  <span className="text-cyan-400 font-extrabold">{laborCost.toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLaborLevel('custom')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      laborLevel === 'custom'
                        ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-md ring-1 ring-cyan-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-300">✍️ Своя договорная цена</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">Актуально</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-cyan-400">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="130000"
                          value={customLaborCost === 0 ? '' : customLaborCost}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLaborLevel('custom');
                          }}
                          onChange={(e) => {
                            setLaborLevel('custom');
                            const raw = e.target.value;
                            const num = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);
                            setCustomLaborCost(num);
                          }}
                          className="w-full bg-transparent text-sm text-white font-extrabold outline-none"
                        />
                        <span className="text-xs text-cyan-400 font-bold">₽</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[85000, 110000, 130000, 160000].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLaborLevel('custom');
                            setCustomLaborCost(chip);
                          }}
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold transition cursor-pointer ${
                            customLaborCost === chip && laborLevel === 'custom'
                              ? 'bg-cyan-500 text-slate-950 font-black'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {(chip / 1000).toFixed(0)}k ₽
                        </button>
                      ))}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLaborLevel('premium')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      laborLevel === 'premium'
                        ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-md ring-1 ring-cyan-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">🏆 Премиум на раме</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">135 000 ₽</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      Монтаж на консольной раме Walraven / Mupro, нержавеющая пресс-сталь, компенсаторы гидроударов, байпас, настройка Neptun Smart, опрессовка 10 бар
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLaborLevel('standard')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      laborLevel === 'standard'
                        ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-md ring-1 ring-cyan-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">⚡ Базовый узел</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">85 000 ₽</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      Сборка узла на кронштейнах, подключение к вводным стоякам ХВС/ГВС, фильтрация, редукторы и гидравлическая опрессовка
                    </p>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 leading-snug flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    Рыночная цена монтажа современного узла обычно составляет <strong>85 000 — 160 000 ₽</strong>. Введите реальную расценку вашего исполнителя или выключите чекбокс, чтобы считать только чистую закупку материалов.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1.5">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Как работает доска узлов ввода:</span>
            </div>
            <p>
              Каждая колонка представляет собой гидравлическую цепочку. Вода течет сверху вниз от отсечного крана к коллектору. Вы можете переставить любой элемент (например, поставить редуктор до или после фильтра тонкой очистки), добавить второй манометр или дополнительный коллектор.
            </p>
          </div>
        </div>

        {/* Right Col: Price summary */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
          <h3 className="text-base font-black text-white flex items-center justify-between">
            <span>Итог по доске</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
              {boardItems.length} узлов
            </span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Холодная линия (ХВС):</span>
              <span className="font-bold text-white">
                {coldItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0).toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Горячая линия (ГВС):</span>
              <span className="font-bold text-white">
                {hotItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0).toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Общие системы (бойлер, рама):</span>
              <span className="font-bold text-white">
                {sharedItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0).toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
              <span>Оборудование и материалы:</span>
              <span className="font-black text-cyan-300">{totalMaterialsCost.toLocaleString('ru-RU')} ₽</span>
            </div>
            {includeLabor && (
              <div className="flex justify-between text-slate-400">
                <span>Монтаж под ключ:</span>
                <span className="font-black text-amber-400">{laborCost.toLocaleString('ru-RU')} ₽</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-200">ИТОГО:</span>
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-emerald-400">
                {grandTotal.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-cyan-950/40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Скачать смету (PDF / TXT)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition border border-slate-700 cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Скопировано!' : 'Скопировать смету'}</span>
            </button>

            {onOpenSpecialists && (
              <button
                type="button"
                onClick={onOpenSpecialists}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Вызвать мастера на монтаж узла</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Item Modal */}
      {isAddCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <span>Добавить свой элемент на доску</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCustomModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Название узла или оборудования</label>
                <input
                  type="text"
                  placeholder="Например: Магнитный умягчитель воды или Сливной трап"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">Ориентировочная цена (₽)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={customPrice === 0 ? '' : customPrice}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const num = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);
                      setCustomPrice(num);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">Метка / Бейдж</label>
                  <input
                    type="text"
                    placeholder="3/4 / Доп. защита"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">В какую колонку поместить:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomColumn('cold')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      customColumn === 'cold' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ХВС (Холодная)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomColumn('hot')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      customColumn === 'hot' ? 'bg-rose-500/20 border-rose-400 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ГВС (Горячая)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomColumn('shared')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      customColumn === 'shared' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Общие узлы
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddCustomModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleAddCustomNode}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Добавить на доску
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export / Print Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>Смета коллекторного узла ввода</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Конфигурация доски:</span>
                <span className="font-bold text-white">
                  {activePreset === 'foriver_premium' ? 'Премиум Foriver' : activePreset === 'comfort' ? 'Комфорт' : 'Базовый'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Всего элементов:</span>
                <span className="font-bold text-cyan-400">{boardItems.length} позиций</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Материалы:</span>
                <span className="font-bold text-white">{totalMaterialsCost.toLocaleString('ru-RU')} ₽</span>
              </div>
              {includeLabor && (
                <div className="flex justify-between text-slate-300">
                  <span>Монтажные работы:</span>
                  <span className="font-bold text-amber-400">{laborCost.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>ИТОГО К ОПЛАТЕ:</span>
                <span className="text-cyan-400">{grandTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>

            {/* Share to Messenger Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-md"
                title="Отправить смету заказчику в WhatsApp"
              >
                <Share2 className="w-4 h-4" />
                <span>В WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleShareTelegram}
                className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-md"
                title="Отправить смету заказчику в Telegram"
              >
                <Send className="w-4 h-4" />
                <span>В Telegram</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadPdf}
                className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-cyan-950/40 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Скачать PDF</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition border border-slate-700 cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Скачать TXT</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition border border-slate-700 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Печать</span>
              </button>
              <button
                type="button"
                onClick={handleCopyText}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition border border-slate-700 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-emerald-400" />
                <span>Скопировать</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Board Card Component with HTML5 Drag & Mobile arrows
interface BoardCardProps {
  item: BoardNodeItem;
  index: number;
  totalInCol: number;
  colorClass: string;
  badgeClass: string;
  onDragStart: (e: React.DragEvent) => void;
  onMoveCol: (targetCol: 'cold' | 'hot' | 'shared') => void;
  onReorder: (dir: 'up' | 'down') => void;
  onQuantityChange: (delta: number) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const BoardCard: React.FC<BoardCardProps> = ({
  item,
  index,
  totalInCol,
  colorClass,
  badgeClass,
  onDragStart,
  onMoveCol,
  onReorder,
  onQuantityChange,
  onDelete,
  onDuplicate,
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`p-3 rounded-2xl border transition-all duration-150 cursor-grab active:cursor-grabbing group shadow-md ${colorClass}`}
    >
      {/* Header of card: order, title, drag icon */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center space-x-1.5 min-w-0 flex-1">
          <span className="text-[10px] font-black text-slate-500 w-4 shrink-0">#{index + 1}</span>
          <span className="text-xs font-bold text-white leading-snug line-clamp-2">
            {item.name}
          </span>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition" />
        </div>
      </div>

      {/* Badges & Brand */}
      <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-y-1">
        {item.badge && (
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${badgeClass}`}>
            {item.badge}
          </span>
        )}
        {item.brandSuggestion && (
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
            {item.brandSuggestion}
          </span>
        )}
      </div>

      {/* Price and quantity controls */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
        <div>
          <div className="text-xs font-black text-white">
            {(item.unitPrice * item.quantity).toLocaleString('ru-RU')} ₽
          </div>
          {item.quantity > 1 && (
            <div className="text-[9px] text-slate-400">
              {item.quantity} x {item.unitPrice.toLocaleString('ru-RU')} ₽
            </div>
          )}
        </div>

        {/* Quantity selector */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg px-1 py-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuantityChange(-1);
            }}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white text-xs font-black cursor-pointer"
          >
            -
          </button>
          <span className="w-4 text-center text-xs font-bold text-white">{item.quantity}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuantityChange(1);
            }}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white text-xs font-black cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Action toolstrip: Reorder & Quick Move between columns */}
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/50 text-[10px]">
        {/* Reorder up/down */}
        <div className="flex items-center space-x-0.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              onReorder('up');
            }}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
            title="Переместить выше по цепочке"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index >= totalInCol - 1}
            onClick={(e) => {
              e.stopPropagation();
              onReorder('down');
            }}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
            title="Переместить ниже по цепочке"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick move to another column */}
        <div className="flex items-center space-x-1">
          {item.column !== 'cold' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveCol('cold');
              }}
              className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-cyan-500/20 text-cyan-400 border border-slate-800 text-[9px] font-bold cursor-pointer"
              title="Перенести в ХВС"
            >
              ХВС
            </button>
          )}
          {item.column !== 'hot' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveCol('hot');
              }}
              className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-rose-500/20 text-rose-400 border border-slate-800 text-[9px] font-bold cursor-pointer"
              title="Перенести в ГВС"
            >
              ГВС
            </button>
          )}
          {item.column !== 'shared' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveCol('shared');
              }}
              className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-emerald-500/20 text-emerald-400 border border-slate-800 text-[9px] font-bold cursor-pointer"
              title="Перенести в Общее"
            >
              Общ
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 rounded text-slate-500 hover:text-cyan-400 cursor-pointer"
            title="Дублировать узел"
          >
            <Copy className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded text-slate-500 hover:text-rose-400 cursor-pointer"
            title="Удалить"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
