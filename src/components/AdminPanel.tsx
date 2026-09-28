import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Check,
  X,
  Trash2,
  BookOpen,
  Users,
  Wrench,
  AlertTriangle,
  Edit,
  Eye,
  LogOut,
  Lock,
  Sparkles,
  ArrowUpRight,
  Layers,
  Save,
  RotateCcw,
  Bell,
  PhoneCall,
  MapPin,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  UserCheck,
  MessageSquare,
  HelpCircle,
  Send,
  Copy,
  PlusCircle,
  BarChart3,
  Star,
  Award,
  MessageCircle,
  CheckSquare,
  FolderOpen,
  Database,
  Mail,
  User,
  Upload,
  Image as ImageIcon,
  Loader2,
  Zap,
  History as HistoryIcon,
  Archive,
  CreditCard,
  Receipt,
  Crown,
  Activity,
  FileText,
  Maximize2,
  ExternalLink,
  FileCheck,
  Download,
  Scale,
  Cloud,
} from 'lucide-react';
import {
  Article,
  PlumbingSpecialist,
  SpecialistVerificationDoc,
  CategoryId,
  ArticleStep,
  ServiceCallRequest,
  CommunityQuestion,
  DeletedSpecialistRecord
} from '../types';
import { CATEGORIES } from '../data/initialData';
import { AdminMediaFilesManager } from './AdminMediaFilesManager';
import { AdminModerationManager } from './AdminModerationManager';
import { SmtpSettingsTab } from './admin/SmtpSettingsTab';
import { YandexOAuthSettingsTab } from './admin/YandexOAuthSettingsTab';
import { TimeWebCloudTab } from './admin/TimeWebCloudTab';
import { CitySpecialistsWorkloadChart } from './admin/CitySpecialistsWorkloadChart';
import { compressImageFile } from '../utils/imageCompressor';
import { useTimeWebSync } from '../services/timewebSyncClient';

interface AdminPanelProps {
  articles: Article[];
  specialists: PlumbingSpecialist[];
  serviceRequests?: ServiceCallRequest[];
  questions?: CommunityQuestion[];
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  onRefreshArticles: () => void;
  onRefreshSpecialists: () => void;
  onRefreshServiceRequests?: () => void;
  onRefreshQuestions?: () => void;
  onSelectArticle: (article: Article) => void;
  onOpenLoginModal: () => void;
}

export interface AdminStepItem {
  title: string;
  text: string;
  warning?: string;
  tip?: string;
  imageUrl?: string;
  imageStats?: {
    originalSize: string;
    compressedSize: string;
    savings: string;
  };
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  articles,
  specialists,
  serviceRequests = [],
  questions = [],
  isAdmin,
  setIsAdmin,
  onRefreshArticles,
  onRefreshSpecialists,
  onRefreshServiceRequests,
  onRefreshQuestions,
  onSelectArticle,
  onOpenLoginModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'articles' | 'files' | 'specialists' | 'questions' | 'users' | 'moderation' | 'smtp' | 'yandex' | 'timeweb'>('requests');
  
  // TimeWeb Cloud Live Sync
  const {
    pingMs: timeWebPingMs,
    isSyncing: isTimeWebSyncing,
    triggerFullSync: triggerTimeWebFullSync,
  } = useTimeWebSync();
  
