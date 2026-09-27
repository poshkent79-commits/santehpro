import React, { useState, useRef } from 'react';
import {
  X,
  User,
  MapPin,
  Phone,
  ShieldCheck,
  DollarSign,
  Send,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Lock,
  AlertCircle,
  Scale,
  Upload,
  Trash2,
  ExternalLink,
  FileCheck,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { RUSSIAN_CITIES } from '../data/initialData';
import { SpecialistVerificationDoc } from '../types';
import { LegalTermsModal } from './LegalTermsModal';
import { PLATFORM_LEGAL_DETAILS } from '../data/legalTerms';
import { useAuth } from '../context/AuthContext';

interface ApplySpecialistModalProps {
  onClose: () => void;
  onSuccess: (masterName?: string) => void;
}

export const ApplySpecialistModal: React.FC<ApplySpecialistModalProps> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    city: currentUser?.city || 'Москва',
    phone: currentUser?.phone || '',
    telegram: '',
    whatsapp: '',
    experienceYears: 5,
    minPrice: 1000,
    emergency247: true,
    services: 'Замена смесителей, Устранение протечек, Пайка полипропилена',
    bio: '',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
  });

  // Verification Documents (Up to 3 files)
  const [verificationDocs, setVerificationDocs] = useState<SpecialistVerificationDoc[]>([]);
  const [docTypeToUpload, setDocTypeToUpload] = useState<string>('Паспорт / Удостоверение');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Main Photo State
  const [customPhotoSelected, setCustomPhotoSelected] = useState(false);

  // Separate Legal Agreement states matching registration (152-FZ + Terms of Use)
  const [dataConsentAccepted, setDataConsentAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [legalDocType, setLegalDocType] = useState<'privacy' | 'terms'>('privacy');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Главная фотография должна быть изображением (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
        setCustomPhotoSelected(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (verificationDocs.length >= 3) {
      setError('Вы можете прикрепить не более трёх файлов подтверждающих документов.');
      return;
    }

    const file = files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const newDoc: SpecialistVerificationDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: docTypeToUpload as any,
        size: `${(file.size / 1024).toFixed(1)} КБ`,
        uploadedAt: new Date().toLocaleDateString('ru-RU'),
        status: 'pending',
        dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
      };

      setVerificationDocs((prev) => [...prev, newDoc].slice(0, 3));
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (id: string) => {
    setVerificationDocs((prev) => prev.filter((d) => d.id !== id));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Пожалуйста, укажите ваше ФИО и номер контактного телефона.');
      return;
    }

    if (!dataConsentAccepted || !termsAccepted) {
      setError(
        'Для завершения подачи заявки необходимо подтвердить оба пункта: согласие на обработку персональных данных (152-ФЗ) и согласие с Пользовательским соглашением платформы.'
      );
      return;
    }

    setLoading(true);

    try {
      const servicesArray = formData.services
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const nowTimestamp = new Date().toISOString();

      const res = await fetch('/api/specialists/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email: currentUser?.email,
          userUid: currentUser?.uid,
          services: servicesArray,
          dataConsent: true,
          consentTimestamp: nowTimestamp,
          legalConsent: true,
          legalConsentTimestamp: nowTimestamp,
          legalChecklist: {
            dataConsentAccepted: true,
            termsAccepted: true,
            independentContractor: true,
            siteLiability: true,
            platformIndemnity: true,
            authenticDocuments: true,
            version: '2.1-LEGAL-AUDIT',
          },
          verificationDocs: verificationDocs.map((doc) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            size: doc.size,
            uploadedAt: doc.uploadedAt,
            status: doc.status,
            dataUrl: doc.dataUrl,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Ошибка при отправке заявки.');
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка соединения с сервером. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start min-h-screen animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 my-auto sm:my-8 space-y-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          title="Закрыть окно"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-4 space-y-5 animate-in fade-in zoom-in-95">
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Заявка на модерацию успешно принята!
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    Анкета мастера поступила в систему и направлена администратору
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs text-slate-300 space-y-2.5 leading-relaxed">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Юридическая фиксация:</strong> Согласие с Пользовательским соглашением и согласие на обработку персональных данных (152-ФЗ) сохранены в базе данных для целей административного аудита.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>E-mail уведомление администратору:</strong> Администратору сервиса автоматически направлено подробное электронное письмо со всеми параметрами вашей анкеты.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Публикация в каталоге:</strong> После проверки квалификации профиль мастера активируется в городе <strong>г. {formData.city}</strong>.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSuccess(formData.name)}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Понятно, закрыть</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Модерация администрацией</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Стать мастером в вашем городе</h2>
              <p className="text-xs text-slate-400 mt-1">
                Заполните анкету специалиста, чтобы получать заказы от жильцов в вашем городе.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Main Photo Upload Section */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white flex items-center space-x-1.5">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Главная фотография мастера * (будут видеть пользователи)</span>
                  </label>
                  <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Отображается в каталоге
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Загрузите качественную фотографию лица или фото за работой. Клиенты охотнее доверяют мастерам с реальным фото.
                </p>

                <div className="flex items-center space-x-4 pt-1">
                  <div className="relative group shrink-0">
                    <img
                      src={formData.photo}
                      alt="Аватар мастера"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-md bg-slate-900"
                    />
                    {customPhotoSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center text-[9px] text-slate-950 font-black">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={photoInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      id="specialist-main-photo-upload"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{customPhotoSelected ? 'Изменить фото' : 'Загрузить своё фото'}</span>
                      </button>

                      {customPhotoSelected && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
                            }));
                            setCustomPhotoSelected(false);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer"
                        >
                          Сбросить
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-500">
                      Поддерживаются JPG, PNG, WebP. Размер до 10 МБ.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">ФИО / Имя мастера *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Александр Иванов"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Город работы *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    {RUSSIAN_CITIES.filter((c) => c !== 'Все города').map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Телефон для клиентов *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Telegram (необязательно)</label>
                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    placeholder="@master_santeh"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Стаж работы (лет)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Минимальная цена вызова (руб)</label>
                  <input
                    type="number"
                    step="100"
                    value={formData.minPrice}
                    onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Выполняемые услуги (через запятую)</label>
                <input
                  type="text"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">О себе и гарантиях</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Частный мастер с профессиональным инструментом. Работал на объектах повышенной сложности..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emergency247}
                  onChange={(e) => setFormData({ ...formData, emergency247: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 w-4 h-4"
                />
                <span>Готов к аварийным выездам 24/7 (круглосуточно)</span>
              </label>

              {/* Document Verification Upload Section (up to 3 files) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                    <FileCheck className="w-4 h-4" />
                    <span>Прикрепление документов (до 3 файлов)</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    verificationDocs.length >= 3
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {verificationDocs.length} из 3 файлов
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Прикрепите до трёх файлов (паспорт, удостоверение, диплом или сертификаты квалификации). Администратор проверит подлинность документов перед публикацией вашего профиля.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="sm:col-span-1">
                    <select
                      value={docTypeToUpload}
                      disabled={verificationDocs.length >= 3}
                      onChange={(e) => setDocTypeToUpload(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="Паспорт / Удостоверение">Паспорт / Удостоверение</option>
                      <option value="Диплом / Свидетельство">Диплом / Свидетельство</option>
                      <option value="Сертификат / Допуск">Сертификат / Допуск</option>
                      <option value="Справка самозанятого / ИП">Справка самозанятого / ИП</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                      id="specialist-doc-upload-input"
                      disabled={verificationDocs.length >= 3}
                    />
                    <button
                      type="button"
                      disabled={verificationDocs.length >= 3}
                      onClick={() => {
                        if (verificationDocs.length < 3) {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                        verificationDocs.length >= 3
                          ? 'bg-slate-900/50 border border-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-900 border border-dashed border-cyan-500/40 hover:border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 cursor-pointer'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {verificationDocs.length >= 3
                          ? 'Лимит 3 файлов достигнут'
                          : `Прикрепить файл (${docTypeToUpload})`}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                {verificationDocs.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-300">
                      Прикреплённые файлы ({verificationDocs.length} из 3):
                    </span>
                    <div className="space-y-1.5">
                      {verificationDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300"
                        >
                          <div className="flex items-center space-x-2 overflow-hidden">
                            {doc.dataUrl && (doc.name.match(/\.(jpg|jpeg|png|webp)$/i) || doc.dataUrl.startsWith('data:image')) ? (
                              <img
                                src={doc.dataUrl}
                                alt={doc.name}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="font-medium text-white block truncate">{doc.name}</span>
                              <span className="text-[10px] text-slate-400">
                                {doc.type} • {doc.size}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium">
                              На проверку
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(doc.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition rounded cursor-pointer"
                              title="Удалить файл"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Legal Checkboxes for Specialists (Data Consent & Terms of Use) */}
              <div className="p-4 rounded-2xl bg-slate-950/85 border border-slate-800 space-y-3">
                {/* Checkbox 1: Personal Data Consent */}
                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 cursor-pointer select-none transition">
                  <input
                    type="checkbox"
                    required
                    checked={dataConsentAccepted}
                    onChange={(e) => {
                      setDataConsentAccepted(e.target.checked);
                      if (error) setError(null);
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-cyan-500/50 text-cyan-500 focus:ring-cyan-500/30 bg-slate-950 accent-cyan-500 cursor-pointer shrink-0"
                  />
                  <div className="text-xs leading-snug">
                    <span className="font-semibold text-white">
                      Я даю согласие на обработку моих персональных данных <span className="text-rose-400">*</span>
                    </span>
                    <p className="text-slate-300 mt-1">
                      Ознакомлен(-а) с{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setLegalDocType('privacy');
                          setIsLegalModalOpen(true);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 underline font-semibold inline-flex items-center gap-1 cursor-pointer transition"
                        title="Нажмите, чтобы ознакомиться с Политикой конфиденциальности"
                      >
                        <span>Политикой конфиденциальности</span>
                        <ExternalLink className="w-3 h-3 inline shrink-0" />
                      </button>
                    </p>
                  </div>
                </label>

                {/* Checkbox 2: Terms of Use */}
                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 cursor-pointer select-none transition">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (error) setError(null);
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-cyan-500/50 text-cyan-500 focus:ring-cyan-500/30 bg-slate-950 accent-cyan-500 cursor-pointer shrink-0"
                  />
                  <div className="text-xs leading-snug">
                    <span className="font-semibold text-white">
                      Я принимаю условия Пользовательского соглашения <span className="text-rose-400">*</span>
                    </span>
                    <p className="text-slate-300 mt-1">
                      Ознакомлен(-а) с регламентом{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setLegalDocType('terms');
                          setIsLegalModalOpen(true);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 underline font-semibold inline-flex items-center gap-1 cursor-pointer transition"
                        title="Нажмите, чтобы ознакомиться с Пользовательским соглашением"
                      >
                        <span>Пользовательского соглашения сервиса</span>
                        <ExternalLink className="w-3 h-3 inline shrink-0" />
                      </button>
                      : действую как независимый исполнитель, несу единоличную ответственность за качество работ, технику безопасности и гарантирую подлинность документов.
                    </p>
                  </div>
                </label>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  disabled={loading || !dataConsentAccepted || !termsAccepted}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition ${
                    loading || !dataConsentAccepted || !termsAccepted
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20 cursor-pointer'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Отправка...' : 'Отправить анкету мастера'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Full Legal Terms Modal for Specialist */}
      <LegalTermsModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialDoc={legalDocType}
        role="specialist"
        onAcceptAll={() => {
          setDataConsentAccepted(true);
          setTermsAccepted(true);
          setIsLegalModalOpen(false);
          if (error) setError(null);
        }}
      />
    </div>
  );
};
