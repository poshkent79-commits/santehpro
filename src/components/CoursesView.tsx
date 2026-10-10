import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  X,
  Sparkles,
  Bookmark,
  ThumbsUp,
  Eye,
  Wrench,
  Check,
  AlertCircle,
  Video,
  ArrowRight
} from 'lucide-react';
import { Article, PlumbingSpecialist, CategoryId } from '../types';
import { CATEGORIES } from '../data/initialData';
import { useAuth } from '../context/AuthContext';

interface CoursesViewProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  isAdmin?: boolean;
  onRefreshArticles?: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onOpenDonation?: () => void;
  currentMaster?: PlumbingSpecialist | null;
  isVerifiedMaster?: boolean;
  onNavigateToCabinet?: () => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  articles,
  onSelectArticle,
  isAdmin,
  onRefreshArticles = () => {},
  searchQuery = '',
  currentMaster,
  isVerifiedMaster,
}) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form state for adding a lifehack
  const [tipTitle, setTipTitle] = useState('');
  const [tipCategory, setTipCategory] = useState<CategoryId>('water');
  const [tipDescription, setTipDescription] = useState('');
  const [tipTools, setTipTools] = useState('');
  const [tipAuthorName, setTipAuthorName] = useState(currentMaster?.name || '');
  const [tipAuthorCity, setTipAuthorCity] = useState(currentMaster?.city || '');
  const [tipContact, setTipContact] = useState(currentMaster?.phone || currentMaster?.telegram || '');
  const [tipVideoUrl, setTipVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo IDs to explicitly exclude
  const DEMO_IDS = new Set([
    'art-0-course-ppr',
    'art-course-pro-hydraulics',
    'art-course-warm-floor',
    'art-course-electric-boiler'
  ]);

  // Filter only real lifehacks & tips from masters (adminSection === 'courses')
  const lifehacks = articles.filter((art) => {
    // Only items belonging to tips/courses section
    if (art.adminSection !== 'courses') return false;
    // Exclude demo versions
    if (DEMO_IDS.has(art.id)) return false;

    // Moderation check: regular users only see approved lifehacks.
    // The author (master) can see their own pending item, and admin sees all.
    if (art.moderationStatus && art.moderationStatus !== 'approved' && !isAdmin) {
      if (!currentMaster || art.authorMasterId !== currentMaster.id) {
        return false;
      }
    }

    if (selectedCategoryFilter !== 'all' && art.category !== selectedCategoryFilter) {
      return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesTitle = art.title.toLowerCase().includes(q);
      const matchesDesc = (art.description || '').toLowerCase().includes(q);
      const matchesAuthor = (art.author || '').toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesAuthor) return false;
    }

    return true;
  });

  const handleOpenAddModal = () => {
    setTipTitle('');
    setTipCategory('water');
    setTipDescription('');
    setTipTools('');
    setTipAuthorName(currentMaster?.name || '');
    setTipAuthorCity(currentMaster?.city || '');
    setTipContact(currentMaster?.phone || currentMaster?.telegram || '');
    setTipVideoUrl('');
    setIsAddModalOpen(true);
  };

  const handleSubmitLifehack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipTitle.trim()) {
      alert('Пожалуйста, укажите краткое название совета или лайфхака');
      return;
    }
    if (!tipDescription.trim()) {
      alert('Пожалуйста, опишите суть лайфхака или профессиональной хитрости');
      return;
    }

    setIsSubmitting(true);
    try {
      const author = tipAuthorName.trim() || (currentMaster ? currentMaster.name : 'Мастер сантехник');
      const authorAddress = tipAuthorCity.trim() ? `г. ${tipAuthorCity.trim()}` : undefined;
      const tools = tipTools.split(',').map((t) => t.trim()).filter(Boolean);

      const newTip: Partial<Article> = {
        id: `tip-${Date.now()}`,
        title: tipTitle.trim(),
        category: tipCategory,
        type: 'article',
        adminSection: 'courses',
        accessType: 'free',
        difficulty: 'Новичок',
        timeEst: '3 мин',
        description: tipDescription.trim(),
        author,
        authorAddress,
        authorMasterId: currentMaster?.id,
        toolsRequired: tools.length > 0 ? tools : undefined,
        videoUrl: tipVideoUrl.trim() || undefined,
        views: 1,
        likes: 0,
        createdAt: new Date().toISOString().split('T')[0],
        moderationStatus: isAdmin ? 'approved' : 'pending',
        isPublished: Boolean(isAdmin),
        steps: [
          {
            number: 1,
            title: 'Суть совета',
            text: tipDescription.trim(),
            tip: tipTools.trim() ? `Необходимый инструмент/материалы: ${tipTools.trim()}` : undefined
          }
        ]
      };

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTip)
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setSuccessToast(
          isAdmin
            ? 'Лайфхак успешно добавлен и опубликован!'
            : 'Спасибо! Ваш лайфхак отправлен на модерацию администратору. После проверки он появится в разделе.'
        );
        setTimeout(() => setSuccessToast(null), 6000);
        onRefreshArticles();
      } else {
        alert('Не удалось отправить совет на модерацию. Попробуйте еще раз.');
      }
    } catch (err) {
      console.error('Failed to submit tip:', err);
      alert('Ошибка при отправке совета на модерацию');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (art: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/articles/${art.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderationStatus: 'approved', isPublished: true })
      });
      if (res.ok) {
        setSuccessToast(`Совет "${art.title}" одобрен и опубликован!`);
        setTimeout(() => setSuccessToast(null), 4000);
        onRefreshArticles();
      } else {
        alert('Не удалось одобрить совет');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при одобрении');
    }
  };

  const handleDelete = async (art: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Вы действительно хотите удалить совет "${art.title}"?`)) return;
    try {
      const res = await fetch(`/api/articles/${art.id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshArticles();
      } else {
        alert('Не удалось удалить совет');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при удалении');
    }
  };

  const getCategoryName = (catId: CategoryId) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat ? cat.name : 'Сантехника';
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-400 hover:text-emerald-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Минималистичный текстовый баннер */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
              Мастера могут добавлять сюда свои лайфхаки и профессиональные секреты
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span>Публикация происходит после проверки и модерации администратором</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="shrink-0 px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold text-xs transition flex items-center gap-1.5 shadow-sm shadow-amber-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
          <span>Добавить лайфхак</span>
        </button>
      </div>

      {/* Categories Filter (only shown if there are items to filter) */}
      {lifehacks.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
              selectedCategoryFilter === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
            }`}
          >
            Все ({lifehacks.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = lifehacks.filter((a) => a.category === cat.id).length;
            if (count === 0 && selectedCategoryFilter !== cat.id) return null;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                }`}
              >
                {cat.name} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Real Approved / Pending Lifehacks */}
      {lifehacks.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-500 flex items-center justify-center mb-1">
            <Lightbulb className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Пока нет опубликованных лайфхаков</p>
          <p className="text-xs text-slate-500 max-w-sm">
            Мастера могут нажать кнопку выше и поделиться проверенной хитростью. Совет появится в каталоге после проверки администратором.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lifehacks.map((tip) => {
            const isAuthor = currentMaster && tip.authorMasterId === currentMaster.id;
            const isPending = tip.moderationStatus === 'pending';

            return (
              <div
                key={tip.id}
                onClick={() => onSelectArticle(tip)}
                className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition duration-200 cursor-pointer flex flex-col justify-between shadow-sm relative"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {getCategoryName(tip.category)}
                      </span>

                      {isPending ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>На модерации</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Проверено</span>
                        </span>
                      )}

                      {tip.videoUrl && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <Video className="w-3 h-3 text-rose-400" />
                          <span>Видео</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(tip);
                        }}
                        title={isFavorite(tip.id) ? 'В избранном' : 'В избранное'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isFavorite(tip.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>

                      {(isAdmin || isAuthor) && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(tip, e)}
                          title="Удалить"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-2 mb-1.5">
                    {tip.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                    {tip.description}
                  </p>
                </div>

                {/* Footer with Master & Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-slate-300 truncate">
                      {tip.author || 'Мастер'}
                    </span>
                    {tip.authorAddress && (
                      <span className="text-slate-500 text-[10px] truncate">
                        • {tip.authorAddress}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isAdmin && isPending && (
                      <button
                        type="button"
                        onClick={(e) => handleApprove(tip, e)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] transition flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-slate-950" />
                        <span>Одобрить</span>
                      </button>
                    )}

                    <span className="text-amber-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5 font-bold">
                      <span>Читать</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Lifehack by Master (with moderation notice) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white">
                    Добавить совет / лайфхак
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Поделитесь профессиональным опытом с коллегами
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Moderation Notice Banner */}
            <div className="px-4 sm:px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Модерация перед публикацией: </span>
                <span className="text-amber-200/90">
                  Все добавленные советы и лайфхаки проходят обязательную проверку администратором перед тем, как появиться в общем списке.
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitLifehack} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Название лайфхака или совета <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tipTitle}
                  onChange={(e) => setTipTitle(e.target.value)}
                  placeholder="Например: Как аккуратно согнуть трубу PEX без залома"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Категория <span className="text-amber-400">*</span>
                </label>
                <select
                  value={tipCategory}
                  onChange={(e) => setTipCategory(e.target.value as CategoryId)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 transition text-xs"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Суть лайфхака / Тонкости работы <span className="text-amber-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={tipDescription}
                  onChange={(e) => setTipDescription(e.target.value)}
                  placeholder="Опишите хитрость, пошаговые действия, чего делать нельзя и почему этот способ работает лучше..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Используемый инструмент или материалы (по желанию)
                </label>
                <input
                  type="text"
                  value={tipTools}
                  onChange={(e) => setTipTools(e.target.value)}
                  placeholder="Например: Пружинный кондуктор, строительный фен, силиконовая смазка"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Имя мастера / Автора
                  </label>
                  <input
                    type="text"
                    value={tipAuthorName}
                    onChange={(e) => setTipAuthorName(e.target.value)}
                    placeholder="Например: Иван Сантехник"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Город мастера
                  </label>
                  <input
                    type="text"
                    value={tipAuthorCity}
                    onChange={(e) => setTipAuthorCity(e.target.value)}
                    placeholder="Например: Москва, Находка..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ссылка на видео или фото (VK Видео, RuTube, YouTube — по желанию)
                </label>
                <input
                  type="url"
                  value={tipVideoUrl}
                  onChange={(e) => setTipVideoUrl(e.target.value)}
                  placeholder="https://vk.com/video... или https://rutube.ru/video/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Отправка...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                      <span>{isAdmin ? 'Опубликовать (Админ)' : 'Отправить на модерацию'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
