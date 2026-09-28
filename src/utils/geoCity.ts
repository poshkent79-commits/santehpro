export { RUSSIAN_CITIES } from '../data/initialData';
import { RUSSIAN_CITIES } from '../data/initialData';
import {
  TAJIKISTAN_CITIES,
  KAZAKHSTAN_CITIES,
  UZBEKISTAN_CITIES,
  KYRGYZSTAN_CITIES,
  getCountryByCity,
  getCountryByCode,
  COUNTRIES,
} from '../data/regionsData';

export interface CityCoord {
  name: string;
  lat: number;
  lon: number;
  aliases: string[];
}

export interface DetectedCityResult {
  detectedCityName: string; // e.g. "Москва", "Душанбе", "Алматы", "Ташкент"
  nearestCity: string; // A valid city from supported regional lists
  distanceKm: number; // 0 if direct match or estimated distance in km
  isExactMatch: boolean;
  country?: string; // 'RU' | 'TJ' | 'KZ' | 'UZ' | 'KG'
  countryName?: string;
  countryFlag?: string;
  latitude?: number;
  longitude?: number;
}

// Coordinates and common satellites / aliases for Russian cities in the database
export const CITY_COORDINATES: Record<string, CityCoord> = {
  'Москва': {
    name: 'Москва',
    lat: 55.7558,
    lon: 37.6173,
    aliases: [
      'москва', 'moscow', 'moskva', 'зеленоград', 'химки', 'подольск', 'мытищи',
      'люберцы', 'балашиха', 'красногорск', 'одинцово', 'королев', 'королёв',
      'видное', 'домодедово', 'реутов', 'долгопрудный', 'пушкино', 'раменское', 'жуковский'
    ]
  },
  'Санкт-Петербург': {
    name: 'Санкт-Петербург',
    lat: 59.9343,
    lon: 30.3351,
    aliases: [
      'санкт-петербург', 'петербург', 'питер', 'saint petersburg', 'st petersburg',
      'st. petersburg', 'leningrad', 'гатчина', 'пушкин', 'колпино', 'петергоф',
      'мурино', 'кудрово', 'всеволожск', 'выборг', 'сосновый бор'
    ]
  },
  'Владивосток': {
    name: 'Владивосток',
    lat: 43.1155,
    lon: 131.8855,
    aliases: ['владивосток', 'vladivostok', 'артём', 'артем', 'большой камень', 'фокино']
  },
  'Хабаровск': {
    name: 'Хабаровск',
    lat: 48.4827,
    lon: 135.0838,
    aliases: ['хабаровск', 'khabarovsk', 'комсомольск-на-амуре', 'биробиджан', 'амурск']
  },
  'Находка': {
    name: 'Находка',
    lat: 42.8239,
    lon: 132.8735,
    aliases: ['находка', 'nakhodka', 'врангель', 'ливадия']
  },
  'Уссурийск': {
    name: 'Уссурийск',
    lat: 43.7972,
    lon: 131.9525,
    aliases: ['уссурийск', 'ussuriysk', 'ussuriisk', 'михайловка', 'пограничный']
  },
  'Спасск-Дальний': {
    name: 'Спасск-Дальний',
    lat: 44.5986,
    lon: 132.8239,
    aliases: ['спасск-дальний', 'спасск', 'spassk-dalny', 'spassk', 'черниговка']
  },
  'Партизанск': {
    name: 'Партизанск',
    lat: 43.1258,
    lon: 133.1258,
    aliases: ['партизанск', 'partizansk']
  },
  'Новосибирск': {
    name: 'Новосибирск',
    lat: 55.0084,
    lon: 82.9357,
    aliases: ['новосибирск', 'novosibirsk', 'бердск', 'кольцово', 'обь', 'искетим']
  },
  'Екатеринбург': {
    name: 'Екатеринбург',
    lat: 56.8389,
    lon: 60.6057,
    aliases: ['екатеринбург', 'yekaterinburg', 'ekaterinburg', 'пышма', 'березовский', 'первоуральск', 'сысерть']
  },
  'Нижний Новгород': {
    name: 'Нижний Новгород',
    lat: 56.2965,
    lon: 43.9361,
    aliases: ['нижний новгород', 'нижний', 'nizhny novgorod', 'nizhniy novgorod', 'дзержинск', 'бор', 'кстово']
  },
  'Казань': {
    name: 'Казань',
    lat: 55.8304,
    lon: 49.0661,
    aliases: ['казань', 'kazan', 'зеленодольск', 'иннополис']
  },
  'Челябинск': {
    name: 'Челябинск',
    lat: 55.1644,
    lon: 61.4368,
    aliases: ['челябинск', 'chelyabinsk', 'копейск', 'миасс', 'златоуст']
  },
  'Омск': {
    name: 'Омск',
    lat: 54.9885,
    lon: 73.3242,
    aliases: ['омск', 'omsk']
  },
  'Самара': {
    name: 'Самара',
    lat: 53.1959,
    lon: 50.1002,
    aliases: ['самара', 'samara', 'новокуйбышевск', 'чапаевск', 'кинель']
  },
  'Ростов-на-Дону': {
    name: 'Ростов-на-Дону',
    lat: 47.2357,
    lon: 39.7015,
    aliases: ['ростов-на-дону', 'ростов', 'rostov-on-don', 'rostov', 'батайск', 'аксай', 'таганрог', 'новочеркасск']
  },
  'Уфа': {
    name: 'Уфа',
    lat: 54.7388,
    lon: 55.9721,
    aliases: ['уфа', 'ufa', 'стерлитамак', 'салават']
  },
  'Красноярск': {
    name: 'Красноярск',
    lat: 56.0153,
    lon: 92.8932,
    aliases: ['красноярск', 'krasnoyarsk', 'дивногорск', 'сосновоборск']
  },
  'Пермь': {
    name: 'Пермь',
    lat: 58.0105,
    lon: 56.2502,
    aliases: ['пермь', 'perm', 'краснокамск', 'кунгур']
  },
  'Воронеж': {
    name: 'Воронеж',
    lat: 51.6755,
    lon: 39.2089,
    aliases: ['воронеж', 'voronezh', 'семилуки', 'нововоронеж']
  },
  'Волгоград': {
    name: 'Волгоград',
    lat: 48.7080,
    lon: 44.5133,
    aliases: ['волгоград', 'volgograd', 'волжский']
  },
  'Краснодар': {
    name: 'Краснодар',
    lat: 45.0393,
    lon: 38.9872,
    aliases: ['краснодар', 'krasnodar', 'армавир']
  },
  'Сочи': {
    name: 'Сочи',
    lat: 43.6028,
    lon: 39.7342,
    aliases: ['сочи', 'sochi', 'адлер', 'лазаревское', 'хоста', 'красная поляна']
  },
  'Новороссийск': {
    name: 'Новороссийск',
    lat: 44.7239,
    lon: 37.7686,
    aliases: ['новороссийск', 'novorossiysk']
  },
  'Анапа': {
    name: 'Анапа',
    lat: 44.8949,
    lon: 37.3163,
    aliases: ['анапа', 'anapa', 'витязево']
  },
  'Геленджик': {
    name: 'Геленджик',
    lat: 44.5611,
    lon: 38.0769,
    aliases: ['геленджик', 'gelendzhik']
  },
  'Тюмень': {
    name: 'Тюмень',
    lat: 57.1613,
    lon: 65.5250,
    aliases: ['тюмень', 'tyumen']
  },
  'Тобольск': {
    name: 'Тобольск',
    lat: 58.1981,
    lon: 68.2544,
    aliases: ['тобольск', 'tobolsk']
  },
  'Саратов': {
    name: 'Саратов',
    lat: 51.5406,
    lon: 46.0086,
    aliases: ['саратов', 'saratov']
  },
  'Энгельс': {
    name: 'Энгельс',
    lat: 51.5039,
    lon: 46.1219,
    aliases: ['энгельс', 'engels']
  },
  'Балаково': {
    name: 'Балаково',
    lat: 52.0289,
    lon: 47.7889,
    aliases: ['балаково', 'balakovo']
  },
  'Тольятти': {
    name: 'Тольятти',
    lat: 53.5303,
    lon: 49.3461,
    aliases: ['тольятти', 'tolyatti', 'togliatti', 'жигулевск', 'жигулёвск']
  },
  'Барнаул': {
    name: 'Барнаул',
    lat: 53.3548,
    lon: 83.7698,
    aliases: ['барнаул', 'barnaul', 'новоалтайск']
  },
  'Ижевск': {
    name: 'Ижевск',
    lat: 56.8528,
    lon: 53.2115,
    aliases: ['ижевск', 'izhevsk', 'воткинск', 'сарапул']
  },
  'Ульяновск': {
    name: 'Ульяновск',
    lat: 54.3142,
    lon: 48.4031,
    aliases: ['ульяновск', 'ulyanovsk', 'симбирск']
  },
  'Иркутск': {
    name: 'Иркутск',
    lat: 52.2864,
    lon: 104.3050,
    aliases: ['иркутск', 'irkutsk', 'шелехов']
  },
  'Ангарск': {
    name: 'Ангарск',
    lat: 52.5448,
    lon: 103.8882,
    aliases: ['ангарск', 'angarsk']
  },
  'Братск': {
    name: 'Братск',
    lat: 56.1511,
    lon: 101.6342,
    aliases: ['братск', 'bratsk']
  },
  'Ярославль': {
    name: 'Ярославль',
    lat: 57.6261,
    lon: 39.8845,
    aliases: ['ярославль', 'yaroslavl']
  },
  'Рыбинск': {
    name: 'Рыбинск',
    lat: 58.0483,
    lon: 38.8583,
    aliases: ['рыбинск', 'rybinsk']
  },
  'Севастополь': {
    name: 'Севастополь',
    lat: 44.6167,
    lon: 33.5254,
    aliases: ['севастополь', 'sevastopol', 'балаклава', 'инкерман']
  },
  'Симферополь': {
    name: 'Симферополь',
    lat: 44.9572,
    lon: 34.1108,
    aliases: ['симферополь', 'simferopol']
  },
  'Керчь': {
    name: 'Керчь',
    lat: 45.3564,
    lon: 36.4674,
    aliases: ['керчь', 'kerch']
  },
  'Евпатория': {
    name: 'Евпатория',
    lat: 45.1939,
    lon: 33.3681,
    aliases: ['евпатория', 'yevpatoria', 'yevpatoriya']
  },
  'Ялта': {
    name: 'Ялта',
    lat: 44.4958,
    lon: 34.1664,
    aliases: ['ялта', 'yalta', 'алупка', 'алушта']
  },
  'Ставрополь': {
    name: 'Ставрополь',
    lat: 45.0428,
    lon: 41.9734,
    aliases: ['ставрополь', 'stavropol', 'михайловск']
  },
  'Пятигорск': {
    name: 'Пятигорск',
    lat: 44.0486,
    lon: 43.0594,
    aliases: ['пятигорск', 'pyatigorsk']
  },
  'Кисловодск': {
    name: 'Кисловодск',
    lat: 43.9133,
    lon: 42.7208,
    aliases: ['кисловодск', 'kislovodsk']
  },
  'Ессентуки': {
    name: 'Ессентуки',
    lat: 44.0456,
    lon: 42.8603,
    aliases: ['ессентуки', 'yessentuki']
  },
  'Минеральные Воды': {
    name: 'Минеральные Воды',
    lat: 44.2106,
    lon: 43.1350,
    aliases: ['минеральные воды', 'минводы', 'mineralnye vody']
  },
  'Томск': {
    name: 'Томск',
    lat: 56.4977,
    lon: 84.9744,
    aliases: ['томск', 'tomsk', 'северск']
  },
  'Кемерово': {
    name: 'Кемерово',
    lat: 55.3547,
    lon: 86.0873,
    aliases: ['кемерово', 'kemerovo']
  },
  'Новокузнецк': {
    name: 'Новокузнецк',
    lat: 53.7596,
    lon: 87.1216,
    aliases: ['новокузнецк', 'novokuznetsk']
  },
  'Набережные Челны': {
    name: 'Набережные Челны',
    lat: 55.7436,
    lon: 52.4078,
    aliases: ['набережные челны', 'челны', 'naberezhnye chelny', 'елабуга']
  },
  'Нижнекамск': {
    name: 'Нижнекамск',
    lat: 55.6358,
    lon: 51.8219,
    aliases: ['нижнекамск', 'nizhnekamsk']
  },
  'Оренбург': {
    name: 'Оренбург',
    lat: 51.7682,
    lon: 55.0970,
    aliases: ['оренбург', 'orenburg']
  },
  'Орск': {
    name: 'Орск',
    lat: 51.2044,
    lon: 58.5669,
    aliases: ['орск', 'orsk', 'новотроицк']
  },
  'Рязань': {
    name: 'Рязань',
    lat: 54.6292,
    lon: 39.7345,
    aliases: ['рязань', 'ryazan']
  },
  'Пенза': {
    name: 'Пенза',
    lat: 53.1950,
    lon: 45.0183,
    aliases: ['пенза', 'penza', 'заречный']
  },
  'Чебоксары': {
    name: 'Чебоксары',
    lat: 56.1439,
    lon: 47.2489,
    aliases: ['чебоксары', 'cheboksary', 'новочебоксарск']
  },
  'Липецк': {
    name: 'Липецк',
    lat: 52.6103,
    lon: 39.5947,
    aliases: ['липецк', 'lipetsk']
  },
  'Калининград': {
    name: 'Калининград',
    lat: 54.7104,
    lon: 20.4522,
    aliases: ['калининград', 'kaliningrad', 'зеленоградск', 'светлогорск', 'балтийск']
  },
  'Астрахань': {
    name: 'Астрахань',
    lat: 46.3497,
    lon: 48.0408,
    aliases: ['астрахань', 'astrakhan']
  },
  'Тула': {
    name: 'Тула',
    lat: 54.1961,
    lon: 37.6182,
    aliases: ['тула', 'tula', 'новомосковск']
  },
  'Киров': {
    name: 'Киров',
    lat: 58.6035,
    lon: 49.6679,
    aliases: ['киров', 'kirov', 'кирово-чепецк']
  },
  'Улан-Удэ': {
    name: 'Улан-Удэ',
    lat: 51.8344,
    lon: 107.5844,
    aliases: ['улан-удэ', 'ulan-ude', 'уланудэ']
  },
  'Курск': {
    name: 'Курск',
    lat: 51.7304,
    lon: 36.1926,
    aliases: ['курск', 'kursk', 'железногорск']
  },
  'Тверь': {
    name: 'Тверь',
    lat: 56.8584,
    lon: 35.9006,
    aliases: ['тверь', 'tver', 'торжок']
  },
  'Магнитогорск': {
    name: 'Магнитогорск',
    lat: 53.4072,
    lon: 58.9794,
    aliases: ['магнитогорск', 'magnitogorsk']
  },
  'Сургут': {
    name: 'Сургут',
    lat: 61.2540,
    lon: 73.4141,
    aliases: ['сургут', 'surgut']
  },
  'Нижневартовск': {
    name: 'Нижневартовск',
    lat: 60.9386,
    lon: 76.5589,
    aliases: ['нижневартовск', 'nizhnevartovsk']
  },
  'Нефтеюганск': {
    name: 'Нефтеюганск',
    lat: 61.0997,
    lon: 72.6031,
    aliases: ['нефтеюганск', 'nefteyugansk']
  },
  'Ханты-Мансийск': {
    name: 'Ханты-Мансийск',
    lat: 61.0042,
    lon: 69.0019,
    aliases: ['ханты-мансийск', 'khanty-mansiysk']
  },
  'Новый Уренгой': {
    name: 'Новый Уренгой',
    lat: 66.0844,
    lon: 76.6808,
    aliases: ['новый уренгой', 'novy urengoy']
  },
  'Ноябрьск': {
    name: 'Ноябрьск',
    lat: 63.2017,
    lon: 75.4508,
    aliases: ['ноябрьск', 'noyabrsk']
  },
  'Брянск': {
    name: 'Брянск',
    lat: 53.2434,
    lon: 34.3642,
    aliases: ['брянск', 'bryansk']
  },
  'Иваново': {
    name: 'Иваново',
    lat: 56.9997,
    lon: 40.9739,
    aliases: ['иваново', 'ivanovo', 'шуя', 'кинешма']
  },
  'Якутск': {
    name: 'Якутск',
    lat: 62.0355,
    lon: 129.6755,
    aliases: ['якутск', 'yakutsk', 'покровск']
  },
  'Владимир': {
    name: 'Владимир',
    lat: 56.1290,
    lon: 40.4066,
    aliases: ['владимир', 'vladimir', 'суздаль', 'ковров']
  },
  'Белгород': {
    name: 'Белгород',
    lat: 50.5954,
    lon: 36.5873,
    aliases: ['белгород', 'belgorod', 'шебекино']
  },
  'Старый Оскол': {
    name: 'Старый Оскол',
    lat: 51.2981,
    lon: 37.8344,
    aliases: ['старый оскол', 'stary oskol']
  },
  'Нижний Тагил': {
    name: 'Нижний Тагил',
    lat: 57.9194,
    lon: 59.9650,
    aliases: ['нижний тагил', 'nizhny tagil']
  },
  'Калуга': {
    name: 'Калуга',
    lat: 54.5138,
    lon: 36.2612,
    aliases: ['калуга', 'kaluga']
  },
  'Обнинск': {
    name: 'Обнинск',
    lat: 55.0969,
    lon: 36.6103,
    aliases: ['обнинск', 'obninsk']
  },
  'Чита': {
    name: 'Чита',
    lat: 52.0336,
    lon: 113.5008,
    aliases: ['чита', 'chita']
  },
  'Грозный': {
    name: 'Грозный',
    lat: 43.3180,
    lon: 45.6986,
    aliases: ['грозный', 'grozny', 'аргун', 'гудермес', 'шалинский']
  },
  'Махачкала': {
    name: 'Махачкала',
    lat: 42.9849,
    lon: 47.5047,
    aliases: ['махачкала', 'makhachkala', 'каспийск']
  },
  'Дербент': {
    name: 'Дербент',
    lat: 42.0678,
    lon: 48.2899,
    aliases: ['дербент', 'derbent']
  },
  'Хасавюрт': {
    name: 'Хасавюрт',
    lat: 43.2497,
    lon: 46.5872,
    aliases: ['хасавюрт', 'khasavyurt']
  },
  'Владикавказ': {
    name: 'Владикавказ',
    lat: 43.0367,
    lon: 44.6678,
    aliases: ['владикавказ', 'vladikavkaz', 'беслан']
  },
  'Нальчик': {
    name: 'Нальчик',
    lat: 43.4853,
    lon: 43.6071,
    aliases: ['нальчик', 'nalchik', 'прохладный']
  },
  'Черкесск': {
    name: 'Черкесск',
    lat: 44.2233,
    lon: 42.0578,
    aliases: ['черкесск', 'cherkessk']
  },
  'Майкоп': {
    name: 'Майкоп',
    lat: 44.6089,
    lon: 40.1006,
    aliases: ['майкоп', 'maykop']
  },
  'Элиста': {
    name: 'Элиста',
    lat: 46.3078,
    lon: 44.2558,
    aliases: ['элиста', 'elista']
  },
  'Смоленск': {
    name: 'Смоленск',
    lat: 54.7818,
    lon: 32.0401,
    aliases: ['смоленск', 'smolensk', 'вязьма']
  },
  'Саранск': {
    name: 'Саранск',
    lat: 54.1838,
    lon: 45.1838,
    aliases: ['саранск', 'saransk', 'рузаевка']
  },
  'Вологда': {
    name: 'Вологда',
    lat: 59.2205,
    lon: 39.8915,
    aliases: ['вологда', 'vologda']
  },
  'Череповец': {
    name: 'Череповец',
    lat: 59.1325,
    lon: 37.9042,
    aliases: ['череповец', 'cherepovets']
  },
  'Курган': {
    name: 'Курган',
    lat: 55.4411,
    lon: 65.3411,
    aliases: ['курган', 'kurgan', 'шадринск']
  },
  'Орёл': {
    name: 'Орёл',
    lat: 52.9686,
    lon: 36.0694,
    aliases: ['орёл', 'орел', 'oryol', 'orel']
  },
  'Архангельск': {
    name: 'Архангельск',
    lat: 64.5399,
    lon: 40.5158,
    aliases: ['архангельск', 'arkhangelsk']
  },
  'Северодвинск': {
    name: 'Северодвинск',
    lat: 64.5636,
    lon: 39.8303,
    aliases: ['северодвинск', 'severodvinsk']
  },
  'Йошкар-Ола': {
    name: 'Йошкар-Ола',
    lat: 56.6388,
    lon: 47.8908,
    aliases: ['йошкар-ола', 'yoshkar-ola', 'йошкарола']
  },
  'Стерлитамак': {
    name: 'Стерлитамак',
    lat: 53.6300,
    lon: 55.9500,
    aliases: ['стерлитамак', 'sterlitamak', 'салават', 'ишимбай']
  },
  'Мурманск': {
    name: 'Мурманск',
    lat: 68.9707,
    lon: 33.0750,
    aliases: ['мурманск', 'murmansk', 'североморск', 'апатиты']
  },
  'Кострома': {
    name: 'Кострома',
    lat: 57.7679,
    lon: 40.9269,
    aliases: ['кострома', 'kostroma']
  },
  'Тамбов': {
    name: 'Тамбов',
    lat: 52.7317,
    lon: 41.4433,
    aliases: ['тамбов', 'tambov']
  },
  'Петрозаводск': {
    name: 'Петрозаводск',
    lat: 61.7849,
    lon: 34.3469,
    aliases: ['петрозаводск', 'petrozavodsk', 'кондапога']
  },
  'Сыктывкар': {
    name: 'Сыктывкар',
    lat: 61.6688,
    lon: 50.8358,
    aliases: ['сыктывкар', 'syktyvkar', 'эжва', 'ухта']
  },
  'Ухта': {
    name: 'Ухта',
    lat: 63.5594,
    lon: 53.6844,
    aliases: ['ухта', 'ukhta']
  },
  'Воркута': {
    name: 'Воркута',
    lat: 67.4975,
    lon: 64.0611,
    aliases: ['воркута', 'vorkuta']
  },
  'Великий Новгород': {
    name: 'Великий Новгород',
    lat: 58.5228,
    lon: 31.2698,
    aliases: ['великий новгород', 'новгород', 'veliky novgorod']
  },
  'Псков': {
    name: 'Псков',
    lat: 57.8136,
    lon: 28.3496,
    aliases: ['псков', 'pskov', 'великие луки']
  },
  'Благовещенск': {
    name: 'Благовещенск',
    lat: 50.2796,
    lon: 127.5405,
    aliases: ['благовещенск', 'blagoveshchensk', 'белогорск']
  },
  'Биробиджан': {
    name: 'Биробиджан',
    lat: 48.7946,
    lon: 132.9218,
    aliases: ['биробиджан', 'birobidzhan']
  },
  'Южно-Сахалинск': {
    name: 'Южно-Сахалинск',
    lat: 46.9541,
    lon: 142.7360,
    aliases: ['южно-сахалинск', 'yuzhno-sakhalinsk', 'сахалин', 'корсаков', 'холмск']
  },
  'Петропавловск-Камчатский': {
    name: 'Петропавловск-Камчатский',
    lat: 53.0452,
    lon: 158.6483,
    aliases: ['петропавловск-камчатский', 'petropavlovsk-kamchatsky', 'камчатка', 'елизово']
  },
  'Магадан': {
    name: 'Магадан',
    lat: 59.5638,
    lon: 150.8086,
    aliases: ['магадан', 'magadan']
  },
  'Анадырь': {
    name: 'Анадырь',
    lat: 64.7332,
    lon: 177.5089,
    aliases: ['анадырь', 'anadyr', 'чукотка']
  },
  'Абакан': {
    name: 'Абакан',
    lat: 53.7212,
    lon: 91.4424,
    aliases: ['абакан', 'abakan', 'черногорск', 'саяногорск']
  },
  'Кызыл': {
    name: 'Кызыл',
    lat: 51.7197,
    lon: 94.4378,
    aliases: ['кызыл', 'kyzyl', 'тыва']
  },
  'Горно-Алтайск': {
    name: 'Горно-Алтайск',
    lat: 51.9583,
    lon: 85.9603,
    aliases: ['горно-алтайск', 'gorno-altaysk']
  },
  'Норильск': {
    name: 'Норильск',
    lat: 69.3498,
    lon: 88.2010,
    aliases: ['норильск', 'norilsk', 'талнах', 'кайеркан', 'дудинка']
  },
  // Таджикистан (Tajikistan)
  'Душанбе': {
    name: 'Душанбе',
    lat: 38.5598,
    lon: 68.7870,
    aliases: ['душанбе', 'dushanbe', 'вахдат', 'гиссар', 'варзоб']
  },
  'Худжанд': {
    name: 'Худжанд',
    lat: 40.2826,
    lon: 69.6222,
    aliases: ['худжанд', 'khujand', 'ленинабад', 'гафуров', 'бустон', 'чоркух']
  },
  'Бохтар': {
    name: 'Бохтар',
    lat: 37.8364,
    lon: 68.7801,
    aliases: ['бохтар', 'курган-тюбе', 'кургантюбе', 'bokhtar', 'qurghonteppa']
  },
  'Куляб': {
    name: 'Куляб',
    lat: 37.9089,
    lon: 69.7828,
    aliases: ['куляб', 'kulyab', 'kulob']
  },
  'Истаравшан': {
    name: 'Истаравшан',
    lat: 39.9142,
    lon: 69.0036,
    aliases: ['истаравшан', 'istaravshan', 'ура-тюбе']
  },
  'Исфара': {
    name: 'Исфара',
    lat: 40.1242,
    lon: 70.6253,
    aliases: ['исфара', 'isfara']
  },
  'Канибадам': {
    name: 'Канибадам',
    lat: 40.2886,
    lon: 70.4286,
    aliases: ['канибадам', 'kanibadam', 'конибодом']
  },
  'Пенджикент': {
    name: 'Пенджикент',
    lat: 39.4958,
    lon: 67.6094,
    aliases: ['пенджикент', 'penjikent', 'панчакент']
  },
  // Казахстан (Kazakhstan)
  'Алматы': {
    name: 'Алматы',
    lat: 43.2389,
    lon: 76.8897,
    aliases: ['алматы', 'almaty', 'алма-ата', 'талгар', 'каскелен']
  },
  'Астана': {
    name: 'Астана',
    lat: 51.1694,
    lon: 71.4491,
    aliases: ['астана', 'astana', 'нур-султан', 'нурсултан', 'целиноград', 'акмолинск']
  },
  'Шымкент': {
    name: 'Шымкент',
    lat: 42.3417,
    lon: 69.5901,
    aliases: ['шымкент', 'shymkent', 'чимкент']
  },
  'Караганда': {
    name: 'Караганда',
    lat: 49.8047,
    lon: 73.1094,
    aliases: ['караганда', 'karaganda', 'темиртау', 'шахтинск', 'сарань']
  },
  'Актобе': {
    name: 'Актобе',
    lat: 50.2839,
    lon: 57.1670,
    aliases: ['актобе', 'aktobe', 'актюбинск']
  },
  'Тараз': {
    name: 'Тараз',
    lat: 42.9000,
    lon: 71.3667,
    aliases: ['тараз', 'taraz', 'джамбул']
  },
  'Павлодар': {
    name: 'Павлодар',
    lat: 52.2878,
    lon: 76.9672,
    aliases: ['павлодар', 'pavlodar', 'аксу', 'экибастуз']
  },
  'Усть-Каменогорск': {
    name: 'Усть-Каменогорск',
    lat: 49.9536,
    lon: 82.6094,
    aliases: ['усть-каменогорск', 'оскемен', 'oskemen']
  },
  'Семей': {
    name: 'Семей',
    lat: 50.4111,
    lon: 80.2275,
    aliases: ['семей', 'семипалатинск', 'semey']
  },
  'Атырау': {
    name: 'Атырау',
    lat: 47.1167,
    lon: 51.8833,
    aliases: ['атырау', 'atyrau', 'гурьев']
  },
  // Узбекистан (Uzbekistan)
  'Ташкент': {
    name: 'Ташкент',
    lat: 41.2995,
    lon: 69.2401,
    aliases: ['ташкент', 'tashkent', 'тошкент', 'чирчик', 'янгиюль']
  },
  'Самарканд': {
    name: 'Самарканд',
    lat: 39.6542,
    lon: 66.9597,
    aliases: ['самарканд', 'samarkand', 'самарканд']
  },
  'Бухара': {
    name: 'Бухара',
    lat: 39.7747,
    lon: 64.4286,
    aliases: ['бухара', 'bukhara', 'бухоро', 'каган']
  },
  'Андижан': {
    name: 'Андижан',
    lat: 40.7821,
    lon: 72.3442,
    aliases: ['андижан', 'andijan', 'андижон', 'асака']
  },
  'Наманган': {
    name: 'Наманган',
    lat: 40.9983,
    lon: 71.6726,
    aliases: ['наманган', 'namangan', 'чуст']
  },
  'Фергана': {
    name: 'Фергана',
    lat: 40.3842,
    lon: 71.7843,
    aliases: ['фергана', 'fergana', 'маргилан', 'коканд', 'кувасай']
  },
  'Нукус': {
    name: 'Нукус',
    lat: 42.4602,
    lon: 59.6166,
    aliases: ['нукус', 'nukus', 'каракалпакстан']
  },
  // Кыргызстан (Kyrgyzstan)
  'Бишкек': {
    name: 'Бишкек',
    lat: 42.8746,
    lon: 74.5698,
    aliases: ['бишкек', 'bishkek', 'фрунзе', 'кант', 'кара-балта', 'токмок']
  },
  'Ош': {
    name: 'Ош',
    lat: 40.5140,
    lon: 72.8161,
    aliases: ['ош', 'osh', 'кара-суу', 'ноокат', 'узген']
  },
  'Джалал-Абад': {
    name: 'Джалал-Абад',
    lat: 40.9333,
    lon: 72.9833,
    aliases: ['джалал-абад', 'жалал-абад', 'jalal-abad', 'кок-жаргак']
  },
  'Каракол': {
    name: 'Каракол',
    lat: 42.4907,
    lon: 78.3936,
    aliases: ['каракол', 'karakol', 'пржевальск', 'иссык-куль']
  }
};

