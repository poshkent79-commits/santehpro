import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Eye,
  Camera,
  FileText,
  AlertTriangle,
  User,
  Calendar,
  Filter,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { MasterWork, Article, PlumbingSpecialist } from '../types';
import { WorkGalleryModal } from './WorkGalleryModal';

interface AdminModerationManagerProps {
  specialists?: PlumbingSpecialist[];
  onRefreshArticles?: () => void;
  onRefreshSpecialists?: () => void;
  onSelectArticle?: (article: Article) => void;
}

export const AdminModerationManager: React.FC<AdminModerationManagerProps> = ({
  specialists = [],
  onRefreshArticles,
  onRefreshSpecialists,
  onSelectArticle,
}) => {
  const [subTab, setSubTab] = useState<'works' | 'articles'>('works');

  // Works state
  const [works, setWorks] = useState<MasterWork[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [worksFilter, setWorksFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [activeGalleryWork, setActiveGalleryWork] = useState<MasterWork | null>(null);

  // Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articlesFilter, setArticlesFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Moderation comment modal / prompt
  const [rejectingWorkId, setRejectingWorkId] = useState<string | null>(null);
  const [rejectingArticleId, setRejectingArticleId] = useState<string | null>(null);
  const [moderationComment, setModerationComment] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const showMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Fetch Master Works
  const fetchWorks = async () => {
    setLoadingWorks(true);
    try {
      const res = await fetch('/api/master-works?all=true');
      if (res.ok) {
        const data = await res.json();
        setWorks(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load master works for moderation:', e);
    } finally {
      setLoadingWorks(false);
    }
  };

  // Fetch Master Articles
  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const res = await fetch('/api/articles?admin=true');
      if (res.ok) {
        const data: Article[] = await res.json();
        // Filter articles created by masters or having moderationStatus
        const masterArts = data.filter(
          (a) => Boolean(a.authorMasterId) || a.moderationStatus === 'pending'
        );
        setArticles(masterArts);
      }
    } catch (e) {
      console.error('Failed to load master articles for moderation:', e);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    fetchWorks();
    fetchArticles();
  }, []);

  // Moderate Work (Approve / Reject)
  const handleModerateWork = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/master-works/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          moderationComment: status === 'rejected' ? moderationComment : undefined,
        }),
      });

      if (res.ok) {
        showMessage(status === 'approved' ? 'Работа мастера одобрена и опубликована!' : 'Работа мастера отклонена.');
        setRejectingWorkId(null);
        setModerationComment('');
        fetchWorks();
        if (onRefreshSpecialists) onRefreshSpecialists();
      }
    } catch (e) {
      console.error('Failed to moderate master work:', e);
    }
  };

  // Delete Work
  const handleDeleteWork = async (id: string) => {
    if (!window.confirm('Удалить эту работу из базы данных?')) return;
    try {
      const res = await fetch(`/api/master-works/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('Работа успешно удалена.');
        fetchWorks();
      }
    } catch (e) {
      console.error('Failed to delete work:', e);
    }
  };

  // Moderate Article
  const handleModerateArticle = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/articles/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderationStatus: status,
          isPublished: status === 'approved',
          moderationComment: status === 'rejected' ? moderationComment : undefined,
        }),
      });

      if (res.ok) {
        showMessage(status === 'approved' ? 'Статья мастера одобрена и опубликована в Справочнике!' : 'Статья мастера отклонена.');
        setRejectingArticleId(null);
        setModerationComment('');
        fetchArticles();
        if (onRefreshArticles) onRefreshArticles();
      }
    } catch (e) {
      console.error('Failed to moderate article:', e);
    }
  };

  // Filtered lists
  const filteredWorks = works.filter((w) => {
    if (worksFilter === 'all') return true;
    return w.status === worksFilter;
  });

  const pendingWorksCount = works.filter((w) => w.status === 'pending').length;

  const filteredArticles = articles.filter((a) => {
    if (articlesFilter === 'all') return true;
    return (a.moderationStatus || 'approved') === articlesFilter;
  });

  const pendingArticlesCount = articles.filter((a) => a.moderationStatus === 'pending').length;

  return (
    <div id="admin-moderation-manager" className="space-y-6">
      {/* Toast */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Sub tabs & Counts */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-3xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('works')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              subTab === 'works'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Портфолио мастеров (до 10 фото)</span>
            {pendingWorksCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-slate-950 font-black animate-pulse">
                {pendingWorksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('articles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              subTab === 'articles'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Статьи мастеров (повышенный рейтинг)</span>
            {pendingArticlesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-400 text-slate-950 font-black animate-pulse">
                {pendingArticlesCount}
              </span>
            )}
          </button>
        </div>

        {subTab === 'works' ? (
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setWorksFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                worksFilter === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
              }`}
            >
              Ожидают проверки ({pendingWorksCount})
            </button>
            <button
              onClick={() => setWorksFilter('approved')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                worksFilter === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
              }`}
            >
              Одобренные
            </button>
            <button
              onClick={() => setWorksFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                worksFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Все ({works.length})
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setArticlesFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                articlesFilter === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
              }`}
            >
              Ожидают проверки ({pendingArticlesCount})
            </button>
            <button
              onClick={() => setArticlesFilter('approved')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                articlesFilter === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
              }`}
            >
              Опубликованные
            </button>
            <button
              onClick={() => setArticlesFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                articlesFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Все ({articles.length})
            </button>
          </div>
        )}
      </div>

      {/* WORKS MODERATION TAB */}
      {subTab === 'works' && (
        <div className="space-y-4">
          {loadingWorks ? (
            <div className="p-12 text-center text-sm text-slate-400">
              Загрузка выполненных работ мастеров...
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <Camera className="w-12 h-12 mx-auto text-slate-500" />
              <h4 className="text-base font-bold text-white">
                Нет работ в данной категории
              </h4>
              <p className="text-xs text-slate-400">
                Все новые загруженные мастерами фотографии и описания работ поступают сюда для модерации.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredWorks.map((work) => {
                const photos = work.photos || [];
                const isPending = work.status === 'pending';

                return (
                  <div
                    key={work.id}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Master info header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {work.specialistName}
                            </span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-400">{work.completedAt}</span>
                          </div>
                          <h4 className="text-base font-bold text-white mt-1">
                            {work.title}
                          </h4>
                        </div>

                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                            work.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : work.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {work.status === 'approved'
                            ? 'Одобрено'
                            : work.status === 'rejected'
                            ? 'Отклонено'
                            : 'Ожидает модерации'}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                        {work.description}
                      </p>

                      {/* Photos grid (up to 15) */}
                      <div className="mt-3.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                          <span>Прикрепленные фотографии: {photos.length} из 15</span>
                          <button
                            type="button"
                            onClick={() => setActiveGalleryWork(work)}
                            className="text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Открыть в галерее
                          </button>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                          {photos.slice(0, 10).map((p, idx) => (
                            <div
                              key={idx}
                              onClick={() => setActiveGalleryWork(work)}
                              className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 cursor-pointer group"
                            >
                              <img
                                src={p}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                              />
                              {idx === 9 && photos.length > 10 && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-bold text-white">
                                  +{photos.length - 10}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reject Comment Box if open */}
                    {rejectingWorkId === work.id && (
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-red-500/30 space-y-2">
                        <label className="block text-xs font-semibold text-slate-300">
                          Причина отклонения (будет показана мастеру в кабинете):
                        </label>
                        <input
                          type="text"
                          value={moderationComment}
                          onChange={(e) => setModerationComment(e.target.value)}
                          placeholder="Например: Недостаточно четкие фотографии узла ввода..."
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setRejectingWorkId(null)}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={() => handleModerateWork(work.id, 'rejected')}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
                          >
                            Подтвердить отклонение
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleDeleteWork(work.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Удалить из базы"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2">
                        {work.status !== 'rejected' && (
                          <button
                            onClick={() => {
                              setRejectingWorkId(work.id);
                              setModerationComment('');
                            }}
                            className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition"
                          >
                            Отклонить
                          </button>
                        )}

                        {work.status !== 'approved' && (
                          <button
                            onClick={() => handleModerateWork(work.id, 'approved')}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Одобрить и опубликовать
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
      )}

      {/* ARTICLES MODERATION TAB */}
      {subTab === 'articles' && (
        <div className="space-y-4">
          {loadingArticles ? (
            <div className="p-12 text-center text-sm text-slate-400">
              Загрузка авторских статей мастеров...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <FileText className="w-12 h-12 mx-auto text-slate-500" />
              <h4 className="text-base font-bold text-white">
                Нет статей для модерации
              </h4>
              <p className="text-xs text-slate-400">
                Статьи, написанные мастерами с повышенным рейтингом (4.8+), появляются здесь для проверки администратором перед публикацией в общем справочнике.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={art.coverImage}
                        alt=""
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            {art.author}
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-400">{art.createdAt}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-0.5">
                          {art.title}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                        art.moderationStatus === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : art.moderationStatus === 'rejected'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {art.moderationStatus === 'approved'
                        ? 'Опубликовано'
                        : art.moderationStatus === 'rejected'
                        ? 'Отклонено'
                        : 'Ожидает модерации'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {art.description}
                  </p>

                  {/* Steps preview */}
                  {art.steps && art.steps.length > 0 && (
                    <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs space-y-2">
                      <span className="font-semibold text-slate-400">
                        Пошаговое руководство ({art.steps.length} шагов):
                      </span>
                      <div className="space-y-1 text-slate-300">
                        {art.steps.slice(0, 3).map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 font-mono font-bold">#{idx + 1}</span>
                            <span className="font-semibold text-white">{step.title}:</span>
                            <span className="text-slate-400 line-clamp-1">{step.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    {onSelectArticle && (
                      <button
                        onClick={() => onSelectArticle(art)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Предпросмотр полной статьи
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      {art.moderationStatus !== 'rejected' && (
                        <button
                          onClick={() => handleModerateArticle(art.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition"
                        >
                          Отклонить
                        </button>
                      )}

                      {art.moderationStatus !== 'approved' && (
                        <button
                          onClick={() => handleModerateArticle(art.id, 'approved')}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Одобрить и опубликовать
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gallery modal */}
      {activeGalleryWork && (
        <WorkGalleryModal
          work={activeGalleryWork}
          onClose={() => setActiveGalleryWork(null)}
        />
      )}
    </div>
  );
};
