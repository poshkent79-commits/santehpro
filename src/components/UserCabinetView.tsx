import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  GraduationCap,
  Bookmark,
  Calendar,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Trash2,
  Edit2,
  CheckCircle2,
  PlayCircle,
  Clock,
  Database,
  Lock,
  ArrowRight,
  AlertTriangle,
  Settings,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Star,
  ClipboardList,
  Wrench,
  Sparkles,
  PlusCircle,
  Filter,
  Crown,
  Search,
  Check,
  LocateFixed,
  ChevronDown,
  X,
  Loader2,
  Heart,
  Share2,
  RefreshCw,
  FileQuestion,
  FileText,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { ApplySpecialistModal } from './ApplySpecialistModal';
import { useAuth } from '../context/AuthContext';
import { Article, UserPurchase, UserFavorite, ServiceCallRequest, PlumbingSpecialist } from '../types';
import { RUSSIAN_CITIES } from '../data/initialData';
import {
  COUNTRIES,
  CountryInfo,
  getCountryByCity,
  getCitiesByCountry,
} from '../data/regionsData';
import { detectUserCityFromIP } from '../utils/geoCity';
import { getOfflineArticles } from '../utils/offlineArticles';
import { ServiceRequestRatingCard } from './ServiceRequestRatingCard';
import { MasterCabinetSection } from './MasterCabinetSection';
import { SpecialistCabinetView } from './SpecialistCabinetView';
import { triggerNativeShare } from '../utils/shareApp';

interface UserCabinetViewProps {
  articles: Article[];
  serviceRequests?: ServiceCallRequest[];
  specialists?: PlumbingSpecialist[];
  onRefreshServiceRequests?: () => void;
  onRefreshSpecialists?: () => void;
  onSelectArticle: (article: Article) => void;
  onNavigateToCourses: () => void;
  onNavigateToHandbook: () => void;
  onNavigateToDiagnostic?: (prompt?: string) => void;
  onNavigateToSpecialists?: () => void;
  onOpenBookModal?: () => void;
  initialTab?: 'favorites' | 'purchases' | 'requests' | 'profile' | 'master';
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  onOpenDonation?: () => void;
}

