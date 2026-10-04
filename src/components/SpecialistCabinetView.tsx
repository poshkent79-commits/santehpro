import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Star,
  Camera,
  Plus,
  Trash2,
  Edit2,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  ExternalLink,
  Eye,
  Calendar,
  Sparkles,
  Phone,
  MapPin,
  Award,
  Wrench,
  User,
  Check,
  Save,
  Zap,
  Tag,
  Loader2,
  X,
  AlertTriangle,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PlumbingSpecialist, MasterWork, Article, CategoryId } from '../types';
import { CATEGORIES } from '../data/initialData';
import { compressImageFile } from '../utils/imageCompressor';
import { WorkGalleryModal } from './WorkGalleryModal';

interface SpecialistCabinetViewProps {
  specialist: PlumbingSpecialist;
  onRefreshSpecialist?: () => void;
  onOpenArticle?: (article: Article) => void;
  onNavigateToHandbook?: () => void;
}

export const SpecialistCabinetView: React.FC<SpecialistCabinetViewProps> = ({
  specialist,
  onRefreshSpecialist,
  onOpenArticle,
  onNavigateToHandbook,
}) => {
  // Navigation tabs within specialist cabinet
  const [activeTab, setActiveTab] = useState<'works' | 'articles' | 'services' | 'requests'>('works');

  // ----------------------------------------------------
  // SECTION 1: MASTER WORKS & PHOTOS UPLOAD (UP TO 3 FILES)
  // ----------------------------------------------------
  const [works, setWorks] = useState<MasterWork[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [editingWork, setEditingWork] = useState<MasterWork | null>(null);

  // Form fields for work & services description
  const [workTitle, setWorkTitle] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [workCategory, setWorkCategory] = useState<string>('water');
  const [workPrice, setWorkPrice] = useState('');
  const [workCompletedAt, setWorkCompletedAt] = useState(new Date().toISOString().split('T')[0]);
  const [workPhotos, setWorkPhotos] = useState<string[]>([]); // Strict limit: up to 3 files!
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [workFormError, setWorkFormError] = useState('');
  const [workFormSuccess, setWorkFormSuccess] = useState('');
  const [activeGalleryWork, setActiveGalleryWork] = useState<MasterWork | null>(null);
  const workFileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // SECTION 2: ARTICLES CREATION (MARKED 'НА МОДЕРАЦИИ')
  // ----------------------------------------------------
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [inspectingArticle, setInspectingArticle] = useState<Article | null>(null);

  // Form fields for article
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState<CategoryId>('water');
  const [artShortDesc, setArtShortDesc] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artCover, setArtCover] = useState('');
  const [artDifficulty, setArtDifficulty] = useState<'Новичок' | 'Продвинутый' | 'Профи'>('Новичок');
  const [artTimeEst, setArtTimeEst] = useState('15 мин');
  const [artTools, setArtTools] = useState('Разводной ключ, лента ФУМ, отвертка');
  const [artMaterials, setArtMaterials] = useState('Прокладки сантехнические, силиконовый герметик');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSubmittingArticle, setIsSubmittingArticle] = useState(false);
  const [artFormError, setArtFormError] = useState('');
  const [artFormSuccess, setArtFormSuccess] = useState('');
  const articleCoverInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // SECTION 3: SERVICES & PRICING PROFILE MANAGEMENT
  // ----------------------------------------------------
  const [servicesList, setServicesList] = useState<string[]>(
    Array.isArray(specialist.services) ? specialist.services : []
  );
  const [newServiceInput, setNewServiceInput] = useState('');
  const [masterMinPrice, setMasterMinPrice] = useState<number>(specialist.minPrice || 1500);
  const [masterEmergency, setMasterEmergency] = useState<boolean>(Boolean(specialist.emergency247));
  const [masterBio, setMasterBio] = useState<string>(specialist.bio || '');
  const [masterPhone, setMasterPhone] = useState<string>(specialist.phone || '');
  const [masterTelegram, setMasterTelegram] = useState<string>(specialist.telegram || '');
  const [masterWhatsapp, setMasterWhatsapp] = useState<string>(specialist.whatsapp || '');
  const [isSavingServices, setIsSavingServices] = useState(false);
  const [servicesSuccess, setServicesSuccess] = useState('');
  const [servicesError, setServicesError] = useState('');

  // ----------------------------------------------------
  // LOAD DATA FROM API (INSTANT & NON-BLOCKING)
  // ----------------------------------------------------
  const loadWorks = async () => {
    setLoadingWorks(true);
    try {
      const res = await fetch(`/api/master-works?specialistId=${encodeURIComponent(specialist.id)}&all=true`);
      if (res.ok) {
        const apiData: MasterWork[] = await res.json();
        if (Array.isArray(apiData)) {
          apiData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setWorks(apiData);
        }
      }
    } catch (e) {
      console.error('Failed to load master works:', e);
    } finally {
      setLoadingWorks(false);
    }
  };

  const loadArticles = async () => {
    setLoadingArticles(true);
    try {
      const res = await fetch(`/api/articles?authorMasterId=${encodeURIComponent(specialist.id)}&includePending=true`);
      if (res.ok) {
        const apiData: Article[] = await res.json();
        if (Array.isArray(apiData)) {
          apiData.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setArticles(apiData);
        }
      }
    } catch (e) {
      console.error('Failed to load master articles:', e);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    if (specialist?.id) {
      Promise.all([
        loadWorks(),
        loadArticles(),
      ]);
    }
  }, [specialist?.id]);

  // ----------------------------------------------------
  // WORK PHOTOS UPLOAD (UP TO 10 FILES WITH SMART LOSSLESS COMPRESSION)
  // ----------------------------------------------------
  const [photoCompressStats, setPhotoCompressStats] = useState<{ [url: string]: string }>({});

  const handleWorkPhotosSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setWorkFormError('');
    const MAX_PHOTOS = 10;
    const remainingSlots = MAX_PHOTOS - workPhotos.length;
    if (remainingSlots <= 0) {
      setWorkFormError(`Достигнут лимит: разрешено загрузить не более ${MAX_PHOTOS} фотографий для одной работы.`);
      return;
    }

    const filesToUpload: File[] = Array.from(files).slice(0, remainingSlots) as File[];
    setIsUploadingPhoto(true);

    try {
      const newPhotoUrls: string[] = [];
      const newStats: { [url: string]: string } = {};

      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) {
          setWorkFormError('Пожалуйста, выбирайте только файлы изображений (JPG, PNG, WebP).');
          continue;
        }

        // Compress image using HTML5 Canvas utility with optical sharpness preservation
        const compressed = await compressImageFile(file, 1600, 0.84);
        const statLabel = compressed.savedPercent > 0 
          ? `${compressed.compressedSizeFormatted} (-${compressed.savedPercent}%)`
          : compressed.compressedSizeFormatted;

        // Try streaming to server upload API for cloud URL, fallback to optimized base64
        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileData: compressed.base64,
              fileType: 'photo',
              category: workCategory,
            }),
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            const finalUrl = data.fileUrl || compressed.base64;
            newPhotoUrls.push(finalUrl);
            newStats[finalUrl] = statLabel;
          } else {
            newPhotoUrls.push(compressed.base64);
            newStats[compressed.base64] = statLabel;
          }
        } catch {
          newPhotoUrls.push(compressed.base64);
          newStats[compressed.base64] = statLabel;
        }
      }

      setWorkPhotos((prev) => [...prev, ...newPhotoUrls].slice(0, MAX_PHOTOS));
      setPhotoCompressStats((prev) => ({ ...prev, ...newStats }));

      if (files.length > remainingSlots) {
        setWorkFormError(`Загружено ${remainingSlots} фото. Достигнут лимит в ${MAX_PHOTOS} фотографий.`);
      }
    } catch (err: any) {
      console.error('Work photo upload error:', err);
      setWorkFormError('Ошибка при обработке фотографии: ' + (err.message || ''));
    } finally {
      setIsUploadingPhoto(false);
      if (workFileInputRef.current) workFileInputRef.current.value = '';
    }
  };

  const handleRemoveWorkPhoto = (idx: number) => {
    setWorkPhotos((prev) => prev.filter((_, i) => i !== idx));
    setWorkFormError('');
  };

  // Submit Work (Saved to Firestore & API)
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorkFormError('');
    setWorkFormSuccess('');

    if (!workTitle.trim()) {
      setWorkFormError('Пожалуйста, укажите название выполненной работы.');
      return;
    }
    if (!workDescription.trim()) {
      setWorkFormError('Пожалуйста, внесите текстовое описание услуг и выполненных задач.');
      return;
    }
    if (workPhotos.length === 0) {
      setWorkFormError('Пожалуйста, прикрепите хотя бы одну фотографию выполненной работы (до 10 файлов).');
      return;
    }

    setIsSubmittingWork(true);

    const workId = editingWork ? editingWork.id : `work-${Date.now()}`;
    const newWorkData: MasterWork = {
      id: workId,
      specialistId: specialist.id,
      specialistName: specialist.name,
      title: workTitle.trim(),
      description: workDescription.trim(),
      category: workCategory,
      photos: workPhotos.slice(0, 10), // Up to 10 photos
      completedAt: workCompletedAt || new Date().toISOString().split('T')[0],
      createdAt: editingWork?.createdAt || new Date().toISOString(),
      status: 'pending', // Mark as pending moderation
    };

    try {
      // 1. Save to Firestore
      try {
        await setDoc(doc(db, 'masterWorks', workId), newWorkData);
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.WRITE, `masterWorks/${workId}`);
      }

      // 2. Save via Server API for sync
      const res = await fetch(editingWork ? `/api/master-works/${workId}` : '/api/master-works', {
        method: editingWork ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkData),
      });

      if (res.ok) {
        setWorkFormSuccess('✓ Работа успешно сохранена в Firestore и отправлена на модерацию администратору!');
        setTimeout(() => {
          setIsAddingWork(false);
          setEditingWork(null);
          setWorkTitle('');
          setWorkDescription('');
          setWorkPhotos([]);
          setWorkPrice('');
          setWorkFormSuccess('');
          loadWorks();
        }, 1500);
      } else {
        const errData = await res.json().catch(() => ({}));
        setWorkFormError(errData.error || 'Ошибка при сохранении на сервере.');
      }
    } catch (err: any) {
      console.error('Error saving work:', err);
      setWorkFormError(err.message || 'Ошибка при сохранении работы.');
    } finally {
      setIsSubmittingWork(false);
    }
  };

  const handleDeleteWork = async (id: string) => {
    if (!window.confirm('Удалить эту работу из портфолио?')) return;
    try {
      // Delete from Firestore
      try {
        await deleteDoc(doc(db, 'masterWorks', id));
      } catch (fsErr) {
        console.warn('Firestore delete error:', fsErr);
      }

      // Delete from API
      await fetch(`/api/master-works/${id}`, { method: 'DELETE' });
      setWorks((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Failed to delete work:', err);
    }
  };

  // ----------------------------------------------------
  // ARTICLE CREATION (SAVED TO FIRESTORE & LABELED 'НА МОДЕРАЦИИ')
  // ----------------------------------------------------
  const handleArticleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const compressed = await compressImageFile(file, 1400, 0.85);
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileData: compressed.base64,
            fileType: 'photo',
            category: artCategory,
          }),
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          setArtCover(data.fileUrl || compressed.base64);
        } else {
          setArtCover(compressed.base64);
        }
      } catch {
        setArtCover(compressed.base64);
      }
    } catch (err: any) {
      setArtFormError('Ошибка при загрузке обложки: ' + err.message);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setArtFormError('');
    setArtFormSuccess('');

    if (!artTitle.trim()) {
      setArtFormError('Пожалуйста, введите название статьи.');
      return;
    }
    if (!artContent.trim()) {
      setArtFormError('Пожалуйста, введите текст / контент статьи.');
      return;
    }

    setIsSubmittingArticle(true);

    const artId = `art-master-${Date.now()}`;
    const toolsArr = artTools.split(',').map((t) => t.trim()).filter(Boolean);
    const materialsArr = artMaterials.split(',').map((m) => m.trim()).filter(Boolean);

    // Split content into readable sections/steps
    const paragraphs = artContent.split('\n\n').map((p) => p.trim()).filter(Boolean);
    const formattedSteps = paragraphs.map((p, idx) => ({
      title: idx === 0 ? 'Введение и обзор задачи' : `Этап ${idx}: Практические рекомендации`,
      text: p,
    }));

    const newArticleData: Article = {
      id: artId,
      title: artTitle.trim(),
      category: artCategory,
      type: 'article',
      description: artShortDesc.trim() || paragraphs[0]?.slice(0, 160) || 'Полезный материал от практикующего мастера-сантехника.',
      coverImage: artCover,
      difficulty: artDifficulty,
      timeEst: artTimeEst || '15 мин',
      toolsRequired: toolsArr,
      materialsRequired: materialsArr,
      steps: formattedSteps.length > 0 ? formattedSteps : [{ title: 'Основной материал', text: artContent }],
      author: specialist.name,
      authorMasterId: specialist.id,
      moderationStatus: 'pending', // Marked 'на модерации'
      isPublished: false, // Private until approved by admin
      views: 1,
      likes: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isFeatured: false,
    };

    try {
      // 1. Save to Firestore
      try {
        await setDoc(doc(db, 'articles', artId), newArticleData);
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.WRITE, `articles/${artId}`);
      }

      // 2. Save via Server API for sync
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticleData),
      });

      if (res.ok) {
        setArtFormSuccess('✓ Статья успешно создана, сохранена в Firestore и направлена на модерацию администратору! После одобрения она появится в общем Справочнике.');
        setTimeout(() => {
          setIsAddingArticle(false);
          setArtTitle('');
          setArtShortDesc('');
          setArtContent('');
          setArtFormSuccess('');
          loadArticles();
        }, 1800);
      } else {
        const errData = await res.json().catch(() => ({}));
        setArtFormError(errData.error || 'Ошибка при сохранении статьи на сервере.');
      }
    } catch (err: any) {
      console.error('Error saving article:', err);
      setArtFormError(err.message || 'Не удалось сохранить статью.');
    } finally {
      setIsSubmittingArticle(false);
    }
  };

  // ----------------------------------------------------
  // SERVICES & PRICING UPDATE
  // ----------------------------------------------------
  const handleSaveServices = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingServices(true);
    setServicesError('');
    setServicesSuccess('');

    try {
      const res = await fetch(`/api/specialists/${specialist.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: servicesList,
          minPrice: Number(masterMinPrice) || 1500,
          emergency247: masterEmergency,
          bio: masterBio,
          phone: masterPhone,
          telegram: masterTelegram,
          whatsapp: masterWhatsapp,
        }),
      });

      if (res.ok) {
        setServicesSuccess('✓ Услуги, прайс-лист и контактные данные успешно обновлены в каталоге специалистов!');
        setTimeout(() => setServicesSuccess(''), 4000);
        onRefreshSpecialist?.();
      } else {
        const data = await res.json();
        setServicesError(data.error || 'Не удалось сохранить изменения.');
      }
    } catch {
      setServicesError('Ошибка соединения с сервером.');
    } finally {
      setIsSavingServices(false);
    }
  };

  const handleAddCustomService = () => {
    const trimmed = newServiceInput.trim();
    if (!trimmed) return;
    if (servicesList.includes(trimmed)) {
      setServicesError('Данная услуга уже присутствует в вашем списке.');
      return;
    }
    setServicesList((prev) => [...prev, trimmed]);
    setNewServiceInput('');
    setServicesError('');
  };

  const handleRemoveService = (service: string) => {
    setServicesList((prev) => prev.filter((s) => s !== service));
  };

  return (
    <div id="specialist-cabinet-view" className="space-y-6 animate-in fade-in duration-200">
      {/* ---------------- MASTER HEADER BANNER ---------------- */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <img
                src={specialist.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'}
                alt={specialist.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl bg-slate-900"
              />
              <div
                className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-2 border-slate-900 shadow-lg"
                title="Одобренный и проверенный мастер"
              >
                <ShieldCheck className="w-4 h-4 font-black" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {specialist.name}
                </h1>
                <span className="inline-flex items-center space-x-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Одобренный мастер</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>г. {specialist.city}</span>
                </span>
                <span>•</span>
                <span>Опыт: <strong>{specialist.experienceYears} лет</strong></span>
                <span>•</span>
                <span className="flex items-center space-x-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{specialist.rating} ({specialist.reviewsCount} отзывов)</span>
                </span>
                {specialist.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center space-x-1 font-mono text-cyan-300">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{specialist.phone}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Master Privileges Badge */}
          <div className="bg-slate-950/70 border border-cyan-500/30 rounded-2xl p-4 w-full md:w-auto space-y-1.5 shadow-inner">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-300">Личный кабинет специалиста:</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-300 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Загрузка работ с фото (до 3 файлов)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-amber-300 font-medium">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Публикация статей (с модерацией)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-2 mt-6 pt-5 border-t border-slate-800/80 overflow-x-auto">
          <button
            id="spec-tab-works"
            onClick={() => setActiveTab('works')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'works'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Портфолио работ ({works.length})</span>
          </button>

          <button
            id="spec-tab-articles"
            onClick={() => setActiveTab('articles')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Мои статьи ({articles.length})</span>
            {articles.some((a) => a.moderationStatus === 'pending') && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950 text-amber-300 font-black">
                На модерации
              </span>
            )}
          </button>

          <button
            id="spec-tab-services"
            onClick={() => setActiveTab('services')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'services'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Услуги и прайс-лист ({servicesList.length})</span>
          </button>
        </div>
      </div>

      {/* ---------------- SECTION 1: MASTER WORKS (UP TO 3 FILES) ---------------- */}
      {activeTab === 'works' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-3xl">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <span>Фотографии выполненных работ и описание услуг</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Загрузите до 10 фотографий для каждой работы с текстовым описанием услуг. Система автоматически сжимает фото без потери качества.
              </p>
            </div>

            {!isAddingWork && (
              <button
                id="btn-add-work"
                onClick={() => {
                  setEditingWork(null);
                  setWorkTitle('');
                  setWorkDescription('');
                  setWorkPhotos([]);
                  setWorkFormError('');
                  setWorkFormSuccess('');
                  setIsAddingWork(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить работу (до 10 фото)</span>
              </button>
            )}
          </div>

          {/* Form for uploading images (up to 3 files) and service description */}
          {isAddingWork && (
            <form
              id="form-add-work"
              onSubmit={handleSubmitWork}
              className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {editingWork ? 'Редактирование работы' : 'Новая выполненная работа'}
                    </h3>
                    <p className="text-xs text-cyan-400">
                      Лимит изображений: до 3 файлов • Сохранение в Firestore • Проверка администратором
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingWork(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {workFormError && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{workFormError}</span>
                </div>
              )}

              {workFormSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{workFormSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Название работы / услуги *</span>
                    <span className="text-slate-500 font-normal">Например: Замена стояка ГВС и монтаж коллекторного узла</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                    placeholder="Например: Установка фильтров тонкой очистки и разводка трубами Rehau"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Категория сантехники</label>
                  <select
                    value={workCategory}
                    onChange={(e) => setWorkCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    <option value="water">Водопровод и трубы</option>
                    <option value="drainage">Канализация и сифоны</option>
                    <option value="heating">Отопление и радиаторы</option>
                    <option value="faucets">Смесители и душевые системы</option>
                    <option value="emergency">Аварийные работы</option>
                  </select>
                </div>

                {/* Date completed */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Дата выполнения работы</label>
                  <input
                    type="date"
                    value={workCompletedAt}
                    onChange={(e) => setWorkCompletedAt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Textual Description of Services */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Текстовое описание услуг и этапов выполнения *</span>
                    <span className="text-slate-500 font-normal">Подробное описание используемых материалов и технологий</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    placeholder="Подробно опишите выполненные услуги: какие узлы демонтированы, какие трубы и фитинги использовались (полипропилен, сшитый полиэтилен PEX, медь), проведённая опрессовка давлением, сроки исполнения и гарантийные обязательства..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* ---------------- PHOTO UPLOAD FORM (LIMIT: UP TO 10 FILES) ---------------- */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>Изображения выполненной работы (до 10 фото) *</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Система автоматически сжимает фото без потери качества для обеспечения быстрой загрузки у пользователей.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                      Авто-сжатие без потерь
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      workPhotos.length === 10 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      Загружено: {workPhotos.length} из 10
                    </span>
                  </div>
                </div>

                {/* Photo Previews (Up to 10) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {workPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group aspect-video sm:aspect-square flex flex-col justify-between"
                    >
                      <img
                        src={photo}
                        alt={`Фото работы ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkPhoto(idx)}
                          className="p-2 rounded-xl bg-rose-500/90 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Удалить</span>
                        </button>
                      </div>
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/85 text-[10px] text-slate-200 font-bold backdrop-blur-xs border border-white/10">
                        #{idx + 1}
                      </span>
                      {photoCompressStats[photo] ? (
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-emerald-950/90 text-[9px] text-emerald-300 font-semibold border border-emerald-500/30 truncate backdrop-blur-xs text-center" title="Сжато без потери качества">
                          ✓ {photoCompressStats[photo]}
                        </span>
                      ) : (
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-slate-950/80 text-[9px] text-slate-300 font-medium truncate text-center">
                          Фото {idx + 1} из 10
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Upload Drop/Button if < 10 */}
                  {workPhotos.length < 10 && (
                    <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-950/50 aspect-video sm:aspect-square group">
                      <input
                        ref={workFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploadingPhoto}
                        onChange={handleWorkPhotosSelect}
                        className="hidden"
                      />
                      {isUploadingPhoto ? (
                        <div className="flex flex-col items-center space-y-2 text-cyan-400">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-[11px] font-semibold">Оптимизация...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition flex items-center justify-center mb-1.5">
                            <Upload className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-white group-hover:text-cyan-300 transition leading-tight">
                            Загрузить фото ({workPhotos.length + 1}-е из 10)
                          </span>
                          <span className="text-[9px] text-slate-500 mt-1">
                            JPG, PNG, WebP (авто-сжатие)
                          </span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingWork(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingWork || isUploadingPhoto}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg shadow-cyan-500/25 cursor-pointer"
                >
                  {isSubmittingWork ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Сохранение в Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Отправить работу на модерацию</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* List of Master Works */}
          {loadingWorks ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
              <span>Загрузка работ мастера из Firestore...</span>
            </div>
          ) : works.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <Camera className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">У вас пока нет загруженных работ</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Нажмите кнопку «Добавить работу», прикрепите до 10 фотографий и текстовое описание оказанных услуг. Фотографии будут автоматически оптимизированы.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {works.map((work) => (
                <div
                  key={work.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl group hover:border-slate-700 transition"
                >
                  <div>
                    {/* Work Photos (up to 3) */}
                    <div
                      className="relative aspect-video bg-slate-950 cursor-pointer overflow-hidden"
                      onClick={() => setActiveGalleryWork(work)}
                    >
                      <img
                        src={work.photos[0]}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                      {/* Moderation Status Pill */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border shadow-md flex items-center space-x-1.5 ${
                            work.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : work.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {work.status === 'approved' ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Одобрено</span>
                            </>
                          ) : work.status === 'rejected' ? (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Отклонено</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>На модерации</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Photos count */}
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-cyan-300 flex items-center space-x-1">
                        <Camera className="w-3 h-3" />
                        <span>{work.photos.length} фото</span>
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>{work.completedAt || 'Дата не указана'}</span>
                          <span className="text-cyan-400 uppercase tracking-wider font-bold">
                            {work.category}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                          {work.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {work.description}
                      </p>

                      {work.moderationComment && work.status === 'rejected' && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                          <strong>Причина отклонения:</strong> {work.moderationComment}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setActiveGalleryWork(work)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Галерея ({work.photos.length})</span>
                    </button>

                    <button
                      onClick={() => handleDeleteWork(work.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Удалить работу"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- SECTION 2: ARTICLES CREATION (MARKED 'НА МОДЕРАЦИИ') ---------------- */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-3xl">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Авторские статьи по сантехнике</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Напишите статью с названием, категорией и контентом. Статья сохраняется в Firestore с пометкой <strong>«на модерации»</strong> и после проверки администратором публикуется в общем Справочнике сервиса.
              </p>
            </div>

            {!isAddingArticle && (
              <button
                id="btn-add-article"
                onClick={() => {
                  setArtTitle('');
                  setArtShortDesc('');
                  setArtContent('');
                  setArtFormError('');
                  setArtFormSuccess('');
                  setIsAddingArticle(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Создать статью (на модерацию)</span>
              </button>
            )}
          </div>

          {/* Article Creation Form */}
          {isAddingArticle && (
            <form
              id="form-add-article"
              onSubmit={handleSubmitArticle}
              className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Новая обучающая статья от мастера
                    </h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                        Пометка: на модерации
                      </span>
                      <span className="text-xs text-slate-400">
                        Автор: {specialist.name}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingArticle(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {artFormError && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{artFormError}</span>
                </div>
              )}

              {artFormSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{artFormSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Название статьи *</span>
                    <span className="text-slate-500 font-normal">Ёмкий заголовок проблемы или инструкции</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={artTitle}
                    onChange={(e) => setArtTitle(e.target.value)}
                    placeholder="Например: Как правильно установить и настроить редуктор давления воды в квартире"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Категория *</label>
                  <select
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value as CategoryId)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Сложность</label>
                    <select
                      value={artDifficulty}
                      onChange={(e) => setArtDifficulty(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Новичок">Новичок</option>
                      <option value="Продвинутый">Продвинутый</option>
                      <option value="Профи">Профи</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Время чтения</label>
                    <input
                      type="text"
                      value={artTimeEst}
                      onChange={(e) => setArtTimeEst(e.target.value)}
                      placeholder="15 мин"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300">
                    Краткое описание (введение)
                  </label>
                  <textarea
                    rows={2}
                    value={artShortDesc}
                    onChange={(e) => setArtShortDesc(e.target.value)}
                    placeholder="Кратко расскажите, кому пригодится статья и какие типичные ошибки сантехники помогает предотвратить..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Main Content */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Контент статьи (пошаговое руководство или текст) *</span>
                    <span className="text-slate-500 font-normal">Разделяйте этапы пустыми строками для авто-структурирования</span>
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={artContent}
                    onChange={(e) => setArtContent(e.target.value)}
                    placeholder="Напишите подробный текст статьи: 
1. Подготовительные работы: перекрытие стояка, сброс остаточного давления.
2. Необходимые инструменты и материалы: манометр, пакля с пастой или анаэробный герметик.
3. Порядок монтажа: соблюдение направления стрелки потока на корпусе, правильное усилие затяжки.
4. Проверка на протечки и калибровка рабочего давления (обычно 3-3.5 бар)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none leading-relaxed font-sans"
                  />
                </div>

                {/* Tools & Materials */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Инструменты (через запятую)</label>
                  <input
                    type="text"
                    value={artTools}
                    onChange={(e) => setArtTools(e.target.value)}
                    placeholder="Разводной ключ, лента ФУМ, манометр"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Материалы (через запятую)</label>
                  <input
                    type="text"
                    value={artMaterials}
                    onChange={(e) => setArtMaterials(e.target.value)}
                    placeholder="Прокладки, анаэробный герметик, ниппели"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Обложка статьи</span>
                    <span className="text-slate-500 font-normal">Загрузите фото или укажите ссылку</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <img
                      src={artCover}
                      alt="Обложка"
                      className="w-16 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <input
                      type="text"
                      value={artCover}
                      onChange={(e) => setArtCover(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                    <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer shrink-0">
                      <input
                        ref={articleCoverInputRef}
                        type="file"
                        accept="image/*"
                        disabled={isUploadingCover}
                        onChange={handleArticleCoverSelect}
                        className="hidden"
                      />
                      {isUploadingCover ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Загрузить</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingArticle(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingArticle || isUploadingCover}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  {isSubmittingArticle ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Сохранение в Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Отправить статью на модерацию</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* List of Master Articles */}
          {loadingArticles ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
              <span>Загрузка статей мастера из Firestore...</span>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">У вас пока нет созданных статей</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Поделитесь своим профессиональным опытом! Нажмите кнопку «Создать статью (на модерацию)» для добавления нового материала в базу знаний.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shrink-0 bg-slate-950"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                          {art.category}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400">{art.createdAt}</span>
                      </div>
                      <h4 className="text-base font-bold text-white line-clamp-1">
                        {art.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {art.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        art.moderationStatus === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : art.moderationStatus === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {art.moderationStatus === 'approved'
                        ? 'Опубликовано'
                        : art.moderationStatus === 'rejected'
                        ? 'Отклонено'
                        : 'На модерации'}
                    </span>

                    <button
                      onClick={() => {
                        if (onOpenArticle) onOpenArticle(art);
                        else setInspectingArticle(art);
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Предпросмотр</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- SECTION 3: SERVICES & PRICING PROFILE ---------------- */}
      {activeTab === 'services' && (
        <form
          id="form-services-profile"
          onSubmit={handleSaveServices}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-cyan-400" />
                <span>Управление услугами и публичным прайсом</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Настройте список выполняемых вами услуг, минимальную стоимость вызова и контактные каналы связи.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingServices}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              {isSavingServices ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Сохранить профиль</span>
                </>
              )}
            </button>
          </div>

          {servicesSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{servicesSuccess}</span>
            </div>
          )}

          {servicesError && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{servicesError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minimum price & 24/7 emergency */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Минимальная стоимость вызова (₽)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={masterMinPrice === 0 ? '' : masterMinPrice}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMasterMinPrice(v === '' ? 0 : parseInt(v, 10) || 0);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Контактный телефон</label>
                <input
                  type="text"
                  value={masterPhone}
                  onChange={(e) => setMasterPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Telegram</label>
                  <input
                    type="text"
                    value={masterTelegram}
                    onChange={(e) => setMasterTelegram(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">WhatsApp</label>
                  <input
                    type="text"
                    value={masterWhatsapp}
                    onChange={(e) => setMasterWhatsapp(e.target.value)}
                    placeholder="+7 999..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={masterEmergency}
                  onChange={(e) => setMasterEmergency(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Круглосуточный аварийный выезд 24/7</span>
                  <span className="text-[10px] text-slate-400">Готовность выезжать на срочные протечки и засоры ночью</span>
                </div>
              </label>
            </div>

            {/* Bio & Guarantees */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">О себе, опыте и гарантиях качества</label>
              <textarea
                rows={7}
                value={masterBio}
                onChange={(e) => setMasterBio(e.target.value)}
                placeholder="Расскажите заказчикам о вашем опыте, профессиональном инструменте (пресс-клещи, опрессовщик, тепловизор, гидродинамическая прочистка) и гарантии на выполненные сантехнические работы..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Services List Tagging */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <label className="text-xs font-bold text-white block">Список оказываемых услуг</label>
            <div className="flex flex-wrap gap-2">
              {servicesList.map((srv, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-medium flex items-center space-x-2"
                >
                  <span>{srv}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(srv)}
                    className="hover:text-rose-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Custom Service Input */}
            <div className="flex items-center space-x-2 max-w-md pt-2">
              <input
                type="text"
                value={newServiceInput}
                onChange={(e) => setNewServiceInput(e.target.value)}
                placeholder="Добавить новую услугу..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomService}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shrink-0"
              >
                Добавить
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Gallery Modal for viewing work photos */}
      {activeGalleryWork && (
        <WorkGalleryModal
          work={activeGalleryWork}
          onClose={() => setActiveGalleryWork(null)}
        />
      )}

      {/* Article Inspecting Modal */}
      {inspectingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectingArticle(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {inspectingArticle.category}
                </span>
                <span className="text-slate-600">•</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {inspectingArticle.moderationStatus === 'approved' ? 'Опубликовано' : 'На модерации'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {inspectingArticle.title}
              </h2>
              <p className="text-xs text-slate-400">
                Автор: <strong>{inspectingArticle.author}</strong> • {inspectingArticle.createdAt}
              </p>
            </div>

            <img
              src={inspectingArticle.coverImage}
              alt=""
              className="w-full h-56 object-cover rounded-2xl border border-slate-800"
            />

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {Array.isArray(inspectingArticle.steps) ? (
                inspectingArticle.steps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white text-sm">
                      {step.title}
                    </h4>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {step.text}
                    </p>
                  </div>
                ))
              ) : (
                <p>{inspectingArticle.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
