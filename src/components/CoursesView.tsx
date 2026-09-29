import React, { useState } from 'react';
import {
  GraduationCap,
  PlayCircle,
  Volume2,
  Image as ImageIcon,
  MapPin,
  Award,
  Users,
  Star,
  Plus,
  Edit,
  Trash2,
  Clock,
  ChevronRight,
  Crown,
  CheckCircle2,
  Bookmark,
  Heart,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Article, PlumbingSpecialist } from '../types';
import { ArticleEditorModal } from './ArticleEditorModal';
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
  onSearchQueryChange,
  onOpenDonation,
  currentMaster,
  isVerifiedMaster,
  onNavigateToCabinet,
}) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'certificate' | 'my'>('all');
  
  // Admin / Master Article Editor modal state
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);

  const handleOpenCreateCourse = () => {
    // Preset adminSection to 'courses' for new course materials
    setArticleToEdit({
      adminSection: 'courses',
      type: 'video',
      authorMasterId: currentMaster?.id,
      author: currentMaster ? currentMaster.name : undefined,
      authorAddress: currentMaster?.city ? `г. ${currentMaster.city}, Мастерская СантехПро` : undefined,
    } as Article);
    setIsEditorModalOpen(true);
  };

  const handleOpenEditCourse = (art: Article) => {
    setArticleToEdit(art);
    setIsEditorModalOpen(true);
  };

  const handleDeleteCourse = async (art: Article, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Вы действительно хотите удалить курс "${art.title}"?`)) return;

    try {
      const res = await fetch(`/api/articles/${art.id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshArticles();
      } else {
        alert('Не удалось удалить курс');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при удалении');
    }
  };

  // Filter articles that belong to courses (or are video/audio training materials)
  const coursesList = articles.filter((art) => {
    // Only approved articles or system articles are visible to regular users, but master sees their own pending course
    if (art.moderationStatus && art.moderationStatus !== 'approved' && !isAdmin) {
      if (!currentMaster || art.authorMasterId !== currentMaster.id) {
        return false;
      }
    }

    const isCourse = art.adminSection === 'courses' || art.type === 'video' || Boolean(art.audioUrl);
    if (!isCourse) return false;

    if (filterType === 'video' && !(art.type === 'video' || Boolean(art.videoUrl) || Boolean(art.videoEmbed))) return false;
    if (filterType === 'audio' && !art.audioUrl) return false;
    if (filterType === 'certificate' && !art.certificate) return false;
    if (filterType === 'my' && currentMaster && art.authorMasterId !== currentMaster.id) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesTitle = art.title.toLowerCase().includes(q);
      const matchesDesc = art.description.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc) return false;
    }

    return true;
  });

  const myCoursesCount = currentMaster ? articles.filter((a) => a.authorMasterId === currentMaster.id && (a.adminSection === 'courses' || a.type === 'video')).length : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Курсы и видеоуроки по сантехнике</span>
            {isVerifiedMaster && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hidden md:inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Авторский доступ</span>
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Обучающие видеокурсы, практические видеоуроки, аудиолекции и программы обучения от экспертов
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto flex-wrap gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenCreateCourse}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition flex items-center justify-center space-x-1.5 shadow-md"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Добавить курс (Админ)</span>
            </button>
          )}

          {isVerifiedMaster && (
            <button
              type="button"
              onClick={handleOpenCreateCourse}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-extrabold text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-rose-500/20"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Опубликовать курс / видеоурок</span>
            </button>
          )}

          {!isVerifiedMaster && currentMaster && currentMaster.status === 'pending' && onNavigateToCabinet && (
            <button
              type="button"
              onClick={onNavigateToCabinet}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Верификация на проверке</span>
            </button>
          )}

          {!isVerifiedMaster && !currentMaster && onNavigateToCabinet && (
            <button
              type="button"
              onClick={onNavigateToCabinet}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Для мастеров: стать автором курсов</span>
            </button>
          )}
        </div>
      </div>

      {/* Information Banner for verified masters and audience */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-850 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-white text-xs sm:text-sm">
                Публикация контента для проверенных мастеров
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                ✓ VK Видео • RuTube / Restore • YouTube
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">
              Специалисты после верификации могут транслировать объемные обучающие видео, аудиолекции и пошаговые инструкции. Материалы публикуются после предварительного одобрения администратором.
            </p>
          </div>
        </div>

        {isVerifiedMaster && (
          <button
            type="button"
            onClick={handleOpenCreateCourse}
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Предложить видеоурок</span>
          </button>
        )}
      </div>

      {/* Filter Badges */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <span className="text-xs text-slate-400 font-semibold mr-2">Фильтр:</span>

        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'all'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          Все материалы ({articles.filter((a) => a.adminSection === 'courses' || a.type === 'video' || Boolean(a.audioUrl)).length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('video')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            filterType === 'video'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Видеоуроки</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('audio')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            filterType === 'audio'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Аудиокурсы</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('certificate')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            filterType === 'certificate'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>С сертификатом</span>
        </button>

        {currentMaster && myCoursesCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterType('my')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              filterType === 'my'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-cyan-300 hover:bg-slate-800 border border-cyan-500/30'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Мои курсы ({myCoursesCount})</span>
          </button>
        )}
      </div>

      {/* Courses Cards Grid */}
      {coursesList.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Курсы по выбранному фильтру не найдены</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Нажмите "Все курсы" или переключите фильтр выше.
          </p>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            Показать все курсы
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {coursesList.map((course) => (
            <div
              key={course.id}
              onClick={() => onSelectArticle(course)}
              className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition duration-300 overflow-hidden cursor-pointer flex flex-col justify-between shadow-lg relative"
            >
              <div>
                {/* Media Header / Cover */}
                <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-950">
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2 flex-wrap gap-y-1 z-10">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-lg flex items-center space-x-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>КУРС</span>
                    </span>

                    {course.moderationStatus === 'pending' ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-lg flex items-center space-x-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>На модерации</span>
                      </span>
                    ) : course.moderationStatus === 'rejected' ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-lg flex items-center space-x-1">
                        <span>Отклонен</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 shadow-lg flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Бесплатно</span>
                      </span>
                    )}

                    {course.certificate && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 backdrop-blur-md flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>С сертификатом</span>
                      </span>
                    )}
                  </div>

                  {/* Top Right: Bookmark + Admin Action Overlay */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(course);
                      }}
                      title={isFavorite(course.id) ? 'В избранном' : 'Добавить в избранное'}
                      className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white transition shadow-lg"
                    >
                      <Bookmark className={`w-4 h-4 ${isFavorite(course.id) ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                    </button>

                    {(isAdmin || (currentMaster && course.authorMasterId === currentMaster.id)) && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditCourse(course);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg flex items-center space-x-1"
                          title="Редактировать курс"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Изменить</span>
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCourse(course, e)}
                            className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg"
                            title="Удалить курс"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Play / Media Indicators */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      {course.type === 'video' && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700 text-rose-300 font-semibold flex items-center space-x-1">
                          <PlayCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Видеоурок</span>
                        </span>
                      )}

                      {(course.rutubeUrl || (course.videoUrl && course.videoUrl.includes('rutube'))) && (
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/25 border border-blue-400/40 text-blue-300 font-bold text-[10px] flex items-center space-x-1 backdrop-blur-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          <span>RuTube</span>
                        </span>
                      )}

                      {(course.vkVideoUrl || (course.videoUrl && (course.videoUrl.includes('vk.com') || course.videoUrl.includes('vkvideo.ru')))) && (
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/25 border border-indigo-400/40 text-indigo-300 font-bold text-[10px] flex items-center space-x-1 backdrop-blur-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          <span>VK Видео</span>
                        </span>
                      )}

                      {(course.youtubeUrl || (course.videoUrl && (course.videoUrl.includes('youtube') || course.videoUrl.includes('youtu.be')))) && (
                        <span className="px-2 py-0.5 rounded-lg bg-red-500/25 border border-red-400/40 text-red-300 font-bold text-[10px] flex items-center space-x-1 backdrop-blur-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          <span>YouTube</span>
                        </span>
                      )}

                      {course.audioUrl && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700 text-emerald-300 font-semibold flex items-center space-x-1">
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Аудио</span>
                        </span>
                      )}

                      {course.galleryImages && course.galleryImages.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700 text-cyan-300 font-semibold flex items-center space-x-1">
                          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{course.galleryImages.length} фото</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-amber-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.timeEst}</span>
                    </div>
                  </div>
                </div>

                {/* Course Content Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition line-clamp-2 leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Instructor & Address Section */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-200">
                          Автор: {course.author && !course.author.includes('Смирнов') && !course.author.includes('Мастеровой') && !course.author.includes('Волков') && !course.author.includes('Кузнецов') && course.author !== 'Администратор Справочника' ? course.author : 'Достонджон Туйчиев'}
                        </span>
                        {course.authorMasterId && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            ✓ Мастер
                          </span>
                        )}
                      </div>
                      {course.rating && (
                        <span className="flex items-center space-x-1 text-amber-400 font-extrabold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{course.rating}</span>
                        </span>
                      )}
                    </div>

                    {course.authorAddress && (
                      <div className="flex items-start space-x-1.5 text-slate-400 pt-1 border-t border-slate-800/60">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{course.authorAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Footer & Metrics */}
              <div className="p-6 pt-0">
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-cyan-300 font-medium">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{course.studentsCount || course.views || 120} учащихся</span>
                    </div>
                  </div>

                  <span className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs transition shadow-md shadow-rose-500/20 flex items-center space-x-1.5">
                    <span>Начать обучение</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditorModalOpen && (
        <ArticleEditorModal
          article={articleToEdit}
          currentMaster={currentMaster}
          isMasterSubmission={Boolean(currentMaster && !isAdmin)}
          onClose={() => {
            setIsEditorModalOpen(false);
            setArticleToEdit(null);
          }}
          onSave={() => {
            setIsEditorModalOpen(false);
            setArticleToEdit(null);
            onRefreshArticles();
          }}
        />
      )}
    </div>
  );
};
