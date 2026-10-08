// src/components/admin/YooKassaSettingsTab.tsx
import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Save, ExternalLink, Copy, Check, QrCode } from 'lucide-react';
import { YooKassaLogo } from '../common/PaymentLogos';

export const YooKassaSettingsTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [shopId, setShopId] = useState('1486303');
  const [secretKey, setSecretKey] = useState('');
  const [returnUrl, setReturnUrl] = useState('https://santehpro.info/?payment=success');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [testAmount, setTestAmount] = useState('10');
  const [testingPayment, setTestingPayment] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const webhookUrl = 'https://santehpro.info/api/payment/yookassa/webhook';

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payment/yookassa/status');
      if (res.ok) {
        const data = await res.json();
        setEnabled(data.enabled !== false);
        if (data.shopId) setShopId(data.shopId);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки статуса ЮKassa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const payload: Record<string, any> = {
        enabled,
        shopId: shopId.trim(),
        returnUrl: returnUrl.trim(),
      };
      if (secretKey.trim()) {
        payload.secretKey = secretKey.trim();
      }

      const res = await fetch('/api/payment/yookassa/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Не удалось сохранить настройки');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleTestCreatePayment = async () => {
    setTestingPayment(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/payment/yookassa/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(testAmount) || 10,
          description: 'Тестовый платеж СантехПро через ЮKassa',
          type: 'donation',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ошибка вызова ЮKassa API');
      }
      setTestResult(`✓ Платеж успешно создан в ЮKassa! Ссылка: ${data.paymentUrl}`);
      // Open in new tab for verification
      window.open(data.paymentUrl, '_blank');
    } catch (err: any) {
      setTestResult(`❌ Ошибка: ${err.message}`);
    } finally {
      setTestingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-cyan-950/80 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="bg-white rounded-2xl px-3.5 py-2 shadow-md border border-slate-200 flex items-center justify-center shrink-0">
            <YooKassaLogo className="h-7 sm:h-8" theme="light" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Официальный онлайн-эквайринг
              </span>
              <span className="text-xs text-slate-400">ООО НКО «ЮМани»</span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <span>Настройки интеграции ЮKassa</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Приём платежей на сайте <strong className="text-white">santehpro.info</strong> через банковские карты МИР, СБП (QR-код), SberPay, T-Pay и электронные кошельки.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={fetchStatus}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>
          <a
            href="https://yookassa.ru/my"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <span>Кабинет ЮKassa</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-white">Статус эквайринга</h3>
            <p className="text-xs text-slate-400">Включить или временно приостановить приём платежей</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            <span className="ml-3 text-xs font-bold text-slate-200">
              {enabled ? 'Включено' : 'Выключено'}
            </span>
          </label>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Настройки ЮKassa успешно сохранены и применены!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ShopID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Идентификатор магазина (ShopID) <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              placeholder="1486303"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              required
            />
            <span className="text-[11px] text-slate-500 block">
              Номер магазина в шапке личного кабинета ЮKassa
            </span>
          </div>

          {/* Secret Key */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Секретный ключ API (Secret Key) <span className="text-emerald-400">*</span>
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="••••••••••••••••••••••••••••••••••••••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 block">
              Оставьте пустым, чтобы использовать уже сохранённый live-ключ
            </span>
          </div>

          {/* Return URL */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-300">
              URL перенаправления после успешной оплаты (Return URL)
            </label>
            <input
              type="text"
              value={returnUrl}
              onChange={(e) => setReturnUrl(e.target.value)}
              placeholder="https://santehpro.info/?payment=success"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ключи хранятся в защищённом хранилище на сервере</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Сохранение...' : 'Сохранить настройки'}</span>
          </button>
        </div>
      </form>

      {/* Webhook Settings Helper Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">
              Настройка уведомлений в кабинете ЮKassa (HTTP-уведомления)
            </h3>
            <p className="text-xs text-slate-400">
              Необходимо для мгновенной фиксации платежей на сервере
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                URL для HTTP-уведомлений:
              </span>
              <code className="text-xs font-mono text-cyan-300 font-bold break-all">
                {webhookUrl}
              </code>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(webhookUrl, 'webhook')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copiedField === 'webhook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'webhook' ? 'Скопировано!' : 'Копировать URL'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-300 pt-2 border-t border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">Какие события отметить в ЮKassa:</div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
              <li><strong className="text-white">payment.succeeded</strong> — платёж успешно оплачен покупателем</li>
              <li><strong className="text-white">payment.canceled</strong> — платёж отменён</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Payment Sandbox Launcher */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-black text-white flex items-center space-x-2">
          <span>Тест создания ссылки на оплату</span>
        </h3>
        <p className="text-xs text-slate-400">
          Сгенерировать тестовый заказ через ЮKassa на 10 ₽ для проверки соединения и перехода на шлюз.
        </p>

        <div className="flex items-center gap-2 max-w-sm">
          <input
            type="number"
            min="1"
            value={testAmount}
            onChange={(e) => setTestAmount(e.target.value)}
            className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
          />
          <span className="text-xs text-slate-400">₽</span>
          <button
            type="button"
            onClick={handleTestCreatePayment}
            disabled={testingPayment}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{testingPayment ? 'Запрос в ЮKassa...' : 'Создать тестовый платёж'}</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-300 font-mono break-all border border-slate-800">
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
};
