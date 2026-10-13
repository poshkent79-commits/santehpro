import React, { useState, useEffect } from 'react';
import {
  Mail,
  Server,
  Key,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  HelpCircle,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  Copy,
  ListChecks,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface SmtpStatus {
  configured: boolean;
  enabled: boolean;
  source: 'file' | 'env' | 'none';
  host: string | null;
  port: number | null;
  secure: boolean;
  user: string | null;
  hasPassword: boolean;
  fromName: string | null;
  fromEmail: string | null;
  adminAlertEmail: string | null;
  recentLogs?: Array<{
    id: string;
    timestamp: string;
    to: string;
    subject: string;
    status: 'sent' | 'simulated' | 'failed';
    simulated: boolean;
    error?: string;
    messageId?: string;
  }>;
}

export const SmtpSettingsTab: React.FC = () => {
  const [status, setStatus] = useState<SmtpStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
    hint?: string;
    provider?: string;
    solutionUrl?: string;
    solutionUrlLabel?: string;
    additionalUrl?: string;
    additionalUrlLabel?: string;
    steps?: string[];
  } | null>(null);

  // Guide accordion & selected tab
  const [showGuide, setShowGuide] = useState(false);
  const [guideTab, setGuideTab] = useState<'yandex' | 'mailru' | 'gmail' | 'timeweb' | 'beget'>('yandex');

  // Form state
  const [host, setHost] = useState('');
  const [port, setPort] = useState(465);
  const [secure, setSecure] = useState(true);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [fromName, setFromName] = useState('Сервис СантехПро');
  const [fromEmail, setFromEmail] = useState('');
  const [adminAlertEmail, setAdminAlertEmail] = useState('support@santehpro.info');
  const [enabled, setEnabled] = useState(true);
  const [testEmail, setTestEmail] = useState('support@santehpro.info');
  const [copyTimewebNotice, setCopyTimewebNotice] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/smtp');
      if (!res.ok) throw new Error(`Ошибка загрузки: ${res.statusText}`);
      const data: SmtpStatus = await res.json();
      setStatus(data);

      if (data.host) setHost(data.host);
      if (data.port) setPort(data.port);
      if (data.secure !== undefined) setSecure(data.secure);
      if (data.user) {
        setUser(data.user);
      }
      if (data.fromName) setFromName(data.fromName);
      if (data.fromEmail) setFromEmail(data.fromEmail);
      if (data.adminAlertEmail) {
        setAdminAlertEmail(data.adminAlertEmail);
        setTestEmail(data.adminAlertEmail);
      } else if (!testEmail) {
        setTestEmail(data.user || 'support@santehpro.info');
      }
      if (data.enabled !== undefined) setEnabled(data.enabled);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Не удалось загрузить настройки SMTP' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleApplyPreset = (preset: 'timeweb' | 'beget' | 'regru' | 'yandex' | 'mailru' | 'gmail587' | 'gmail465') => {
    if (preset === 'timeweb') {
      setHost('smtp.timeweb.ru');
      setPort(465);
      setSecure(true);
      if (!user) setUser('support@santehpro.info');
      if (!fromEmail) setFromEmail('support@santehpro.info');
    } else if (preset === 'beget') {
      setHost('smtp.beget.com');
      setPort(465);
      setSecure(true);
      if (!user) setUser('support@santehpro.info');
      if (!fromEmail) setFromEmail('support@santehpro.info');
    } else if (preset === 'regru') {
      setHost('mail.hosting.reg.ru');
      setPort(465);
      setSecure(true);
      if (!user) setUser('support@santehpro.info');
      if (!fromEmail) setFromEmail('support@santehpro.info');
    } else if (preset === 'yandex') {
      setHost('smtp.yandex.ru');
      setPort(465);
      setSecure(true);
      if (!fromEmail && user) setFromEmail(user);
    } else if (preset === 'mailru') {
      setHost('smtp.mail.ru');
      setPort(465);
      setSecure(true);
      if (!fromEmail && user) setFromEmail(user);
    } else if (preset === 'gmail587') {
      setHost('smtp.gmail.com');
      setPort(587);
      setSecure(false);
      if (!fromEmail && user) setFromEmail(user);
    } else if (preset === 'gmail465') {
      setHost('smtp.gmail.com');
      setPort(465);
      setSecure(true);
      if (!fromEmail && user) setFromEmail(user);
    }
    setNotification({
      type: 'success',
      message: `Применены параметры для ${preset.toUpperCase()}. Введите логин и пароль почтового ящика на хостинге и сохраните настройки.`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSetupCorporateAddress = () => {
    setUser('support@santehpro.info');
    setFromEmail('support@santehpro.info');
    setFromName('Сервис СантехПро');
    setAdminAlertEmail('support@santehpro.info');
    setTestEmail('support@santehpro.info');
    if (!host) {
      setHost('smtp.timeweb.ru');
      setPort(465);
      setSecure(true);
    }
    setNotification({
      type: 'success',
      message: 'Корпоративный адрес support@santehpro.info подставлен во все поля отправителя и уведомлений!',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setNotification(null);

      const res = await fetch('/api/admin/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: host.trim(),
          port: Number(port),
          secure,
          user: user.trim(),
          pass: pass ? pass.trim() : undefined, // if empty and already configured, keep existing
          fromName: fromName.trim(),
          fromEmail: fromEmail.trim() || user.trim() || 'support@santehpro.info',
          adminAlertEmail: adminAlertEmail.trim() || 'support@santehpro.info',
          enabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось сохранить настройки');

      setNotification({ type: 'success', message: 'Настройки почтового сервера успешно сохранены!' });
      setPass(''); // Clear sensitive password input
      await fetchStatus();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Ошибка сохранения' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    const recipient = testEmail.trim() || user.trim();
    if (!recipient) {
      setNotification({ type: 'error', message: 'Укажите e-mail адрес для отправки тестового письма' });
      return;
    }

    if (!pass.trim() && !status?.hasPassword) {
      setNotification({
        type: 'error',
        message: 'Пожалуйста, введите пароль приложения в поле «Пароль приложения» перед отправкой тестового письма.',
      });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      setNotification(null);

      const res = await fetch('/api/admin/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: recipient,
          customConfig: {
            host: host.trim(),
            port: Number(port),
            secure,
            user: user.trim(),
            pass: pass.trim() ? pass.trim() : undefined,
            fromName: fromName.trim(),
            fromEmail: fromEmail.trim() || user.trim() || 'support@santehpro.info',
            adminAlertEmail: adminAlertEmail.trim() || 'support@santehpro.info',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setTestResult({
          success: false,
          message: data.message || 'Ошибка отправки тестового письма',
          details: data.details,
          hint: data.hint,
          provider: data.provider,
          solutionUrl: data.solutionUrl,
          solutionUrlLabel: data.solutionUrlLabel,
          additionalUrl: data.additionalUrl,
          additionalUrlLabel: data.additionalUrlLabel,
          steps: data.steps,
        });
      } else {
        setTestResult({
          success: true,
          message: data.message || 'Тестовое письмо успешно доставлено в почтовый ящик!',
          details: data.details,
          hint: data.hint,
        });
        await fetchStatus();
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Сетевая ошибка при проверке подключения',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Настройки почтового сервера (SMTP)</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Настройка реальной отправки проверочных кодов для восстановления пароля и сервисных уведомлений на e-mail пользователей.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={fetchStatus}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start space-x-3 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{notification.message}</div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* STATUS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Card 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-semibold mb-2">Статус подключения</div>
          <div className="flex items-center space-x-3">
            <div
              className={`w-3.5 h-3.5 rounded-full animate-pulse ${
                status?.configured && status?.enabled ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-amber-500 ring-4 ring-amber-500/20'
              }`}
            />
            <div className="text-base font-bold text-white">
              {status?.configured && status?.enabled ? 'SMTP активен' : 'Тестовый режим (Демо)'}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {status?.configured && status?.enabled
              ? `Письма доставляются через ${status.host}`
              : 'Коды восстановления пароля безопасно отображаются в форме на экране'}
          </p>
        </div>

        {/* Status Card 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-semibold mb-2">Почтовый ящик отправки</div>
          <div className="text-base font-bold text-cyan-300 truncate font-mono">
            {status?.user || 'Не указан'}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Отправитель: <span className="text-white font-medium">{status?.fromName || 'Сервис СантехПро'}</span>
          </p>
        </div>

        {/* Status Card 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-semibold mb-2">Источник конфигурации</div>
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-base font-bold text-white">
              {status?.source === 'file'
                ? 'Файл настроек (.data)'
                : status?.source === 'env'
                ? 'Переменные окружения (.env)'
                : 'По умолчанию'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {status?.hasPassword ? 'Пароль сохранен и защищен' : 'Пароль не задан'}
          </p>
        </div>
      </div>

      {/* CORPORATE EMAIL FAST SETUP BANNER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900/90 to-blue-950/60 border border-sky-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sky-300 font-bold text-sm">
            <Mail className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Корпоративная почта: support@santehpro.info</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Официальный адрес
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Единая точка входа для платформы: используется для отправки кодов сброса паролей пользователям и приёма всех уведомлений администратору (заявки новых мастеров, повторная модерация, тикеты поддержки).
          </p>
        </div>

        <button
          type="button"
          onClick={handleSetupCorporateAddress}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/25 transition flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Подставить support@santehpro.info</span>
        </button>
      </div>

      {/* QUICK PRESETS */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>Быстрая настройка почтового сервера хостинга (в 1 клик):</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => handleApplyPreset('timeweb')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-cyan-500/50 transition flex items-center space-x-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Хостинг Timeweb (smtp.timeweb.ru:465)</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('beget')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-emerald-500/50 transition flex items-center space-x-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Хостинг Beget (smtp.beget.com:465)</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('regru')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-indigo-500/50 transition flex items-center space-x-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
            <span>Хостинг Reg.ru (mail.hosting.reg.ru:465)</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('yandex')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-yellow-500/50 transition flex items-center space-x-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Яндекс 360 / Яндекс Домен (smtp.yandex.ru:465)</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('mailru')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-blue-500/50 transition flex items-center space-x-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>VK WorkMail / Mail.ru (smtp.mail.ru:465)</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('gmail587')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 border border-slate-700 transition flex items-center space-x-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span>Gmail (smtp.gmail.com:587)</span>
          </button>
        </div>
      </div>

      {/* TIMEWEB CLOUD PORT 465/587 BLOCK ALERT & UNLOCK GUIDE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-200 space-y-3 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2 font-bold text-amber-300 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Почему возникает ошибка ETIMEDOUT (Connection timeout) на Timeweb Cloud?</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            Политика хостинга
          </span>
        </div>

        <p className="text-slate-200 leading-relaxed">
          На виртуальных облачных серверах <strong>Timeweb Cloud</strong> (VDS/VPS) по умолчанию <strong>заблокированы исходящие почтовые порты (25, 465, 587)</strong> для защиты от спама. Из-за этой блокировки хостинга сервер не может установить TCP-соединение ни с Яндексом, ни с Gmail.
        </p>

        <div className="p-3.5 bg-slate-950/90 rounded-xl border border-amber-500/30 space-y-2">
          <div className="font-semibold text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Как разблокировать за 5 минут:</span>
            <button
              type="button"
              onClick={() => {
                const text = `Здравствуйте! Прошу разблокировать исходящие почтовые порты (465 и 587) для моего облачного сервера (домен: santehpro.info), чтобы сайт мог отправлять системные сервисные уведомления и сброс паролей через SMTP Яндекс/Gmail. Спам рассылаться не будет.`;
                navigator.clipboard.writeText(text);
                setCopyTimewebNotice(true);
                setTimeout(() => setCopyTimewebNotice(false), 3000);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer self-start sm:self-auto shadow-md"
            >
              {copyTimewebNotice ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copyTimewebNotice ? 'Текст запроса скопирован!' : 'Скопировать запрос в поддержку Timeweb'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Перейдите в панель <a href="https://timeweb.cloud" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-semibold">Timeweb Cloud</a> ➔ раздел <strong>«Поддержка» (Тикеты)</strong> ➔ создайте обращение с темой «Разблокировка портов SMTP» и вставьте этот скопированный текст. Поддержка Timeweb бесплатно разблокирует порты за 5–15 минут, и почта сразу начнёт отправляться!
          </p>
        </div>
      </div>

      {/* INTERACTIVE STEP-BY-STEP EMAIL SETUP & ERROR 535 GUIDE */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Инструкция: как получить «Пароль приложения» и исправить «Ошибку при подключении» (535)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Важно
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Пошаговые действия для Яндекс Почты, Mail.ru, Gmail и Timeweb — разбор причин ошибки авторизации.
              </p>
            </div>
          </div>
          <div className="text-slate-400 pl-3">
            {showGuide ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showGuide && (
          <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/60 space-y-5 animate-in fade-in">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
              {[
                { id: 'yandex', label: 'Яндекс Почта / Яндекс 360' },
                { id: 'mailru', label: 'VK / Mail.ru' },
                { id: 'gmail', label: 'Google / Gmail' },
                { id: 'timeweb', label: 'Хостинг Timeweb' },
                { id: 'beget', label: 'Beget / Reg.ru' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGuideTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    guideTab === tab.id
                      ? 'bg-slate-800 text-white border-cyan-500 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Yandex */}
            {guideTab === 'yandex' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-200 leading-relaxed">
                  <strong>Почему возникает «Ошибка 535 — Incorrect authentication data» в Яндекс?</strong><br />
                  Яндекс полностью запретил авторизацию по обычному паролю от аккаунта для внешних программ. Чтобы почта отправлялась, нужно выполнить 2 простых шага:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                      <span>Создать пароль приложения в Яндекс ID</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Перейдите в Яндекс ID в раздел паролей приложений. Выберите тип <strong>«Почта»</strong>, введите любое имя (например, <em>СантехПро</em>) и нажмите «Создать».
                    </p>
                    <a
                      href="https://id.yandex.ru/security/app-passwords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs transition"
                    >
                      <span>Открыть id.yandex.ru/security/app-passwords</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                      <span>Разрешить доступ по IMAP в Яндекс Почте</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Без этой галочки Яндекс блокирует подключение даже с паролем приложения! Откройте mail.yandex.ru → Шестерёнка → Все настройки → Почтовые программы → поставьте галочку <strong>«С сервера по протоколу IMAP»</strong>.
                    </p>
                    <a
                      href="https://mail.yandex.ru/#setup/client"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
                    >
                      <span>Настройки почтовых программ Яндекс</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-200">Параметры для ввода в форму:</div>
                  <div>• <strong>Хост:</strong> <code>smtp.yandex.ru</code> | <strong>Порт:</strong> <code>465</code> (галочка SSL включена)</div>
                  <div>• <strong>Логин:</strong> обязательно ПОЛНЫЙ email (например, <code>poshkent79@yandex.ru</code> или <code>support@santehpro.info</code>)</div>
                  <div>• <strong>Пароль:</strong> 16-значный пароль приложения из Шага 1</div>
                </div>
              </div>
            )}

            {/* Tab: Mail.ru */}
            {guideTab === 'mailru' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-200 leading-relaxed">
                  <strong>Для Mail.ru (VK WorkMail / @mail.ru / @bk.ru / @inbox.ru):</strong><br />
                  Mail.ru не позволяет использовать основной пароль от ящика для SMTP.
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-black text-xs flex items-center justify-center">1</span>
                    <span>Создать «Пароль для внешних приложений»</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Перейдите в личный кабинет Mail.ru → раздел «Пароль и безопасность» → «Пароли для внешних приложений». Нажмите «Добавить», введите имя <em>СантехПро</em> и скопируйте созданный пароль.
                  </p>
                  <a
                    href="https://account.mail.ru/security/mailer-passwords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                  >
                    <span>Открыть account.mail.ru/security/mailer-passwords</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div>• <strong>Хост:</strong> <code>smtp.mail.ru</code> | <strong>Порт:</strong> <code>465</code> (SSL включен)</div>
                  <div>• <strong>Логин:</strong> полный адрес (с <code>@mail.ru</code>, <code>@bk.ru</code> и т.д.)</div>
                </div>
              </div>
            )}

            {/* Tab: Gmail */}
            {guideTab === 'gmail' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 leading-relaxed">
                  <strong>Для Google / Gmail:</strong><br />
                  Google блокирует обычные пароли и требует 2-этапную аутентификацию + 16-значный «Пароль приложений».
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white font-black text-xs flex items-center justify-center">1</span>
                    <span>Получить 16-значный пароль приложений</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Убедитесь, что в Google включена двухэтапная аутентификация. Затем перейдите по ссылке ниже, выберите приложение «Почта» и скопируйте пароль из 16 букв (без пробелов).
                  </p>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
                  >
                    <span>Открыть myaccount.google.com/apppasswords</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div>• <strong>Хост:</strong> <code>smtp.gmail.com</code> | <strong>Порт:</strong> <code>465</code> (SSL) или <code>587</code> (без SSL)</div>
                  <div>• <strong>Логин:</strong> ваш адрес <code>...@gmail.com</code></div>
                </div>
              </div>
            )}

            {/* Tab: Timeweb */}
            {guideTab === 'timeweb' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-200 leading-relaxed">
                  <strong>Для хостинга Timeweb:</strong><br />
                  Пароль — это пароль ящика из панели Timeweb («Почта» → «Почтовые ящики»), а не пароль от входа в личный кабинет Timeweb!
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                    <span>Проверить почтовый ящик в панели Timeweb</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Войдите в панель Timeweb → «Почта» → проверьте созданный ящик (например, <code>support@santehpro.info</code>). Если не помните пароль ящика, нажмите «Сменить пароль».
                  </p>
                  <a
                    href="https://timeweb.cloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                  >
                    <span>Панель управления Timeweb</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div>• <strong>Хост:</strong> <code>smtp.timeweb.ru</code> | <strong>Порт:</strong> <code>465</code> (SSL включен)</div>
                  <div>• <strong>Логин:</strong> полный адрес ящика (например, <code>support@santehpro.info</code>)</div>
                </div>
              </div>
            )}

            {/* Tab: Beget */}
            {guideTab === 'beget' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="font-bold text-white">Для хостинга Beget / Reg.ru:</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Создайте почтовый ящик в панели управления хостингом (раздел «Почта»). Логином является полный email ящика, паролем — пароль, заданный при создании ящика.
                  </p>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>• <strong>Beget:</strong> <code>smtp.beget.com:465</code> (SSL)</div>
                    <div>• <strong>Reg.ru:</strong> <code>mail.hosting.reg.ru:465</code> (SSL)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAIN CONFIGURATION FORM */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Параметры SMTP подключения</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Host */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              SMTP Сервер (Хост) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="smtp.yandex.ru или smtp.mail.ru"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
            />
          </div>

          {/* Port & Secure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Порт <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="465"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2 cursor-pointer pb-3 text-xs text-slate-300 font-semibold select-none">
                <input
                  type="checkbox"
                  checked={secure}
                  onChange={(e) => setSecure(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>SSL / TLS (465)</span>
              </label>
            </div>
          </div>

          {/* User / Login */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Логин / E-mail аккаунта <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="example@yandex.ru"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Пароль приложения (App Password) <span className="text-rose-400">*</span>
              </label>
              {status?.hasPassword && (
                <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Пароль сохранен</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={status?.hasPassword ? '••••••••••••  (введите для замены)' : 'Введите 16-значный пароль приложения'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Dynamic Provider Password Helpers */}
            {(host.includes('yandex') || user.includes('yandex') || user.includes('@ya.ru')) && (
              <div className="mt-2.5 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <strong className="text-yellow-300 font-semibold block flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4 text-yellow-400" />
                      <span>Для Яндекс Почты / Яндекс 360 требуется «Пароль приложения» (ошибка 535)</span>
                    </strong>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Обычный пароль от входа в Яндекс отклоняется SMTP-сервером (код 535). Выпустите 16-значный пароль типа «Почта» в Яндекс ID и включите IMAP в настройках почтового ящика.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <a
                    href="https://id.yandex.ru/security/app-passwords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-[11px] inline-flex items-center space-x-1 transition shadow-sm"
                  >
                    <span>1. Создать пароль в Яндекс ID</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://mail.yandex.ru/#setup/client"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-[11px] inline-flex items-center space-x-1 transition"
                  >
                    <span>2. Включить IMAP в Почте</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {(host.includes('mail.ru') || user.includes('mail.ru') || user.includes('@inbox.ru') || user.includes('@bk.ru') || user.includes('@list.ru')) && (
              <div className="mt-2.5 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-200 space-y-2">
                <div className="space-y-1">
                  <strong className="text-blue-300 font-semibold block flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-blue-400" />
                    <span>Для Mail.ru требуется «Пароль для внешних приложений»</span>
                  </strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Mail.ru запрещает отправку по обычному паролю. Создайте пароль для внешнего приложения в настройках безопасности.
                  </p>
                </div>
                <a
                  href="https://account.mail.ru/security/mailer-passwords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] inline-flex items-center space-x-1 transition shadow-sm"
                >
                  <span>Создать пароль в Mail.ru</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {(host.includes('gmail') || user.includes('gmail')) && (
              <div className="mt-2.5 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-2">
                <div className="space-y-1">
                  <strong className="text-amber-300 font-semibold block flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Для Gmail требуется 16-значный «Пароль приложений»</span>
                  </strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Google блокирует обычный пароль аккаунта. Включите 2-этапную аутентификацию и сгенерируйте пароль приложений.
                  </p>
                </div>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] inline-flex items-center space-x-1 transition shadow-sm"
                >
                  <span>Создать пароль в Google</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {host.includes('timeweb') && (
              <div className="mt-2.5 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 space-y-2">
                <div className="space-y-1">
                  <strong className="text-cyan-300 font-semibold block flex items-center space-x-1.5">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span>Для Timeweb: используйте пароль почтового ящика</span>
                  </strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Логин должен быть полным адресом (например, <code>support@santehpro.info</code>), а пароль — паролем ящика из панели Timeweb («Почта» → «Почтовые ящики»), а не от входа в личный кабинет Timeweb.
                  </p>
                </div>
                <a
                  href="https://timeweb.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] inline-flex items-center space-x-1 transition shadow-sm"
                >
                  <span>Панель управления Timeweb</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* From Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Имя отправителя в письме
            </label>
            <input
              type="text"
              placeholder="Сервис СантехПро"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
            />
          </div>

          {/* From Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail адрес отправителя
            </label>
            <input
              type="email"
              placeholder={user || 'support@santehpro.info'}
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
            />
          </div>

          {/* Admin Alert Recipient Email */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Email для системных уведомлений администратора <span className="text-sky-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAdminAlertEmail('support@santehpro.info')}
                className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
              >
                Использовать support@santehpro.info
              </button>
            </div>
            <input
              type="email"
              required
              placeholder="support@santehpro.info"
              value={adminAlertEmail}
              onChange={(e) => setAdminAlertEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Сюда моментально поступают все заявки новых мастеров на модерацию, уведомления об изменении анкет и обращения в службу заботы.
            </p>
          </div>
        </div>

        {/* Enabled Toggle & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold text-slate-300 select-none">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
            />
            <span>Включить реальную отправку писем через данный SMTP</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Сохранение...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Сохранить настройки SMTP</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* TEST EMAIL SECTION */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Send className="w-4 h-4 text-emerald-400" />
          <span>Проверка отправки тестового письма</span>
        </h3>
        <p className="text-xs text-slate-400">
          Отправьте тестовое сообщение на любой почтовый ящик, чтобы убедиться, что логин, пароль и настройки порта верны, и почта доходит.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Адрес для тестового письма (например, support@santehpro.info)"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
          />
          <button
            type="button"
            disabled={testing}
            onClick={handleTestConnection}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow flex items-center justify-center space-x-2 shrink-0"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Проверка подключения...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Отправить тестовое письмо</span>
              </>
            )}
          </button>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div
            className={`p-4 sm:p-5 rounded-2xl text-xs space-y-3.5 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="flex items-start space-x-2.5 font-bold text-sm">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="block leading-snug">{testResult.message}</span>
              </div>
            </div>

            {testResult.hint && (
              <div className="p-3.5 bg-slate-950/90 rounded-xl border border-amber-500/40 text-amber-200 text-xs space-y-2.5">
                <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Причина ошибки и быстрое решение:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">{testResult.hint}</p>

                {(testResult.solutionUrl || testResult.additionalUrl) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {testResult.solutionUrl && (
                      <a
                        href={testResult.solutionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center space-x-1.5 transition shadow"
                      >
                        <span>{testResult.solutionUrlLabel || 'Создать пароль приложения'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {testResult.additionalUrl && (
                      <a
                        href={testResult.additionalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs inline-flex items-center space-x-1.5 transition"
                      >
                        <span>{testResult.additionalUrlLabel || 'Настройки почтовых программ'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {testResult.steps && testResult.steps.length > 0 && (
              <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 text-slate-300 text-xs space-y-2.5">
                <div className="font-bold text-sky-400 flex items-center space-x-1.5">
                  <ListChecks className="w-4 h-4 shrink-0" />
                  <span>Пошаговая инструкция для устранения ошибки авторизации (535):</span>
                </div>
                <div className="space-y-2 pl-0.5">
                  {testResult.steps.map((st, i) => (
                    <div key={i} className="text-slate-300 leading-relaxed text-[11px] sm:text-xs flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{st.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!testResult.success && !showGuide && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuide(true);
                    if (host.includes('yandex') || user.includes('yandex') || user.includes('@ya.ru')) {
                      setGuideTab('yandex');
                    } else if (host.includes('mail.ru') || user.includes('mail.ru')) {
                      setGuideTab('mailru');
                    } else if (host.includes('timeweb')) {
                      setGuideTab('timeweb');
                    } else if (host.includes('gmail')) {
                      setGuideTab('gmail');
                    }
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Открыть полную пошаговую инструкцию по настройке для вашего сервиса</span>
                </button>
              </div>
            )}

            {testResult.details && (
              <div className="space-y-1 pt-1">
                <div className="text-[11px] text-slate-400 font-medium">Технические подробности ответа сервера:</div>
                <pre className="p-3 bg-slate-950/80 rounded-lg text-[10px] font-mono overflow-x-auto text-slate-300 border border-slate-800">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RECENT EMAIL AUDIT LOGS */}
      {status?.recentLogs && status.recentLogs.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Журнал отправки писем</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Последние {status.recentLogs.length} событий
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Время</th>
                  <th className="py-2.5 px-3">Получатель</th>
                  <th className="py-2.5 px-3">Тема</th>
                  <th className="py-2.5 px-3">Статус</th>
                  <th className="py-2.5 px-3">Детали</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {status.recentLogs.map((log, idx) => (
                  <tr key={log.id || `${log.timestamp}-${log.to}-${idx}`} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('ru-RU')}
                    </td>
                    <td className="py-2.5 px-3 text-white font-semibold">{log.to}</td>
                    <td className="py-2.5 px-3 text-slate-300 truncate max-w-xs">{log.subject}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {log.status === 'sent' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          Доставлено (SMTP)
                        </span>
                      ) : log.status === 'simulated' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          Симуляция (Демо)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                          Ошибка
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[10px] truncate max-w-xs">
                      {log.error ? (
                        <span className="text-rose-400">{log.error}</span>
                      ) : log.messageId ? (
                        <span className="text-slate-500">ID: {log.messageId}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
