import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Wrench,
  CheckCircle,
  Camera,
  Calendar,
  Award,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Send,
  User,
  Zap,
} from 'lucide-react';
import { PlumbingSpecialist, MasterWork, UserProfile } from '../types';
import { WorkGalleryModal } from './WorkGalleryModal';

interface SpecialistProfileModalProps {
  specialist: PlumbingSpecialist;
  onClose: () => void;
  onBookMaster?: (spec: PlumbingSpecialist) => void;
  onOpenReviews?: (spec: PlumbingSpecialist) => void;
  masterWorks?: MasterWork[];
  currentUser?: UserProfile | null;
}

export const SpecialistProfileModal: React.FC<SpecialistProfileModalProps> = ({
  specialist,
  onClose,
  onBookMaster,
  onOpenReviews,
  masterWorks = [],
  currentUser,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [selectedGalleryWork, setSelectedGalleryWork] = useState<MasterWork | null>(null);

  const cleanTelegram = specialist.telegram ? specialist.telegram.replace('@', '').trim() : '';
  const cleanWhatsapp = specialist.whatsapp ? specialist.whatsapp.replace(/\D/g, '').trim() : '';

  const handleCopyPhone = () => {
    if (!specialist.phone) return;
    navigator.clipboard.writeText(specialist.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Find works belonging to this specialist
  const works = masterWorks.filter(
    (w) =>
      (w.specialistId === specialist.id || (!w.specialistId && specialist.id === 'spec-1')) &&
      w.status === 'approved'
  );

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-5 sm:p-7 border-b border-slate-800 bg-gradient-to-b from-slate-850 to-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer z-10"
              title="Закрыть профиль"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 pr-10">
              <div className="relative shrink-0">
                <img
                  src={specialist.photo}
                  alt={specialist.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl object-cover border-2 border-slate-700 shadow-xl"
                />
                {specialist.verified && (
                  <span
                    className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 p-1 rounded-full shadow-lg"
                    title="Проверенный мастер СантехПро"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {specialist.name}
                  </h2>
                  {specialist.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Проверен</span>
                    </span>
                  )}
                  {specialist.emergency247 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Выезд 24/7</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>г. {specialist.city}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Стаж {specialist.experienceYears} лет</span>
                  </span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenReviews?.(specialist)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 font-bold transition cursor-pointer"
                    title="Посмотреть отзывы"
                  >
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>{specialist.rating > 0 ? specialist.rating : '5.0'}</span>
                    <span className="text-slate-400 font-normal">
                      ({specialist.reviewsCount || 0} отзывов)
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Минимальный заказ</span>
                <span className="text-base sm:text-lg font-black text-cyan-400 mt-0.5 block">
                  от {specialist.minPrice || 1000} ₽
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Опыт в сантехнике</span>
                <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
                  {specialist.experienceYears} лет
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">График работы</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 block">
                  {specialist.emergency247 ? 'Круглосуточно (24/7)' : 'С 08:00 до 21:00'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Гарантия на монтаж</span>
                <span className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5 block">
                  До 24 месяцев
                </span>
              </div>
            </div>

            {/* Contact Information & Action Buttons */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Контактная информация для связи</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone Call Button */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Прямой телефон мастера</span>
                      <a
                        href={`tel:${specialist.phone}`}
                        className="text-sm font-black text-white hover:text-cyan-300 transition font-mono"
                      >
                        {specialist.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Скопировать номер телефона"
                    >
                      {copiedPhone ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`tel:${specialist.phone}`}
                      className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1"
                    >
                      <span>Позвонить</span>
                    </a>
                  </div>
                </div>

                {/* Messengers: Telegram / WhatsApp */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Мессенджеры для сообщений</span>
                      <span className="text-xs font-bold text-slate-300">
                        {cleanTelegram ? `@${cleanTelegram}` : specialist.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {cleanTelegram && (
                      <a
                        href={`https://t.me/${cleanTelegram}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-bold text-xs transition flex items-center gap-1"
                        title="Написать в Telegram"
                      >
                        <span>Telegram</span>
                      </a>
                    )}
                    {cleanWhatsapp && (
                      <a
                        href={`https://wa.me/${cleanWhatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition flex items-center gap-1"
                        title="Написать в WhatsApp"
                      >
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Order Callout Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Хотите вызвать этого мастера?</span>
                </span>
                <p className="text-xs text-slate-300 max-w-md">
                  Оставьте быструю заявку — мастер согласует удобное время выезда, стоимость материалов и проведёт диагностику на объекте.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookMaster?.(specialist);
                }}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Оставить заявку на вызов</span>
              </button>
            </div>

            {/* List of Services */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Перечень оказываемых услуг ({specialist.services?.length || 0})</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Прайс от {specialist.minPrice || 1000} ₽</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {specialist.services && specialist.services.length > 0 ? (
                  specialist.services.map((serv, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-xs font-semibold text-white">{serv}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                        от {specialist.minPrice || 1000} ₽
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Услуги уточняются при вызове мастера.</p>
                )}
              </div>
            </div>

            {/* About Master (Bio) */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>О мастере и квалификации</span>
              </h3>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
                <p>{specialist.bio || 'Профессиональный специалист по сантехническим работам высокой сложности. Выполняет монтаж, ремонт и сервисное обслуживание водопровода, отопления и канализации.'}</p>
                <div className="pt-2 border-t border-slate-800/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Профессиональный инструмент и пресс-клещи</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Помощь в подборе и закупке материалов со скидкой</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Уборка рабочего места и чистота после монтажа</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Консультация и выезд на замер объекта</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Works */}
            {works.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Примеры выполненных работ ({works.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">до 10 фото на работу</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {works.map((work) => (
                    <div
                      key={work.id}
                      onClick={() => setSelectedGalleryWork(work)}
                      className="group rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 transition overflow-hidden cursor-pointer shadow-md flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={work.photos[0]}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-cyan-300 font-bold text-[10px] border border-slate-700 flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          <span>{work.photos.length} фото</span>
                        </div>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                          {work.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {work.description}
                        </p>
                        {work.completedAt && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Завершено: {work.completedAt}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section Card */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">
                      {specialist.rating > 0 ? specialist.rating : '5.0'} из 5.0
                    </span>
                    <span className="text-xs text-slate-400">
                      ({specialist.reviewsCount || 0} оценок клиентов)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ознакомьтесь с подробными отзывами заказчиков или оставьте свой
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenReviews?.(specialist)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs transition shrink-0 cursor-pointer"
              >
                Отзывы
              </button>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Закрыть
            </button>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${specialist.phone}`}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Позвонить</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookMaster?.(specialist);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Вызвать мастера</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for Works from Profile */}
      {selectedGalleryWork && (
        <WorkGalleryModal
          work={selectedGalleryWork}
          onClose={() => setSelectedGalleryWork(null)}
          onBookSpecialist={(specId) => {
            setSelectedGalleryWork(null);
            onClose();
            onBookMaster?.(specialist);
          }}
        />
      )}
    </>
  );
};
