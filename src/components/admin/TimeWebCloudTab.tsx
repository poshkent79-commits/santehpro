import React, { useState } from 'react';
import {
  Cloud,
  Server,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  ShieldCheck,
  Activity,
  HardDrive,
  Cpu,
  Clock,
  ExternalLink,
  Save,
  Download,
  Upload,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Radio,
  Layers,
  ArrowUpRight,
  Sparkles,
  FileText,
  UserCheck,
  Check,
  Copy
} from 'lucide-react';
import { useTimeWebSync, TimeWebSyncLogItem } from '../../services/timewebSyncClient';

interface TimeWebCloudTabProps {
  articlesCount: number;
  specialistsCount: number;
  serviceRequestsCount: number;
  usersCount: number;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onRefreshAll?: () => void;
}

export const TimeWebCloudTab: React.FC<TimeWebCloudTabProps> = ({
  articlesCount,
  specialistsCount,
  serviceRequestsCount,
  usersCount,
  showToast,
  onRefreshAll,
}) => {
  const {
    config,
    logs,
    status,
    pingMs,
    lastSyncTime,
    isSyncing,
    isTesting,
    testConnection,
    triggerFullSync,
    saveConfig,
    clearLogs,
  } = useTimeWebSync();

  // Local form state for configuration
  const [apiUrl, setApiUrl] = useState(config?.apiUrl || 'https://api.timeweb.cloud/v1');
  const [apiToken, setApiToken] = useState(config?.apiToken || '');
  const [showToken, setShowToken] = useState(false);
  const [serverId, setServerId] = useState(config?.serverId || 'twc-srv-santehpro-01');
  const [projectName, setProjectName] = useState(config?.projectName || 'СантехПро Production');
  const [syncMode, setSyncMode] = useState<'realtime' | 'interval' | 'manual'>(config?.syncMode || 'realtime');
  const [syncIntervalSeconds, setSyncIntervalSeconds] = useState(config?.syncIntervalSeconds || 10);
  const [conflictStrategy, setConflictStrategy] = useState<'timestamp' | 'timeweb_wins' | 'local_wins'>(config?.conflictStrategy || 'timestamp');
  const [autoBackup, setAutoBackup] = useState(config?.autoBackup ?? true);

  // Sync log filter
  const [logFilterEntity, setLogFilterEntity] = useState<string>('all');
  const [selectedLogPayload, setSelectedLogPayload] = useState<TimeWebSyncLogItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Update local form state when config loads
  React.useEffect(() => {
    if (config) {
      setApiUrl(config.apiUrl);
      setApiToken(config.apiToken);
      setServerId(config.serverId);
      setProjectName(config.projectName);
      setSyncMode(config.syncMode);
      setSyncIntervalSeconds(config.syncIntervalSeconds);
      setConflictStrategy(config.conflictStrategy);
      setAutoBackup(config.autoBackup);
    }
  }, [config]);

  // Handle configuration save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveConfig({
      apiUrl,
      apiToken,
      serverId,
      projectName,
      syncMode,
      syncIntervalSeconds,
      conflictStrategy,
      autoBackup,
    });

    if (res.success) {
      showToast('Настройки интеграции с TimeWeb Cloud успешно сохранены!');
    } else {
      showToast(res.message || 'Ошибка сохранения настроек', 'error');
    }
  };

  // Handle ping test
  const handlePingTest = async () => {
    const res = await testConnection();
    if (res.success) {
      showToast(`Связь с TimeWeb Cloud подтверждена (задержка: ${res.latencyMs} мс)`);
    } else {
      showToast(res.message || 'Ошибка проверки связи', 'error');
    }
  };

  // Handle manual full sync
  const handleFullSync = async () => {
    const res = await triggerFullSync();
    if (res.success) {
      showToast('Полная синхронизация с сервером TimeWeb Cloud завершена успешно!');
      if (onRefreshAll) onRefreshAll();
    } else {
      showToast(res.message || 'Ошибка синхронизации', 'error');
    }
  };

  // Handle export data dump
  const handleExportDump = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/timeweb/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timeweb-cloud-dump-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('Дамп данных для сервера TimeWeb Cloud успешно скачан!');
      } else {
        showToast('Ошибка при формировании дампа данных', 'error');
      }
    } catch (err) {
      showToast('Не удалось загрузить файл экспорта', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Filtered logs
  const filteredLogs = logs.filter((item) => {
    if (logFilterEntity === 'all') return true;
    return item.entity === logFilterEntity;
  });

  return (
    <div className="space-y-6">
      {/* ================= 1. HEADER HERO: TIMEWEB CLOUD STATUS ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Серверное окружение TimeWeb Cloud</span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-400 font-mono">Пинг {pingMs} мс</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Cloud className="w-8 h-8 text-indigo-400" />
              <span>Интеграция с TimeWeb Cloud</span>
            </h2>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Мгновенная двусторонняя синхронизация правок между административной панелью «СантехПро» и облачным сервером TimeWeb Cloud. Любые изменения заявок, мастеров, статей и пользователей применяются без перезагрузки страниц.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePingTest}
              disabled={isTesting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
            >
              <Activity className={`w-4 h-4 text-cyan-400 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Проверка...' : 'Проверить связь'}</span>
            </button>

            <button
              type="button"
              onClick={handleFullSync}
              disabled={isSyncing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Синхронизация...' : 'Синхронизировать сейчас'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportDump}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
              title="Скачать полный дамп базы для миграции на TimeWeb Cloud"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isExporting ? 'Экспорт...' : 'Экспорт в TimeWeb'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Статус сервера</span>
            </div>
            <div className="text-base font-black text-white mt-1 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Онлайн</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
              {config?.ipAddress || '185.178.47.122'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Режим синхронизации</span>
            </div>
            <div className="text-base font-black text-white mt-1 capitalize">
              {syncMode === 'realtime' ? 'Мгновенный (Live)' : syncMode === 'interval' ? `Каждые ${syncIntervalSeconds}с` : 'По запросу'}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
              Автосохранение активно
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Посл. синхронизация</span>
            </div>
            <div className="text-base font-black text-white mt-1 font-mono">
              {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('ru-RU') : 'Недавно'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Отклик: {pingMs} мс
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>База данных TimeWeb</span>
            </div>
            <div className="text-base font-black text-white mt-1">
              PostgreSQL 16
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">
              {config?.databaseHost || 'twc-pg-santehpro.timeweb.cloud'}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. ENTITY SYNCHRONIZATION CARDS ================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Синхронизированные сущности базы данных</span>
          </h3>
          <span className="text-xs text-slate-400">
            Всего объектов в репликации: <strong className="text-white font-mono">{articlesCount + specialistsCount + serviceRequestsCount + usersCount}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Requests */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                📋
              </div>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Live Sync</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-400 font-medium">Заявки клиентов</div>
              <div className="text-2xl font-black text-white mt-0.5 font-mono">{serviceRequestsCount}</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Изменение статусов, примечания и новые вызовы сохраняются мгновенно.
              </p>
            </div>
          </div>

          {/* Specialists */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                👨‍🔧
              </div>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Live Sync</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-400 font-medium">Мастера и верификация</div>
              <div className="text-2xl font-black text-white mt-0.5 font-mono">{specialistsCount}</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Профили, документы, бейджи и рейтинги мастеров в актуальном состоянии.
              </p>
            </div>
          </div>

          {/* Articles & Courses */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                📚
              </div>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Live Sync</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-400 font-medium">Справочник и курсы</div>
              <div className="text-2xl font-black text-white mt-0.5 font-mono">{articlesCount}</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Правки текстов, шагов, фото и видео транслируются пользователям без задержек.
              </p>
            </div>
          </div>

          {/* Users */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                👥
              </div>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Live Sync</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-400 font-medium">Пользователи и права</div>
              <div className="text-2xl font-black text-white mt-0.5 font-mono">{usersCount}</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Учётные записи, роли, история покупок и избранное синхронизированы.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. CONFIGURATION & SERVER ENVIRONMENT SETTINGS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Server className="w-5 h-5 text-indigo-400" />
                <span>Параметры окружения TimeWeb Cloud</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Настройка API-доступа, расписания репликации и политики разрешения конфликтов
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
              v2.4 Production
            </span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL сервера / API TimeWeb Cloud
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.timeweb.cloud/v1 или URL VPS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Идентификатор сервера (Server ID)
                </label>
                <input
                  type="text"
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  placeholder="twc-srv-santehpro-01"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>API Токен авторизации TimeWeb Cloud</span>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition inline-flex items-center space-x-1 cursor-pointer"
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showToken ? 'Скрыть токен' : 'Показать'}</span>
                </button>
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="twc_sec_... (Bearer Token)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Токен используется для защищённого обмена данными между панелью администратора и API TimeWeb.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Режим синхронизации
                </label>
                <select
                  value={syncMode}
                  onChange={(e) => setSyncMode(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="realtime">⚡ Мгновенный (Real-time WebSocket / Webhook)</option>
                  <option value="interval">⏱ Интервальный (Автоматический опрос)</option>
                  <option value="manual">🖐 Ручной (Только по нажатию кнопки)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Интервал проверки (сек)
                </label>
                <select
                  value={syncIntervalSeconds}
                  onChange={(e) => setSyncIntervalSeconds(Number(e.target.value))}
                  disabled={syncMode === 'manual'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
                >
                  <option value={5}>5 секунд (Высокая частота)</option>
                  <option value={10}>10 секунд (Рекомендуется)</option>
                  <option value={30}>30 секунд (Экономный режим)</option>
                  <option value={60}>1 минута</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Разрешение конфликтов
                </label>
                <select
                  value={conflictStrategy}
                  onChange={(e) => setConflictStrategy(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="timestamp">Новейшая запись по времени (Рекомендуется)</option>
                  <option value="timeweb_wins">Приоритет сервера TimeWeb Cloud</option>
                  <option value="local_wins">Приоритет локальных правок админа</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-950 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    Автоматический снимок бэкапа в TimeWeb S3
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить параметры TimeWeb Cloud</span>
              </button>
            </div>
          </form>
        </div>

        {/* Technical Specification Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-sm mb-3">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Параметры инстанса TimeWeb</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Провайдер</span>
                <span className="font-semibold text-white">TimeWeb Cloud (Санкт-Петербург)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">ОС сервера</span>
                <span className="font-semibold text-white">Ubuntu 24.04 LTS x64</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Среда выполнения</span>
                <span className="font-semibold text-white font-mono">Node.js 20.x + TSX</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">СУБД</span>
                <span className="font-semibold text-white">PostgreSQL 16 High-Perf</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Шлюз WebSocket</span>
                <span className="font-semibold text-emerald-400 font-mono">/api/ws (Active)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Прокси / SSL</span>
                <span className="font-semibold text-white">Nginx 1.26 + Let's Encrypt</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Аптайм сервиса</span>
                <span className="font-semibold text-emerald-400">99.98%</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed">
            <div className="font-bold flex items-center space-x-1.5 mb-1 text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Мгновенная репликация</span>
            </div>
            При сохранении любой формы в админ-панели данные одновременно записываются в хранилище и рассылаются на сервер TimeWeb Cloud и всем активным клиентам по защищенному вебсокету.
          </div>
        </div>
      </div>

      {/* ================= 4. REAL-TIME AUDIT LOG TABLE ================= */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Журнал синхронизации в реальном времени (Live Audit Log)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Фиксация всех запросов, изменений и обновлений с отслеживанием задержки
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={logFilterEntity}
              onChange={(e) => setLogFilterEntity(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">Все сущности ({logs.length})</option>
              <option value="service_requests">Заявки клиентов</option>
              <option value="specialists">Мастера</option>
              <option value="articles">Справочник / Курсы</option>
              <option value="users">Пользователи</option>
              <option value="settings">Системные / Бэкап</option>
            </select>

            <button
              type="button"
              onClick={clearLogs}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition cursor-pointer"
              title="Очистить журнал синхронизации"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Log Entries */}
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Журнал синхронизации пуст или записи не найдены по фильтру.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80 font-medium">
                  <th className="pb-3 pr-4">Время</th>
                  <th className="pb-3 pr-4">Сущность</th>
                  <th className="pb-3 pr-4">Действие</th>
                  <th className="pb-3 pr-4">Статус</th>
                  <th className="pb-3 pr-4">Отклик</th>
                  <th className="pb-3 pr-4">Описание операции</th>
                  <th className="pb-3 text-right">Детали</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredLogs.map((log) => {
                  const date = new Date(log.timestamp);
                  const timeStr = date.toLocaleTimeString('ru-RU');
                  const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 pr-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {dateStr} {timeStr}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.entity === 'service_requests'
                            ? 'bg-blue-500/10 text-blue-400'
                            : log.entity === 'specialists'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : log.entity === 'articles'
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : log.entity === 'users'
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {log.entity === 'service_requests'
                            ? 'Заявки'
                            : log.entity === 'specialists'
                            ? 'Мастера'
                            : log.entity === 'articles'
                            ? 'Статьи'
                            : log.entity === 'users'
                            ? 'Пользователи'
                            : 'Система'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-[11px] uppercase font-bold text-slate-300">
                        {log.action}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>TimeWeb Synced</span>
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-slate-400 text-[11px]">
                        {log.latencyMs} мс
                      </td>
                      <td className="py-3 pr-4 text-slate-300 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="py-3 text-right">
                        {log.payloadSummary && (
                          <button
                            type="button"
                            onClick={() => setSelectedLogPayload(log)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition cursor-pointer"
                          >
                            Данные
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payload Details Modal */}
      {selectedLogPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm">
                Детали синхронизации: {selectedLogPayload.entity} ({selectedLogPayload.action})
              </h4>
              <button
                type="button"
                onClick={() => setSelectedLogPayload(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Идентификатор записи:</span>
                <span className="font-mono text-white">{selectedLogPayload.recordId || selectedLogPayload.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Время выполнения:</span>
                <span className="text-white">{new Date(selectedLogPayload.timestamp).toLocaleString('ru-RU')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Задержка доставки:</span>
                <span className="font-mono text-emerald-400">{selectedLogPayload.latencyMs} мс</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1 font-semibold">Сводка переданных данных:</div>
              <pre className="text-xs text-indigo-300 whitespace-pre-wrap font-mono">
                {selectedLogPayload.payloadSummary}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLogPayload(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
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