export const UserCabinetView: React.FC<UserCabinetViewProps> = ({
  articles,
  serviceRequests = [],
  specialists = [],
  onRefreshServiceRequests,
  onRefreshSpecialists,
  onSelectArticle,
  onNavigateToCourses,
  onNavigateToHandbook,
  onNavigateToDiagnostic,
  onNavigateToSpecialists,
  onOpenBookModal,
  initialTab,
  selectedCity = 'Москва',
  onCityChange,
  onOpenDonation,
}) => {
  const {
    currentUser,
    purchases,
    favorites,
    logout,
    deleteAccount,
    updateProfile,
    changePassword,
    toggleFavorite,
    openAuthModal,
    loginWithYandex,
  } = useAuth();

  // Find linked specialist profile for the logged in user by UID, Email, Phone, Name or Local link
  const storedSpecialistId = typeof window !== 'undefined' ? localStorage.getItem('santehpro_master_specialist_id') : null;
  const userSpecialist = specialists.find((s) => {
    if (!currentUser) return false;
    if (storedSpecialistId && s.id === storedSpecialistId) return true;
    if (s.userUid && s.userUid === currentUser.uid) return true;
    if (s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (s.phone && currentUser.phone) {
      const cleanS = s.phone.replace(/\D/g, '');
      const cleanU = currentUser.phone.replace(/\D/g, '');
      if (cleanS.length >= 10 && cleanS === cleanU) return true;
    }
    if (currentUser.name && s.name && s.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
    return false;
  }) || (currentUser?.role === 'specialist' || currentUser?.role === 'admin' ? specialists.find((s) => s.verified || s.status === 'approved') || specialists[0] : null);

  // Guarantee fallback specialist object for master account if not yet matched in specialists list
  const masterProfile: PlumbingSpecialist | null = userSpecialist || (currentUser?.role === 'specialist' ? {
    id: storedSpecialistId || `spec-${currentUser.uid}`,
    name: currentUser.name || 'Мастер-сантехник',
    city: currentUser.city || selectedCity || 'Москва',
    phone: currentUser.phone || '+7 (999) 000-00-00',
    experienceYears: 5,
    minPrice: 1000,
    emergency247: true,
    services: ['Установка сантехники', 'Монтаж отопления', 'Устранение протечек'],
    rating: 5.0,
    reviewCount: 1,
    verified: true,
    status: 'approved',
    userUid: currentUser.uid,
    email: currentUser.email,
  } : null);

  // "У мастеров, прошедших проверку, автоматически открывается личный кабинет"
  const isVerifiedMaster = Boolean(
    currentUser &&
    (
      (masterProfile && (masterProfile.verified || masterProfile.status === 'approved')) ||
      currentUser.role === 'specialist' ||
      currentUser.role === 'admin'
    )
  );

  const [activeTab, setActiveTab] = useState<'favorites' | 'requests' | 'profile' | 'master'>(() => {
    if (initialTab && initialTab !== 'purchases') return initialTab;
    if (isVerifiedMaster || masterProfile) return 'master';
    return 'favorites';
  });

  const [justRecoveredNotice, setJustRecoveredNotice] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('just_recovered_password') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (sessionStorage.getItem('just_recovered_password') === 'true') {
        setJustRecoveredNotice(true);
        sessionStorage.removeItem('just_recovered_password');
      }
    } catch {
      // Ignore
    }
  }, []);

  const [requestFilter, setRequestFilter] = useState<'all' | 'needs_review' | 'completed' | 'in_progress'>('all');
  const [isCreatingTestRequest, setIsCreatingTestRequest] = useState(false);
  const [shareFeedbackToast, setShareFeedbackToast] = useState<string | null>(null);

  const handleShareClick = async () => {
    const res = await triggerNativeShare({
      title: 'СантехПро',
      text: 'СантехПро — отличный сервис по сантехнике: пошаговые инструкции, обучающие курсы, расчёт материалов и база проверенных мастеров по всей России и СНГ! Рекомендую 👍',
      url: window.location.origin || 'https://santehpro.info',
    });
    if (res === 'copied') {
      setShareFeedbackToast('Ссылка на сервис скопирована в буфер обмена!');
      setTimeout(() => setShareFeedbackToast(null), 3000);
    }
  };

  // City selection state in cabinet
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [cityToast, setCityToast] = useState<string | null>(null);
  const [isDetectingCityLocal, setIsDetectingCityLocal] = useState(false);
  const [cabinetCountry, setCabinetCountry] = useState<string>(() => {
    return getCountryByCity(currentUser?.city || selectedCity || 'Москва').code;
  });

  // Master Pre-moderation & Reapplication State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReapplying, setIsReapplying] = useState(false);
  const [isRefreshingSpecialistStatus, setIsRefreshingSpecialistStatus] = useState(false);

  const handleRefreshSpecialistStatus = async () => {
    setIsRefreshingSpecialistStatus(true);
    try {
      await onRefreshSpecialists?.();
    } finally {
      setTimeout(() => setIsRefreshingSpecialistStatus(false), 500);
    }
  };

  useEffect(() => {
    if (isCityModalOpen) {
      setCabinetCountry(getCountryByCity(currentUser?.city || selectedCity || 'Москва').code);
      setCitySearchQuery('');
    }
  }, [isCityModalOpen, currentUser?.city, selectedCity]);

  const activeCabinetCountryObj = useMemo(() => {
    return COUNTRIES.find((c) => c.code === cabinetCountry) || COUNTRIES[0];
  }, [cabinetCountry]);

  const cabinetCountryCities = useMemo(() => {
    return getCitiesByCountry(cabinetCountry, RUSSIAN_CITIES);
  }, [cabinetCountry]);

  const handleSelectCity = async (newCity: string) => {
    try {
      await updateProfile({ city: newCity });
      localStorage.setItem('santehpro_selected_city', newCity);
      localStorage.setItem('santehpro_city_confirmed', 'true');
      if (currentUser?.uid) {
        localStorage.setItem(`santehpro_city_confirmed_user_${currentUser.uid}`, 'true');
      }
      onCityChange?.(newCity);
      setIsCityModalOpen(false);
      setCityToast(`Город успешно изменён на «${newCity}»`);
      setTimeout(() => setCityToast(null), 3500);
    } catch (err) {
      alert('Не удалось обновить город в профиле');
    }
  };

  const handleDetectCityLocal = async () => {
    setIsDetectingCityLocal(true);
    try {
      const res = await detectUserCityFromIP();
      if (res?.nearestCity) {
        await handleSelectCity(res.nearestCity);
      }
    } finally {
      setIsDetectingCityLocal(false);
    }
  };

  // Compute user's service requests
  const userRequests = serviceRequests.filter((r) => {
    if (!currentUser) return false;
    if (r.userUid && r.userUid === currentUser.uid) return true;
    if (r.clientEmail && currentUser.email && r.clientEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (r.clientPhone && currentUser.phone) {
      const cleanR = r.clientPhone.replace(/\D/g, '');
      const cleanU = currentUser.phone.replace(/\D/g, '');
      if (cleanR.length >= 10 && cleanR === cleanU) return true;
    }
    // If user is admin or on demo/developer account, also show relevant requests for testing
    if (currentUser.role === 'admin' || currentUser.email === 'user@santehpro.ru' || currentUser.email === 'admin@santehpro.ru') {
      return true;
    }
    return false;
  });

  const pendingReviewsCount = userRequests.filter((r) => r.status === 'completed' && (!r.rating || r.rating < 1)).length;

  // Count incoming direct requests for this master that are not completed/replied
  const masterPendingDirectRequestsCount = userSpecialist ? serviceRequests.filter((r) => {
    const isThisMaster =
      r.preferredMasterId === userSpecialist.id ||
      (userSpecialist.userUid && (r.preferredMasterId === userSpecialist.userUid || (r as any).preferredMasterUid === userSpecialist.userUid)) ||
      (r.preferredMasterName && userSpecialist.name && r.preferredMasterName.trim().toLowerCase() === userSpecialist.name.trim().toLowerCase());
    return isThisMaster && r.status !== 'completed' && r.status !== 'rejected' && !r.masterReply;
  }).length : 0;

  // Automatically switch to 'master' tab if user requested it or if user is verified master without other initial tab
  useEffect(() => {
    if (initialTab === 'master' && (isVerifiedMaster || masterProfile)) {
      setActiveTab('master');
    } else if (!initialTab && isVerifiedMaster) {
      setActiveTab('master');
    }
  }, [initialTab, isVerifiedMaster, masterProfile]);

  // If activeTab is 'master' but current user has no specialist profile or verified access, redirect to 'favorites'
  useEffect(() => {
    if (activeTab === 'master' && !isVerifiedMaster && !masterProfile && currentUser?.role !== 'admin') {
      setActiveTab('favorites');
    }
  }, [activeTab, isVerifiedMaster, masterProfile, currentUser]);

  const filteredUserRequests = userRequests.filter((r) => {
    if (requestFilter === 'needs_review') {
      return r.status === 'completed' && (!r.rating || r.rating < 1);
    }
    if (requestFilter === 'completed') {
      return r.status === 'completed';
    }
    if (requestFilter === 'in_progress') {
      return r.status === 'pending' || r.status === 'approved';
    }
    return true;
  });

  const handleCreateTestCompletedRequest = async () => {
    if (!currentUser) return;
    setIsCreatingTestRequest(true);
    try {
      const targetSpecialist = specialists[0];
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: currentUser.name || 'Пользователь СантехПро',
          clientPhone: currentUser.phone || '+7 (999) 000-00-00',
          clientEmail: currentUser.email,
          userUid: currentUser.uid,
          city: currentUser.city || 'Москва',
          address: 'Кутузовский пр-т, д. 24, кв. 118',
          problemDescription: 'Замена радиатора отопления на биметаллический и установка кранов Маевского',
          category: 'heating',
          status: 'completed',
          emergency: false,
          preferredTime: 'Работы успешно выполнены',
          preferredMasterId: targetSpecialist?.id || 'spec-1',
          preferredMasterName: targetSpecialist?.name || 'Михаил Ковалев',
        }),
      });
      if (res.ok) {
        onRefreshServiceRequests?.();
        setRequestFilter('all');
      }
    } catch (err) {
      console.error('Failed to create test request:', err);
    } finally {
      setIsCreatingTestRequest(false);
    }
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Москва');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Account deletion modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);


  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/20">
          <User className="w-8 h-8 text-white" />
        </div>

        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Панель пользователя</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Личный кабинет «СантехПро»</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Вход и регистрация в личном кабинете осуществляются через защищённый Яндекс ID.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-left shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Возможности личного кабинета
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Доступ к обучающим видеокурсам и урокам</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Сохранение избранных статей и расчётов</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Синхронизация профиля на компьютере и смартфоне</span>
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => openAuthModal('login', 'Вход и регистрация через Яндекс ID')}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm flex items-center justify-center space-x-3 transition-all duration-200 shadow-xl shadow-red-600/10 hover:shadow-red-600/20 cursor-pointer border border-white"
            >
              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                Я
              </div>
              <span>Войти с Яндекс ID</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 text-center">
            <a
              href="https://passport.yandex.ru/restoration"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-amber-300 transition inline-flex items-center space-x-1"
            >
              <span>Забыли пароль от Яндекс? Восстановить в Яндекс Паспорте ↗</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim(), city: city.trim() });
      setIsEditingProfile(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Не удалось обновить профиль');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCourse = (courseId: string) => {
    let found = articles.find((a) => a.id === courseId);
    if (!found) {
      const offline = getOfflineArticles();
      found = offline.find((a) => a.id === courseId);
    }
    if (found) {
      onSelectArticle(found);
    } else {
      fetch(`/api/articles/${courseId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((art) => {
          if (art && art.id) onSelectArticle(art);
        })
        .catch(() => {});
    }
  };

  const handleOpenFavorite = (fav: UserFavorite) => {
    let found = articles.find((a) => a.id === fav.articleId);
    if (!found) {
      const offline = getOfflineArticles();
      found = offline.find((a) => a.id === fav.articleId);
    }
    if (found) {
      onSelectArticle(found);
    } else {
      fetch(`/api/articles/${fav.articleId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((art) => {
          if (art && art.id) onSelectArticle(art);
        })
        .catch(() => {});
    }
  };

  const handleRemoveFavorite = async (fav: UserFavorite, e: React.MouseEvent) => {
    e.stopPropagation();
    const mockArticle = { id: fav.articleId, title: fav.articleTitle } as Article;
    await toggleFavorite(mockArticle);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'УДАЛИТЬ') {
      setDeleteError('Пожалуйста, введите проверочное слово УДАЛИТЬ');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setDeleteError(err?.message || 'Не удалось удалить аккаунт из базы данных');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Password Reset Confirmation Banner */}
      {justRecoveredNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Пароль успешно обновлён!</p>
              <p className="text-xs text-emerald-300/90">Вы успешно авторизованы и вошли в свой Личный кабинет СантехПро.</p>
            </div>
          </div>
          <button
            onClick={() => setJustRecoveredNotice(false)}
            className="p-1.5 rounded-lg text-emerald-400/80 hover:text-white hover:bg-emerald-500/20 transition text-xs font-semibold"
            title="Закрыть"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Profile Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-xl font-black text-white">{currentUser.name || 'Пользователь'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>{currentUser.role === 'admin' ? 'Аккаунт Cloud SQL (Админ)' : 'Подтвержденный профиль'}</span>
                </span>
                {currentUser.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    Администратор
                  </span>
                )}
                {Boolean((currentUser as any)?.yandexId || (currentUser as any)?.isYandexUser) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center space-x-1">
                    <span className="w-3 h-3 rounded-full bg-red-600 text-white font-black text-[8px] flex items-center justify-center leading-none">Я</span>
                    <span>Яндекс ID</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentUser.email}</span>
                </div>
                {currentUser.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/60">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-200 font-semibold">{currentUser.city || selectedCity || 'Москва'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCitySearchQuery('');
                      setIsCityModalOpen(true);
                    }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer transition"
                    title="Сменить город"
                  >
                    Изменить
                  </button>
                </div>
                {currentUser.createdAt && (
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Регистрация: {new Date(currentUser.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => {
                setName(currentUser.name || '');
                setPhone(currentUser.phone || '');
                setCity(currentUser.city || 'Москва');
                setIsEditingProfile(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center space-x-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Редактировать профиль</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText('');
                setDeleteError(null);
                setIsDeleteModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition border border-rose-500/20 flex items-center space-x-1.5"
              title="Полное удаление учетной записи из базы данных"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить аккаунт</span>
            </button>

            {onOpenDonation && (
              <button
                type="button"
                onClick={onOpenDonation}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition border border-emerald-500/30 flex items-center space-x-1.5 shadow-sm cursor-pointer"
                title="Поддержать развитие проекта добровольным донатом"
              >
                <Heart className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                <span>Поддержать (Донат)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShareClick}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition border border-cyan-500/30 flex items-center space-x-1.5 shadow-sm cursor-pointer"
              title="Поделиться сервисом"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Поделиться</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700 flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Данные профиля успешно сохранены!</span>
          </div>
        )}

        {cityToast && (
          <div className="mt-4 p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{cityToast}</span>
          </div>
        )}

        {shareFeedbackToast && (
          <div className="mt-4 p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{shareFeedbackToast}</span>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Редактирование профиля</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ФИО / Имя</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Номер телефона</label>
                <input
                  type="tel"
                  placeholder="+7 (999) 000-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Город</span>
                </label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-500 outline-none cursor-pointer appearance-none pr-8"
                  >
                    {RUSSIAN_CITIES.filter((c) => c !== 'Все города').map((rc) => (
                      <option key={rc} value={rc}>
                        {rc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* City Change Modal for User Cabinet */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Выбор города проживания</h3>
                  <p className="text-[11px] text-slate-400">Сохраняется в вашем профиле и используется для вызова мастеров</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCityModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Detect & Search */}
            <div className="space-y-2.5 shrink-0">
              <button
                type="button"
                onClick={handleDetectCityLocal}
                disabled={isDetectingCityLocal}
                className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isDetectingCityLocal ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Определение местоположения...</span>
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Определить мой город автоматически</span>
                  </>
                )}
              </button>

              {/* Country Tabs */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {COUNTRIES.map((co) => {
                  const isActive = cabinetCountry === co.code;
                  return (
                    <button
                      key={co.code}
                      type="button"
                      onClick={() => {
                        setCabinetCountry(co.code);
                        setCitySearchQuery('');
                      }}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <span>{co.flag}</span>
                      <span>{co.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={`Поиск города в ${activeCabinetCountryObj.name}...`}
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-500 outline-none"
                  autoFocus
                />
              </div>

              {/* Popular cities */}
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Крупные города ({activeCabinetCountryObj.name}):</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {activeCabinetCountryObj.popularCities.map((popCity) => (
                    <button
                      key={popCity}
                      type="button"
                      onClick={() => handleSelectCity(popCity)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                        (currentUser?.city || selectedCity) === popCity
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      {popCity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable list of cities */}
            <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60 border border-slate-800 rounded-xl bg-slate-950/40 p-1">
              {cabinetCountryCities.filter((c) => c !== 'Все города' && c.toLowerCase().includes(citySearchQuery.trim().toLowerCase())).map((c) => {
                const isCurrent = (currentUser?.city || selectedCity) === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectCity(c)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{c}</span>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Specialist Pre-Moderation & Rejection Notifications */}
      {userSpecialist && userSpecialist.status === 'pending' && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h4 className="text-sm font-bold text-amber-300">Ваша анкета мастера находится на рассмотрении</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Премодерация
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Администрация проверяет данные и документы. После одобрения личный кабинет мастера разблокируется автоматически, а на e-mail поступит подтверждение.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1 shrink-0 cursor-pointer shadow-md"
          >
            <span>Статус проверки</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {userSpecialist && userSpecialist.status === 'rejected' && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/20">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/30">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h4 className="text-sm font-bold text-rose-300">Заявка мастера отклонена администратором</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Отклонено
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Причина: <strong className="text-rose-200">«{userSpecialist.rejectionReason || 'Требуется исправление данных анкеты'}»</strong>
                {userSpecialist.moderationComment && (
                  <span className="block text-slate-400 text-[11px] mt-0.5">
                    Рекомендация: {userSpecialist.moderationComment}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsReapplying(true);
                setIsApplyModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Исправить и отправить снова</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('master')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Подробнее
            </button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {/* Master's Cabinet Tab: moved to the very BEGINNING (position 1) for verified masters, specialists, or pending applicants */}
        {(isVerifiedMaster || userSpecialist || currentUser?.role === 'specialist' || currentUser?.role === 'admin') && (
          <button
            type="button"
            id="cabinet-master-tab-btn"
            onClick={() => setActiveTab('master')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'master'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-blue-400 hover:text-white border border-blue-500/30'
            }`}
          >
            <Wrench className="w-4 h-4 text-blue-400" />
            <span>Личный кабинет мастера</span>
            {masterPendingDirectRequestsCount > 0 ? (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse shadow">
                {masterPendingDirectRequestsCount} нов.
              </span>
            ) : (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                userSpecialist?.status === 'rejected'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : isVerifiedMaster
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {userSpecialist?.status === 'rejected' ? 'Отклонено' : isVerifiedMaster ? 'Верифицирован' : 'На проверке'}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'favorites'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Избранные материалы</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/40">
            {favorites.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Вызовы мастеров и отзывы</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/40 font-mono">
            {userRequests.length}
          </span>
          {pendingReviewsCount > 0 && (
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 flex items-center space-x-1 animate-pulse shadow-sm"
              title="Есть завершенные вызовы, ожидающие вашей оценки"
            >
              <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
              <span>Оценить ({pendingReviewsCount})</span>
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-slate-700 text-white shadow-md shadow-slate-700/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Настройки и безопасность</span>
        </button>
      </div>

      {/* Tab 1: Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Избранные статьи и материалы ({favorites.length})
            </h2>
            <button
              type="button"
              onClick={onNavigateToHandbook}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>В справочник статей</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {favorites.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Список закладок пуст</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Нажимайте на значок закладки в справочнике или курсах, чтобы сохранять полезные инструкции.
              </p>
              <button
                type="button"
                onClick={onNavigateToHandbook}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20 inline-flex items-center space-x-1.5"
              >
                <span>Перейти к справочнику</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  onClick={() => handleOpenFavorite(fav)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer flex flex-col justify-between space-y-3 group relative shadow-md"
                >
                    <div className="space-y-2">
                      {fav.coverImage && (
                        <div className="h-32 rounded-xl overflow-hidden bg-slate-950 relative">
                          <img
                            src={fav.coverImage}
                            alt={fav.articleTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </div>
                      )}
                      <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition line-clamp-2">
                        {fav.articleTitle}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-[10px] text-slate-400">
                        {fav.createdAt ? new Date(fav.createdAt).toLocaleDateString('ru-RU') : ''}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFavorite(fav, e)}
                        title="Удалить из закладок"
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Service Requests & Master Ratings */}
      {activeTab === 'requests' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Мои вызовы мастеров и оценка работы ({userRequests.length})
                </h2>
                {pendingReviewsCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                    <span>Требуют оценки: {pendingReviewsCount}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                История вызовов сантехников, статус выполнения и возможность поставить оценку и оставить отзыв о мастере
              </p>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <button
                type="button"
                disabled={isCreatingTestRequest}
                onClick={handleCreateTestCompletedRequest}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition border border-slate-700 flex items-center space-x-1.5 disabled:opacity-50"
                title="Создать тестовую выполненную заявку для немедленной проверки оценки и отзыва"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isCreatingTestRequest ? 'Создание...' : 'Тестовая заявка'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenBookModal) {
                    onOpenBookModal();
                  } else if (onNavigateToSpecialists) {
                    onNavigateToSpecialists();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Вызвать мастера</span>
              </button>
            </div>
          </div>

          {/* Prompt banner when there are unrated completed requests */}
          {pendingReviewsCount > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">
                    Оцените работу мастера по завершенным заявкам!
                  </p>
                  <p className="text-slate-300 text-xs mt-0.5">
                    У вас есть {pendingReviewsCount} {pendingReviewsCount === 1 ? 'выполненная заявка' : 'выполненные заявки'}. Поставьте оценку звездами и напишите пару слов о качестве услуг.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestFilter('needs_review')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shrink-0 shadow-md"
              >
                Перейти к оценке
              </button>
            </div>
          )}

          {/* Filters Bar */}
          {userRequests.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setRequestFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  requestFilter === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Все заявки ({userRequests.length})
              </button>

              <button
                type="button"
                onClick={() => setRequestFilter('needs_review')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center space-x-1.5 ${
                  requestFilter === 'needs_review'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-800'
                }`}
              >
                <Star className="w-3 h-3" />
                <span>Ожидают оценки ({pendingReviewsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRequestFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  requestFilter === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Завершенные ({userRequests.filter((r) => r.status === 'completed').length})
              </button>

              <button
                type="button"
                onClick={() => setRequestFilter('in_progress')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  requestFilter === 'in_progress'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                В работе ({userRequests.filter((r) => r.status === 'pending' || r.status === 'approved').length})
              </button>
            </div>
          )}

          {/* Requests List or Empty State */}
          {userRequests.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                <ClipboardList className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">У вас пока нет оформленных заявок</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Заказывайте выезд проверенных сантехников для монтажа и ремонта. После завершения заказа здесь можно будет оценить работу мастера по 5-балльной шкале и оставить честный отзыв.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenBookModal) {
                      onOpenBookModal();
                    } else if (onNavigateToSpecialists) {
                      onNavigateToSpecialists();
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Вызвать мастера на дом</span>
                </button>

                <button
                  type="button"
                  disabled={isCreatingTestRequest}
                  onClick={handleCreateTestCompletedRequest}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isCreatingTestRequest ? 'Создание...' : 'Создать тестовую выполненную заявку'}</span>
                </button>
              </div>
            </div>
          ) : filteredUserRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <p className="text-xs text-slate-400">Нет заявок, соответствующих выбранному фильтру.</p>
              <button
                type="button"
                onClick={() => setRequestFilter('all')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                Показать все заявки
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUserRequests.map((req) => {
                const spec = specialists.find((s) => s.id === req.preferredMasterId);
                return (
                  <ServiceRequestRatingCard
                    key={req.id}
                    request={req}
                    specialist={spec}
                    currentUser={currentUser}
                    onRefresh={() => {
                      onRefreshServiceRequests?.();
                      onRefreshSpecialists?.();
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Settings & Security / Account Management */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Настройки профиля и безопасность аккаунта
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.role === 'admin'
                  ? 'Управление персональными данными и учетной записью в базе данных Cloud SQL (PostgreSQL)'
                  : 'Управление контактными данными и параметрами безопасности аккаунта'}
              </p>
            </div>
          </div>

          <div className={`grid grid-cols-1 ${currentUser.role === 'admin' ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-6`}>
            {/* Card 1: Personal Info Form */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-3 pb-2 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Персональные данные</h3>
                  <p className="text-[11px] text-slate-400">Информация отображается в заказах и профиле</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">ФИО / Имя</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                    placeholder="Ваше имя"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Контактный телефон</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                    placeholder="+7 (999) 000-00-00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Город проживания</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                    placeholder="Москва"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Изменения сохраняются мгновенно в базе данных</span>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {isSaving ? 'Сохранение...' : 'Сохранить данные'}
                  </button>
                </div>
              </form>
            </div>

            {/* Card 2: Account Details in Cloud SQL (ONLY visible to admin and developer) */}
            {currentUser.role === 'admin' ? (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-3 pb-2 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white">Учетная запись в Cloud SQL</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Только для админа / разработчика
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Системные параметры базы данных PostgreSQL</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400">Электронная почта:</span>
                    <span className="font-semibold text-white">{currentUser.email}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400">Идентификатор (UID):</span>
                    <span className="font-mono text-[11px] text-cyan-400">{currentUser.uid}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400">Роль в системе:</span>
                    <span className="font-semibold text-emerald-400">
                      {currentUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400">Дата регистрации:</span>
                    <span className="text-slate-300">
                      {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleString('ru-RU') : 'Недавно'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400">Активные курсы / Закладки:</span>
                    <span className="text-amber-400 font-bold">
                      {purchases.length} курсов / {favorites.length} закладок
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Согласие на обработку данных (152-ФЗ):
                    </span>
                    <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Подтверждено
                    </span>
                  </div>

                  {currentUser.consentTimestamp && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400">Время фиксации согласия:</span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        {new Date(currentUser.consentTimestamp).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Card: Account Security via Yandex ID */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
                  Я
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">Безопасность аккаунта: Яндекс ID</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      АКТИВНО
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Авторизация и профиль защищены официальной системой безопасности Яндекс ID
                  </p>
                </div>
              </div>

              <a
                href="https://passport.yandex.ru/profile"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <span>Управление Яндекс ID</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3 text-xs text-slate-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">Вход без паролей и риска утечек</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Ваш профиль в «СантехПро» привязан к Яндекс ID ({currentUser.email || 'Яндекс аккаунт'}). 
                  Двухфакторная защита, безопасность и вход по биометрии управляются непосредственно в вашем Яндекс Паспорте.
                </p>
              </div>
            </div>

            <div className="flex sm:hidden pt-1">
              <a
                href="https://passport.yandex.ru/profile"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <span>Управление Яндекс ID ↗</span>
              </a>
            </div>
          </div>

          {/* Card 3: Danger Zone - Delete Account */}
          <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Опасная зона: Полное удаление аккаунта</h3>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Вы можете полностью и безвозвратно удалить свой профиль и все связанные данные из системы.
                    При удалении учетной записи будут стерты: персональные данные, доступ ко всем купленным курсам ({purchases.length} шт.),
                    а также все сохраненные избранные материалы ({favorites.length} шт.). Данное действие необратимо.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmText('');
                  setDeleteError(null);
                  setIsDeleteModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/20 flex items-center space-x-2 shrink-0 self-start sm:self-center"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить мой аккаунт</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Specialist Personal Cabinet - Displayed for approved masters */}
      {activeTab === 'master' && (
        isVerifiedMaster && masterProfile ? (
          <MasterCabinetSection
            specialist={masterProfile}
            onRefreshSpecialist={onRefreshSpecialists}
            onOpenArticle={onSelectArticle}
          />
        ) : (userSpecialist?.status === 'rejected' || masterProfile?.status === 'rejected') ? (
          /* REJECTED APPLICATION STATE WITH REASON & REAPPLICATION ACTION */
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto shadow-2xl shadow-rose-950/20 animate-in fade-in duration-200">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ✕ Заявка отклонена
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                  Заявка мастера не прошла модерацию
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Кандидат: <strong className="text-white">{userSpecialist?.name || masterProfile?.name}</strong> ({userSpecialist?.city || masterProfile?.city})
                </p>
              </div>
            </div>

            {/* Official Rejection Reason Box */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-semibold text-rose-300 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Официальная причина отклонения:</span>
                </span>
                {(userSpecialist?.moderatedAt || masterProfile?.moderatedAt) && (
                  <span className="text-[11px] text-slate-500">
                    Решение от: {new Date(userSpecialist?.moderatedAt || masterProfile?.moderatedAt || '').toLocaleString('ru-RU')}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-sm font-semibold text-rose-200">
                «{userSpecialist?.rejectionReason || masterProfile?.rejectionReason || 'Требуется исправление данных анкеты или документов'}»
              </div>

              {(userSpecialist?.moderationComment || masterProfile?.moderationComment) && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Комментарий и рекомендации модератора:
                  </span>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed italic">
                    "{userSpecialist?.moderationComment || masterProfile?.moderationComment}"
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 pt-1">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  Автоматическое уведомление направлено на почту:{' '}
                  <strong className="text-slate-200">{currentUser?.email || userSpecialist?.email || masterProfile?.email || 'ваш e-mail'}</strong>
                </span>
              </div>
            </div>

            {/* Instructions on how to reapply */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs space-y-2 text-slate-300">
              <h4 className="font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Как успешно пройти повторную модерацию:</span>
              </h4>
              <ul className="space-y-1 text-slate-400 list-disc list-inside text-[11px] leading-relaxed">
                <li>Проверьте корректность номера телефона и контактных мессенджеров (Telegram/WhatsApp).</li>
                <li>Загрузите четкие фотографии или сканы документов (паспорт, сертификаты, квалификационные удостоверения).</li>
                <li>Убедитесь, что перечень заявленных услуг и стаж соответствуют действительности.</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsReapplying(true);
                  setIsApplyModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Исправить данные и подать заявку повторно</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                В мои материалы
              </button>
            </div>
          </div>
        ) : (userSpecialist?.status === 'pending' || masterProfile?.status === 'pending') ? (
          /* PENDING PRE-MODERATION STATE WITH CANDIDATE OVERVIEW */
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto shadow-2xl shadow-amber-950/20 animate-in fade-in duration-200">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ⏳ На премодерации
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Анкета мастера находится на рассмотрении
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Служба верификации проверяет предоставленные данные, опыт и прикрепленные документы (152-ФЗ / 63-ФЗ).
                </p>
              </div>
            </div>

            {/* 3-Step Verification Pipeline */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Этапы рассмотрения:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>1. Анкета подана</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Данные и согласия зафиксированы в БД</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs space-y-1 shadow">
                  <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>2. Премодерация</span>
                  </div>
                  <p className="text-[10px] text-amber-200/80">Проверка администратором (15–60 мин)</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 opacity-70">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>3. Доступ открыт</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Портфолио, заявки, статьи и каталог</p>
                </div>
              </div>
            </div>

            {/* Candidate Summary Grid */}
            {(() => {
              const spec = userSpecialist || masterProfile;
              if (!spec) return null;
              const docsCount = Array.isArray(spec.verificationDocs)
                ? spec.verificationDocs.length
                : spec.verificationDocsJson
                ? (() => {
                    try {
                      return JSON.parse(spec.verificationDocsJson).length;
                    } catch {
                      return 0;
                    }
                  })()
                : 0;

              return (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Параметры вашей заявки:</span>
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300">
                      ID: {spec.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                    <div>• Специалист: <strong className="text-white">{spec.name}</strong></div>
                    <div>• Город: <strong className="text-white">{spec.city}</strong></div>
                    <div>• Телефон: <strong className="text-white font-mono">{spec.phone}</strong></div>
                    <div>• Стаж: <strong className="text-white">{spec.experienceYears} лет</strong></div>
                    <div>• Выезд: <strong className="text-white">от {spec.minPrice} ₽</strong></div>
                    <div>• Прикреплено документов: <strong className="text-cyan-400">{docsCount} шт.</strong></div>
                  </div>

                  {Array.isArray(spec.services) && spec.services.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block mb-1">Заявленные услуги:</span>
                      <div className="flex flex-wrap gap-1">
                        {spec.services.map((srv, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-1 text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      Уведомление поступит на адрес:{' '}
                      <strong className="text-slate-200">{currentUser?.email || spec.email || 'ваш e-mail'}</strong>
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleRefreshSpecialistStatus}
                  disabled={isRefreshingSpecialistStatus}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSpecialistStatus ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingSpecialistStatus ? 'Обновление...' : 'Проверить статус'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsReapplying(false);
                    setIsApplyModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Редактировать анкету</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                В мои материалы
              </button>
            </div>
          </div>
        ) : (
          /* NOT APPLIED YET - PROMPT TO BECOME A MASTER */
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4 max-w-lg mx-auto shadow-xl animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Wrench className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">Станьте мастером сервиса «СантехПро»</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Личный кабинет мастера позволяет получать прямые вызовы клиентов, загружать примеры выполненных работ (до 3 файлов), формировать сметы и публиковать экспертные обучающие материалы.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-xs space-y-1.5 text-slate-300">
              <span className="font-bold text-white block">Что даёт статус проверенного мастера:</span>
              <div className="space-y-1 text-[11px] text-slate-400">
                <div>✓ Размещение анкеты в каталоге специалистов вашего города</div>
                <div>✓ Прямые заявки от заказчиков без скрытых комиссий</div>
                <div>✓ Протокол согласия 152-ФЗ / 63-ФЗ в сертифицированной базе Timeweb Cloud</div>
              </div>
            </div>

            {/* Quick profile linker if user already has an approved specialist in database */}
            {specialists.length > 0 && (
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-left space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Ваша анкета уже есть в базе? Привяжите её к аккаунту:
                </span>
                <div className="flex items-center space-x-2">
                  <select
                    id="select-link-specialist"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none cursor-pointer"
                    onChange={(e) => {
                      if (e.target.value) {
                        localStorage.setItem('santehpro_master_specialist_id', e.target.value);
                        window.location.reload();
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Выберите вашу анкету из списка --</option>
                    {specialists.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city}) {s.verified || s.status === 'approved' ? '✓ Одобрен' : s.status === 'rejected' ? '✕ Отклонен' : '⏳ На проверке'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsReapplying(false);
                  setIsApplyModalOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Подать анкету мастера</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 cursor-pointer"
              >
                В личный кабинет
              </button>
            </div>
          </div>
        )
      )}

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl shadow-rose-950/40 space-y-6 relative overflow-hidden">
            {/* Top Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-red-500 to-amber-500" />

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Удаление аккаунта навсегда</h3>
                <p className="text-xs text-rose-400 mt-0.5">Это действие необратимо и не может быть отменено</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 text-xs text-slate-300">
              <p>
                Вы собираетесь полностью удалить аккаунт <strong className="text-white">{currentUser.email}</strong> из системы сервиса.
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                <li>Ваш профиль и регистрационные данные будут полностью стерты.</li>
                <li>
                  Доступ ко всем купленным курсам (<strong className="text-amber-400">{purchases.length} шт.</strong>) будет безвозвратно аннулирован.
                </li>
                <li>
                  Все сохраненные закладки (<strong className="text-cyan-400">{favorites.length} шт.</strong>) будут удалены из базы.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Для подтверждения введите слово <span className="text-rose-400 font-bold uppercase">УДАЛИТЬ</span>:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  if (deleteError) setDeleteError(null);
                }}
                placeholder="Введите УДАЛИТЬ"
                disabled={isDeleting}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none uppercase font-mono tracking-wider"
              />
              {deleteError && (
                <p className="text-xs text-rose-400 font-semibold">{deleteError}</p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                  setDeleteError(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition border border-slate-700 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== 'УДАЛИТЬ'}
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/30 flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Удаление из базы...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Удалить аккаунт навсегда</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply / Re-apply Specialist Modal */}
      {isApplyModalOpen && (
        <ApplySpecialistModal
          onClose={() => {
            setIsApplyModalOpen(false);
            setIsReapplying(false);
          }}
          onSuccess={() => {
            setIsApplyModalOpen(false);
            setIsReapplying(false);
            onRefreshSpecialists?.();
          }}
          initialSpecialist={userSpecialist || masterProfile}
          isReapplying={isReapplying}
        />
      )}
    </div>
  );
};
