import { Article } from '../types';

export const PRO_SUBSCRIPTION_PRICE = '1 999 ₽';
export const PRO_SUBSCRIPTION_INVESTMENT_NOTE =
  'Данная инвестиция предоставляет бессрочный доступ к закрытым инженерным решениям СантехПро.';

export const PRO_BENEFITS = [
  'Полный доступ к закрытым программам и курсам от практикующих инженеров',
  'Готовые типовые сметы и спецификации закупки под ключ (квартиры и коттеджи)',
  'Монтажные схемы узлов ввода и гидравлики высокого разрешения в векторном формате',
  'Шаблоны договоров монтажа сантехники с актами сдачи-приемки для мастеров',
  'Статусная отметка с золотой короной Pro и знак проверенного эксперта в профиле',
  'Разовая инвестиция 1 999 ₽ навсегда — без абонентской платы и скрытых списаний',
];

export const PRO_ALL_PLAN: Article = {
  id: 'pro_all',
  title: 'СантехПро PRO (Бессрочный доступ)',
  category: 'water',
  type: 'video',
  accessType: 'paid',
  price: PRO_SUBSCRIPTION_PRICE,
  difficulty: 'Профи',
  createdAt: new Date().toISOString(),
  description:
    'Полный бессрочный доступ к закрытым курсам, готовым сметам закупки, чертежам узлов в высоком разрешении и статусной короне в личном кабинете.',
  coverImage:
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  author: 'Достонджон Туйчиев',
  timeEst: 'Бессрочно',
  views: 3200,
  likes: 540,
  steps: [],
};

/**
 * Identifies the 80 advanced engineering instructions out of the 133 total.
 * Selection rule:
 * - All "Профи" articles (23)
 * - All "Продвинутый" articles (50)
 * - 7 selected advanced/extensive "Новичок" instructions (7)
 * Total: exactly 80 articles.
 */
export function getProInstructionIds(allArticles: Article[]): Set<string> {
  const handbookArticles = allArticles.filter(
    (a) => a.adminSection !== 'courses' && a.type !== 'video'
  );

  const profi = handbookArticles.filter((a) => a.difficulty === 'Профи');
  const advanced = handbookArticles.filter((a) => a.difficulty === 'Продвинутый');
  const novice = handbookArticles.filter((a) => a.difficulty === 'Новичок');

  // Stable sort for novice to consistently pick 7 most detailed instructions
  const sortedNovice = [...novice].sort(
    (a, b) =>
      (b.steps?.length || 0) - (a.steps?.length || 0) ||
      a.id.localeCompare(b.id)
  );
  const novicePro = sortedNovice.slice(0, 7);

  const proSet = new Set<string>();
  profi.forEach((a) => proSet.add(a.id));
  advanced.forEach((a) => proSet.add(a.id));
  novicePro.forEach((a) => proSet.add(a.id));

  return proSet;
}

/**
 * Checks if a specific article is an advanced engineering guide (for badge & filter display).
 */
export function isArticleAdvancedEngineering(article: Article, proIdsSet?: Set<string>): boolean {
  if (article.accessType === 'paid') return true;
  if (article.adminSection === 'courses') return true;
  if (proIdsSet) {
    return proIdsSet.has(article.id);
  }
  return article.difficulty === 'Профи' || article.difficulty === 'Продвинутый';
}

/**
 * Checks if a specific article strictly requires paid Pro membership to view.
 * All handbook instructions and courses are completely free; subscriptions are eliminated.
 */
export function isArticleProOnly(_article: Article, _proIdsSet?: Set<string>): boolean {
  return false;
}
