import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Star,
  Plus,
  Minus,
  Flame,
  Zap,
  Grid,
  Ruler,
  Wrench,
  Gauge,
  PackageCheck,
  ShoppingCart,
  Trash2,
  SlidersHorizontal,
  Info,
  Sparkles,
  Check,
  Boxes,
  Copy,
  Printer
} from 'lucide-react';

export interface PlumbingItem {
  id: string;
  category: 'heat_pumps' | 'leak_and_filters' | 'installations_drains' | 'electric_boilers' | 'solid_boilers' | 'collectors' | 'pipes' | 'fittings' | 'pumps_tanks' | 'insulation_supplies';
  categoryLabel: string;
  name: string;
  brand?: string;
  spec?: string;
  unit: 'м' | 'шт' | 'компл' | 'рулон' | 'упак';
  price: number;
  isPipe?: boolean;
  defaultStep?: number;
  description?: string;
}

export const CATALOG_MATERIALS: PlumbingItem[] = [
  // --- ТЕПЛОВЫЕ НАСОСЫ И БКН ---
  {
    id: 'hp_1',
    category: 'heat_pumps',
    categoryLabel: 'Тепловые насосы & БКН',
    name: 'Тепловой насос «воздух-вода» сплит Cooper&Hunter 9 кВт',
    brand: 'Cooper&Hunter',
    spec: '9 кВт, наружный блок + гидромодуль, фреон R32, COP до 4.8',
    unit: 'компл',
    price: 385000,
    description: 'Инверторный тепловой насос с функцией отопления, охлаждения и нагрева ГВС до +55°C.',
  },
  {
    id: 'hp_2',
    category: 'heat_pumps',
    categoryLabel: 'Тепловые насосы & БКН',
    name: 'Тепловой насос «воздух-вода» Midea M-Thermal Arctic 12 кВт',
    brand: 'Midea',
    spec: '12 кВт, работа до -25°C, встроенный циркуляционный насос Wilo',
    unit: 'компл',
    price: 460000,
    description: 'Высокоэффективный тепловой насос для домов до 160 м² с сенсорным пультом и Wi-Fi.',
  },
  {
    id: 'hp_3',
    category: 'heat_pumps',
    categoryLabel: 'Тепловые насосы & БКН',
    name: 'Тепловой насос моноблок Haier Super Aqua 8 кВт',
    brand: 'Haier',
    spec: '8 кВт моноблок, вся гидравлика в одном корпусе на улице',
    unit: 'шт',
    price: 310000,
    description: 'Удобный монтаж без работы с фреоном (в дом заходит теплоноситель с гликолем/водой).',
  },
  {
    id: 'hp_4',
    category: 'heat_pumps',
    categoryLabel: 'Тепловые насосы & БКН',
    name: 'Буферная ёмкость (теплоаккумулятор) Drazice NADO 200 л',
    brand: 'Drazice',
    spec: '200 л, стальной бак с полиуретановой изоляцией 50 мм, 4 патрубка 5/4"',
    unit: 'шт',
    price: 49500,
    description: 'Обязательный гидравлический разделитель для стабильной работы компрессора ТН.',
  },
  {
    id: 'hp_5',
    category: 'heat_pumps',
    categoryLabel: 'Тепловые насосы & БКН',
    name: 'Буферная ёмкость Stout 100 л настенная',
    brand: 'Stout',
    spec: '100 л, компактный настенный монтаж, патрубки 1 1/2"',
    unit: 'шт',
    price: 29800,
    description: 'Для небольших котельных с тепловыми насосами и гидромодулями.',
  },
  {
    id: 'hp_6',
    category: 'heat_pumps',
    categoryLabel: 'Тепловые насосы & БКН',
    name: 'Бойлер косвенного нагрева Hajdu STA 200 C2 для тепловых насосов',
    brand: 'Hajdu',
    spec: '200 л, увеличенный теплообменник 2.4 м² под низкотемпературный ТН',
    unit: 'шт',
    price: 68500,
    description: 'Быстрый прогрев воды даже при температуре подачи теплоносителя +50°C.',
  },
  {
    id: 'hp_7',
    category: 'heat_pumps',
    categoryLabel: 'Тепловые насосы & БКН',
    name: 'Трехходовой переключающий клапан Stout 1" с электроприводом 230V',
    brand: 'Stout',
    spec: '1" ВР, Kvs 8.0, время поворота 15 сек, концевые выключатели',
    unit: 'шт',
    price: 8600,
    description: 'Мгновенное переключение подачи тепла с отопления на бойлер косвенного нагрева.',
  },
  {
    id: 'hp_8',
    category: 'heat_pumps',
    categoryLabel: 'Тепловые насосы & БКН',
    name: 'Комплект виброопор и фундаментного кронштейна под наружный блок ТН',
    brand: 'SantehPro',
    spec: 'Резинометаллические виброгасители до 150 кг + усиленный кронштейн',
    unit: 'компл',
    price: 6200,
    description: 'Полное гашение низкочастотной вибрации и шума компрессора.',
  },

  // --- УЗЛЫ ВВОДА, ФИЛЬТРАЦИЯ & ЗАЩИТА ОТ ПРОТЕЧЕК ---
  {
    id: 'lf_1',
    category: 'leak_and_filters',
    categoryLabel: 'Узлы ввода & Защита от протечек',
    name: 'Система защиты от протечек Neptun Smart с кранами Bugatti 1/2" Pro',
    brand: 'Neptun',
    spec: 'Wi-Fi, 2 крана Bugatti латунь 1/2", 4 радиодатчика, резервное питание',
    unit: 'компл',
    price: 24500,
    description: 'Автоматическое перекрытие воды за 5 сек при аварии + пуш-уведомление в смартфон.',
  },
  {
    id: 'lf_2',
    category: 'leak_and_filters',
    categoryLabel: 'Узлы ввода & Защита от протечек',
    name: 'Система защиты от протечек Neptun Aquacontrol 3/4"',
    brand: 'Neptun',
    spec: '2 крана 3/4" с электроприводом 220V + 2 проводных датчика',
    unit: 'компл',
    price: 18900,
    description: 'Надежный базовый комплект для квартиры или коттеджа.',
  },
  {
    id: 'lf_3',
    category: 'leak_and_filters',
    categoryLabel: 'Узлы ввода & Защита от протечек',
    name: 'Самопромывной фильтр FAR 1/2" 100 мкм с манометром и штуцером слива',
    brand: 'FAR',
    spec: '1/2" ВР, сетка из нерж. стали AISI 316 100 мкм, манометр 0-10 бар',
    unit: 'шт',
    price: 5400,
    description: 'Защищает редукторы давления и сантехнику от окалины, песка и ржавчины.',
  },
  {
    id: 'lf_4',
    category: 'leak_and_filters',
    categoryLabel: 'Узлы ввода & Защита от протечек',
    name: 'Самопромывной фильтр Honeywell Braukmann FK06 3/4"',
    brand: 'Honeywell',
    spec: '3/4" НР, прозрачная ударопрочная чаша, 100 мкм, поворотный спуск',
    unit: 'шт',
    price: 6800,
    description: 'Премиальный промывной фильтр немецкого качества.',
  },
  {
    id: 'lf_5',
    category: 'leak_and_filters',
    categoryLabel: 'Узлы ввода & Защита от протечек',
    name: 'Мембранный редуктор давления Caleffi 1/2" со шкалой (1-6 бар)',
    brand: 'Caleffi',
    spec: '1/2" ВР, компенсация давления до 25 бар, гнездо под манометр 1/4"',
    unit: 'шт',
    price: 4600,
    description: 'Мембранная конструкция не забивается грязью и держит точное давление 3.0 бар.',
  },
  {
    id: 'lf_6',
    category: 'leak_and_filters',
    categoryLabel: 'Узлы ввода & Защита от протечек',
    name: 'Мембранный компенсатор гидроударов Caleffi 1/2" (нержавеющая сталь)',
    brand: 'Caleffi',
    spec: '1/2" НР, гашение пиковых волн до 20 бар, мембрана EPDM',
    unit: 'шт',
    price: 2900,
    description: 'Защищает гибкие подводки, бойлеры и смесители от разрушительных гидроударов.',
  },
  {
    id: 'lf_7',
    category: 'leak_and_filters',
    categoryLabel: 'Узлы ввода & Защита от протечек',
    name: 'Система обратного осмоса Гейзер Престиж с минерализатором и баком',
    brand: 'Гейзер',
    spec: '5 ступеней очистки, мембрана Vontron 50 GPD, отдельный кран люкс',
    unit: 'компл',
    price: 13200,
    description: 'Идеально чистая питьевая вода ресторанного качества без накипи в чайнике.',
  },
  {
    id: 'lf_8',
    category: 'leak_and_filters',
    categoryLabel: 'Узлы ввода & Защита от протечек',
    name: 'Магистральная колба фильтрации Big Blue 10" (BB10) с кронштейном',
    brand: 'Аквафор',
    spec: '1" ВР, усиленный корпус до 8 бар, картридж 5 мкм вспененный полипропилен',
    unit: 'шт',
    price: 4300,
    description: 'Глубокая очистка воды на всю квартиру или дом.',
  },

  // --- ИНСТАЛЛЯЦИИ, ТРАПЫ & СКРЫТЫЙ МОНТАЖ ---
  {
    id: 'in_1',
    category: 'installations_drains',
    categoryLabel: 'Инсталляции & Скрытый монтаж',
    name: 'Монтажный элемент (инсталляция) Geberit Duofix Delta 112 см',
    brand: 'Geberit',
    spec: 'Самонесущая рама 400 кг, бачок с защитой от конденсата, клавиша Delta',
    unit: 'компл',
    price: 19800,
    description: 'Швейцарская надёжность №1 в мире для любых подвесных унитазов.',
  },
  {
    id: 'in_2',
    category: 'installations_drains',
    categoryLabel: 'Инсталляции & Скрытый монтаж',
    name: 'Комплект инсталляции Tece Profil 4 в 1 с хромированной клавишей',
    brand: 'Tece',
    spec: 'Рама 112 см, крепежи к стене, звукоизоляционная прокладка, клавиша TECEnow',
    unit: 'компл',
    price: 23500,
    description: 'Премиальный немецкий комплект инсталляции готовый к установке.',
  },
  {
    id: 'in_3',
    category: 'installations_drains',
    categoryLabel: 'Инсталляции & Скрытый монтаж',
    name: 'Душевой лоток (трап) Tece Linus 700 мм с сухим затвором и решеткой',
    brand: 'Tece',
    spec: 'Длина 700 мм, нержавеющая сталь, сифон с сухим мембранным затвором',
    unit: 'компл',
    price: 11800,
    description: 'Защищает ванную комнату от запаха из канализации даже при сухом сифоне.',
  },
  {
    id: 'in_4',
    category: 'installations_drains',
    categoryLabel: 'Инсталляции & Скрытый монтаж',
    name: 'Душевой трап точечный Viega Advantix 100х100 мм с сухим клапаном',
    brand: 'Viega',
    spec: 'Решетка нерж. сталь 100х100 мм, сухой затвор, боковой слив DN50',
    unit: 'компл',
    price: 8900,
    description: 'Компактный трап немецкой марки Viega для строительных душевых.',
  },
  {
    id: 'in_5',
    category: 'installations_drains',
    categoryLabel: 'Инсталляции & Скрытый монтаж',
    name: 'Универсальный блок скрытого монтажа смесителя Hansgrohe iBox Universal',
    brand: 'Hansgrohe',
    spec: '1/2" / 3/4", уплотнительный фланец, совместим со всеми внешними частями HG',
    unit: 'шт',
    price: 7900,
    description: 'Скрытая часть для встраиваемых термостатов и смесителей в стену душа.',
  },

  // --- ЭЛЕКТРОКОТЛЫ ---
  {
    id: 'eb_1',
    category: 'electric_boilers',
    categoryLabel: 'Электрокотлы',
    name: 'Электрокотел Protherm Скат 6 кВт (220В / 380В)',
    brand: 'Protherm',
    spec: '6 кВт, плавная регулировка, тэновый',
    unit: 'шт',
    price: 48500,
    description: 'Настенный одноконтурный котел с расширительным баком 8л и циркуляционным насосом.',
  },
  {
    id: 'eb_2',
    category: 'electric_boilers',
    categoryLabel: 'Электрокотлы',
    name: 'Электрокотел Protherm Скат 9 кВт (380В)',
    brand: 'Protherm',
    spec: '9 кВт, 3-фазный, встроенный насос и бак 8л',
    unit: 'шт',
    price: 52900,
    description: 'Флагманская модель для отопления частного дома до 90 м².',
  },
  {
    id: 'eb_3',
    category: 'electric_boilers',
    categoryLabel: 'Электрокотлы',
    name: 'Электрокотел Protherm Скат 12 кВт (380В)',
    brand: 'Protherm',
    spec: '12 кВт, с шиной eBUS для автоуправления',
    unit: 'шт',
    price: 56400,
    description: 'Электрический котел мощностью 12 кВт для помещений до 120 м².',
  },
  {
    id: 'eb_4',
    category: 'electric_boilers',
    categoryLabel: 'Электрокотлы',
    name: 'Электрокотел Stout 6 кВт (220В / 380В)',
    brand: 'Stout',
    spec: '6 кВт, электронное управление, погодозависимый',
    unit: 'шт',
    price: 38200,
    description: 'Надежный котел европейской сборки с тихими симисторами.',
  },
  {
    id: 'eb_5',
    category: 'electric_boilers',
    categoryLabel: 'Электрокотлы',
    name: 'Электрокотел Stout 9 кВт (380В)',
    brand: 'Stout',
    spec: '9 кВт, бесшумные симисторные ключи',
    unit: 'шт',
    price: 41500,
    description: 'Тихая работа, плавное переключение ступеней мощности.',
  },
  {
    id: 'eb_6',
    category: 'electric_boilers',
    categoryLabel: 'Электрокотлы',
    name: 'Электрокотел Stout 14 кВт (380В)',
    brand: 'Stout',
    spec: '14 кВт, автоматическая ротация ТЭНов',
    unit: 'шт',
    price: 49800,
    description: 'Для домов площадью до 140-150 м².',
  },
  {
    id: 'eb_7',
    category: 'electric_boilers',
    categoryLabel: 'Электрокотлы',
    name: 'Электрокотел ЭВАН NEXT 6 кВт',
    brand: 'ЭВАН',
    spec: '6 кВт, моноблок, ТЭН из нержавейки',
    unit: 'шт',
    price: 18900,
    description: 'Компактный бюджетный электрокотел для резервного или основного отопления.',
  },
  {
    id: 'eb_8',
    category: 'electric_boilers',
    categoryLabel: 'Электрокотлы',
    name: 'Электрокотел ЭВАН EXPERT 12 кВт (Миникотельная)',
    brand: 'ЭВАН',
    spec: '12 кВт, со встроенным насосом, баком и датчиками',
    unit: 'шт',
    price: 62300,
    description: 'Полнофункциональная миникотельная с интеллектуальным управлением.',
  },
  {
    id: 'eb_9',
    category: 'electric_boilers',
    categoryLabel: 'Электрокотлы',
    name: 'Электрокотел Tenko Эконом 4.5 кВт (220В)',
    brand: 'Tenko',
    spec: '4.5 кВт, 2 ступени мощности, механический термостат',
    unit: 'шт',
    price: 14200,
    description: 'Доступное решение для квартир, дач и гаражей.',
  },

  // --- ТВЕРДОТОПЛИВНЫЕ КОТЛЫ ---
  {
    id: 'sb_1',
    category: 'solid_boilers',
    categoryLabel: 'Твердотопливные котлы',
    name: 'Твердотопливный котел Zota Magna 15 кВт (полуавтомат)',
    brand: 'Zota',
    spec: '15 кВт, дрова / уголь / брикеты, длительное горение',
    unit: 'шт',
    price: 78500,
    description: 'Полуавтоматический котел с водяным контуром и пультами управления наддувом.',
  },
  {
    id: 'sb_2',
    category: 'solid_boilers',
    categoryLabel: 'Твердотопливные котлы',
    name: 'Твердотопливный котел Zota Box 8 кВт с варочной плитой',
    brand: 'Zota',
    spec: '8 кВт, с чугунной плитой для приготовления пищи',
    unit: 'шт',
    price: 32400,
    description: 'Компактный котел для небольших домов с плитой сверху.',
  },
  {
    id: 'sb_3',
    category: 'solid_boilers',
    categoryLabel: 'Твердотопливные котлы',
    name: 'Твердотопливный котел Лемакс Форвард-12.5',
    brand: 'Лемакс',
    spec: '12.5 кВт, стальной теплообменник 4мм',
    unit: 'шт',
    price: 39800,
    description: 'Вертикальная загрузка топлива, устойчив к высокому давлению.',
  },
  {
    id: 'sb_4',
    category: 'solid_boilers',
    categoryLabel: 'Твердотопливные котлы',
    name: 'Твердотопливный котел Теплодар Куппер Про-22',
    brand: 'Теплодар',
    spec: '22 кВт, водяная рубашка + колосник, до 8 часов горения',
    unit: 'шт',
    price: 58900,
    description: 'Мощный универсальный котел с возможностью установки ТЭНа.',
  },
  {
    id: 'sb_5',
    category: 'solid_boilers',
    categoryLabel: 'Твердотопливные котлы',
    name: 'Твердотопливный пеллетный котел Zota Pellet 20S',
    brand: 'Zota',
    spec: '20 кВт, бункер для пеллет 240л, авторозжиг',
    unit: 'шт',
    price: 245000,
    description: 'Автономное отопление до 7 дней на одной загрузке пеллет.',
  },
  {
    id: 'sb_6',
    category: 'solid_boilers',
    categoryLabel: 'Твердотопливные котлы',
    name: 'Регулятор тяги для твердотопливного котла Honeywell FR124',
    brand: 'Honeywell',
    spec: '3/4", термостатический цепочный регулятор 30-90°C',
    unit: 'шт',
    price: 4800,
    description: 'Автоматически приоткрывает/закрывает поддувало котла.',
  },
  {
    id: 'sb_7',
    category: 'solid_boilers',
    categoryLabel: 'Твердотопливные котлы',
    name: 'Дымоход сэндвич нержавейка AISI 304 150/220мм (1 метр)',
    brand: 'Ferrum',
    spec: 'Толщина 0.8мм, базальтовая вата 35мм высокой плотности',
    unit: 'шт',
    price: 3850,
    description: 'Пожаробезопасный утепленный сэндвич-элемент для отвода дымовых газов.',
  },

  // --- КОЛЛЕКТОРЫ И ТЁПЛЫЙ ПОЛ ---
  {
    id: 'col_1',
    category: 'collectors',
    categoryLabel: 'Коллекторы',
    name: 'Коллекторная группа Stout с расходомерами 3 выхода 1"',
    brand: 'Stout',
    spec: 'Нержавеющая сталь AISI 304, расходомеры 0-5 л/мин',
    unit: 'компл',
    price: 12400,
    description: 'Для систем радиаторного отопления и теплого пола на 3 контура.',
  },
  {
    id: 'col_2',
    category: 'collectors',
    categoryLabel: 'Коллекторы',
    name: 'Коллекторная группа Stout с расходомерами 5 выходов 1"',
    brand: 'Stout',
    spec: 'Нержавеющая сталь, евроконус 3/4"',
    unit: 'компл',
    price: 17900,
  },
  {
    id: 'col_3',
    category: 'collectors',
    categoryLabel: 'Коллекторы',
    name: 'Коллекторная группа Stout с расходомерами 8 выходов 1"',
    brand: 'Stout',
    spec: 'Нержавеющая сталь, с воздухоотводчиками и кранами слива',
    unit: 'компл',
    price: 25600,
  },
  {
    id: 'col_4',
    category: 'collectors',
    categoryLabel: 'Коллекторы',
    name: 'Коллекторная группа Valtec с расходомерами 10 выходов 1"',
    brand: 'Valtec',
    spec: 'Латунь никелированная, в сборе с кронштейнами',
    unit: 'компл',
    price: 28400,
  },
  {
    id: 'col_5',
    category: 'collectors',
    categoryLabel: 'Коллекторы',
    name: 'Насосно-смесительный узел Tim с насосом 25/60',
    brand: 'Tim',
    spec: 'Для водяного теплого пола, термоголовка 20-60°C',
    unit: 'компл',
    price: 16800,
    description: 'Поддерживает стабильную температуру теплоносителя в контурах пола.',
  },
  {
    id: 'col_6',
    category: 'collectors',
    categoryLabel: 'Коллекторы',
    name: 'Насосно-смесительный узел Stout DualMix (без насоса)',
    brand: 'Stout',
    spec: 'Европейское качество, точная регулировка байпаса',
    unit: 'компл',
    price: 24900,
  },
  {
    id: 'col_7',
    category: 'collectors',
    categoryLabel: 'Коллекторы',
    name: 'Шкаф коллекторный встраиваемый ШРВ-2 (670х650х120мм)',
    brand: 'РосТурПласт',
    spec: 'Встраиваемый в стену, оцинкованная сталь с порошковой покраской',
    unit: 'шт',
    price: 4100,
  },
  {
    id: 'col_8',
    category: 'collectors',
    categoryLabel: 'Коллекторы',
    name: 'Шкаф коллекторный накладной ШРН-3 (870х650х120мм)',
    brand: 'РосТурПласт',
    spec: 'Пристенный накладной, замок на дверце',
    unit: 'шт',
    price: 4800,
  },
  {
    id: 'col_9',
    category: 'collectors',
    categoryLabel: 'Коллекторы',
    name: 'Сервопривод термический Stout 220V NC M30x1.5',
    brand: 'Stout',
    spec: 'Нормально закрытый, время срабатывания 3 мин',
    unit: 'шт',
    price: 1650,
  },

  // --- ТРУБЫ И МЕТРАЖ ---
  {
    id: 'p_1',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Труба сшитый полиэтилен PEX-A Stout 16x2.0 (красная с EVOH)',
    brand: 'Stout',
    spec: '16х2.0мм, кислородный барьер, бухта до 200м',
    unit: 'м',
    price: 125,
    isPipe: true,
    defaultStep: 10,
    description: 'Идеальный выбор для водяного тёплого пола и лучевой разводки радиаторов.',
  },
  {
    id: 'p_2',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Труба PEX-A Rehau Rautitan Flex 16x2.2',
    brand: 'Rehau',
    spec: '16х2.2мм, универсальная отопление/водоснабжение',
    unit: 'м',
    price: 210,
    isPipe: true,
    defaultStep: 10,
  },
  {
    id: 'p_3',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Труба PEX-A Valtec 20x2.0 с кислородным слоем',
    brand: 'Valtec',
    spec: '20х2.0мм, прочная магистральная труба',
    unit: 'м',
    price: 175,
    isPipe: true,
    defaultStep: 10,
  },
  {
    id: 'p_4',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Труба полипропиленовая PPR 20мм PN20 Valtec',
    brand: 'Valtec',
    spec: '20мм, толщина стенки 3.4мм (холодная/горячая вода)',
    unit: 'м',
    price: 85,
    isPipe: true,
    defaultStep: 4,
  },
  {
    id: 'p_5',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Труба PPR 25мм армированная стекловолокном PN25 Stout',
    brand: 'Stout',
    spec: '25мм, линейное расширение снижено в 3 раза',
    unit: 'м',
    price: 135,
    isPipe: true,
    defaultStep: 4,
  },
  {
    id: 'p_6',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Труба PPR 32мм армированная алюминием PN25 Banninger',
    brand: 'Banninger',
    spec: '32мм, зачистная труба для магистралей отопления',
    unit: 'м',
    price: 220,
    isPipe: true,
    defaultStep: 4,
  },
  {
    id: 'p_7',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Труба PPR 40мм армированная стекловолокном PN25',
    brand: 'РосТурПласт',
    spec: '40мм, стояки и стояковые узлы',
    unit: 'м',
    price: 340,
    isPipe: true,
    defaultStep: 4,
  },
  {
    id: 'p_8',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Труба металлопластиковая Valtec 16x2.0 (металлополимер)',
    brand: 'Valtec',
    spec: '16х2.0мм, слой алюминия 0.3мм, бесшовная',
    unit: 'м',
    price: 115,
    isPipe: true,
    defaultStep: 10,
  },
  {
    id: 'p_9',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Труба металлопластиковая Henco RIX 20x2.0',
    brand: 'Henco',
    spec: '20х2.0мм, премиальное бельгийское качество',
    unit: 'м',
    price: 240,
    isPipe: true,
    defaultStep: 10,
  },
  {
    id: 'p_10',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Медная труба в отрезках KME Sanco 15х1.0мм',
    brand: 'KME',
    spec: '15х1.0мм, твердая немецкая медная труба',
    unit: 'м',
    price: 680,
    isPipe: true,
    defaultStep: 3,
  },
  {
    id: 'p_11',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Гофрированная труба из нержавеющей стали Lavita 15A (отожженная)',
    brand: 'Lavita',
    spec: '15A, гибкая нержавейка AISI 304',
    unit: 'м',
    price: 310,
    isPipe: true,
    defaultStep: 5,
  },
  {
    id: 'p_12',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Труба канализационная ПП 110х3.2мм (длина 2.0м)',
    brand: 'Синикон',
    spec: '110мм, со звонковым уплотнительным кольцом',
    unit: 'шт',
    price: 480,
  },
  {
    id: 'p_13',
    category: 'pipes',
    categoryLabel: 'Трубы (Метраж)',
    name: 'Труба канализационная ПП 50х1.8мм (длина 1.0м)',
    brand: 'Синикон',
    spec: '50мм, шумопоглощающий полипропилен',
    unit: 'шт',
    price: 190,
  },

  // --- ФИТИНГИ И АРМАТУРА ---
  {
    id: 'fit_1',
    category: 'fittings',
    categoryLabel: 'Фитинги и арматура',
    name: 'Евроконус Stout 16x2.0 - 3/4" ВР под PEX',
    brand: 'Stout',
    spec: 'Для подключения PEX труб к коллектору',
    unit: 'шт',
    price: 280,
  },
  {
    id: 'fit_2',
    category: 'fittings',
    categoryLabel: 'Фитинги и арматура',
    name: 'Пресс-муфта Stout соединительная равнопроходная 16-16',
    brand: 'Stout',
    spec: 'Нержавеющая гильза, латунный корпус CW617N',
    unit: 'шт',
    price: 240,
  },
  {
    id: 'fit_3',
    category: 'fittings',
    categoryLabel: 'Фитинги и арматура',
    name: 'Пресс-угольник Stout 16 - 1/2" ВР (водорозетка)',
    brand: 'Stout',
    spec: 'С ушками для надежного крепления к стене',
    unit: 'шт',
    price: 380,
  },
  {
    id: 'fit_4',
    category: 'fittings',
    categoryLabel: 'Фитинги и арматура',
    name: 'Кран шаровый Bugatti Oregon 1/2" ВН бабочка',
    brand: 'Bugatti',
    spec: 'Италия, усиленный корпус, полнопроходной',
    unit: 'шт',
    price: 520,
  },
  {
    id: 'fit_5',
    category: 'fittings',
    categoryLabel: 'Фитинги и арматура',
    name: 'Кран шаровый Giacomini 3/4" ВВ с американкой',
    brand: 'Giacomini',
    spec: 'С разъемным соединением (американка)',
    unit: 'шт',
    price: 890,
  },
  {
    id: 'fit_6',
    category: 'fittings',
    categoryLabel: 'Фитинги и арматура',
    name: 'Редуктор давления воды Caleffi 1/2" с манометром',
    brand: 'Caleffi',
    spec: 'Поршневой, плавная регулировка 1-6 бар',
    unit: 'шт',
    price: 3400,
  },
  {
    id: 'fit_7',
    category: 'fittings',
    categoryLabel: 'Фитинги и арматура',
    name: 'Фильтр тонкой очистки самопромывной FAR 1/2" 100 мкм',
    brand: 'FAR',
    spec: 'С манометром и дренажным краном',
    unit: 'шт',
    price: 6800,
  },

  // --- НАСОСЫ И БАКИ ---
  {
    id: 'pump_1',
    category: 'pumps_tanks',
    categoryLabel: 'Насосы и баки',
    name: 'Циркуляционный насос Grundfos UPS 25-60 180',
    brand: 'Grundfos',
    spec: '3 скорости, напор 6м, чугунный корпус',
    unit: 'шт',
    price: 11200,
  },
  {
    id: 'pump_2',
    category: 'pumps_tanks',
    categoryLabel: 'Насосы и баки',
    name: 'Циркуляционный насос DAB VA 35/180',
    brand: 'DAB',
    spec: 'Италия, бесшумный мокрый ротор',
    unit: 'шт',
    price: 6900,
  },
  {
    id: 'pump_3',
    category: 'pumps_tanks',
    categoryLabel: 'Насосы и баки',
    name: 'Расширительный мембранный бак Wester Heating 24л',
    brand: 'Wester',
    spec: 'Для систем отопления, до 5 бар, красная эмаль',
    unit: 'шт',
    price: 3400,
  },
  {
    id: 'pump_4',
    category: 'pumps_tanks',
    categoryLabel: 'Насосы и баки',
    name: 'Расширительный мембранный бак Stout 50л вертикальный',
    brand: 'Stout',
    spec: '50 литров, сменная EPDM мембрана',
    unit: 'шт',
    price: 6800,
  },
  {
    id: 'pump_5',
    category: 'pumps_tanks',
    categoryLabel: 'Насосы и баки',
    name: 'Группа безопасности котла Watts KSG 30/25 (до 50 кВт)',
    brand: 'Watts',
    spec: 'Манометр, воздухоотводчик, сбросной клапан 3 бар',
    unit: 'компл',
    price: 4200,
  },

  // --- ИЗОЛЯЦИЯ И РАСХОДНИКИ ---
  {
    id: 'ins_1',
    category: 'insulation_supplies',
    categoryLabel: 'Изоляция и расходники',
    name: 'Трубная изоляция Энергофлекс Super 18/6 (длина 2м)',
    brand: 'Энергофлекс',
    spec: 'Внутренний диаметр 18мм, толщина стенки 6мм',
    unit: 'м',
    price: 35,
    isPipe: true,
    defaultStep: 2,
  },
  {
    id: 'ins_2',
    category: 'insulation_supplies',
    categoryLabel: 'Изоляция и расходники',
    name: 'Демпферная лента с фартуком 100х8мм (рулон 25м)',
    brand: 'Valtec',
    spec: 'Для компенсации расширения стяжки тёплого пола',
    unit: 'рулон',
    price: 650,
  },
  {
    id: 'ins_3',
    category: 'insulation_supplies',
    categoryLabel: 'Изоляция и расходники',
    name: 'Маты с бобышками для тёплого пола 1000х500х40мм (ПСБ-35)',
    brand: 'Формат',
    spec: 'Фиксация трубы 16-20мм без скоб',
    unit: 'шт',
    price: 490,
  },
  {
    id: 'ins_4',
    category: 'insulation_supplies',
    categoryLabel: 'Изоляция и расходники',
    name: 'Анаэробный гель-герметик СантехМастер Гель Синий (60г)',
    brand: 'Регион Спецтехно',
    spec: 'Для резьбовых соединений до 2", средняя фиксация',
    unit: 'шт',
    price: 480,
  },
  {
    id: 'ins_5',
    category: 'insulation_supplies',
    categoryLabel: 'Изоляция и расходники',
    name: 'Уплотнительная нить для резьбы Тангит Унилок 160м',
    brand: 'Tangit',
    spec: 'Быстрое уплотнение металлических и пластиковых резьб',
    unit: 'шт',
    price: 1150,
  },
];

