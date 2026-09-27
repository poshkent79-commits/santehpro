import React, { useState, useRef, useMemo } from 'react';
import {
  Search,
  Clock,
  ChevronRight,
  Lightbulb,
  X,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Bookmark,
  Crown,
  Lock,
  Sparkles,
  ArrowUpDown,
  Heart,
  CheckCircle2,
  Wrench,
} from 'lucide-react';
import { Article } from '../types';
import { useAuth } from '../context/AuthContext';
import { ArticleEditorModal } from './ArticleEditorModal';
import { getInstructionImage, getInstructionShortTitle } from '../utils/handbookHelpers';
import {
  getProInstructionIds,
  isArticleProOnly,
  isArticleAdvancedEngineering,
} from '../utils/proContent';

interface HandbookViewProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onOpenDiagnostic: () => void;
  onOpenChat: () => void;
  onOpenSpecialists?: () => void;
  onOpenCourses?: () => void;
  onOpenDonation?: () => void;
  isAdmin?: boolean;
  onEditArticle?: (article: Article) => void;
  onRefreshArticles?: () => void;
  initialCategoryFilter?: string;
  initialTypeFilter?: string;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export const HandbookView: React.FC<HandbookViewProps> = ({
  articles,
  onSelectArticle,
  onOpenDiagnostic,
  onOpenChat,
  onOpenSpecialists,
  onOpenCourses,
  onOpenDonation,
  isAdmin,
  onEditArticle,
  onRefreshArticles = () => {},
  initialCategoryFilter = 'all',
  initialTypeFilter = 'all',
  searchQuery: propSearchQuery,
  onSearchQueryChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryFilter);
  const [accessFilter, setAccessFilter] = useState<'all' | 'free' | 'pro'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'title'>('newest');
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');
  const { isFavorite, toggleFavorite } = useAuth();
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;
  const setSearchQuery = (val: string) => {
    setLocalSearchQuery(val);
    onSearchQueryChange?.(val);
  };
  const [isTipsModalOpen, setIsTipsModalOpen] = useState<boolean>(false);
  const [tipsSearch, setTipsSearch] = useState<string>('');

  const proIdsSet = useMemo(() => getProInstructionIds(articles), [articles]);

  // Admin Article Editor modal state
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);

  const articlesListRef = useRef<HTMLDivElement>(null);

  const handleOpenCreateArticle = () => {
    setArticleToEdit(null);
    setIsEditorModalOpen(true);
  };

  const handleOpenEditArticle = (art: Article) => {
    setArticleToEdit(art);
    setIsEditorModalOpen(true);
  };

  const handleDeleteArticle = async (art: Article, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Вы действительно хотите удалить инструкцию "${art.title}"?`)) return;

    try {
      const res = await fetch(`/api/articles/${art.id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshArticles();
      } else {
        alert('Не удалось удалить инструкцию');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при удалении');
    }
  };

  const CATEGORY_TABS: { id: string; name: string }[] = [
    { id: 'all', name: 'Все разделы' },
    { id: 'water', name: 'Водопровод и трубы' },
    { id: 'fixtures', name: 'Смесители и санфаянс' },
    { id: 'heating', name: 'Отопление и батареи' },
    { id: 'drainage', name: 'Канализация и сифоны' },
    { id: 'appliances', name: 'Бытовая техника' },
    { id: 'tools', name: 'Инструменты и фитинги' },
    { id: 'emergency', name: 'Аварийный ремонт' },
  ];

  // Base list of all handbook articles (excluding courses / audio / video)
  const handbookArticles = useMemo(() => {
    return articles.filter(
      (a) => a.adminSection !== 'courses' && a.type !== 'video' && !a.audioUrl
    );
  }, [articles]);

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return handbookArticles.length;
    return handbookArticles.filter((a) => a.category === catId).length;
  };

  const freeCount = useMemo(() => {
    return handbookArticles.filter((a) => !isArticleAdvancedEngineering(a, proIdsSet)).length;
  }, [handbookArticles, proIdsSet]);

  const proCount = useMemo(() => {
    return handbookArticles.filter((a) => isArticleAdvancedEngineering(a, proIdsSet)).length;
  }, [handbookArticles, proIdsSet]);

  const filteredArticles = useMemo(() => {
    return handbookArticles.filter((art) => {
      const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
      const isAdvanced = isArticleAdvancedEngineering(art, proIdsSet);
      const matchesAccess =
        accessFilter === 'all' ||
        (accessFilter === 'pro' && isAdvanced) ||
        (accessFilter === 'free' && !isAdvanced);

      const matchesSearch =
        searchQuery.trim() === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.steps?.some((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCat && matchesAccess && matchesSearch;
    });
  }, [handbookArticles, selectedCategory, accessFilter, searchQuery, proIdsSet]);

  const PRIORITY_INSTRUCTION_IDS = [
    'top-9-installation-frame',
    'top-11-water-meter-replace',
    'top-14-boiler-installation',
    'top-6-mixer-kitchen-replace',
    'top-1-ppr-soldering',
    'top-2-pex-press',
    'top-3-collector-wiring',
    'top-7-cartridge-replace',
    'top-8-toilet-installation',
    'top-10-thermostat-shower',
    'top-12-thread-sealing-methods',
    'top-13-washing-machine-connect',
    'top-15-radiator-replace',
    'top-16-sewer-pipe-slope',
    'top-17-clog-removal-cable',
    'top-4-copper-soldering',
    'top-5-pnd-compression',
  ];

  const sortedArticles = useMemo(() => {
    return [...filteredArticles].sort((a, b) => {
      if (sortBy === 'popular') {
        const diff = (b.views || 0) - (a.views || 0);
        if (diff !== 0) return diff;
        return (b.likes || 0) - (a.likes || 0);
      }

      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'ru');
      }

      // Default: 'newest' (Сначала новые и недавно добавленные / измененные)
      // Custom added articles by admin or master (having art- prefix or newer timestamp) come first
      const isCustomA = a.id.startsWith('art-');
      const isCustomB = b.id.startsWith('art-');
      if (isCustomA && !isCustomB) return -1;
      if (!isCustomA && isCustomB) return 1;

      if (isCustomA && isCustomB) {
        const numA = parseInt(a.id.replace('art-', ''), 10) || 0;
        const numB = parseInt(b.id.replace('art-', ''), 10) || 0;
        if (numA !== numB) return numB - numA;
      }

      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA && timeB && !isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        return timeB - timeA;
      }

      // Fallback pre-seeded articles tie-breaker
      const idxA = PRIORITY_INSTRUCTION_IDS.indexOf(a.id);
      const idxB = PRIORITY_INSTRUCTION_IDS.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;

      return 0;
    });
  }, [filteredArticles, sortBy]);

  return (
    <div className="space-y-6 pb-12">
      {/* Quick Search & Admin action */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Быстрый поиск по инструкциям (например: смеситель, бачок, бойлер...)"
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-2xl pl-12 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenCreateArticle}
            className="px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition flex items-center justify-center space-x-1.5 shrink-0 shadow-sm"
            title="Добавить инструкцию"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">Добавить инструкцию</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          const count = getCategoryCount(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 shrink-0 transition cursor-pointer ${
                isActive
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              <span>{tab.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Access Tier Quick Filter Bar & Sort Controls */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Все пошаговые инструкции бесплатны</span>
          </span>

          {onOpenDonation && (
            <button
              type="button"
              onClick={onOpenDonation}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/15 to-amber-500/15 hover:from-rose-500/25 hover:to-amber-500/25 border border-rose-500/30 hover:border-rose-400 text-rose-300 hover:text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              title="Поддержать развитие проекта добровольным донатом"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>Поддержать проект (Донат)</span>
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <span className="text-slate-400 font-semibold flex items-center space-x-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Сортировка:</span>
          </span>
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setSortBy('newest')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                sortBy === 'newest'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Новые
            </button>
            <button
              type="button"
              onClick={() => setSortBy('popular')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                sortBy === 'popular'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Популярные
            </button>
            <button
              type="button"
              onClick={() => setSortBy('title')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                sortBy === 'title'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              А–Я
            </button>
          </div>
        </div>
      </div>

      {/* Step-by-Step Instructions List (Immediately visible with RED bold titles) */}
      <div ref={articlesListRef} className="space-y-3">
        {sortedArticles.length === 0 ? (
          <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Search className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Инструкции не найдены</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              По запросу «{searchQuery}» ничего не найдено. Попробуйте изменить поисковый запрос или сбросить фильтр.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setAccessFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition inline-flex items-center space-x-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Сбросить поиск и фильтры</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {sortedArticles.map((art) => {
              const isAdvanced = isArticleAdvancedEngineering(art, proIdsSet);

              return (
                <div
                  key={art.id}
                  onClick={() => {
                    onSelectArticle(art);
                  }}
                  className="p-3.5 sm:p-4 rounded-3xl border transition cursor-pointer flex items-center space-x-3.5 sm:space-x-4 group shadow-md active:scale-[0.99] relative overflow-hidden bg-slate-900/95 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:shadow-cyan-500/10"
                >
                  {/* Left: Thumbnail with Steps Badge */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800/80">
                    <img
                      key={art.coverImage || art.id}
                      src={getInstructionImage(art)}
                      alt={getInstructionShortTitle(art.title, art.id)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80';
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-slate-950/85 backdrop-blur-sm text-[11px] font-black text-white border border-slate-700/50 shadow">
                      {art.steps?.length || 4} шагов
                    </div>

                    {isAdvanced ? (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center space-x-1 shadow">
                        <Wrench className="w-2.5 h-2.5" />
                        <span>Инженерия</span>
                      </div>
                    ) : (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-white font-bold text-[9px] flex items-center space-x-1 shadow">
                        <span>База</span>
                      </div>
                    )}

                    {art.id.startsWith('art-') && (
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                        Новое
                      </div>
                    )}
                  </div>

                  {/* Right: Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-1 sm:space-y-1.5">
                    {/* Time + Bookmark */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{art.timeEst || "20-40 мин"}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(art);
                        }}
                        title={isFavorite(art.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                        className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 z-10 ${
                          isFavorite(art.id)
                            ? 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/40 shadow-sm'
                            : 'text-slate-500 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isFavorite(art.id) ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                      </button>
                    </div>

                    {/* Title in clean white */}
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-slate-100 transition leading-snug line-clamp-2">
                      {getInstructionShortTitle(art.title, art.id)}
                    </h3>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
                      <span className="font-semibold text-slate-400 shrink-0">
                        {art.difficulty || "Новичок"}
                      </span>

                      <span className="font-extrabold text-cyan-400 group-hover:text-cyan-300 flex items-center space-x-1 shrink-0 whitespace-nowrap text-[11px] sm:text-xs">
                        <span>Читать</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition shrink-0" />
                      </span>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="absolute top-2.5 right-2.5 flex items-center space-x-1 z-10 opacity-80 hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditArticle(art);
                        }}
                        className="p-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
                        title="Редактировать"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteArticle(art, e)}
                        className="p-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
                        title="Удалить"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips and Recommendations Modal */}
      {isTipsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full h-[94vh] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                    <span>Советы и рекомендации</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Полезные статьи, рекомендации по уходу, экономии и профилактике сантехники
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsTipsModalOpen(false);
                      handleOpenCreateArticle();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Добавить совет</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsTipsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* Search Input inside Tips Modal */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Быстрый поиск по советам и рекомендациям..."
                  value={tipsSearch}
                  onChange={(e) => setTipsSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
                {tipsSearch && (
                  <button
                    type="button"
                    onClick={() => setTipsSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tips List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {articles
                  .filter((art) => art.type === 'guide' || art.type === 'article')
                  .filter((art) => {
                    if (!tipsSearch.trim()) return true;
                    const q = tipsSearch.toLowerCase();
                    return (
                      art.title.toLowerCase().includes(q) ||
                      art.description.toLowerCase().includes(q) ||
                      (art.steps && art.steps.some((s) => s.title.toLowerCase().includes(q)))
                    );
                  })
                  .map((art) => (
                    <div
                      key={art.id}
                      onClick={() => {
                        setIsTipsModalOpen(false);
                        onSelectArticle(art);
                      }}
                      className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 transition cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-amber-500/10 active:scale-[0.99] relative"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {art.type === 'guide' ? 'Рекомендация' : 'Полезный совет'}
                          </span>

                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-medium text-amber-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3 inline" />
                              <span>{art.timeEst}</span>
                            </span>

                            {isAdmin && (
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsTipsModalOpen(false);
                                    handleOpenEditArticle(art);
                                  }}
                                  className="p-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold transition"
                                  title="Редактировать"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteArticle(art, e)}
                                  className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h3 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                          {art.title}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {art.description}
                        </p>

                        {/* Step Images Preview */}
                        {art.steps && art.steps.some((s) => s.imageUrl) && (
                          <div className="pt-2 flex items-center space-x-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <div className="flex items-center space-x-1 overflow-hidden">
                              {art.steps
                                .filter((s) => s.imageUrl)
                                .slice(0, 4)
                                .map((s, idx) => (
                                  <img
                                    key={idx}
                                    src={s.imageUrl}
                                    alt={`Шаг ${s.number}`}
                                    title={`Иллюстрация к шагу ${s.number}`}
                                    className="w-8 h-8 object-cover rounded-md border border-slate-800 shrink-0 shadow-sm"
                                  />
                                ))}
                              {art.steps.filter((s) => s.imageUrl).length > 4 && (
                                <span className="text-[10px] text-amber-300 font-extrabold bg-slate-950 px-1.5 py-1 rounded-md border border-slate-800">
                                  +{art.steps.filter((s) => s.imageUrl).length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[11px] text-slate-500">{art.difficulty}</span>
                        <span className="text-amber-400 font-extrabold flex items-center space-x-1 group-hover:translate-x-1 transition">
                          <span>Читать совет</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Article / Instruction Editor Modal */}
      {isEditorModalOpen && (
        <ArticleEditorModal
          isOpen={isEditorModalOpen}
          onClose={() => setIsEditorModalOpen(false)}
          articleToEdit={articleToEdit}
          onRefreshArticles={onRefreshArticles}
        />
      )}
    </div>
  );
};
