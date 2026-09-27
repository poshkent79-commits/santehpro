import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  Send,
  AlertCircle,
  ShieldCheck,
  Filter,
  Wrench,
} from 'lucide-react';
import { PlumbingSpecialist, ServiceCallRequest, SpecialistReview, UserProfile } from '../types';

interface SpecialistReviewsModalProps {
  specialist: PlumbingSpecialist;
  currentUser?: UserProfile | null;
  userRequests?: ServiceCallRequest[];
  onClose: () => void;
  onRefresh: () => void;
  onOpenAuthModal?: (mode: 'login' | 'register', reason?: string) => void;
}

const RATING_DESCRIPTIONS: Record<number, { title: string; subtitle: string; color: string }> = {
  1: {
    title: '1 звезда — Ужасно',
    subtitle: 'Работа не выполнена или качество неудовлетворительное',
    color: 'text-rose-400',
  },
  2: {
    title: '2 звезды — Плохо',
    subtitle: 'Возникли серьезные замечания к работе или срокам',
    color: 'text-orange-400',
  },
  3: {
    title: '3 звезды — Удовлетворительно',
    subtitle: 'Поломка устранена, но есть замечания по процессу',
    color: 'text-amber-400',
  },
  4: {
    title: '4 звезды — Хорошо',
    subtitle: 'Качественная работа, мелкие недочеты не критичны',
    color: 'text-emerald-400',
  },
  5: {
    title: '5 звезд — Отлично!',
    subtitle: 'Безупречный результат, пунктуальность, рекомендую мастера',
    color: 'text-amber-300',
  },
};

const QUICK_REVIEW_TAGS = [
  '⚡ Быстро и профессионально',
  '⏱️ Приехал точно ко времени',
  '✨ Чистая и опрятная работа',
  '🤝 Вежливый специалист',
  '💡 Дал полезные рекомендации',
  '🔧 Честная цена без накруток',
];