/**
 * Calculates geographical distance in kilometers between two points using the Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Normalizes city name string for comparison
 */
function normalizeCityName(str: string): string {
  return str
    .toLowerCase()
    .replace(/^г\.\s*|^город\s*/i, '')
    .trim();
}

/**
 * Finds the nearest matching city in our active database list
 */
export function findNearestCity(
  detectedName?: string,
  latitude?: number,
  longitude?: number,
  countryCode?: string
): { nearestCity: string; distanceKm: number; isExactMatch: boolean; country?: string } {
  const allSupportedCities = [
    ...RUSSIAN_CITIES.filter((c) => c !== 'Все города'),
    ...TAJIKISTAN_CITIES,
    ...KAZAKHSTAN_CITIES,
    ...UZBEKISTAN_CITIES,
    ...KYRGYZSTAN_CITIES,
  ];

  const normCountry = (countryCode || '').toUpperCase();

  // 1. Direct name match or alias lookup
  if (detectedName) {
    const clean = normalizeCityName(detectedName);

    // Direct match with active city names
    for (const city of allSupportedCities) {
      if (normalizeCityName(city) === clean) {
        const cInfo = getCountryByCity(city);
        return { nearestCity: city, distanceKm: 0, isExactMatch: true, country: cInfo.code };
      }
    }

    // Alias / satellite lookup
    for (const [cityName, coord] of Object.entries(CITY_COORDINATES)) {
      if (coord.aliases.some((alias) => clean.includes(alias) || alias.includes(clean))) {
        const cInfo = getCountryByCity(cityName);
        return {
          nearestCity: cityName,
          distanceKm: 0,
          isExactMatch: true,
          country: cInfo.code,
        };
      }
    }
  }

  // 2. Coordinate-based nearest lookup (if lat & lon available)
  if (typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)) {
    let bestCity = 'Москва';
    let minDistance = Infinity;

    for (const [cityName, coord] of Object.entries(CITY_COORDINATES)) {
      const dist = calculateHaversineDistanceKm(latitude, longitude, coord.lat, coord.lon);
      if (dist < minDistance) {
        minDistance = dist;
        bestCity = cityName;
      }
    }

    const cInfo = getCountryByCity(bestCity);
    return {
      nearestCity: bestCity,
      distanceKm: minDistance,
      isExactMatch: minDistance <= 35, // within 35 km is treated as an exact local match
      country: cInfo.code,
    };
  }

  // 3. Fallback based on country code
  if (normCountry === 'TJ') {
    return { nearestCity: 'Душанбе', distanceKm: 0, isExactMatch: false, country: 'TJ' };
  }
  if (normCountry === 'KZ') {
    return { nearestCity: 'Алматы', distanceKm: 0, isExactMatch: false, country: 'KZ' };
  }
  if (normCountry === 'UZ') {
    return { nearestCity: 'Ташкент', distanceKm: 0, isExactMatch: false, country: 'UZ' };
  }
  if (normCountry === 'KG') {
    return { nearestCity: 'Бишкек', distanceKm: 0, isExactMatch: false, country: 'KG' };
  }

  // Default fallback
  return { nearestCity: 'Москва', distanceKm: 0, isExactMatch: false, country: 'RU' };
}

