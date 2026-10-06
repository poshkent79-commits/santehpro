import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Sparkles,
  Share2,
  Wrench,
  Home,
  Hash,
  ExternalLink,
  Video,
  FileText,
  Smartphone,
  RefreshCw,
  Send,
  MessageCircle,
} from 'lucide-react';
import { Article, MediaFile } from '../../types';

interface SocialPostGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideo?: MediaFile | null;
  initialArticle?: Article | null;
  articles?: Article[];
  mediaFiles?: MediaFile[];
}

type SocialPlatform = 'vk' | 'telegram' | 'youtube' | 'reels';
type PostLength = 'detailed' | 'compact' | 'story';

export const SocialPostGeneratorModal: React.FC<SocialPostGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialVideo,
  initialArticle,
  articles = [],
  mediaFiles = [],
}) => {
  const [platform, setPlatform] = useState<SocialPlatform>('vk');
  const [postLength, setPostLength] = useState<PostLength>('detailed');

  // Input states
  const [topic, setTopic] = useState<string>('');
  const [keyTakeaway, setKeyTakeaway] = useState<string>('');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [customCity, setCustomCity] = useState<string>('в вашем городе');

  // Generated text state (editable)
  const [generatedText, setGeneratedText] = useState<string>('');
  const [copiedType, setCopiedType] = useState<'all' | 'masters' | 'clients' | null>(null);

  // Initialize from props
  useEffect(() => {
    if (initialVideo) {
      setTopic(initialVideo.title);
      setKeyTakeaway(initialVideo.description || '');
      setSelectedVideoId(initialVideo.id);
      if (initialVideo.articleId) {
        setSelectedArticleId(initialVideo.articleId);
      }
    } else if (initialArticle) {
      setTopic(initialArticle.title);
      setKeyTakeaway(initialArticle.description || '');
      setSelectedArticleId(initialArticle.id);
    } else if (!topic) {
      setTopic('Монтаж водяного тёплого пола и узла смешения');
      setKeyTakeaway('Основные ошибки при укладке трубы, расчёт шага и настройка коллектора');
    }
  }, [initialVideo, initialArticle, isOpen]);

  // Handle article selection change
  const handleArticleSelect = (artId: string) => {
    setSelectedArticleId(artId);
    const art = articles.find((a) => a.id === artId);
    if (art) {
      setTopic(art.title);
      setKeyTakeaway(art.description || '');
    }
  };

  // Handle video selection change
  const handleVideoSelect = (vidId: string) => {
    setSelectedVideoId(vidId);
    const vid = mediaFiles.find((f) => f.id === vidId);
    if (vid) {
      setTopic(vid.title);
      if (vid.description) setKeyTakeaway(vid.description);
    }
  };

  // Generate the divided social post text
  const generatePost = () => {
    const cleanTopic = topic.trim() || 'Монтаж сантехники и отопления';
    const cleanTakeaway = keyTakeaway.trim() || 'Разбор типовых ошибок, пошаговая технология и проверка расчётов';

    let text = '';

    if (platform === 'vk' || platform === 'telegram') {
      text = `🎬 ${cleanTopic.toUpperCase()}

${cleanTakeaway}

━━━━━━━━━━━━━━━━━━━━
🧰 ДЛЯ МАСТЕРОВ И МОНТАЖНИКОВ:
• Пошаговая схема и нормы монтажа без переделок уже в бесплатном Справочнике СантехПро.
• Калькулятор закупки: рассчитайте точный метраж трубы, фитингов и теплоизоляции за 2 минуты, чтобы сразу отправить клиенту понятную смету.
• Шаблоны договоров с актом приёмки — защитите себя от необоснованных претензий и задержек оплаты.
• Хотите получать прямые заявки на монтаж и ремонт ${customCity}? Зарегистрируйтесь в каталоге мастеров на сервисе — заявки поступают напрямую без посредников и скрытых комиссий!

━━━━━━━━━━━━━━━━━━━━
🏠 ДЛЯ ВЛАДЕЛЬЦЕВ КВАРТИР И ЗАКАЗЧИКОВ:
• Делаете ремонт или планируете замену труб? Проверьте смету бригады через наш калькулятор материалов, чтобы не переплачивать за лишний метраж и наценки магазинов.
• Читайте подробную инструкцию по этому узлу с чертежами и фото в онлайн-справочнике.
• Нужен надёжный специалист с гарантией качества? Найдите аттестованного мастера ${customCity} с реальными отзывами и рейтингом в каталоге СантехПро.

━━━━━━━━━━━━━━━━━━━━
📲 ПОЛЕЗНЫЕ ССЫЛКИ И ИНСТРУМЕНТЫ:
🌐 Официальный сервис: https://santehpro.info
📖 Бесплатный справочник схем: https://santehpro.info/#handbook
🧮 Инженерный калькулятор смет: https://santehpro.info/#calculator
👨‍🔧 Вызов проверенного мастера: https://santehpro.info/#specialists

#сантехника #ремонтквартир #сантехник #своимируками #монтажотопления #теплыйпол #водоснабжение #сантехпро #строительство`;
    } else if (platform === 'youtube') {
      text = `${cleanTopic} — полное руководство и разбор ошибок

${cleanTakeaway}

📍 ТАЙМ-КОДЫ И РАЗДЕЛЫ:
00:00 — Введение и суть проблемы
00:45 — Основные ошибки и как их избежать
02:15 — Пошаговая технология и правила монтажа
04:30 — Расчёт материалов и подбор комплектующих

━━━━━━━━━━━━━━━━━━━━
🧰 МАСТЕРАМ И МОНТАЖНИКАМ:
1. Скачивайте готовые схемы и инструкции в Справочнике: https://santehpro.info/#handbook
2. Считайте сметы для заказчиков в 1 клик в Калькуляторе: https://santehpro.info/#calculator
3. Принимайте заказы в своём городе без комиссии: https://santehpro.info/#specialists

━━━━━━━━━━━━━━━━━━━━
🏠 ЗАКАЗЧИКАМ И ЖИЛЬЦАМ:
1. Проверьте реальную стоимость материалов перед закупкой в Калькуляторе: https://santehpro.info/#calculator
2. Пошаговые решения бытовых поломок своими руками: https://santehpro.info
3. Вызовите проверенного сантехника с рейтингом ${customCity}: https://santehpro.info/#specialists

#сантехника #ремонт #отопление #сантехпро #shorts`;
    } else {
      // Reels / Клипы (Короткий формат с акцентом на хук в первых 2 строках)
      text = `Смотри до конца, если делаешь ремонт или работаешь с сантехникой! 🔥

${cleanTopic}: ${cleanTakeaway}

👇 РАЗВЕРНИ ОПИСАНИЕ:

🧰 МАСТЕРАМ:
• Бесплатный калькулятор смет и материалов для клиентов
• База из 130+ схем узлов монтажа
• Прямые заказы ${customCity} без комиссии
👉 Регистрация и расчёты на santehpro.info

🏠 ЗАКАЗЧИКАМ:
• Не дайте себя обмануть на закупке лишних материалов
• Проверяйте смету в 1 клик в онлайн-калькуляторе
• Вызывайте проверенных мастеров с гарантией
👉 Ссылка на сервис в шапке профиля или на сайте santehpro.info!

#сантехника #ремонтквартир #полезно #лайфхак #reels #клипы #сантехпро`;
    }

    setGeneratedText(text);
  };

  // Auto-generate on input changes
  useEffect(() => {
    if (isOpen) {
      generatePost();
    }
  }, [platform, postLength, topic, keyTakeaway, customCity, isOpen]);

  // Copy helper
  const handleCopy = (type: 'all' | 'masters' | 'clients') => {
    let toCopy = generatedText;

    if (type === 'masters') {
      const match = generatedText.match(/🧰[\s\S]*?(?=━━━━━━━━━━━━━━━━━━━━|🏠|$)/);
      toCopy = match ? match[0].trim() : generatedText;
    } else if (type === 'clients') {
      const match = generatedText.match(/🏠[\s\S]*?(?=━━━━━━━━━━━━━━━━━━━━|📲|📍|$)/);
      toCopy = match ? match[0].trim() : generatedText;
    }

    navigator.clipboard.writeText(toCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-900/60 via-slate-900 to-indigo-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Генератор описания для соцсетей</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  2в1: Мастера + Клиенты
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Создаёт готовый структурированный пост под видео с чётким разделением для специалистов и жильцов
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Platform Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Выберите соцсеть для выкладывания:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'vk', label: 'ВКонтакте (Клип / Пост)', icon: '🟦', color: 'from-blue-600/20 border-blue-500/50' },
                { id: 'telegram', label: 'Telegram (Канал)', icon: '✈️', color: 'from-sky-600/20 border-sky-500/50' },
                { id: 'youtube', label: 'YouTube (Shorts / Видео)', icon: '▶️', color: 'from-red-600/20 border-red-500/50' },
                { id: 'reels', label: 'Reels / Дзен / Клип', icon: '📱', color: 'from-pink-600/20 border-pink-500/50' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id as SocialPlatform)}
                  className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                    platform === p.id
                      ? `bg-gradient-to-br ${p.color} border-purple-500 text-white font-bold shadow-lg ring-2 ring-purple-500/50`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-xs">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Linking with existing content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            {/* Pick from Articles */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Привязать к статье Справочника:</span>
              </label>
              <select
                value={selectedArticleId}
                onChange={(e) => handleArticleSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              >
                <option value="">-- Выбрать статью для подстановки темы --</option>
                {articles.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.title} ({art.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Pick from Videos */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-400" />
                <span>Или привязать к медиа-файлу (видео):</span>
              </label>
              <select
                value={selectedVideoId}
                onChange={(e) => handleVideoSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition"
              >
                <option value="">-- Выбрать загруженное видео --</option>
                {mediaFiles
                  .filter((f) => f.fileType === 'video')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Video Parameters & Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Заголовок / Тема видео:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Например, Монтаж инсталляции или Устранение засора"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Город или география (для призыва к заказам):
              </label>
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="в вашем городе / по всей России"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Главная мысль / О чём ролик (хук для первых секунд):
            </label>
            <input
              type="text"
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              placeholder="3 главные ошибки мастеров, из-за которых течёт труба"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Generated Result Preview with live editing */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Готовый текст для описания видео (можно редактировать):</span>
              </label>

              {/* Copy Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy('masters')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                  title="Скопировать только часть для мастеров"
                >
                  <Wrench className="w-3 h-3 text-amber-400" />
                  <span>{copiedType === 'masters' ? 'Скопировано!' : 'Блок Мастерам'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy('clients')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                  title="Скопировать только часть для заказчиков"
                >
                  <Home className="w-3 h-3 text-cyan-400" />
                  <span>{copiedType === 'clients' ? 'Скопировано!' : 'Блок Клиентам'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy('all')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-purple-600/30 transition active:scale-95"
                  title="Скопировать весь текст поста целиком"
                >
                  {copiedType === 'all' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Текст скопирован!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white" />
                      <span>Скопировать всё</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              rows={14}
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-purple-500 transition shadow-inner"
            />
          </div>

          {/* Best Practices Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-amber-400">
                <Wrench className="w-3.5 h-3.5" />
                <span>Зачем делить текст для Мастеров:</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Мастеров привлекает польза: бесплатный расчёт сметы для их заказчиков, защита от неоплат (договоры) и новые прямые заявки в городе без комиссии сервисов типа Profi или YouDo.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-cyan-400">
                <Home className="w-3.5 h-3.5" />
                <span>Зачем делить текст для Клиентов:</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Клиенты боятся обмана на сметах и затоплений. Они ценят понятные инструкции, возможность проверить объём материалов в калькуляторе и кнопку вызова проверенного мастера с гарантией.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            Ссылка на платформу: <strong className="text-cyan-400 font-mono">https://santehpro.info</strong>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
            >
              Закрыть
            </button>
            <button
              type="button"
              onClick={() => handleCopy('all')}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 cursor-pointer transition active:scale-95 flex items-center space-x-2"
            >
              {copiedType === 'all' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Скопировано в буфер!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Скопировать текст поста</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
