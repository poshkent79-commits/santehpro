import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ImagePlus,
  X,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Loader2,
  CheckCircle2,
  BookmarkCheck,
  ExternalLink,
  Wrench,
  ArrowRight,
  Copy,
  Check,
  Bot,
  User,
  MessageSquare,
  HelpCircle,
  Clock,
  Send,
  Camera,
} from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';
import { saveDiagnosticSession } from '../utils/diagnosticHistory';
import { useAuth } from '../context/AuthContext';
import { generateDiagnosticReport } from '../ai/diagnosticEngine';

interface DiagnosticItem {
  id: string;
  query: string;
  imagePreview?: string;
  result: string;
  timestamp: string;
  toolsPlan?: string;
}

interface AiChatViewProps {
  initialPrompt?: string;
  onNavigateToCabinet?: (tab?: string) => void;
}

const QUICK_QUESTIONS = [
  'Капает смеситель на кухне',
  'Холодный радиатор отопления сверху',
  'Засор в раковине, вода медленно уходит',
  'Течет бачок унитаза в чашу',
  'Закис шаровый кран на стояке',
  'Шум и гул в трубах при открытии воды',
];

const PHOTO_TAGS = [
  { id: 'ball_valve', label: '🛑 Шаровый кран / стояк' },
  { id: 'heating', label: '♨️ Батарея / отопление' },
  { id: 'pipe_leak', label: '🔧 Труба / стык / пайка' },
  { id: 'sewer', label: '🧼 Засор / сифон' },
  { id: 'toilet', label: '🚽 Унитаз / бачок' },
  { id: 'boiler', label: '⚡ Бойлер / нагреватель' },
  { id: 'faucet', label: '🚰 Смеситель' },
];