/**
 * Detects user city from free IP geolocation service
 * Tries ipwho.is first, then ipapi.co
 */
export async function detectUserCityFromIP(force = false): Promise<DetectedCityResult | null> {
  // Check fast in-memory / session cache to avoid repeating external network requests
  if (!force && typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem('santehpro_cached_geo_ip');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
  }

  const saveToCache = (result: DetectedCityResult) => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('santehpro_cached_geo_ip', JSON.stringify(result));
      } catch {}
    }
    return result;
  };

  // 1. Primary: Internal endpoint (/api/geo/my-location) - fast, reliable, zero third-party blocks in Russia
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch('/api/geo/my-location', {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && (data.city || (typeof data.latitude === 'number' && typeof data.longitude === 'number'))) {
        const rawCity = data.city || '';
        const lat = typeof data.latitude === 'number' ? data.latitude : undefined;
        const lon = typeof data.longitude === 'number' ? data.longitude : undefined;
        const country = (data.country || 'RU').toUpperCase();

        const match = findNearestCity(rawCity, lat, lon, country);
        const countryObj = getCountryByCode(match.country || country);
        return saveToCache({
          detectedCityName: rawCity || match.nearestCity,
          nearestCity: match.nearestCity,
          distanceKm: match.distanceKm,
          isExactMatch: match.isExactMatch,
          country: countryObj.code,
          countryName: countryObj.name,
          countryFlag: countryObj.flag,
          latitude: lat,
          longitude: lon
        });
      }
    }
  } catch (_err) {
    // Internal endpoint failed, continue to fallback
  }

  // 2. Secondary: ipwho.is (HTTPS, fast, CORS-friendly, free)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && (data.city || (typeof data.latitude === 'number' && typeof data.longitude === 'number'))) {
        const rawCity = data.city || '';
        const lat = typeof data.latitude === 'number' ? data.latitude : undefined;
        const lon = typeof data.longitude === 'number' ? data.longitude : undefined;
        const country = (data.country_code || data.country || 'RU').toUpperCase();

        const match = findNearestCity(rawCity, lat, lon, country);
        const countryObj = getCountryByCode(match.country || country);
        return saveToCache({
          detectedCityName: rawCity || match.nearestCity,
          nearestCity: match.nearestCity,
          distanceKm: match.distanceKm,
          isExactMatch: match.isExactMatch,
          country: countryObj.code,
          countryName: countryObj.name,
          countryFlag: countryObj.flag,
          latitude: lat,
          longitude: lon
        });
      }
    }
  } catch (err) {
    // Primary failed, continue to fallback
  }

  // 3. Fallback: ipapi.co/json/
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && (data.city || (typeof data.latitude === 'number' && typeof data.longitude === 'number'))) {
        const rawCity = data.city || '';
        const lat = typeof data.latitude === 'number' ? data.latitude : undefined;
        const lon = typeof data.longitude === 'number' ? data.longitude : undefined;
        const country = (data.country_code || data.country || 'RU').toUpperCase();

        const match = findNearestCity(rawCity, lat, lon, country);
        const countryObj = getCountryByCode(match.country || country);
        return saveToCache({
          detectedCityName: rawCity || match.nearestCity,
          nearestCity: match.nearestCity,
          distanceKm: match.distanceKm,
          isExactMatch: match.isExactMatch,
          country: countryObj.code,
          countryName: countryObj.name,
          countryFlag: countryObj.flag,
          latitude: lat,
          longitude: lon
        });
      }
    }
  } catch (err) {
    // Both IP services failed
  }

  return saveToCache({
    detectedCityName: 'Москва',
    nearestCity: 'Москва',
    distanceKm: 0,
    isExactMatch: false,
    country: 'RU',
    countryName: 'Россия',
    countryFlag: '🇷🇺',
  });
}

/**
 * Attempts to detect user city from browser HTML5 Geolocation API (GPS / WiFi)
 */
export function detectUserCityFromBrowserGPS(): Promise<DetectedCityResult | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const match = findNearestCity(undefined, lat, lon);
        resolve({
          detectedCityName: match.nearestCity,
          nearestCity: match.nearestCity,
          distanceKm: match.distanceKm,
          isExactMatch: match.isExactMatch,
          latitude: lat,
          longitude: lon,
        });
      },
      () => {
        // Permission denied or error
        resolve(null);
      },
      { timeout: 7000, enableHighAccuracy: false }
    );
  });
}

/**
 * Combined detection: tries IP first, then fallback
 */
export async function detectBestUserLocation(): Promise<DetectedCityResult> {
  const ipResult = await detectUserCityFromIP();
  if (ipResult) return ipResult;

  return {
    detectedCityName: 'Москва',
    nearestCity: 'Москва',
    distanceKm: 0,
    isExactMatch: false,
  };
}
