import React, { useState } from 'react';
import {
  Star,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Send,
  Wrench,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Calendar,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ServiceCallRequest, PlumbingSpecialist, UserProfile } from '../types';

interface ServiceRequestRatingCardProps {
  request: ServiceCallRequest;
  specialist?: PlumbingSpecialist;
  currentUser?: UserProfile | null;
  onRefresh: () => void;
  onSelectSpecialist?: (specialistId: string) => void;
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

export const ServiceRequestRatingCard: React.FC<ServiceRequestRatingCardProps> = ({
  request,
  specialist,
  currentUser,
  onRefresh,
  onSelectSpecialist,
}) => {
  const isCompleted = request.status === 'completed';
  const hasRating = typeof request.rating === 'number' && request.rating >= 1 && request.rating <= 5;

  const [isEditing, setIsEditing] = useState<boolean>(!hasRating && isCompleted);
  const [selectedRating, setSelectedRating] = useState<number>(request.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState<string>(request.reviewComment || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const activeStarValue = hoverRating !== null ? hoverRating : selectedRating;
  const ratingInfo = RATING_DESCRIPTIONS[activeStarValue] || RATING_DESCRIPTIONS[5];

  const handleAddTag = (tag: string) => {
    if (reviewComment.includes(tag)) return;
    const separator = reviewComment.trim() ? '. ' : '';
    setReviewComment((prev) => `${prev.trim()}${separator}${tag}`.slice(0, 500));
  };

  const handleMarkAsCompleted = async () => {
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/service-requests/${request.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.ok) {
        setIsEditing(true);
        onRefresh();
      } else {
        alert('Не удалось изменить статус заявки.');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при связи с сервером.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setSubmitError('Пожалуйста, поставьте оценку от 1 до 5 звезд');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/service-requests/${request.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          reviewComment: reviewComment.trim(),
          userUid: currentUser?.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось сохранить отзыв');
      }

      setIsEditing(false);
      setSuccessBanner(true);
      setTimeout(() => setSuccessBanner(false), 4500);
      onRefresh();
    } catch (err: any) {
      console.error('Rating submission failed:', err);
      setSubmitError(err.message || 'Ошибка сохранения отзыва');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Ожидает диспетчера</span>
          </span>
        );
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
            <Wrench className="w-3 h-3 text-cyan-400" />
            <span>Мастер назначен / В работе</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Работы выполнены</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Отклонена</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={`service-request-${request.id}`}
      className={`rounded-3xl border transition-all duration-200 overflow-hidden shadow-xl ${
        isCompleted
          ? hasRating
            ? 'bg-slate-900/95 border-emerald-500/30 hover:border-emerald-500/50'
            : 'bg-slate-900 border-amber-500/40 hover:border-amber-500/60 ring-1 ring-amber-500/20'
          : 'bg-slate-900 border-slate-800'
      }`}
    >
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                № {request.id}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {new Date(request.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </span>
              {request.emergency && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  ⚡ Срочный выезд
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              {request.problemDescription}
            </h3>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {getStatusBadge()}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title={isExpanded ? 'Свернуть детали' : 'Развернуть детали'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Master & Location Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-300">
            {/* Master Assigned */}
            <div className="flex items-center space-x-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
              {specialist?.photo ? (
                <img
                  src={specialist.photo}
                  alt={specialist.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Исполнитель
                </span>
                <span className="block font-bold text-white truncate">
                  {request.preferredMasterName || specialist?.name || 'Любой свободный мастер'}
                </span>
                {specialist && (
                  <div className="flex items-center space-x-1 text-[11px] text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{specialist.rating.toFixed(1)}</span>
                    <span className="text-slate-500">({specialist.reviewsCount || 0} отз.)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Address & City */}
            <div className="flex items-center space-x-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Адрес выполнения
                </span>
                <span className="block font-bold text-white truncate">г. {request.city}</span>
                <span className="block text-[11px] text-slate-400 truncate">
                  {request.address || 'Адрес уточняется диспетчером'}
                </span>
              </div>
            </div>

            {/* Time / Contact */}
            <div className="flex items-center space-x-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60 sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Согласованное время
                </span>
                <span className="block font-bold text-white truncate">
                  {request.preferredTime || 'В течение дня'}
                </span>
                <span className="block text-[11px] text-slate-400 truncate">
                  Телефон: {request.clientPhone}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Body: Rating & Reviews Section */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Success Banner */}
        {successBanner && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-3 shadow-lg shadow-emerald-500/5 animate-in fade-in zoom-in-95">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-white">Спасибо за ваш отзыв!</p>
              <p className="text-[11px] text-emerald-300/90 mt-0.5">
                Ваша оценка успешно сохранена и добавлена в рейтинг мастера.
              </p>
            </div>
          </div>
        )}

        {/* Case 1: Request not yet completed */}
        {!isCompleted && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white">Заявка в процессе обработки</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Возможность поставить оценку и написать отзыв станет доступна после того, как мастер завершит работы.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isCompleting}
              onClick={handleMarkAsCompleted}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition border border-slate-700 shrink-0 flex items-center justify-center space-x-1.5 disabled:opacity-50"
              title="Нажмите, если мастер уже закончил работу на объекте"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isCompleting ? 'Обновление...' : 'Работы завершены? Оценить'}</span>
            </button>
          </div>
        )}

        {/* Case 2: Request is completed and already has a rating (and not currently editing) */}
        {isCompleted && hasRating && !isEditing && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950/90 to-slate-900 border border-emerald-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-base shadow-sm">
                  ★
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400">Ваша оценка мастеру:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <Star
                          key={starVal}
                          className={`w-4 h-4 ${
                            starVal <= (request.rating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-black text-amber-400 ml-1">
                      {request.rating}.0 / 5
                    </span>
                  </div>

                  {request.reviewedAt && (
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Отзыв оставлен {new Date(request.reviewedAt).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedRating(request.rating || 5);
                  setReviewComment(request.reviewComment || '');
                  setIsEditing(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition border border-slate-700 flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Изменить оценку</span>
              </button>
            </div>

            {request.reviewComment ? (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
                <div className="flex items-start space-x-2.5">
                  <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    «{request.reviewComment}»
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Вы поставили оценку без текстового комментария.</p>
            )}

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Отзыв проверен и зафиксирован в базе данных СантехПро</span>
            </div>
          </div>
        )}

        {/* Case 3: Request is completed and either unrated or currently being edited */}
        {isCompleted && (!hasRating || isEditing) && (
          <form
            onSubmit={handleSubmitRating}
            className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900 border border-amber-500/40 space-y-5 shadow-2xl relative overflow-hidden"
          >
            {/* Soft decorative background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{hasRating ? 'Редактирование отзыва' : 'Оценка работы мастера'}</span>
                </div>
                <h4 className="text-base font-black text-white tracking-tight">
                  Как мастер справился с поставленной задачей?
                </h4>
                <p className="text-xs text-slate-400">
                  Поставьте честную оценку от 1 до 5 звезд и напишите короткий комментарий
                </p>
              </div>

              {hasRating && isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-white transition underline self-start sm:self-auto"
                >
                  Отмена
                </button>
              )}
            </div>

            {/* Interactive Stars Selector */}
            <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800/90 space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 sm:p-1.5 rounded-xl hover:bg-slate-800/80 transition transform active:scale-95 focus:outline-none group"
                    title={`${star} из 5`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-150 ${
                        star <= activeStarValue
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] scale-110'
                          : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    />
                  </button>
                ))}

                <div className="ml-2 pl-3 border-l border-slate-800">
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    {activeStarValue}.0
                  </span>
                  <span className="text-xs text-slate-500 font-semibold ml-1">/ 5</span>
                </div>
              </div>

              {/* Dynamic Description of Selected Stars */}
              <div className="text-xs">
                <span className={`font-bold ${ratingInfo.color}`}>{ratingInfo.title}: </span>
                <span className="text-slate-400">{ratingInfo.subtitle}</span>
              </div>
            </div>

            {/* Quick Chips for Common Praise */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Быстрые теги для отзыва (нажмите для добавления):
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_REVIEW_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-800 transition flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Review Comment Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">
                  Короткий комментарий о работе мастера
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {reviewComment.length} / 500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Расскажите подробнее: приехал ли специалист вовремя, аккуратно ли работал, дал ли гарантию на работу..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none leading-relaxed resize-none"
              />
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              {hasRating && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Отмена
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-lg shadow-amber-500/20 flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{hasRating ? 'Обновить отзыв' : 'Опубликовать оценку'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