interface MaterialsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSelectedToEstimate?: (selectedItems: { item: PlumbingItem; quantity: number }[]) => void;
}

export const MaterialsSelectionModal: React.FC<MaterialsSelectionModalProps> = ({
  isOpen,
  onClose,
  onAddSelectedToEstimate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState<boolean>(false);
  
  // Favorites stored in localStorage with event sync
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('santechpro_favorite_materials');
      return saved ? JSON.parse(saved) : ['eb_1', 'p_1', 'col_1', 'fit_4'];
    } catch {
      return ['eb_1', 'p_1', 'col_1', 'fit_4'];
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('santechpro_favorite_materials');
        if (saved) setFavorites(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('santechpro_favorites_updated', handleStorageChange);
    return () => window.removeEventListener('santechpro_favorites_updated', handleStorageChange);
  }, []);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('santechpro_favorite_materials', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('santechpro_favorites_updated'));
      } catch (err) {
        console.error('Failed to save favorites:', err);
      }
      return updated;
    });
  };

  const handleQuantityChange = (id: string, value: number) => {
    setSelectedQuantities((prev) => {
      const current = prev[id] || 0;
      const updated = Math.max(0, current + value);
      if (updated === 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: updated };
    });
  };

  const handleExactQuantityChange = (id: string, rawVal: string) => {
    const num = parseFloat(rawVal);
    if (isNaN(num) || num <= 0) {
      setSelectedQuantities((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setSelectedQuantities((prev) => ({ ...prev, [id]: num }));
    }
  };

  // Filtered items (with Favorites pinned to the top on search)
  const filteredItems = useMemo(() => {
    return CATALOG_MATERIALS.filter((item) => {
      // Category filter
      if (activeCategory === 'favorites') {
        if (!favorites.includes(item.id)) return false;
      } else if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(q);
        const brandMatch = item.brand?.toLowerCase().includes(q) || false;
        const specMatch = item.spec?.toLowerCase().includes(q) || false;
        const catMatch = item.categoryLabel.toLowerCase().includes(q);
        return nameMatch || brandMatch || specMatch || catMatch;
      }

      return true;
    }).sort((a, b) => {
      if (searchQuery.trim()) {
        const aFav = favorites.includes(a.id) ? 1 : 0;
        const bFav = favorites.includes(b.id) ? 1 : 0;
        return bFav - aFav;
      }
      return 0;
    });
  }, [activeCategory, searchQuery, favorites]);

  // Selected items calculation
  const totalSelectedCount = useMemo(() => {
    return Object.keys(selectedQuantities).length;
  }, [selectedQuantities]);

  const totalSelectedAmount = useMemo(() => {
    return Object.entries(selectedQuantities).reduce((sum, [id, qty]) => {
      const item = CATALOG_MATERIALS.find((m) => m.id === id);
      const count = typeof qty === 'number' ? qty : Number(qty) || 0;
      return sum + (item ? item.price * count : 0);
    }, 0);
  }, [selectedQuantities]);

  const handleConfirmTransfer = () => {
    const itemsToTransfer = Object.entries(selectedQuantities)
      .map(([id, qty]) => {
        const item = CATALOG_MATERIALS.find((m) => m.id === id);
        const count = typeof qty === 'number' ? qty : Number(qty) || 0;
        return item && count > 0 ? { item, quantity: count } : null;
      })
      .filter(Boolean) as { item: PlumbingItem; quantity: number }[];

    if (itemsToTransfer.length > 0) {
      onAddSelectedToEstimate?.(itemsToTransfer);
      onClose();
    }
  };

  const handleCopySpec = () => {
    const itemsToTransfer = Object.entries(selectedQuantities)
      .map(([id, qty]) => {
        const item = CATALOG_MATERIALS.find((m) => m.id === id);
        return item ? { item, quantity: qty } : null;
      })
      .filter(Boolean) as { item: PlumbingItem; quantity: number }[];

    let text = `📦 СПЕЦИФИКАЦИЯ ИЗ РАЗДЕЛА МАТЕРИАЛЫ\n`;
    text += `Дата формирования: ${new Date().toLocaleDateString('ru-RU')}\n`;
    text += `----------------------------------------\n`;
    itemsToTransfer.forEach((sel, i) => {
      text += `${i + 1}. ${sel.item.name} — ${sel.quantity} ${sel.item.unit} x ${sel.item.price.toLocaleString('ru-RU')} ₽ = ${(sel.quantity * sel.item.price).toLocaleString('ru-RU')} ₽\n`;
    });
    text += `----------------------------------------\n`;
    text += `ИТОГО: ${totalSelectedAmount.toLocaleString('ru-RU')} ₽\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  // Ready-made Kits definition for 1-click loading
  const QUICK_KITS = [
    {
      id: 'kit_heat_pump',
      name: '⚡ Котельная с тепловым насосом 9–12 кВт',
      badge: 'PRO',
      items: { hp_1: 1, hp_4: 1, hp_6: 1, hp_7: 1, hp_8: 1, 'col_1': 1, 'pump_1': 1 },
    },
    {
      id: 'kit_inlet_pro',
      name: '💧 Узел ввода квартиры PRO (Neptun + FAR + Редуктор)',
      badge: 'Хит',
      items: { lf_1: 1, lf_3: 2, lf_5: 2, lf_6: 2, 'fit_val_1': 4, 'fit_val_4': 2 },
    },
    {
      id: 'kit_floor_50',
      name: '🔥 Тёплый пол на 50 м² (Stout + Насосный узел)',
      badge: 'Отопление',
      items: { 'p_pex_rt_16': 350, 'col_2': 1, 'col_mix_1': 1, 'ins_foil_1': 5, 'ins_mat_1': 50 },
    },
    {
      id: 'kit_bathroom_pro',
      name: '🚽 Санузел с инсталляцией Geberit и трапом Tece',
      badge: 'Чистовой',
      items: { in_1: 1, in_3: 1, in_5: 1, 'p_pex_16': 40, 'p_pipe_c_110': 3, 'p_pipe_c_50': 6 },
    },
  ];

  const handleApplyQuickKit = (kitItems: Record<string, number>) => {
    setSelectedQuantities((prev) => {
      const next = { ...prev };
      Object.entries(kitItems).forEach(([id, qty]) => {
        // verify item exists
        if (CATALOG_MATERIALS.some((m) => m.id === id)) {
          next[id] = (next[id] || 0) + qty;
        }
      });
      return next;
    });
  };

  const categoriesNav = [
    { id: 'all', label: 'Все материалы', icon: Grid, count: CATALOG_MATERIALS.length },
    { id: 'favorites', label: 'Избранное', icon: Star, count: favorites.length, highlight: true },
    { id: 'heat_pumps', label: 'Тепловые насосы & БКН', icon: Zap, highlight: true },
    { id: 'leak_and_filters', label: 'Узлы ввода & Защита от протечек', icon: PackageCheck, highlight: true },
    { id: 'installations_drains', label: 'Инсталляции & Скрытый монтаж', icon: Wrench },
    { id: 'electric_boilers', label: 'Электрокотлы', icon: Zap },
    { id: 'solid_boilers', label: 'Твердотопливные котлы', icon: Flame },
    { id: 'collectors', label: 'Коллекторы & Тёплый пол', icon: SlidersHorizontal },
    { id: 'pipes', label: 'Трубы (Метраж)', icon: Ruler },
    { id: 'fittings', label: 'Фитинги & Арматура', icon: Wrench },
    { id: 'pumps_tanks', label: 'Насосы & Баки', icon: Gauge },
    { id: 'insulation_supplies', label: 'Изоляция & Расходники', icon: Boxes },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 md:p-6 flex justify-center items-center min-h-screen animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full flex flex-col shadow-2xl overflow-hidden text-slate-100 my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Раздел материалы: Подбор оборудования
                </h2>
                <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Специализированный каталог
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Электрокотлы, твердотопливные котлы, коллекторы, трубы с указанием метража и сопутствующая арматура
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer self-end sm:self-auto"
            title="Закрыть окно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по названию или характеристикам (например: Protherm, PEX 16, Stout, Zota, коллектор, насос)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-500 hover:text-white text-xs"
              >
                Очистить
              </button>
            )}
          </div>

          {/* Quick 1-Click Complete Project Kits */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Готовые инженерные комплекты (добавление в 1 клик):
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_KITS.map((kit) => (
                <button
                  key={kit.id}
                  type="button"
                  onClick={() => handleApplyQuickKit(kit.items)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-xs text-slate-200 hover:text-amber-300 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs"
                >
                  <span>{kit.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    +{Object.keys(kit.items).length} поз.
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categoriesNav.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition whitespace-nowrap cursor-pointer flex items-center space-x-2 border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                      : cat.highlight
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : cat.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                  {cat.count !== undefined && (
                    <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Items Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 max-h-[55vh]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-3xl border border-slate-800/80">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Ничего не найдено</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {activeCategory === 'favorites'
                    ? 'В избранном пока нет товаров. Нажмите на звёздочку карточки, чтобы добавить позиции для быстрого вызова.'
                    : 'Попробуйте изменить поисковый запрос или выбрать другую категорию материалов.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredItems.map((item) => {
                const isFav = favorites.includes(item.id);
                const currentQty = selectedQuantities[item.id] || 0;
                const isSelected = currentQty > 0;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 relative group ${
                      isSelected
                        ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Info */}
                    <div className="space-y-1 pr-8">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {item.categoryLabel}
                        </span>
                        {item.isPipe && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            Метраж (м)
                          </span>
                        )}
                        {isFav && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center space-x-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>Часто используемое</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {item.name}
                      </h4>
                      {item.spec && (
                        <p className="text-[11px] text-slate-400">
                          {item.spec}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-[10px] text-slate-500 line-clamp-1 italic">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Favorite Star Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className={`absolute top-3.5 right-3.5 p-1.5 rounded-xl transition cursor-pointer ${
                        isFav
                          ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                          : 'text-slate-600 hover:text-amber-400 hover:bg-slate-800'
                      }`}
                      title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* Price and Quantity Controller */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-amber-400">
                          {item.price.toLocaleString('ru-RU')} ₽ <span className="text-[10px] text-slate-400 font-normal">/ {item.unit}</span>
                        </div>
                        {item.isPipe && currentQty > 0 && (
                          <div className="text-[10px] text-emerald-400 font-semibold">
                            Сумма: {(item.price * currentQty).toLocaleString('ru-RU')} ₽ ({currentQty} {item.unit})
                          </div>
                        )}
                      </div>

                      {/* Quantity / Meterage Controls */}
                      <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                        {currentQty > 0 ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, item.isPipe ? -(item.defaultStep || 5) : -1)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition cursor-pointer"
                              title={item.isPipe ? `Уменьшить на ${item.defaultStep || 5}м` : 'Уменьшить на 1'}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <input
                              type="number"
                              value={currentQty}
                              onChange={(e) => handleExactQuantityChange(item.id, e.target.value)}
                              className="w-14 text-center bg-transparent text-xs font-bold text-amber-300 focus:outline-none"
                            />

                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, item.isPipe ? (item.defaultStep || 5) : 1)}
                              className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center hover:bg-amber-400 transition cursor-pointer"
                              title={item.isPipe ? `Добавить +${item.defaultStep || 5}м` : 'Добавить +1'}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.isPipe ? (item.defaultStep || 10) : 1)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{item.isPipe ? `Выбрать метраж` : 'Выбрать'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Summary & Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-xs">
            <div>
              <span className="text-slate-400">Выбрано позиций: </span>
              <span className="font-bold text-white">{totalSelectedCount}</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400">Сумма заказа: </span>
              <span className="font-extrabold text-amber-400 text-sm sm:text-base">
                {totalSelectedAmount.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            {totalSelectedCount > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleCopySpec}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
                  title="Скопировать ведомость"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedQuantities({})}
                  className="px-3 py-2.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  Сбросить
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleConfirmTransfer}
              disabled={totalSelectedCount === 0}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg ${
                totalSelectedCount > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {totalSelectedCount > 0
                  ? `Добавить в смету (${totalSelectedCount} поз.)`
                  : 'Выберите материалы'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
