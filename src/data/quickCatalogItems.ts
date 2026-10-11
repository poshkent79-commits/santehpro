export type CatalogCategoryKey =
  | 'pipes_insulation'
  | 'fittings'
  | 'valves_taps'
  | 'collectors'
  | 'fixtures'
  | 'leak_filters'
  | 'installations'
  | 'boiler_parts'
  | 'appliance_repair'
  | 'supplies'
  | 'pumps_tanks'
  | 'tools';

export interface QuickCatalogItem {
  id: string;
  name: string;
  category: string;
  categoryKey: CatalogCategoryKey;
  brand?: string;
  spec?: string;
  unit: 'м' | 'шт' | 'компл' | 'упак' | 'рулон';
  price: number;
  popular?: boolean;
  tags?: string[];
}

export const CATEGORY_TABS: { key: string; label: string; icon: string; desc: string }[] = [
  { key: 'all', label: 'Все позиции', icon: '⚡', desc: 'Полный исчерпывающий инженерный каталог' },
  { key: 'favorites', label: 'Избранное', icon: '⭐', desc: 'Востребованные и сохранённые позиции' },
  { key: 'pipes_insulation', label: 'Трубы и изоляция', icon: '📏', desc: 'ППР, PEX, PE-RT, металлопластик, медь, сталь ВГП, канализация' },
  { key: 'fittings', label: 'Фитинги и соединения', icon: '🔩', desc: 'Резьбовые, ППР под пайку, пресс, аксиальные, медь, фасонная канализация' },
  { key: 'valves_taps', label: 'Краны и арматура', icon: '🚰', desc: 'Шаровые краны, обратные клапаны, редукторы, радиаторные вентили, группы безопасности' },
  { key: 'fixtures', label: 'Сантехника и приборы', icon: '🛁', desc: 'Смесители, унитазы, инсталляции, ванны, раковины, сифоны, трапы' },
  { key: 'collectors', label: 'Коллекторы и узлы', icon: '🔀', desc: 'Распределительные гребенки, блоки тёплого пола, шкафы' },
  { key: 'leak_filters', label: 'Фильтры и защита', icon: '🛡️', desc: 'Системы от протечек, промывные фильтры, колбы Big Blue, картриджи' },
  { key: 'boiler_parts', label: 'Запчасти и котлы', icon: '🔥', desc: 'ТЭНы, аноды, группы безопасности, термостаты' },
  { key: 'appliance_repair', label: 'Ремонт сантехники', icon: '🛠️', desc: 'Картриджи смесителей, кран-буксы, арматура бачка, подводки' },
  { key: 'supplies', label: 'Расходники, лён и крепёж', icon: '🧵', desc: 'Сантехлен, уплотнительная нить, анаэроб, пасты, герметики, хомуты, крепёж' },
  { key: 'pumps_tanks', label: 'Насосы и баки', icon: '⚙️', desc: 'Циркуляционные насосы, расширительные баки, гидроаккумуляторы' },
  { key: 'tools', label: 'Монтажный инструмент', icon: '🔧', desc: 'Паяльники ППР, труборезы, пресс-клещи, калибраторы, натяжной инструмент' },
];

export const QUICK_TAG_SUGGESTIONS = [
  'Труба 20',
  'Труба 16',
  'Труба 25',
  'Ниппель',
  'Муфта',
  'Уголок',
  'Тройник',
  'Футорка',
  'Американка',
  'Водорозетка',
  'Кран 1/2',
  'Кран 3/4',
  'Редуктор',
  'Фильтр',
  'Канализация 50',
  'Канализация 110',
  'Лен',
  'Анаэроб',
  'Хомут',
  'Смеситель',
  'Сифон',
  'Трап',
  'Инсталляция',
  'Унитаз',
  'Подводка',
  'Паяльник',
  'Теплый пол',
  'Valtec',
  'Stout',
  'Rehau',
  'Geberit',
  'FAR',
  'Viega',
  'Alcaplast'
];

import { EXTENDED_QUICK_CATALOG_ITEMS } from './quickCatalogAdditions';
import { ALL_PLUMBING_CATALOG_ITEMS } from './allPlumbingCatalogItems';
import {
  MATERIAL_SPECIFIC_ITEMS,
  BUILDING_EQUIPMENT_ITEMS,
  SystemFittingItem
} from './installationMaterialsData';

