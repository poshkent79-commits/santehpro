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
  MessageSquare,
  Wrench,
  ShieldCheck,
  Maximize2,
  FileCheck,
  Scale,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  Search
} from 'lucide-react';
import { MasterWork, Article, PlumbingSpecialist, SpecialistVerificationDoc } from '../types';
import { WorkGalleryModal } from './WorkGalleryModal';
import { SpecialistRejectionModal } from './admin/SpecialistRejectionModal';
import { SpecialistApprovalModal } from './admin/SpecialistApprovalModal';

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
  const [subTab, setSubTab] = useState<'masters' | 'works' | 'articles'>('masters');

  // Specialists Pre-moderation State
  const [specialistsFilter, setSpecialistsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [specialistSearch, setSpecialistSearch] = useState('');
  const [rejectingSpecialist, setRejectingSpecialist] = useState<PlumbingSpecialist | null>(null);
  const [approvingSpecialist, setApprovingSpecialist] = useState<PlumbingSpecialist | null>(null);
  const [inspectingPhoto, setInspectingPhoto] = useState<{ url: string; name: string } | null>(null);

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

  // Moderate Specialist (Approve)
  const handleConfirmApproveSpecialist = async (
    id: string,
    verified: boolean,
    welcomeComment?: string,
    notifyUser?: boolean
  ) => {
    try {
      const res = await fetch(`/api/specialists/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          verified,
          moderationComment: welcomeComment,
          notifyUser,
        }),
      });

      if (res.ok) {
        showMessage('✓ Кандидатура мастера успешно одобрена! Уведомление отправлено пользователю.');
        if (onRefreshSpecialists) onRefreshSpecialists();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Ошибка при одобрении мастера');
      }
    } catch (e: any) {
      console.error('Failed to approve specialist:', e);
      throw e;
    }
  };

  // Moderate Specialist (Reject with reason)
  const handleConfirmRejectSpecialist = async (
    id: string,
    reason: string,
    comment: string,
    notifyUser: boolean
  ) => {
    try {
      const res = await fetch(`/api/specialists/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: reason,
          moderationComment: comment,
          notifyUser,
        }),
      });

      if (res.ok) {
        showMessage('Заявка мастера отклонена. Причина зафиксирована и отправлена пользователю.');
        if (onRefreshSpecialists) onRefreshSpecialists();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Ошибка при отклонении мастера');
      }
    } catch (e: any) {
      console.error('Failed to reject specialist:', e);
      throw e;
    }
  };

  // Filtered lists
  const pendingSpecialistsCount = specialists.filter((s) => s.status === 'pending').length;
  const filteredSpecialists = specialists.filter((s) => {
    if (specialistsFilter !== 'all') {
      if (s.status !== specialistsFilter) return false;
    }
    if (specialistSearch.trim()) {
      const q = specialistSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.bio && s.bio.toLowerCase().includes(q)) ||
        (s.services && s.services.some(srv => srv.toLowerCase().includes(q)))
      );
    }
    return true;
  });

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
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('masters')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              subTab === 'masters'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Заявки мастеров (премодерация)</span>
            {pendingSpecialistsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white font-black animate-pulse">
                {pendingSpecialistsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('works')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              subTab === 'works'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Портфолио мастеров</span>
            {pendingWorksCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-slate-950 font-black animate-pulse">
                {pendingWorksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('articles')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              subTab === 'articles'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Статьи и курсы мастеров</span>
            {pendingArticlesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-400 text-slate-950 font-black animate-pulse">
                {pendingArticlesCount}
              </span>
            )}
          </button>
        </div>

        {subTab === 'masters' ? (
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSpecialistsFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                specialistsFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'
              }`}
            >
              На проверке ({pendingSpecialistsCount})
            </button>
            <button
              onClick={() => setSpecialistsFilter('approved')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                specialistsFilter === 'approved' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
              }`}
            >
              Одобренные
            </button>
            <button
              onClick={() => setSpecialistsFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                specialistsFilter === 'rejected' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400'
              }`}
            >
              Отклонённые
            </button>
            <button
              onClick={() => setSpecialistsFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                specialistsFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Все ({specialists.length})
            </button>
          </div>
        ) : subTab === 'works' ? (
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setWorksFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                worksFilter === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
              }`}
            >
              Ожидают проверки ({pendingWorksCount})
            </button>
            <button
              onClick={() => setWorksFilter('approved')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                worksFilter === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
              }`}
            >
              Одобренные
            </button>
            <button
              onClick={() => setWorksFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
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
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                articlesFilter === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
              }`}
            >
              Ожидают проверки ({pendingArticlesCount})
            </button>
            <button
              onClick={() => setArticlesFilter('approved')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                articlesFilter === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
              }`}
            >
              Опубликованные
            </button>
            <button
              onClick={() => setArticlesFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                articlesFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Все ({articles.length})
            </button>
          </div>
        )}
      </div>

      {/* MASTERS PRE-MODERATION TAB */}
      {subTab === 'masters' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={specialistSearch}
              onChange={(e) => setSpecialistSearch(e.target.value)}
              placeholder="Поиск мастера по имени, городу, телефону, email или услугам..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {filteredSpecialists.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <Wrench className="w-12 h-12 mx-auto text-slate-500" />
              <h4 className="text-base font-bold text-white">
                {specialistsFilter === 'pending'
                  ? 'Нет анкет мастеров, ожидающих премодерации'
                  : 'Анкеты мастеров не найдены по выбранному фильтру'}
              </h4>
              <p className="text-xs text-slate-400">
                {specialistsFilter === 'pending'
                  ? 'Все поступающие анкеты специалистов сразу отображаются здесь для проверки документов и квалификации.'
                  : 'Попробуйте изменить параметры поиска или фильтр статуса.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSpecialists.map((spec) => {
                const docs: SpecialistVerificationDoc[] = Array.isArray(spec.verificationDocs)
                  ? spec.verificationDocs
                  : spec.verificationDocsJson
                  ? (() => {
                      try {
                        return JSON.parse(spec.verificationDocsJson);
                      } catch {
                        return [];
                      }
                    })()
                  : [];

                const isPending = spec.status === 'pending';
                const isRejected = spec.status === 'rejected';
                const isApproved = spec.status === 'approved';

                return (
                  <div
                    key={spec.id}
                    className={`p-5 rounded-3xl bg-slate-900 border space-y-4 shadow-xl transition ${
                      isPending
                        ? 'border-amber-500/40 bg-slate-900/95'
                        : isRejected
                        ? 'border-rose-500/30 bg-slate-900/80'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Top candidate header */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="relative group shrink-0">
                          <img
                            src={spec.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'}
                            alt={spec.name}
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 shadow-md bg-slate-950 cursor-pointer ${
                              isApproved ? 'border-emerald-500/50' : isRejected ? 'border-rose-500/50' : 'border-amber-500/50'
                            }`}
                            onClick={() => setInspectingPhoto({ url: spec.photo, name: spec.name })}
                            title="Увеличить фото мастера"
                          />
                          <button
                            type="button"
                            onClick={() => setInspectingPhoto({ url: spec.photo, name: spec.name })}
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-amber-300 text-[10px] font-bold transition cursor-pointer"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h4 className="text-base font-bold text-white">{spec.name}</h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              г. {spec.city}
                            </span>
                            {isPending && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center space-x-1 animate-pulse">
                                <Clock className="w-3 h-3" />
                                <span>На премодерации</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>Одобрен и верифицирован</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>Заявка отклонена</span>
                              </span>
                            )}
                            {spec.emergency247 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                24/7 Аварийный
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                            <span>Тел: <strong className="text-white font-mono">{spec.phone}</strong></span>
                            {spec.email && (
                              <span className="text-cyan-400">Email: <strong className="font-mono">{spec.email}</strong></span>
                            )}
                            {spec.telegram && (
                              <span className="text-cyan-400">TG: <strong>{spec.telegram}</strong></span>
                            )}
                            {spec.whatsapp && (
                              <span className="text-emerald-400">WA: <strong>{spec.whatsapp}</strong></span>
                            )}
                            <span className="text-slate-400">Стаж: <strong>{spec.experienceYears} лет</strong></span>
                            <span className="text-amber-300">Вызов: <strong>от {spec.minPrice} ₽</strong></span>
                          </div>

                          {spec.bio && (
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-500 font-semibold">О мастере и гарантиях: </span>
                              "{spec.bio}"
                            </p>
                          )}

                          {/* Services chips */}
                          {Array.isArray(spec.services) && spec.services.length > 0 && (
                            <div className="pt-1">
                              <span className="text-[10px] font-semibold text-slate-400 mr-2">Заявленные услуги:</span>
                              <div className="inline-flex flex-wrap gap-1 mt-0.5">
                                {spec.services.map((srv, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-cyan-300 font-medium"
                                  >
                                    {srv}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons for pre-moderation */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-start pt-2 lg:pt-0">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => setApprovingSpecialist(spec)}
                              className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              <span>Одобрить кандидатуру</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setRejectingSpecialist(spec)}
                              className="px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs hover:bg-rose-500/30 transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                            >
                              <X className="w-4 h-4 text-rose-400" />
                              <span>Отклонить с причиной</span>
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <button
                            type="button"
                            onClick={() => setRejectingSpecialist(spec)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                            title="Отозвать одобрение и отклонить с указанием причины"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Пересмотреть и отклонить</span>
                          </button>
                        )}

                        {isRejected && (
                          <>
                            <button
                              type="button"
                              onClick={() => setApprovingSpecialist(spec)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Пересмотреть и одобрить</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setRejectingSpecialist(spec)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700 cursor-pointer"
                              title="Изменить причину отказа или отправить обновленный комментарий"
                            >
                              <span>Изменить причину</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rejection Details Box (Displayed if status is rejected) */}
                    {isRejected && (
                      <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-rose-300 flex items-center space-x-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>Причина отказа кандидату:</span>
                          </span>
                          {spec.moderatedAt && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              Дата решения: {new Date(spec.moderatedAt).toLocaleString('ru-RU')}
                            </span>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-1">
                          <div className="text-white font-semibold text-xs">
                            {spec.rejectionReason || 'Требуется доработка анкеты и документов'}
                          </div>
                          {spec.moderationComment && (
                            <div className="text-slate-300 text-[11px] italic pt-1 border-t border-slate-800">
                              «{spec.moderationComment}»
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400">
                          Уведомление отправлено на email мастера и отображается в его Личном кабинете с возможностью доработать анкету и отправить её на повторную премодерацию.
                        </p>
                      </div>
                    )}

                    {/* Attached Verification Documents (Passport, Self-employed, Certificates) */}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Прикреплённые подтверждающие документы ({docs.length} из 3):</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {docs.length === 0 ? 'Без прикрепленных файлов' : `${docs.length} файл(а)`}
                        </span>
                      </div>

                      {docs.length === 0 ? (
                        <p className="text-xs text-slate-500 italic bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                          Кандидат не прикрепил файлы документов (паспорт, диплом, сертификаты).
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {docs.map((doc, dIdx) => (
                            <div
                              key={doc.id || dIdx}
                              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between gap-2.5 group"
                            >
                              <div className="flex items-center space-x-2.5 overflow-hidden">
                                {doc.dataUrl && (doc.name.match(/\.(jpg|jpeg|png|webp)$/i) || doc.dataUrl.startsWith('data:image')) ? (
                                  <img
                                    src={doc.dataUrl}
                                    alt={doc.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-900 cursor-pointer"
                                    onClick={() => setInspectingPhoto({ url: doc.dataUrl!, name: doc.name })}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-cyan-400" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition">
                                    {doc.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    {doc.type || 'Документ'} {doc.size ? `• ${doc.size}` : ''}
                                  </p>
                                </div>
                              </div>

                              {doc.dataUrl && (
                                <button
                                  type="button"
                                  onClick={() => setInspectingPhoto({ url: doc.dataUrl!, name: doc.name })}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition shrink-0 cursor-pointer"
                                  title="Открыть и увеличить"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Legal Compliance Protocol Details */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Scale className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>
                          Согласие 152-ФЗ и условия независимого исполнителя зафиксированы: <strong className="text-slate-300">{spec.appliedAt || 'При подаче анкеты'}</strong>
                        </span>
                      </div>
                      <span className="text-emerald-400 font-medium">✓ Юридически подтверждено</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            {art.author}
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-400">{art.createdAt}</span>

                          {art.adminSection === 'courses' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              🎓 Раздел «Курсы»
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              📚 «Справочник»
                            </span>
                          )}

                          {art.vkVideoUrl && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-300 border border-blue-500/30">
                              💙 VK Видео
                            </span>
                          )}
                          {art.rutubeUrl && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-300 border border-red-500/30">
                              🇷🇺 RuTube / Restore
                            </span>
                          )}
                          {art.youtubeUrl && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600/20 text-rose-300 border border-rose-500/30">
                              ▶️ YouTube
                            </span>
                          )}
                          {art.audioUrl && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                              🎧 Аудио
                            </span>
                          )}
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

      {/* Specialist Rejection Modal with Reasons and Automated Notifications */}
      {rejectingSpecialist && (
        <SpecialistRejectionModal
          isOpen={Boolean(rejectingSpecialist)}
          specialist={rejectingSpecialist}
          onClose={() => setRejectingSpecialist(null)}
          onConfirmReject={handleConfirmRejectSpecialist}
        />
      )}

      {/* Specialist Approval Modal */}
      {approvingSpecialist && (
        <SpecialistApprovalModal
          isOpen={Boolean(approvingSpecialist)}
          specialist={approvingSpecialist}
          onClose={() => setApprovingSpecialist(null)}
          onConfirmApprove={handleConfirmApproveSpecialist}
        />
      )}

      {/* Photo inspection modal */}
      {inspectingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate">{inspectingPhoto.name}</span>
              <button
                type="button"
                onClick={() => setInspectingPhoto(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
              <img
                src={inspectingPhoto.url}
                alt={inspectingPhoto.name}
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
