import React, { useState, useMemo } from 'react';
import { X, Phone, MapPin, AlertTriangle, Send, CheckCircle, Clock, Wrench, Calendar } from 'lucide-react';
import { CategoryId, PlumbingSpecialist } from '../types';
import { CATEGORIES, RUSSIAN_CITIES } from '../data/initialData';
import { getCountryByCity, getCitiesByCountry } from '../data/regionsData';
import { useAuth } from '../context/AuthContext';

interface BookMasterModalProps {
  specialist?: PlumbingSpecialist | null;
  selectedCity?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookMasterModal: React.FC<BookMasterModalProps> = ({
  specialist,
  selectedCity = 'Москва',
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    clientName: currentUser?.name || '',
    clientPhone: currentUser?.phone || '',
    city: specialist?.city || currentUser?.city || selectedCity || 'Москва',
    address: '',
    problemDescription: '',
    category: 'water' as CategoryId,
    emergency: false,
    preferredTime: 'Cегодня в ближайшее время',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.clientPhone.trim() || !formData.problemDescription.trim()) {
      alert('Пожалуйста, укажите ваше имя, телефон и опишите проблему.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userUid: currentUser?.uid,
          clientEmail: currentUser?.email,
          preferredMasterId: specialist?.id,
          preferredMasterName: specialist?.name,
          status: specialist ? 'approved' : 'pending',
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess();
        }, 3200);
      } else {
        alert('Ошибка при отправке заявки. Попробуйте снова.');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка соединения с сервером.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start min-h-screen animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 my-auto sm:my-8 space-y-6 shadow-2xl text-slate-100 relative overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 sm:py-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {specialist ? 'Заявка направлена мастеру!' : 'Заявка успешно отправлена!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {specialist ? (
                  <>
                    Ваша заявка автоматически направлена напрямую в личный кабинет мастера{' '}
                    <strong className="text-amber-400 font-bold">{specialist.name}</strong> без задержек на модерацию администратором.
                    Мастер уже получил уведомление и свяжется с вами по указанному телефону в ближайшее время.
                  </>
                ) : (
                  <>
                    Ваша заявка на вызов мастера зафиксирована и мгновенно направлена проверенным специалистам в вашем городе.
                  </>
                )}
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-emerald-500/30 text-xs text-emerald-400 font-medium inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {specialist
                  ? '⚡ Статус: Доставлено в личный кабинет мастера'
                  : '⚡ Статус: Доставлено проверенным специалистам'}
              </span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onSuccess}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md cursor-pointer"
              >
                Отлично, понятно
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
                <Wrench className="w-3.5 h-3.5" />
                <span>Заявка на выезд сантехника</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {specialist ? `Вызов мастера: ${specialist.name}` : 'Заказать вызов мастера на дом'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {specialist
                  ? 'Заявка поступит напрямую в личный кабинет мастера мгновенно, без ожидания модерации администратором'
                  : 'Заполните форму, и мы оперативно согласуем выезд проверенного специалиста'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Иван Петров"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Телефон для связи *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Город *</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    {specialist?.city && (
                      <option value={specialist.city}>
                        {specialist.city} (город мастера)
                      </option>
                    )}
                    {getCitiesByCountry(getCountryByCity(formData.city).code, RUSSIAN_CITIES).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Адрес (улица, дом, кв)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="ул. Мира, д. 10, кв. 25"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Категория работы
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryId })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Удобное время</span>
                  </label>
                  <input
                    type="text"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    placeholder="Сегодня с 15:00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Описание проблемы или задачи *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                  placeholder="Опишите поломку: протечка трубы, замена смесителя, засор, установка стиральной машины и т.д."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/30 flex items-center justify-between">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emergency}
                    onChange={(e) => setFormData({ ...formData, emergency: e.target.checked })}
                    className="w-4 h-4 text-rose-500 rounded border-slate-800 bg-slate-950 focus:ring-rose-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-rose-300 block">⚡ Аварийный срочный выезд</span>
                    <span className="text-slate-400 text-[10px]">Мастер выедет в течение 30 минут</span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Отправка заявки...' : 'Отправить заявку на вызов мастера'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