const BASE_QUICK_CATALOG_ITEMS: QuickCatalogItem[] = [
  // =========================================================================
  // 1. ТРУБЫ И СОПУТСТВУЮЩИЕ МАТЕРИАЛЫ (PIPES & INSULATION)
  // =========================================================================
  // Полипропилен (ПП / PPR) неармированный (ХВС, PN10, PN20)
  {
    id: 'pipe_ppr_20_pn10',
    name: 'Труба ППР 20 неармированная для ХВС PN10 (хлыст 4 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Valtec',
    spec: 'PP-R первичный монолитный полипропилен, PN10, толщина стенки 1.9 мм, для холодной воды, хлыст 4 м',
    unit: 'м',
    price: 55,
    popular: true,
    tags: ['труба', 'ппр', 'ppr 20', 'pn10', 'холодная вода', 'хлыст', 'неармированная']
  },
  {
    id: 'pipe_ppr_25_pn10',
    name: 'Труба ППР 25 неармированная для ХВС PN10 (хлыст 4 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Valtec',
    spec: 'PP-R первичный полипропилен, PN10, толщина стенки 2.3 мм, для стояков ХВС, хлыст 4 м',
    unit: 'м',
    price: 85,
    tags: ['труба', 'ппр 25', 'pn10', 'хлыст', 'неармированная']
  },
  {
    id: 'pipe_ppr_32_pn10',
    name: 'Труба ППР 32 неармированная для ХВС PN10 (хлыст 4 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Valtec',
    spec: 'PP-R монолитный полипропилен, PN10, стенка 2.9 мм, для магистралей ХВС, хлыст 4 м',
    unit: 'м',
    price: 135,
    tags: ['труба', 'ппр 32', 'pn10', 'хлыст']
  },
  {
    id: 'pipe_ppr_20_pn20',
    name: 'Труба ППР 20 неармированная универсальная PN20 (хлыст 4 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Firat',
    spec: 'Толстостенный монолитный полипропилен PN20, стенка 3.4 мм, рабочее давление до 20 бар, хлыст 4 м',
    unit: 'м',
    price: 75,
    popular: true,
    tags: ['труба', 'ппр 20', 'pn20', 'универсальная', 'хлыст']
  },

  // Полипропилен армированный стекловолокном (ГВС и отопление, PN20, PN25)
  {
    id: 'pipe_ppr_20_fiber_pn25',
    name: 'Труба ППР 20 армированная стекловолокном PN25 (хлыст 4 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Kalde / Valtec Fiber',
    spec: 'Трехслойная PP-R/GF/PP-R, PN25, малый коэффициент линейного расширения, для ГВС и радиаторов, хлыст 4 м',
    unit: 'м',
    price: 95,
    popular: true,
    tags: ['труба', 'ппр 20', 'стекловолокно', 'fiber', 'pn25', 'гвс', 'отопление']
  },
  {
    id: 'pipe_ppr_25_fiber_pn25',
    name: 'Труба ППР 25 армированная стекловолокном PN25 (хлыст 4 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Kalde / Valtec Fiber',
    spec: 'Трехслойная с композитным стекловолокном, PN25, стенка 4.2 мм, для стояков и отопления, хлыст 4 м',
    unit: 'м',
    price: 145,
    popular: true,
    tags: ['труба', 'ппр 25', 'стекловолокно', 'fiber', 'pn25', 'стояк']
  },
  {
    id: 'pipe_ppr_32_fiber_pn25',
    name: 'Труба ППР 32 армированная стекловолокном PN25 (хлыст 4 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Kalde / Valtec Fiber',
    spec: 'Трехслойная со стекловолокном, PN25, стенка 5.4 мм, для ввода в квартиру и котельных, хлыст 4 м',
    unit: 'м',
    price: 220,
    tags: ['труба', 'ппр 32', 'стекловолокно', 'pn25', 'котельная']
  },
  {
    id: 'pipe_ppr_40_fiber_pn25',
    name: 'Труба ППР 40 армированная стекловолокном PN25 (хлыст 4 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Valtec Fiber',
    spec: 'Трехслойная армированная труба 40 мм для центральных стояков дома и теплопунктов',
    unit: 'м',
    price: 360,
    tags: ['труба', 'ппр 40', 'стекловолокно', 'стояк']
  },

  // Полипропилен армированный алюминием (Stabi)
  {
    id: 'pipe_ppr_20_stabi_al',
    name: 'Труба ППР 20 армированная алюминием Stabi (хлыст 4 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Banninger / FV-Plast Stabi',
    spec: 'Сплошной алюминиевый кислородный барьер 100%, минимальное температурное удлинение, для высокотемпературного отопления',
    unit: 'м',
    price: 130,
    tags: ['труба', 'ппр 20', 'алюминий', 'stabi', 'кислородный барьер', 'отопление']
  },
  {
    id: 'pipe_ppr_25_stabi_al',
    name: 'Труба ППР 25 армированная алюминием Stabi (хлыст 4 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Banninger / FV-Plast Stabi',
    spec: 'Армирование алюминиевой фольгой, для радиаторных стояков ГВС и отопления',
    unit: 'м',
    price: 195,
    tags: ['труба', 'ппр 25', 'алюминий', 'stabi']
  },
  {
    id: 'pipe_ppr_32_stabi_al',
    name: 'Труба ППР 32 армированная алюминием Stabi (хлыст 4 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'FV-Plast Stabi',
    spec: 'Сплошной алюминиевый слой, минимальное расширение, штанга 4 м',
    unit: 'м',
    price: 290,
    tags: ['труба', 'ппр 32', 'алюминий', 'stabi']
  },

  // Сшитый полиэтилен (PEX) - PEX-A, PEX-B, PEX-C
  {
    id: 'pipe_pexa_16_evoh',
    name: 'Труба из сшитого полиэтилена PEX-a 16х2.2 с кислородным барьером EVOH (бухта)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Rehau Rautitan Stabil / Stout PEX-A',
    spec: 'Пероксидная сшивка 85%+, антидиффузионный слой EVOH, молекулярная память формы, рабочее давление 10 бар, до 95°C',
    unit: 'м',
    price: 210,
    popular: true,
    tags: ['труба', 'pex-a', '16', 'сшитый полиэтилен', 'rehau', 'stout', 'бухта', 'аксиал']
  },
  {
    id: 'pipe_pexa_20_evoh',
    name: 'Труба из сшитого полиэтилена PEX-a 20х2.8 с кислородным барьером EVOH (бухта)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Rehau / Stout PEX-A',
    spec: 'Для магистральной квартирной разводки к ванне, душу, бойлеру и коллекторам, стенка 2.8 мм',
    unit: 'м',
    price: 290,
    popular: true,
    tags: ['труба', 'pex-a', '20', 'сшитый полиэтилен', 'магистраль', 'аксиал']
  },
  {
    id: 'pipe_pexa_25_evoh',
    name: 'Труба из сшитого полиэтилена PEX-a 25х3.5 с барьером EVOH (бухта)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Stout / Rehau',
    spec: 'Для распределительных стояков и подключения коллекторных узлов, стенка 3.5 мм',
    unit: 'м',
    price: 430,
    tags: ['труба', 'pex-a', '25', 'стояк']
  },
  {
    id: 'pipe_pexb_16_evoh',
    name: 'Труба из сшитого полиэтилена PEX-b 16х2.0 для радиаторов и воды (бухта)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Valtec PEX-b / ProAqua',
    spec: 'Силановая сшивка PEX-b, кислородный барьер EVOH, для пресс и обжимных соединений',
    unit: 'м',
    price: 140,
    tags: ['труба', 'pex-b', '16', 'радиатор', 'бухта']
  },
  {
    id: 'pipe_pexc_16_evoh',
    name: 'Труба из сшитого полиэтилена PEX-c 16х2.0 радиаторная (бухта)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'TECElogo / Henco PEX-c',
    spec: 'Электронно-лучевая сшивка PEX-c, высочайшая термостойкость и прочность',
    unit: 'м',
    price: 185,
    tags: ['труба', 'pex-c', '16', 'tece', 'радиаторное отопление']
  },

  // Термостойкий полиэтилен PE-RT (Тёплый пол)
  {
    id: 'pipe_pert_16_floor',
    name: 'Труба PE-RT тип II 16х2.0 для водяного тёплого пола с барьером EVOH (бухта 200 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Stout / Valtec PE-RT',
    spec: 'Повышенная гибкость (минимальный радиус изгиба без заломов), кислородозащитный слой EVOH, до 70°C, для заливки в стяжку',
    unit: 'м',
    price: 95,
    popular: true,
    tags: ['труба', 'pe-rt', '16', 'тёплый пол', 'evoh', 'бухта']
  },
  {
    id: 'pipe_pert_20_floor',
    name: 'Труба PE-RT тип II 20х2.0 для тёплого пола и снеготаяния (бухта 100 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Stout / Valtec',
    spec: 'Увеличенная пропускная способность для длинных петель тёплого пола и уличного обогрева',
    unit: 'м',
    price: 135,
    tags: ['труба', 'pe-rt', '20', 'тёплый пол', 'снеготаяние']
  },

  // Металлопластиковые трубы (PE-RT/Al/PE-RT и PEX/Al/PEX)
  {
    id: 'pipe_mp_pert_al_16',
    name: 'Труба металлопластиковая PE-RT/Al/PE-RT 16х2.0 (бухта 100 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Valtec / Stout',
    spec: 'Сварной алюминиевый слой встык TIG (0.3 мм), сохраняет форму при изгибе, PN 10, для пресс и обжимных фитингов',
    unit: 'м',
    price: 125,
    popular: true,
    tags: ['труба', 'металлопластик', '16', 'pe-rt/al/pe-rt', 'valtec', 'бухта']
  },
  {
    id: 'pipe_mp_pert_al_20',
    name: 'Труба металлопластиковая PE-RT/Al/PE-RT 20х2.0 (бухта 100 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Valtec / Stout',
    spec: 'Многослойная труба с алюминиевым барьером 20 мм для коллекторных узлов и радиаторных трасс',
    unit: 'м',
    price: 185,
    popular: true,
    tags: ['труба', 'металлопластик', '20', 'бухта']
  },
  {
    id: 'pipe_mp_pex_al_pex_16',
    name: 'Труба металлопластиковая премиум PEX-Al-PEX 16х2.0 Henco RIXc (бухта)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Henco RIXc (Бельгия)',
    spec: 'Внутренний и наружный слой из сшитого полиэтилена PEX-c, лазерная сварка алюминия, до 95°C / 10 бар',
    unit: 'м',
    price: 195,
    popular: true,
    tags: ['труба', 'металлопластик', 'henco', 'pex-al-pex', '16', 'бельгия']
  },
  {
    id: 'pipe_mp_pex_al_pex_20',
    name: 'Труба металлопластиковая премиум PEX-Al-PEX 20х2.0 Henco RIXc (бухта)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Henco (Бельгия)',
    spec: 'PEX/Al/PEX 20 мм для надежной скрытой радиаторной разводки в стяжке и стенах',
    unit: 'м',
    price: 275,
    tags: ['труба', 'металлопластик', 'henco', '20']
  },
  {
    id: 'pipe_mp_pert_al_26',
    name: 'Труба металлопластиковая PE-RT/Al/PE-RT 26х3.0 (бухта 50 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Valtec',
    spec: 'Диаметр 26 мм для стояков и ввода в коллекторный шкаф',
    unit: 'м',
    price: 340,
    tags: ['труба', 'металлопластик', '26', 'стояк']
  },
  {
    id: 'pipe_mp_pert_al_32',
    name: 'Труба металлопластиковая PE-RT/Al/PE-RT 32х3.0 (бухта 50 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Valtec',
    spec: 'Диаметр 32 мм для котельных и центрального узла ввода',
    unit: 'м',
    price: 490,
    tags: ['труба', 'металлопластик', '32', 'котельная']
  },

  // Медные трубы (отожженные в бухтах и неотожженные в отрезках)
  {
    id: 'pipe_copper_15_annealed',
    name: 'Труба медная отожженная мягкая 15х1.0 мм Cu-DHP (бухта 25/50 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Wieland Sanco / KME',
    spec: 'Деоксидированная медь Cu-DHP 99.9%, мягкая в бухте, легко гнется трубогибом, для воды, газа и кондиционеров',
    unit: 'м',
    price: 780,
    popular: true,
    tags: ['медь', 'труба медная', '15', 'отожженная', 'бухта', 'wieland', 'sanco']
  },
  {
    id: 'pipe_copper_18_annealed',
    name: 'Труба медная отожженная мягкая 18х1.0 мм Cu-DHP (бухта)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Wieland / KME',
    spec: 'Медь мягкая в бухтах для водоснабжения и отопления 18 мм',
    unit: 'м',
    price: 990,
    tags: ['медь', 'труба медная', '18', 'отожженная', 'бухта']
  },
  {
    id: 'pipe_copper_15_hard',
    name: 'Труба медная неотожженная твердая 15х1.0 мм (штанга 3/5 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Wieland Sanco (Германия)',
    spec: 'Твердая штанговая медь Cu-DHP, идеальная геометрия для открытой премиум-разводки и котельных',
    unit: 'м',
    price: 720,
    popular: true,
    tags: ['медь', 'труба медная', '15', 'твердая', 'штанга', 'пайка']
  },
  {
    id: 'pipe_copper_22_hard',
    name: 'Труба медная неотожженная твердая 22х1.0 мм (штанга 3/5 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Wieland Sanco',
    spec: 'Твердая медь 22 мм для магистральных стояков и обвязки котлов отопления',
    unit: 'м',
    price: 1190,
    popular: true,
    tags: ['медь', 'труба медная', '22', 'твердая', 'котельная']
  },
  {
    id: 'pipe_copper_28_hard',
    name: 'Труба медная неотожженная твердая 28х1.5 мм (штанга)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Wieland Sanco',
    spec: 'Медная труба 28 мм для коллекторных распределителей и мощных контуров',
    unit: 'м',
    price: 1850,
    tags: ['медь', 'труба медная', '28', 'твердая']
  },

  // Стальные и оцинкованные трубы ВГП
  {
    id: 'pipe_steel_vgp_15_black',
    name: 'Труба стальная ВГП черная ДУ 15 (1/2") ГОСТ 3262-75',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    spec: 'Водогазопроводная электросварная черная труба, стенка 2.8 мм, для систем отопления и газоснабжения',
    unit: 'м',
    price: 240,
    tags: ['сталь', 'труба стальная', 'вгп', 'ду 15', '1/2', 'гост 3262']
  },
  {
    id: 'pipe_steel_vgp_20_black',
    name: 'Труба стальная ВГП черная ДУ 20 (3/4") ГОСТ 3262-75',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    spec: 'Стальная водогазопроводная труба 3/4", стенка 2.8 мм для стояков отопления',
    unit: 'м',
    price: 310,
    tags: ['сталь', 'труба стальная', 'вгп', 'ду 20', '3/4']
  },
  {
    id: 'pipe_steel_vgp_15_galv',
    name: 'Труба оцинкованная ВГП ДУ 15 (1/2") ГОСТ 3262-75',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    spec: 'Горячее двустороннее цинкование, стойкость к коррозии, для пожаротушения и открытых стояков',
    unit: 'м',
    price: 330,
    popular: true,
    tags: ['оцинкованная', 'труба оцинкованная', 'вгп', 'ду 15', '1/2', 'сталь']
  },
  {
    id: 'pipe_steel_vgp_20_galv',
    name: 'Труба оцинкованная ВГП ДУ 20 (3/4") ГОСТ 3262-75',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    spec: 'Оцинкованная труба 3/4" для стояков ХВС и ГВС с резьбовым соединением',
    unit: 'м',
    price: 420,
    tags: ['оцинкованная', 'труба оцинкованная', 'вгп', 'ду 20', '3/4']
  },
  {
    id: 'pipe_steel_vgp_25_galv',
    name: 'Труба оцинкованная ВГП ДУ 25 (1") ГОСТ 3262-75',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    spec: 'Оцинкованная водогазопроводная труба 1" для узлов ввода и элеваторных узлов',
    unit: 'м',
    price: 540,
    tags: ['оцинкованная', 'труба оцинкованная', 'вгп', 'ду 25', '1 дюйм']
  },

  // Канализационные трубы: Внутренняя (серая 32, 40, 50, 110 мм)
  {
    id: 'sewer_pipe_32_1000',
    name: 'Труба канализационная серая 32х1.8 мм L=1.0 м (внутренняя)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf / Sinikon',
    spec: 'Полипропиленовая труба с раструбом и предустановленным уплотнительным кольцом, для кондиционеров и малых сливов',
    unit: 'шт',
    price: 160,
    tags: ['канализация', '32', 'серая', 'внутренняя', '1 метр', 'раструб']
  },
  {
    id: 'sewer_pipe_40_1000',
    name: 'Труба канализационная серая 40х1.8 мм L=1.0 м (внутренняя)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf / Sinikon',
    spec: 'Для подключения умывальников, биде и слива стиральных машин',
    unit: 'шт',
    price: 180,
    tags: ['канализация', '40', 'серая', '1 метр']
  },
  {
    id: 'sewer_pipe_50_500',
    name: 'Труба канализационная серая 50х1.8 мм L=0.5 м с раструбом',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf / Sinikon',
    spec: 'Полипропилен термостойкий до 95°C, для ванн, раковин и кухонных моек',
    unit: 'шт',
    price: 130,
    popular: true,
    tags: ['канализация', '50', 'серая', '0.5м', 'раковина', 'ванна']
  },
  {
    id: 'sewer_pipe_50_1000',
    name: 'Труба канализационная серая 50х1.8 мм L=1.0 м с раструбом',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf / Sinikon',
    spec: 'Для разводки сливной сети по санузлу и кухне, L=1.0 м',
    unit: 'шт',
    price: 195,
    popular: true,
    tags: ['канализация', '50', 'серая', '1м']
  },
  {
    id: 'sewer_pipe_50_2000',
    name: 'Труба канализационная серая 50х1.8 мм L=2.0 м с раструбом',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf / Sinikon',
    spec: 'Длина 2 метра для длинных прямых участков кухонных и ванных сливов',
    unit: 'шт',
    price: 360,
    tags: ['канализация', '50', 'серая', '2м']
  },
  {
    id: 'sewer_pipe_110_500',
    name: 'Труба канализационная серая 110х2.7 мм L=0.5 м с раструбом',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf HT / Sinikon',
    spec: 'Полипропилен термостойкий, уплотнение EPDM, для унитазов и инсталляций',
    unit: 'шт',
    price: 310,
    popular: true,
    tags: ['канализация', '110', 'серая', '0.5м', 'унитаз', 'инсталляция']
  },
  {
    id: 'sewer_pipe_110_1000',
    name: 'Труба канализационная серая 110х2.7 мм L=1.0 м с раструбом',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf HT / Sinikon',
    spec: 'Для сборки главного канализационного стояка и отводов к унитазу',
    unit: 'шт',
    price: 490,
    popular: true,
    tags: ['канализация', '110', 'серая', '1м', 'стояк']
  },
  {
    id: 'sewer_pipe_110_2000',
    name: 'Труба канализационная серая 110х2.7 мм L=2.0 м с раструбом',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf HT / Sinikon',
    spec: 'Цельная двухметровая труба для замены стояка канализации в квартире',
    unit: 'шт',
    price: 890,
    popular: true,
    tags: ['канализация', '110', 'серая', '2м', 'стояк']
  },

  // Канализационные трубы: Наружная (оранжевая / рыжая 110, 160, 200 мм)
  {
    id: 'sewer_out_pipe_110_1000',
    name: 'Труба канализационная наружная рыжая 110х3.2 мм L=1.0 м SN4',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf KG / Sinikon',
    spec: 'Жесткий ПВХ (PVC-U), кольцевая жесткость SN4, для укладки в грунт и наружных сетей',
    unit: 'шт',
    price: 590,
    popular: true,
    tags: ['канализация', 'наружная', 'рыжая', 'оранжевая', '110', 'пвх', 'грунт']
  },
  {
    id: 'sewer_out_pipe_110_2000',
    name: 'Труба канализационная наружная рыжая 110х3.2 мм L=2.0 м SN4',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf KG',
    spec: 'Для выпуска из дома в септик или центральную канализацию',
    unit: 'шт',
    price: 1050,
    tags: ['канализация', 'наружная', 'рыжая', '110', '2м', 'септик']
  },
  {
    id: 'sewer_out_pipe_160_2000',
    name: 'Труба канализационная наружная рыжая 160х4.0 мм L=2.0 м SN4',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf KG',
    spec: 'Диаметр 160 мм для магистрального коллектора загородного дома и поселка',
    unit: 'шт',
    price: 1950,
    tags: ['канализация', 'наружная', 'рыжая', '160', '2м']
  },
  {
    id: 'sewer_out_pipe_200_2000',
    name: 'Труба канализационная наружная рыжая 200х4.9 мм L=2.0 м SN4',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf KG',
    spec: 'Диаметр 200 мм для наружных сетей и ливневой канализации высокой пропускной способности',
    unit: 'шт',
    price: 3200,
    tags: ['канализация', 'наружная', 'рыжая', '200', 'ливневка']
  },

  // Бесшумная канализация
  {
    id: 'sewer_silent_pipe_110_1000',
    name: 'Труба бесшумной канализации Ostendorf Skolan Safe 110 L=1.0 м (толстостенная)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf Skolan Safe (Германия)',
    spec: 'Минералонаполненный полипропилен плотностью 1.6 г/см³, звукоизоляция до 17 дБ (класс премиум), толщина стенки 5.3 мм',
    unit: 'шт',
    price: 1850,
    popular: true,
    tags: ['бесшумная', 'канализация', 'skolan', 'ostendorf', '110', 'звукоизоляция', 'стояк']
  },
  {
    id: 'sewer_silent_pipe_50_1000',
    name: 'Труба бесшумной канализации Ostendorf Skolan Safe 50 L=1.0 м',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Ostendorf Skolan Safe',
    spec: 'Минералонаполненная бесшумная труба 50 мм для скрытой разводки в спальнях и гостиных',
    unit: 'шт',
    price: 950,
    tags: ['бесшумная', 'канализация', 'skolan', '50']
  },

  // Теплоизоляция для труб
  {
    id: 'insulation_energoflex_18_9',
    name: 'Трубная изоляция Энергофлекс Супер 18/9 мм (для труб 16-18 мм, 2 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Energoflex',
    spec: 'Вспененный полиэтилен с закрытыми порами, толщина 9 мм, защита от конденсата и теплопотерь',
    unit: 'м',
    price: 38,
    popular: true,
    tags: ['изоляция', 'энергофлекс', 'утеплитель', 'труба 16', 'труба 18', 'конденсат']
  },
  {
    id: 'insulation_energoflex_22_9',
    name: 'Трубная изоляция Энергофлекс Супер 22/9 мм (для труб 20-22 мм, 2 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Energoflex',
    spec: 'Толщина 9 мм, внутренний диаметр 22 мм (подходит для PEX/ППР 20 мм)',
    unit: 'м',
    price: 48,
    popular: true,
    tags: ['изоляция', 'энергофлекс', 'труба 20', '22/9']
  },
  {
    id: 'insulation_energoflex_28_9',
    name: 'Трубная изоляция Энергофлекс Супер 28/9 мм (для труб 25-28 мм)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Energoflex',
    spec: 'Для ППР 25 мм и медных труб 28 мм',
    unit: 'м',
    price: 58,
    tags: ['изоляция', 'энергофлекс', 'труба 25']
  },
  {
    id: 'insulation_energoflex_35_13',
    name: 'Трубная изоляция Энергофлекс Супер 35/13 мм усиленная (толщина 13 мм)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Energoflex',
    spec: 'Утолщенная стенка 13 мм для котельных и стояков отопления, диаметр 35 мм',
    unit: 'м',
    price: 95,
    tags: ['изоляция', 'энергофлекс', '35/13', 'котельная']
  },
  {
    id: 'insulation_energoflex_54_13',
    name: 'Трубная изоляция Энергофлекс Супер 54/13 мм для стояков',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    brand: 'Energoflex',
    spec: 'Для труб наружным диаметром до 54 мм (канализация 50 мм / сталь 1 1/2")',
    unit: 'м',
    price: 145,
    tags: ['изоляция', 'энергофлекс', '54', 'стояк']
  },
  {
    id: 'corrugated_peshel_red_16',
    name: 'Защитная гофротруба «пешель» красная 16 мм (для труб ГВС в стяжке, 50 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    spec: 'Защищает трубу от истирания бетоном и компенсирует температурные расширения, красный маркер ГВС',
    unit: 'м',
    price: 26,
    popular: true,
    tags: ['пешель', 'гофра', 'красная', 'гвс', 'стяжка', 'труба 16']
  },
  {
    id: 'corrugated_peshel_blue_16',
    name: 'Защитная гофротруба «пешель» синяя 16 мм (для труб ХВС в стяжке, 50 м)',
    category: 'Трубы и изоляция',
    categoryKey: 'pipes_insulation',
    spec: 'Защитная гофра синего цвета для маркировки холодной воды в полу и стенах',
    unit: 'м',
    price: 26,
    popular: true,
    tags: ['пешель', 'гофра', 'синяя', 'хвс', 'стяжка', 'труба 16']
  },


  // =========================================================================
  // 2. ФИТИНГИ И СОЕДИНИТЕЛЬНЫЕ ЭЛЕМЕНТЫ (FITTINGS)
  // =========================================================================
  // Латунные резьбовые фитинги
  {
    id: 'brass_elbow_12_ff',
    name: 'Угольник латунный 90° 1/2" ВР-ВР (внутренняя-внутренняя резьба)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout',
    spec: 'Горячепрессованная сантехническая латунь CW617N никелированная, PN 25, цилиндрическая трубная резьба 1/2"',
    unit: 'шт',
    price: 190,
    popular: true,
    tags: ['фитинг', 'угольник', '90', '1/2', 'латунь', 'вр-вр', 'резьбовой']
  },
  {
    id: 'brass_elbow_12_fm',
    name: 'Угольник латунный 90° 1/2" ВР-НР (внутренняя-наружная резьба)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout',
    spec: 'Компактный кованый уголок 1/2" ВН для узлов ввода и приборов',
    unit: 'шт',
    price: 210,
    popular: true,
    tags: ['фитинг', 'угольник', '90', '1/2', 'латунь', 'вр-нр']
  },
  {
    id: 'brass_elbow_34_ff',
    name: 'Угольник латунный 90° 3/4" ВР-ВР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Латунь никелированная, резьба 3/4" для стояковых и коллекторных соединений',
    unit: 'шт',
    price: 320,
    tags: ['фитинг', 'угольник', '3/4', 'латунь']
  },
  {
    id: 'brass_elbow_45_12',
    name: 'Угольник латунный 45° 1/2" ВР-НР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Угол 45 градусов для плавного обхода препятствий в коллекторных шкафах',
    unit: 'шт',
    price: 280,
    tags: ['угольник', '45', '1/2', 'латунь', 'плавный поворот']
  },
  {
    id: 'brass_tee_12_equal',
    name: 'Тройник латунный равнопроходной 1/2" ВР-ВР-ВР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout',
    spec: 'Латунь CW617N, резьба 1/2" на всех выходах, для разветвления трубопроводов',
    unit: 'шт',
    price: 260,
    popular: true,
    tags: ['фитинг', 'тройник', '1/2', 'латунь', 'равнопроходной']
  },
  {
    id: 'brass_tee_34_equal',
    name: 'Тройник латунный равнопроходной 3/4" ВР-ВР-ВР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Резьба 3/4" для распределения потоков',
    unit: 'шт',
    price: 430,
    tags: ['фитинг', 'тройник', '3/4', 'латунь']
  },
  {
    id: 'brass_tee_reducing_34_12_34',
    name: 'Тройник латунный переходной 3/4"х1/2"х3/4" ВР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Для врезки отвода 1/2" в магистраль 3/4" без лишних футорок',
    unit: 'шт',
    price: 480,
    popular: true,
    tags: ['тройник', 'переходной', '3/4х1/2', 'латунь']
  },
  {
    id: 'brass_coupling_12_equal',
    name: 'Муфта латунная соединительная 1/2" ВР-ВР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Прямая соединительная муфта для сращивания резьбовых патрубков 1/2"',
    unit: 'шт',
    price: 140,
    popular: true,
    tags: ['муфта', '1/2', 'латунь', 'соединитель']
  },
  {
    id: 'brass_coupling_reducing_34_12',
    name: 'Муфта латунная переходная 3/4"х1/2" ВР-ВР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Переходник с резьбы 3/4" внутренняя на 1/2" внутренняя',
    unit: 'шт',
    price: 210,
    tags: ['муфта', 'переходная', '3/4 на 1/2', 'латунь']
  },
  {
    id: 'brass_nipple_12_equal',
    name: 'Ниппель латунный бочонок 1/2" НР-НР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout',
    spec: 'Шестигранный ниппель 1/2" наружная-наружная с насечками для удержания льна и нити',
    unit: 'шт',
    price: 110,
    popular: true,
    tags: ['ниппель', 'бочонок', '1/2', 'нр-нр', 'латунь']
  },
  {
    id: 'brass_nipple_34_equal',
    name: 'Ниппель латунный бочонок 3/4" НР-НР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Шестигранный ниппель 3/4" наружная-наружная резьба',
    unit: 'шт',
    price: 180,
    tags: ['ниппель', '3/4', 'латунь']
  },
  {
    id: 'brass_nipple_reducing_34_12',
    name: 'Ниппель латунный переходной 3/4"х1/2" НР-НР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Шестигранный переходник наружная 3/4" на наружную 1/2"',
    unit: 'шт',
    price: 190,
    popular: true,
    tags: ['ниппель', 'переходной', '3/4 на 1/2', 'нр-нр']
  },
  {
    id: 'brass_bushing_34_12',
    name: 'Футорка латунная 3/4"х1/2" (наружная 3/4" - внутренняя 1/2")',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout',
    spec: 'Компактный резьбовой переходник наружная резьба 3/4", внутренняя 1/2"',
    unit: 'шт',
    price: 140,
    popular: true,
    tags: ['футорка', '3/4 на 1/2', 'латунь', 'переходник']
  },
  {
    id: 'brass_bushing_1_12',
    name: 'Футорка латунная 1"х1/2" (наружная 1" - внутренняя 1/2")',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Для подключения датчиков или манометров в магистрали 1"',
    unit: 'шт',
    price: 230,
    tags: ['футорка', '1 на 1/2', 'латунь']
  },
  {
    id: 'brass_bushing_1_34',
    name: 'Футорка латунная 1"х3/4" (наружная 1" - внутренняя 3/4")',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Для перехода с коллекторного ввода 1" на трубу или кран 3/4"',
    unit: 'шт',
    price: 240,
    tags: ['футорка', '1 на 3/4', 'коллектор']
  },
  {
    id: 'brass_extension_12_15',
    name: 'Удлинитель резьбы латунный хромированный 1/2" L=15 мм',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout',
    spec: 'Хромированная латунь, для вывода водорозеток заподлицо со слоем кафельной плитки',
    unit: 'шт',
    price: 170,
    popular: true,
    tags: ['удлинитель', '1/2', '15 мм', 'хром', 'плитка', 'водорозетка']
  },
  {
    id: 'brass_extension_12_25',
    name: 'Удлинитель резьбы латунный хромированный 1/2" L=25 мм',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout',
    spec: 'Для заглубленных водорозеток при толстом слое плиточного клея, длина 25 мм',
    unit: 'шт',
    price: 220,
    popular: true,
    tags: ['удлинитель', '1/2', '25 мм', 'хром']
  },
  {
    id: 'brass_extension_12_50',
    name: 'Удлинитель резьбы латунный хромированный 1/2" L=50 мм',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Длинный удлинитель резьбы 50 мм',
    unit: 'шт',
    price: 360,
    tags: ['удлинитель', '1/2', '50 мм']
  },
  {
    id: 'brass_plug_12_male',
    name: 'Заглушка латунная с наружной резьбой 1/2" (пробка)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'С шестигранной головкой для надежного глушения выходов коллекторов и тройников',
    unit: 'шт',
    price: 85,
    popular: true,
    tags: ['заглушка', 'пробка', '1/2', 'нр', 'латунь']
  },
  {
    id: 'brass_cap_12_female',
    name: 'Заглушка латунная с внутренней резьбой 1/2" (колпачок)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Колпачок 1/2" для герметизации наружных резьб',
    unit: 'шт',
    price: 90,
    tags: ['колпачок', 'заглушка', '1/2', 'вр']
  },
  {
    id: 'brass_american_straight_12',
    name: 'Американка латунная прямая разъемная 1/2" ВР-НР с конусом EPDM',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout',
    spec: 'Разъемное муфтовое соединение с накидной гайкой, конусное уплотнение с кольцом EPDM, PN 25',
    unit: 'шт',
    price: 340,
    popular: true,
    tags: ['американка', 'сгон', 'разъемное', '1/2', 'латунь', 'накидная гайка']
  },
  {
    id: 'brass_american_straight_34',
    name: 'Американка латунная прямая разъемная 3/4" ВР-НР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout',
    spec: 'Разборный сгон 3/4" для бойлеров, циркуляционных насосов и фильтров',
    unit: 'шт',
    price: 520,
    popular: true,
    tags: ['американка', '3/4', 'латунь', 'разборный сгон']
  },
  {
    id: 'brass_american_corner_12',
    name: 'Американка латунная угловая 90° 1/2" ВР-НР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Угловое разъемное соединение для аккуратного монтажа полотенцесушителей и радиаторов',
    unit: 'шт',
    price: 460,
    popular: true,
    tags: ['американка', 'угловая', '1/2', 'полотенцесушитель']
  },

  // Фитинги для полипропилена (под пайку)
  {
    id: 'ppr_coupling_20',
    name: 'Муфта ППР 20 соединительная равнопроходная (под пайку)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'PP-R для раструбной сварки, до PN 25, толстостенная',
    unit: 'шт',
    price: 18,
    popular: true,
    tags: ['ппр', 'муфта', '20', 'пайка']
  },
  {
    id: 'ppr_coupling_25_20',
    name: 'Муфта ППР переходная 25х20 мм (под пайку)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Переход с диаметра 25 на 20 мм под раструбную пайку',
    unit: 'шт',
    price: 24,
    tags: ['ппр', 'муфта', 'переходная', '25х20']
  },
  {
    id: 'ppr_elbow_90_20',
    name: 'Угольник ППР 90° 20 мм (под пайку)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Угол 90 градусов для поворота трассы полипропилена 20 мм',
    unit: 'шт',
    price: 19,
    popular: true,
    tags: ['ппр', 'уголок', '90', '20', 'пайка']
  },
  {
    id: 'ppr_elbow_45_20',
    name: 'Угольник ППР 45° 20 мм (под пайку)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Угол 45 градусов для снижения гидравлического сопротивления трассы',
    unit: 'шт',
    price: 22,
    popular: true,
    tags: ['ппр', 'уголок', '45', '20']
  },
  {
    id: 'ppr_tee_20_equal',
    name: 'Тройник ППР 20 равнопроходной (под пайку)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Равнопроходной тройник 20-20-20 для отводов ХВС и ГВС',
    unit: 'шт',
    price: 26,
    popular: true,
    tags: ['ппр', 'тройник', '20', 'пайка']
  },
  {
    id: 'ppr_tee_25_20_25',
    name: 'Тройник ППР переходной 25х20х25 мм (под пайку)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Для врезки потребителя 20 мм в стояк или магистраль 25 мм',
    unit: 'шт',
    price: 38,
    tags: ['ппр', 'тройник', 'переходной', '25х20х25']
  },
  {
    id: 'ppr_cross_20',
    name: 'Крестовина ППР 20 мм равнопроходная (под пайку)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Для пересечения и разветвления трасс водопровода 20 мм',
    unit: 'шт',
    price: 65,
    tags: ['ппр', 'крестовина', '20']
  },
  {
    id: 'ppr_bridge_bypass_20',
    name: 'Обводное колено ППР 20 мм с раструбами (обвод труб)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Готовая изогнутая деталь для перекрестного обхода пересекающихся труб без стыков',
    unit: 'шт',
    price: 85,
    popular: true,
    tags: ['ппр', 'обвод', 'колено', 'перекресток', '20']
  },
  {
    id: 'ppr_water_socket_20_12',
    name: 'Водорозетка ППР 20х1/2" с латунной внутренней резьбой (настенная)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Kalde',
    spec: 'С ушками крепления к стене под дюбели, закладная латунь CW617N, для смесителей и кранов',
    unit: 'шт',
    price: 185,
    popular: true,
    tags: ['водорозетка', 'ппр', '20х1/2', 'смеситель', 'настенная', 'латунь']
  },
  {
    id: 'ppr_combined_coupling_20_12_f',
    name: 'Муфта ППР комбинированная 20х1/2" ВР (внутренняя резьба)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'ППР пайка 20 мм + закладная латунная гайка 1/2"',
    unit: 'шт',
    price: 145,
    tags: ['ппр', 'муфта', 'комбинированная', '20х1/2', 'вр']
  },
  {
    id: 'ppr_combined_coupling_20_12_m',
    name: 'Муфта ППР комбинированная 20х1/2" НР (наружная резьба)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'ППР пайка 20 мм + закладной латунный штуцер 1/2" наружная',
    unit: 'шт',
    price: 155,
    tags: ['ппр', 'муфта', 'комбинированная', '20х1/2', 'нр']
  },
  {
    id: 'ppr_american_coupling_20_12',
    name: 'Муфта ППР разъемная (американка) 20х1/2" ВР',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Разборный переход с полипропилена 20 мм на резьбу 1/2" с накидной гайкой',
    unit: 'шт',
    price: 360,
    popular: true,
    tags: ['ппр', 'американка', 'разъемная', '20х1/2']
  },
  {
    id: 'ppr_ball_valve_20',
    name: 'Кран шаровый ППР 20 под пайку (ручка-бабочка)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Полнопроходной полипропиленовый шаровый кран с латунным хромированным шаром',
    unit: 'шт',
    price: 240,
    popular: true,
    tags: ['кран ппр', '20', 'пайка', 'шаровый']
  },
  {
    id: 'ppr_plug_20_weld',
    name: 'Заглушка ППР 20 мм под пайку',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Для постоянного глушения концов веток трубопровода',
    unit: 'шт',
    price: 15,
    tags: ['заглушка', 'ппр', '20', 'пайка']
  },
  {
    id: 'ppr_test_plug_12_blue_red',
    name: 'Заглушка опрессовочная временная пластиковая 1/2" с прокладкой (синяя/красная)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Многоразовая пробка с резиновым уплотнителем для опрессовки водорозеток давлением до 15 бар',
    unit: 'шт',
    price: 45,
    popular: true,
    tags: ['заглушка', 'опрессовочная', 'временная', '1/2', 'тест']
  },

  // Фитинги для металлопластика и PEX (Пресс, Цанга, Аксиальные)
  {
    id: 'press_mp_elbow_16_equal',
    name: 'Угольник пресс 90° для металлопластика 16-16 (гильза нержавейка AISI 304)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout Press',
    spec: 'Профиль обжима TH/U, два уплотнительных кольца EPDM на штуцере, смотровое окно контроля захода трубы',
    unit: 'шт',
    price: 260,
    popular: true,
    tags: ['пресс', 'фитинг', 'металлопластик', '16', 'угольник', 'th']
  },
  {
    id: 'press_mp_tee_16_equal',
    name: 'Тройник пресс равнопроходной 16-16-16 для металлопластика',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout',
    spec: 'Тройной пресс-обжим 16 мм, нержавеющие гильзы, латунь CW617N',
    unit: 'шт',
    price: 390,
    tags: ['пресс', 'тройник', 'металлопластик', '16']
  },
  {
    id: 'press_mp_coupling_16_equal',
    name: 'Муфта пресс соединительная 16-16 для металлопластика',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec / Stout',
    spec: 'Для надежного неразъемного соединения труб в стяжке пола',
    unit: 'шт',
    price: 210,
    tags: ['пресс', 'муфта', 'металлопластик', '16']
  },
  {
    id: 'press_mp_water_socket_16_12',
    name: 'Водорозетка пресс 16х1/2" ВР настенная для металлопластика',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'С фланцем для жесткой фиксации к стене или монтажной планке',
    unit: 'шт',
    price: 380,
    popular: true,
    tags: ['водорозетка', 'пресс', '16х1/2', 'смеситель']
  },
  {
    id: 'comp_mp_coupling_16_equal',
    name: 'Муфта компрессионная (цанговая) 16-16 для металлопластика с разрезным кольцом',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Valtec',
    spec: 'Обжимное латунное разрезное кольцо (цанга), затягивается гаечным ключом, для открытого монтажа',
    unit: 'шт',
    price: 220,
    tags: ['цанга', 'компрессионный', 'обжимной', 'металлопластик', '16']
  },
  {
    id: 'axial_pex_sleeve_16',
    name: 'Гильза надвижная аксиальная PEX 16 мм латунь CW617N / PVDF',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Stout / Rehau',
    spec: 'Для неразъемного напрессовочного монтажа труб PEX-A без уплотнительных резинок (монолит со стяжкой)',
    unit: 'шт',
    price: 85,
    popular: true,
    tags: ['гильза', 'надвижная', 'аксиальная', 'pex', '16', 'stout', 'rehau']
  },
  {
    id: 'axial_pex_elbow_16_equal',
    name: 'Угольник аксиальный напрессовочный PEX 16-16 латунь CW617N',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Stout / Rehau',
    spec: 'Полнопроходной напрессовочный угольник для систем отопления и водоснабжения',
    unit: 'шт',
    price: 180,
    popular: true,
    tags: ['аксиальный', 'угольник', 'pex', '16', 'латунь']
  },
  {
    id: 'axial_pex_water_socket_16_12',
    name: 'Водорозетка аксиальная напрессовочная PEX 16х1/2" ВР настенная',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Stout / Rehau',
    spec: 'Толстостенная латунная водорозетка под надвижную гильзу с ушками под планку',
    unit: 'шт',
    price: 290,
    popular: true,
    tags: ['водорозетка', 'аксиальная', 'pex', '16х1/2', 'rehau', 'stout']
  },
  {
    id: 'eurocone_fitting_16_34',
    name: 'Фитинг Евроконус 3/4"х16х2.0 для коллектора (латунь, цанговый обжим)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Stout / Valtec / FAR',
    spec: 'Конусное самоуплотнение с кольцом EPDM, накидная гайка 3/4" под плотную фиксацию к гребенке',
    unit: 'шт',
    price: 260,
    popular: true,
    tags: ['евроконус', 'коллектор', '3/4', 'труба 16', 'гребенка']
  },

  // Фитинги для медных труб (под пайку и пресс)
  {
    id: 'copper_fitting_elbow_90_15',
    name: 'Уголок медный 90° под капиллярную пайку 15 мм Sanha / Viega',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Sanha / Viega (Германия)',
    spec: 'Бескислородная медь Cu-DHP 99.9%, точный зазор под затягивание припоя капиллярным эффектом',
    unit: 'шт',
    price: 145,
    popular: true,
    tags: ['медь', 'фитинг медный', 'уголок', '15', 'пайка', 'sanha', 'viega']
  },
  {
    id: 'copper_fitting_tee_15_equal',
    name: 'Тройник медный равнопроходной 15-15-15 под пайку Sanha',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Sanha',
    spec: 'Медный тройник 15 мм для пайки мягким или твердым припоем',
    unit: 'шт',
    price: 230,
    tags: ['медь', 'тройник', '15', 'пайка']
  },
  {
    id: 'copper_fitting_coupling_15_equal',
    name: 'Муфта медная соединительная 15 мм под пайку Sanha',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Sanha',
    spec: 'Муфта для прямого сращивания медных труб 15 мм',
    unit: 'шт',
    price: 95,
    tags: ['медь', 'муфта', '15', 'пайка']
  },
  {
    id: 'copper_fitting_transition_15_12_m',
    name: 'Переходник медный под пайку 15 мм на резьбу 1/2" НР латунь',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Sanha / Viega',
    spec: 'Для подключения медной магистрали к шаровым кранам и коллекторам',
    unit: 'шт',
    price: 320,
    popular: true,
    tags: ['медь', 'переходник', '15х1/2', 'нр', 'пайка']
  },
  {
    id: 'copper_press_elbow_15_viega',
    name: 'Уголок пресс медный 90° 15 мм Viega Profipress (контур V)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Viega Profipress (Германия)',
    spec: 'Немецкий пресс-фитинг с контуром SC-Contur и уплотнением EPDM (монтаж без открытого огня клещами V15)',
    unit: 'шт',
    price: 390,
    tags: ['медь', 'пресс', 'viega', 'profipress', '15', 'без огня']
  },

  // Фасонные части канализации: Отводы, Тройники, Крестовины, Редукции, Ревизии
  {
    id: 'sewer_bend_50_45',
    name: 'Отвод канализационный серый 50 мм 45° с раструбом',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Ostendorf / Sinikon',
    spec: 'Идеальный угол 45° для плавного стока без образования засоров',
    unit: 'шт',
    price: 65,
    popular: true,
    tags: ['канализация', 'отвод', '50', '45 градусов', 'колено']
  },
  {
    id: 'sewer_bend_50_87',
    name: 'Отвод канализационный серый 50 мм 87° с раструбом',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Ostendorf / Sinikon',
    spec: 'Прямой угол для вертикального вывода к сифону раковины',
    unit: 'шт',
    price: 68,
    popular: true,
    tags: ['канализация', 'отвод', '50', '87 градусов', '90']
  },
  {
    id: 'sewer_bend_110_45',
    name: 'Отвод канализационный серый 110 мм 45° с раструбом',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Ostendorf / Sinikon',
    spec: 'Для плавного смещения канализационного стояка 110 мм',
    unit: 'шт',
    price: 165,
    popular: true,
    tags: ['канализация', 'отвод', '110', '45 градусов', 'стояк']
  },
  {
    id: 'sewer_bend_110_30',
    name: 'Отвод канализационный серый 110 мм 30° с раструбом',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Ostendorf',
    spec: 'Малый угол 30° для точной подгонки трассы в узких сантехкоробах',
    unit: 'шт',
    price: 175,
    tags: ['канализация', 'отвод', '110', '30 градусов']
  },
  {
    id: 'sewer_tee_50_50_45',
    name: 'Тройник канализационный косой 50х50 мм 45°',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Ostendorf',
    spec: 'Косой тройник 45° предотвращает обратный заброс стоков при одновременном сливе',
    unit: 'шт',
    price: 110,
    popular: true,
    tags: ['канализация', 'тройник', '50х50', 'косой', '45']
  },
  {
    id: 'sewer_tee_110_50_45',
    name: 'Тройник канализационный 110х50 мм 45° косой',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Ostendorf / Sinikon',
    spec: 'Для врезки слива ванны и умывальника 50 мм в центральный стояк 110 мм',
    unit: 'шт',
    price: 240,
    popular: true,
    tags: ['канализация', 'тройник', '110х50', 'стояк', 'косой']
  },
  {
    id: 'sewer_tee_110_110_87',
    name: 'Тройник канализационный прямой 110х110 мм 87° для унитаза',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Ostendorf / Sinikon',
    spec: 'Для непосредственного прямого подключения фановой трубы унитаза к стояку',
    unit: 'шт',
    price: 290,
    popular: true,
    tags: ['канализация', 'тройник', '110х110', 'унитаз', '87']
  },
  {
    id: 'sewer_cross_110_110_50',
    name: 'Крестовина канализационная одноплоскостная 110х110х50 мм (левая/правая)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Ostendorf / Sinikon',
    spec: 'Позволяет в одном узле подключить унитаз 110 мм и боковой слив ванны 50 мм',
    unit: 'шт',
    price: 490,
    popular: true,
    tags: ['крестовина', 'канализация', '110х110х50', 'одноплоскостная']
  },
  {
    id: 'sewer_reduction_110_50',
    name: 'Редукция канализационная эксцентриковая 110х50 мм (переходник)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Ostendorf / Sinikon',
    spec: 'Эксцентриковый переход со 110 на 50 мм без застоя осадка на дне трубы',
    unit: 'шт',
    price: 135,
    popular: true,
    tags: ['редукция', 'переходник', '110х50', 'эксцентрик', 'канализация']
  },
  {
    id: 'sewer_reduction_50_40',
    name: 'Редукция канализационная 50х40 мм (50х32)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Ostendorf',
    spec: 'Для перехода с трубы 50 мм на патрубки сифонов 40 или 32 мм',
    unit: 'шт',
    price: 85,
    tags: ['редукция', '50х40', 'сифон']
  },
  {
    id: 'sewer_revision_110',
    name: 'Ревизия канализационная 110 мм с завинчивающейся герметичной крышкой',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Ostendorf HT',
    spec: 'Обязательный смотровой люк на стояке для прочистки тросом при засорах',
    unit: 'шт',
    price: 360,
    popular: true,
    tags: ['ревизия', 'прочистка', '110', 'люк', 'стояк']
  },
  {
    id: 'sewer_plug_110',
    name: 'Заглушка канализационная раструбная 110 мм',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Герметичная пробка раструба 110 мм с уплотнительным резиновым кольцом',
    unit: 'шт',
    price: 95,
    tags: ['заглушка', 'канализация', '110']
  },

  // Переходные элементы: Манжеты и чугун-пластик
  {
    id: 'cuff_toilet_eccentric_110',
    name: 'Манжета эксцентриковая для унитаза 110 мм (смещение 20 мм)',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Alcaplast / McAlpine',
    spec: 'Качественная многолепестковая эластичная резина для выравнивания оси унитаза',
    unit: 'шт',
    price: 290,
    popular: true,
    tags: ['манжета', 'эксцентрик', 'унитаз', '110', 'mcalpine']
  },
  {
    id: 'cuff_siphon_50_40_rubber',
    name: 'Манжета переходная резиновая для сифона 50х40 (50х32) мм',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Мягкая резиновая манжета для герметичной посадки слива сифона в раструб 50 мм',
    unit: 'шт',
    price: 60,
    popular: true,
    tags: ['манжета', 'резиновая', '50х40', '50х32', 'сифон', 'слив']
  },
  {
    id: 'adapter_cast_iron_to_plastic_110',
    name: 'Манжета-переходник с чугунной трубы на пластик 124х110 мм',
    category: 'Фитинги',
    categoryKey: 'fittings',
    brand: 'Sinikon / McAlpine',
    spec: 'Многолепестковый переходник для плотной герметичной стыковки пластиковой трубы 110 в раструб старого чугунного стояка',
    unit: 'шт',
    price: 280,
    popular: true,
    tags: ['чугун на пластик', 'переходник', 'манжета', '124х110', 'стояк']
  },
  {
    id: 'adapter_cast_iron_to_plastic_50',
    name: 'Манжета-переходник с чугуна на пластик 73х50 мм',
    category: 'Фитинги',
    categoryKey: 'fittings',
    spec: 'Для стыковки пластикового слива 50 мм в раструб чугунной разводки',
    unit: 'шт',
    price: 180,
    tags: ['чугун на пластик', '73х50', 'манжета']
  },


  // =========================================================================
  // 3. ЗАПОРНАЯ, РЕГУЛИРУЮЩАЯ И ЗАЩИТНАЯ АРМАТУРА (VALVES & CONTROLS)
  // =========================================================================
  // Шаровые краны (прямые, угловые, с американкой, мини-краны)
  {
    id: 'tap_bugatti_12_lever_ff',
    name: 'Кран шаровый Bugatti Oregon 1/2" ВР-ВР полнопроходной (рычаг)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Bugatti (Италия)',
    spec: 'Кованая латунь CW617N никелированная, PN 64, тефлоновые седла PTFE, стальной рычаг в защитной изоляции',
    unit: 'шт',
    price: 890,
    popular: true,
    tags: ['кран', 'шаровый', '1/2', 'bugatti', 'бугатти', 'рычаг', 'вр-вр']
  },
  {
    id: 'tap_bugatti_12_butter_ff',
    name: 'Кран шаровый Bugatti Oregon 1/2" ВР-ВР полнопроходной (бабочка)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Bugatti (Италия)',
    spec: 'Компактная алюминиевая рукоятка-бабочка, для узлов ввода в квартиру и коллекторных шкафов',
    unit: 'шт',
    price: 870,
    popular: true,
    tags: ['кран', 'шаровый', '1/2', 'bugatti', 'бугатти', 'бабочка', 'вр-вр']
  },
  {
    id: 'tap_bugatti_12_fm',
    name: 'Кран шаровый Bugatti Oregon 1/2" ВР-НР (бабочка)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Bugatti (Италия)',
    spec: 'Внутренняя-наружная резьба 1/2", PN 64',
    unit: 'шт',
    price: 920,
    tags: ['кран', '1/2', 'вр-нр', 'bugatti']
  },
  {
    id: 'tap_bugatti_12_mm',
    name: 'Кран шаровый Bugatti 1/2" НР-НР (наружная-наружная)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Bugatti',
    spec: 'Наружная резьба с двух сторон для прямого монтажа в приборы',
    unit: 'шт',
    price: 940,
    tags: ['кран', '1/2', 'нр-нр', 'bugatti']
  },
  {
    id: 'tap_bugatti_34_butter_ff',
    name: 'Кран шаровый Bugatti Oregon 3/4" ВР-ВР полнопроходной (бабочка)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Bugatti (Италия)',
    spec: 'Полнопроходной, PN 40, для вводных стояков и гребенок водоснабжения',
    unit: 'шт',
    price: 1320,
    popular: true,
    tags: ['кран', '3/4', 'bugatti', 'бугатти', 'стояк']
  },
  {
    id: 'tap_bugatti_american_12',
    name: 'Кран шаровый Bugatti с американкой 1/2" ВР-НР (бабочка)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Bugatti (Италия)',
    spec: 'Разъемный полусгон с конусом O-ring EPDM, для радиаторов, бойлеров и фильтров',
    unit: 'шт',
    price: 1250,
    popular: true,
    tags: ['кран', 'американка', '1/2', 'сгон', 'bugatti', 'радиатор']
  },
  {
    id: 'tap_bugatti_american_34',
    name: 'Кран шаровый Bugatti с американкой 3/4" ВР-НР (бабочка)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Bugatti (Италия)',
    spec: 'Разъемный полусгон 3/4", для коллекторов и котловых контуров',
    unit: 'шт',
    price: 1750,
    popular: true,
    tags: ['кран', 'американка', '3/4', 'bugatti']
  },
  {
    id: 'tap_angle_ball_12',
    name: 'Кран шаровый угловой 1/2" ВР-НР с американкой (бабочка)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Valtec / Stout',
    spec: 'Угловое подключение отопительных приборов и водонагревателей со сгоном',
    unit: 'шт',
    price: 1150,
    tags: ['кран', 'угловой', 'американка', '1/2']
  },
  {
    id: 'tap_mini_appliance_12_34',
    name: 'Кран приборный мини угловой 1/2"х3/4" для стиральной машины (хром)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Albertoni / Arco (Испания)',
    spec: 'Зеркальный хромированный латунный кран с керамическим затвором, выход 3/4" под заливной шланг СМА/ПММ, с декоративной чашкой',
    unit: 'шт',
    price: 680,
    popular: true,
    tags: ['кран', 'стиральная машина', 'мини', '1/2х3/4', 'хром', 'arco']
  },
  {
    id: 'tap_3way_appliance_12_34_12',
    name: 'Кран трехпроходной приборный 1/2"х3/4"х1/2" (для врезки СМА в смеситель)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Valtec',
    spec: 'Позволяет запитать стиральную машину между стеной и смесителем без сварки и штробления',
    unit: 'шт',
    price: 790,
    tags: ['кран', 'трехпроходной', 'стиралка', 'врезка']
  },

  // Обратные клапаны (латунные и канализационные)
  {
    id: 'check_valve_itap_europa_12',
    name: 'Клапан обратный Itap Europa 1/2" с латунным штоком (муфтовый)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Itap Europa (Италия)',
    spec: 'Пружина нержавеющая сталь AISI 302, латунный диск и шток, уплотнение NBR, PN 25, бесшумная работа',
    unit: 'шт',
    price: 940,
    popular: true,
    tags: ['клапан', 'обратный', 'itap', 'europa', '1/2', 'латунный шток']
  },
  {
    id: 'check_valve_itap_europa_34',
    name: 'Клапан обратный Itap Europa 3/4" с латунным штоком',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Itap Europa (Италия)',
    spec: 'Полнопроходной обратный клапан 3/4" для счетчиков и насосов',
    unit: 'шт',
    price: 1380,
    tags: ['клапан', 'обратный', '3/4', 'itap']
  },
  {
    id: 'sewer_check_valve_50',
    name: 'Клапан обратный канализационный 50 мм с ручной заслонкой (лепестковый)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'McAlpine / Capricorn',
    spec: 'Защищает от обратного подпора стоков и проникновения грызунов, заслонка из нержавеющей стали с ручной фиксацией',
    unit: 'шт',
    price: 1850,
    popular: true,
    tags: ['обратный клапан', 'канализация', '50', 'лепестковый', 'затопление']
  },
  {
    id: 'sewer_check_valve_110',
    name: 'Клапан обратный канализационный 110 мм с ручной блокировкой (затвор)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Capricorn / McAlpine',
    spec: 'Для первых этажей и частных домов, предотвращает затопление фекальными водами при засоре центрального стояка',
    unit: 'шт',
    price: 3600,
    popular: true,
    tags: ['обратный клапан', 'канализация', '110', 'затвор', 'первый этаж']
  },

  // Регулирующая арматура для отопления (термоклапаны, термоголовки, бинокли)
  {
    id: 'rad_valve_manual_12',
    name: 'Кран радиаторный ручной прямой 1/2" Valtec с полусгоном',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Valtec',
    spec: 'Вентиль тонкой ручной регулировки протока радиатора, с американкой',
    unit: 'шт',
    price: 680,
    tags: ['кран', 'радиаторный', 'вентиль', '1/2', 'ручной']
  },
  {
    id: 'rad_thermo_valve_12_straight',
    name: 'Клапан термостатический прямой 1/2" под термоголовку Danfoss / Valtec',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Danfoss / Valtec',
    spec: 'Резьба М30х1.5, подпружиненный шток для автоматического поддержания температуры в комнате',
    unit: 'шт',
    price: 1150,
    popular: true,
    tags: ['клапан', 'термостатический', '1/2', 'термоголовка', 'danfoss']
  },
  {
    id: 'rad_thermo_head_m30',
    name: 'Термоголовка жидкостная для радиатора М30х1.5 Danfoss / Stout',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Danfoss / Stout',
    spec: 'Диапазон настройки +6...+28°C, защита от замерзания, быстрая реакция на изменение температуры',
    unit: 'шт',
    price: 1250,
    popular: true,
    tags: ['термоголовка', 'радиатор', 'м30', 'отопление', 'комфорт']
  },
  {
    id: 'rad_lockshield_valve_12',
    name: 'Клапан настроечный запорный для обратной подводки радиатора 1/2"',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Valtec',
    spec: 'Регулировка шестигранным ключом под декоративным металлическим колпачком, для балансировки системы',
    unit: 'шт',
    price: 640,
    tags: ['клапан', 'обратка', 'настроечный', 'балансировка', '1/2']
  },
  {
    id: 'rad_h_block_straight_34',
    name: 'Узел нижнего подключения радиатора (бинокль) прямой 3/4" Евроконус',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Stout / Valtec',
    spec: 'Межосевое расстояние 50 мм, со встроенными шаровыми затворами для отключения радиатора без слива системы',
    unit: 'шт',
    price: 1650,
    popular: true,
    tags: ['бинокль', 'нижнее подключение', 'радиатор', '3/4', 'евроконус']
  },
  {
    id: 'rad_h_block_angle_34',
    name: 'Узел нижнего подключения радиатора (бинокль) угловой 3/4" (из стены)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Stout / Valtec',
    spec: 'Для аккуратного скрытого выхода труб из стены к радиатору с нижним подключением',
    unit: 'шт',
    price: 1750,
    popular: true,
    tags: ['бинокль', 'угловой', 'нижнее подключение', 'из стены']
  },
  {
    id: 'balancing_valve_34',
    name: 'Вентиль балансировочный ручной 3/4" со штуцерами измерения давления',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Danfoss / Valtec',
    spec: 'Точная гидравлическая увязка стояков и коллекторных петель',
    unit: 'шт',
    price: 3400,
    tags: ['балансировочный', 'вентиль', '3/4', 'гидравлика']
  },

  // Фильтры и грязевики (косые, промывные, магистральные колбы)
  {
    id: 'filter_oblique_far_12_300',
    name: 'Фильтр косой механической очистки FAR 1/2" 300 мкм DZR (латунь)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'FAR (Италия)',
    spec: 'Стойкая к децинкификации DZR латунь, сетка AISI 304 300 мкм, сливная резьбовая пробка',
    unit: 'шт',
    price: 1750,
    popular: true,
    tags: ['фильтр', 'косой', 'грязевик', '1/2', 'far', 'dzr']
  },
  {
    id: 'filter_oblique_valtec_12_500',
    name: 'Фильтр сетчатый косой Valtec 1/2" 500 мкм никелированный',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Valtec',
    spec: 'Латунь CW617N, сетка 500 мкм, пробка с ушком под контрольную пломбу счетчика',
    unit: 'шт',
    price: 490,
    popular: true,
    tags: ['фильтр', 'косой', '1/2', 'valtec', 'счетчик', '500 мкм']
  },
  {
    id: 'filter_oblique_valtec_34_500',
    name: 'Фильтр сетчатый косой Valtec 3/4" 500 мкм',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Valtec',
    spec: 'Для стояков 3/4" перед общедомовыми узлами учета',
    unit: 'шт',
    price: 740,
    tags: ['фильтр', 'косой', '3/4', 'valtec']
  },
  {
    id: 'filter_flushing_honeywell_12',
    name: 'Фильтр тонкой очистки промывной Honeywell / Resideo MiniPlus 1/2" 100 мкм',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Honeywell / Resideo (Германия)',
    spec: 'Прозрачная ударопрочная чаша (для ХВС), сетка 100 мкм из нержавейки, встроенный дренажный кран прямой промывки',
    unit: 'шт',
    price: 4850,
    popular: true,
    tags: ['фильтр', 'промывной', 'honeywell', '100 мкм', '1/2', 'тонкая очистка']
  },
  {
    id: 'filter_flushing_far_12_gauge',
    name: 'Фильтр самопромывной FAR 1/2" 100 мкм с манометром и поворотным узлом',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'FAR (Италия)',
    spec: 'Латунный корпус DZR, сетка 100 мкм, манометр 0-10 бар для контроля загрязнения, сливной штуцер',
    unit: 'шт',
    price: 7900,
    popular: true,
    tags: ['фильтр', 'far', 'промывной', 'манометр', '100 мкм', 'премиум']
  },

  // Редукторы давления и группы безопасности
  {
    id: 'reducer_far_membrane_12',
    name: 'Редуктор давления мембранный FAR 1/2" с манометром (1-6 бар)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'FAR (Италия)',
    spec: 'Моноблочный мембранный картридж, гасит скачки давления до 25 бар, не закисает от ржавчины, регулировка 1-6 бар',
    unit: 'шт',
    price: 6450,
    popular: true,
    tags: ['редуктор', 'давление', 'мембранный', 'far', 'манометр', '1/2']
  },
  {
    id: 'reducer_valtec_piston_12',
    name: 'Редуктор давления поршневой Valtec 1/2" со шкалой регулировки',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Valtec',
    spec: 'Компактный поршневой редуктор 1/2", гнездо 1/4" под манометр, регулировка 1-5.5 бар',
    unit: 'шт',
    price: 2600,
    popular: true,
    tags: ['редуктор', 'поршневой', 'valtec', '1/2']
  },
  {
    id: 'safety_valve_boiler_6bar',
    name: 'Клапан предохранительный сбросной для бойлера 1/2" на 6.0 бар с флажком слива',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Watts / Itap',
    spec: 'Встроенный обратный клапан + сброс избыточного давления выше 6 бар, защищает бак водонагревателя от разрыва',
    unit: 'шт',
    price: 480,
    popular: true,
    tags: ['предохранительный клапан', 'бойлер', '6 бар', 'водонагреватель']
  },
  {
    id: 'safety_group_boiler_watts',
    name: 'Группа безопасности бойлера Watts SFR 3/4" (до 50 кВт)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Watts (Германия)',
    spec: 'Единый блок: шаровый кран, обратный клапан, клапан сброса 7 бар, воронка разрыва струи',
    unit: 'шт',
    price: 3850,
    tags: ['группа безопасности', 'бойлер', 'watts', '3/4']
  },
  {
    id: 'air_vent_auto_valtec_12',
    name: 'Воздухоотводчик автоматический поплавковый Valtec 1/2" прямой (латунь)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Valtec',
    spec: 'Поплавковая система с клапаном сброса завоздушивания в верхней точке коллектора и стояка, PN 10',
    unit: 'шт',
    price: 490,
    popular: true,
    tags: ['воздухоотводчик', 'автоматический', '1/2', 'коллектор', 'отопление']
  },
  {
    id: 'air_vent_manual_mayevsky_12',
    name: 'Кран Маевского ручной воздухоотводчик 1/2" со специальным ключом',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    spec: 'Хромированная латунь, винт под шлиц и четырехгранный ключ, для радиаторов отопления',
    unit: 'шт',
    price: 95,
    popular: true,
    tags: ['кран маевского', 'радиатор', 'воздухоотводчик', '1/2']
  },
  {
    id: 'safety_group_boiler_heat_1',
    name: 'Группа безопасности котла отопления 1" на латунной консоли (до 50 кВт)',
    category: 'Краны и арматура',
    categoryKey: 'valves_taps',
    brand: 'Watts / Stout',
    spec: 'Манометр 0-4 бар + автоматический воздухоотводчик + предохранительный клапан 3.0 бар на цельной кованой консоли 1"',
    unit: 'компл',
    price: 3600,
    popular: true,
    tags: ['группа безопасности', 'котел', 'отопление', 'watts', '3 бар', '1 дюйм']
  },


  // =========================================================================
  // 4. САНТЕХНИЧЕСКИЕ ПРИБОРЫ, КЕРАМИКА И ИНЖЕНЕРКА (FIXTURES)
  // =========================================================================
  // Смесители и душевые системы
  {
    id: 'mixer_basin_standard_grohe',
    name: 'Смеситель для раковины однорычажный Grohe Eurosmart с керамическим картриджем 28 мм',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Grohe (Германия)',
    spec: 'Литой латунный корпус, хромирование Grohe StarLight, аэратор EcoJoy 5.7 л/мин, гибкая подводка 3/8" в комплекте',
    unit: 'шт',
    price: 6490,
    popular: true,
    tags: ['смеситель', 'раковина', 'grohe', 'умывальник', 'однорычажный']
  },
  {
    id: 'mixer_bath_shower_grohe',
    name: 'Смеситель для ванны с душем настенный Grohe Eurosmart с автоматическим переключателем',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Grohe',
    spec: 'Керамический картридж SilkMove 35 мм, аэратор, обратный клапан в душевом отводе 1/2", эксцентрики с чашками',
    unit: 'шт',
    price: 8900,
    popular: true,
    tags: ['смеситель', 'ванна', 'душ', 'grohe', 'настенный']
  },
  {
    id: 'mixer_bath_long_spout',
    name: 'Смеситель для ванны с длинным поворотным изливом 300 мм и лейкой Lemark',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Lemark (Чехия)',
    spec: 'Поворотный S-образный плоский излив 30 см (для одновременного обслуживания ванны и раковины), шланг 1.5 м, 3-режимная лейка',
    unit: 'шт',
    price: 6800,
    popular: true,
    tags: ['смеситель', 'поворотный излив', 'длинный гусак', '300мм', 'ванна']
  },
  {
    id: 'mixer_thermostatic_grohe',
    name: 'Смеситель термостатический для ванны и душа Grohe Grohtherm 800 (38°C SafeStop)',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Grohe (Германия)',
    spec: 'Встроенный термоэлемент TurboStat, мгновенно выравнивает перепады давления ХВС/ГВС, защита от ошпаривания',
    unit: 'шт',
    price: 15400,
    popular: true,
    tags: ['термостат', 'смеситель', 'grohe', 'термостатический', '38 градусов']
  },
  {
    id: 'shower_system_rain_grohe',
    name: 'Душевая стойка с тропическим верхним душем 250 мм и ручной лейкой Grohe Euphoria',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Grohe',
    spec: 'Штанга из нержавеющей стали, верхний диск 25 см с защитой от извести SpeedClean, гибкий шланг TwistFree',
    unit: 'компл',
    price: 24500,
    popular: true,
    tags: ['душевая стойка', 'тропический душ', 'grohe', 'стойка']
  },
  {
    id: 'mixer_bidet_with_aerator',
    name: 'Смеситель для биде с поворотным аэратором на шарнире Lemark',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Lemark',
    spec: 'Шаровый шарнир позволяет менять направление струи, донный клапан в комплекте',
    unit: 'шт',
    price: 4900,
    tags: ['биде', 'смеситель', 'аэратор на шарнире']
  },
  {
    id: 'hygienic_shower_kit_grohe',
    name: 'Гигиенический душ со смесителем скрытого монтажа Grohe BauFlow Trigger Spray',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Grohe',
    spec: 'Встраиваемый в стену моноблочный смеситель + лейка с клавишей подачи воды + настенный держатель + шланг Silverflex',
    unit: 'компл',
    price: 10800,
    popular: true,
    tags: ['гигиенический душ', 'grohe', 'скрытый монтаж', 'унитаз']
  },
  {
    id: 'mixer_kitchen_flexible_spout',
    name: 'Кухонный смеситель с гибким изливом и переключением на струю/душ Granfest',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Granfest',
    spec: 'Силиконовый гибкий излив с магнитной фиксацией, переключение на режим аэрированной струи или лейки',
    unit: 'шт',
    price: 5200,
    popular: true,
    tags: ['смеситель', 'кухня', 'гибкий излив', 'мойка']
  },
  {
    id: 'mixer_kitchen_filtered_water_2in1',
    name: 'Смеситель для кухни 2-в-1 с отдельным каналом для питьевого фильтра Lemark Comfort',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Lemark',
    spec: 'Два независимых водотока: бытовая вода (картридж 35 мм) + фильтрованная питьевая вода (кран-букса), без лишних отверстий в мойке',
    unit: 'шт',
    price: 9400,
    popular: true,
    tags: ['смеситель для кухни', '2 в 1', 'питьевая вода', 'фильтр']
  },
  {
    id: 'mixer_sensor_touchless',
    name: 'Смеситель сенсорный бесконтактный для умывальника (питание от батареек 4хАА / сети)',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    spec: 'Инфракрасный датчик движения, автоматическая подача воды 0.5 сек, латунный корпус, идеальная гигиена',
    unit: 'шт',
    price: 7600,
    tags: ['сенсорный', 'бесконтактный', 'смеситель', 'автоматический']
  },

  // Санитарная керамика и инсталляции
  {
    id: 'toilet_compact_rimless_roca',
    name: 'Унитаз-компакт напольный безободковый Roca Gap Clean Rim с микролифтом (Soft Close)',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Roca (Испания)',
    spec: 'Санфарфор высокой плотности, антибактериальная глазурь, безободковая чаша Rimless, дюропластовое сиденье с плавным опусканием',
    unit: 'компл',
    price: 18900,
    popular: true,
    tags: ['унитаз', 'компакт', 'roca', 'rimless', 'микролифт', 'безободковый']
  },
  {
    id: 'toilet_wall_hung_rimless',
    name: 'Унитаз подвесной безободковый Cersanit City Clean On с тонким сиденьем микролифт',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Cersanit',
    spec: 'Подвесная чаша скрытого монтажа, вихревой смыв, ультратонкое быстросъемное сиденье Slim из дюропласта',
    unit: 'шт',
    price: 11500,
    popular: true,
    tags: ['унитаз подвесной', 'cersanit', 'clean on', 'микролифт']
  },
  {
    id: 'installation_geberit_duofix_111',
    name: 'Инсталляция для подвесного унитаза Geberit Duofix Delta 111.153 (рама с бачком)',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Geberit (Швейцария)',
    spec: 'Самонесущая стальная рама с антикоррозийным покрытием (нагрузка до 400 кг), бесшовный литой бачок с защитой от конденсата',
    unit: 'компл',
    price: 19800,
    popular: true,
    tags: ['инсталляция', 'geberit', 'геберит', 'duofix', 'рама', 'скрытый бачок']
  },
  {
    id: 'installation_grohe_rapid_sl',
    name: 'Инсталляция для подвесного унитаза Grohe Rapid SL 3-в-1 с клавишей смыва и крепежом',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Grohe (Германия)',
    spec: 'Комплект: рама Rapid SL + настенные уголки крепления + пневматическая кнопка смыва хром Skate Cosmopolitan',
    unit: 'компл',
    price: 21900,
    popular: true,
    tags: ['инсталляция', 'grohe', 'rapid sl', 'комплект 3 в 1']
  },
  {
    id: 'flush_plate_geberit_delta21_chrome',
    name: 'Клавиша смыва Geberit Delta 21 глянцевый хром двойной смыв 3/6 л',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Geberit',
    spec: 'Двойная кнопка малого и большого смыва, стойкое хромированное покрытие',
    unit: 'шт',
    price: 2900,
    tags: ['кнопка', 'клавиша смыва', 'geberit', 'хром']
  },
  {
    id: 'basin_countertop_bowl_roca',
    name: 'Раковина-чаша накладная на столешницу 50 см Roca Inspira Round (санфарфор)',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Roca',
    spec: 'Тонкостенный высокопрочный санфарфор FINECERAMIC, белоснежная глянцевая глазурь, без перелива',
    unit: 'шт',
    price: 12400,
    popular: true,
    tags: ['раковина', 'чаша', 'накладная', 'столешница', 'roca']
  },
  {
    id: 'basin_furniture_60_cersanit',
    name: 'Умывальник мебельный подвесной 60 см Cersanit Como под тумбу',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Cersanit',
    spec: 'С отверстием под смеситель по центру и сливом-переливом, прямоугольная строгая геометрия',
    unit: 'шт',
    price: 4600,
    tags: ['раковина', 'умывальник', 'мебельный', '60 см']
  },
  {
    id: 'bathtub_acrylic_170_70',
    name: 'Ванна акриловая прямоугольная 170х70 см с каркасом и ножками Cersanit Santana',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Cersanit',
    spec: '100% литьевой сантехнический акрил Lucite 4 мм, усиленное дно, регулируемый металлический каркас',
    unit: 'компл',
    price: 16800,
    popular: true,
    tags: ['ванна', 'акриловая', '170х70', 'каркас']
  },
  {
    id: 'bathtub_cast_iron_170_70_roca',
    name: 'Ванна чугунная эмалированная 170х70 см Roca Continental с антискользящим дном',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Roca (Испания)',
    spec: 'Толстостенный чугун 5.5 мм, титановая 6-слойная эмаль, сохраняет тепло воды до 2 часов',
    unit: 'шт',
    price: 46500,
    tags: ['ванна чугунная', 'roca', '170х70', 'чугун']
  },
  {
    id: 'shower_tray_acrylic_90_90',
    name: 'Поддон душевой акриловый полукруглый 90х90 см низкий (h=14 см) с сифоном',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    spec: 'Усиленный акриловый поддон, антискользящая текстура, сифон диаметром 90 мм с гидрозатвором',
    unit: 'компл',
    price: 8900,
    tags: ['поддон', 'душевой', 'акрил', '90х90']
  },

  // Сифоны и трапы
  {
    id: 'siphon_basin_bottle_viega',
    name: 'Сифон для раковины бутылочный Viega 1 1/4"х32 мм регулируемый пластик',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Viega (Германия)',
    spec: 'Германский полипропилен, съемный отстойник для чистки, регулируемая по высоте погружная труба',
    unit: 'шт',
    price: 680,
    popular: true,
    tags: ['сифон', 'раковина', 'бутылочный', 'viega', 'умывальник']
  },
  {
    id: 'siphon_basin_brass_chrome_design',
    name: 'Сифон дизайнерский для раковины латунный цилиндрический хром 1 1/4"х32 мм',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Lemark / Alcaplast',
    spec: 'Цельная полированная латунь, идеален для открытого монтажа под подвесные раковины и накладные чаши',
    unit: 'шт',
    price: 2450,
    popular: true,
    tags: ['сифон', 'хром', 'латунь', 'дизайнерский', 'открытый монтаж']
  },
  {
    id: 'siphon_bath_semi_auto_alca',
    name: 'Сифон для ванны со сливом-переливом полуавтомат Alcaplast 57 см (тросиковый)',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Alcaplast (Чехия)',
    spec: 'Поворотная хромированная металлическая рукоятка на переливе открывает/закрывает донную пробку тросиком',
    unit: 'компл',
    price: 2600,
    popular: true,
    tags: ['сифон для ванны', 'слив перелив', 'полуавтомат', 'alcaplast', 'ванна']
  },
  {
    id: 'siphon_bath_click_clack_alca',
    name: 'Сифон для ванны со сливом-переливом «клик-клак» (нажимной) Alcaplast',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Alcaplast',
    spec: 'Большая латунная хромированная пробка закрывается простым нажатием ноги/руки',
    unit: 'компл',
    price: 3100,
    tags: ['сифон для ванны', 'клик-клак', 'нажимной']
  },
  {
    id: 'siphon_washing_machine_inwall',
    name: 'Сифон скрытого монтажа для стиральной машины в стену Alcaplast APS3',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Alcaplast (Чехия)',
    spec: 'Встраиваемый в стену с декоративной пластиной из нержавейки, встроенный обратный шариковый клапан против запахов канализации',
    unit: 'шт',
    price: 890,
    popular: true,
    tags: ['сифон скрытый', 'стиральная машина', 'в стену', 'обратный клапан', 'alcaplast']
  },
  {
    id: 'drain_trap_point_dry_mcalpine',
    name: 'Трап душевой точечный 100х100 мм с сухим затвором McAlpine (решетка нержавейка)',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'McAlpine (Шотландия)',
    spec: 'Сухой мембранный клапан не пропускает запахи канализации даже при редком использовании душа, отвод 50 мм',
    unit: 'шт',
    price: 3800,
    popular: true,
    tags: ['трап', 'душевой', 'сухой затвор', 'mcalpine', '100х100', 'душевой поддон']
  },
  {
    id: 'drain_channel_linear_600_alca',
    name: 'Лоток душевой линейный 600 мм Alcaplast с комбинированным затвором SMART',
    category: 'Сантехника и приборы',
    categoryKey: 'fixtures',
    brand: 'Alcaplast (Чехия)',
    spec: 'Низкая монтажная высота 62 мм, перфорированная решетка из матовой нержавеющей стали AISI 304, пропускная способность 30 л/мин',
    unit: 'компл',
    price: 8900,
    popular: true,
    tags: ['лоток душевой', 'линейный трап', '600 мм', 'alcaplast', 'душевая зона']
  },


  // =========================================================================
  // 5. РАСХОДНЫЕ МАТЕРИАЛЫ, ХИМИЯ И КРЕПЕЖ (CONSUMABLES)
  // =========================================================================
  // Герметизирующие материалы (лен, нить, ФУМ, анаэроб, герметики, пена)
  {
    id: 'flax_sanitary_unipak_100g',
    name: 'Сантехнический лён чесаный Unipak 100 г (пакля длинноволокнистая)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'Unipak (Дания)',
    spec: 'Отборный тонковолокнистый французский лен высшего сорта, без костры и примесей, до 160°C',
    unit: 'упак',
    price: 180,
    popular: true,
    tags: ['лен', 'пакля', 'сантехлен', 'unipak', 'герметизация', 'резьба']
  },
  {
    id: 'flax_sanitary_braid_200g',
    name: 'Сантехнический лён длинноволокнистый в косе 200 г',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Классическая длинная коса из натурального льна для профессиональной намотки на резьбу',
    unit: 'шт',
    price: 240,
    tags: ['лен', 'пакля', 'коса', '200г']
  },
  {
    id: 'paste_unipak_tube_65g',
    name: 'Паста уплотнительная для льна Unipak тюбик 65 г',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'Unipak (Дания)',
    spec: 'Невысыхающая герметизирующая паста, защищает резьбу от коррозии, позволяет производить юстировку соединений до 45°',
    unit: 'шт',
    price: 260,
    popular: true,
    tags: ['паста', 'unipak', 'унипак', 'герметик для льна']
  },
  {
    id: 'sealing_thread_tangit_160m',
    name: 'Уплотнительная нить для резьбы Tangit Uni-Lock 160 м (бокс с ножом)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'Tangit Henkel',
    spec: 'Полиамидная силиконизированная нить, мгновенная герметизация резьбы от 1/2" до 4", газ и вода до 130°C',
    unit: 'шт',
    price: 1450,
    popular: true,
    tags: ['нить', 'tangit', 'uni-lock', 'тангит', 'герметизация резьбы']
  },
  {
    id: 'sealing_thread_record_50m',
    name: 'Уплотнительная нить сантехническая «Рекорд» 50 м с дозатором',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'Рекорд (Россия)',
    spec: 'Отечественная термостойкая полимерная нить с пастой, до 16 бар, выдерживает регулировку назад',
    unit: 'шт',
    price: 420,
    popular: true,
    tags: ['нить', 'рекорд', '50м', 'герметизация']
  },
  {
    id: 'fum_tape_valtec_12_01',
    name: 'ФУМ-лента сантехническая Valtec 12 мм х 0.1 мм х 15 м (вода)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'Valtec',
    spec: '100% фторопласт PTFE, химически инертна, для тонкой конической и цилиндрической резьбы',
    unit: 'рулон',
    price: 95,
    popular: true,
    tags: ['фум', 'фум-лента', 'valtec', 'лента фум', 'ptfe']
  },
  {
    id: 'fum_tape_thick_gas_water_19',
    name: 'ФУМ-лента усиленная профессиональная 19 мм х 0.2 мм х 15 м (газ/вода)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Утолщенная фторопластовая лента повышенной плотности для труб диаметром 3/4" и 1"',
    unit: 'рулон',
    price: 160,
    tags: ['фум', 'усиленная', 'газ', 'вода']
  },
  {
    id: 'anaerobic_gel_blue_60g',
    name: 'Анаэробный гель-герметик СантехМастерГель Синий 60 г (стандартная разборка)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'СантехМастер',
    spec: 'Полимеризуется в зазоре резьбы за 15-20 мин, выдерживает давление до 40 бар, разбирается стандартным ключом',
    unit: 'шт',
    price: 490,
    popular: true,
    tags: ['анаэроб', 'сантехмастер', 'синий', 'гель-герметик', 'резьбовой фиксатор']
  },
  {
    id: 'anaerobic_gel_green_60g',
    name: 'Анаэробный гель-герметик СантехМастерГель Зеленый 60 г (легкая разборка)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'СантехМастер',
    spec: 'Для деликатных пластиковых и тонкостенных латунных резьб, легкий демонтаж ручным инструментом',
    unit: 'шт',
    price: 480,
    tags: ['анаэроб', 'зеленый', 'легкая разборка']
  },
  {
    id: 'anaerobic_gel_red_60g',
    name: 'Анаэробный герметик СантехМастерГель Красный 60 г (сверхсильная фиксация)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'СантехМастер',
    spec: 'Неразборная фиксация для вибронагруженных насосов и котловых коллекторов, демонтаж с подогревом',
    unit: 'шт',
    price: 520,
    tags: ['анаэроб', 'красный', 'сверхсильный']
  },
  {
    id: 'silicone_sanitary_transparent_310',
    name: 'Герметик силиконовый санитарный прозрачный 310 мл Ceresit CS 25 (против плесени)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'Ceresit CS 25',
    spec: 'Формула MicroProtect с фунгицидами, защита от черной плесени в углах ванн, душевых и раковин, 100% влагостойкость',
    unit: 'шт',
    price: 590,
    popular: true,
    tags: ['герметик', 'силикон', 'санитарный', 'прозрачный', 'ceresit', 'ванна', 'шов']
  },
  {
    id: 'silicone_sanitary_white_310',
    name: 'Герметик силиконовый санитарный белый 310 мл Ceresit CS 25',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'Ceresit CS 25',
    spec: 'Белоснежный силиконовый герметик для примыкания ванны, поддона и унитаза к кафелю',
    unit: 'шт',
    price: 590,
    popular: true,
    tags: ['герметик', 'белый', 'силикон', 'ceresit']
  },
  {
    id: 'foam_pro_gun_all_season_750',
    name: 'Пена монтажная профессиональная пистолетная всесезонная 750 мл Soudal / Tytan 65',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'Tytan Professional / Soudal',
    spec: 'Выход до 65 литров, первичное расширение без деформации труб, для заделки технологических проходок в перекрытиях',
    unit: 'шт',
    price: 680,
    popular: true,
    tags: ['пена монтажная', 'пистолетная', 'tytan', 'soudal', 'проходки']
  },
  {
    id: 'foam_cleaner_gun_500',
    name: 'Очиститель монтажной пены и пистолетов аэрозоль 500 мл',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Растворитель незатвердевшей полиуретановой пены для промывки монтажного пистолета и очистки кафеля',
    unit: 'шт',
    price: 340,
    tags: ['очиститель пены', 'промывка пистолета']
  },

  // Крепежные элементы
  {
    id: 'pipe_clips_single_20_pack',
    name: 'Клипсы одинарные для труб 20 мм с замком (упаковка 20 шт)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Полипропиленовые клипсы с боковым замком «ласточкин хвост» для сборки параллельных трасс',
    unit: 'упак',
    price: 160,
    popular: true,
    tags: ['клипсы', 'крепёж', 'труба 20', 'держатель']
  },
  {
    id: 'pipe_clips_double_20_pack',
    name: 'Клипсы двойные для параллельных труб 20 мм (упаковка 10 шт)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Двойная монолитная клипса для аккуратной параллельной прокладки ХВС и ГВС',
    unit: 'упак',
    price: 140,
    tags: ['клипсы', 'двойные', 'труба 20']
  },
  {
    id: 'pipe_clamp_rubber_12_pack',
    name: 'Хомут сантехнический металлический 1/2" (20-24 мм) с резиновым уплотнителем и шпилькой М8 (упаковка 5 шт)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Оцинкованная сталь, виброгасящий профиль EPDM, сантехническая комбинированная шпилька М8х80 мм и дюбель в комплекте',
    unit: 'упак',
    price: 240,
    popular: true,
    tags: ['хомут', 'сантехнический', 'шпилька', 'epdm', '1/2', 'крепёж']
  },
  {
    id: 'pipe_clamp_rubber_110_single',
    name: 'Хомут канализационный металлический 110 мм с уплотнителем EPDM и шпилькой М8х100 мм',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Усиленный двухболтовой хомут для жесткой фиксации канализационного стояка к бетонной стене',
    unit: 'шт',
    price: 165,
    popular: true,
    tags: ['хомут', 'канализация', '110', 'стояк', 'крепёж к стене']
  },
  {
    id: 'pipe_clamp_rubber_50_single',
    name: 'Хомут сантехнический 50 мм с резиновой прокладкой и шпилькой М8',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Для крепления канализационной трубы 50 мм к стене',
    unit: 'шт',
    price: 95,
    tags: ['хомут', '50', 'канализация']
  },
  {
    id: 'basin_mounting_kit_m10',
    name: 'Комплект крепежа для умывальника/раковины к стене (шпильки М10х120, дюбели, эксцентриковые шайбы)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Оцинкованные шпильки М10 с резьбой под дюбель 14 мм, капроновые эксцентриковые втулки защищают керамику от сколов',
    unit: 'компл',
    price: 220,
    popular: true,
    tags: ['крепёж раковины', 'шпильки м10', 'умывальник', 'дюбель']
  },
  {
    id: 'toilet_mounting_kit_screws',
    name: 'Комплект крепежа унитаза к полу (винты 6х70 латунные/оцинкованные + колпачки)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Два шурупа с шестигранной головкой, дюбели 10 мм, эластичные шайбы и белые декоративные колпачки',
    unit: 'компл',
    price: 130,
    tags: ['крепёж унитаза', 'винты', 'колпачки']
  },
  {
    id: 'boiler_mounting_anchors_pack',
    name: 'Анкеры усиленные Г-образные 12х100 мм для навески бойлера (комплект 2 шт)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Стальные крюки выдерживают вес наполненного водонагревателя объемом до 150 литров в кирпиче и бетоне',
    unit: 'компл',
    price: 290,
    popular: true,
    tags: ['анкеры', 'бойлер', 'водонагреватель', 'крюки', 'навеска']
  },
  {
    id: 'duct_tape_tpl_reinforced_50m',
    name: 'Скотч армированный водостойкий TPL 50 мм х 50 м серый сантехнический',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    spec: 'Тканевая основа ламинированная полиэтиленом, каучуковый клей, для фиксации стыков изоляции и обмотки труб',
    unit: 'рулон',
    price: 320,
    popular: true,
    tags: ['скотч', 'армированный', 'tpl', 'серый', 'изоляция']
  },
  {
    id: 'glue_contact_insulation_250ml',
    name: 'Клей контактный для стыков трубной изоляции Energoflex 250 мл (с кистью)',
    category: 'Расходники, лён и крепёж',
    categoryKey: 'supplies',
    brand: 'Energoflex',
    spec: 'Сваривает стыки вспененного полиэтилена в монолит, исключая мостики холода и протекание конденсата',
    unit: 'шт',
    price: 390,
    tags: ['клей', 'энергофлекс', 'изоляция']
  },

  // Монтажные инструменты и приспособления
  {
    id: 'tool_ppr_welder_kit_800w',
    name: 'Аппарат для сварки полипропиленовых труб 800 Вт с тефлоновыми насадками 20-32 мм в кейсе',
    category: 'Монтажный инструмент',
    categoryKey: 'tools',
    spec: 'Микропроцессорная регулировка температуры 260°C, парные насадки 20, 25, 32 мм с трехслойным тефлоном, подставка, металлический кейс',
    unit: 'компл',
    price: 3450,
    popular: true,
    tags: ['паяльник', 'ппр', 'сварочный аппарат', 'утюг', 'инструмент']
  },
  {
    id: 'tool_pipe_cutter_ratchet_42',
    name: 'Труборез-ножницы для пластиковых и металлопластиковых труб до 42 мм с храповым механизмом',
    category: 'Монтажный инструмент',
    categoryKey: 'tools',
    spec: 'Лезвие из высокоуглеродистой стали SK5 V-образной формы, ступенчатый храповик режет без замятия трубы',
    unit: 'шт',
    price: 1190,
    popular: true,
    tags: ['труборез', 'ножницы', 'трубы', 'sk5', 'храповик']
  },
  {
    id: 'tool_calibrator_beveler_16_20_26',
    name: 'Калибратор для металлопластиковых труб с фаскоснимателем 16-20-26 мм',
    category: 'Монтажный инструмент',
    categoryKey: 'tools',
    spec: 'Восстанавливает круглую форму среза трубы и снимает внутреннюю фаску перед посадкой фитинга, предотвращая срез резинок',
    unit: 'шт',
    price: 490,
    popular: true,
    tags: ['калибратор', 'фаскосниматель', 'металлопластик', '16-20-26']
  },
  {
    id: 'tool_press_tongs_manual_th',
    name: 'Пресс-клещи ручные радиальные для металлопластика 16-20-26-32 мм (профиль TH)',
    category: 'Монтажный инструмент',
    categoryKey: 'tools',
    spec: 'Телескопические рукоятки с увеличением рычага, сменные матрицы TH16, TH20, TH26, TH32 для надежного обжима пресс-фитингов',
    unit: 'компл',
    price: 9800,
    popular: true,
    tags: ['пресс-клещи', 'металлопластик', 'обжим', 'th']
  },
  {
    id: 'tool_axial_expander_press_kit',
    name: 'Комплект ручного инструмента для аксиальной запрессовки PEX 16-32 мм в кейсе',
    category: 'Монтажный инструмент',
    categoryKey: 'tools',
    brand: 'Stout / Tim',
    spec: 'Расширительный экспандер с головками 16, 20, 25, 32 мм + натяжные механические клещи для надвижки гильз',
    unit: 'компл',
    price: 18900,
    popular: true,
    tags: ['инструмент pex', 'аксиальный', 'экспандер', 'надвижка гильз', 'stout']
  },


  // =========================================================================
  // 6. КОЛЛЕКТОРЫ И РАСПРЕДЕЛИТЕЛЬНЫЕ ГРЕБЕНКИ
  // =========================================================================
  {
    id: 'collector_far_34_3out_shutoff',
    name: 'Коллектор FAR 3/4" на 3 выхода 1/2" ВР регулируемый хромированный DZR',
    category: 'Коллекторы',
    categoryKey: 'collectors',
    brand: 'FAR (Италия)',
    spec: 'Регулировочные вентили с двухсторонними указателями потребителей (душ, ванна, СМА), межосевое 45 мм',
    unit: 'шт',
    price: 4200,
    popular: true,
    tags: ['коллектор', 'гребенка', 'far', '3/4', '3 выхода', 'хром']
  },
  {
    id: 'collector_far_34_4out_shutoff',
    name: 'Коллектор FAR 3/4" на 4 выхода 1/2" ВР регулируемый хромированный',
    category: 'Коллекторы',
    categoryKey: 'collectors',
    brand: 'FAR (Италия)',
    spec: 'Для разводки воды на 4 точки водоразбора, DZR латунь',
    unit: 'шт',
    price: 5400,
    popular: true,
    tags: ['коллектор', 'far', '4 выхода', 'гребенка']
  },
  {
    id: 'collector_floor_stout_4out',
    name: 'Коллекторная группа для теплого пола Stout 1" на 4 выхода с расходомерами',
    category: 'Коллекторы',
    categoryKey: 'collectors',
    brand: 'Stout (Италия)',
    spec: 'Нержавеющая сталь AISI 304, расходомеры 0-5 л/мин на подаче, термостатические клапаны на обратке, воздухоотводчики и сливные краны',
    unit: 'компл',
    price: 13900,
    popular: true,
    tags: ['коллектор теплого пола', 'stout', 'расходомеры', 'нержавейка', '4 контура']
  },
  {
    id: 'collector_cabinet_built_in_1',
    name: 'Шкаф коллекторный встроенный ШРВ-1 (670х594х120 мм)',
    category: 'Коллекторы',
    categoryKey: 'collectors',
    spec: 'Оцинкованная сталь, порошковая покраска белая RAL 9016, замок с ключом, для скрытого монтажа в стенную нишу',
    unit: 'шт',
    price: 3600,
    tags: ['шкаф коллекторный', 'шрв', 'встраиваемый', 'ниша']
  },


  // =========================================================================
  // 7. СИСТЕМЫ ЗАЩИТЫ ОТ ПРОТЕЧЕК И МАГИСТРАЛЬНАЯ ФИЛЬТРАЦИЯ
  // =========================================================================
  {
    id: 'leak_neptun_base_12_kit',
    name: 'Система защиты от протечек Нептун Base 1/2" с двумя кранами с электроприводом',
    category: 'Фильтры и защита',
    categoryKey: 'leak_filters',
    brand: 'Нептун (Neptun)',
    spec: 'Контроллер Neptun Base + 2 крана Bugatti с электроприводом 220В 1/2" + 3 проводных датчика SW005, автоперекрытие за 15 сек',
    unit: 'компл',
    price: 22800,
    popular: true,
    tags: ['нептун', 'защита от протечек', 'электропривод', 'датчик протечки', 'bugatti']
  },
  {
    id: 'filter_housing_bb10_brass',
    name: 'Магистральный фильтр-колба Big Blue 10" с латунной резьбой 1" Гейзер / Аквафор',
    category: 'Фильтры и защита',
    categoryKey: 'leak_filters',
    brand: 'Гейзер / Аквафор',
    spec: 'Усиленный корпус из армированного полипропилена, кнопка сброса давления, ключ и кронштейн в комплекте, стандарт BB 10"',
    unit: 'компл',
    price: 3450,
    popular: true,
    tags: ['колба', 'big blue', 'bb10', 'магистральный фильтр', 'гейзер']
  },
  {
    id: 'cartridge_bb10_sediment_5m',
    name: 'Картридж полипропиленовый механической очистки Big Blue 10" 5 мкм',
    category: 'Фильтры и защита',
    categoryKey: 'leak_filters',
    spec: 'Вспененный пористый полипропилен, задерживает ржавчину, ил и песок, ресурс до 50 000 л',
    unit: 'шт',
    price: 520,
    tags: ['картридж', 'bb10', '5 мкм', 'полипропилен']
  },


  // =========================================================================
  // 8. ЗАПЧАСТИ ВОДОНАГРЕВАТЕЛЕЙ И КОТЛОВ
  // =========================================================================
  {
    id: 'ten_boiler_thermex_copper_1500w',
    name: 'ТЭН для водонагревателя Thermex медный 1500 Вт прижимной фланец D=64 мм',
    category: 'Запчасти и котлы',
    categoryKey: 'boiler_parts',
    brand: 'Thermex / Thermowatt (Италия)',
    spec: 'Медная трубка 1.5 кВт, гнездо под термостат, шпилька М6 под магниевый анод, фланец 64 мм',
    unit: 'шт',
    price: 1450,
    popular: true,
    tags: ['тэн', 'водонагреватель', 'thermex', 'термекс', '1500 вт', 'медь']
  },
  {
    id: 'anode_magnesium_m6_200',
    name: 'Анод магниевый М6х20х200 мм для бойлера (защита бака от коррозии)',
    category: 'Запчасти и котлы',
    categoryKey: 'boiler_parts',
    spec: 'Магниевый сплав жертвенного анода, предотвращает электрохимическую коррозию стального бака',
    unit: 'шт',
    price: 490,
    popular: true,
    tags: ['анод', 'магниевый', 'бойлер', 'м6', 'защита бака']
  },


  // =========================================================================
  // 9. РЕМОНТ САНТЕХНИКИ И БЫТОВОЙ ТЕХНИКИ
  // =========================================================================
  {
    id: 'cartridge_ceramic_35mm_sedal',
    name: 'Картридж керамический для смесителя 35 мм Sedal (Испания) с ножками',
    category: 'Ремонт сантехники',
    categoryKey: 'appliance_repair',
    brand: 'Sedal (Испания)',
    spec: 'Керамические полированные пластины из оксида алюминия, стандартный диаметр 35 мм для большинства однорычажных смесителей',
    unit: 'шт',
    price: 450,
    popular: true,
    tags: ['картридж', 'смеситель', '35 мм', 'sedal', 'ремонт крана']
  },
  {
    id: 'cartridge_ceramic_40mm_sedal',
    name: 'Картридж керамический для смесителя 40 мм Sedal',
    category: 'Ремонт сантехники',
    categoryKey: 'appliance_repair',
    brand: 'Sedal',
    spec: 'Диаметр 40 мм повышенной пропускной способности',
    unit: 'шт',
    price: 480,
    tags: ['картридж', 'смеситель', '40 мм']
  },
  {
    id: 'toilet_fill_valve_alca_12',
    name: 'Клапан впускной для бачка унитаза Alcaplast нижняя подводка 1/2" латунный штуцер',
    category: 'Ремонт сантехники',
    categoryKey: 'appliance_repair',
    brand: 'Alcaplast (Чехия)',
    spec: 'Гидродинамическое тихое закрытие, латунная резьба 1/2", регулировка уровня воды поплавком',
    unit: 'шт',
    price: 780,
    popular: true,
    tags: ['впускной клапан', 'бачок унитаза', 'alcaplast', 'поплавок', '1/2 латунь']
  },
  {
    id: 'toilet_flush_valve_dual_alca',
    name: 'Сливной механизм для бачка унитаза двухкнопочный Alcaplast 3/6 л',
    category: 'Ремонт сантехники',
    categoryKey: 'appliance_repair',
    brand: 'Alcaplast (Чехия)',
    spec: 'Двойная регулировка объема слива, силиконовое донное кольцо не дубеет от жесткой воды',
    unit: 'компл',
    price: 990,
    popular: true,
    tags: ['сливная арматура', 'бачок унитаза', 'кнопка', 'двойной слив']
  },
  {
    id: 'hose_inlet_aquastop_sma_2m',
    name: 'Заливной шланг для стиральной машины с системой Аквастоп (Aquastop) 2.0 м',
    category: 'Ремонт сантехники',
    categoryKey: 'appliance_repair',
    spec: 'Двойная защитная оболочка с электромагнитным/механическим клапаном перекрытия при протечке внутреннего шланга, давление до 60 бар',
    unit: 'шт',
    price: 1390,
    popular: true,
    tags: ['шланг', 'аквастоп', 'стиральная машина', 'aquastop', 'заливной']
  },


  // =========================================================================
  // 10. НАСОСЫ И РАСШИРИТЕЛЬНЫЕ БАКИ
  // =========================================================================
  {
    id: 'pump_circulation_grundfos_ups_25_60',
    name: 'Насос циркуляционный Grundfos UPS 25-60 180 мм (чугунный корпус, 3 скорости)',
    category: 'Насосы и баки',
    categoryKey: 'pumps_tanks',
    brand: 'Grundfos (Дания)',
    spec: 'Монтажная длина 180 мм, резьба 1 1/2", керамический вал и радиальные подшипники, напор до 6 м',
    unit: 'шт',
    price: 8900,
    popular: true,
    tags: ['насос', 'grundfos', 'циркуляционный', 'отопление', 'ups 25-60']
  },
  {
    id: 'expansion_tank_heating_stout_18l',
    name: 'Бак расширительный мембранный для отопления Stout 18 л (красный)',
    category: 'Насосы и баки',
    categoryKey: 'pumps_tanks',
    brand: 'Stout',
    spec: 'Сменная мембрана из EPDM, рабочее давление до 5 бар, компенсирует температурное расширение теплоносителя',
    unit: 'шт',
    price: 2950,
    popular: true,
    tags: ['расширительный бак', 'stout', '18 л', 'отопление', 'мембрана']
  },
  {
    id: 'expansion_tank_sanitary_reflex_12l',
    name: 'Гидроаккумулятор для горячего водоснабжения и бойлера Reflex Refix DE 12 л (синий)',
    category: 'Насосы и баки',
    categoryKey: 'pumps_tanks',
    brand: 'Reflex (Германия)',
    spec: 'Пищевая бутиловая мембрана, рабочее давление до 10 бар, компенсирует тепловое расширение бойлера',
    unit: 'шт',
    price: 4600,
    tags: ['гидроаккумулятор', 'reflex', '12 л', 'бойлер', 'гвс']
  }
];