export const AiChatView: React.FC<AiChatViewProps> = ({
  initialPrompt,
  onNavigateToCabinet,
}) => {
  const { currentUser } = useAuth();

  // Search & Input state
  const [inputPrompt, setInputPrompt] = useState<string>(initialPrompt || '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [imageSizeInfo, setImageSizeInfo] = useState<string | null>(null);
  const [selectedVisualTag, setSelectedVisualTag] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Search results & history state
  const [currentResult, setCurrentResult] = useState<DiagnosticItem | null>(null);
  const [historyItems, setHistoryItems] = useState<DiagnosticItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [toolsLoading, setToolsLoading] = useState<boolean>(false);

  // Follow-up question state
  const [followUpPrompt, setFollowUpPrompt] = useState<string>('');
  const [followUpLoading, setFollowUpLoading] = useState<boolean>(false);
  const [followUpMessages, setFollowUpMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([]);

  // Error handling state
  const [errorState, setErrorState] = useState<{
    message: string;
    details?: string;
    canRetry?: boolean;
    lastQuery?: string;
    lastImage?: string | null;
    lastMime?: string;
    lastTag?: string;
  } | null>(null);

  // UI feedback
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInputPrompt(initialPrompt);
      // Auto-trigger search if initialPrompt provided
      handleSearch(initialPrompt);
    }
  }, [initialPrompt]);

  // Dynamic loading steps
  useEffect(() => {
    let interval: any = null;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 1000);
    } else {
      setLoadingStep(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setErrorState(null);
    try {
      const result = await compressImageFile(file, 1280, 0.82);
      setSelectedImage(result.base64);
      setImageMimeType(result.mimeType);
      const kb = Math.round(result.compressedSize / 1024);
      const origMb = (result.originalSize / (1024 * 1024)).toFixed(1);
      setImageSizeInfo(result.originalSize > 500 * 1024 ? `${origMb} МБ → ${kb} КБ` : `${kb} КБ`);
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setSelectedImage(evt.target?.result as string);
        setImageMimeType(file.type || 'image/jpeg');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Reset the system completely ("Настроить систему заново")
   */
  const handleResetSystem = () => {
    setInputPrompt('');
    setSelectedImage(null);
    setImageMimeType('image/jpeg');
    setImageSizeInfo(null);
    setSelectedVisualTag('');
    setErrorState(null);
    setCurrentResult(null);
    setFollowUpMessages([]);
    setFollowUpPrompt('');
    setSavedNotice('Система сброшена и настроена заново. Введите новый вопрос.');
    setTimeout(() => setSavedNotice(null), 4000);
  };

  /**
   * Main Search & Diagnostic execution
   */
  const handleSearch = async (overridePrompt?: string) => {
    const query = (overridePrompt !== undefined ? overridePrompt : inputPrompt).trim();
    const imageToSend = selectedImage;
    const mimeToSend = imageMimeType;
    const tagToSend = selectedVisualTag;

    if (!query && !imageToSend) {
      setErrorState({
        message: 'Пожалуйста, введите вопрос или загрузите фото узла для поиска.',
        canRetry: false,
      });
      return;
    }

    setLoading(true);
    setErrorState(null);
    setFollowUpMessages([]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: query || 'Проанализируйте фото сантехнического узла и предоставьте краткое диагностическое заключение.',
          base64Image: imageToSend,
          imageMimeType: mimeToSend,
          visualTag: tagToSend,
          conversationHistory: [],
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || `Код ошибки сервера: ${res.status}`);
      }

      const data = await res.json();
      const responseText = data.text || 'Диагностика проведена. Пожалуйста, уточните детали вопроса при необходимости.';

      const newResult: DiagnosticItem = {
        id: `diag-${Date.now()}`,
        query: query || (imageToSend ? 'Фотодиагностика узла' : 'Вопрос по сантехнике'),
        imagePreview: imageToSend || undefined,
        result: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentResult(newResult);
      setHistoryItems((prev) => [newResult, ...prev.filter((item) => item.id !== newResult.id).slice(0, 5)]);

      // Auto-save to user history in DB/localStorage
      saveDiagnosticSession({
        userUid: currentUser?.uid,
        userEmail: currentUser?.email,
        query: newResult.query,
        result: responseText,
        imagePreview: imageToSend || undefined,
      })
        .then(() => {
          setSavedNotice('Заключение сохранено в Историю диагностики Личного кабинета');
          setTimeout(() => setSavedNotice(null), 5000);
        })
        .catch((e) => console.warn('Could not auto-save diagnostic session:', e));

      // Scroll to result under search bar
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Network issue during diagnostic request, activating ultra-fast local RF fallback engine:', err);
      try {
        const localReport = generateDiagnosticReport(query || 'Вопрос по сантехнике', {
          hasImage: !!imageToSend,
          base64Image: imageToSend || undefined,
          visualTag: tagToSend || undefined,
        });

        const newResult: DiagnosticItem = {
          id: `diag-${Date.now()}`,
          query: query || (imageToSend ? 'Фотодиагностика узла (автономно)' : 'Вопрос по сантехнике'),
          imagePreview: imageToSend || undefined,
          result: localReport,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setCurrentResult(newResult);
        setHistoryItems((prev) => [newResult, ...prev.filter((item) => item.id !== newResult.id).slice(0, 5)]);

        saveDiagnosticSession({
          userUid: currentUser?.uid,
          userEmail: currentUser?.email,
          query: newResult.query,
          result: localReport,
          imagePreview: imageToSend || undefined,
        }).catch(() => {});

        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } catch (fallbackErr) {
        console.error('Diagnostic error:', fallbackErr);
        setErrorState({
          message: 'Сбой связи с диагностическим сервисом.',
          details: 'Проверьте сетевое подключение или повторите попытку.',
          canRetry: true,
          lastQuery: query,
          lastImage: imageToSend,
          lastMime: mimeToSend,
          lastTag: tagToSend,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request Stage 2: Tools and detailed action plan
   */
  const handleRequestToolsPlan = async () => {
    if (!currentResult || toolsLoading) return;
    setToolsLoading(true);
    setErrorState(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Что нужно сделать и какие инструменты нужны?',
          base64Image: currentResult.imagePreview,
          conversationHistory: [
            { role: 'user', content: currentResult.query },
            { role: 'assistant', content: currentResult.result },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error('Не удалось получить перечень инструментов');
      }

      const data = await res.json();
      const planText = data.text || 'План работ сформирован.';

      setCurrentResult((prev) => (prev ? { ...prev, toolsPlan: planText } : null));

      // Update in history
      setHistoryItems((prev) =>
        prev.map((item) => (item.id === currentResult.id ? { ...item, toolsPlan: planText } : item))
      );
    } catch (err: any) {
      console.warn('Network issue fetching plan, using local RF diagnostic engine:', err);
      try {
        const localPlan = generateDiagnosticReport(currentResult.query || 'Инструменты и план работ', {
          forceMode: 'action',
          hasImage: !!currentResult.imagePreview,
          base64Image: currentResult.imagePreview,
        });
        setCurrentResult((prev) => (prev ? { ...prev, toolsPlan: localPlan } : null));
        setHistoryItems((prev) =>
          prev.map((item) => (item.id === currentResult.id ? { ...item, toolsPlan: localPlan } : item))
        );
      } catch (localErr) {
        setErrorState({
          message: 'Не удалось загрузить регламент работ и список инструментов.',
          details: err?.message || 'Попробуйте повторить запрос.',
          canRetry: true,
        });
      }
    } finally {
      setToolsLoading(false);
    }
  };

  /**
   * Follow-up clarifying question in the same context
   */
  const handleSendFollowUp = async () => {
    if (!followUpPrompt.trim() || !currentResult || followUpLoading) return;
    const qText = followUpPrompt.trim();
    setFollowUpPrompt('');
    setFollowUpLoading(true);

    const newHistory = [
      ...followUpMessages,
      { role: 'user' as const, text: qText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ];
    setFollowUpMessages(newHistory);

    try {
      const convHistory = [
        { role: 'user', content: currentResult.query },
        { role: 'assistant', content: currentResult.result },
        ...(currentResult.toolsPlan ? [{ role: 'assistant', content: currentResult.toolsPlan }] : []),
        ...followUpMessages.map((m) => ({ role: m.role, content: m.text })),
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: qText,
          base64Image: currentResult.imagePreview,
          conversationHistory: convHistory,
        }),
      });

      if (!res.ok) throw new Error('Ошибка связи при ответе на уточняющий вопрос');
      const data = await res.json();

      setFollowUpMessages([
        ...newHistory,
        {
          role: 'assistant',
          text: data.text || 'Ответ сформирован.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('Follow-up error:', err);
      setFollowUpMessages([
        ...newHistory,
        {
          role: 'assistant',
          text: `⚠️ Не удалось получить ответ: ${err?.message || 'Ошибка сети'}. Повторите попытку.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const copyResultToClipboard = () => {
    if (!currentResult) return;
    const fullText = `${currentResult.query}\n\n${currentResult.result}${
      currentResult.toolsPlan ? `\n\n${currentResult.toolsPlan}` : ''
    }`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. System Status & Notification Bar */}
      {savedNotice && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{savedNotice}</span>
          </div>
          {onNavigateToCabinet && (
            <button
              type="button"
              onClick={() => onNavigateToCabinet('diagnostics')}
              className="ml-3 underline hover:text-white font-bold flex items-center space-x-1 text-[11px] shrink-0"
            >
              <span>Посмотреть в Кабинете</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* 2. THE SEARCH BAR: Text Input + Image Upload Button + Search Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Вопросы по сантехнике и ИИ-Диагностика
              </h2>
              <p className="text-[11px] text-slate-400">
                Задайте вопрос текстом или загрузите фото — ответ появится под строкой поиска
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetSystem}
            title="Сбросить все параметры и настроить систему заново"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Настроить заново</span>
          </button>
        </div>

        {/* Selected Image Preview attached to Search Bar */}
        {selectedImage && (
          <div className="bg-slate-950 p-3 rounded-2xl border border-cyan-500/40 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative inline-block shrink-0">
                  <img
                    src={selectedImage}
                    alt="Фото сантехники"
                    className="h-14 w-14 object-cover rounded-xl border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImageSizeInfo(null);
                      setSelectedVisualTag('');
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow cursor-pointer transition"
                    title="Удалить фото"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="text-white font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Фото прикреплено к запросу</span>
                  </div>
                  {imageSizeInfo && (
                    <div className="text-[11px] text-slate-400">Сжато для быстрой передачи: {imageSizeInfo}</div>
                  )}
                  <div className="text-[11px] text-cyan-400">
                    Укажите тип узла ниже для ускорения анализа или нажмите поиск:
                  </div>
                </div>
              </div>
            </div>

            {/* Quick node selector tags */}
            <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-800">
              {PHOTO_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedVisualTag((prev) => (prev === tag.id ? '' : tag.id))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedVisualTag === tag.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isCompressing && (
          <div className="flex items-center space-x-2 text-xs text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 px-3 py-2 rounded-xl">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Оптимизация фотографии для быстрой отправки...</span>
          </div>
        )}

        {/* Primary Unified Search Bar: Input + Photo Button + Search Button */}
        <div className="flex items-center gap-2">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing || loading}
            title="Загрузить фотографию неисправности или узла"
            className={`p-3 sm:px-4 sm:py-3 rounded-2xl border flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              selectedImage
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-slate-700'
            } disabled:opacity-50`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs font-bold hidden md:inline">
              {selectedImage ? 'Фото выбрано' : 'Фото узла'}
            </span>
          </button>

          {/* Text Input Field */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Опишите проблему (например: капает смеситель, не греет батарея, засор)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            {inputPrompt && (
              <button
                type="button"
                onClick={() => setInputPrompt('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                title="Очистить строку"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={loading || isCompressing || (!inputPrompt.trim() && !selectedImage)}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-cyan-500/20 flex items-center space-x-2 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Поиск решения</span>
          </button>
        </div>

        {/* Quick Question Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
          <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center space-x-1">
            <MessageSquare className="w-3 h-3" />
            <span>Быстрый выбор:</span>
          </span>
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputPrompt(q);
                handleSearch(q);
              }}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 3. INFORMATION APPEARING BELOW THE SEARCH BAR (ПОСЛЕ ПОИСКА ПОД СТРОКОЙ ПОИСКА) */}

      {/* 3A. Loading Card */}
      {loading && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <span>ИИ-Эксперт выполняет инженерную диагностику...</span>
              </div>
              <div className="text-xs text-cyan-400 mt-0.5">
                {loadingStep === 0 && 'Определение типа узла, материала труб и симптомов поломки...'}
                {loadingStep === 1 && 'Анализ инженерных регламентов СП 30.13330 и ГОСТ...'}
                {loadingStep >= 2 && 'Формирование краткого экспертного заключения и решения...'}
              </div>
            </div>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-700 ease-out"
              style={{ width: `${(loadingStep + 1) * 33}%` }}
            />
          </div>
        </div>
      )}

      {/* 3B. Error Display Card (Корректное отображение ошибок с кнопками повтора и сброса) */}
      {errorState && !loading && (
        <div className="bg-rose-950/40 border-2 border-rose-800/80 rounded-3xl p-5 sm:p-6 text-rose-200 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-white">
                {errorState.message}
              </h3>
              {errorState.details && (
                <p className="text-xs text-rose-300/90 leading-relaxed">
                  {errorState.details}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-rose-900/60">
            {errorState.canRetry && (
              <button
                type="button"
                onClick={() => handleSearch(errorState.lastQuery)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Повторить поиск</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetSystem}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-rose-800/80 text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Настроить систему заново</span>
            </button>
          </div>
        </div>
      )}

      {/* 3C. Main Diagnostic Result Card (Появляется ПОД строкой поиска) */}
      {currentResult && !loading && (
        <div
          ref={resultRef}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in duration-200"
        >
          {/* Header of the Result */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-start space-x-3">
              {currentResult.imagePreview && (
                <img
                  src={currentResult.imagePreview}
                  alt="Фото узла"
                  className="w-12 h-12 object-cover rounded-xl border border-white/10 shrink-0"
                />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span>Диагностика проведена</span>
                  </span>
                  <span className="text-xs text-slate-500">{currentResult.timestamp}</span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
                  {currentResult.query}
                </h3>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={copyResultToClipboard}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition flex items-center space-x-1.5 cursor-pointer"
                title="Скопировать заключение в буфер"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Скопировать</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetSystem}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition flex items-center space-x-1.5 cursor-pointer"
                title="Начать новый поиск и сбросить текущий"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Новый поиск</span>
              </button>
            </div>
          </div>

          {/* Shortened AI Response Content */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 sm:p-5 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {currentResult.result}
          </div>

          {/* Stage 2 Action: Request Tools & Steps */}
          {!currentResult.toolsPlan ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-amber-300">
                    Хотите узнать, что нужно сделать и какие инструменты нужны?
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    ИИ сформирует компактный список необходимых ключей, деталей с диаметрами и пошаговый порядок действий.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestToolsPlan}
                disabled={toolsLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {toolsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wrench className="w-4 h-4" />
                )}
                <span>Что нужно сделать и какие инструменты?</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Unfolded Stage 2 Tools & Steps */
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                <Wrench className="w-4 h-4" />
                <span>Инженерный план ремонта и перечень инструментов:</span>
              </div>
              <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {currentResult.toolsPlan}
              </div>
            </div>
          )}

          {/* Follow-up Questions in Context */}
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            {followUpMessages.length > 0 && (
              <div className="space-y-2.5">
                {followUpMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start space-x-2.5 ${
                      msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950 border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div className="text-[10px] text-slate-400 text-right mt-1">{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {followUpLoading && (
              <div className="flex items-center space-x-2 text-xs text-cyan-400 p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Эксперт готовит уточняющий ответ...</span>
              </div>
            )}

            {/* Input for follow-up question */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={followUpPrompt}
                onChange={(e) => setFollowUpPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendFollowUp();
                  }
                }}
                placeholder="Задайте уточняющий вопрос по этому узлу..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleSendFollowUp}
                disabled={followUpLoading || !followUpPrompt.trim()}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D. Initial Welcome Guide when no search is active */}
      {!currentResult && !loading && !errorState && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="text-xs font-bold text-white">Опишите проблему или вопрос</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Напишите, что случилось (течет смеситель, не греет батарея, засор).
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="text-xs font-bold text-white">Прикрепите фото узла</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Нажмите кнопку с камерой, чтобы ИИ распознал тип труб, кранов и дефекты.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="text-xs font-bold text-white">Ответ под строкой поиска</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Мгновенное краткое заключение, способ решения и регламент с инструментами.
            </p>
          </div>
        </div>
      )}

      {/* 3E. Recent searches in current session */}
      {historyItems.length > 1 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Недавние запросы в этой сессии:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {historyItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentResult(item);
                  setErrorState(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs transition border cursor-pointer flex items-center space-x-2 ${
                  currentResult?.id === item.id
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="line-clamp-1 max-w-[200px]">{item.query}</span>
                <span className="text-[10px] text-slate-500">{item.timestamp}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
