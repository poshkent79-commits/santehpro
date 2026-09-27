import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Layers,
  Edit,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  Wrench,
  Clock,
  BookOpen,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Volume2,
  Video,
  Image as ImageIcon,
  MapPin,
  Award,
  Users,
  Eye,
  ThumbsUp,
  GraduationCap,
  Upload
} from 'lucide-react';
import { Article, CategoryId, ArticleStep } from '../types';
import { CATEGORIES } from '../data/initialData';

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit?: Article | null;
  onRefreshArticles: () => void;
}

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  isOpen,
  onClose,
  articleToEdit,
  onRefreshArticles,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('water');
  const [type, setType] = useState<'article' | 'video'>('article');
  const [adminSection, setAdminSection] = useState<'handbook' | 'courses' | 'cases'>('courses');
  const [accessType, setAccessType] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('1 990 ₽');
  const [buyUrl, setBuyUrl] = useState('');
  const [difficulty, setDifficulty] = useState<'Новичок' | 'Продвинутый' | 'Профи'>('Новичок');
  const [timeEst, setTimeEst] = useState('45 мин');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
  );
  const [videoUrl, setVideoUrl] = useState('');
  const [rutubeUrl, setRutubeUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [authorAddress, setAuthorAddress] = useState('г. Москва, ул. Вавилова 14, Мастерская СантехПро');
  const [authorName, setAuthorName] = useState('Достонджон Туйчиев');
  const [galleryImagesStr, setGalleryImagesStr] = useState('');
  const [studentsCount, setStudentsCount] = useState<number>(142);
  const [rating, setRating] = useState<number>(4.9);
  const [certificate, setCertificate] = useState<boolean>(true);
  const [viewsCount, setViewsCount] = useState<number>(350);
  const [likesCount, setLikesCount] = useState<number>(48);

  const [toolsRequired, setToolsRequired] = useState('Разводной ключ, ФУМ-лента');
  const [materialsRequired, setMaterialsRequired] = useState('Прокладки, Сантехнический паста');

  const [steps, setSteps] = useState<
    Array<{ title: string; text: string; warning?: string; tip?: string; imageUrl?: string; audioUrl?: string; videoUrl?: string }>
  >([
    {
      title: 'Урок 1: Подготовка инструментов и материалов',
      text: 'Перекройте подачу воды на вводных вентилях стояка и сбросьте давление в системе.',
      warning: 'Перед началом работ убедитесь, что запорный вентиль полностью перекрыт!',
      tip: 'Подложите тряпку и емкость для сбора остатков воды из труб.'
    },
    {
      title: 'Урок 2: Практический монтаж и демонстрация',
      text: 'Выполните разборку старого элемента и аккуратно установите новую деталь с уплотнительным материалом.'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Populate form when editing or clear when creating new
  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title);
      setCategory(articleToEdit.category);
      setType(articleToEdit.type);
      setAdminSection(articleToEdit.adminSection || (articleToEdit.type === 'video' ? 'courses' : 'handbook'));
      setAccessType(articleToEdit.accessType || 'free');
      setPrice(articleToEdit.price || '1 990 ₽');
      setBuyUrl(articleToEdit.buyUrl || '');
      setDifficulty(articleToEdit.difficulty);
      setTimeEst(articleToEdit.timeEst);
      setDescription(articleToEdit.description);
      setCoverImage(articleToEdit.coverImage || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80');
      setVideoUrl(articleToEdit.videoUrl || '');
      setRutubeUrl(articleToEdit.rutubeUrl || (articleToEdit.videoUrl?.includes('rutube') ? articleToEdit.videoUrl : ''));
      setYoutubeUrl(articleToEdit.youtubeUrl || (articleToEdit.videoUrl?.includes('youtu') ? articleToEdit.videoUrl : ''));
      setAudioUrl(articleToEdit.audioUrl || '');
      setAudioTitle(articleToEdit.audioTitle || '');
      setAuthorAddress(articleToEdit.authorAddress || 'г. Москва, ул. Вавилова 14, Мастерская СантехПро');
      setAuthorName(articleToEdit.author || 'Достонджон Туйчиев');
      setGalleryImagesStr(articleToEdit.galleryImages ? articleToEdit.galleryImages.join('\n') : '');
      setStudentsCount(articleToEdit.studentsCount || 120);
      setRating(articleToEdit.rating || 4.9);
      setCertificate(articleToEdit.certificate ?? true);
      setViewsCount(articleToEdit.views || 150);
      setLikesCount(articleToEdit.likes || 30);
      setToolsRequired(articleToEdit.toolsRequired?.join(', ') || '');
      setMaterialsRequired(articleToEdit.materialsRequired?.join(', ') || '');

      if (articleToEdit.steps && articleToEdit.steps.length > 0) {
        setSteps(
          articleToEdit.steps.map((s) => ({
            title: s.title,
            text: s.text,
            warning: s.warning || '',
            tip: s.tip || '',
            imageUrl: s.imageUrl || '',
            audioUrl: s.audioUrl || '',
            videoUrl: s.videoUrl || '',
          }))
        );
      } else {
        setSteps([{ title: 'Урок 1', text: articleToEdit.description }]);
      }
    } else {
      // Reset defaults
      setTitle('');
      setCategory('water');
      setType('video');
      setAdminSection('courses');
      setAccessType('free');
      setPrice('1 990 ₽');
      setBuyUrl('');
      setDifficulty('Новичок');
      setTimeEst('45 мин');
      setDescription('');
      setCoverImage('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80');
      setVideoUrl('');
      setRutubeUrl('');
      setYoutubeUrl('');
      setAudioUrl('');
      setAudioTitle('');
      setAuthorAddress('г. Москва, ул. Вавилова 14, Мастерская СантехПро');
      setAuthorName('Главный инженер-сантехник');
      setGalleryImagesStr('');
      setStudentsCount(85);
      setRating(5.0);
      setCertificate(true);
      setViewsCount(120);
      setLikesCount(25);
      setToolsRequired('Разводной ключ, ФУМ-лента, Набор отверток');
      setMaterialsRequired('Прокладки паронитовые, Сантехническая паста Unipak');
      setSteps([
        {
          title: 'Урок 1: Вводная подготовка и техника безопасности',
          text: 'Перекройте подачу воды на вводных вентилях стояка и сбросьте остаточное давление.',
          warning: 'Перед началом работ обязательно убедитесь, что вода не поступает!',
          tip: 'Подготовьте емкость и ветошь для остатков воды.'
        },
        {
          title: 'Урок 2: Практический порядок монтажа и разводка',
          text: 'Выполните последовательный монтаж с уплотнением всех резьбовых соединений.'
        }
      ]);
    }
  }, [articleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageFileUpload = (
    file: File,
    onSuccess: (dataUrl: string) => void
  ) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения (PNG, JPG, WEBP, GIF)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой. Выберите изображение размером до 10 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onSuccess(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        title: `Урок ${steps.length + 1}: Название этапа / модуля`,
        text: '',
        warning: '',
        tip: '',
        imageUrl: '',
        audioUrl: '',
        videoUrl: ''
      }
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      alert('Курс или инструкция должен содержать хотя бы один урок/шаг!');
      return;
    }
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= steps.length) return;
    const copy = [...steps];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    setSteps(copy);
  };

  const parseEmbedUrl = (url: string) => {
    if (!url) return undefined;
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    } else if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    } else if (url.includes('rutube.ru/video/')) {
      const id = url.split('rutube.ru/video/')[1]?.split('/')[0];
      if (id) return `https://rutube.ru/play/embed/${id}`;
    } else if (url.includes('vk.com/video')) {
      return url;
    }
    return url;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Пожалуйста, укажите название материала или видеокурса!');
      return;
    }

    setLoading(true);

    try {
      const toolsArr = toolsRequired.split(',').map((t) => t.trim()).filter(Boolean);
      const materialsArr = materialsRequired.split(',').map((m) => m.trim()).filter(Boolean);
      const galleryArr = galleryImagesStr
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const formattedSteps: ArticleStep[] = steps.map((s, idx) => ({
        number: idx + 1,
        title: s.title || `Урок ${idx + 1}`,
        text: s.text || 'Описание действий',
        warning: s.warning?.trim() || undefined,
        tip: s.tip?.trim() || undefined,
        imageUrl: s.imageUrl?.trim() || undefined,
        audioUrl: s.audioUrl?.trim() || undefined,
        videoUrl: s.videoUrl?.trim() || undefined,
      }));

      const embedUrl = parseEmbedUrl(videoUrl);

      const payload = {
        title,
        category,
        type,
        adminSection,
        accessType,
        price: accessType === 'paid' ? price || '1 990 ₽' : undefined,
        buyUrl: accessType === 'paid' ? buyUrl || undefined : undefined,
        difficulty,
        timeEst,
        description,
        coverImage,
        videoUrl: rutubeUrl.trim() || youtubeUrl.trim() || videoUrl.trim() || undefined,
        rutubeUrl: rutubeUrl.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        videoEmbed: embedUrl || (rutubeUrl ? parseEmbedUrl(rutubeUrl) : undefined) || (youtubeUrl ? parseEmbedUrl(youtubeUrl) : undefined),
        audioUrl: audioUrl || undefined,
        audioTitle: audioTitle || undefined,
        authorAddress: authorAddress || undefined,
        galleryImages: galleryArr.length > 0 ? galleryArr : undefined,
        studentsCount,
        rating,
        certificate,
        views: viewsCount,
        likes: likesCount,
        toolsRequired: toolsArr,
        materialsRequired: materialsArr,
        steps: formattedSteps,
        author: authorName || 'Достонджон Туйчиев',
      };

      let res;
      if (articleToEdit) {
        res = await fetch(`/api/articles/${articleToEdit.id}`, {
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
        onRefreshArticles();
        onClose();
      } else {
        alert('Ошибка при сохранении материала');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!articleToEdit) return;
    if (!confirm(`Вы действительно хотите удалить материал "${articleToEdit.title}"?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/articles/${articleToEdit.id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshArticles();
        onClose();
      } else {
        alert('Не удалось удалить материал');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка удаления статьи');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full h-[94vh] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-rose-500 flex items-center justify-center text-slate-950 shrink-0 shadow-lg font-black">
              {articleToEdit ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                <span>{articleToEdit ? 'Редактирование обучающего материала' : 'Публикация нового курса / инструкции'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Добавляйте видео, аудио-подкасты, фото, адрес автора, сертификат и стоимость
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Название курса / инструкции *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Курс: Профессиональная разводка полипропилена в новостройке"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Категория сантехники
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.description})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section & Format Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1">
                Целевой раздел *
              </label>
              <select
                value={adminSection}
                onChange={(e) => setAdminSection(e.target.value as any)}
                className="w-full bg-slate-900 border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none cursor-pointer"
              >
                <option value="courses">🎓 1. Курсы по сантехнике (Видео/Аудио)</option>
                <option value="handbook">📚 2. Справочник (Текстовые гайды)</option>
                <option value="cases">🛠️ 3. Аварии и Практические кейсы</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Основной формат
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'article' | 'video')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="video">🎬 Обучающий Видеокурс (с видео/аудио)</option>
                <option value="article">📖 Иллюстрированное Руководство / Статья</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-400 mb-1">Сложность</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                <option value="Новичок">Новичок</option>
                <option value="Продвинутый">Продвинутый</option>
                <option value="Профи">Профи</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Длительность
              </label>
              <input
                type="text"
                value={timeEst}
                onChange={(e) => setTimeEst(e.target.value)}
                placeholder="45 мин / 2.5 часа"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing & Access Level */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-extrabold text-amber-400 flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>Тип доступа и Метрики курса</span>
              </label>

              <div className="flex items-center space-x-3">
                <label className="inline-flex items-center space-x-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="radio"
                    name="accessType"
                    checked={accessType === 'free'}
                    onChange={() => setAccessType('free')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span>🟢 Бесплатный курс</span>
                </label>

                <label className="inline-flex items-center space-x-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="radio"
                    name="accessType"
                    checked={accessType === 'paid'}
                    onChange={() => setAccessType('paid')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span>💎 Платный Премиум курс</span>
                </label>
              </div>
            </div>

            {accessType === 'paid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                    Стоимость курса (в рублях)
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1 990 ₽"
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                    Ссылка на оплату / магазин (опционально)
                  </label>
                  <input
                    type="url"
                    value={buyUrl}
                    onChange={(e) => setBuyUrl(e.target.value)}
                    placeholder="https://t.me/... или https://kassa.ru/..."
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Metrics Controls for Admin */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-amber-500/20">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5 flex items-center space-x-1">
                  <Users className="w-3 h-3 text-cyan-400" />
                  <span>Учеников / Прошедших</span>
                </label>
                <input
                  type="number"
                  value={studentsCount}
                  onChange={(e) => setStudentsCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5 flex items-center space-x-1">
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>Просмотров</span>
                </label>
                <input
                  type="number"
                  value={viewsCount}
                  onChange={(e) => setViewsCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5 flex items-center space-x-1">
                  <ThumbsUp className="w-3 h-3 text-rose-400" />
                  <span>Лайков / Отзывов</span>
                </label>
                <input
                  type="number"
                  value={likesCount}
                  onChange={(e) => setLikesCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-amber-400 mb-0.5 flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>Выдается сертификат?</span>
                </label>
                <label className="inline-flex items-center space-x-2 mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={certificate}
                    onChange={(e) => setCertificate(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 w-4 h-4"
                  />
                  <span className="text-xs text-white">{certificate ? 'Да (Сертификат)' : 'Нет'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Аннотация / Краткое описание курса
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробное описание обучающего курса, чеклист приобретаемых навыков..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Author Name & Studio/Workplace Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>ФИО / Автор видеозаписи</span>
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Иван Петров, мастер-сантехник 6 разряда"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Адрес съёмки / Мастерской автора *</span>
              </label>
              <input
                type="text"
                value={authorAddress}
                onChange={(e) => setAuthorAddress(e.target.value)}
                placeholder="г. Москва, ул. Вавилова 14, Мастерская СантехПро"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Video & Audio URL Inputs */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-rose-400" />
                <span>Мультимедиа материалы курса (RuTube 🇷🇺 + YouTube 🌐 + Аудио)</span>
              </span>
              <span className="text-[11px] text-slate-400 lowercase font-normal">
                доступно на обеих платформах
              </span>
            </h3>

            {/* RuTube & YouTube Dual Platform Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-red-400">
                    <Video className="w-3.5 h-3.5" />
                    <span>RuTube Видео (РФ без VPN)</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-red-950/80 text-[10px] text-red-300 font-medium border border-red-500/30">
                    Приоритет в РФ
                  </span>
                </label>
                <input
                  type="url"
                  value={rutubeUrl}
                  onChange={(e) => setRutubeUrl(e.target.value)}
                  placeholder="https://rutube.ru/video/abcdef123456/ или ID"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none placeholder-slate-600"
                />
                <p className="text-[10px] text-slate-400">
                  Вставьте прямую ссылку на видеоролик или ID из RuTube
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-rose-400">
                    <Video className="w-3.5 h-3.5" />
                    <span>YouTube Видео (Global HD)</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-[10px] text-rose-300 font-medium border border-rose-500/30">
                    Международный
                  </span>
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... или youtu.be/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none placeholder-slate-600"
                />
                <p className="text-[10px] text-slate-400">
                  Вставьте ссылку на YouTube (полную или короткую youtu.be)
                </p>
              </div>
            </div>

            {/* Direct Video & Audio Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                  <Video className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Прямой видеопоток / Резерв (.mp4, CDN URL)</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4 или /uploads/video.mp4"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ссылка на Аудио-подкаст / лекцию (.mp3, web URL)</span>
                </label>
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio/lesson-1.mp3 или /uploads/audio.mp3"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {audioUrl && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-xs text-emerald-300">
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                  <span>Предпросмотр аудиозаписи</span>
                </div>
                <audio controls src={audioUrl} className="h-8 w-full sm:w-auto max-w-xs" />
              </div>
            )}
          </div>

          {/* Cover Image & Photo Gallery with Direct File Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Обложка (единый формат 16:9)</span>
                </label>

                <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 text-[11px] font-bold flex items-center space-x-1 transition shadow-sm">
                  <Upload className="w-3 h-3" />
                  <span>Загрузить фото</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageFileUpload(file, (dataUrl) => setCoverImage(dataUrl));
                      }
                    }}
                  />
                </label>
              </div>

              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://... или загрузите фото с диска"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none mb-2"
              />

              {coverImage && (
                <div className="flex items-center space-x-3 p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                  <img
                    src={coverImage}
                    alt="Превью обложки"
                    className="w-24 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                  <div className="text-[11px] text-slate-400">
                    <span className="text-cyan-400 font-bold block">Единый размер обложки</span>
                    <span>Компактное отображение в карточке инструкции</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Фотогалерея (небольшие фото)</span>
                </label>

                <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-[11px] font-bold flex items-center space-x-1 transition shadow-sm">
                  <Upload className="w-3 h-3" />
                  <span>Загрузить фото</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      Array.from(e.target.files).forEach((file: File) => {
                        handleImageFileUpload(file, (dataUrl) => {
                          setGalleryImagesStr((prev) => (prev ? `${prev}\n${dataUrl}` : dataUrl));
                        });
                      });
                    }}
                  />
                </label>
              </div>

              <textarea
                rows={2}
                value={galleryImagesStr}
                onChange={(e) => setGalleryImagesStr(e.target.value)}
                placeholder="Загрузите изображения или вставьте ссылки по одной на строку..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Tools & Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>Необходимые инструменты (через запятую)</span>
              </label>
              <input
                type="text"
                value={toolsRequired}
                onChange={(e) => setToolsRequired(e.target.value)}
                placeholder="Разводной ключ, Паяльник для труб, Ножницы"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                <span>Материалы и компоненты (через запятую)</span>
              </label>
              <input
                type="text"
                value={materialsRequired}
                onChange={(e) => setMaterialsRequired(e.target.value)}
                placeholder="Трубы ППР 20мм, Фитинги, Американки"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Step-by-Step Lessons Builder */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Уроки и Модули курса ({steps.length} уроков)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Добавляйте практические модули, голосовые заметки и видео для каждого урока
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStep}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-bold transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить урок</span>
              </button>
            </div>

            {steps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                      Урок #{idx + 1}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStep(idx, 'up')}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                        title="Поднять вверх"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === steps.length - 1}
                        onClick={() => handleMoveStep(idx, 'down')}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                        title="Опустить вниз"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="text-slate-500 hover:text-rose-400 text-xs transition flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Удалить урок</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Заголовок урока / темы</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const updated = [...steps];
                      updated[idx].title = e.target.value;
                      setSteps(updated);
                    }}
                    placeholder={`Урок ${idx + 1}: Название темы`}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Подробные инструкции / текст урока</label>
                  <textarea
                    rows={2}
                    value={step.text}
                    onChange={(e) => {
                      const updated = [...steps];
                      updated[idx].text = e.target.value;
                      setSteps(updated);
                    }}
                    placeholder="Подробное руководство для этого модуля..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Media Links for Step */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] text-emerald-400 mb-1 flex items-center space-x-1">
                      <Volume2 className="w-3 h-3" />
                      <span>Аудиофайл урока (URL)</span>
                    </label>
                    <input
                      type="url"
                      value={step.audioUrl || ''}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].audioUrl = e.target.value;
                        setSteps(updated);
                      }}
                      placeholder="https://.../lesson-audio.mp3"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-cyan-400 font-semibold flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Иллюстрация урока (небольшое фото)</span>
                      </label>

                      <label className="cursor-pointer text-[10px] font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-500/20 hover:bg-cyan-500/30 px-2 py-0.5 rounded-md border border-cyan-500/30 flex items-center space-x-1 transition">
                        <Upload className="w-2.5 h-2.5" />
                        <span>Загрузить фото</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageFileUpload(file, (dataUrl) => {
                                const updated = [...steps];
                                updated[idx].imageUrl = dataUrl;
                                setSteps(updated);
                              });
                            }
                          }}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={step.imageUrl || ''}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].imageUrl = e.target.value;
                        setSteps(updated);
                      }}
                      placeholder="https://... или загрузите фото"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none mb-1.5"
                    />

                    {step.imageUrl && (
                      <div className="flex items-center space-x-2.5 p-1.5 bg-slate-900/90 rounded-lg border border-slate-800">
                        <img
                          src={step.imageUrl}
                          alt={`Шаг ${idx + 1}`}
                          className="w-16 h-12 object-cover rounded-md border border-slate-700 shrink-0"
                        />
                        <span className="text-[10px] text-slate-400">
                          Единый компактный формат для пошаговых инструкций
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-amber-400 mb-1">⚠️ Предостережение (опционально)</label>
                    <input
                      type="text"
                      value={step.warning || ''}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].warning = e.target.value;
                        setSteps(updated);
                      }}
                      placeholder="Осторожно! Не повредите резьбу."
                      className="w-full bg-slate-900 border border-amber-500/20 rounded-xl px-3 py-1.5 text-xs text-amber-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-cyan-400 mb-1">💡 Полезный совет (опционально)</label>
                    <input
                      type="text"
                      value={step.tip || ''}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].tip = e.target.value;
                        setSteps(updated);
                      }}
                      placeholder="Совет эксперта по монтажу."
                      className="w-full bg-slate-900 border border-cyan-500/20 rounded-xl px-3 py-1.5 text-xs text-cyan-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons: Save, Cancel, Delete */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center space-x-3 flex-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-rose-500/20 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4 text-slate-950" />
                <span>
                  {loading
                    ? 'Сохранение...'
                    : articleToEdit
                    ? 'Сохранить изменения'
                    : 'Опубликовать материал / курс'}
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
              >
                Отменить
              </button>
            </div>

            {articleToEdit && (
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 font-bold text-xs transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить материал</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