function convertSystemItemToQuickCatalog(item: SystemFittingItem): QuickCatalogItem {
  let catKey: CatalogCategoryKey = 'fittings';
  let catTitle = 'Фитинги и соединения';

  const nameLow = (item.name || '').toLowerCase();
  const catLow = (item.category || '').toLowerCase();

  if (catLow === 'pipes' || nameLow.includes('труба') || nameLow.includes('изоляц') || nameLow.includes('утеплител')) {
    catKey = 'pipes_insulation';
    catTitle = 'Трубы и изоляция';
  } else if (catLow === 'valves' || nameLow.includes('кран') || nameLow.includes('клапан') || nameLow.includes('редуктор') || nameLow.includes('вентиль') || nameLow.includes('манометр')) {
    catKey = 'valves_taps';
    catTitle = 'Краны и арматура';
  } else if (catLow === 'collectors' || nameLow.includes('коллектор') || nameLow.includes('шкаф') || nameLow.includes('смесительный узел') || nameLow.includes('гребенк') || nameLow.includes('разделитель')) {
    catKey = 'collectors';
    catTitle = 'Коллекторы и узлы';
  } else if (item.isTool || catLow === 'tools' || nameLow.includes('паяльник') || nameLow.includes('ножниц') || nameLow.includes('ключ') || nameLow.includes('калибратор') || nameLow.includes('клещи') || nameLow.includes('опрессовщик') || nameLow.includes('резак')) {
    catKey = 'tools';
    catTitle = 'Монтажный инструмент';
  } else if (nameLow.includes('лен') || nameLow.includes('герметик') || nameLow.includes('паста') || nameLow.includes('хомут') || nameLow.includes('клипс') || nameLow.includes('скоб') || nameLow.includes('перфолент') || nameLow.includes('нить') || nameLow.includes('фум') || nameLow.includes('дюбель') || nameLow.includes('шпильк')) {
    catKey = 'supplies';
    catTitle = 'Расходники, лён и крепёж';
  } else if (nameLow.includes('фильтр') || nameLow.includes('грязевик') || nameLow.includes('протечк') || nameLow.includes('нептун') || nameLow.includes('аквасторож')) {
    catKey = 'leak_filters';
    catTitle = 'Фильтры и защита';
  } else if (nameLow.includes('инсталляц') || nameLow.includes('унитаз') || nameLow.includes('смесител') || nameLow.includes('трап') || nameLow.includes('сифон') || nameLow.includes('подводк') || nameLow.includes('ванн') || nameLow.includes('раковин') || nameLow.includes('лейк') || nameLow.includes('душ')) {
    catKey = 'fixtures';
    catTitle = 'Сантехника и приборы';
  } else if (nameLow.includes('насос') || nameLow.includes('гидроаккумулятор') || nameLow.includes('бак')) {
    catKey = 'pumps_tanks';
    catTitle = 'Насосы и баки';
  }

  const unitMapped: 'м' | 'шт' | 'компл' | 'упак' | 'рулон' =
    item.unit === 'м' ? 'м' : item.unit === 'компл' ? 'компл' : item.unit === 'упак' ? 'упак' : item.unit === 'рулон' ? 'рулон' : 'шт';

  return {
    id: `inst_${item.id}`,
    name: item.name,
    category: catTitle,
    categoryKey: catKey,
    brand: item.materialCode ? item.materialCode.toUpperCase() : undefined,
    spec: item.description,
    unit: unitMapped,
    price: item.pricePerUnit || 120,
    popular: item.isEssential,
    tags: [
      item.materialCode?.toLowerCase() || '',
      item.category || '',
      ...item.name.toLowerCase().split(/\s+/).slice(0, 4)
    ].filter(Boolean)
  };
}

