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
  Send,
  UploadCloud,
  ChevronRight,
  ExternalLink,
  Eye,
  Calendar,
  Lock,
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
  Bell,
  Calculator,
  EyeOff,
  PauseCircle,
  PlayCircle,
  UserX,
  Search,
  Droplets,
  Flame,
  Bath,
  FileCheck
} from 'lucide-react';
import { PlumbingSpecialist, MasterWork, ServiceCallRequest, Article, MasterPlumbingEstimate } from '../types';
import { WorkGalleryModal } from './WorkGalleryModal';
import { compressImageFile } from '../utils/imageCompressor';
import { MasterEstimatesTab } from './MasterEstimatesTab';
import { MasterEstimateBuilderModal } from './MasterEstimateBuilderModal';
import { MasterContractsTab } from './MasterContractsTab';
import { RequestReviewModal } from './RequestReviewModal';
import { ENGINEERING_SERVICE_GROUPS, ALL_ENGINEERING_SERVICES, EngineeringServiceItem } from '../data/engineeringServices';

interface MasterCabinetSectionProps {
  specialist: PlumbingSpecialist;
  onRefreshSpecialist?: () => void;
  onOpenArticle?: (article: Article) => void;
}

export const MasterCabinetSection: React.FC<MasterCabinetSectionProps> = ({
  specialist,
  onRefreshSpecialist,
  onOpenArticle,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'works' | 'messages' | 'estimates' | 'contracts' | 'articles'>('services');

  // Master estimates state for contracts linking
  const [estimates, setEstimates] = useState<MasterPlumbingEstimate[]>(() => {
    try {
      const key = `santehpro_master_estimates_${specialist.id}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Master Profile, Services & Pricing management state
  const [masterName, setMasterName] = useState<string>(specialist.name || '');
  const [masterCity, setMasterCity] = useState<string>(specialist.city || '');
  const [masterExperienceYears, setMasterExperienceYears] = useState<number>(specialist.experienceYears || 1);
  const [masterStatus, setMasterStatus] = useState<string>(specialist.status || 'approved');
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
  const [masterPhoto, setMasterPhoto] = useState<string>(specialist.photo || '');
  const [isSavingServices, setIsSavingServices] = useState(false);
  const [servicesSuccessMsg, setServicesSuccessMsg] = useState('');
  const [servicesErrorMsg, setServicesErrorMsg] = useState('');
  const [isUploadingMasterPhoto, setIsUploadingMasterPhoto] = useState(false);

  // Category filter and search for engineering presets in master cabinet
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>('all');
  const [presetSearchQuery, setPresetSearchQuery] = useState<string>('');

  // Profile Suspension & Annulment states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showAnnulConfirmModal, setShowAnnulConfirmModal] = useState(false);
  const [isAnnuling, setIsAnnuling] = useState(false);

  // Estimate builder states from requests
  const [isEstimateBuilderOpen, setIsEstimateBuilderOpen] = useState(false);
  const [selectedRequestForEstimate, setSelectedRequestForEstimate] = useState<ServiceCallRequest | null>(null);

  // Review request modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<ServiceCallRequest | null>(null);

  useEffect(() => {
    if (specialist) {
      setMasterName(specialist.name || '');
      setMasterCity(specialist.city || '');
      setMasterExperienceYears(specialist.experienceYears || 1);
      setMasterStatus(specialist.status || 'approved');
      if (Array.isArray(specialist.services)) {
        setServicesList(specialist.services);
      }
      setMasterMinPrice(specialist.minPrice || 1500);
      setMasterEmergency(Boolean(specialist.emergency247));
      setMasterBio(specialist.bio || '');
      setMasterPhone(specialist.phone || '');
      setMasterTelegram(specialist.telegram || '');
      setMasterWhatsapp(specialist.whatsapp || '');
      setMasterPhoto(specialist.photo || '');
    }
  }, [specialist]);

  const handleSaveServices = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingServices(true);
    setServicesErrorMsg('');
    setServicesSuccessMsg('');
    try {
      const res = await fetch(`/api/specialists/${specialist.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: masterName.trim() || specialist.name,
          city: masterCity.trim() || specialist.city,
          experienceYears: Number(masterExperienceYears) || specialist.experienceYears,
          services: servicesList,
          minPrice: Number(masterMinPrice) || 1500,
          emergency247: masterEmergency,
          bio: masterBio,
          phone: masterPhone,
          telegram: masterTelegram,
          whatsapp: masterWhatsapp,
          photo: masterPhoto,
        }),
      });
      if (res.ok) {
        setServicesSuccessMsg('Профиль, услуги, прайс-лист и контактные данные успешно сохранены и обновлены в каталоге специалистов!');
        setTimeout(() => setServicesSuccessMsg(''), 5000);
        onRefreshSpecialist?.();
      } else {
        const data = await res.json();
        setServicesErrorMsg(data.error || 'Не удалось сохранить изменения');
      }
    } catch (err) {
      setServicesErrorMsg('Ошибка соединения с сервером');
    } finally {
      setIsSavingServices(false);
    }
  };

  // Toggle profile status: suspend (hide from catalog) or resume (show in catalog)
  const handleToggleSuspendProfile = async (targetStatus: 'approved' | 'suspended') => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/specialists/${specialist.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        setMasterStatus(targetStatus);
        setServicesSuccessMsg(
          targetStatus === 'suspended'
            ? 'Показ анкеты в каталоге временно приостановлен. Вы скрыты из поисковой выдачи.'
            : 'Показ анкеты в каталоге успешно возобновлен! Клиенты снова видят ваш профиль.'
        );
        setTimeout(() => setServicesSuccessMsg(''), 5000);
        onRefreshSpecialist?.();
      } else {
        alert('Не удалось изменить статус отображения профиля');
      }
    } catch (e) {
      console.error('Error toggling specialist status:', e);
      alert('Ошибка связи с сервером при обновлении статуса');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete/reset profile photo
  const handleDeleteProfilePhoto = async () => {
    if (!confirm('Вы действительно хотите удалить фото профиля?')) return;
    const defaultPhoto = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=300&q=80';
    setMasterPhoto(defaultPhoto);
    try {
      await fetch(`/api/specialists/${specialist.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: defaultPhoto }),
      });
      setServicesSuccessMsg('Фото профиля удалено.');
      setTimeout(() => setServicesSuccessMsg(''), 4000);
      onRefreshSpecialist?.();
    } catch (e) {
      console.error('Error deleting photo:', e);
    }
  };

  // Annul / Permanently Delete Questionnaire
  const handleAnnulProfile = async () => {
    setIsAnnuling(true);
    try {
      const res = await fetch(`/api/specialists/${specialist.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        try {
          localStorage.removeItem('santehpro_master_specialist_id');
        } catch (e) {}
        alert('Ваша анкета мастера успешно аннулирована и удалена из активного каталога.');
        window.location.reload();
      } else {
        alert('Не удалось аннулировать анкету. Попробуйте снова.');
      }
    } catch (e) {
      console.error('Error annulling specialist profile:', e);
      alert('Ошибка при соединении с сервером.');
    } finally {
      setIsAnnuling(false);
      setShowAnnulConfirmModal(false);
    }
  };

  const handleAddCustomService = () => {
    const trimmed = newServiceInput.trim();
    if (!trimmed) return;
    if (servicesList.includes(trimmed)) {
      setServicesErrorMsg('Данная услуга уже присутствует в вашем списке');
      return;
    }
    setServicesList([...servicesList, trimmed]);
    setNewServiceInput('');
    setServicesErrorMsg('');
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServicesList(servicesList.filter((s) => s !== serviceToRemove));
  };

  const handleQuickAddService = (name: string) => {
    if (servicesList.includes(name)) return;
    setServicesList([...servicesList, name]);
  };

  const handleMasterPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMasterPhoto(true);
    try {
      const compressed = await compressImageFile(file, 800, 0.85);
      setMasterPhoto(compressed.base64);
    } catch (err) {
      console.error('Failed to compress avatar photo:', err);
    } finally {
      setIsUploadingMasterPhoto(false);
    }
  };

  // Master Works state with instant localStorage cache
  const [works, setWorks] = useState<MasterWork[]>(() => {
    try {
      const cached = localStorage.getItem(`santehpro_master_works_${specialist.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoadingWorks, setIsLoadingWorks] = useState(false);
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [editingWork, setEditingWork] = useState<MasterWork | null>(null);

  // Gallery viewer
  const [previewWork, setPreviewWork] = useState<MasterWork | null>(null);

  // New / Edit Work Form state
  const [workTitle, setWorkTitle] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [workCategory, setWorkCategory] = useState<string>('water');
  const [workCompletedAt, setWorkCompletedAt] = useState('');
  const [workPhotos, setWorkPhotos] = useState<string[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Messages & Requests state with instant localStorage cache
  const [messages, setMessages] = useState<ServiceCallRequest[]>(() => {
    try {
      const cached = localStorage.getItem(`santehpro_master_messages_${specialist.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [replyingRequestId, setReplyingRequestId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccessMsg, setReplySuccessMsg] = useState('');
  const [newRequestAlert, setNewRequestAlert] = useState<ServiceCallRequest | null>(null);
  const prevMessagesCountRef = useRef<number | null>(null);

  // Unhandled direct requests (not completed and no reply yet)
  const unhandledRequests = messages.filter(
    (m) => m.status !== 'completed' && m.status !== 'rejected' && !m.masterReply
  );

  // Articles state with instant localStorage cache (High rating >= 4.8)
  const [masterArticles, setMasterArticles] = useState<Article[]>(() => {
    try {
      const cached = localStorage.getItem(`santehpro_master_articles_${specialist.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [isWritingArticle, setIsWritingArticle] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState<'water' | 'heating' | 'drainage' | 'bath' | 'tools'>('water');
  const [articleDifficulty, setArticleDifficulty] = useState<'Новичок' | 'Продвинутый' | 'Профи'>('Новичок');
  const [articleTimeEst, setArticleTimeEst] = useState('15 мин');
  const [articleDescription, setArticleDescription] = useState('');
  const [articleCover, setArticleCover] = useState('');
  const [articleTools, setArticleTools] = useState<string>('');
  const [articleMaterials, setArticleMaterials] = useState<string>('');
  const [articleSteps, setArticleSteps] = useState<Array<{ title: string; text: string; warning?: string }>>([
    { title: 'Шаг 1. Подготовка и перекрытие воды', text: 'Обязательно перекройте вводные краны и сбросьте остаточное давление в системе.' },
  ]);
  const [isSubmittingArticle, setIsSubmittingArticle] = useState(false);
  const [articleSuccessMsg, setArticleSuccessMsg] = useState('');

  const ratingNum = Number(specialist.rating) || 5.0;
  const isHighRated = ratingNum >= 4.8; // Professional masters with elevated rating (4.8+)

  // Load works instantly from Server API
  const loadMasterWorks = async () => {
    if (works.length === 0) setIsLoadingWorks(true);
    try {
      const res = await fetch(`/api/master-works?specialistId=${encodeURIComponent(specialist.id)}&all=true`);
      if (res.ok) {
        const apiData: MasterWork[] = await res.json();
        if (Array.isArray(apiData)) {
          apiData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setWorks(apiData);
          try {
            localStorage.setItem(`santehpro_master_works_${specialist.id}`, JSON.stringify(apiData));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Error loading master works from API:', e);
    } finally {
      setIsLoadingWorks(false);
    }
  };

  // Load messages instantly from Server API (with real-time notification support)
  const loadMasterMessages = async (silent = false) => {
    if (!silent && messages.length === 0) setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/specialists/${encodeURIComponent(specialist.id)}/messages`);
      if (res.ok) {
        const fetchedRequests: ServiceCallRequest[] = await res.json();
        if (Array.isArray(fetchedRequests)) {
          fetchedRequests.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

          // Check if a brand new direct request arrived
          if (prevMessagesCountRef.current !== null && fetchedRequests.length > prevMessagesCountRef.current) {
            const latest = fetchedRequests[0];
            setNewRequestAlert(latest);
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.setValueAtTime(587.33, ctx.currentTime);
              osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
              gain.gain.setValueAtTime(0.25, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
              osc.start();
              osc.stop(ctx.currentTime + 0.35);
            } catch (audioErr) {
              // benign
            }
          }
          prevMessagesCountRef.current = fetchedRequests.length;
          setMessages(fetchedRequests);
          try {
            localStorage.setItem(`santehpro_master_messages_${specialist.id}`, JSON.stringify(fetchedRequests));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Error loading master messages from API:', e);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  // Load master articles instantly from Server API
  const loadMasterArticles = async () => {
    if (masterArticles.length === 0) setIsLoadingArticles(true);
    try {
      const res = await fetch(`/api/articles?authorMasterId=${encodeURIComponent(specialist.id)}&includePending=true`);
      if (res.ok) {
        const apiData: Article[] = await res.json();
        if (Array.isArray(apiData)) {
          apiData.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setMasterArticles(apiData);
          try {
            localStorage.setItem(`santehpro_master_articles_${specialist.id}`, JSON.stringify(apiData));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Error loading master articles from API:', e);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  // Fast parallel load on mount and lightweight background polling
  useEffect(() => {
    Promise.all([
      loadMasterWorks(),
      loadMasterMessages(true),
      loadMasterArticles(),
    ]);

    const pollInterval = setInterval(() => {
      loadMasterMessages(true);
    }, 8000);

    return () => clearInterval(pollInterval);
  }, [specialist.id]);

  // Open Edit Work
  const handleStartEditWork = (work: MasterWork) => {
    setEditingWork(work);
    setWorkTitle(work.title);
    setWorkDescription(work.description);
    setWorkCategory((work.category as string) || 'water');
    setWorkCompletedAt(work.completedAt || '');
    setWorkPhotos(work.photos || []);
    setIsAddingWork(true);
    setFormError('');
    setFormSuccessMessage('');
  };

  // Reset Work form
  const handleResetWorkForm = () => {
    setIsAddingWork(false);
    setEditingWork(null);
    setWorkTitle('');
    setWorkDescription('');
    setWorkCategory('water');
    setWorkCompletedAt(new Date().toISOString().split('T')[0]);
    setWorkPhotos([]);
    setPhotoUrlInput('');
    setFormError('');
  };

  // Add Photo URL
  const MAX_WORK_PHOTOS = 10;
  const [isUploadingWorkPhotos, setIsUploadingWorkPhotos] = useState(false);
  const [photoCompressStats, setPhotoCompressStats] = useState<{ [url: string]: string }>({});

  const handleAddPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    if (workPhotos.length >= MAX_WORK_PHOTOS) {
      setFormError(`Достигнут лимит: разрешено не более ${MAX_WORK_PHOTOS} фотографий для одной выполненной работы.`);
      return;
    }
    setWorkPhotos([...workPhotos, photoUrlInput.trim()]);
    setPhotoUrlInput('');
    setFormError('');
  };

  // File Upload with automatic compression without quality loss
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_WORK_PHOTOS - workPhotos.length;
    if (remainingSlots <= 0) {
      setFormError(`Вы уже загрузили максимальное количество фотографий (${MAX_WORK_PHOTOS} шт.).`);
      return;
    }

    const filesToUpload = (Array.from(files) as File[]).slice(0, remainingSlots);
    setIsUploadingWorkPhotos(true);
    setFormError('');

    try {
      const newUrls: string[] = [];
      const newStats: { [url: string]: string } = {};

      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) {
          setFormError('Пожалуйста, выбирайте только файлы изображений (JPG, PNG, WebP).');
          continue;
        }

        // Automatic lossless-quality compression via HTML5 Canvas
        const compressed = await compressImageFile(file, 1600, 0.84);
        const statLabel = compressed.savedPercent > 0 
          ? `${compressed.compressedSizeFormatted} (-${compressed.savedPercent}%)`
          : compressed.compressedSizeFormatted;

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
            newUrls.push(finalUrl);
            newStats[finalUrl] = statLabel;
          } else {
            newUrls.push(compressed.base64);
            newStats[compressed.base64] = statLabel;
          }
        } catch {
          newUrls.push(compressed.base64);
          newStats[compressed.base64] = statLabel;
        }
      }

      setWorkPhotos((prev) => [...prev, ...newUrls].slice(0, MAX_WORK_PHOTOS));
      setPhotoCompressStats((prev) => ({ ...prev, ...newStats }));

      if (files.length > remainingSlots) {
        setFormError(`Загружено ${remainingSlots} фото. Лимит на одну работу — ${MAX_WORK_PHOTOS} фотографий.`);
      }
    } catch (err: any) {
      console.error('Master work photo upload error:', err);
      setFormError('Ошибка при обработке фото: ' + (err.message || ''));
    } finally {
      setIsUploadingWorkPhotos(false);
      const input = document.getElementById('master-work-photos-file-input') as HTMLInputElement | null;
      if (input) input.value = '';
    }
  };

  // Remove Photo from form
  const handleRemovePhoto = (idx: number) => {
    setWorkPhotos(workPhotos.filter((_, i) => i !== idx));
  };

  // Submit Work (Create or Edit)
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workTitle.trim()) {
      setFormError('Пожалуйста, укажите название выполненной работы.');
      return;
    }
    if (!workDescription.trim()) {
      setFormError('Пожалуйста, опишите процесс и особенности выполнения работы.');
      return;
    }
    if (workPhotos.length === 0) {
      setFormError(`Пожалуйста, добавьте хотя бы 1 фотографию (до ${MAX_WORK_PHOTOS} фото).`);
      return;
    }

    setIsSubmittingWork(true);
    setFormError('');

    try {
      if (editingWork) {
        // Update existing work
        const res = await fetch(`/api/master-works/${editingWork.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: workTitle,
            description: workDescription,
            category: workCategory,
            completedAt: workCompletedAt,
            photos: workPhotos.slice(0, MAX_WORK_PHOTOS),
            status: 'pending', // Re-moderation upon edit
          }),
        });
        if (res.ok) {
          setFormSuccessMessage('Работа успешно обновлена и направлена на проверку администратору.');
          setTimeout(() => {
            handleResetWorkForm();
            loadMasterWorks();
          }, 1200);
        } else {
          setFormError('Не удалось обновить работу. Попробуйте снова.');
        }
      } else {
        // Create new work
        const res = await fetch('/api/master-works', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            specialistId: specialist.id,
            specialistName: specialist.name,
            title: workTitle,
            description: workDescription,
            category: workCategory,
            completedAt: workCompletedAt || new Date().toISOString().split('T')[0],
            photos: workPhotos.slice(0, MAX_WORK_PHOTOS),
          }),
        });
        if (res.ok) {
          setFormSuccessMessage('Работа успешно добавлена! Она направлена на модерацию администратору и скоро станет доступна всем пользователям.');
          setTimeout(() => {
            handleResetWorkForm();
            loadMasterWorks();
          }, 1500);
        } else {
          const errData = await res.json();
          setFormError(errData.error || 'Не удалось сохранить работу.');
        }
      }
    } catch (err: any) {
      setFormError('Ошибка сети: ' + err.message);
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // Delete Work
  const handleDeleteWork = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту работу из своего портфолио?')) {
      return;
    }
    try {
      const res = await fetch(`/api/master-works/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorks(works.filter((w) => w.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete work:', e);
    }
  };

  // Send Reply to User
  const handleSendReply = async (requestId: string) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/service-requests/${requestId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterReply: replyText.trim(),
          status: 'approved',
        }),
      });
      if (res.ok) {
        setReplySuccessMsg('Ваш ответ успешно сохранен и передан заказчику!');
        setReplyingRequestId(null);
        setReplyText('');
        loadMasterMessages(true);
        setTimeout(() => setReplySuccessMsg(''), 3000);
      }
    } catch (e) {
      console.error('Failed to reply:', e);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Change status of request (e.g. mark completed)
  const handleUpdateStatus = async (requestId: string, newStatus: 'approved' | 'completed') => {
    try {
      const res = await fetch(`/api/service-requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReplySuccessMsg(newStatus === 'completed' ? 'Заявка отмечена как выполненная!' : 'Заявка принята в работу!');
        loadMasterMessages(true);
        if (newStatus === 'completed') {
          const found = messages.find((m) => m.id === requestId);
          if (found) {
            setSelectedRequestForReview(found);
            setIsReviewModalOpen(true);
          }
        }
        setTimeout(() => setReplySuccessMsg(''), 3000);
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  // Submit Article (for high-rated masters >= 4.8)
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim()) return;
    if (!articleDescription.trim()) return;

    setIsSubmittingArticle(true);
    try {
      const toolsArr = articleTools
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const matArr = articleMaterials
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleTitle,
          category: articleCategory,
          type: 'article',
          difficulty: articleDifficulty,
          timeEst: articleTimeEst,
          description: articleDescription,
          coverImage:
            articleCover.trim() ||
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
          author: `${specialist.name} (Мастер СантехПро, рейтинг ${specialist.rating}⭐)`,
          authorMasterId: specialist.id,
          toolsRequired: toolsArr,
          materialsRequired: matArr,
          steps: articleSteps,
        }),
      });

      if (res.ok) {
        setArticleSuccessMsg('Статья успешно отправлена на проверку администратору! После модерации она будет опубликована в Справочнике СантехПро.');
        setIsWritingArticle(false);
        setArticleTitle('');
        setArticleDescription('');
        loadMasterArticles();
        setTimeout(() => setArticleSuccessMsg(''), 4000);
      }
    } catch (e) {
      console.error('Failed to submit article:', e);
    } finally {
      setIsSubmittingArticle(false);
    }
  };

  return (
    <div id="master-cabinet-section" className="space-y-6">
      {/* Master Profile Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={specialist.photo}
                alt={specialist.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-400 shadow-md"
              />
              <div
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-900 shadow"
                title="Верифицированный профиль"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {specialist.name}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle className="w-3 h-3" /> Проверенный мастер
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs sm:text-sm text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  {specialist.city}
                </span>
                <span>•</span>
                <span>Опыт: {specialist.experienceYears} лет</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {specialist.rating} ({specialist.reviewsCount} отзывов)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequestForReview(null);
                    setIsReviewModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition shadow-sm cursor-pointer ml-1"
                  title="Отправить персональный запрос на отзыв в WhatsApp, Telegram или SMS"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Запросить отзыв</span>
                </button>
              </div>
            </div>
          </div>

          {/* Rating Status Badge & Profile Visibility Controls */}
          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 sm:text-right w-full sm:w-auto">
              <div className="flex sm:justify-end items-center gap-1.5 text-xs text-slate-400">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Статус автора статей:</span>
              </div>
              {isHighRated ? (
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/30">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Повышенный рейтинг ({specialist.rating}⭐) — Публикация статей открыта!
                </div>
              ) : (
                <div className="mt-1 text-xs text-slate-400">
                  Рейтинг: <span className="text-white font-semibold">{specialist.rating}⭐</span>. Статьи доступны от <span className="text-amber-300 font-semibold">4.8⭐</span>
                </div>
              )}
            </div>

            {/* Profile Visibility Toggle */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              {masterStatus === 'suspended' ? (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleToggleSuspendProfile('approved')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  title="Возобновить показ профиля в каталоге"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Возобновить показ в каталоге</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleToggleSuspendProfile('suspended')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Временно скрыть профиль из каталога (отпуск / занят)"
                >
                  <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Приостановить показ (отпуск)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Visibility Alert if Suspended */}
        {masterStatus === 'suspended' && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <EyeOff className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Показ анкеты приостановлен:</strong> Ваша карточка временно скрыта из каталога мастеров и поиска. Прямые вызовы от новых клиентов не поступают.
              </span>
            </div>
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleToggleSuspendProfile('approved')}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shrink-0 cursor-pointer shadow-md"
            >
              Включить показ
            </button>
          </div>
        )}

        {/* REAL-TIME NOTIFICATION BANNER FOR MASTER (Direct requests without admin moderation) */}
        {unhandledRequests.length > 0 && (
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-slate-900 border-2 border-amber-500/40 shadow-lg space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 animate-bounce shadow-md">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    У вас {unhandledRequests.length}{' '}
                    {unhandledRequests.length === 1 ? 'новая прямая заявка' : 'новые прямые заявки'} на вызов!
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubTab('messages')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Eye className="w-4 h-4" />
                <span>Открыть заявки ({unhandledRequests.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Pop-up toast when brand new request arrives */}
        {newRequestAlert && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-900 border-2 border-amber-500 text-white shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-top-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-amber-400">⚡ Новая заявка на вызов!</span>
                </div>
                <p className="text-xs text-slate-200">
                  Заказчик: <strong>{newRequestAlert.clientName}</strong> ({newRequestAlert.city}).
                  Проблема: «{newRequestAlert.problemDescription}»
                </p>
                <div className="flex items-center gap-3 text-xs pt-1">
                  <a
                    href={`tel:${newRequestAlert.clientPhone}`}
                    className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Позвонить: {newRequestAlert.clientPhone}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubTab('messages');
                      setNewRequestAlert(null);
                    }}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Перейти к заявке →
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setNewRequestAlert(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800 overflow-x-auto">
          <button
            id="master-tab-services-btn"
            onClick={() => setActiveSubTab('services')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'services'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Профиль и услуги ({servicesList.length})</span>
          </button>

          <button
            id="master-tab-works-btn"
            onClick={() => setActiveSubTab('works')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'works'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Портфолио работ ({works.length})</span>
          </button>

          <button
            id="master-tab-messages-btn"
            onClick={() => setActiveSubTab('messages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'messages'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Заявки и сообщения ({messages.length})</span>
            {unhandledRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                {unhandledRequests.length} новых
              </span>
            )}
          </button>

          <button
            id="master-tab-estimates-btn"
            onClick={() => setActiveSubTab('estimates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'estimates'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Сметы клиентам</span>
          </button>

          <button
            id="master-tab-contracts-btn"
            onClick={() => setActiveSubTab('contracts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'contracts'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Договоры и акты</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              B2B
            </span>
          </button>

          <button
            id="master-tab-articles-btn"
            onClick={() => setActiveSubTab('articles')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'articles'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Статьи о сантехнике ({masterArticles.length})</span>
          </button>
        </div>
      </div>

      {servicesSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{servicesSuccessMsg}</span>
        </div>
      )}

      {servicesErrorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2 shadow-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{servicesErrorMsg}</span>
        </div>
      )}

      {replySuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{replySuccessMsg}</span>
        </div>
      )}

      {articleSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{articleSuccessMsg}</span>
        </div>
      )}

      {/* TAB 0: SERVICES & PRICING MANAGEMENT (ПОСЛЕ МОДЕРАЦИИ АДМИНОМ) */}
      {activeSubTab === 'services' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Card */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-500" />
                  <span>Управление услугами и прайс-листом</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Ваш профиль проверен администратором. Здесь вы можете добавлять новые виды работ, удалять неактуальные, корректировать минимальную стоимость вызова и контактные данные.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Профиль подтверждён</span>
              </span>
            </div>

            {/* Notice */}
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Все добавленные вами услуги сразу выводятся в фильтрах поиска каталога «СантехПро» для заказчиков в вашем городе (<strong>{specialist.city}</strong>) и закрепляются в вашей карточке мастера.
              </span>
            </div>
          </div>

          {/* Service Manager Section */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-500" />
                <span>Текущие оказываемые услуги ({servicesList.length})</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Нажмите на крестик, чтобы удалить услугу, или используйте форму ниже для добавления новых.
              </p>
            </div>

            {/* Active services chips */}
            {servicesList.length === 0 ? (
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-500 text-xs">
                У вас пока не указано ни одной услуги. Добавьте услуги ниже из списка популярных или введите вручную.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {servicesList.map((srv, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-900/90 border border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-cyan-300 text-xs font-semibold shadow-xs group"
                  >
                    <span>{srv}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(srv)}
                      className="p-0.5 rounded-md hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                      title={`Удалить услугу «${srv}»`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Custom Service Form */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Добавить новую услугу вручную:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newServiceInput}
                  onChange={(e) => setNewServiceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomService();
                    }
                  }}
                  placeholder="Например: Монтаж трапа в душевую, замена редуктора давления..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomService}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить услугу</span>
                </button>
              </div>
            </div>

            {/* Popular quick presets with categories & search */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Каталог инженерных и сантехнических услуг (выбор в 1 клик):
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Включая тепловые насосы «воздух-вода», котельные, коллекторы и чистовой монтаж.
                  </p>
                </div>

                {/* Search input in presets */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={presetSearchQuery}
                    onChange={(e) => setPresetSearchQuery(e.target.value)}
                    placeholder="Быстрый поиск услуг..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {presetSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPresetSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setPresetCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                    presetCategoryFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Все категории ({ALL_ENGINEERING_SERVICES.length})
                </button>

                {ENGINEERING_SERVICE_GROUPS.map((grp) => {
                  const isActive = presetCategoryFilter === grp.id;
                  const isHeatPumpCategory = grp.id === 'heat_pumps_boilers';
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => setPresetCategoryFilter(grp.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        isActive
                          ? isHeatPumpCategory
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                            : 'bg-blue-600 text-white shadow-sm'
                          : isHeatPumpCategory
                          ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {grp.id === 'heat_pumps_boilers' && <Zap className="w-3 h-3 text-amber-400" />}
                      {grp.id === 'water_distribution' && <Droplets className="w-3 h-3 text-cyan-400" />}
                      {grp.id === 'heating_floor' && <Flame className="w-3 h-3 text-orange-400" />}
                      {grp.id === 'fixtures_sanitary' && <Bath className="w-3 h-3 text-purple-400" />}
                      {grp.id === 'emergency_maintenance' && <Clock className="w-3 h-3 text-emerald-400" />}
                      <span>{grp.name}</span>
                      {grp.badge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {grp.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Filtered Services Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                {ALL_ENGINEERING_SERVICES
                  .filter((item) => {
                    const matchesCategory = presetCategoryFilter === 'all' || item.categoryId === presetCategoryFilter;
                    const matchesSearch = !presetSearchQuery.trim() || 
                      item.name.toLowerCase().includes(presetSearchQuery.toLowerCase()) ||
                      (item.description && item.description.toLowerCase().includes(presetSearchQuery.toLowerCase()));
                    return matchesCategory && matchesSearch;
                  })
                  .map((item, idx) => {
                    const isAlreadyAdded = servicesList.includes(item.name);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isAlreadyAdded) {
                            handleRemoveService(item.name);
                          } else {
                            handleQuickAddService(item.name);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-start justify-between gap-2.5 select-none ${
                          isAlreadyAdded
                            ? 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/40 text-blue-900 dark:text-cyan-300 shadow-xs'
                            : item.isHeatPump
                            ? 'bg-cyan-500/5 hover:bg-cyan-500/10 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40 border-cyan-500/20 hover:border-cyan-500/40 text-slate-800 dark:text-slate-200'
                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.isHeatPump && (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-black border border-cyan-500/30">
                                ТН Воздух-Вода
                              </span>
                            )}
                            <span className="text-xs font-semibold leading-tight block truncate" title={item.name}>
                              {item.name}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                          {item.defaultPrice && (
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                              Ориентир: от {item.defaultPrice.toLocaleString('ru-RU')} ₽
                            </span>
                          )}
                        </div>

                        <div className="shrink-0 mt-0.5">
                          {isAlreadyAdded ? (
                            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition">
                              <Plus className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Profile Details, Pricing, Emergency & Bio Card */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span>Личные данные и параметры профиля</span>
            </h4>

            {/* Name, City, Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ФИО мастера / Название:
                </label>
                <input
                  type="text"
                  value={masterName}
                  onChange={(e) => setMasterName(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Город обслуживания:
                </label>
                <input
                  type="text"
                  value={masterCity}
                  onChange={(e) => setMasterCity(e.target.value)}
                  placeholder="Москва"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Опыт работы (лет):
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={masterExperienceYears}
                  onChange={(e) => setMasterExperienceYears(Number(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Min Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Минимальная стоимость вызова (от ₽):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={masterMinPrice}
                    onChange={(e) => setMasterMinPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">₽</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Стартовая цена диагностики и мелкого ремонта в г. {masterCity || specialist.city}.
                </p>
              </div>

              {/* Emergency 24/7 Switch */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Аварийные вызовы 24/7:
                </label>
                <div
                  onClick={() => setMasterEmergency(!masterEmergency)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    masterEmergency
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${masterEmergency ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold">
                      {masterEmergency ? 'Готов к ночным и срочным выездам' : 'Только в рабочие часы'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={masterEmergency}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Мастера с бейджем 24/7 получают приоритет в ночных аварийных заявках.
                </p>
              </div>
            </div>

            {/* Bio & Warranty */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                О себе, гарантиях и используемом инструменте:
              </label>
              <textarea
                rows={3}
                value={masterBio}
                onChange={(e) => setMasterBio(e.target.value)}
                placeholder="Например: Профессиональный инструмент Rothenberger и пресс-клещи. Гарантия по договору до 3 лет. Чистота после монтажа..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Contacts & Avatar update */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Контактный телефон:</label>
                <input
                  type="tel"
                  value={masterPhone}
                  onChange={(e) => setMasterPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Telegram (@username):</label>
                <input
                  type="text"
                  value={masterTelegram}
                  onChange={(e) => setMasterTelegram(e.target.value)}
                  placeholder="@santeh_master"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">WhatsApp телефон:</label>
                <input
                  type="text"
                  value={masterWhatsapp}
                  onChange={(e) => setMasterWhatsapp(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Main Photo update & deletion */}
            <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <img
                src={masterPhoto || specialist.photo}
                alt={specialist.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/40 shrink-0 bg-slate-800"
              />
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Главная фотография мастера:
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Вы можете заменить или удалить фото своего профиля.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-xs">
                    {isUploadingMasterPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                    <span>Загрузить новое фото</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMasterPhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleDeleteProfilePhoto}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Удалить фото</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Всего указано услуг: <strong className="text-slate-900 dark:text-white">{servicesList.length}</strong>
              </div>

              <button
                type="button"
                disabled={isSavingServices}
                onClick={handleSaveServices}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50"
              >
                {isSavingServices ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Сохранить профиль и прайс</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DANGER ZONE: ANNUL PROFILE / WITHDRAW QUESTIONNAIRE */}
          <div className="p-5 sm:p-6 bg-rose-950/20 border border-rose-500/30 rounded-3xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Аннулирование анкеты мастера
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Если вы больше не оказываете сантехнические услуги или хотите удалить свой профиль из системы «СантехПро», вы можете полностью аннулировать анкету. Ваша карточка мастера будет навсегда удалена из активного каталога.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAnnulConfirmModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Аннулировать анкету мастера</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PORTFOLIO WORKS (ДО 10 ФОТОГРАФИЙ НА РАБОТУ) */}
      {activeSubTab === 'works' && (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-500" />
                Портфолио выполненных работ
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                Загружайте до 10 фотографий каждой работы с описанием. Система автоматически сжимает файлы без потери качества.
              </p>
            </div>

            {!isAddingWork && (
              <button
                id="add-master-work-btn"
                onClick={() => {
                  handleResetWorkForm();
                  setIsAddingWork(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                Добавить работу (до 10 фото)
              </button>
            )}
          </div>

          {/* ADD / EDIT WORK FORM */}
          {isAddingWork && (
            <div
              id="work-form-card"
              className="p-5 sm:p-6 bg-white dark:bg-slate-800 border-2 border-blue-500/40 rounded-2xl shadow-lg space-y-5 animate-fadeIn"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {editingWork ? 'Редактирование работы' : 'Добавление новой выполненной работы'}
                </h4>
                <button
                  onClick={handleResetWorkForm}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                >
                  Отмена
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitWork} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Название работы *
                    </label>
                    <input
                      id="work-title-input"
                      type="text"
                      value={workTitle}
                      onChange={(e) => setWorkTitle(e.target.value)}
                      placeholder="Например: Коллекторная разводка Rehau в ЖК «Династия»"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Категория сантехники
                    </label>
                    <select
                      id="work-category-select"
                      value={workCategory}
                      onChange={(e) => setWorkCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="water">Водоснабжение (трубы, коллекторы, краны)</option>
                      <option value="heating">Отопление (котельные, радиаторы, теплый пол)</option>
                      <option value="drainage">Канализация и стояки</option>
                      <option value="bath">Санфаянс, ванны и инсталляции</option>
                      <option value="filtration">Фильтрация и очистка воды</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Подробное описание выполненных работ *
                  </label>
                  <textarea
                    id="work-description-input"
                    rows={4}
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    placeholder="Опишите, какие задачи решались, какие материалы использованы (Rehau, FAR, Oventrop, Geberit и т.д.), особенности монтажа и опрессовки..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                    required
                  />
                </div>

                {/* PHOTO UPLOAD SECTION (UP TO 10 PHOTOS WITH AUTO COMPRESSION) */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-500" />
                      Фотографии работы ({workPhotos.length} из 10) *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                        Авто-сжатие без потери качества
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Разрешено до 10 фото
                      </span>
                    </div>
                  </div>

                  {/* File Upload Box */}
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-4 text-center transition-colors bg-slate-50/50 dark:bg-slate-900/40">
                    {isUploadingWorkPhotos ? (
                      <div className="py-3 flex flex-col items-center justify-center space-y-2 text-blue-500">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-xs font-bold">Оптимизация и сжатие фотографий без потери качества...</p>
                        <p className="text-[11px] text-slate-400">Сохраняем оптическую чёткость деталей для быстрой загрузки</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 mx-auto text-blue-500 mb-1.5" />
                        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                          Перетащите до {10 - workPhotos.length} фото сюда или выберите с устройства
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Поддерживаются JPG, PNG, WebP. Система автоматически сожмёт файлы для быстрой загрузки у пользователей.
                        </p>
                        <input
                          type="file"
                          id="master-work-photos-file-input"
                          multiple
                          accept="image/*"
                          disabled={isUploadingWorkPhotos}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="master-work-photos-file-input"
                          className="mt-3 inline-block px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                        >
                          Выбрать фотографии (до 10 шт.)
                        </label>
                      </>
                    )}
                  </div>

                  {/* Add by URL option */}
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      placeholder="Или вставьте прямую ссылку на фото (https://...)"
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-medium hover:bg-slate-700"
                    >
                      Добавить ссылку
                    </button>
                  </div>

                  {/* Thumbnails grid (up to 10) */}
                  {workPhotos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
                      {workPhotos.map((photoUrl, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-900 flex flex-col justify-between"
                        >
                          <img
                            src={photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                            #{idx + 1}
                          </div>
                          {photoCompressStats[photoUrl] && (
                            <div className="absolute bottom-1 left-1 right-1 bg-emerald-950/90 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-medium truncate border border-emerald-500/30 text-center">
                              ✓ {photoCompressStats[photoUrl]}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow"
                            title="Удалить это фото"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    После сохранения работа отправится на модерацию администратору. Как только администратор проверит фотографии и описание, она будет автоматически опубликована в каталоге для всех пользователей.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetWorkForm}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    id="save-master-work-submit-btn"
                    disabled={isSubmittingWork}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmittingWork ? 'Сохранение...' : editingWork ? 'Сохранить изменения' : 'Отправить на модерацию'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LIST OF MASTER WORKS */}
          {isLoadingWorks ? (
            <div className="p-12 text-center text-sm text-slate-400">
              Загрузка портфолио работ мастера...
            </div>
          ) : works.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
              <Camera className="w-12 h-12 mx-auto text-slate-400" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                У вас пока нет загруженных работ
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Загрузите до 10 фотографий своих лучших объектов (монтаж труб, инсталляций, котельных), чтобы заказчики видели ваш профессионализм.
              </p>
              <button
                onClick={() => setIsAddingWork(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all"
              >
                <Plus className="w-4 h-4" /> Добавить первую работу
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {works.map((w) => {
                const photosCount = w.photos?.length || 0;
                const firstPhoto = w.photos?.[0] || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={w.id}
                    id={`master-work-card-${w.id}`}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Image Preview & Gallery trigger */}
                    <div
                      className="relative h-48 bg-slate-900 cursor-pointer group overflow-hidden"
                      onClick={() => setPreviewWork(w)}
                      title="Нажмите для просмотра всех фотографий"
                    >
                      <img
                        src={firstPhoto}
                        alt={w.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                      {/* Status Tag */}
                      <div className="absolute top-3 left-3">
                        {w.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/90 text-white shadow">
                            <CheckCircle className="w-3.5 h-3.5" /> Одобрено и опубликовано
                          </span>
                        ) : w.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/90 text-white shadow">
                            <XCircle className="w-3.5 h-3.5" /> Отклонено
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/90 text-white shadow">
                            <Clock className="w-3.5 h-3.5" /> На модерации у администратора
                          </span>
                        )}
                      </div>

                      {/* Photos Count Badge */}
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 text-white text-xs font-medium flex items-center gap-1.5 border border-white/20">
                        <Camera className="w-3.5 h-3.5 text-blue-400" />
                        <span>{photosCount} из 10 фото</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                          {w.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
                          {w.description}
                        </p>
                      </div>

                      {w.moderationComment && (
                        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                          Комментарий администратора: {w.moderationComment}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setPreviewWork(w)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Смотреть фото ({photosCount})
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditWork(w)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Изменить описание и фото"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWork(w.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Удалить работу"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MESSAGES & REQUESTS FROM USERS */}
      {activeSubTab === 'messages' && (
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Входящие заявки и сообщения от пользователей
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Здесь отображаются заказчики, выбравшие вас в качестве предпочтительного мастера, и прямые обращения.
            </p>
          </div>

          {isLoadingMessages ? (
            <div className="p-10 text-center text-sm text-slate-400">
              Загрузка обращений...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-400" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                Пока нет входящих заявок
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Заявки от пользователей сервиса будут поступать сюда автоматически.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  id={`master-msg-card-${msg.id}`}
                  className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 dark:text-white">
                          {msg.clientName}
                        </span>
                        {msg.emergency && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            Срочный вызов 24/7
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {msg.createdAt?.split('T')[0]}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                          <Phone className="w-3.5 h-3.5" />
                          {msg.clientPhone}
                        </span>
                        <span>•</span>
                        <span>{msg.city}{msg.address ? `, ${msg.address}` : ''}</span>
                        <span>•</span>
                        <span>Время: {msg.preferredTime || 'Как можно скорее'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span>Прямой вызов</span>
                      </span>

                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                          msg.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : msg.status === 'approved'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {msg.status === 'completed'
                          ? 'Выполнено'
                          : msg.status === 'approved'
                          ? 'Принято мастером'
                          : 'Новая заявка'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Описание проблемы от клиента:
                    </span>
                    {msg.problemDescription}
                  </div>

                  {/* Master Reply display */}
                  {msg.masterReply && (
                    <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs sm:text-sm text-blue-900 dark:text-blue-200 space-y-1">
                      <div className="flex items-center justify-between font-semibold text-blue-700 dark:text-blue-300 text-xs">
                        <span>Ваш ответ клиенту:</span>
                        {msg.masterRepliedAt && (
                          <span className="text-[11px] font-normal text-slate-400">
                            {msg.masterRepliedAt.split('T')[0]}
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed">{msg.masterReply}</p>
                    </div>
                  )}

                  {/* Action & Contact buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${msg.clientPhone}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Позвонить: {msg.clientPhone}
                      </a>

                      {msg.clientPhone && (
                        <a
                          href={`https://wa.me/${msg.clientPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          WhatsApp
                        </a>
                      )}

                      {/* Create Estimate for Request */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRequestForEstimate(msg);
                          setIsEstimateBuilderOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer"
                        title="Сформировать детальную смету по этой заявке"
                      >
                        <Calculator className="w-3.5 h-3.5 text-slate-950" />
                        <span>Предложить смету</span>
                      </button>

                      {msg.status !== 'completed' ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(msg.id, 'completed')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Завершить заказ
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequestForReview(msg);
                            setIsReviewModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition shadow-sm cursor-pointer"
                          title="Отправить заказчику персональный запрос на отзыв в WhatsApp, Telegram или SMS"
                        >
                          <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                          <span>Запросить отзыв</span>
                        </button>
                      )}
                    </div>

                    {replyingRequestId !== msg.id ? (
                      <button
                        onClick={() => {
                          setReplyingRequestId(msg.id);
                          setReplyText(msg.masterReply || '');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {msg.masterReply ? 'Изменить ответ' : 'Ответить сообщением'}
                      </button>
                    ) : (
                      <div className="w-full space-y-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Напишите ответ клиенту (стоимость, время выезда, детали)..."
                          className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyingRequestId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            Отмена
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReply(msg.id)}
                            disabled={isSendingReply || !replyText.trim()}
                            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isSendingReply ? 'Отправка...' : 'Отправить ответ'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MASTER ARTICLES (FOR HIGH RATED MASTERS >= 4.8) */}
      {activeSubTab === 'articles' && (
        <div className="space-y-5">
          {!isHighRated ? (
            <div className="p-8 bg-white dark:bg-slate-800 border-2 border-amber-500/30 rounded-2xl text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Lock className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Написание статей доступно мастерам с повышенным рейтингом
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Возможность публиковать авторские статьи в Справочнике СантехПро открывается для специалистов с рейтингом от <span className="font-bold text-amber-500">4.8 ⭐</span>.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 inline-block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Ваш текущий рейтинг: <span className="text-blue-500 font-bold">{specialist.rating} ⭐</span> ({specialist.reviewsCount} отзывов)
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Unlocked Banner */}
              <div className="p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Авторские экспертные статьи о сантехнике
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    У вас повышенный рейтинг ({specialist.rating}⭐)! Создавайте обучающие руководства и статьи, которые после модерации администратором будут опубликованы в Справочнике.
                  </p>
                </div>

                {!isWritingArticle && (
                  <button
                    id="write-master-article-btn"
                    onClick={() => setIsWritingArticle(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Написать статью
                  </button>
                )}
              </div>

              {/* ARTICLE FORM */}
              {isWritingArticle && (
                <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 border-2 border-amber-500/40 rounded-2xl shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Создание новой статьи от мастера
                    </h4>
                    <button
                      onClick={() => setIsWritingArticle(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Отмена
                    </button>
                  </div>

                  <form onSubmit={handleSubmitArticle} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Заголовок статьи *
                        </label>
                        <input
                          type="text"
                          value={articleTitle}
                          onChange={(e) => setArticleTitle(e.target.value)}
                          placeholder="Например: Как избежать завоздушивания теплого пола"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Категория
                        </label>
                        <select
                          value={articleCategory}
                          onChange={(e) => setArticleCategory(e.target.value as any)}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="water">Водоснабжение</option>
                          <option value="heating">Отопление</option>
                          <option value="drainage">Канализация</option>
                          <option value="bath">Санфаянс</option>
                          <option value="tools">Инструменты</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Сложность для читателя
                        </label>
                        <select
                          value={articleDifficulty}
                          onChange={(e) => setArticleDifficulty(e.target.value as any)}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="Новичок">Новичок (для владельцев квартир)</option>
                          <option value="Продвинутый">Продвинутый (сложный ремонт)</option>
                          <option value="Профи">Профи (инженерные узлы)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Ссылка на главное фото обложки
                        </label>
                        <input
                          type="url"
                          value={articleCover}
                          onChange={(e) => setArticleCover(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Краткое введение и суть статьи *
                      </label>
                      <textarea
                        rows={3}
                        value={articleDescription}
                        onChange={(e) => setArticleDescription(e.target.value)}
                        placeholder="Кратко расскажите, какую проблему решает это руководство..."
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Необходимые инструменты (через запятую)
                        </label>
                        <input
                          type="text"
                          value={articleTools}
                          onChange={(e) => setArticleTools(e.target.value)}
                          placeholder="Труборез, пресс-клещи, ключ разводной..."
                          className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Необходимые материалы (через запятую)
                        </label>
                        <input
                          type="text"
                          value={articleMaterials}
                          onChange={(e) => setArticleMaterials(e.target.value)}
                          placeholder="Труба PEX-a, гильзы Rehau, анаэробный герметик..."
                          className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Steps builder */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Пошаговые инструкции ({articleSteps.length} шагов)
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setArticleSteps([
                              ...articleSteps,
                              { title: `Шаг ${articleSteps.length + 1}`, text: '' },
                            ])
                          }
                          className="text-xs text-amber-500 font-semibold hover:underline"
                        >
                          + Добавить шаг
                        </button>
                      </div>

                      {articleSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => {
                                const newSteps = [...articleSteps];
                                newSteps[idx].title = e.target.value;
                                setArticleSteps(newSteps);
                              }}
                              className="font-semibold text-xs text-slate-900 dark:text-white bg-transparent outline-none w-full mr-2"
                              placeholder="Заголовок шага"
                            />
                            {articleSteps.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setArticleSteps(articleSteps.filter((_, i) => i !== idx))
                                }
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <textarea
                            rows={2}
                            value={step.text}
                            onChange={(e) => {
                              const newSteps = [...articleSteps];
                              newSteps[idx].text = e.target.value;
                              setArticleSteps(newSteps);
                            }}
                            placeholder="Подробное описание действий на этом шаге..."
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsWritingArticle(false)}
                        className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingArticle}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
                      >
                        {isSubmittingArticle ? 'Отправка...' : 'Отправить на модерацию'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LIST OF MASTER ARTICLES */}
              {isLoadingArticles ? (
                <div className="p-10 text-center text-sm text-slate-400">
                  Загрузка статей мастера...
                </div>
              ) : masterArticles.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-amber-500/70" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Вы еще не опубликовали ни одной статьи
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Поделитесь своим опытом в сантехнике! Статьи помогают привлекать больше платежеспособных клиентов.
                  </p>
                  <button
                    onClick={() => setIsWritingArticle(true)}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Написать первую статью
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {masterArticles.map((art) => (
                    <div
                      key={art.id}
                      className="p-4 sm:p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {art.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {art.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                            <span>{art.category}</span>
                            <span>•</span>
                            <span>{art.steps?.length || 0} шагов</span>
                            <span>•</span>
                            <span>Просмотры: {art.views || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {art.moderationStatus === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            <CheckCircle className="w-3.5 h-3.5" /> Опубликовано
                          </span>
                        ) : art.moderationStatus === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                            <XCircle className="w-3.5 h-3.5" /> Отклонено
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" /> На модерации
                          </span>
                        )}

                        {onOpenArticle && (
                          <button
                            onClick={() => onOpenArticle(art)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Открыть статью"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ESTIMATES FOR CLIENTS */}
      {activeSubTab === 'estimates' && (
        <MasterEstimatesTab
          specialist={specialist}
          onOpenContractsTab={() => setActiveSubTab('contracts')}
        />
      )}

      {/* TAB 5: OFFICIAL CONTRACTS & ACTS (B2B MAGNET) */}
      {activeSubTab === 'contracts' && (
        <MasterContractsTab
          specialist={specialist}
          availableEstimates={estimates}
        />
      )}

      {/* Estimate Builder Modal (when launched directly from a request) */}
      {isEstimateBuilderOpen && (
        <MasterEstimateBuilderModal
          specialist={specialist}
          linkedRequest={selectedRequestForEstimate}
          onClose={() => {
            setIsEstimateBuilderOpen(false);
            setSelectedRequestForEstimate(null);
          }}
          onSaved={() => {
            setIsEstimateBuilderOpen(false);
            setSelectedRequestForEstimate(null);
            // Switch to estimates tab so master can see the newly generated estimate and share it
            setActiveSubTab('estimates');
          }}
        />
      )}

      {/* Full Lightbox viewer for works with up to 10 photos */}
      {previewWork && (
        <WorkGalleryModal
          work={previewWork}
          specialist={specialist}
          onClose={() => setPreviewWork(null)}
        />
      )}

      {/* Annul Questionnaire Confirmation Modal */}
      {showAnnulConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <UserX className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">
                Аннулировать анкету мастера?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Вы уверены, что хотите полностью отозвать и удалить свою анкету мастера из каталога «СантехПро»?
                Ваша анкета, список услуг, прайс-лист и опубликованные работы будут удалены из общего доступа.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-400 space-y-1">
              <div>• Профиль: <strong className="text-white">{specialist.name}</strong></div>
              <div>• Город: <strong className="text-white">{specialist.city}</strong></div>
              <div>• Действие: <span className="text-rose-400 font-semibold">Безвозвратное аннулирование</span></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isAnnuling}
                onClick={() => setShowAnnulConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Отмена
              </button>

              <button
                type="button"
                disabled={isAnnuling}
                onClick={handleAnnulProfile}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {isAnnuling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Удаление...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Да, аннулировать анкету</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Review Modal */}
      <RequestReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedRequestForReview(null);
        }}
        specialist={specialist}
        request={selectedRequestForReview}
      />
    </div>
  );
};