  // Cloud SQL Users (Admin/Dev Only)
  const [cloudUsers, setCloudUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');

  const loadCloudUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setCloudUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load users from Cloud SQL:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadCloudUsers();
  }, []);
  
  // Toast Notification state
  const [toastState, setToastState] = useState<{ message: string; isError?: boolean } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastState({ message: msg, isError: type === 'error' });
    setTimeout(() => setToastState(null), 4000);
  };

  // Specialists Recharts workload toggle
  const [showWorkloadInSpecialists, setShowWorkloadInSpecialists] = useState(false);

  // Specialist Document & Photo inspection modals
  const [inspectingDoc, setInspectingDoc] = useState<SpecialistVerificationDoc | null>(null);
  const [inspectingPhoto, setInspectingPhoto] = useState<{ url: string; name: string } | null>(null);

  // ---------------- SERVICE REQUESTS FILTERS & FORM MODAL ----------------
  const [requestFilter, setRequestFilter] = useState<'pending' | 'approved' | 'completed' | 'all'>('pending');
  const [requestSearch, setRequestSearch] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ServiceCallRequest | null>(null);

  // Service Request Form States
  const [reqClientName, setReqClientName] = useState('');
  const [reqClientPhone, setReqClientPhone] = useState('');
  const [reqCity, setReqCity] = useState('Москва');
  const [reqAddress, setReqAddress] = useState('');
  const [reqProblemDesc, setReqProblemDesc] = useState('');
  const [reqCategory, setReqCategory] = useState<CategoryId>('water');
  const [reqEmergency, setReqEmergency] = useState(false);
  const [reqPreferredTime, setReqPreferredTime] = useState('Ближайшее время');
  const [reqPreferredMasterName, setReqPreferredMasterName] = useState('');
  const [reqAdminNotes, setReqAdminNotes] = useState('');
  const [reqStatus, setReqStatus] = useState<'pending' | 'approved' | 'completed' | 'rejected'>('pending');

  const handleOpenNewRequestModal = () => {
    setEditingRequest(null);
    setReqClientName('');
    setReqClientPhone('+7 ');
    setReqCity('Москва');
    setReqAddress('');
    setReqProblemDesc('');
    setReqCategory('water');
    setReqEmergency(false);
    setReqPreferredTime('Ближайшее время');
    setReqPreferredMasterName('');
    setReqAdminNotes('');
    setReqStatus('approved');
    setIsRequestModalOpen(true);
  };

  const handleOpenEditRequestModal = (req: ServiceCallRequest) => {
    setEditingRequest(req);
    setReqClientName(req.clientName);
    setReqClientPhone(req.clientPhone);
    setReqCity(req.city);
    setReqAddress(req.address || '');
    setReqProblemDesc(req.problemDescription);
    setReqCategory(req.category || 'water');
    setReqEmergency(req.emergency);
    setReqPreferredTime(req.preferredTime || 'Ближайшее время');
    setReqPreferredMasterName(req.preferredMasterName || '');
    setReqAdminNotes(req.adminNotes || '');
    setReqStatus(req.status);
    setIsRequestModalOpen(true);
  };

  const handleSaveServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqClientName.trim() || !reqClientPhone.trim() || !reqProblemDesc.trim()) {
      alert('Заполните ФИО клиента, телефон и описание поломки!');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        clientName: reqClientName,
        clientPhone: reqClientPhone,
        city: reqCity,
        address: reqAddress,
        problemDescription: reqProblemDesc,
        category: reqCategory,
        emergency: reqEmergency,
        preferredTime: reqPreferredTime,
        preferredMasterName: reqPreferredMasterName || undefined,
        adminNotes: reqAdminNotes || undefined,
        status: reqStatus,
      };

      let res;
      if (editingRequest) {
        res = await fetch(`/api/service-requests/${editingRequest.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/service-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showToast(editingRequest ? 'Заявка успешно обновлена!' : 'Заявка на вызов создана диспетчером!');
        setIsRequestModalOpen(false);
        onRefreshServiceRequests?.();
      } else {
        alert('Ошибка при сохранении заявки.');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка соединения с сервером.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SPECIALISTS FILTERS & FORM MODAL ----------------
  const [specialistSearch, setSpecialistSearch] = useState('');
  const [isSpecialistModalOpen, setIsSpecialistModalOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<PlumbingSpecialist | null>(null);

  // Specialist Form States
  const [specName, setSpecName] = useState('');
  const [specPhoto, setSpecPhoto] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80');
  const [specCity, setSpecCity] = useState('Москва');
  const [specPhone, setSpecPhone] = useState('+7 ');
  const [specTelegram, setSpecTelegram] = useState('');
  const [specWhatsapp, setSpecWhatsapp] = useState('');
  const [specExpYears, setSpecExpYears] = useState('5');
  const [specMinPrice, setSpecMinPrice] = useState('1500');
  const [specRating, setSpecRating] = useState('5.0');
  const [specReviewsCount, setSpecReviewsCount] = useState('12');
  const [specVerified, setSpecVerified] = useState(true);
  const [specEmergency247, setSpecEmergency247] = useState(true);
  const [specBadge, setSpecBadge] = useState('ТОП Мастер');
  const [specBio, setSpecBio] = useState('');
  const [specStatus, setSpecStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [specServices, setSpecServices] = useState('Монтаж труб, Ремонт смесителей, Замена счётчиков, Устранение засоров');

  const handleOpenNewSpecialistModal = () => {
    setEditingSpecialist(null);
    setSpecName('');
    setSpecPhoto('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80');
    setSpecCity('Москва');
    setSpecPhone('+7 ');
    setSpecTelegram('');
    setSpecWhatsapp('');
    setSpecExpYears('7');
    setSpecMinPrice('1500');
    setSpecRating('5.0');
    setSpecReviewsCount('18');
    setSpecVerified(true);
    setSpecEmergency247(true);
    setSpecBadge('Проверено ИИ');
    setSpecBio('Опытный мастер-сантехник со всем необходимым профессиональным оборудованием и инструментом.');
    setSpecStatus('approved');
    setSpecServices('Установка сантехники, Пайка полипропилена, Обжим PEX, Замена смесителей');
    setIsSpecialistModalOpen(true);
  };

  const handleOpenEditSpecialistModal = (spec: PlumbingSpecialist) => {
    setEditingSpecialist(spec);
    setSpecName(spec.name);
    setSpecPhoto(spec.photo);
    setSpecCity(spec.city);
    setSpecPhone(spec.phone);
    setSpecTelegram(spec.telegram || '');
    setSpecWhatsapp(spec.whatsapp || '');
    setSpecExpYears(String(spec.experienceYears));
    setSpecMinPrice(String(spec.minPrice));
    setSpecRating(String(spec.rating));
    setSpecReviewsCount(String(spec.reviewsCount));
    setSpecVerified(spec.verified);
    setSpecEmergency247(spec.emergency247);
    setSpecBadge(spec.badge || '');
    setSpecBio(spec.bio);
    setSpecStatus(spec.status);
    setSpecServices(spec.services ? spec.services.join(', ') : '');
    setIsSpecialistModalOpen(true);
  };

  const handleSaveSpecialist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specName.trim()) {
      showToast('Укажите ФИО мастера!', 'error');
      return;
    }
    if (!specPhone.trim()) {
      showToast('Укажите контактный телефон мастера!', 'error');
      return;
    }
    setLoading(true);
    try {
      const servicesArr = specServices.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        name: specName.trim(),
        photo: specPhoto.trim() || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
        city: specCity.trim() || 'Москва',
        phone: specPhone.trim(),
        telegram: specTelegram.trim() || undefined,
        whatsapp: specWhatsapp.trim() || undefined,
        experienceYears: Number(specExpYears) || 1,
        minPrice: Number(specMinPrice) || 1000,
        rating: Number(specRating) || 5.0,
        reviewsCount: Number(specReviewsCount) || 0,
        verified: specVerified,
        emergency247: specEmergency247,
        badge: specBadge.trim() || undefined,
        bio: specBio.trim(),
        services: servicesArr.length > 0 ? servicesArr : ['Установка сантехники', 'Ремонт разводки'],
        status: specStatus,
      };

      let res;
      if (editingSpecialist) {
        res = await fetch(`/api/specialists/${encodeURIComponent(editingSpecialist.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/specialists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showToast(editingSpecialist ? 'Профиль мастера успешно обновлён!' : 'Новый сантехник добавлен в базу!');
        setIsSpecialistModalOpen(false);
        setEditingSpecialist(null);
        onRefreshSpecialists();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Ошибка при сохранении мастера на сервере.', 'error');
      }
    } catch (err) {
      console.error('Error saving specialist:', err);
      showToast('Ошибка соединения с сервером при сохранении.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ARTICLES STATE & HANDLERS ----------------
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [adminArticleSearch, setAdminArticleSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryId>('water');
  const [newType, setNewType] = useState<'article' | 'video'>('article');
  const [newAdminSection, setNewAdminSection] = useState<'handbook' | 'courses' | 'cases'>('handbook');
  const [newAccessType, setNewAccessType] = useState<'free' | 'paid'>('free');
  const [newPrice, setNewPrice] = useState('');
  const [newBuyUrl, setNewBuyUrl] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Новичок' | 'Продвинутый' | 'Профи'>('Новичок');
  const [newTimeEst, setNewTimeEst] = useState('20 мин');
  const [newDesc, setNewDesc] = useState('');
  const [newCover, setNewCover] = useState('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newTools, setNewTools] = useState('Разводной ключ, ФУМ-лента');
  const [newMaterials, setNewMaterials] = useState('Прокладки, Герметик');
  
  const [stepsList, setStepsList] = useState<AdminStepItem[]>([
    { title: 'Подготовка инструмента и материалов', text: 'Перекройте подачу воды на вводных вентилях стояка.', imageUrl: '' },
    { title: 'Демонтаж и замена', text: 'Выполните разборку узла и установите новые детали.', imageUrl: '' }
  ]);
  const [compressingStepIdx, setCompressingStepIdx] = useState<number | null>(null);
  const [compressingCover, setCompressingCover] = useState(false);
  const [coverStats, setCoverStats] = useState<{
    originalSize: string;
    compressedSize: string;
    savings: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [articleFilter, setArticleFilter] = useState<'all' | 'handbook' | 'courses' | 'cases'>('all');

  // ---------------- DELETE CONFIRMATION MODAL STATE ----------------
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'article' | 'request' | 'specialist';
    id: string;
    title: string;
    subtitle?: string;
    meta?: { label: string; value: string }[];
  } | null>(null);
  const [isExecutingDelete, setIsExecutingDelete] = useState(false);
  const [deletedSpecialistsAudit, setDeletedSpecialistsAudit] = useState<DeletedSpecialistRecord[]>([]);
  const [showDeletedArchiveModal, setShowDeletedArchiveModal] = useState(false);

  const fetchDeletedSpecialistsAudit = async () => {
    try {
      const res = await fetch('/api/specialists/deleted');
      if (res.ok) {
        const data = await res.json();
        setDeletedSpecialistsAudit(data);
      }
    } catch (err) {
      console.warn('Could not fetch deleted specialists audit:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDeletedSpecialistsAudit();
    }
  }, [isAdmin]);

  // Close confirmation modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteConfirmTarget && !isExecutingDelete) {
        setDeleteConfirmTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirmTarget, isExecutingDelete]);

  // ---------------- COMMUNITY QUESTIONS & ANSWERS STATE ----------------
  const [questionSearch, setQuestionSearch] = useState('');
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [selectedQuestionForAnswer, setSelectedQuestionForAnswer] = useState<CommunityQuestion | null>(null);
  const [answerAuthorName, setAnswerAuthorName] = useState('Главный Эксперт СантехПро');
  const [answerText, setAnswerText] = useState('');

  const handleOpenAnswerModal = (q: CommunityQuestion) => {
    setSelectedQuestionForAnswer(q);
    setAnswerAuthorName('Главный Эксперт СантехПро');
    setAnswerText('');
    setIsAnswerModalOpen(true);
  };

  const handleSaveAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestionForAnswer || !answerText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/questions/${selectedQuestionForAnswer.id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: answerAuthorName || 'Главный Эксперт СантехПро',
          text: answerText,
          isMaster: true,
        }),
      });
      if (res.ok) {
        showToast('Официальный ответ опубликован!');
        setIsAnswerModalOpen(false);
        setAnswerText('');
        onRefreshQuestions?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос из сообщества?')) return;
    try {
      await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      showToast('Вопрос успешно удалён.');
      onRefreshQuestions?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnswer = async (questionId: string, answerId: string) => {
    if (!confirm('Удалить этот ответ?')) return;
    try {
      await fetch(`/api/questions/${questionId}/answers/${answerId}`, { method: 'DELETE' });
      showToast('Ответ удалён.');
      onRefreshQuestions?.();
    } catch (err) {
      console.error(err);
    }
  };

  // Duplicate / Clone Article for fast template creation
  const handleDuplicateArticle = async (art: Article) => {
    if (!confirm(`Создать дубликат статьи "${art.title}"?`)) return;
    setLoading(true);
    try {
      const copyPayload = {
        ...art,
        id: undefined,
        title: `${art.title} (Копия)`,
        createdAt: new Date().toISOString().split('T')[0],
      };

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copyPayload),
      });

      if (res.ok) {
        showToast('Дубликат статьи успешно создан!');
        onRefreshArticles();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const pendingSpecialists = specialists.filter((s) => s.status === 'pending');
  const approvedSpecialists = specialists.filter((s) => s.status === 'approved');
  const verifiedSpecialists = specialists.filter((s) => s.verified);

  const pendingRequests = serviceRequests.filter((r) => r.status === 'pending');
  const approvedRequests = serviceRequests.filter((r) => r.status === 'approved');
  const completedRequests = serviceRequests.filter((r) => r.status === 'completed');

  const filteredRequests = serviceRequests.filter((r) => {
    if (requestFilter === 'pending' && r.status !== 'pending') return false;
    if (requestFilter === 'approved' && r.status !== 'approved') return false;
    if (requestFilter === 'completed' && r.status !== 'completed') return false;

    if (requestSearch.trim()) {
      const q = requestSearch.toLowerCase();
      const matchName = r.clientName.toLowerCase().includes(q);
      const matchPhone = r.clientPhone.toLowerCase().includes(q);
      const matchCity = r.city.toLowerCase().includes(q);
      const matchDesc = r.problemDescription.toLowerCase().includes(q);
      const matchMaster = r.preferredMasterName?.toLowerCase().includes(q) || false;
      return matchName || matchPhone || matchCity || matchDesc || matchMaster;
    }
    return true;
  });

  const filteredSpecialists = specialists.filter((s) => {
    if (!specialistSearch.trim()) return true;
    const q = specialistSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.bio.toLowerCase().includes(q)
    );
  });

  const filteredQuestions = questions.filter((q) => {
    if (!questionSearch.trim()) return true;
    const search = questionSearch.toLowerCase();
    return (
      q.title.toLowerCase().includes(search) ||
      q.text.toLowerCase().includes(search) ||
      q.authorName.toLowerCase().includes(search) ||
      q.city.toLowerCase().includes(search)
    );
  });

  const handleModerateRequest = async (id: string, status: 'approved' | 'completed' | 'rejected') => {
    try {
      await fetch(`/api/service-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      showToast('Статус заявки изменён!');
      onRefreshServiceRequests?.();
    } catch (err) {
      console.error(err);
    }
  };

  const promptDeleteRequest = (req: ServiceCallRequest) => {
    setDeleteConfirmTarget({
      type: 'request',
      id: req.id,
      title: `Заявка от ${req.clientName}`,
      subtitle: req.problemDescription,
      meta: [
        { label: 'Телефон', value: req.clientPhone },
        { label: 'Город / Адрес', value: req.city },
        { label: 'Мастер', value: req.preferredMasterName || 'Любой свободный' },
        { label: 'Дата заявки', value: new Date(req.createdAt).toLocaleString('ru-RU') },
      ],
    });
  };

  const handleDeleteRequest = (id: string) => {
    const req = serviceRequests.find((r) => r.id === id);
    if (req) {
      promptDeleteRequest(req);
    } else {
      setDeleteConfirmTarget({
        type: 'request',
        id,
        title: 'Заявка на вызов мастера',
      });
    }
  };

  const promptDeleteArticle = (art: Article) => {
    setDeleteConfirmTarget({
      type: 'article',
      id: art.id,
      title: art.title,
      subtitle: art.description,
      meta: [
        { label: 'Раздел', value: art.category },
        { label: 'Тип', value: art.type === 'video' ? 'Видеокурс' : 'Статья справочника' },
        { label: 'Сложность', value: art.difficulty },
        { label: 'Автор', value: art.author || 'Администрация' },
      ],
    });
  };

  const promptDeleteSpecialist = (spec: PlumbingSpecialist) => {
    setDeleteConfirmTarget({
      type: 'specialist',
      id: spec.id,
      title: `Мастер: ${spec.name}`,
      subtitle: spec.bio || 'Мастер-сантехник в каталоге',
      meta: [
        { label: 'Город', value: spec.city },
        { label: 'Телефон', value: spec.phone },
        { label: 'Зарегистрирован', value: spec.appliedAt || (spec.consentTimestamp ? new Date(spec.consentTimestamp).toLocaleDateString('ru-RU') : 'Ранее') },
        { label: 'Стаж / Рейтинг', value: `${spec.experienceYears} лет / ⭐ ${spec.rating}` },
      ],
    });
  };

  const handleConfirmDeleteAction = async () => {
    if (!deleteConfirmTarget) return;

    setIsExecutingDelete(true);
    try {
      if (deleteConfirmTarget.type === 'article') {
        const res = await fetch(`/api/articles/${deleteConfirmTarget.id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast(`Материал «${deleteConfirmTarget.title}» успешно удалён.`);
          onRefreshArticles();
        } else {
          showToast('Ошибка при удалении статьи.');
        }
      } else if (deleteConfirmTarget.type === 'request') {
        const res = await fetch(`/api/service-requests/${deleteConfirmTarget.id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Заявка клиента успешно удалена.');
          onRefreshServiceRequests?.();
        } else {
          showToast('Ошибка при удалении заявки.');
        }
      } else if (deleteConfirmTarget.type === 'specialist') {
        const res = await fetch(`/api/specialists/${deleteConfirmTarget.id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast(`Мастер «${deleteConfirmTarget.title}» навсегда удалён. В БД сохранена запись аудита: дата регистрации и дата удаления.`);
          onRefreshSpecialists();
          fetchDeletedSpecialistsAudit();
        } else {
          showToast('Ошибка при удалении мастера из базы данных.');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Ошибка подключения к серверу при удалении.');
    } finally {
      setIsExecutingDelete(false);
      setDeleteConfirmTarget(null);
    }
  };

  // ---------------- PHOTO AUTO-COMPRESSION UTILITIES ----------------
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 КБ';
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
  };

  const handleStepImageUpload = async (idx: number, file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Пожалуйста, выберите файл изображения (JPEG, PNG, WebP и т.д.)');
      return;
    }

    setCompressingStepIdx(idx);
    try {
      // Smart client-side compression: max 1440px dimension, quality 0.84
      // Compresses typical 3-10MB camera/mobile photos down to ~180-320KB while preserving crisp optical sharpness!
      const compressed = await compressImageFile(file, 1440, 0.84);

      const origSizeStr = formatBytes(compressed.originalSize);
      const compSizeStr = formatBytes(compressed.compressedSize);
      const savingsPercent = compressed.originalSize > 0
        ? Math.max(0, Math.round((1 - compressed.compressedSize / compressed.originalSize) * 100))
        : 0;

      let finalUrl = compressed.base64;

      // Stream to server cloud uploads directory
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileData: compressed.base64,
            fileType: 'photo',
            category: newCategory,
          }),
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.fileUrl) {
            finalUrl = uploadData.fileUrl;
          }
        }
      } catch (uploadErr) {
        console.warn('Cloud upload fallback to compressed base64:', uploadErr);
      }

      setStepsList((prev) => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          imageUrl: finalUrl,
          imageStats: {
            originalSize: origSizeStr,
            compressedSize: compSizeStr,
            savings: `-${savingsPercent}%`,
          },
        };
        return next;
      });

      showToast(`Фото для Шага #${idx + 1} сжато с ${origSizeStr} до ${compSizeStr} (-${savingsPercent}%) без потери качества!`);
    } catch (err: any) {
      console.error('Image compression error:', err);
      showToast('Ошибка при оптимизации фото: ' + (err.message || ''));
    } finally {
      setCompressingStepIdx(null);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Пожалуйста, выберите файл изображения');
      return;
    }

    setCompressingCover(true);
    try {
      const compressed = await compressImageFile(file, 1600, 0.85);
      const origSizeStr = formatBytes(compressed.originalSize);
      const compSizeStr = formatBytes(compressed.compressedSize);
      const savingsPercent = compressed.originalSize > 0
        ? Math.max(0, Math.round((1 - compressed.compressedSize / compressed.originalSize) * 100))
        : 0;

      let finalUrl = compressed.base64;

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileData: compressed.base64,
            fileType: 'photo',
            category: newCategory,
          }),
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.fileUrl) {
            finalUrl = uploadData.fileUrl;
          }
        }
      } catch (uploadErr) {
        console.warn('Cloud upload fallback for cover:', uploadErr);
      }

      setNewCover(finalUrl);
      setCoverStats({
        originalSize: origSizeStr,
        compressedSize: compSizeStr,
        savings: `-${savingsPercent}%`,
      });
      showToast(`Обложка сжата с ${origSizeStr} до ${compSizeStr} (-${savingsPercent}%) без потери резкости!`);
    } catch (err: any) {
      console.error('Cover compression error:', err);
      showToast('Ошибка при оптимизации обложки: ' + (err.message || ''));
    } finally {
      setCompressingCover(false);
    }
  };

  const handleStartEdit = (article: Article) => {
    setEditingArticleId(article.id);
    setNewTitle(article.title);
    setNewCategory(article.category);
    setNewType(article.type);
    setNewAdminSection(article.adminSection || (article.type === 'video' ? 'courses' : 'handbook'));
    setNewAccessType(article.accessType || 'free');
    setNewPrice(article.price || '');
    setNewBuyUrl(article.buyUrl || '');
    setNewDifficulty(article.difficulty);
    setNewTimeEst(article.timeEst);
    setNewDesc(article.description);
    setNewCover(article.coverImage || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80');
    setNewVideoUrl(article.videoUrl || '');
    setNewTools(article.toolsRequired?.join(', ') || '');
    setNewMaterials(article.materialsRequired?.join(', ') || '');
    setCoverStats(null);
    
    if (article.steps && article.steps.length > 0) {
      setStepsList(
        article.steps.map((s) => ({
          title: s.title,
          text: s.text,
          warning: s.warning || '',
          tip: s.tip || '',
          imageUrl: s.imageUrl || '',
        }))
      );
    } else {
      setStepsList([{ title: 'Шаг 1', text: article.description, imageUrl: '' }]);
    }

    const formElement = document.getElementById('admin-article-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditingArticleId(null);
    setNewTitle('');
    setNewCategory('water');
    setNewType('article');
    setNewAdminSection('handbook');
    setNewAccessType('free');
    setNewPrice('');
    setNewBuyUrl('');
    setNewDifficulty('Новичок');
    setNewTimeEst('20 мин');
    setNewDesc('');
    setNewCover('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80');
    setNewVideoUrl('');
    setNewTools('Разводной ключ, ФУМ-лента');
    setNewMaterials('Прокладки, Герметик');
    setCoverStats(null);
    setStepsList([
      { title: 'Подготовка инструмента и материалов', text: 'Перекройте подачу воды на вводных вентилях стояка.', imageUrl: '' },
      { title: 'Демонтаж и замена', text: 'Выполните разборку узла и установите новые детали.', imageUrl: '' }
    ]);
  };

  const addStepField = () => {
    setStepsList([
      ...stepsList,
      { title: `Шаг ${stepsList.length + 1}`, text: '', warning: '', tip: '', imageUrl: '' }
    ]);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Укажите название материала!');
      return;
    }

    setLoading(true);

    try {
      const toolsArr = newTools.split(',').map((t) => t.trim()).filter(Boolean);
      const materialsArr = newMaterials.split(',').map((m) => m.trim()).filter(Boolean);
      
      const formattedSteps: ArticleStep[] = stepsList.map((s, idx) => ({
        number: idx + 1,
        title: s.title || `Шаг ${idx + 1}`,
        text: s.text || 'Описание действия',
        warning: s.warning?.trim() || undefined,
        tip: s.tip?.trim() || undefined,
        imageUrl: s.imageUrl?.trim() || undefined,
      }));

      let embedUrl = undefined;
      if (newVideoUrl.includes('youtube.com/watch?v=')) {
        const id = newVideoUrl.split('v=')[1]?.split('&')[0];
        if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
      } else if (newVideoUrl.includes('youtu.be/')) {
        const id = newVideoUrl.split('youtu.be/')[1]?.split('?')[0];
        if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
      }

      const payload = {
        title: newTitle,
        category: newCategory,
        type: newType,
        adminSection: newAdminSection,
        accessType: newAccessType,
        price: newAccessType === 'paid' ? (newPrice || '1 990 ₽') : undefined,
        buyUrl: newAccessType === 'paid' ? (newBuyUrl || undefined) : undefined,
        difficulty: newDifficulty,
        timeEst: newTimeEst,
        description: newDesc,
        coverImage: newCover,
        videoUrl: newVideoUrl || undefined,
        videoEmbed: embedUrl,
        toolsRequired: toolsArr,
        materialsRequired: materialsArr,
        steps: formattedSteps,
        author: 'Достонджон Туйчиев',
      };

      let res;
      if (editingArticleId) {
        res = await fetch(`/api/articles/${editingArticleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showToast(editingArticleId ? '✓ Данные и фото этапов успешно сохранены в базе данных! Приложение обновлено.' : '✓ Новый материал и фото шагов сохранены в базе данных! Приложение обновлено.');
        handleResetForm();
        await onRefreshArticles();
      } else {
        showToast('Ошибка при сохранении статьи в базе данных');
      }
    } catch (err) {
      console.error(err);
      showToast('Ошибка подключения к серверу при сохранении.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = (id: string, title: string) => {
    const art = articles.find((a) => a.id === id);
    if (art) {
      promptDeleteArticle(art);
    } else {
      setDeleteConfirmTarget({
        type: 'article',
        id,
        title,
      });
    }
  };

  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const handleModerateSpecialist = async (id: string, status: 'approved' | 'rejected', verified?: boolean) => {
    setModeratingId(id);
    try {
      const res = await fetch(`/api/specialists/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ status, verified }),
      });
      if (res.ok) {
        showToast(status === 'approved' ? 'Мастер успешно одобрен и опубликован в каталоге!' : 'Заявка мастера отклонена.');
        onRefreshSpecialists();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Ошибка при обновлении статуса мастера на сервере.', 'error');
      }
    } catch (err) {
      console.error('Error moderating specialist:', err);
      showToast('Ошибка соединения с сервером при модерации.', 'error');
    } finally {
      setModeratingId(null);
    }
  };

  const handleDeleteSpecialist = (id: string) => {
    const spec = specialists.find((s) => s.id === id);
    if (spec) {
      promptDeleteSpecialist(spec);
    } else {
      setDeleteConfirmTarget({
        type: 'specialist',
        id,
        title: 'Удаление мастера',
        subtitle: 'Удаление мастера навсегда из базы данных',
      });
    }
  };

  // Password Lock Screen if not logged in
  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Доступ ограничен</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Раздел предназначен для администратора и диспетчера портала СантехПро. Авторизуйтесь с помощью пароля для управления всеми сущностями системы.
          </p>
        </div>

        <button
          onClick={onOpenLoginModal}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Ввести пароль администратора</span>
        </button>
      </div>
    );
  }

  const filteredArticles = articles.filter((a) => {
    if (articleFilter === 'handbook' && (a.adminSection !== 'handbook' && a.type !== 'article')) return false;
    if (articleFilter === 'courses' && (a.adminSection !== 'courses' && a.type !== 'video')) return false;
    if (articleFilter === 'cases' && a.adminSection !== 'cases') return false;

    if (adminArticleSearch.trim()) {
      const q = adminArticleSearch.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Toast alert popup */}
      {toastState && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl ${toastState.isError ? 'bg-rose-500' : 'bg-emerald-500'} text-slate-950 font-bold text-sm shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-5`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastState.message}</span>
        </div>
      )}

      {/* Top Admin Header - Compact & Mobile Adaptive */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-xl">
        {/* Top bar: Brand/Title + Badges + Logout button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <h1 className="text-base sm:text-xl font-black text-white truncate">
                  Панель Управления Админа
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shrink-0">
                  CRUD
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                  <span>Онлайн</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate hidden sm:block">
                Управление статьями, заявками на выезд мастеров, каталогом сантехников и модерацией
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Live TimeWeb Cloud Sync Widget */}
            <button
              type="button"
              onClick={() => setActiveTab('timeweb')}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center space-x-2 transition cursor-pointer shadow-sm hover:border-indigo-400/50"
              title="Перейти к управлению окружением TimeWeb Cloud"
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">TimeWeb Cloud:</span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Онлайн</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px] hidden md:inline">({timeWebPingMs} мс)</span>
            </button>

            <button
              onClick={() => setIsAdmin(false)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 hover:border-rose-500/40 text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-700/80 shrink-0 cursor-pointer shadow-sm"
              title="Выйти из режима администрирования"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Dedicated horizontal scroll container with no page overflow */}
        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <div className="w-full min-w-0 max-w-full overflow-x-auto scrollbar-none py-0.5">
            <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-950/90 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-800/90 w-max min-w-full">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Обзор</span>
              </button>

              <button
                onClick={() => setActiveTab('requests')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer relative ${
                  activeTab === 'requests'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Заявки ({serviceRequests.length})</span>
                {pendingRequests.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                    {pendingRequests.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('specialists')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'specialists'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Мастера ({specialists.length})</span>
                {pendingSpecialists.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {pendingSpecialists.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('articles')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'articles'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Статьи ({articles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'files'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Файлы</span>
              </button>

              <button
                onClick={() => setActiveTab('questions')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'questions'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Форум ({questions.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('users');
                  loadCloudUsers();
                }}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Cloud SQL ({cloudUsers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('moderation')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'moderation'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                <span>Модерация</span>
              </button>

              <button
                onClick={() => setActiveTab('smtp')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'smtp'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span>Почта (SMTP)</span>
              </button>

              <button
                onClick={() => setActiveTab('yandex')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'yandex'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center leading-none">
                  Я
                </span>
                <span>Яндекс ID</span>
              </button>

              <button
                onClick={() => setActiveTab('timeweb')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'timeweb'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    : 'text-indigo-300 hover:text-white'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                <span>TimeWeb Cloud</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 0: OVERVIEW & SYSTEM STATS DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Всего Статей и Курсов</span>
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">{articles.length}</div>
              <p className="text-[11px] text-slate-400">Пошаговых руководств и видеоуроков</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Заявки Диспетчера</span>
                <PhoneCall className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">{serviceRequests.length}</div>
              <p className="text-[11px] text-amber-400 font-bold">
                {pendingRequests.length} ожидают звонка диспетчера
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Сантехники в Базе</span>
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">{specialists.length}</div>
              <p className="text-[11px] text-emerald-400 font-bold">
                {verifiedSpecialists.length} проверенных профи
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Вопросы Сообщества</span>
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white">{questions.length}</div>
              <p className="text-[11px] text-slate-400">Вопросов от клиентов в форуме</p>
            </div>

            <div 
              onClick={() => {
                setActiveTab('users');
                loadCloudUsers();
              }}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition space-y-2 shadow-xl group"
            >
              <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-400 transition">
                <span className="text-xs font-bold uppercase tracking-wider">Пользователи БД</span>
                <Database className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white group-hover:text-cyan-400 transition">
                {cloudUsers.length}
              </div>
              <p className="text-[11px] text-cyan-400 font-bold flex items-center justify-between">
                <span>Cloud SQL (PostgreSQL)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>
          </div>

          {/* Visual Workload and Specialist Analytics (Recharts) */}
          <CitySpecialistsWorkloadChart
            specialists={specialists}
            serviceRequests={serviceRequests}
            onSelectCityFilter={(city) => {
              setSpecialistSearch(city);
              setActiveTab('specialists');
              showToast(`Фильтр каталога по городу: ${city}`);
            }}
          />

          {/* Quick Action Hub */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Быстрые действия администратора</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={handleOpenNewRequestModal}
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition text-left space-y-1 group"
              >
                <div className="flex items-center justify-between text-amber-400 font-bold text-sm">
                  <span>+ Создать заявку</span>
                  <PhoneCall className="w-4 h-4 group-hover:scale-110 transition" />
                </div>
                <p className="text-xs text-slate-400">Входящий вызов от клиента</p>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition text-left space-y-1 group"
              >
                <div className="flex items-center justify-between text-blue-400 font-bold text-sm">
                  <span>+ Файлы и медиа</span>
                  <FolderOpen className="w-4 h-4 group-hover:scale-110 transition" />
                </div>
                <p className="text-xs text-slate-400">Материалы, фото, видео и аудио в Cloud SQL</p>
              </button>

              <button
                onClick={handleOpenNewSpecialistModal}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition text-left space-y-1 group"
              >
                <div className="flex items-center justify-between text-emerald-400 font-bold text-sm">
                  <span>+ Добавить мастера</span>
                  <Users className="w-4 h-4 group-hover:scale-110 transition" />
                </div>
                <p className="text-xs text-slate-400">Внести мастера в каталог</p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('articles');
                  handleResetForm();
                }}
                className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition text-left space-y-1 group"
              >
                <div className="flex items-center justify-between text-cyan-400 font-bold text-sm">
                  <span>+ Написать статью</span>
                  <BookOpen className="w-4 h-4 group-hover:scale-110 transition" />
                </div>
                <p className="text-xs text-slate-400">Создать руководство с фото</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: SERVICE REQUESTS QUEUE (ЗАЯВКИ НА ВЫЗОВ МАСТЕРА) */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <PhoneCall className="w-5 h-5 text-amber-400" />
                  <span>Управление Заявками Клиентов</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Принимайте звонки, одобряйте выезды мастеров и редактируйте данные клиентов
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleOpenNewRequestModal}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition flex items-center space-x-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Принять заявку по телефону</span>
                </button>

                <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
                  <button
                    onClick={() => setRequestFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                      requestFilter === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Ожидают ({pendingRequests.length})</span>
                  </button>

                  <button
                    onClick={() => setRequestFilter('approved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      requestFilter === 'approved' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    В работе ({approvedRequests.length})
                  </button>

                  <button
                    onClick={() => setRequestFilter('completed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      requestFilter === 'completed' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Исполнены ({completedRequests.length})
                  </button>

                  <button
                    onClick={() => setRequestFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      requestFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Все ({serviceRequests.length})
                  </button>
                </div>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                placeholder="Поиск по имени, телефону, городу, мастеру или тексту поломки..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">В данной категории заявок нет</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-5 rounded-3xl bg-slate-900 border transition shadow-xl space-y-4 ${
                    req.status === 'pending'
                      ? 'border-amber-500/40 bg-slate-900/90'
                      : req.status === 'approved'
                      ? 'border-emerald-500/30'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5 flex-wrap">
                        <span className="text-base font-extrabold text-white">{req.clientName}</span>
                        <a
                          href={`tel:${req.clientPhone}`}
                          className="px-2.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center space-x-1 hover:bg-cyan-500/25 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{req.clientPhone}</span>
                        </a>

                        {req.emergency && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-extrabold animate-pulse">
                            ⚡ АВАРИЙНЫЙ ВЫЕЗД
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center space-x-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>г. {req.city} {req.address ? `(${req.address})` : ''}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Удобное время: {req.preferredTime || 'Ближайшее'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          req.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : req.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : req.status === 'completed'
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {req.status === 'pending' && '⏳ Ожидает диспетчера'}
                        {req.status === 'approved' && '✅ Одобрена / В работе'}
                        {req.status === 'completed' && '✔️ Исполнена'}
                        {req.status === 'rejected' && '❌ Отклонена'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Описание поломки / задачи:
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        "{req.problemDescription}"
                      </p>
                      {req.adminNotes && (
                        <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-amber-300 font-semibold flex items-start space-x-1">
                          <Bell className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Заметка диспетчера: {req.adminNotes}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Назначенный мастер:
                      </span>
                      <p className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{req.preferredMasterName || 'Любой свободный мастер'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-500">
                      Поступила: {new Date(req.createdAt).toLocaleString('ru-RU')}
                    </div>

                    <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                      <button
                        onClick={() => handleOpenEditRequestModal(req)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Редактировать</span>
                      </button>

                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleModerateRequest(req.id, 'approved')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition flex items-center space-x-1 shadow-md"
                        >
                          <Check className="w-4 h-4" />
                          <span>Одобрить и направить</span>
                        </button>
                      )}

                      {req.status === 'approved' && (
                        <button
                          onClick={() => handleModerateRequest(req.id, 'completed')}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs transition flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Исполнена</span>
                        </button>
                      )}

                      {req.status !== 'rejected' && (
                        <button
                          onClick={() => handleModerateRequest(req.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold transition flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Отклонить</span>
                        </button>
                      )}

                      <button
                        onClick={() => promptDeleteRequest(req)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                        title="Удалить заявку"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ARTICLES, COURSES & CASES MANAGEMENT */}
      {activeTab === 'articles' && (
        <div className="space-y-8">
          <div
            id="admin-article-form"
            className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-amber-400" />
                  <span>
                    {editingArticleId ? 'Редактирование материала' : 'Создать новую инструкцию / урок'}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Заполните поля и добавьте пошаговый конструктор с техническими предостережениями
                </p>
              </div>

              {editingArticleId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Сбросить и создать новую</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Заголовок материала *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Например: Пошаговый монтаж инсталляции унитаза и скрытого бачка"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Раздел в приложении
                  </label>
                  <select
                    value={newAdminSection}
                    onChange={(e: any) => setNewAdminSection(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="handbook">📘 Справочник пошаговых инструкций</option>
                    <option value="courses">🎬 Видеокурс по сантехнике</option>
                    <option value="cases">🛠 Практические кейсы из жизни</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Категория сантехники
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Тип доступа
                  </label>
                  <select
                    value={newAccessType}
                    onChange={(e: any) => setNewAccessType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="free">🎁 Бесплатный доступ</option>
                    <option value="paid">💎 Платный курс / Премиум</option>
                  </select>
                </div>

                {newAccessType === 'paid' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                        Цена курса (₽)
                      </label>
                      <input
                        type="text"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="1 990 ₽"
                        className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                        Ссылка на покупку / оплату
                      </label>
                      <input
                        type="url"
                        value={newBuyUrl}
                        onChange={(e) => setNewBuyUrl(e.target.value)}
                        placeholder="https://pay.yandex.ru/..."
                        className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Сложность
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e: any) => setNewDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Новичок">🌱 Новичок (для владельцев)</option>
                    <option value="Продвинутый">🛠 Продвинутый (своими руками)</option>
                    <option value="Профи">⚡ Профи (сложный инженерный)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Время выполнения
                  </label>
                  <input
                    type="text"
                    value={newTimeEst}
                    onChange={(e) => setNewTimeEst(e.target.value)}
                    placeholder="25 мин"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Краткое описание
                  </label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Описание задачи, назначение узла, основные нюансы..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      <span>URL обложки статьи (Unsplash / Фото)</span>
                    </label>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>Авто-сжатие при загрузке с устройства</span>
                    </span>
                  </div>

                  {newCover && (
                    <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <img
                        src={newCover}
                        alt="Обложка статьи"
                        className="w-20 h-14 sm:w-24 sm:h-16 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-900 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLElement).style.opacity = '0.5';
                        }}
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-200 truncate">Обложка установлена</span>
                        </div>
                        {coverStats ? (
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                              Сжато: {coverStats.compressedSize}
                            </span>
                            <span className="text-slate-400">
                              (было: {coverStats.originalSize}, экономия {coverStats.savings})
                            </span>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-mono truncate">{newCover}</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setNewCover('');
                          setCoverStats(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition cursor-pointer shrink-0"
                        title="Очистить обложку"
                      >
                        Очистить
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={newCover}
                      onChange={(e) => {
                        setNewCover(e.target.value);
                        setCoverStats(null);
                      }}
                      placeholder="Прямая ссылка на обложку (Unsplash или фото)..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />

                    <label
                      htmlFor="cover-photo-upload"
                      className={`px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer whitespace-nowrap ${
                        compressingCover ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {compressingCover ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      ) : (
                        <Upload className="w-4 h-4 text-amber-400" />
                      )}
                      <span>{compressingCover ? 'Сжатие...' : 'Загрузить с устройства'}</span>
                    </label>
                    <input
                      type="file"
                      id="cover-photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCoverImageUpload(file);
                        e.target.value = '';
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Ссылка на YouTube видео (опционально)
                  </label>
                  <input
                    type="text"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Необходимый инструмент (через запятую)
                  </label>
                  <input
                    type="text"
                    value={newTools}
                    onChange={(e) => setNewTools(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Необходимые материалы и расходники
                  </label>
                  <input
                    type="text"
                    value={newMaterials}
                    onChange={(e) => setNewMaterials(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Steps Constructor */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Конструктор пошаговых действий ({stepsList.length})</span>
                  </h3>

                  <button
                    type="button"
                    onClick={addStepField}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить шаг</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {stepsList.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                          Шаг #{idx + 1}
                        </span>

                        {stepsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setStepsList(stepsList.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="Удалить шаг"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Название шага..."
                        value={st.title}
                        onChange={(e) => {
                          const updated = [...stepsList];
                          updated[idx].title = e.target.value;
                          setStepsList(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      />

                      <textarea
                        rows={2}
                        placeholder="Подробное описание действий мастеру..."
                        value={st.text}
                        onChange={(e) => {
                          const updated = [...stepsList];
                          updated[idx].text = e.target.value;
                          setStepsList(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="⚠️ Предостережение / Ошибка (опционально)..."
                          value={st.warning || ''}
                          onChange={(e) => {
                            const updated = [...stepsList];
                            updated[idx].warning = e.target.value;
                            setStepsList(updated);
                          }}
                          className="w-full bg-slate-900 border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-rose-300 placeholder-slate-600 focus:border-rose-500 focus:outline-none"
                        />

                        <input
                          type="text"
                          placeholder="💡 Лайфхак / Совет профи (опционально)..."
                          value={st.tip || ''}
                          onChange={(e) => {
                            const updated = [...stepsList];
                            updated[idx].tip = e.target.value;
                            setStepsList(updated);
                          }}
                          className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-300 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Photo Attachment & Binding for this Step */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <ImageIcon className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold text-white">
                              Фотография / Иллюстрация к шагу #{idx + 1}
                            </span>
                            {st.imageUrl ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Привязано к шагу #{idx + 1}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 hidden sm:inline">
                                (прямая ссылка или файл с устройства)
                              </span>
                            )}
                          </div>

                          {st.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...stepsList];
                                updated[idx].imageUrl = '';
                                updated[idx].imageStats = undefined;
                                setStepsList(updated);
                              }}
                              className="text-[11px] text-rose-400 hover:text-rose-300 transition flex items-center space-x-1 cursor-pointer"
                              title="Очистить фото шага"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Очистить фото</span>
                            </button>
                          )}
                        </div>

                        {compressingStepIdx === idx ? (
                          <div className="py-3 px-3 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-center space-x-2.5 text-xs text-amber-300 animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            <span>Оптимизация и сжатие изображения (сжатие с 3+ МБ до ~300 КБ)...</span>
                          </div>
                        ) : st.imageUrl ? (
                          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                            <img
                              src={st.imageUrl}
                              alt={st.title || `Шаг ${idx + 1}`}
                              className="w-20 h-16 sm:w-24 sm:h-18 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-900 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLElement).style.opacity = '0.5';
                              }}
                            />

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center space-x-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-200 truncate">
                                  Фото успешно привязано к этапу #{idx + 1}
                                </span>
                              </div>

                              {st.imageStats ? (
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1">
                                    <Zap className="w-2.5 h-2.5" />
                                    <span>Сжато: {st.imageStats.compressedSize}</span>
                                  </span>
                                  <span className="text-slate-400">
                                    (исходный: {st.imageStats.originalSize}, экономия {st.imageStats.savings})
                                  </span>
                                  <span className="text-cyan-400 font-medium hidden sm:inline">• Резкость 1440px сохранена</span>
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-400 truncate max-w-full font-mono">
                                  {st.imageUrl}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {/* Dual Direct Input: URL input + Upload from device button */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Прямая ссылка на фото шага #${idx + 1} (https://...)...`}
                            value={st.imageUrl || ''}
                            onChange={(e) => {
                              const updated = [...stepsList];
                              updated[idx].imageUrl = e.target.value;
                              updated[idx].imageStats = undefined;
                              setStepsList(updated);
                            }}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                          />

                          <label
                            htmlFor={`step-photo-input-${idx}`}
                            className={`px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                              compressingStepIdx === idx ? 'opacity-50 pointer-events-none' : ''
                            }`}
                          >
                            {compressingStepIdx === idx ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span>{compressingStepIdx === idx ? 'Сжатие...' : 'Загрузить с устройства'}</span>
                          </label>

                          <input
                            type="file"
                            id={`step-photo-input-${idx}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleStepImageUpload(idx, file);
                              e.target.value = '';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingArticleId ? 'Сохранить изменения' : 'Опубликовать материал'}</span>
                </button>

                {editingArticleId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                  >
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Published Articles Filter Bar */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Опубликованные Руководства ({filteredArticles.length})</span>
              </h2>

              <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
                <button
                  onClick={() => setArticleFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    articleFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Все ({articles.length})
                </button>
                <button
                  onClick={() => setArticleFilter('handbook')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    articleFilter === 'handbook' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Справочник
                </button>
                <button
                  onClick={() => setArticleFilter('courses')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    articleFilter === 'courses' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Видеокурсы
                </button>
                <button
                  onClick={() => setArticleFilter('cases')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    articleFilter === 'cases' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Кейсы
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={adminArticleSearch}
                onChange={(e) => setAdminArticleSearch(e.target.value)}
                placeholder="Поиск по названию статьи, описанию или категории..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-28 rounded-xl object-cover border border-slate-800"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {art.category}
                        </span>
                        {art.accessType === 'paid' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950">
                            Платный {art.price}
                          </span>
                        )}
                        {art.steps && art.steps.some((s) => s.imageUrl) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                            <ImageIcon className="w-2.5 h-2.5" />
                            <span>{art.steps.filter((s) => s.imageUrl).length} фото</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2">
                        {art.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {art.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleStartEdit(art)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 font-bold transition flex items-center space-x-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Изменить</span>
                      </button>

                      <button
                        onClick={() => handleDuplicateArticle(art)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition"
                        title="Создать дубликат статьи"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSelectArticle(art)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
                        title="Просмотр"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => promptDeleteArticle(art)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                      title="Удалить статью"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: MEDIA FILES & MATERIALS MANAGEMENT (CLOUD SQL) */}
      {activeTab === 'files' && (
        <AdminMediaFilesManager
          articles={articles}
          showToast={showToast}
          onRefreshArticles={onRefreshArticles}
        />
      )}

      {/* TAB 3: PLUMBING SPECIALISTS MANAGEMENT */}
      {activeTab === 'specialists' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Каталог Сантехников ({specialists.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Управляйте анкетами мастеров, проверяйте квалификацию и добавляйте новых специалистов
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowWorkloadInSpecialists(!showWorkloadInSpecialists)}
                  className={`px-3.5 py-2 sm:py-2.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer ${
                    showWorkloadInSpecialists
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white'
                  }`}
                  title="График загруженности мастеров и спроса по городам (Recharts)"
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>{showWorkloadInSpecialists ? 'Скрыть график' : 'График загрузки'}</span>
                </button>

                <button
                  onClick={() => {
                    fetchDeletedSpecialistsAudit();
                    setShowDeletedArchiveModal(true);
                  }}
                  className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-md cursor-pointer"
                  title="Просмотр истории удалённых мастеров, их дат регистрации и дат удаления"
                >
                  <HistoryIcon className="w-4 h-4 text-amber-400" />
                  <span>Архив ({deletedSpecialistsAudit.length})</span>
                </button>

                <button
                  onClick={handleOpenNewSpecialistModal}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить мастера</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={specialistSearch}
                onChange={(e) => setSpecialistSearch(e.target.value)}
                placeholder="Поиск мастера по имени, городу, телефону или описанию..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Optional In-Tab Recharts Workload Chart */}
          {showWorkloadInSpecialists && (
            <CitySpecialistsWorkloadChart
              specialists={specialists}
              serviceRequests={serviceRequests}
              onSelectCityFilter={(city) => {
                setSpecialistSearch(city);
                showToast(`Фильтр каталога по городу: ${city}`);
              }}
            />
          )}

          {/* Pending Moderation Section */}
          {pendingSpecialists.length > 0 && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Заявки на модерации ({pendingSpecialists.length})</span>
              </h3>

              <div className="space-y-3">
                {pendingSpecialists.map((spec) => {
                  const docs: SpecialistVerificationDoc[] = Array.isArray(spec.verificationDocs)
                    ? spec.verificationDocs
                    : spec.verificationDocsJson
                    ? (() => {
                        try {
                          return JSON.parse(spec.verificationDocsJson);
                        } catch {
                          return [];
                        }
                      })()
                    : [];

                  return (
                    <div
                      key={spec.id}
                      className="p-5 rounded-3xl bg-slate-950 border border-amber-500/30 space-y-4 shadow-md"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Master Main Photo and Core Info */}
                        <div className="flex items-start space-x-4">
                          <div className="relative group shrink-0">
                            <img
                              src={spec.photo}
                              alt={spec.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md bg-slate-900 cursor-pointer"
                              onClick={() => setInspectingPhoto({ url: spec.photo, name: spec.name })}
                              title="Нажмите, чтобы увеличить главное фото"
                            />
                            <button
                              type="button"
                              onClick={() => setInspectingPhoto({ url: spec.photo, name: spec.name })}
                              className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-amber-300 text-[10px] font-bold transition cursor-pointer"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <span className="block text-center text-[9px] text-slate-400 font-semibold mt-1">
                              Главное фото
                            </span>
                          </div>

                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <h4 className="text-base font-bold text-white">{spec.name}</h4>
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                г. {spec.city}
                              </span>
                              {spec.emergency247 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  24/7 Аварийный
                                </span>
                              )}
                              {spec.dataConsent && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" title="Согласие на обработку персональных данных 152-ФЗ">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>152-ФЗ {spec.consentTimestamp ? `(${new Date(spec.consentTimestamp).toLocaleDateString('ru-RU')})` : ''}</span>
                                </span>
                              )}
                              {spec.legalConsent && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" title="Пользовательское соглашение сервиса (независимый мастер)">
                                  <Scale className="w-3 h-3 text-cyan-400" />
                                  <span>Польз. соглашение {spec.legalConsentTimestamp ? `(${new Date(spec.legalConsentTimestamp).toLocaleDateString('ru-RU')})` : ''}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                              <span>Тел: <strong className="text-white font-mono">{spec.phone}</strong></span>
                              {spec.telegram && (
                                <span className="text-cyan-400">TG: <strong>{spec.telegram}</strong></span>
                              )}
                              {spec.whatsapp && (
                                <span className="text-emerald-400">WA: <strong>{spec.whatsapp}</strong></span>
                              )}
                              <span className="text-slate-400">Стаж: <strong>{spec.experienceYears} лет</strong></span>
                              <span className="text-amber-300">Вызов: <strong>от {spec.minPrice} ₽</strong></span>
                            </div>

                            {spec.bio && (
                              <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-900">
                                <span className="text-slate-500 font-semibold">О себе и гарантиях: </span>
                                "{spec.bio}"
                              </p>
                            )}

                            {/* Services chips */}
                            {Array.isArray(spec.services) && spec.services.length > 0 && (
                              <div className="pt-1">
                                <span className="text-[10px] font-semibold text-slate-400 mr-2">Заявленные услуги:</span>
                                <div className="inline-flex flex-wrap gap-1.5 mt-1">
                                  {spec.services.map((srv, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-cyan-300 font-medium"
                                    >
                                      {srv}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Moderation Actions - Mobile Adaptive */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start pt-2 lg:pt-0">
                          <button
                            type="button"
                            onClick={() => handleModerateSpecialist(spec.id, 'approved', true)}
                            className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition flex items-center space-x-1.5 shadow-md cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Одобрить и верифицировать</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleModerateSpecialist(spec.id, 'rejected')}
                            className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium text-xs hover:bg-rose-500/30 transition flex items-center space-x-1 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>Отклонить</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => promptDeleteSpecialist(spec)}
                            className="p-2 rounded-xl bg-slate-900 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition cursor-pointer"
                            title="Удалить мастера навсегда"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Legal Audit & TimeWeb Cloud Consent Details */}
                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Протокол согласия мастера (152-ФЗ / 63-ФЗ):</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono">
                            База Timeweb Cloud (РФ, СПб)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                          <div>
                            • Персональные данные и проверка документов: <strong className="text-emerald-400">Подтверждено мастером</strong>
                          </div>
                          <div>
                            • Пользовательское соглашение и подлинность: <strong className="text-emerald-400">Принято (ст. 327 УК РФ)</strong>
                          </div>
                          <div>
                            • Хранение в зарубежных базах: <strong className="text-rose-300">Исключено (100% РФ)</strong>
                          </div>
                          <div>
                            • Дата и время фиксации: <span className="text-slate-300 font-mono">{spec.legalConsentTimestamp ? new Date(spec.legalConsentTimestamp).toLocaleString('ru-RU') : (spec.appliedAt || 'Зафиксировано')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Attached Verification Documents (Up to 3 files) */}
                      <div className="pt-3 border-t border-slate-900">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                            <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Прикреплённые документы мастера ({docs.length} из 3):</span>
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {docs.length === 0 ? 'Без документов' : `${docs.length} файл(а)`}
                          </span>
                        </div>

                        {docs.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">
                            Мастер не прикрепил документы подтверждения личности/квалификации к анкете.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {docs.map((doc, dIdx) => (
                              <div
                                key={doc.id || dIdx}
                                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between gap-2.5 group"
                              >
                                <div className="flex items-center space-x-2.5 overflow-hidden">
                                  {doc.dataUrl && (doc.name.match(/\.(jpg|jpeg|png|webp)$/i) || doc.dataUrl.startsWith('data:image')) ? (
                                    <img
                                      src={doc.dataUrl}
                                      alt={doc.name}
                                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-950"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                                      <FileText className="w-5 h-5 text-cyan-400" />
                                    </div>
                                  )}

                                  <div className="truncate">
                                    <span className="text-xs font-medium text-white block truncate group-hover:text-cyan-300 transition">
                                      {doc.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block truncate">
                                      {doc.type} • {doc.size || doc.fileSize || 'Документ'}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setInspectingDoc(doc)}
                                  className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center space-x-1 shrink-0 transition cursor-pointer"
                                  title="Открыть документ на полный экран"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Просмотр</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Published Specialists */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Все сантехники в базе</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpecialists.map((spec) => (
                <div
                  key={spec.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <img src={spec.photo} alt={spec.name} className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="font-bold text-white text-sm truncate">{spec.name}</span>
                        {spec.verified && (
                          <span className="text-emerald-400" title="Проверено ИИ СантехПро">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        г. {spec.city} | от {spec.minPrice} ₽
                      </p>
                      <p className="text-[11px] text-cyan-300 font-medium">
                        📞 {spec.phone}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 italic">
                    "{spec.bio}"
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenEditSpecialistModal(spec)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 font-bold transition flex items-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Редактировать профиль</span>
                    </button>

                    <button
                      onClick={() => promptDeleteSpecialist(spec)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                      title="Удалить мастера навсегда"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMMUNITY QUESTIONS & FORUM MODERATION */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <span>Модерация Вопросов и Форума ({questions.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Отвечайте от имени главного эксперта или удаляйте нерелевантные сообщения
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Поиск по заголовку или тексту вопроса..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{q.authorName}</span>
                    <span className="text-xs text-slate-400">(г. {q.city})</span>
                    <span className="text-[11px] text-slate-500">• {q.createdAt}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenAnswerModal(q)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ответить как Эксперт</span>
                    </button>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                      title="Удалить вопрос"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-amber-400">{q.title}</h3>
                  <p className="text-xs text-slate-200 leading-relaxed">{q.text}</p>
                </div>

                {/* Existing Answers list */}
                {q.masterAnswer && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-1">
                    <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
                      <span className="flex items-center space-x-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Ответ эксперта: {q.masterAnswer.masterName}</span>
                      </span>
                      <span className="text-[10px] text-slate-500">{q.masterAnswer.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 italic">"{q.masterAnswer.text}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CLOUD SQL USERS (ADMIN / DEVELOPER ONLY) */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h2 className="text-base font-bold text-white">База данных пользователей Cloud SQL (PostgreSQL)</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Только для администратора и разработчика
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Все системные параметры учетных записей хранятся в реляционной базе данных и скрыты от обычных пользователей
                  </p>
                </div>
              </div>

              <button
                onClick={loadCloudUsers}
                disabled={loadingUsers}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-2 shrink-0 self-start sm:self-auto border border-slate-700"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Обновить из БД</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Всего аккаунтов в БД</span>
                <span className="text-lg font-black text-cyan-400">{cloudUsers.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Администраторов</span>
                <span className="text-lg font-black text-amber-400">
                  {cloudUsers.filter(u => u.role === 'admin').length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">С заполненными данными</span>
                <span className="text-lg font-black text-emerald-400">
                  {cloudUsers.filter(u => u.name || u.phone).length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Согласие 152-ФЗ в БД</span>
                <span className="text-lg font-black text-purple-400">
                  {cloudUsers.filter(u => u.consentGiven).length}
                </span>
              </div>
            </div>

            {/* Search Filter */}
            <div className="pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="Поиск по Email, имени, телефону или UID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Users Table / List */}
          <div className="space-y-3">
            {loadingUsers ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                <RotateCcw className="w-5 h-5 mx-auto animate-spin mb-2 text-cyan-400" />
                <span>Загрузка данных пользователей из Cloud SQL...</span>
              </div>
            ) : cloudUsers.filter(u => {
              if (!usersSearch.trim()) return true;
              const q = usersSearch.toLowerCase();
              return (
                (u.email && u.email.toLowerCase().includes(q)) ||
                (u.name && u.name.toLowerCase().includes(q)) ||
                (u.phone && u.phone.includes(q)) ||
                (u.uid && u.uid.toLowerCase().includes(q)) ||
                (u.city && u.city.toLowerCase().includes(q))
              );
            }).length === 0 ? (
              <div className="p-10 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                Пользователи по заданному запросу не найдены.
              </div>
            ) : (
              cloudUsers
                .filter(u => {
                  if (!usersSearch.trim()) return true;
                  const q = usersSearch.toLowerCase();
                  return (
                    (u.email && u.email.toLowerCase().includes(q)) ||
                    (u.name && u.name.toLowerCase().includes(q)) ||
                    (u.phone && u.phone.includes(q)) ||
                    (u.uid && u.uid.toLowerCase().includes(q)) ||
                    (u.city && u.city.toLowerCase().includes(q))
                  );
                })
                .map((u) => (
                  <div
                    key={u.uid || u.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs uppercase">
                          {u.name ? u.name.charAt(0) : (u.email ? u.email.charAt(0) : 'U')}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-white">{u.name || 'Имя не указано'}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === 'admin'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {u.role === 'admin' ? 'Администратор' : 'Пользователь'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                            <span className="text-slate-300 font-medium">{u.email}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(u.email);
                                showToast('Email скопирован в буфер!');
                              }}
                              className="text-slate-500 hover:text-cyan-400 p-0.5"
                              title="Скопировать Email"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-right">
                        <span className="text-[11px] text-slate-500">
                          Регистрация: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ru-RU') : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Technical Cloud SQL Details (Only for admin/dev) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Идентификатор UID</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono text-[11px] text-cyan-400 truncate max-w-[170px]" title={u.uid}>
                            {u.uid}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(u.uid);
                              showToast('UID скопирован!');
                            }}
                            className="text-slate-500 hover:text-cyan-400 p-0.5"
                            title="Скопировать UID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Контакты & Город</span>
                        <div className="mt-1 text-slate-300 font-medium">
                          {u.phone || 'Телефон не указан'} {u.city ? `• ${u.city}` : ''}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Согласие 152-ФЗ</span>
                        <div className="mt-1 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-emerald-400 font-semibold text-[11px]">
                            {u.consentTimestamp
                              ? new Date(u.consentTimestamp).toLocaleString('ru-RU')
                              : 'Зафиксировано'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB: MODERATION OF MASTER WORKS AND ARTICLES */}
      {activeTab === 'moderation' && (
        <AdminModerationManager
          specialists={specialists}
          onRefreshArticles={onRefreshArticles}
          onRefreshSpecialists={onRefreshSpecialists}
          onSelectArticle={onSelectArticle}
        />
      )}

      {/* TAB: SMTP EMAIL SETTINGS & TEST TOOL */}
      {activeTab === 'smtp' && <SmtpSettingsTab />}

      {/* TAB: YANDEX ID OAUTH 2.0 SETTINGS */}
      {activeTab === 'yandex' && <YandexOAuthSettingsTab />}

      {/* TAB: TIMEWEB CLOUD AUTOMATIC SYNCHRONIZATION & SERVER ENVIRONMENT */}
      {activeTab === 'timeweb' && (
        <TimeWebCloudTab
          articlesCount={articles.length}
          specialistsCount={specialists.length}
          serviceRequestsCount={serviceRequests.length}
          usersCount={cloudUsers.length}
          showToast={showToast}
          onRefreshAll={() => {
            onRefreshArticles();
            onRefreshSpecialists();
            if (onRefreshServiceRequests) onRefreshServiceRequests();
            if (onRefreshQuestions) onRefreshQuestions();
            loadCloudUsers();
          }}
        />
      )}

      {/* MODAL 1: ADD / EDIT SERVICE REQUEST */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <PhoneCall className="w-5 h-5 text-amber-400" />
                <span>{editingRequest ? 'Редактировать заявку' : 'Принять новую заявку вызова'}</span>
              </h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveServiceRequest} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Имя клиента *</label>
                  <input
                    type="text"
                    required
                    value={reqClientName}
                    onChange={(e) => setReqClientName(e.target.value)}
                    placeholder="Иван Петров"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Телефон клиента *</label>
                  <input
                    type="text"
                    required
                    value={reqClientPhone}
                    onChange={(e) => setReqClientPhone(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Город *</label>
                  <input
                    type="text"
                    required
                    value={reqCity}
                    onChange={(e) => setReqCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Улица / Адрес</label>
                  <input
                    type="text"
                    value={reqAddress}
                    onChange={(e) => setReqAddress(e.target.value)}
                    placeholder="ул. Ленина, д. 10, кв. 45"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Описание поломки / Задачи *</label>
                <textarea
                  rows={2}
                  required
                  value={reqProblemDesc}
                  onChange={(e) => setReqProblemDesc(e.target.value)}
                  placeholder="Течёт смеситель в ванной, сорвана резьба..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Желаемый мастер</label>
                  <input
                    type="text"
                    value={reqPreferredMasterName}
                    onChange={(e) => setReqPreferredMasterName(e.target.value)}
                    placeholder="Любой мастер"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Статус заявки</label>
                  <select
                    value={reqStatus}
                    onChange={(e: any) => setReqStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="pending">⏳ Ожидает</option>
                    <option value="approved">✅ Одобрена / В работе</option>
                    <option value="completed">✔️ Исполнена</option>
                    <option value="rejected">❌ Отклонена</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-400 uppercase">Заметка диспетчера</label>
                <input
                  type="text"
                  value={reqAdminNotes}
                  onChange={(e) => setReqAdminNotes(e.target.value)}
                  placeholder="Особые пожелания или детали для мастера..."
                  className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="reqEmergency"
                  checked={reqEmergency}
                  onChange={(e) => setReqEmergency(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-rose-500 focus:ring-rose-500"
                />
                <label htmlFor="reqEmergency" className="text-xs font-bold text-rose-400">
                  ⚡ Аварийный срочный выезд (протечка/затопление)
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT SPECIALIST PROFILE */}
      {isSpecialistModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>{editingSpecialist ? 'Редактировать анкету мастера' : 'Внести нового сантехника в каталог'}</span>
              </h3>
              <button
                onClick={() => setIsSpecialistModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSpecialist} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">ФИО Мастера *</label>
                  <input
                    type="text"
                    required
                    value={specName}
                    onChange={(e) => setSpecName(e.target.value)}
                    placeholder="Алексей Смирнов"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Город *</label>
                  <input
                    type="text"
                    required
                    value={specCity}
                    onChange={(e) => setSpecCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Телефон *</label>
                  <input
                    type="text"
                    required
                    value={specPhone}
                    onChange={(e) => setSpecPhone(e.target.value)}
                    placeholder="+7 (999) 111-22-33"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Минимальный выезд (₽)</label>
                  <input
                    type="text"
                    value={specMinPrice}
                    onChange={(e) => setSpecMinPrice(e.target.value)}
                    placeholder="1500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Стаж работы (лет)</label>
                  <input
                    type="text"
                    value={specExpYears}
                    onChange={(e) => setSpecExpYears(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Статус публикации</label>
                  <select
                    value={specStatus}
                    onChange={(e: any) => setSpecStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="approved">✅ Опубликован в каталоге</option>
                    <option value="pending">⏳ На модерации</option>
                    <option value="rejected">❌ Заблокирован</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Оказываемые услуги (через запятую)</label>
                <input
                  type="text"
                  value={specServices}
                  onChange={(e) => setSpecServices(e.target.value)}
                  placeholder="Монтаж водопровода, Ремонт смесителей..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">О себе / Опыт / Оборудование</label>
                <textarea
                  rows={2}
                  value={specBio}
                  onChange={(e) => setSpecBio(e.target.value)}
                  placeholder="Описываем профессиональные навыки мастера..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                  <input
                    type="checkbox"
                    checked={specVerified}
                    onChange={(e) => setSpecVerified(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-emerald-500"
                  />
                  <span> Verified / Проверен ИИ</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                  <input
                    type="checkbox"
                    checked={specEmergency247}
                    onChange={(e) => setSpecEmergency247(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-amber-500"
                  />
                  <span> Круглосуточный аварийный выезд 24/7</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-between">
                {editingSpecialist ? (
                  <button
                    type="button"
                    onClick={() => {
                      const spec = editingSpecialist;
                      setIsSpecialistModalOpen(false);
                      promptDeleteSpecialist(spec);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Удалить мастера навсегда</span>
                  </button>
                ) : <div />}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsSpecialistModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-700 transition"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition cursor-pointer"
                  >
                    Сохранить мастера
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ANSWER COMMUNITY QUESTION */}
      {isAnswerModalOpen && selectedQuestionForAnswer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span>Официальный ответ от Инженерной Службы</span>
              </h3>
              <button
                onClick={() => setIsAnswerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Вопрос клиента:</span>
              <p className="text-xs text-white font-bold">{selectedQuestionForAnswer.title}</p>
              <p className="text-[11px] text-slate-300">"{selectedQuestionForAnswer.text}"</p>
            </div>

            <form onSubmit={handleSaveAnswer} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Имя эксперта / Организации</label>
                <input
                  type="text"
                  required
                  value={answerAuthorName}
                  onChange={(e) => setAnswerAuthorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Текст рекомендации / ответа эксперта</label>
                <textarea
                  rows={4}
                  required
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Дайте технически точную и понятную рекомендацию с учетом стандартов..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAnswerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs hover:bg-purple-400 transition"
                >
                  Опубликовать ответ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL DIALOG (PREVENTS ACCIDENTAL DELETIONS) */}
      {deleteConfirmTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => !isExecutingDelete && setDeleteConfirmTarget(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Red Warning Badge */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/10">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {deleteConfirmTarget.type === 'article'
                      ? 'Удаление статьи'
                      : deleteConfirmTarget.type === 'request'
                      ? 'Удаление заявки'
                      : 'Подтверждение удаления мастера'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {deleteConfirmTarget.type === 'specialist'
                      ? 'Мастер будет удален навсегда, в БД останется только аудит-запись'
                      : 'Подтверждение перед удалением из базы данных'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isExecutingDelete && setDeleteConfirmTarget(null)}
                disabled={isExecutingDelete}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer disabled:opacity-50"
                title="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Item Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-2.5">
              <div className="flex items-start space-x-2.5">
                {deleteConfirmTarget.type === 'article' ? (
                  <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                ) : deleteConfirmTarget.type === 'request' ? (
                  <PhoneCall className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Wrench className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className="text-sm font-bold text-white leading-snug line-clamp-2">
                  {deleteConfirmTarget.title}
                </span>
              </div>

              {deleteConfirmTarget.subtitle && (
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed pl-6 border-l-2 border-slate-800">
                  {deleteConfirmTarget.subtitle}
                </p>
              )}

              {deleteConfirmTarget.meta && deleteConfirmTarget.meta.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2.5 mt-2 border-t border-slate-800/80 text-[11px]">
                  {deleteConfirmTarget.meta.map((m, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">
                        {m.label}:
                      </span>
                      <span className="text-slate-300 font-medium truncate block">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warning Message */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start space-x-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              {deleteConfirmTarget.type === 'specialist' ? (
                <div className="space-y-1">
                  <p className="font-bold text-rose-200">
                    Мастер удаляется навсегда!
                  </p>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Мастер будет безвозвратно удален из активного каталога, поиска и мобильного приложения. В базе данных останется <strong>только информация о мастере: когда он зарегистрировался и когда был удален</strong>.
                  </p>
                </div>
              ) : (
                <span>
                  Это действие необратимо. Объект будет безвозвратно удалён из базы данных и перестанет отображаться пользователям и диспетчерам.
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={isExecutingDelete}
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isExecutingDelete}
                onClick={handleConfirmDeleteAction}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow-lg shadow-rose-600/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {isExecutingDelete
                    ? 'Удаление...'
                    : deleteConfirmTarget.type === 'specialist'
                    ? 'Да, удалить мастера навсегда'
                    : 'Да, удалить безвозвратно'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT ARCHIVE MODAL: DELETED SPECIALISTS */}
      {showDeletedArchiveModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowDeletedArchiveModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 relative max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <HistoryIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Журнал удалённых мастеров (Аудит БД)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-amber-300 border border-slate-700">
                      {deletedSpecialistsAudit.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Информация о мастерах, сохранившаяся в базе данных после удаления
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeletedArchiveModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanatory Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1 shrink-0">
              <p className="font-bold text-amber-400 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Регламент постоянного удаления:</span>
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                После подтверждения удаления мастер навсегда удаляется из активного каталога, справочника и поиска. В базе данных сохраняется только информация о мастере (ФИО, город), когда он зарегистрировался и когда был удален.
              </p>
            </div>

            {/* List / Table of Deleted Specialists */}
            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 min-h-[200px]">
              {deletedSpecialistsAudit.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Archive className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                  <p className="text-xs font-medium">В журнале пока нет удалённых мастеров.</p>
                  <p className="text-[11px] text-slate-600">Когда вы удалите мастера с подтверждением, запись аудита появится здесь.</p>
                </div>
              ) : (
                deletedSpecialistsAudit.map((rec) => (
                  <div 
                    key={rec.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{rec.name}</span>
                        {rec.city && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-400">
                            г. {rec.city}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Удален навсегда
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center space-x-1">
                          <span className="text-slate-500 font-medium">Зарегистрировался:</span>
                          <strong className="text-slate-300">
                            {rec.appliedAt || (rec.registeredAt ? new Date(rec.registeredAt).toLocaleDateString('ru-RU') : 'Не указано')}
                          </strong>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span className="text-slate-500 font-medium">Удален:</span>
                          <strong className="text-rose-300">
                            {rec.deletedAt ? new Date(rec.deletedAt).toLocaleString('ru-RU') : 'Недавно'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 shrink-0 sm:text-right border-t sm:border-t-0 border-slate-900 pt-1 sm:pt-0">
                      <span>Кем: {rec.deletedBy || 'Администратор'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={fetchDeletedSpecialistsAudit}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Обновить</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDeletedArchiveModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specialist Document Inspection Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-md">{inspectingDoc.name}</h3>
                  <p className="text-[11px] text-slate-400">
                    {inspectingDoc.type} • {inspectingDoc.size || inspectingDoc.fileSize || 'Документ'} • Загружен: {inspectingDoc.uploadedAt}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/60">
              {inspectingDoc.dataUrl && (inspectingDoc.name.match(/\.(jpg|jpeg|png|webp)$/i) || inspectingDoc.dataUrl.startsWith('data:image')) ? (
                <img
                  src={inspectingDoc.dataUrl}
                  alt={inspectingDoc.name}
                  className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-lg border border-slate-800"
                />
              ) : inspectingDoc.dataUrl && inspectingDoc.dataUrl.startsWith('data:application/pdf') ? (
                <iframe
                  src={inspectingDoc.dataUrl}
                  title={inspectingDoc.name}
                  className="w-full h-[65vh] rounded-xl border border-slate-800"
                />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-16 h-16 mx-auto text-cyan-400 opacity-60" />
                  <p className="text-sm font-semibold text-white">{inspectingDoc.name}</p>
                  <p className="text-xs text-slate-400">Тип документа: {inspectingDoc.type}</p>
                  {inspectingDoc.dataUrl && (
                    <a
                      href={inspectingDoc.dataUrl}
                      download={inspectingDoc.name}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Скачать документ</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
              {inspectingDoc.dataUrl ? (
                <a
                  href={inspectingDoc.dataUrl}
                  download={inspectingDoc.name}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Скачать оригинал</span>
                </a>
              ) : <div />}

              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specialist Photo Inspection Modal */}
      {inspectingPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Главная фотография мастера</h3>
                <p className="text-xs text-slate-400">{inspectingPhoto.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingPhoto(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center bg-slate-950/80">
              <img
                src={inspectingPhoto.url}
                alt={inspectingPhoto.name}
                className="max-h-[65vh] w-auto max-w-full rounded-2xl object-contain border border-slate-800 shadow-xl"
              />
            </div>

            <div className="p-3 border-t border-slate-800 flex justify-end bg-slate-900">
              <button
                type="button"
                onClick={() => setInspectingPhoto(null)}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
