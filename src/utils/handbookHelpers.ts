import { Article } from '../types';

/**
 * Maps any plumbing guide / instruction to an authentic, high-quality
 * illustrative photograph corresponding directly to its sanitary/engineering topic.
 */
export const getInstructionImage = (art: { id?: string; title: string; category?: string; coverImage?: string }): string => {
  // 1. If an explicit, updated, or custom coverImage is present:
  if (art && art.coverImage && typeof art.coverImage === 'string') {
    const trimmed = art.coverImage.trim();
    if (trimmed.length > 0) {
      // Prioritize uploaded data URLs (base64 image uploads), local uploads (/uploads/...), blob URLs, or relative paths
      if (
        trimmed.startsWith('data:') ||
        trimmed.startsWith('/uploads/') ||
        trimmed.startsWith('blob:') ||
        trimmed.startsWith('/')
      ) {
        return trimmed;
      }

      // Prioritize any custom web URL that is not the generic unedited template placeholder photo-1584622650111-993a426fbf0a
      if (
        (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
        !trimmed.includes('photo-1584622650111-993a426fbf0a')
      ) {
        return trimmed;
      }
    }
  }

  const text = (((art?.id || '') + ' ' + (art?.title || '') + ' ' + (art?.category || ''))).toLowerCase();

  // 1. Пайка полипропиленовых труб (ППР) - сварочный аппарат, насадки, диффузия
  if (text.includes('ppr') || text.includes('полипропилен') || text.includes('пайка ппр') || text.includes('диффузион')) {
    return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80';
  }

  // 2. Сшитый полиэтилен PEX-a (Rehau, Stout, аксиальная запрессовка)
  if (text.includes('pex') || text.includes('сшит') || text.includes('гильз') || text.includes('rehau') || text.includes('stout')) {
    return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80';
  }

  // 3. Коллекторная (лучевая) разводка водоснабжения - гребенка, распределитель
  if (text.includes('коллектор') || text.includes('лучев') || text.includes('шкаф') || text.includes('гребенк')) {
    return 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80';
  }

  // 4. Пайка медных труб капиллярным способом
  if (text.includes('медн') || text.includes('copper') || text.includes('припоем')) {
    return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80';
  }

  // 5. Трубы ПНД компрессионные
  if (text.includes('пнд') || text.includes('компрессион')) {
    return 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80';
  }

  // 6. Керамический картридж смесителя
  if (text.includes('картридж')) {
    return 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80';
  }

  // 7. Смесители (кухонный, для раковины, настенный в ванной)
  if (text.includes('кухонн') || text.includes('смесител') || text.includes('кран') || text.includes('мойк')) {
    return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80';
  }

  // 8. Термостатический смеситель для душа
  if (text.includes('термостат') || text.includes('38°c') || text.includes('душа')) {
    return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80';
  }

  // 9. Напольный унитаз и сливной бачок
  if (text.includes('напольн') || text.includes('арматур') || text.includes('бачк') || (text.includes('унитаз') && !text.includes('инсталляц'))) {
    return 'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?auto=format&fit=crop&w=600&q=80';
  }

  // 10. Монтаж силовой инсталляции подвесного унитаза
  if (text.includes('инсталляц') || text.includes('подвесн') || text.includes('geberit') || text.includes('grohe')) {
    return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80';
  }

  // 11. Счётчики воды (водомеры ХВС и ГВС)
  if (text.includes('счётчик') || text.includes('счетчик') || text.includes('водомер')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
  }

  // 12. Герметизация резьбовых соединений (лен, паста, фум, нить, гель)
  if (text.includes('герметизац') || text.includes('лен') || text.includes('фу-лент') || text.includes('резьб') || text.includes('unipak')) {
    return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80';
  }

  // 13. Подключение стиральной и посудомоечной машины
  if (text.includes('стиральн') || text.includes('посудомоечн')) {
    return 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80';
  }

  // 14. Водонагреватель (накопительный бойлер)
  if (text.includes('водонагреват') || text.includes('бойлер')) {
    return 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80';
  }

  // 15. Радиаторы и батареи отопления, байпас, кран Маевского
  if (text.includes('радиатор') || text.includes('батаре') || text.includes('отоплен') || text.includes('маевск')) {
    return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80';
  }

  // 16. Уклон канализационных труб (110, 50, 40 мм)
  if (text.includes('уклон') || text.includes('канализац') || text.includes('фанов')) {
    return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80';
  }

  // 17. Прочистка засоров, сантехнический трос, вантуз
  if (text.includes('засор') || text.includes('трос') || text.includes('прочистк')) {
    return 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80';
  }

  // 18. Сборка и прочистка сифона (бутылочный, гофрированный)
  if (text.includes('сифон')) {
    return 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80';
  }

  // Default fallback to existing coverImage or generic reliable plumbing image
  if (art && art.coverImage && typeof art.coverImage === 'string' && art.coverImage.trim().length > 0) {
    return art.coverImage.trim();
  }
  return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80';
};

/**
 * Curated map of image headers / titles for all 133 handbook sections.
 * Generated specifically based on corresponding text titles.
 */
export const HANDBOOK_IMAGE_TITLES: Record<string, string> = {
  // 1-17: Core flagship engineering topics
  'top-1-ppr-soldering': 'Пайка труб ППР 20-32 мм',
  'top-2-pex-press': 'Монтаж сшитого полиэтилена PEX-a',
  'top-3-collector-wiring': 'Коллекторная разводка водопровода',
  'top-4-copper-soldering': 'Капиллярная пайка медных труб',
  'top-5-pnd-compression': 'Монтаж труб ПНД компрессионными фитингами',
  'top-6-mixer-kitchen-replace': 'Замена смесителя на мойке',
  'top-7-cartridge-replace': 'Замена картриджа смесителя 35/40 мм',
  'top-8-toilet-installation': 'Монтаж напольного унитаза и гофры',
  'top-9-installation-frame': 'Монтаж силовой рамы инсталляции',
  'top-10-thermostat-shower': 'Термостатический смеситель для душа',
  'top-11-water-meter-replace': 'Установка счётчиков ХВС и ГВС',
  'top-12-thread-sealing-methods': 'Герметизация резьбовых соединений',
  'top-13-washing-machine-connect': 'Подключение стиральной и посудомоечной машин',
  'top-14-boiler-installation': 'Обвязка накопительного бойлера',
  'top-15-radiator-replace': 'Замена радиатора отопления с байпасом',
  'top-16-sewer-pipe-slope': 'Уклон канализационных труб 110/50 мм',
  'top-17-clog-removal-cable': 'Прочистка канализации сантехническим тросом',

  // 18-37: Water distribution & pipes (20 items)
  'top-101-water': 'Сдвижные гильзы PEX-a на коллекторе ГВС',
  'top-102-water': 'Компенсатор гидроударов пружинного типа',
  'top-103-water': 'Байпас на главном стояке ХВС',
  'top-104-water': 'Безрезьбовая муфта Gebo на стояке',
  'top-105-water': 'Теплоизоляция труб каучуком K-Flex',
  'top-106-water': 'Греющий кабель на вводе трубы ХВС',
  'top-107-water': 'Обвязка насосной станции и гидроаккумулятора',
  'top-108-water': 'Разводка труб PEX-b с пуш-фитингами',
  'top-109-water': 'Торцевание и сварка труб ППР',
  'top-110-water': 'Опрессовка водопровода насосом 16 бар',
  'top-111-water': 'Изгиб металлопластиковых труб пружиной',
  'top-112-water': 'Шаровой кран с американкой Bugatti 3/4"',
  'top-113-water': 'Мембранный расширительный бак ГВС',
  'top-114-water': 'Промывка и дезинфекция водопровода',
  'top-115-water': 'Сливной кран для зимней консервации',
  'top-116-water': 'Нарезка резьбы клуппом на стальной трубе',
  'top-117-water': 'Разметка и штробление стен под трубы',
  'top-118-water': 'Переход со стали на сшитый полиэтилен',
  'top-119-water': 'Манометры с выносными датчиками давления',
  'top-120-water': 'Монтаж водорозеток под гигиенический душ',

  // 38-57: Sanitary fixtures & mixers (20 items)
  'top-121-fixtures': 'Смеситель скрытого монтажа iBox',
  'top-122-fixtures': 'Гигиенический душ с термостатом',
  'top-123-fixtures': 'Замена керамических кран-букс',
  'top-124-fixtures': 'Очистка аэратора смесителя от солей',
  'top-125-fixtures': 'Сильфонная подводка из нержавейки',
  'top-126-fixtures': 'Сенсорный бесконтактный смеситель',
  'top-127-fixtures': 'Сливная арматура бачка унитаза',
  'top-128-fixtures': 'Прокладка между бачком и чашей унитаза',
  'top-129-fixtures': 'Жесткий фановый отвод унитаза',
  'top-130-fixtures': 'Сиденье унитаза с микролифтом Soft-Close',
  'top-131-fixtures': 'Раковина над стиральной машиной с сифоном',
  'top-132-fixtures': 'Накладная раковина-чаша на столешнице',
  'top-133-fixtures': 'Бутылочный сифон с клапаном Click-Clack',
  'top-134-fixtures': 'Монтаж акриловой ванны на каркасе',
  'top-135-fixtures': 'Установка чугунной ванны по уровню',
  'top-136-fixtures': 'Сборка душевого уголка со стеклом',
  'top-137-fixtures': 'Душевой трап с сухим затвором',
  'top-138-fixtures': 'Врезной смеситель на борт ванны',
  'top-139-fixtures': 'Герметизация примыкания ванны к стене',
  'top-140-fixtures': 'Душевой шланг Anti-Twist и лейка',

  // 58-77: Valves, emergency & filters (20 items)
  'top-141-emergency': 'Замена шарового крана на стояке под давлением',
  'top-142-emergency': 'Комбинированный фильтр-редуктор КФРД',
  'top-143-emergency': 'Самопромывной фильтр 100 мкм с манометром',
  'top-144-emergency': 'Магистральный фильтр Big Blue BB20',
  'top-145-emergency': 'Пружинный обратный клапан с латунным седлом',
  'top-146-emergency': 'Система защиты от протечек Neptun',
  'top-147-emergency': 'Герметизация резьб анаэробным гелем',
  'top-148-emergency': 'Намотка уплотнительной нити Tangit Unilok',
  'top-149-emergency': 'ФУМ-лента на пластиковых резьбах',
  'top-150-emergency': 'Разблокировка закисшего шарового крана',
  'top-151-emergency': 'Ремонтный хомут Gebo на пробитой трубе',
  'top-152-emergency': 'Заделка свища на стояке холодной сваркой',
  'top-153-emergency': 'Врезка в трубу хомутом-вампиром',
  'top-154-emergency': 'Замена уплотнения накидной гайки-американки',
  'top-155-emergency': 'Угловой кран для стиральной машины',
  'top-156-emergency': 'Регулировка редуктора давления Honeywell / FAR',
  'top-157-emergency': 'Замена прокладки в гайке водомера',
  'top-158-emergency': 'Устранение шума в шаровом кране',
  'top-159-emergency': 'Электромагнитный клапан перекрытия воды',
  'top-160-emergency': 'Замена цанги в фитинге металлопластика',

  // 78-96: Domestic appliances & boilers (19 items)
  'top-161-appliances': 'Петля антисифона для посудомоечной машины',
  'top-162-appliances': 'Проточный водонагреватель 7 кВт',
  'top-163-appliances': 'Подключение газовой колонки к воде и вытяжке',
  'top-164-appliances': 'Трехступенчатый фильтр воды под мойку',
  'top-165-appliances': 'Система обратного осмоса с баком 8 л',
  'top-166-appliances': 'Измельчитель отходов InSinkErator',
  'top-167-appliances': 'Обвязка настенного газового котла',
  'top-168-appliances': 'Подключение ледогенератора холодильника к воде',
  'top-169-appliances': 'Полифосфатный солевой фильтр-умягчитель',
  'top-170-appliances': 'Дренажная помпа кондиционера в канализацию',
  'top-171-appliances': 'Защитный клапан AquaStop на шланге',
  'top-172-appliances': 'Замена магниевого анода в бойлере',
  'top-173-appliances': 'Сбросной предохранительный клапан 6 бар',
  'top-174-appliances': 'Бойлер косвенного нагрева с рециркуляцией',
  'top-175-appliances': 'Канализационная насосная станция Sololift',
  'top-176-appliances': 'Слив сушильной машины в канализацию',
  'top-177-appliances': 'Группа безопасности водонагревателя Watts',
  'top-178-appliances': 'Очистка ТЭНа водонагревателя от накипи',
  'top-179-appliances': 'Расширительный бак для бойлера ГВС',

  // 97-115: Heating & radiators (19 items)
  'top-180-heating': 'Термостатическая головка Danfoss на радиаторе',
  'top-181-heating': 'Спуск воздуха краном Маевского на батарее',
  'top-182-heating': 'Балансировочный клапан радиаторной сети',
  'top-183-heating': 'Смесительный узел и коллектор теплого пола',
  'top-184-heating': 'Раскладка труб теплого пола «улиткой»',
  'top-185-heating': 'Наращивание секций радиатора ниппелями',
  'top-186-heating': 'Водяной полотенцесушитель с байпасом',
  'top-187-heating': 'Электрический полотенцесушитель со скрытым монтажом',
  'top-188-heating': 'Внутрипольный конвектор с вентилятором',
  'top-189-heating': 'Закачка теплоносителя-антифриза в систему',
  'top-190-heating': 'Химическая промывка радиаторов от шлама',
  'top-191-heating': 'Автоматический воздухоотводчик на коллекторе',
  'top-192-heating': 'Гидравлический разделитель (гидрострелка)',
  'top-193-heating': 'Автоматический клапан подпитки отопления',
  'top-194-heating': 'Устранение гидроударов в стояках отопления',
  'top-195-heating': 'Нижнее подключение радиатора через Мультифлекс',
  'top-196-heating': 'Теплоизоляция труб отопления трубками Тилит',
  'top-197-heating': 'Межсекционные прокладки радиатора отопления',
  'top-198-heating': 'Погодозависимый датчик температуры котла',

  // 116-120: Drainage & sewer (5 items)
  'top-199-drainage': 'Замена чугунного стояка на пластик PP 110',
  'top-200-drainage': 'Вакуумный аэратор (фановый клапан 110/50)',
  'top-201-drainage': 'Обратный клапан канализации 110 мм',
  'top-202-drainage': 'Жироуловитель под кухонную мойку',
  'top-203-drainage': 'Водяной гидрозатвор и защита от запахов',

  // 121-125: Specialized tools (5 items)
  'top-204-tools': 'Сантехнические клещи Knipex Cobra и трубный ключ',
  'top-205-tools': 'Пресс-клещи для металлопластиковых фитингов',
  'top-206-tools': 'Фаскосниматель и калибратор для труб',
  'top-207-tools': 'Лазерный нивелир при трассировке труб',
  'top-208-tools': 'Тепловизор для поиска скрытых утечек и контуров',

  // 126-133: Emergency maintenance & exterior (8 items)
  'top-209-emergency': 'Манжета раструба чугун-пластик 110 мм',
  'top-210-emergency': 'Ремонт пробитой трубы PEX надвижными гильзами',
  'top-211-emergency': 'Очистка внутренних стенок труб от отложений',
  'top-212-emergency': 'Гидроизоляционная лента и мастика в санузле',
  'top-213-emergency': 'Потайной ревизионный люк под плитку',
  'top-214-emergency': 'Слив и консервация дачного водопровода на зиму',
  'top-215-emergency': 'Дренажный погружной насос с поплавком',
  'top-216-emergency': 'Локальный септик и дренажный колодец'
};

/**
 * Generates a concise, high-visibility image header/title based on article text title.
 * Used for all 133 handbook sections and any custom articles.
 */
export const generateImageTitleFromTextTitle = (title: string, id?: string): string => {
  if (id && HANDBOOK_IMAGE_TITLES[id]) {
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