export const SpecialistReviewsModal: React.FC<SpecialistReviewsModalProps> = ({
  specialist,
  currentUser,
  userRequests = [],
  onClose,
  onRefresh,
  onOpenAuthModal,
}) => {
  const [reviews, setReviews] = useState<SpecialistReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeStarFilter, setActiveStarFilter] = useState<number | 'all'>('all');

  // New review form states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [clientName, setClientName] = useState<string>(currentUser?.name || '');
  const [clientCity, setClientCity] = useState<string>(currentUser?.city || specialist.city || 'Москва');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Completed requests of current user for this specialist
  const masterUserRequests = userRequests.filter(
    (r) => r.preferredMasterId === specialist.id || r.preferredMasterName === specialist.name
  );
  const unratedCompletedRequest = masterUserRequests.find(
    (r) => r.status === 'completed' && !r.rating
  );

  useEffect(() => {
    if (unratedCompletedRequest) {
      setSelectedRequestId(unratedCompletedRequest.id);
      setIsFormOpen(true);
    }
  }, [unratedCompletedRequest]);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/specialists/${specialist.id}/reviews`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.reviews)) {
            setReviews(data.reviews);
          }
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [specialist.id]);

  const activeStarValue = hoverRating !== null ? hoverRating : rating;
  const currentRatingDesc = RATING_DESCRIPTIONS[activeStarValue] || RATING_DESCRIPTIONS[5];

  const handleAddTag = (tag: string) => {
    if (comment.includes(tag)) return;
    const separator = comment.trim() ? '. ' : '';
    setComment((prev) => `${prev.trim()}${separator}${tag}`.slice(0, 600));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!rating || rating < 1 || rating > 5) {
      setSubmitError('Пожалуйста, выберите оценку от 1 до 5 звезд.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setSubmitError('Пожалуйста, напишите краткий комментарий о выполненной работе (минимум 5 символов).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/specialists/${specialist.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          clientName: clientName.trim() || 'Клиент сервиса',
          clientCity: clientCity.trim() || specialist.city,
          serviceRequestId: selectedRequestId || undefined,
          userUid: currentUser?.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось сохранить отзыв');
      }

      setSubmitSuccess('Спасибо! Ваш отзыв и оценка успешно опубликованы.');
      if (data.review) {
        setReviews((prev) => [data.review, ...prev.filter((r) => r.id !== data.review.id)]);
      }
      setComment('');
      setIsFormOpen(false);
      onRefresh();

      setTimeout(() => setSubmitSuccess(null), 5000);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Ошибка отправки отзыва');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rating metrics calculations
  const totalReviewsCount = reviews.length;
  const averageRating =
    totalReviewsCount > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviewsCount).toFixed(1)
      : Number(specialist.rating || 5.0).toFixed(1);

  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  const filteredReviews = reviews.filter((r) => {
    if (activeStarFilter === 'all') return true;
    return Math.round(r.rating) === activeStarFilter;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="relative shrink-0">
              <img
                src={specialist.photo}
                alt={specialist.name}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-700 shadow-md"
              />
              {specialist.verified && (
                <span
                  className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 p-0.5 rounded-full shadow"
                  title="Проверенный специалист"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white">{specialist.name}</h3>
                {specialist.verified && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Проверен
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>г. {specialist.city}</span>
                </span>
                <span>•</span>
                <span>Стаж {specialist.experienceYears} лет</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          {/* Rating Summary Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 shadow-inner grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Big Score */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center sm:border-r sm:border-slate-800/80 pr-0 sm:pr-4">
              <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">
                {averageRating}
              </div>
              <div className="flex items-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      s <= Math.round(Number(averageRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                На основе <strong className="text-white">{totalReviewsCount}</strong>{' '}
                {totalReviewsCount === 1 ? 'оценки' : totalReviewsCount < 5 ? 'оценок' : 'отзывов'} клиентов
              </p>

              <button
                type="button"
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="mt-3.5 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isFormOpen ? 'Скрыть форму' : 'Оставить отзыв о мастере'}</span>
              </button>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="md:col-span-7 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[star] || 0;
                const percent = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                const isSelected = activeStarFilter === star;

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setActiveStarFilter(isSelected ? 'all' : star)}
                    className={`w-full flex items-center space-x-2 text-xs py-1 px-2 rounded-lg transition text-left ${
                      isSelected ? 'bg-amber-500/15 ring-1 ring-amber-500/40' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="w-6 font-bold text-slate-300 flex items-center space-x-0.5">
                      <span>{star}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-slate-400 text-[11px] font-mono">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unrated Request Notification Alert */}
          {unratedCompletedRequest && !isFormOpen && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>У вас есть выполненная заявка №{unratedCompletedRequest.id}!</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  Пожалуйста, оцените качество работы мастера «{specialist.name}».
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRequestId(unratedCompletedRequest.id);
                  setIsFormOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition"
              >
                Оценить
              </button>
            </div>
          )}

          {/* Review Submission Form Drawer */}
          {isFormOpen && (
            <form
              onSubmit={handleSubmitReview}
              className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Ваш отзыв о работе специалиста</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Отмена
                </button>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Ваша оценка качества и пунктуальности:
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= activeStarValue;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 rounded-lg hover:scale-110 transition transform focus:outline-none"
                        title={`${star} звезд`}
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-slate-700 hover:text-slate-500'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className={`text-xs font-bold ml-2 ${currentRatingDesc.color}`}>
                    {currentRatingDesc.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{currentRatingDesc.subtitle}</p>
              </div>

              {/* Quick Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Быстрые тезисы:</span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REVIEW_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name and City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Ваше имя:</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Например: Иван П."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Город:</label>
                  <input
                    type="text"
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    placeholder="Город выполнения работ"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Service Request Link Picker */}
              {masterUserRequests.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Привязать к заявке на вызов мастера:
                  </label>
                  <select
                    value={selectedRequestId}
                    onChange={(e) => setSelectedRequestId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">Без привязки (прямой отзыв)</option>
                    {masterUserRequests.map((req) => (
                      <option key={req.id} value={req.id}>
                        Заявка №{req.id} ({req.problemDescription.slice(0, 45)}...)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Comment Textarea */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Текстовый отзыв о выполненной работе:
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Опишите, какую работу выполнил специалист, соблюдение сроков, аккуратность и ваши впечатления..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Публикация...' : 'Опубликовать отзыв'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Filter / Header of list */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-300 font-bold">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>
                Отзывы клиентов{' '}
                {activeStarFilter !== 'all' ? `(${activeStarFilter} звезд)` : `(${filteredReviews.length})`}
              </span>
            </div>

            {activeStarFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveStarFilter('all')}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Показать все ({reviews.length})
              </button>
            )}
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Загрузка отзывов специалиста...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {activeStarFilter !== 'all'
                  ? `Пока нет отзывов с оценкой ${activeStarFilter} звезд.`
                  : 'У этого мастера пока нет опубликованных отзывов.'}
              </p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition"
              >
                Оставить первый отзыв
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition space-y-3 shadow-sm"
                >
                  {/* Top line: Author, City, Stars, Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {rev.clientName ? rev.clientName.charAt(0).toUpperCase() : 'К'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{rev.clientName}</span>
                          {rev.verifiedBooking && (
                            <span
                              className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              title="Заказ выполнен через платформу СантехПро"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Выполненная заявка</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>г. {rev.clientCity || specialist.city}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:self-auto self-start">
                      <div className="flex items-center space-x-0.5">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star
                            key={st}
                            className={`w-3.5 h-3.5 ${
                              st <= (rev.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(rev.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Problem Description badge if exists */}
                  {rev.problemDescription && (
                    <div className="text-[11px] text-cyan-300 bg-cyan-950/30 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                      <strong className="text-slate-400 font-medium">Работы: </strong>
                      {rev.problemDescription}
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-xs text-slate-300 leading-relaxed pl-1 border-l-2 border-amber-500/40">
                    «{rev.comment}»
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Все отзывы проверены модератором портала</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
