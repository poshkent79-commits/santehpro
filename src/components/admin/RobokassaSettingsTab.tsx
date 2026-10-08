import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, Save, ExternalLink } from 'lucide-react';
import { RobokassaLogo } from '../common/PaymentLogos';

export const RobokassaSettingsTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [isTest, setIsTest] = useState(true);
  const [merchantLogin, setMerchantLogin] = useState('santehproinfo');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payment/robokassa/status');
      if (res.ok) {
        const data = await res.json();
        setEnabled(data.enabled !== false);
        setIsTest(Boolean(data.isTest));
        setMerchantLogin(data.merchantLogin || 'santehproinfo');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки статуса Robokassa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const payload: Record<string, any> = {
        enabled,
        isTest,
        merchantLogin,
      };
      if (password1.trim()) payload.password1 = password1.trim();
      if (password2.trim()) payload.password2 = password2.trim();

      const res = await fetch('/api/payment/robokassa/config', {
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
      setPassword1('');
      setPassword2('');
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="bg-white rounded-2xl px-3 py-1.5 shadow-md border border-slate-200 flex items-center justify-center shrink-0">
            <RobokassaLogo className="h-7 sm:h-8" theme="light" showDescriptor={true} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Онлайн-касса Robokassa</span>
              {isTest ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  Демо / Тестовый режим
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Боевой режим (Приём реальных оплат)
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Управление статусом интеграции, переключение режимов (тест / боевой) и параметры магазина
            </p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="self-start sm:self-auto p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Обновить статус"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Настройки успешно обновлены и вступили в силу!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Toggle Mode */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-sm font-semibold text-white">Режим работы шлюза</span>
            <p className="text-xs text-slate-400 mt-0.5">
              В тестовом режиме списание реальных денег не происходит (используется для проверки связи).
              После одобрения Робокассой переключите в «Боевой режим».
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setIsTest(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isTest
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Тестовый (Демо)
            </button>
            <button
              type="button"
              onClick={() => setIsTest(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                !isTest
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Боевой (Реальные деньги)
            </button>
          </div>
        </div>

        {/* Enabled checkbox */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div>
            <span className="text-sm font-semibold text-white">Приём платежей включён</span>
            <p className="text-xs text-slate-400 mt-0.5">
              Показывать кнопку онлайн-оплаты через Robokassa в модальном окне «Поддержать проект»
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Merchant Login */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Идентификатор магазина (MerchantLogin)
          </label>
          <input
            type="text"
            value={merchantLogin}
            onChange={(e) => setMerchantLogin(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
            placeholder="santehproinfo"
            required
          />
        </div>

        {/* Change Passwords (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Обновить Пароль #1 (боевой)
            </label>
            <input
              type="password"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Оставьте пустым, если не менялся"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Обновить Пароль #2 (боевой)
            </label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Оставьте пустым, если не менялся"
            />
          </div>
        </div>

        {/* Quick Links to Robokassa */}
        <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Технические URL, настроенные в Robokassa:
          </div>
          <div className="font-mono text-[11px] text-slate-400 space-y-0.5">
            <div><strong className="text-slate-300">Result URL:</strong> https://santehpro.info/api/payment/robokassa/result (POST)</div>
            <div><strong className="text-slate-300">Success URL:</strong> https://santehpro.info/payment/success (GET)</div>
            <div><strong className="text-slate-300">Fail URL:</strong> https://santehpro.info/payment/fail (GET)</div>
          </div>
          <div className="pt-1">
            <a
              href="https://partner.robokassa.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
            >
              Перейти в личный кабинет Robokassa <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Сохранить настройки
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
