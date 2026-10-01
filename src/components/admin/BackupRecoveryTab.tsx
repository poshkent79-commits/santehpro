import React, { useState, useEffect } from 'react';
import {
  Archive,
  Save,
  RotateCcw,
  Download,
  Upload,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  FileCheck,
  Phone,
  User,
  MapPin,
  Loader2,
  RefreshCw,
  Shield,
  Layers,
} from 'lucide-react';
import { PlumbingSpecialist } from '../../types';

interface BackupItem {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  label: string;
  counts: {
    specialists: number;
    users: number;
    requests: number;
    articles: number;
  };
}

interface BackupRecoveryTabProps {
  specialists?: PlumbingSpecialist[];
  onRefreshData?: () => void;
}

export const BackupRecoveryTab: React.FC<BackupRecoveryTabProps> = ({
  specialists = [],
  onRefreshData,
}) => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick Master Resurrect state
  const [masterPhone, setMasterPhone] = useState('');
  const [masterName, setMasterName] = useState('');
  const [masterCity, setMasterCity] = useState('');
  const [isResurrecting, setIsResurrecting] = useState(false);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch (e) {
      console.warn('Failed to fetch backups:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: `Ручной бэкап админа (${new Date().toLocaleTimeString('ru-RU')})` }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Полная резервная копия успешно создана и сохранена на сервере!' });
        fetchBackups();
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка создания резервной копии' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Сетевая ошибка при создании копии' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRestoreLatest = async (filename?: string) => {
    const target = filename || 'последней резервной копии';
    if (!window.confirm(`Вы уверены, что хотите восстановить данные из ${target}? Данные мастеров и заказов будут обновлены.`)) {
      return;
    }

    setIsActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: `${data.message} Всего мастеров в системе: ${data.restored?.totalSpecialists || 0}.`,
        });
        if (onRefreshData) onRefreshData();
        fetchBackups();
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка восстановления' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Ошибка восстановления из резервной копии' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResurrectMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPhone.trim()) {
      setMessage({ type: 'error', text: 'Пожалуйста, введите номер телефона мастера' });
      return;
    }

    setIsResurrecting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/backups/restore-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: masterPhone.trim(),
          name: masterName.trim() || undefined,
          city: masterCity.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: data.message || `Мастер успешно восстановлен и активирован в каталоге!`,
        });
        setMasterPhone('');
        setMasterName('');
        setMasterCity('');
        if (onRefreshData) onRefreshData();
        fetchBackups();
      } else {
        setMessage({ type: 'error', text: data.error || 'Не удалось восстановить мастера' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Ошибка восстановления мастера' });
    } finally {
      setIsResurrecting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsActionLoading(true);
    setMessage(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await fetch('/api/admin/backups/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: data.message || 'Резервная копия успешно загружена и восстановлена!',
        });
        if (onRefreshData) onRefreshData();
        fetchBackups();
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка загрузки резервной копии' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Не удалось прочитать файл резервной копии. Проверьте формат JSON.' });
    } finally {
      setIsActionLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Резервные копии и восстановление
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Активно
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                Защита данных от сбоев и обновлений. Автоматические точки восстановления сохраняют мастеров, сметы и заявки независимо от версий сайта.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleCreateBackup}
              disabled={isActionLoading}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer disabled:opacity-60"
            >
              {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Создать бэкап сейчас</span>
            </button>
            <button
              onClick={fetchBackups}
              disabled={isLoading}
              title="Обновить список"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Notification Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-start space-x-3 text-sm animate-in fade-in duration-200 border ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium leading-relaxed">{message.text}</div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Quick Emergency Master Resurrect Tool */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl relative">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-500/30">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-black text-white tracking-tight flex items-center space-x-2">
              <span>Экстренное восстановление анкеты мастера по номеру телефона</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                1 клик
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Если после обновления на сервере карточка мастера не отображается в каталоге или не открывается личный кабинет — введите номер телефона мастера:
            </p>
          </div>
        </div>

        <form onSubmit={handleResurrectMaster} className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4 relative">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Номер телефона мастера *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={masterPhone}
                onChange={(e) => setMasterPhone(e.target.value)}
                placeholder="+7 (924) 788-99-00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              ФИО мастера (необязательно)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={masterName}
                onChange={(e) => setMasterName(e.target.value)}
                placeholder="Иван Иванов"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Город мастера (необязательно)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={masterCity}
                onChange={(e) => setMasterCity(e.target.value)}
                placeholder="Владивосток"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isResurrecting}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-60"
            >
              {isResurrecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              <span>Восстановить</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Global Actions: Restore All & Download / Upload */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Restore from Latest */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-sm mb-1">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Восстановить всё из бэкапа</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Мгновенно восстанавливает всех мастеров и заявки из последней сохранённой точки на сервере.
            </p>
          </div>
          <button
            onClick={() => handleRestoreLatest()}
            disabled={isActionLoading || backups.length === 0}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 border border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Восстановить последнюю точку</span>
          </button>
        </div>

        {/* Export / Download */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-sm mb-1">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Скачать резервную копию</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Выгрузить полный JSON-файл со всеми мастерами и сметными настройками на свой компьютер или телефон.
            </p>
          </div>
          <a
            href="/api/admin/backups/download-latest"
            download
            className="mt-3 w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition text-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Скачать файл JSON</span>
          </a>
        </div>

        {/* Import / Upload */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-sm mb-1">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Загрузить бэкап с диска</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Загрузить сохранённый ранее файл `.json` для моментального переноса или восстановления.
            </p>
          </div>
          <label className="mt-3 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Выбрать JSON-файл</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 4. List of Backups on Server */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Archive className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white tracking-tight">
              Точки восстановления на сервере ({backups.length})
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Текущих мастеров в каталоге: <b className="text-emerald-400">{specialists.length}</b>
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Загрузка списка копий...</span>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Резервные копии ещё не созданы. Нажмите «Создать бэкап сейчас» выше, чтобы зафиксировать текущее состояние.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 overflow-x-auto">
            {backups.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const sizeKb = Math.round(item.sizeBytes / 1024);

              return (
                <div
                  key={item.id}
                  className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 transition"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white font-mono">{item.filename}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                          {sizeKb} КБ
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formattedDate}</span>
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">
                          Мастеров: {item.counts?.specialists ?? 0}
                        </span>
                        <span>•</span>
                        <span>Заявок: {item.counts?.requests ?? 0}</span>
                      </div>
                      {item.label && (
                        <p className="text-[11px] text-slate-500 mt-0.5 italic">{item.label}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleRestoreLatest(item.filename)}
                      disabled={isActionLoading}
                      className="py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Восстановить</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
