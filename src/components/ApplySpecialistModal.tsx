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
  Loader2,
  Camera,
  ImagePlus,
} from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';
import { RUSSIAN_CITIES } from '../data/initialData';
import {
  COUNTRIES,
  CountryInfo,
  getCountryByCity,
  getCitiesByCountry,
} from '../data/regionsData';
import { SpecialistVerificationDoc } from '../types';
import { LegalTermsModal } from './LegalTermsModal';
import { PLATFORM_LEGAL_DETAILS } from '../data/legalTerms';
import { useAuth } from '../context/AuthContext';
import { ALL_ENGINEERING_SERVICES } from '../data/engineeringServices';
import { PlumbingSpecialist } from '../types';

interface ApplySpecialistModalProps {
  onClose: () => void;
  onSuccess: (masterName?: string) => void;
  initialSpecialist?: PlumbingSpecialist | null;
  isReapplying?: boolean;
}

export const ApplySpecialistModal: React.FC<ApplySpecialistModalProps> = ({
  onClose,
  onSuccess,
  initialSpecialist,
  isReapplying,
}) => {
  const { currentUser } = useAuth();
  const initialCountry = getCountryByCity(initialSpecialist?.city || currentUser?.city || 'Москва').code;
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountry);

  const [formData, setFormData] = useState({
    name: initialSpecialist?.name || currentUser?.name || '',
    city: initialSpecialist?.city || currentUser?.city || 'Москва',
    phone: initialSpecialist?.phone || currentUser?.phone || '',
    telegram: initialSpecialist?.telegram || '',
    whatsapp: initialSpecialist?.whatsapp || '',
    experienceYears: initialSpecialist?.experienceYears || 5,
    minPrice: initialSpecialist?.minPrice || 1000,
    emergency247: initialSpecialist?.emergency247 !== undefined ? initialSpecialist.emergency247 : true,
    services: initialSpecialist?.services && Array.isArray(initialSpecialist.services)
      ? initialSpecialist.services.join(', ')
      : 'Замена смесителей, Устранение протечек, Пайка полипропилена',
    bio: initialSpecialist?.bio || '',
    photo: initialSpecialist?.photo || '',
  });

  // Verification Documents (Up to 3 files)
  const [verificationDocs, setVerificationDocs] = useState<SpecialistVerificationDoc[]>(() => {
    if (initialSpecialist?.verificationDocs && Array.isArray(initialSpecialist.verificationDocs)) {
      return initialSpecialist.verificationDocs;
    }
    if (initialSpecialist?.verificationDocsJson) {
      try {
        const parsed = JSON.parse(initialSpecialist.verificationDocsJson);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });
  const [docTypeToUpload, setDocTypeToUpload] = useState<string>('Паспорт / Удостоверение');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Main Photo State
  const [customPhotoSelected, setCustomPhotoSelected] = useState(Boolean(initialSpecialist?.photo));

  // 2 Consolidated Legal Agreement states (152-FZ Personal Data & Document Verification + Terms of Use & Authenticity Guarantee)
  const [dataConsentAccepted, setDataConsentAccepted] = useState(Boolean(initialSpecialist?.dataConsent));
  const [termsAccepted, setTermsAccepted] = useState(Boolean(initialSpecialist?.legalConsent));
  const [legalDocType, setLegalDocType] = useState<'privacy' | 'terms' | 'master_moderation' | 'offer'>('master_moderation');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Главная фотография должна быть изображением (JPG, PNG, WebP).');
      return;
    }

    try {
      setCompressing(true);
      const result = await compressImageFile(file, 400, 0.85);
      setFormData((prev) => ({ ...prev, photo: result.base64 }));
      setCustomPhotoSelected(true);
      setError(null);
    } catch (err) {
      console.warn('Canvas photo compression failed, using fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, photo: reader.result as string }));
          setCustomPhotoSelected(true);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (verificationDocs.length >= 3) {
      setError('Вы можете прикрепить не более трёх файлов подтверждающих документов.');
      return;
    }

    const file = files[0];
    setCompressing(true);
    setError(null);

    try {
      let dataUrl: string;
      let formattedSize: string;

      if (file.type.startsWith('image/')) {
        // High-clarity compression: max 1600px, quality 0.82 (reduces 10MB to ~150-250KB for fast 4G upload)
        const compressed = await compressImageFile(file, 1600, 0.82);
        dataUrl = compressed.base64;
        formattedSize = compressed.compressedSizeFormatted;
      } else {
        // PDF or other documents
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        formattedSize = `${(file.size / 1024).toFixed(1)} КБ`;
      }

      const newDoc: SpecialistVerificationDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: docTypeToUpload as any,
        size: formattedSize,
        uploadedAt: new Date().toLocaleDateString('ru-RU'),
        status: 'pending',
        dataUrl,
      };

      setVerificationDocs((prev) => [...prev, newDoc].slice(0, 3));
    } catch (err) {
      console.error('Document process error:', err);
      setError('Не удалось обработать файл. Пожалуйста, выберите файл в формате JPG, PNG или PDF.');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
        'Для завершения подачи заявки необходимо отметить оба пункта юридического соглашения (обработка персональных данных и принятие пользовательского соглашения).'
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

      const payload = {
        ...formData,
        id: initialSpecialist?.id || undefined,
        email: currentUser?.email,
        userUid: currentUser?.uid,
        services: servicesArray,
        dataConsent: true,
        consentTimestamp: nowTimestamp,
        legalConsent: true,
        legalConsentTimestamp: nowTimestamp,
        legalChecklist: {
          dataConsentAccepted: true,
          docVerificationConsentAccepted: true,
          authenticityConfirmed: true,
          termsAccepted: true,
          independentContractor: true,
          siteLiability: true,
          platformIndemnity: true,
          authenticDocuments: true,
          storageProvider: 'Timeweb Cloud Database (Russian Federation / St. Petersburg)',
          foreignStorageExcluded: true,
          version: '3.0-TIMEWEB-CLOUD-AUDIT',
          acceptedAt: nowTimestamp,
          clientUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
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
      };

      // Resilient upload with automatic retry for mobile connections in Russia
      let res: Response | null = null;
      let lastNetworkErr: any = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          res = await fetch('/api/specialists/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res) break;
        } catch (fetchErr) {
          lastNetworkErr = fetchErr;
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      }

      if (!res) {
        throw lastNetworkErr || new Error('Network timeout');
      }

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Ошибка при отправке заявки. Пожалуйста, повторите попытку.');
      }
    } catch (err: any) {
      console.error('Specialist application submit error:', err);
      setError('Ошибка соединения с сервером. Пожалуйста, проверьте подключение к интернету и повторите отправку.');
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
                <span>{isReapplying || initialSpecialist?.status === 'rejected' ? 'Повторная модерация анкеты' : 'Модерация администрацией'}</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {isReapplying || initialSpecialist?.status === 'rejected'
                  ? 'Доработка и повторная отправка анкеты'
                  : 'Стать мастером в вашем городе'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isReapplying || initialSpecialist?.status === 'rejected'
                  ? 'Внесите необходимые исправления в данные или документы, чтобы пройти повторную проверку администратором.'
                  : 'Заполните анкету специалиста, чтобы получать заказы от жильцов в вашем городе.'}
              </p>
            </div>

            {/* Reapplication Notice if previously rejected */}
            {(isReapplying || initialSpecialist?.status === 'rejected') && initialSpecialist?.rejectionReason && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center space-x-2 text-rose-300 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Указанная причина предыдущего отказа:</span>
                </div>
                <div className="text-white font-medium pl-6">
                  {initialSpecialist.rejectionReason}
                </div>
                {initialSpecialist.moderationComment && (
                  <div className="text-slate-300 italic pl-6 text-[11px] pt-1 border-t border-rose-500/20">
                    Рекомендация модератора: «{initialSpecialist.moderationComment}»
                  </div>
                )}
              </div>
            )}

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
                  {formData.photo ? (
                    <div className="relative group shrink-0">
                      <img
                        src={formData.photo}
                        alt="Аватар мастера"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-md bg-slate-900"
                      />
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center text-[9px] text-slate-950 font-black">
                        ✓
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-20 h-20 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-slate-900/80 hover:bg-slate-900 flex flex-col items-center justify-center text-cyan-400 cursor-pointer transition-all duration-200 shadow-md group shrink-0"
                      title="Нажмите, чтобы загрузить свою фотографию"
                    >
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center transition">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] text-slate-400 group-hover:text-cyan-300 font-medium mt-1">
                        Ваше фото
                      </span>
                    </button>
                  )}

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
                        <span>{formData.photo ? 'Изменить фото' : 'Загрузить своё фото'}</span>
                      </button>

                      {formData.photo && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              photo: '',
                            }));
                            setCustomPhotoSelected(false);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer"
                        >
                          Удалить
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">Страна работы *</label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => {
                      const newCountry = e.target.value;
                      setSelectedCountryCode(newCountry);
                      const defaultCity = COUNTRIES.find((c) => c.code === newCountry)?.defaultCity || 'Москва';
                      setFormData({ ...formData, city: defaultCity });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Город работы ({COUNTRIES.find((c) => c.code === selectedCountryCode)?.name || 'Россия'}) *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    {getCitiesByCountry(selectedCountryCode, RUSSIAN_CITIES).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Телефон для клиентов *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={
                      selectedCountryCode === 'TJ'
                        ? '+992 (90) 000-00-00'
                        : selectedCountryCode === 'KZ'
                        ? '+7 (701) 000-00-00'
                        : selectedCountryCode === 'UZ'
                        ? '+998 (90) 000-00-00'
                        : selectedCountryCode === 'KG'
                        ? '+996 (555) 00-00-00'
                        : '+7 (999) 000-00-00'
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="Монтаж тепловых насосов, разводка труб Rehau, инсталляции..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />

                {/* Quick Preset Chips for Master Application */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Быстрый выбор популярных специализаций (нажмите для добавления):</span>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                    {ALL_ENGINEERING_SERVICES.slice(0, 14).map((serv, idx) => {
                      const currentList = formData.services.split(',').map((s) => s.trim()).filter(Boolean);
                      const isAdded = currentList.some((s) => s.toLowerCase() === serv.name.toLowerCase());
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (isAdded) {
                              const filtered = currentList.filter((s) => s.toLowerCase() !== serv.name.toLowerCase());
                              setFormData({ ...formData, services: filtered.join(', ') });
                            } else {
                              const updated = [...currentList, serv.name];
                              setFormData({ ...formData, services: updated.join(', ') });
                            }
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition cursor-pointer flex items-center gap-1 ${
                            isAdded
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : serv.isHeatPump
                              ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/40'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {serv.isHeatPump && <span>⚡</span>}
                          <span>{serv.name}</span>
                          {isAdded ? <span>✓</span> : <span>+</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
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

              {/* Compact Legal Checkboxes for Specialists */}
              <div className="space-y-2 select-none">
                {/* Checkbox 1: Personal Data & Documents Verification */}
                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={dataConsentAccepted}
                    onChange={(e) => {
                      setDataConsentAccepted(e.target.checked);
                      if (error) setError(null);
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 text-cyan-500 bg-slate-950 accent-cyan-500 cursor-pointer shrink-0"
                  />
                  <div className="text-xs text-slate-300 leading-snug">
                    <span>Согласен(-на) на </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLegalDocType('privacy');
                        setIsLegalModalOpen(true);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>обработку персональных данных</span>
                      <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
                    </button>
                    <span> и </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLegalDocType('master_moderation');
                        setIsLegalModalOpen(true);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>проверку документов</span>
                      <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
                    </button>
                    <span className="text-rose-400 font-bold ml-0.5">*</span>
                  </div>
                </label>

                {/* Checkbox 2: Terms of Use & Authenticity */}
                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (error) setError(null);
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 text-cyan-500 bg-slate-950 accent-cyan-500 cursor-pointer shrink-0"
                  />
                  <div className="text-xs text-slate-300 leading-snug">
                    <span>Принимаю условия </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLegalDocType('terms');
                        setIsLegalModalOpen(true);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Пользовательского соглашения</span>
                      <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
                    </button>
                    <span> и подтверждаю подлинность документов</span>
                    <span className="text-rose-400 font-bold ml-0.5">*</span>
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
