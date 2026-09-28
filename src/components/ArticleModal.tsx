import React, { useState } from 'react';
import {
  X,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Wrench,
  Package,
  User,
  Eye,
  ThumbsUp,
  Share2,
  Edit,
  ShieldCheck,
  Volume2,
  MapPin,
  Award,
  Users,
  Image as ImageIcon,
  ArrowRightLeft,
  Check,
  XCircle,
  ShieldAlert,
  Bookmark,
  Crown,
  Lock,
  Sparkles,
  Heart,
} from 'lucide-react';
import { Article, ArticleStep } from '../types';
import { useAuth } from '../context/AuthContext';
import { resolveDualPlatformVideos } from '../utils/videoUtils';
import { RepairMasterRecommendation } from './RepairMasterRecommendation';
import { updatePageSeoMetadata, generateHowToSchema } from '../utils/seoManager';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  onLike: (id: string) => void;
  isAdmin?: boolean;
  onEditArticle?: (article: Article) => void;
  onOpenPurchase?: (article: Article) => void;
  onOpenCabinet?: () => void;
  onOpenDonation?: () => void;
  selectedCity?: string;
  specialistsCountInCity?: number;
  onCallMasterForArticle?: (article: Article) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onLike,
  isAdmin,
  onEditArticle,
  onOpenCabinet,
  onOpenDonation,
  selectedCity = 'Москва',
  specialistsCountInCity = 4,
  onCallMasterForArticle,
}) => {
  const { currentUser, isFavorite, toggleFavorite, openAuthModal } = useAuth();
  const isBookmarked = isFavorite(article.id);
  const [favoriteToast, setFavoriteToast] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [checkedTools, setCheckedTools] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(article.likes);
  const [activeComparisonTab, setActiveComparisonTab] = useState<'turns' | 'joints' | 'sealing'>('turns');

  // Dynamic SEO indexing and Schema.org HowTo rich snippet injection
  React.useEffect(() => {
    updatePageSeoMetadata({
      title: `${article.title} — Пошаговая инструкция и видеоурок | СантехПро`,
      description: `Пошаговое руководство: ${article.title}. Необходимые инструменты, схемы, видеоуроки, советы экспертов. Вызов проверенных мастеров в г. ${selectedCity}.`,
      canonicalUrl: `/?article=${encodeURIComponent(article.id)}`,
      ogType: 'article',
      ogImage: article.imageUrl,
      structuredData: generateHowToSchema(article),
    });
  }, [article, selectedCity]);

  const dualVideo = resolveDualPlatformVideos(article);
  const hasVideo = Boolean(article.type === 'video' || article.videoEmbed || article.videoUrl || article.rutubeUrl || article.youtubeUrl);
  const [selectedVideoPlatform, setSelectedVideoPlatform] = useState<'rutube' | 'youtube' | 'direct'>(dualVideo.defaultPlatform);

  React.useEffect(() => {
    setSelectedVideoPlatform(dualVideo.defaultPlatform);
  }, [article.id, dualVideo.defaultPlatform]);

  const toggleStep = (stepNum: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const toggleTool = (tool: string) => {
    setCheckedTools((prev) => ({ ...prev, [tool]: !prev[tool] }));
  };

  const getStepImage = (step: ArticleStep, idx: number): string => {
    if (step.imageUrl) return step.imageUrl;

    const text = (step.title + ' ' + step.text).toLowerCase();

    const imageBank = {
      soldering: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
      cutting: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      mixer: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      meter: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      valves: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
      tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80',
      toilet: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      heating: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      drains: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80',
    };

    if (text.includes('пайк') || text.includes('нагрев') || text.includes('паяльн') || text.includes('свар')) {
      return imageBank.soldering;
    }
    if (text.includes('отрез') || text.includes('нарез') || text.includes('ножниц') || text.includes('труборез') || text.includes('фаск')) {
      return imageBank.cutting;
    }
    if (text.includes('смесител') || text.includes('излив') || text.includes('картридж') || text.includes('мойк') || text.includes('раковин')) {
      return imageBank.mixer;
    }
    if (text.includes('счётчик') || text.includes('счетчик') || text.includes('водомер') || text.includes('давлен') || text.includes('манометр')) {
      return imageBank.meter;
    }
    if (text.includes('коллектор') || text.includes('гребенк') || text.includes('кран') || text.includes('вентил') || text.includes('фитинг')) {
      return imageBank.valves;
    }
    if (text.includes('унитаз') || text.includes('инсталляц') || text.includes('бачок') || text.includes('ванн') || text.includes('душ')) {
      return imageBank.toilet;
    }
    if (text.includes('батаре') || text.includes('радиатор') || text.includes('отоплен')) {
      return imageBank.heating;
    }
    if (text.includes('сифон') || text.includes('слив') || text.includes('канализац') || text.includes('засор')) {
      return imageBank.drains;
    }
    if (text.includes('ключ') || text.includes('перфоратор') || text.includes('отвертк') || text.includes('инструмент')) {
      return imageBank.tools;
    }

    const fallbacks = [
      article.coverImage || imageBank.valves,
      imageBank.cutting,
      imageBank.tools,
      imageBank.valves,
      imageBank.soldering,
    ];

    return fallbacks[idx % fallbacks.length];
  };

  const handleLikeClick = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      onLike(article.id);
    }
  };

  const handleToggleFavorite = async () => {
    const isNowFav = await toggleFavorite(article);
    setFavoriteToast(isNowFav ? 'Добавлено в избранное' : 'Удалено из избранного');
    setTimeout(() => {
      setFavoriteToast(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full h-[94vh] max-h-[94vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Toast notification */}
        {favoriteToast && (
          <div className="absolute top-16 right-6 z-50 bg-slate-900/95 border border-cyan-500/40 text-cyan-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 flex items-center space-x-1.5">
            <Bookmark className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
            <span>{favoriteToast}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                article.adminSection === 'courses' || article.type === 'video'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {article.adminSection === 'courses' ? '🎓 Курс по сантехнике' : article.type === 'video' ? '📺 Видеоурок' : '📖 Статья-инструкция'}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {article.difficulty}
            </span>
            {article.certificate && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>Сертификат</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isAdmin && onEditArticle && (
              <button
                onClick={() => {
                  onClose();
                  onEditArticle(article);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-sm"
              >
                <Edit className="w-3.5 h-3.5 text-slate-950" />
                <span>Редактировать</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleFavorite}
              title={isBookmarked ? 'Удалить из избранного' : 'Добавить в избранное'}
              className={`px-2.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer text-xs font-semibold ${
                isBookmarked
                  ? 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-400 text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">
                {isBookmarked ? 'В избранном' : 'В избранное'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {favoriteToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-2xl backdrop-blur-md animate-fade-in flex items-center space-x-2">
            <span>{favoriteToast}</span>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Cover / Dual Video Player (RuTube & YouTube) & Header */}
          {hasVideo ? (
            <div className="space-y-3">
              {/* Dual Video Platform Switcher */}
              <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between flex-wrap gap-2 shadow-sm">
                <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedVideoPlatform('rutube')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                      selectedVideoPlatform === 'rutube'
                        ? 'bg-red-600 text-white shadow-md ring-2 ring-red-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>🇷🇺 RuTube</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950/60 font-semibold border border-red-500/40">
                      РФ без VPN
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedVideoPlatform('youtube')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                      selectedVideoPlatform === 'youtube'
                        ? 'bg-rose-700 text-white shadow-md ring-2 ring-rose-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>▶️ YouTube</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      Global HD
                    </span>
                  </button>

                  {dualVideo.directVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedVideoPlatform('direct')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                        selectedVideoPlatform === 'direct'
                          ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span>☁️ Облачный CDN</span>
                      <span className="text-[10px] opacity-80 font-normal">1080p</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>
                    {selectedVideoPlatform === 'rutube'
                      ? 'Трансляция через официальный CDN RuTube'
                      : selectedVideoPlatform === 'direct'
                      ? 'Прямой облачный видеопоток высокой четкости'
                      : 'Трансляция через YouTube'}
                  </span>
                </div>
              </div>

              {/* Video Player Frame */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl relative">
                {selectedVideoPlatform === 'direct' && dualVideo.directVideoUrl ? (
                  <video
                    src={dualVideo.directVideoUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={selectedVideoPlatform === 'rutube' ? dualVideo.rutubeEmbed! : dualVideo.youtubeEmbed!}
                    title={article.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center space-x-2 flex-wrap gap-1 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                    Видеокурс
                  </span>
                  {article.difficulty && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {article.difficulty}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug tracking-tight">
                  {article.title}
                </h1>
                {article.description && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {article.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between shadow-sm">
              {/* Text Section: Separated cleanly with crisp typography */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                    {article.type === 'video' ? 'Видеокурс' : 'Пошаговая инструкция'}
                  </span>
                  {article.difficulty && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {article.difficulty}
                    </span>
                  )}
                </div>

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug tracking-tight">
                  {article.title}
                </h1>

                {article.description && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {article.description}
                  </p>
                )}
              </div>

              {/* Compact Image: neat, reduced size, completely separated from text */}
              {article.coverImage && (
                <div className="w-full sm:w-56 md:w-64 lg:w-72 h-36 sm:h-40 shrink-0 rounded-xl overflow-hidden border border-slate-800/90 bg-slate-900 shadow-md relative group">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          )}

          {/* Audio Player Bar if audioUrl exists */}
              {article.audioUrl && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <Volume2 className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                        🎧 Голосовой курс / Аудио-лекция
                      </h3>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        {article.audioTitle || 'Аудио-сопровождение к обучающим материалам'}
                      </p>
                    </div>
                  </div>

                  <audio controls src={article.audioUrl} className="h-10 w-full sm:w-auto min-w-[280px]" />
                </div>
              )}

          {/* Meta Bar & Instructor Details */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center space-x-4 flex-wrap gap-2">
                <div className="flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-slate-200">
                    {article.author && !article.author.includes('Смирнов') && !article.author.includes('Мастеровой') && !article.author.includes('Волков') && !article.author.includes('Кузнецов') && article.author !== 'Администратор Справочника'
                      ? article.author
                      : 'Достонджон Туйчиев'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Время: {article.timeEst}</span>
                </div>
                {article.studentsCount !== undefined && (
                  <div className="flex items-center space-x-1.5 text-cyan-300">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Учеников: {article.studentsCount}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-slate-400">
                  <Eye className="w-4 h-4" />
                  <span>{article.views + 1} просмотров</span>
                </div>
                <button
                  onClick={handleLikeClick}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition ${
                    liked
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                  <span>{likesCount} Полезно</span>
                </button>
              </div>
            </div>

            {/* Instructor / Studio Location Address */}
            {article.authorAddress && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong className="text-slate-100">Адрес автора / Съёмочная мастерская:</strong> {article.authorAddress}
                </span>
              </div>
            )}
          </div>

          {/* Additional Gallery Photos if exists */}
          {article.galleryImages && article.galleryImages.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Фотогалерея материалов ({article.galleryImages.length} фото)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {article.galleryImages.map((imgUrl, i) => (
                  <a key={i} href={imgUrl} target="_blank" rel="noreferrer" className="aspect-video rounded-lg overflow-hidden border border-slate-800 hover:border-cyan-500 transition">
                    <img src={imgUrl} alt={`Фото ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Video Timestamps if video */}
          {article.type === 'video' && article.videoTimestamps && article.videoTimestamps.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                <PlayCircle className="w-4 h-4" />
                <span>Таймкоды видеоурока</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {article.videoTimestamps.map((ts, idx) => (
                  <div
                    key={idx}
                    className="flex items-baseline space-x-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300"
                  >
                    <span className="font-mono text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {ts.time}
                    </span>
                    <span className="flex-1">{ts.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Tools & Materials Checklist */}
          {(article.toolsRequired?.length || article.materialsRequired?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.toolsRequired && article.toolsRequired.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    <span>Необходимый инструмент ({article.toolsRequired.length})</span>
                  </h3>
                  <div className="space-y-1.5">
                    {article.toolsRequired.map((tool, idx) => (
                      <label
                        key={idx}
                        className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(checkedTools[tool])}
                          onChange={() => toggleTool(tool)}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 w-4 h-4"
                        />
                        <span className={checkedTools[tool] ? 'line-through text-slate-500' : ''}>
                          {tool}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {article.materialsRequired && article.materialsRequired.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>Запчасти и материалы ({article.materialsRequired.length})</span>
                  </h3>
                  <div className="space-y-1.5">
                    {article.materialsRequired.map((mat, idx) => (
                      <label
                        key={idx}
                        className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(checkedTools[mat])}
                          onChange={() => toggleTool(mat)}
                          className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span className={checkedTools[mat] ? 'line-through text-slate-500' : ''}>
                          {mat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Visual Comparison of Mounting Technologies & Route Turns */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shrink-0">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <span>Наглядное различие технологий и способов монтажа</span>
                  </h2>
                  <p className="text-xs text-slate-400">Сравнение вариантов поворотов трассы, способов соединений и уплотнения резьбы</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-slate-900 p-1 rounded-xl border border-slate-800 flex-wrap gap-y-1">
                <button
                  type="button"
                  onClick={() => setActiveComparisonTab('turns')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeComparisonTab === 'turns'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Повороты трассы
                </button>
                <button
                  type="button"
                  onClick={() => setActiveComparisonTab('joints')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeComparisonTab === 'joints'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Типы соединений
                </button>
                <button
                  type="button"
                  onClick={() => setActiveComparisonTab('sealing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeComparisonTab === 'sealing'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Уплотнение резьбы
                </button>
              </div>
            </div>

            {/* Tab 1: Route Turns Comparison */}
            {activeComparisonTab === 'turns' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
                {/* 90 degree elbow */}
                <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {article.routeTurnComparison?.turn90.title || 'Угол 90° (Острый поворот)'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {article.routeTurnComparison?.turn90.flowResistance || 'Сопротивление: КМС ξ ≈ 1.1'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg text-xs text-slate-300 space-y-1.5 border border-slate-800">
                    <div className="font-bold text-rose-400 flex items-center space-x-1.5">
                      <span>⚡ Динамика потока:</span>
                    </div>
                    <p className="leading-relaxed">
                      Удар водяной струи о стенку фитинга под углом 90°. Вызывает завихрения, потерю давления до 0.15 бар и гидравлический шум при высокой скорости воды.
                    </p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Плюсы: Компактный размер в узких сантехшкафах</span>
                    </div>
                    <div className="text-rose-400 font-bold flex items-center space-x-1.5">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Минусы: Риск застревания отложений и гидроудар</span>
                    </div>
                  </div>
                </div>

                {/* 2x45 compound elbow */}
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {article.routeTurnComparison?.turn2x45.title || 'Составной поворот 2×45°'}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {article.routeTurnComparison?.turn2x45.flowResistance || 'Сопротивление: КМС ξ ≈ 0.4 (в 2.5 раза ниже)'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg text-xs text-slate-300 space-y-1.5 border border-slate-800">
                    <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                      <span>💧 Динамика потока:</span>
                    </div>
                    <p className="leading-relaxed">
                      Плавное огибание трассы двумя полуотводами. Сохраняется ламинарный проток, полностью отсутствуют застойные зоны и гидроакустический гул.
                    </p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Плюсы: Рекомендован СНиП для главных магистралей и канализации</span>
                    </div>
                    <div className="text-slate-400 font-bold flex items-center space-x-1.5">
                      <span>Требует на 5-8 см больше монтажного пространства</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Joint Technologies */}
            {activeComparisonTab === 'joints' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-sm text-cyan-300">
                    <span>{article.jointTypeComparison?.typeA.name || 'Пресс / Аксиальная гильза (PEX/Металлопластик)'}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">В стяжку: ДА</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {article.jointTypeComparison?.typeA.pros || 'Монолитное неразъемное соединение за счет запрессовки или молекулярной памяти трубы. Срок службы 50+ лет.'}
                  </p>
                  <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Макс. давление: {article.jointTypeComparison?.typeA.maxPressure || '25 бар'}</span>
                    <span>Инструмент: Пресс-клещи / Экспандер</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-sm text-amber-300">
                    <span>{article.jointTypeComparison?.typeB.name || 'Компрессионный обжимной фитинг / Американка'}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">В стяжку: НЕТ</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {article.jointTypeComparison?.typeB.pros || 'Разъемное обслуживание. Обжим цангой с резиновыми уплотнительными кольцами. Позволяет демонтировать узлы без резки.'}
                  </p>
                  <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Макс. давление: {article.jointTypeComparison?.typeB.maxPressure || '16 бар'}</span>
                    <span>Инструмент: Рожковый / Разводной ключ</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Thread Sealing */}
            {activeComparisonTab === 'sealing' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-400 text-sm">Лен + Паста Unipak</div>
                  <p className="text-slate-300 leading-relaxed">
                    Классика сантехники. Разрешает поворачивать фитинг назад на 45° при юстировке без утраты герметичности.
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    До 140°C • Легкий демонтаж
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-400 text-sm">Анаэробный гель</div>
                  <p className="text-slate-300 leading-relaxed">
                    Быстрая полимеризация в зазоре резьбы. Выдерживает давление до 40 бар. Поворот назад строго запрещен!
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    До 150°C • Демонтаж с нагревом
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-400 text-sm">Уплотнительная нить</div>
                  <p className="text-slate-300 leading-relaxed">
                    Наматывается крест-накрест. Допускает юстировку назад до 90°. Подходит для мокрой резьбы.
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    До 130°C • Чистый монтаж
                  </div>
                </div>
              </div>
            )}

            {/* Pro Mistakes Section if available */}
            {article.proMistakes && article.proMistakes.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
                <div className="font-bold text-rose-300 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Типичные ошибки монтажа и их последствия:</span>
                </div>
                {article.proMistakes.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-rose-500/20 text-slate-200 space-y-1">
                    <div><strong className="text-rose-400">Ошибка:</strong> {m.mistake}</div>
                    <div><strong className="text-amber-400">Последствие:</strong> {m.consequence}</div>
                    <div><strong className="text-emerald-400">Как правильно:</strong> {m.fix}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step-by-step Lessons & Modules */}
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span>Модули и практические уроки ({article.steps.length})</span>
            </h2>

            <div className="space-y-4">
              {article.steps.map((step, idx) => {
                const isDone = Boolean(completedSteps[step.number]);
                const stepImg = getStepImage(step, idx);

                return (
                  <div
                    key={step.number}
                    className={`p-4 rounded-xl border transition ${
                      isDone
                        ? 'bg-slate-950/40 border-emerald-900/50 opacity-85'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {step.number}
                        </span>
                        <div>
                          <h3
                            className={`font-semibold text-base ${
                              isDone ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {step.title}
                          </h3>
                          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                            {step.text}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleStep(step.number)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                      >
                        {isDone ? '✓ Пройдено' : 'Пройти'}
                      </button>
                    </div>

                    {/* Step Audio if provided */}
                    {step.audioUrl && (
                      <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center space-x-3">
                        <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <audio controls src={step.audioUrl} className="h-8 w-full" />
                      </div>
                    )}

                    {/* Step Thematic Image */}
                    {stepImg && (
                      <div className="mt-3 group/img relative inline-block">
                        <div className="w-full max-w-xs sm:max-w-sm h-36 sm:h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md relative">
                          <img
                            src={stepImg}
                            alt={step.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition duration-300 cursor-pointer"
                            onClick={() => window.open(stepImg, '_blank')}
                            title="Нажмите для увеличения изображения"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[10px] text-cyan-300 font-semibold flex items-center space-x-1">
                            <ImageIcon className="w-3 h-3 text-cyan-400" />
                            <span>Шаг #{step.number}</span>
                          </div>
                        </div>
                        <div className="mt-1.5 flex items-center space-x-1 text-[11px] text-slate-400">
                          <ImageIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>Наглядная иллюстрация: {step.title} (нажмите для увеличения)</span>
                        </div>
                      </div>
                    )}

                    {/* Step Warning box */}
                    {step.warning && (
                      <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Внимание: </span>
                          <span>{step.warning}</span>
                        </div>
                      </div>
                    )}

                    {/* Step Tip box */}
                    {step.tip && (
                      <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Совет мастера: </span>
                          <span>{step.tip}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contextual Master Recommendation for Repair Guide (SEO Conversion Bridge) */}
          <div className="mt-8">
            <RepairMasterRecommendation
              repairTitle={article.title}
              selectedCity={selectedCity}
              specialistsCount={specialistsCountInCity}
              onFindMaster={() => {
                if (onCallMasterForArticle) {
                  onCallMasterForArticle(article);
                }
              }}
              onRequestCall={() => {
                if (onCallMasterForArticle) {
                  onCallMasterForArticle(article);
                }
              }}
            />
          </div>

          {/* Voluntary Support / Donation Banner */}
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-rose-500/30 shadow-lg space-y-3">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-rose-400 text-rose-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-white">Понравилась инструкция?</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 uppercase">
                    Бесплатно
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  «СантехПро» полностью открыт и бесплатен для каждого. Если схема или урок помогли вам в ремонте или работе, вы можете добровольно поддержать автора любой комфортной суммой на развитие проекта и добавление новых материалов.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Добровольная поддержка на оплату серверов, хостинга и съёмку видео
              </div>

              {onOpenDonation && (
                <button
                  type="button"
                  onClick={onOpenDonation}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-rose-950/50 flex items-center justify-center space-x-2 cursor-pointer shrink-0"
                >
                  <Heart className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Поддержать проект</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Курсы и Справочник сантехники Сантехник.PRO</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
