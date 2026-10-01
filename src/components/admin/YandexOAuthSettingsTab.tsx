import React, { useState, useEffect } from 'react';
import {
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Eye,
  EyeOff,
  Globe,
  Info,
} from 'lucide-react';

interface YandexConfigStatus {
  configured: boolean;
  clientId: string;
  hasSecret: boolean;
  maskedSecret: string;
  enabled: boolean;
  callbackUrl: string;
  webmasterVerificationCode?: string;
}

export const YandexOAuthSettingsTab: React.FC = () => {
  const [status, setStatus] = useState<YandexConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [webmasterVerificationCode, setWebmasterVerificationCode] = useState('9a3402ab46b0793b');

  // Copy helpers
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Known origins
  const serverIpOrigin = 'http://89.169.45.122';
  const serverIpRedirectUri = `${serverIpOrigin}/auth/yandex/callback`;

  const domainOrigin = 'https://santehpro.info';
  const domainRedirectUri = `${domainOrigin}/auth/yandex/callback`;

  const domainWwwOrigin = 'https://www.santehpro.info';
  const domainWwwRedirectUri = `${domainWwwOrigin}/auth/yandex/callback`;

  const prodOrigin = 'https://service-1069472196547.europe-west2.run.app';
  const prodRedirectUri = `${prodOrigin}/auth/yandex/callback`;

  const sharedOrigin = 'https://ais-pre-vbfbydsstiiuauzkz6m4cv-781140790971.europe-west2.run.app';
  const sharedRedirectUri = `${sharedOrigin}/auth/yandex/callback`;

  const devOrigin = 'https://ais-dev-vbfbydsstiiuauzkz6m4cv-781140790971.europe-west2.run.app';
  const devRedirectUri = `${devOrigin}/auth/yandex/callback`;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : prodOrigin;
  const currentRedirectUri = `${currentOrigin}/auth/yandex/callback`;

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/yandex/config');
      if (res.ok) {
        const data: YandexConfigStatus = await res.json();
        setStatus(data);
        setClientId(data.clientId || '');
        setEnabled(data.enabled ?? true);
        if (data.webmasterVerificationCode) {
          setWebmasterVerificationCode(data.webmasterVerificationCode);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch Yandex config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch('/api/admin/yandex/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId.trim() || undefined,
          clientSecret: clientSecret.trim() || undefined,
          enabled,
          webmasterVerificationCode: webmasterVerificationCode.trim() || '9a3402ab46b0793b',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при сохранении настроек');
      }

      setNotification({ type: 'success', message: 'Настройки Яндекс ID успешно сохранены!' });
      setClientSecret('');
      await fetchConfig();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Не удалось сохранить настройки' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600/15 via-slate-900 to-slate-900 border border-red-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
            Я
          </div>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap">
              <h2 className="text-xl font-black text-white">Интеграция Яндекс ID (OAuth 2.0)</h2>
              {status?.configured ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>НАСТРОЕНО И АКТИВНО</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>ТРЕБУЕТСЯ НАСТРОЙКА КЛЮЧЕЙ</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Регистрация в 1 клик, вход по Яндекс ID и автоматическое восстановление профиля и купленных курсов
            </p>
          </div>
        </div>

        <a
          href="https://oauth.yandex.ru/client/new"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-lg shadow-red-600/20 flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <span>Создать приложение в Яндекс</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 text-xs font-semibold animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* YANDEX WEBMASTER VERIFICATION & SEO SECTION */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center font-black text-lg border border-red-500/30">
              Я
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Верификация в Яндекс.Вебмастере (SEO & Индексация)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Включено
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Подтверждение прав владельца в сервисе Яндекс.Вебмастер ускоряет индексацию страниц и показ карточек мастеров в Яндекс.Поиске.
              </p>
            </div>
          </div>

          <a
            href="https://webmaster.yandex.ru/site/indexing/verification/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition border border-slate-700 hover:border-slate-600"
          >
            <span>Открыть Яндекс.Вебмастер</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Option 1: Meta Tag */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                <span>Способ 1: Мета-тег в &lt;head&gt;</span>
              </span>
              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                Мета-тег автоматически внедрён в шапку всех страниц сайта. Робот Яндекса считывает его моментально.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 select-all break-all">
                {`<meta name="yandex-verification" content="${webmasterVerificationCode}" />`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(`<meta name="yandex-verification" content="${webmasterVerificationCode}" />`, 'meta_tag')}
              className="mt-2 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-slate-700 cursor-pointer"
            >
              {copiedKey === 'meta_tag' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'meta_tag' ? 'Мета-тег скопирован!' : 'Скопировать мета-тег'}</span>
            </button>
          </div>

          {/* Option 2: HTML File */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                <span>Способ 2: HTML-файл верификации</span>
              </span>
              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                Файл подтверждения доступен в корне сайта по стандартному URL Яндекс.Вебмастера:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-400 select-all break-all">
                {`https://santehpro.info/yandex_${webmasterVerificationCode}.html`}
              </div>
            </div>
            <a
              href={`/yandex_${webmasterVerificationCode}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-slate-700 text-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Проверить открытие HTML-файла</span>
            </a>
          </div>
        </div>

        {/* Verification Code Input */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Код верификации Яндекс (yandex-verification):
            </label>
            <input
              type="text"
              value={webmasterVerificationCode}
              onChange={(e) => setWebmasterVerificationCode(e.target.value)}
              placeholder="9a3402ab46b0793b"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md shadow-red-600/20 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
            >
              <span>Сохранить код</span>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 2: EXACT URLS TO COPY TO YANDEX OAUTH */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Ссылки для Шага 2 («Платформы приложений»)</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Скопируйте эти ссылки и вставьте в соответствующие поля в кабинете Яндекс OAuth
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Redirect URI Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <span>1. Поле «Redirect URI»</span>
                <span className="text-[10px] text-rose-400 font-normal">* Обязательное</span>
              </span>
            </div>

            {/* Server IP Redirect URI */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400">Прямой IP сервера (89.169.45.122):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(serverIpRedirectUri, 'redirect_ip')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition flex items-center space-x-1"
                >
                  {copiedKey === 'redirect_ip' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-amber-900/60 text-xs font-mono text-amber-300 break-all select-all">
                {serverIpRedirectUri}
              </div>
            </div>

            {/* Custom Domain santehpro.info */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-400">Собственный домен santehpro.info (Главный):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(domainRedirectUri, 'redirect_domain')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition flex items-center space-x-1"
                >
                  {copiedKey === 'redirect_domain' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-sky-900/60 text-xs font-mono text-sky-300 break-all select-all">
                {domainRedirectUri}
              </div>
            </div>

            {/* Custom Domain www.santehpro.info */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">С приставкой www (www.santehpro.info):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(domainWwwRedirectUri, 'redirect_domain_www')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition flex items-center space-x-1"
                >
                  {copiedKey === 'redirect_domain_www' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/70 text-[11px] font-mono text-slate-300 break-all select-all">
                {domainWwwRedirectUri}
              </div>
            </div>

            {/* Cloud Run Redirect URI */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Cloud Run хостинг:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(prodRedirectUri, 'redirect_prod')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition flex items-center space-x-1"
                >
                  {copiedKey === 'redirect_prod' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/70 text-xs font-mono text-slate-400 break-all select-all">
                {prodRedirectUri}
              </div>
            </div>

            {/* Preview Redirect URI */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Второй URL через «+» (Shared Preview):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(sharedRedirectUri, 'redirect_shared')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition flex items-center space-x-1"
                >
                  {copiedKey === 'redirect_shared' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/70 text-[11px] font-mono text-slate-300 break-all select-all">
                {sharedRedirectUri}
              </div>
            </div>

            {/* Dev Redirect URI */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Третий URL через «+» (Dev редактор):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(devRedirectUri, 'redirect_dev')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition flex items-center space-x-1"
                >
                  {copiedKey === 'redirect_dev' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/70 text-[11px] font-mono text-slate-300 break-all select-all">
                {devRedirectUri}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 <b>Совет:</b> Добавьте все 3 адреса через кнопку <b>«+»</b> в Яндекс. Тогда вход будет работать на боевом сайте и в любых ссылках предпросмотра!
            </p>
          </div>

          {/* Suggest Hostname Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                2. Поле «Suggest Hostname»
              </span>
            </div>

            {/* Custom Domain Hostname santehpro.info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-400">Собственный домен (Главный):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(domainOrigin, 'host_domain')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition flex items-center space-x-1"
                >
                  {copiedKey === 'host_domain' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-sky-900/60 text-xs font-mono text-sky-300 break-all select-all">
                {domainOrigin}
              </div>
            </div>

            {/* Custom Domain Hostname www.santehpro.info */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">С приставкой www:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(domainWwwOrigin, 'host_domain_www')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition flex items-center space-x-1"
                >
                  {copiedKey === 'host_domain_www' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/70 text-[11px] font-mono text-slate-300 break-all select-all">
                {domainWwwOrigin}
              </div>
            </div>

            {/* Cloud Run Hostname */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Cloud Run хостинг:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(prodOrigin, 'host_prod')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition flex items-center space-x-1"
                >
                  {copiedKey === 'host_prod' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/70 text-xs font-mono text-slate-400 break-all select-all">
                {prodOrigin}
              </div>
            </div>

            {/* Preview Hostname */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Второй хост через «+» (Shared Preview):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(sharedOrigin, 'host_shared')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition flex items-center space-x-1"
                >
                  {copiedKey === 'host_shared' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/70 text-[11px] font-mono text-slate-300 break-all select-all">
                {sharedOrigin}
              </div>
            </div>

            {/* Dev Hostname */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Третий хост через «+» (Dev редактор):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(devOrigin, 'host_dev')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition flex items-center space-x-1"
                >
                  {copiedKey === 'host_dev' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/70 text-[11px] font-mono text-slate-300 break-all select-all">
                {devOrigin}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Хосты страниц, на которых располагается кнопка «Войти с Яндекс ID» (с протоколом <code>https://</code>).
            </p>
          </div>
        </div>
      </div>

      {/* QUICK STEP-BY-STEP GUIDE */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Краткая инструкция по 4 шагам создания в Яндекс</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold text-[10px]">ШАГ 1</span>
            <p className="font-bold text-white">Название сервиса</p>
            <p className="text-slate-400 text-[11px]">
              Укажите название, например: <b>«СантехПро»</b> или <b>«Сервис СантехПро»</b>.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1 shadow-sm">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">ШАГ 2 (Текущий)</span>
            <p className="font-bold text-white">Платформы</p>
            <p className="text-slate-300 text-[11px]">
              Отметьте <b>«Веб-сервисы»</b>, вставьте скопированные выше <b>Redirect URI</b> и <b>Suggest Hostname</b> и нажмите <b>«+»</b>.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold text-[10px]">ШАГ 3</span>
            <p className="font-bold text-white">Доступы (Права)</p>
            <p className="text-slate-400 text-[11px]">
              В блоке «Яндекс ID» отметьте галочками: <b>Доступ к адресу электронной почты</b>, <b>Доступ к имени и фамилии</b> и <b>Портрет пользователя</b>.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold text-[10px]">ШАГ 4</span>
            <p className="font-bold text-white">Получение ключей</p>
            <p className="text-slate-400 text-[11px]">
              Нажмите «Создать приложение». Скопируйте <b>ClientID</b> и <b>Пароль (Client Secret)</b> и вставьте их в форму ниже.
            </p>
          </div>
        </div>
      </div>

      {/* FORM: CLIENT ID & CLIENT SECRET */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Ключи доступа Яндекс ID для сайта</h3>
          </div>
          <span className="text-xs text-slate-400">Сохраняются в защищённом хранилище</span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Client ID (ID приложения) *</span>
                <span className="text-[10px] text-slate-500 lowercase">например: 8a4b7...</span>
              </label>
              <input
                type="text"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Вставьте Client ID из кабинета Яндекс"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Client Secret */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Client Secret (Пароль приложения) *</span>
                {status?.hasSecret && (
                  <span className="text-[10px] text-emerald-400 font-semibold lowercase">
                    уже сохранён ({status.maskedSecret})
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder={status?.hasSecret ? 'Введите новый пароль для замены' : 'Вставьте Client Secret'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-red-500 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="yandexEnabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="yandexEnabled" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Включить авторизацию через Яндекс ID для всех пользователей
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={fetchConfig}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Обновить статус</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-lg shadow-red-600/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{saving ? 'Сохранение...' : 'Сохранить ключи Яндекс ID'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
