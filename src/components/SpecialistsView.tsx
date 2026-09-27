import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, Star, ShieldCheck, UserPlus, Search, CheckCircle, ChevronDown, Wrench, Calendar, Trash2, AlertCircle, AlertTriangle, X, Sparkles, Crown, Camera, Image as ImageIcon, LocateFixed, Loader2, Navigation, RotateCw, Eye } from 'lucide-react';
import { PlumbingSpecialist, ServiceCallRequest, UserProfile, MasterWork } from '../types';
import { RUSSIAN_CITIES } from '../data/initialData';
import { DetectedCityResult, detectUserCityFromIP } from '../utils/geoCity';
import { ApplySpecialistModal } from './ApplySpecialistModal';
import { BookMasterModal } from './BookMasterModal';
import { SpecialistReviewsModal } from './SpecialistReviewsModal';
import { WorkGalleryModal } from './WorkGalleryModal';
import { SpecialistProfileModal } from './SpecialistProfileModal';

function getReviewsWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return 'отзывов';
  if (mod10 === 1) return 'отзыв';
  if (mod10 >= 2 && mod10 <= 4) return 'отзыва';
  return 'отзывов';
}

interface SpecialistsViewProps {
  specialists: PlumbingSpecialist[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onCityChange?: (city: string) => void;
  onRefresh: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  isAdmin?: boolean;
  currentUser?: UserProfile | null;
  serviceRequests?: ServiceCallRequest[];
  onOpenAuthModal?: (mode: 'login' | 'register', reason?: string) => void;
  detectedCityInfo?: DetectedCityResult | null;
  isDetectingCity?: boolean;
  onDetectCity?: () => Promise<void>;
}

export const SpecialistsView: React.FC<SpecialistsViewProps> = ({
  specialists,
  selectedCity,
  setSelectedCity,
  onCityChange,
  onRefresh,
  searchQuery: propSearchQuery,
  onSearchQueryChange,
  isAdmin = false,
  currentUser,
  serviceRequests = [],
  onOpenAuthModal,
  detectedCityInfo,
  isDetectingCity = false,
  onDetectCity,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;
  const setSearchQuery = (val: string) => {
    setLocalSearchQuery(val);
    onSearchQueryChange?.(val);
  };
  const [onlyEmergency, setOnlyEmergency] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyHighRating, setOnlyHighRating] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [moderationSuccessBanner, setModerationSuccessBanner] = useState<{ masterName: string } | null>(null);
  const [bookModalSpecialist, setBookModalSpecialist] = useState<PlumbingSpecialist | null | undefined>(undefined);
  const [selectedReviewsSpecialist, setSelectedReviewsSpecialist] = useState<PlumbingSpecialist | null>(null);
  const [selectedProfileSpecialist, setSelectedProfileSpecialist] = useState<PlumbingSpecialist | null>(null);
  const [masterWorks, setMasterWorks] = useState<MasterWork[]>([]);
  const [selectedGalleryWork, setSelectedGalleryWork] = useState<MasterWork | null>(null);

  // Fallback internal geo detection if not provided from parent
  const [internalDetecting, setInternalDetecting] = useState(false);
  const [internalCityInfo, setInternalCityInfo] = useState<DetectedCityResult | null>(null);

  const activeCityInfo = detectedCityInfo !== undefined ? detectedCityInfo : internalCityInfo;
  const detecting = isDetectingCity || internalDetecting;

  const handleSelectCity = async (cityName: string) => {
    setSelectedCity(cityName);
    onCityChange?.(cityName);
    localStorage.setItem('santehpro_selected_city', cityName);
    localStorage.setItem('santehpro_city_confirmed', 'true');
    if (currentUser?.uid) {
      localStorage.setItem(`santehpro_city_confirmed_user_${currentUser.uid}`, 'true');
      try {
        await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: currentUser.uid, city: cityName }),
        });
      } catch (err) {
        console.error('Failed to sync city to user profile:', err);
      }
    }
  };

  const handleDetect = async () => {
    if (onDetectCity) {
      await onDetectCity();
      return;
    }
    setInternalDetecting(true);
    try {
      const res = await detectUserCityFromIP();
      if (res) {
        setInternalCityInfo(res);
        await handleSelectCity(res.nearestCity);
      }
    } finally {
      setInternalDetecting(false);
    }
  };

  useEffect(() => {
    fetch('/api/master-works')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMasterWorks(data);
      })
      .catch((err) => console.error('Failed to load master works for directory:', err));
  }, []);

  // Delete master state
  const [deleteTarget, setDeleteTarget] = useState<PlumbingSpecialist | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleConfirmDeleteMaster = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/specialists/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Мастер «${deleteTarget.name}» навсегда удалён. В базе данных сохранена запись: когда зарегистрировался и когда был удален.`);
        setDeleteTarget(null);
        onRefresh();
      } else {
        showToast('Ошибка при удалении мастера из базы данных.');
      }
    } catch (err) {
      console.error('Failed to delete specialist:', err);
      showToast('Ошибка сети при удалении мастера.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = specialists.filter((s) => {
    // Public directory only shows approved and active (not suspended/deleted) specialists
    if (s.status !== 'approved') return false;

    const normalizeCity = (cityName: string) =>
      cityName.replace(/^г\.\s*/i, '').trim().toLowerCase();

    const matchesCity =
      selectedCity === 'Все города' ||
      normalizeCity(s.city) === normalizeCity(selectedCity) ||
      s.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.services.some((serv) => serv.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEmerg = !onlyEmergency || s.emergency247;
    const matchesVerif = !onlyVerified || s.verified;
    const matchesRating = !onlyHighRating || Number(s.rating) >= 4.8;

    return matchesCity && matchesSearch && matchesEmerg && matchesVerif && matchesRating;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Moderation Application Success Banner */}
      {moderationSuccessBanner && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-xl animate-in fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Заявка на модерацию успешно принята!
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {moderationSuccessBanner.masterName ? `Анкета мастера «${moderationSuccessBanner.masterName}» ` : 'Ваша анкета '}
                зарегистрирована. Согласие с Пользовательским соглашением и 152-ФЗ сохранено в базе данных для административного аудита. Администратору портала направлено электронное уведомление на e-mail.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModerationSuccessBanner(null)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition cursor-pointer self-end sm:self-auto shrink-0"
          >
            Понятно, закрыть
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* City Dropdown Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Выбор города</span>
            </label>

            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => handleSelectCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer shadow-inner appearance-none"
              >
                {RUSSIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Search Input */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Поиск мастера</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени или услуге (например: аварийный, замена труб, Rehau)..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={onlyEmergency}
                onChange={(e) => setOnlyEmergency(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
              />
              <span>⚡ Аварийный выезд 24/7</span>
            </label>

            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
              />
              <span>🛡️ Только проверенные админом</span>
            </label>

            <label className="flex items-center space-x-2 text-amber-300/90 cursor-pointer hover:text-amber-200">
              <input
                type="checkbox"
                checked={onlyHighRating}
                onChange={(e) => setOnlyHighRating(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <span>⭐ Высокий рейтинг 4.8+</span>
            </label>
          </div>

          <span className="text-slate-400">
            Специалистов в категории: <strong className="text-white">{filtered.length}</strong>
          </span>
        </div>
      </div>

      {/* Specialists List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <MapPin className="w-6 h-6 text-slate-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">В городе {selectedCity} пока нет зарегистрированных мастеров</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Вы можете переключиться на режим «Все города» для поиска по всей России или оставить заявку на вызов.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {selectedCity !== 'Все города' && (
              <button
                onClick={() => setSelectedCity('Все города')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition border border-slate-700"
              >
                Показать мастеров по всей России
              </button>
            )}

            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition shadow-sm"
            >
              Подать заявку мастера
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((spec) => {
            const specWorks = masterWorks.filter(
              (w) => (w.specialistId === spec.id || (!w.specialistId && spec.id === 'spec-1')) && w.status === 'approved'
            );

            return (
              <div
                key={spec.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition p-4 sm:p-5 flex flex-col justify-between shadow-md gap-3.5 group/card"
              >
                <div className="space-y-3">
                  {/* Header info: Avatar, Name, Rating, City */}
                  <div
                    className="flex items-start space-x-3 cursor-pointer group/cardhead"
                    onClick={() => setSelectedProfileSpecialist(spec)}
                    title="Нажмите, чтобы открыть профиль специалиста"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={spec.photo}
                        alt={spec.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-700 group-hover/cardhead:border-cyan-500/60 transition shadow-sm"
                      />
                      {spec.verified && (
                        <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 p-0.5 rounded-full shadow" title="Проверен">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white truncate group-hover/cardhead:text-cyan-300 transition">
                        {spec.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReviewsSpecialist(spec);
                          }}
                          className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 font-bold text-[11px] transition cursor-pointer"
                          title="Посмотреть отзывы и оценки"
                        >
                          <Star className="w-3 h-3 fill-current text-amber-400" />
                          <span>{spec.rating > 0 ? spec.rating : '5.0'}</span>
                          <span className="text-slate-400 font-normal">
                            ({spec.reviewsCount || 0})
                          </span>
                        </button>
                        <span>•</span>
                        <span className="text-[11px]">Стаж {spec.experienceYears} лет</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">г. {spec.city}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {spec.verified && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-cyan-400" />
                        <span>ПРОВЕРЕН</span>
                      </span>
                    )}
                    {spec.emergency247 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        ⚡ Выезд 24/7
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300">
                      от {spec.minPrice} ₽
                    </span>
                    {specWorks.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedProfileSpecialist(spec)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700/60 flex items-center gap-1 transition cursor-pointer"
                        title="Посмотреть примеры выполненных работ"
                      >
                        <Camera className="w-3 h-3 text-cyan-400" />
                        <span>Примеры работ ({specWorks.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Compact Services List (top 3 + button to view more) */}
                  {spec.services && spec.services.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      {spec.services.slice(0, 3).map((serv, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[11px] border border-slate-800 truncate max-w-[170px]"
                        >
                          {serv}
                        </span>
                      ))}
                      {spec.services.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setSelectedProfileSpecialist(spec)}
                          className="px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-medium border border-cyan-500/25 transition cursor-pointer"
                          title="Нажмите, чтобы увидеть полный список услуг в анкете"
                        >
                          + ещё {spec.services.length - 3}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Contact buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProfileSpecialist(spec)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm cursor-pointer"
                    title="Посмотреть полный профиль, все услуги, отзывы и работы"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Посмотреть</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedReviewsSpecialist(spec)}
                    className="py-2.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs flex items-center justify-center space-x-1 transition cursor-pointer"
                    title="Посмотреть отзывы и оценки"
                  >
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>({spec.reviewsCount || 0})</span>
                  </button>

                  <a
                    href={`tel:${spec.phone}`}
                    className="py-2.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-bold text-xs flex items-center justify-center transition"
                    title="Позвонить прямо сейчас"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  {spec.telegram && (
                    <a
                      href={`https://t.me/${spec.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold flex items-center justify-center transition"
                      title="Написать в Telegram"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => setDeleteTarget(spec)}
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center justify-center transition cursor-pointer"
                      title="Удалить мастера навсегда"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Become a Specialist CTA Card at the END after scrolling all specialists */}
      <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Для частных мастеров и сервисных служб</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Вы сантехник и ищете новые заказы?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Разместите свою анкету в едином каталоге специалистов. Укажите город, стаж работы, список выполняемых услуг и контакты, чтобы клиенты могли обращаться к вам напрямую без комиссий и посредников.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Заполнить анкету и стать мастером</span>
        </button>
      </div>

      {/* Book Master Call Modal */}
      {bookModalSpecialist !== undefined && (
        <BookMasterModal
          specialist={bookModalSpecialist}
          selectedCity={selectedCity}
          onClose={() => setBookModalSpecialist(undefined)}
          onSuccess={() => {
            setBookModalSpecialist(undefined);
            onRefresh();
          }}
        />
      )}

      {/* Apply Specialist Modal */}
      {showApplyModal && (
        <ApplySpecialistModal
          onClose={() => setShowApplyModal(false)}
          onSuccess={(masterName) => {
            setShowApplyModal(false);
            setModerationSuccessBanner({ masterName: masterName || '' });
            onRefresh();
          }}
        />
      )}

      {/* Delete Master Permanent Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 animate-in zoom-in-95 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Удаление мастера из базы данных
                  </h3>
                  <p className="text-xs text-slate-400">
                    Подтверждение безвозвратного удаления
                  </p>
                </div>
              </div>

              <button
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specialist Details Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-3">
                <img
                  src={deleteTarget.photo}
                  alt={deleteTarget.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {deleteTarget.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    г. {deleteTarget.city} • {deleteTarget.phone}
                  </p>
                  <p className="text-[11px] text-cyan-400 mt-0.5">
                    Зарегистрирован: {deleteTarget.appliedAt || (deleteTarget.consentTimestamp ? new Date(deleteTarget.consentTimestamp).toLocaleDateString('ru-RU') : 'Ранее')}
                  </p>
                </div>
              </div>
            </div>

            {/* Legal / Audit Warning */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start space-x-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-rose-200">
                  Мастер удаляется навсегда!
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Мастер будет безвозвратно удален из активного каталога, поиска и мобильного приложения. В базе данных останется <strong>только информация о мастере: когда он зарегистрировался и когда был удален</strong>.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteMaster}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow-lg shadow-rose-600/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {isDeleting ? 'Удаление...' : 'Да, удалить мастера навсегда'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specialist Reviews & Ratings Modal */}
      {selectedReviewsSpecialist && (
        <SpecialistReviewsModal
          specialist={selectedReviewsSpecialist}
          currentUser={currentUser}
          userRequests={serviceRequests}
          onClose={() => setSelectedReviewsSpecialist(null)}
          onRefresh={onRefresh}
          onOpenAuthModal={onOpenAuthModal}
        />
      )}

      {/* Specialist Profile Modal */}
      {selectedProfileSpecialist && (
        <SpecialistProfileModal
          specialist={selectedProfileSpecialist}
          onClose={() => setSelectedProfileSpecialist(null)}
          onBookMaster={(spec) => setBookModalSpecialist(spec)}
          onOpenReviews={(spec) => setSelectedReviewsSpecialist(spec)}
          masterWorks={masterWorks}
          currentUser={currentUser}
        />
      )}

      {/* Work Gallery Modal (up to 15 photos) */}
      {selectedGalleryWork && (
        <WorkGalleryModal
          work={selectedGalleryWork}
          onClose={() => setSelectedGalleryWork(null)}
          onBookSpecialist={(specId) => {
            const found = specialists.find((s) => s.id === specId);
            setSelectedGalleryWork(null);
            if (found) setBookModalSpecialist(found);
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl text-xs flex items-center space-x-3 animate-in slide-in-from-bottom-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="leading-snug">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

