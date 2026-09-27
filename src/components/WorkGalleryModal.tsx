import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, User, CheckCircle, Tag, Phone } from 'lucide-react';
import { MasterWork, PlumbingSpecialist } from '../types';

interface WorkGalleryModalProps {
  work: MasterWork | null;
  specialist?: PlumbingSpecialist | null;
  onClose: () => void;
  onBookSpecialist?: (specialist: PlumbingSpecialist) => void;
}

export const WorkGalleryModal: React.FC<WorkGalleryModalProps> = ({
  work,
  specialist,
  onClose,
  onBookSpecialist,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!work) return null;

  const photos = work.photos && work.photos.length > 0 ? work.photos : [];
  const currentPhoto = photos[activePhotoIdx] || photos[0] || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const getCategoryLabel = (cat?: string) => {
    switch (cat) {
      case 'water':
        return 'Водоснабжение';
      case 'heating':
        return 'Отопление';
      case 'drainage':
        return 'Канализация';
      case 'bath':
        return 'Санфаянс и ванны';
      case 'filtration':
        return 'Фильтрация';
      default:
        return 'Сантехника';
    }
  };

  return (
    <div
      id="work-gallery-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="work-gallery-modal-content"
        className="relative bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3 pr-4">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {getCategoryLabel(work.category)}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
              {work.title}
            </h3>
          </div>
          <button
            id="close-work-gallery-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery Viewport */}
        <div className="relative bg-black flex-1 min-h-[300px] max-h-[480px] sm:max-h-[520px] flex items-center justify-center overflow-hidden select-none">
          <img
            src={currentPhoto}
            alt={work.title}
            className="max-h-full max-w-full object-contain transition-opacity duration-200"
          />

          {photos.length > 1 && (
            <>
              <button
                id="gallery-prev-photo-btn"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 text-white hover:bg-blue-600 transition-all shadow-lg border border-slate-700"
                title="Предыдущее фото"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                id="gallery-next-photo-btn"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 text-white hover:bg-blue-600 transition-all shadow-lg border border-slate-700"
                title="Следующее фото"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/85 text-xs text-slate-200 border border-slate-700/60 font-medium">
                {activePhotoIdx + 1} из {photos.length} фото
              </div>
            </>
          )}
        </div>

        {/* Thumbnails Bar (if multiple photos, up to 15) */}
        {photos.length > 1 && (
          <div className="flex items-center gap-2 p-3 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto">
            {photos.map((p, idx) => (
              <button
                key={idx}
                id={`gallery-thumb-${idx}`}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  activePhotoIdx === idx
                    ? 'border-blue-500 scale-105 shadow-md'
                    : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-0.5 right-1 text-[10px] text-white/90 font-mono drop-shadow">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Work Description & Master Details */}
        <div className="p-5 bg-slate-900 space-y-3 overflow-y-auto max-h-[220px]">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200">
                {work.specialistName || specialist?.name || 'Проверенный мастер'}
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" /> Проверено
              </span>
            </div>
            {work.completedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Выполнено: {work.completedAt}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {work.description}
          </p>

          {specialist && onBookSpecialist && (
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Понравилось качество работы? Закажите вызов мастера:
              </span>
              <button
                id="book-master-from-gallery-btn"
                onClick={() => {
                  onClose();
                  onBookSpecialist(specialist);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-md hover:shadow-blue-500/20"
              >
                <Phone className="w-3.5 h-3.5" />
                Вызвать мастера на объект
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