const convertedInstallationItems: QuickCatalogItem[] = [];

if (typeof MATERIAL_SPECIFIC_ITEMS === 'object' && MATERIAL_SPECIFIC_ITEMS !== null) {
  Object.values(MATERIAL_SPECIFIC_ITEMS).forEach((itemsList) => {
    if (Array.isArray(itemsList)) {
      itemsList.forEach((it) => {
        convertedInstallationItems.push(convertSystemItemToQuickCatalog(it));
      });
    }
  });
}

if (typeof BUILDING_EQUIPMENT_ITEMS === 'object' && BUILDING_EQUIPMENT_ITEMS !== null) {
  Object.values(BUILDING_EQUIPMENT_ITEMS).forEach((itemsList) => {
    if (Array.isArray(itemsList)) {
      itemsList.forEach((it) => {
        convertedInstallationItems.push(convertSystemItemToQuickCatalog(it));
      });
    }
  });
}

// Assemble full master catalog without duplicate IDs
const seenIds = new Set<string>();
const masterList: QuickCatalogItem[] = [];

function addUniqueItems(items: QuickCatalogItem[]) {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    if (item && item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      masterList.push(item);
    }
  }
}

// Merge in priority order: specialized all-plumbing library first, then base, extended, and converted
addUniqueItems(ALL_PLUMBING_CATALOG_ITEMS);
addUniqueItems(BASE_QUICK_CATALOG_ITEMS);
addUniqueItems(EXTENDED_QUICK_CATALOG_ITEMS);
addUniqueItems(convertedInstallationItems);

export const QUICK_CATALOG_ITEMS: QuickCatalogItem[] = masterList;
