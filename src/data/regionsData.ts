// Central Asian and Russian Regions & Cities Configuration
// Multi-country support for Russia, Tajikistan, Kazakhstan, Uzbekistan, Kyrgyzstan

export interface CountryInfo {
  code: 'RU' | 'TJ' | 'KZ' | 'UZ' | 'KG';
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  phoneCode: string;
  defaultCity: string;
  popularCities: string[];
}

export const COUNTRIES: CountryInfo[] = [
  {
    code: 'RU',
    name: 'Россия',
    flag: '🇷🇺',
    currency: 'руб.',
    currencySymbol: '₽',
    phoneCode: '+7',
    defaultCity: 'Москва',
    popularCities: [
      'Москва',
      'Санкт-Петербург',
      'Владивосток',
      'Хабаровск',
      'Екатеринбург',
      'Новосибирск',
      'Казань',
      'Краснодар',
      'Самара',
      'Нижний Новгород',
    ],
  },
  {
    code: 'KZ',
    name: 'Казахстан',
    flag: '🇰🇿',
    currency: 'тенге',
    currencySymbol: '₸',
    phoneCode: '+7',
    defaultCity: 'Алматы',
    popularCities: [
      'Алматы',
      'Астана',
      'Шымкент',
      'Караганда',
      'Актобе',
      'Тараз',
      'Павлодар',
      'Усть-Каменогорск',
      'Семей',
      'Атырау',
    ],
  },
  {
    code: 'TJ',
    name: 'Таджикистан',
    flag: '🇹🇯',
    currency: 'сомони',
    currencySymbol: 'с.',
    phoneCode: '+992',
    defaultCity: 'Душанбе',
    popularCities: [
      'Душанбе',
      'Худжанд',
      'Бохтар',
      'Куляб',
      'Истаравшан',
      'Турсунзаде',
      'Исфара',
      'Канибадам',
      'Пенджикент',
      'Хорог',
    ],
  },
  {
    code: 'UZ',
    name: 'Узбекистан',
    flag: '🇺🇿',
    currency: 'сум',
    currencySymbol: 'сум',
    phoneCode: '+998',
    defaultCity: 'Ташкент',
    popularCities: [
      'Ташкент',
      'Самарканд',
      'Бухара',
      'Андижан',
      'Наманган',
      'Фергана',
      'Нукус',
      'Карши',
      'Коканд',
      'Маргилан',
    ],
  },
  {
    code: 'KG',
    name: 'Кыргызстан',
    flag: '🇰🇬',
    currency: 'сом',
    currencySymbol: 'сом',
    phoneCode: '+996',
    defaultCity: 'Бишкек',
    popularCities: [
      'Бишкек',
      'Ош',
      'Джалал-Абад',
      'Каракол',
      'Токмок',
      'Узген',
      'Балыкчы',
      'Нарын',
      'Талас',
      'Баткен',
    ],
  },
];

export const TAJIKISTAN_CITIES: string[] = [
  'Душанбе',
  'Худжанд',
  'Бохтар',
  'Куляб',
  'Истаравшан',
  'Турсунзаде',
  'Исфара',
  'Канибадам',
  'Пенджикент',
  'Хорог',
  'Вахдат',
  'Гиссар',
  'Нурек',
  'Левакант',
  'Бустон',
  'Гулистон',
  'Спитамен',
  'Шахринав',
  'Зафарабад',
  'Яван',
  'Фархор',
  'Восе',
  'Мастчох',
  'Рашт',
  'Айни',
  'Дангара',
];

export const KAZAKHSTAN_CITIES: string[] = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Актобе',
  'Караганда',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Атырау',
  'Костанай',
  'Кызылорда',
  'Уральск',
  'Петропавловск',
  'Актау',
  'Темиртау',
  'Туркестан',
  'Кокшетау',
  'Талдыкорган',
  'Экибастуз',
  'Рудный',
  'Жанаозен',
  'Жезказган',
  'Балхаш',
  'Кентау',
  'Каскелен',
  'Сатпаев',
  'Кулсары',
];

export const UZBEKISTAN_CITIES: string[] = [
  'Ташкент',
  'Самарканд',
  'Бухара',
  'Андижан',
  'Наманган',
  'Фергана',
  'Нукус',
  'Карши',
  'Коканд',
  'Маргилан',
  'Термез',
  'Джизак',
  'Навои',
  'Ургенч',
  'Чирчик',
  'Алмалык',
  'Ангрен',
  'Бекабад',
  'Шахрисабз',
  'Денау',
  'Гулистан',
  'Хива',
  'Асака',
  'Зарафшан',
  'Каган',
  'Чорток',
  'Янгиюль',
];

export const KYRGYZSTAN_CITIES: string[] = [
  'Бишкек',
  'Ош',
  'Джалал-Абад',
  'Каракол',
  'Токмок',
  'Узген',
  'Балыкчы',
  'Нарын',
  'Талас',
  'Баткен',
  'Кант',
  'Кара-Балта',
  'Кызыл-Кия',
  'Сулюкта',
  'Майлуу-Суу',
  'Кербен',
  'Таш-Кумыр',
  'Чолпон-Ата',
  'Исфана',
  'Кочкор-Ата',
  'Ноокат',
  'Кадамжай',
  'Кара-Суу',
];

// Map of country code to its cities
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  KZ: KAZAKHSTAN_CITIES,
  TJ: TAJIKISTAN_CITIES,
  UZ: UZBEKISTAN_CITIES,
  KG: KYRGYZSTAN_CITIES,
  RU: [], // Populated dynamically or imported from RUSSIAN_CITIES
};

/**
 * Determine which country a city belongs to
 */
export function getCountryByCity(city: string): CountryInfo {
  const clean = city?.trim().toLowerCase();
  if (!clean) return COUNTRIES[0]; // RU default

  if (TAJIKISTAN_CITIES.some((c) => c.toLowerCase() === clean)) {
    return COUNTRIES.find((co) => co.code === 'TJ') || COUNTRIES[0];
  }
  if (KAZAKHSTAN_CITIES.some((c) => c.toLowerCase() === clean)) {
    return COUNTRIES.find((co) => co.code === 'KZ') || COUNTRIES[0];
  }
  if (UZBEKISTAN_CITIES.some((c) => c.toLowerCase() === clean)) {
    return COUNTRIES.find((co) => co.code === 'UZ') || COUNTRIES[0];
  }
  if (KYRGYZSTAN_CITIES.some((c) => c.toLowerCase() === clean)) {
    return COUNTRIES.find((co) => co.code === 'KG') || COUNTRIES[0];
  }
  // Otherwise Russia
  return COUNTRIES.find((co) => co.code === 'RU') || COUNTRIES[0];
}

/**
 * Get country object by ISO code
 */
export function getCountryByCode(code: string): CountryInfo {
  const upper = (code || '').toUpperCase();
  return COUNTRIES.find((co) => co.code === upper) || COUNTRIES[0];
}

/**
 * Get all cities for a given country code (including 'RU')
 */
export function getCitiesByCountry(countryCode: string, russianCities: string[] = []): string[] {
  const upper = (countryCode || '').toUpperCase();
  if (upper === 'TJ') return TAJIKISTAN_CITIES;
  if (upper === 'KZ') return KAZAKHSTAN_CITIES;
  if (upper === 'UZ') return UZBEKISTAN_CITIES;
  if (upper === 'KG') return KYRGYZSTAN_CITIES;
  return russianCities.filter((c) => c !== 'Все города');
}
