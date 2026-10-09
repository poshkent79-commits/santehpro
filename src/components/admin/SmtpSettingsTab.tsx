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
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any; hint?: string } | null>(null);

  // Form state
  const [host, setHost] = useState('');
  const [port, setPort] = useState(465);
  const [secure, setSecure] = useState(true);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [fromName, setFromName] = useState('Сервис СантехПро');
  const [fromEmail, setFromEmail] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [testEmail, setTestEmail] = useState('');
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
        if (!testEmail) setTestEmail(data.user);
      }
      if (data.fromName) setFromName(data.fromName);
      if (data.fromEmail) setFromEmail(data.fromEmail);
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

  const handleApplyPreset = (preset: 'yandex' | 'mailru' | 'gmail587' | 'gmail465' | 'gmail') => {
    if (preset === 'yandex') {
      setHost('smtp.yandex.ru');
      setPort(465);
      setSecure(true);
      if (!fromEmail && user) setFromEmail(user);
    } else if (preset === 'mailru') {
      setHost('smtp.mail.ru');
      setPort(465);
      setSecure(true);
      if (!fromEmail && user) setFromEmail(user);
    } else if (preset === 'gmail587' || preset === 'gmail') {
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
      message: `Применены настройки для ${preset.toUpperCase()}. Введите ваш логин и пароль приложения и нажмите «Сохранить».`,
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
          fromEmail: fromEmail.trim() || user.trim(),
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
            fromEmail: fromEmail.trim() || user.trim(),
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

      {/* QUICK PRESETS */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="text-xs font-bold text-slate-300 mb-3 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Быстрая настройка провайдера (в 1 клик):</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => handleApplyPreset('yandex')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-yellow-500/50 transition flex items-center space-x-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Яндекс Почта (smtp.yandex.ru:465) — Рекомендуется для РФ</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('mailru')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-blue-500/50 transition flex items-center space-x-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Mail.ru (smtp.mail.ru:465)</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('gmail587')}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-xs font-semibold text-emerald-300 border border-emerald-500/40 transition flex items-center space-x-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Gmail (Порт 587 STARTTLS — для Timeweb VPS)</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('gmail465')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 border border-slate-700 transition flex items-center space-x-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span>Gmail (Порт 465 SSL)</span>
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

      {/* HOW-TO GUIDE BANNER */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-white">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Важно: используйте «Пароль приложения», а не обычный пароль от почты!</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          Современные почтовые службы (Яндекс, Mail.ru, Google) в целях безопасности блокируют вход сторонних программ по обычному паролю. Создайте специальный пароль приложения в личном кабинете вашего почтового сервиса:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
          <li>
            <strong className="text-slate-200">Яндекс:</strong> Яндекс ID → Безопасность → «Пароли приложений» → выберите тип «Почта».
          </li>
          <li>
            <strong className="text-slate-200">Mail.ru:</strong> Пароль и безопасность → «Пароли для внешних приложений» → «Добавить».
          </li>
          <li>
            <strong className="text-slate-200">Gmail:</strong> Управление аккаунтом Google → Безопасность → 2-этапная аутентификация → «Пароли приложений».
          </li>
        </ul>
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
            {(host.includes('gmail') || user.includes('gmail')) && (
              <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200/90 flex items-start justify-between gap-2">
                <div>
                  <strong className="text-amber-300 font-semibold block mb-0.5">⚠️ Внимание для пользователей Gmail:</strong>
                  Google блокирует обычный пароль от аккаунта. Требуется <strong>16-значный «Пароль приложений»</strong> (формата <code>abcd efgh ijkl mnop</code>).
                </div>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[10px] font-bold inline-flex items-center space-x-1 transition"
                >
                  <span>Получить</span>
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
              placeholder={user || 'noreply@santechpro.ru'}
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
            />
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
            placeholder="Адрес для тестового письма (например, poshkent79@gmail.com)"
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
            className={`p-4 rounded-xl text-xs space-y-2 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{testResult.message}</span>
            </div>

            {testResult.hint && (
              <div className="mt-2 p-3 bg-slate-950/90 rounded-xl border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>Подсказка по решению:</span>
                  </div>
                  <p className="text-slate-300">{testResult.hint}</p>
                </div>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center space-x-1.5 transition"
                >
                  <span>Создать пароль в Google</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {testResult.details && (
              <pre className="mt-2 p-3 bg-slate-950/80 rounded-lg text-[11px] font-mono overflow-x-auto text-slate-300 border border-slate-800">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
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
