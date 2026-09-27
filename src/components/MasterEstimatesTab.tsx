import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Printer,
  Copy,
  Trash2,
  Edit2,
  Share2,
  Phone,
  MapPin,
  ShieldCheck,
  Package,
  Wrench,
  DollarSign,
  Sparkles,
  ExternalLink,
  Layers,
  FileSpreadsheet,
  Check,
  AlertCircle
} from 'lucide-react';
import { MasterPlumbingEstimate, PlumbingSpecialist, ServiceCallRequest } from '../types';
import { MasterEstimateBuilderModal } from './MasterEstimateBuilderModal';
import { ClientEstimateModal, getEstimateShareUrl } from './ClientEstimateModal';

interface MasterEstimatesTabProps {
  specialist: PlumbingSpecialist;
  serviceRequests?: ServiceCallRequest[];
  onOpenDirectChat?: (req: ServiceCallRequest) => void;
}

export const MasterEstimatesTab: React.FC<MasterEstimatesTabProps> = ({
  specialist,
  serviceRequests = [],
  onOpenDirectChat,
}) => {
  const [estimates, setEstimates] = useState<MasterPlumbingEstimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'completed'>('all');

  // Modals state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<MasterPlumbingEstimate | null>(null);
  const [selectedRequestForEstimate, setSelectedRequestForEstimate] = useState<ServiceCallRequest | null>(null);

  const [activePreviewEstimate, setActivePreviewEstimate] = useState<MasterPlumbingEstimate | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // LocalStorage key specific to this master or global
  const storageKey = `santehpro_master_estimates_${specialist.id}`;

  // Load estimates from server /api/estimates and merge with local
  const loadEstimates = async () => {
    setIsLoading(true);
    let loadedEstimates: MasterPlumbingEstimate[] = [];

    // 1. Try fetching from server
    try {
      const res = await fetch('/api/estimates');
      if (res.ok) {
        const serverRows = await res.json();
        if (Array.isArray(serverRows)) {
          serverRows.forEach((r: any) => {
            try {
              const parsed = typeof r.itemsJson === 'string' ? JSON.parse(r.itemsJson) : r.itemsJson;
              if (parsed && typeof parsed === 'object') {
                // If it's a master estimate
                if (parsed.specialistId === specialist.id || !parsed.specialistId) {
                  loadedEstimates.push({
                    id: r.id || parsed.id,
                    specialistId: parsed.specialistId || specialist.id,
                    specialistName: parsed.specialistName || specialist.name,
                    specialistPhone: parsed.specialistPhone || specialist.phone,
                    specialistCity: parsed.specialistCity || specialist.city,
                    clientName: parsed.clientName || 'Клиент',
                    clientPhone: parsed.clientPhone,
                    clientAddress: parsed.clientAddress,
                    objectType: parsed.objectType,
                    title: r.name || parsed.title || 'Смета на сантехработы',
                    items: Array.isArray(parsed.items) ? parsed.items : [],
                    worksTotal: Number(parsed.worksTotal) || Number(r.totalPrice) || 0,
                    materialsTotal: Number(parsed.materialsTotal) || 0,
                    discountType: parsed.discountType,
                    discountValue: parsed.discountValue,
                    discountAmount: parsed.discountAmount,
                    grandTotal: Number(parsed.grandTotal) || Number(r.totalPrice) || 0,
                    advancePayment: parsed.advancePayment,
                    remainingPayment: parsed.remainingPayment,
                    warrantyMonths: parsed.warrantyMonths ?? 24,
                    executionDays: parsed.executionDays || '1-2 рабочих дня',
                    paymentTerms: parsed.paymentTerms,
                    notes: parsed.notes,
                    status: parsed.status || 'draft',
                    serviceRequestId: parsed.serviceRequestId,
                    createdAt: r.createdAt || parsed.createdAt || new Date().toISOString(),
                    updatedAt: parsed.updatedAt,
                  });
                }
              }
            } catch (e) {
              // skip non-matching json
            }
          });
        }
      }
    } catch (err) {
      console.warn('Could not fetch server estimates, loading local fallback:', err);
    }

    // 2. Also check localStorage for any offline/local estimates
    try {
      const localRaw = localStorage.getItem(storageKey);
      if (localRaw) {
        const localArr = JSON.parse(localRaw);
        if (Array.isArray(localArr)) {
          localArr.forEach((le: MasterPlumbingEstimate) => {
            if (!loadedEstimates.some((se) => se.id === le.id)) {
              loadedEstimates.push(le);
            }
          });
        }
      }
    } catch (e) {
      console.error('Failed to read localStorage estimates:', e);
    }

    // If still completely empty, pre-create 1 rich demo estimate so the master immediately sees how convenient it is
    if (loadedEstimates.length === 0) {
      const sampleEstimate: MasterPlumbingEstimate = {
        id: `est-sample-${Date.now()}`,
        specialistId: specialist.id,
        specialistName: specialist.name,
        specialistPhone: specialist.phone,
        specialistCity: specialist.city,
        clientName: 'Михаил (ЖК Новая Волна)',
        clientPhone: '+7 (916) 456-78-90',
        clientAddress: 'ул. Садовая 15, кв. 84',
        objectType: 'Квартира новостройка',
        title: 'Комплексная разводка труб и монтаж инсталляции',
        items: [
          {
            id: 'item-1',
            type: 'work',
            name: 'Разводка труб ХВС/ГВС сшитый полиэтилен (Rehau)',
            category: 'Разводка и трубы',
            unit: 'точка',
            quantity: 5,
            price: 2500,
            total: 12500,
          },
          {
            id: 'item-2',
            type: 'work',
            name: 'Монтаж коллекторного узла с манометрами и редукторами',
            category: 'Разводка и трубы',
            unit: 'компл',
            quantity: 1,
            price: 4500,
            total: 4500,
          },
          {
            id: 'item-3',
            type: 'work',
            name: 'Монтаж инсталляции Geberit с регулировкой рамы',
            category: 'Сантехприборы',
            unit: 'шт',
            quantity: 1,
            price: 4500,
            total: 4500,
          },
          {
            id: 'item-4',
            type: 'material',
            name: 'Труба Rehau Rautitan stabil Ø16 (бухта)',
            category: 'Трубы и фитинги',
            unit: 'м.п.',
            quantity: 40,
            price: 280,
            total: 11200,
          },
          {
            id: 'item-5',
            type: 'material',
            name: 'Коллекторы распределительные Far с кранами (пара)',
            category: 'Арматура',
            unit: 'компл',
            quantity: 1,
            price: 6500,
            total: 6500,
          },
        ],
        worksTotal: 21500,
        materialsTotal: 17700,
        discountType: 'percent',
        discountValue: 5,
        discountAmount: 1960,
        grandTotal: 37240,
        advancePayment: 15000,
        remainingPayment: 22240,
        warrantyMonths: 24,
        executionDays: '2 рабочих дня',
        paymentTerms: 'Аванс 15 000 ₽ на материалы, остаток по акту приемки',
        notes: 'Все трассы будут опрессованы избыточным давлением 10 бар с видеофиксацией для заказчика.',
        status: 'accepted',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      };
      loadedEstimates = [sampleEstimate];
      try {
        localStorage.setItem(storageKey, JSON.stringify(loadedEstimates));
      } catch (e) {}
    }

    setEstimates(loadedEstimates);
    setIsLoading(false);
  };

  useEffect(() => {
    loadEstimates();
  }, [specialist.id]);

  // Save or update estimate
  const handleSaveEstimate = async (estimate: MasterPlumbingEstimate, sendImmediately: boolean = false) => {
    const updatedList = [...estimates];
    const existingIdx = updatedList.findIndex((e) => e.id === estimate.id);
    if (existingIdx >= 0) {
      updatedList[existingIdx] = estimate;
    } else {
      updatedList.unshift(estimate);
    }

    setEstimates(updatedList);

    // Save to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
      localStorage.setItem(`santehpro_estimate_${estimate.id}`, JSON.stringify(estimate));
    } catch (e) {
      console.error('Error saving estimate to local storage:', e);
    }

    // Save to Cloud SQL /api/estimates
    try {
      const payload = {
        id: estimate.id,
        name: estimate.title,
        summary: `Клиент: ${estimate.clientName}, Адрес: ${estimate.clientAddress || 'Не указан'}, Статус: ${estimate.status}`,
        totalPrice: estimate.grandTotal,
        itemsJson: estimate,
      };

      if (existingIdx >= 0) {
        await fetch(`/api/estimates/${estimate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/estimates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      console.warn('Saved locally, server sync failed:', err);
    }

    showToast(`Смета «${estimate.title}» сохранена!`);

    if (sendImmediately) {
      setActivePreviewEstimate(estimate);
    }
  };

  // Status Change
  const handleStatusChange = async (estimateId: string, newStatus: MasterPlumbingEstimate['status']) => {
    const updated = estimates.map((e) => (e.id === estimateId ? { ...e, status: newStatus } : e));
    setEstimates(updated);

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {}

    const target = updated.find((e) => e.id === estimateId);
    if (target) {
      if (activePreviewEstimate?.id === estimateId) {
        setActivePreviewEstimate({ ...activePreviewEstimate, status: newStatus });
      }
      try {
        await fetch(`/api/estimates/${estimateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemsJson: target,
          }),
        });
      } catch (e) {}
    }

    showToast(`Статус сметы обновлен на «${newStatus === 'accepted' ? 'Согласована' : newStatus === 'sent' ? 'Отправлена' : newStatus}»`);
  };

  // Duplicate estimate as template
  const handleDuplicate = (est: MasterPlumbingEstimate) => {
    const duplicated: MasterPlumbingEstimate = {
      ...est,
      id: `est-${Date.now()}`,
      title: `${est.title} (копия)`,
      clientName: `${est.clientName} (Новый)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
    };
    handleSaveEstimate(duplicated, false);
    showToast('Смета продублирована как шаблон для нового клиента!');
  };

  // Delete estimate
  const handleDeleteEstimate = async (id: string) => {
    if (!confirm('Вы действительно хотите удалить эту смету?')) return;

    const filtered = estimates.filter((e) => e.id !== id);
    setEstimates(filtered);

    try {
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    } catch (e) {}

    try {
      await fetch(`/api/estimates/${id}`, { method: 'DELETE' });
    } catch (e) {}

    showToast('Смета успешно удалена.');
  };

  // Filtered estimates
  const filteredEstimates = estimates.filter((est) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      est.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (est.clientAddress && est.clientAddress.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (est.clientPhone && est.clientPhone.includes(searchQuery));

    const matchesStatus = statusFilter === 'all' || est.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate high-level summary metrics
  const totalCount = estimates.length;
  const acceptedCount = estimates.filter((e) => e.status === 'accepted' || e.status === 'completed').length;
  const totalRevenue = estimates.reduce((sum, e) => sum + (Number(e.grandTotal) || 0), 0);
  const acceptedRevenue = estimates
    .filter((e) => e.status === 'accepted' || e.status === 'completed')
    .reduce((sum, e) => sum + (Number(e.grandTotal) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero / Value Banner for Master */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-emerald-950/50 border border-blue-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Calculator className="w-3.5 h-3.5" />
              <span>Профессиональный сметный инструмент мастера</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Сметы и коммерческие предложения для клиентов
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Создавайте прозрачные расчеты по сантехническим работам и материалам за 2 минуты.
              Отправляйте клиентам в WhatsApp, Telegram или распечатывайте официальный документ с гарантией.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => {
                setEditingEstimate(null);
                setSelectedRequestForEstimate(null);
                setIsBuilderOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Создать новую смету</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Всего смет:</div>
            <div className="text-lg sm:text-xl font-bold text-white mt-0.5">{totalCount}</div>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Согласовано клиентами:</div>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">{acceptedCount}</div>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Сумма в сметах:</div>
            <div className="text-lg sm:text-xl font-bold text-amber-400 mt-0.5">
              {totalRevenue.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Успешно закрыто:</div>
            <div className="text-lg sm:text-xl font-bold text-blue-400 mt-0.5">
              {acceptedRevenue.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по заказчику, адресу или названию сметы..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Все ({estimates.length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'draft'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Черновики
          </button>
          <button
            onClick={() => setStatusFilter('sent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'sent'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Отправлены
          </button>
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'accepted'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Согласованы
          </button>
        </div>
      </div>

      {/* Estimates Cards List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Загрузка смет мастера...</div>
      ) : filteredEstimates.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-slate-900/60 rounded-3xl border border-dashed border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Calculator className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">Сметы не найдены</h3>
            <p className="text-xs text-slate-400">
              {searchQuery || statusFilter !== 'all'
                ? 'По заданным параметрам поиска смет не обнаружено. Попробуйте сбросить фильтры.'
                : 'Создайте свою первую смету для клиента, указав работы и материалы. Вы сможете предложить ее клиенту в WhatsApp всего в 1 клик.'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingEstimate(null);
              setSelectedRequestForEstimate(null);
              setIsBuilderOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Создать первую смету</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEstimates.map((est) => {
            const worksCount = est.items.filter((i) => i.type === 'work').length;
            const matCount = est.items.filter((i) => i.type === 'material').length;

            return (
              <div
                key={est.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition shadow-lg group relative overflow-hidden"
              >
                {/* Header row */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition">
                          {est.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        № {est.id.slice(-6).toUpperCase()} • от {new Date(est.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {est.status === 'accepted' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" /> Согласована
                        </span>
                      ) : est.status === 'sent' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          <Send className="w-3 h-3" /> Отправлена
                        </span>
                      ) : est.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          Завершена
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          Черновик
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Client & Address */}
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Клиент:</span>
                      <span className="text-white font-bold">{est.clientName}</span>
                    </div>
                    {est.clientPhone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Телефон:</span>
                        <span className="text-blue-400 font-semibold">{est.clientPhone}</span>
                      </div>
                    )}
                    {est.clientAddress && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Объект:</span>
                        <span className="text-slate-300 truncate max-w-[180px]">{est.clientAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Breakdown & Guarantee tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      <Wrench className="w-3 h-3" /> Работы: {est.worksTotal.toLocaleString('ru-RU')} ₽ ({worksCount})
                    </span>
                    {est.materialsTotal > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <Package className="w-3 h-3" /> Материалы: {est.materialsTotal.toLocaleString('ru-RU')} ₽ ({matCount})
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Гарантия: {est.warrantyMonths} мес.
                    </span>
                  </div>
                </div>

                {/* Bottom Pricing & Actions */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider">ИТОГО К ОПЛАТЕ:</div>
                    <div className="text-base sm:text-lg font-black text-amber-400">
                      {est.grandTotal.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Fast Propose / View Proposal Button */}
                    <button
                      type="button"
                      onClick={() => setActivePreviewEstimate(est)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md cursor-pointer"
                      title="Открыть официальное предложение и отправить клиенту"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Предложить</span>
                    </button>

                    {/* Quick copy santehpro.info link */}
                    <button
                      type="button"
                      onClick={async () => {
                        const link = getEstimateShareUrl(est.id);
                        await navigator.clipboard.writeText(link);
                        showToast(`Ссылка santehpro.info на смету скопирована!`);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-sky-400 border border-slate-700/60 transition cursor-pointer"
                      title="Скопировать ссылку santehpro.info на смету"
                    >
                      <Copy className="w-3.5 h-3.5 text-sky-400" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditingEstimate(est);
                        setSelectedRequestForEstimate(null);
                        setIsBuilderOpen(true);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Редактировать смету"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate as template */}
                    <button
                      onClick={() => handleDuplicate(est)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Дублировать как шаблон для другого клиента"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteEstimate(est.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Удалить смету"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Builder Modal */}
      {isBuilderOpen && (
        <MasterEstimateBuilderModal
          isOpen={isBuilderOpen}
          onClose={() => {
            setIsBuilderOpen(false);
            setEditingEstimate(null);
            setSelectedRequestForEstimate(null);
          }}
          onSave={handleSaveEstimate}
          specialist={specialist}
          initialEstimate={editingEstimate}
          linkedRequest={selectedRequestForEstimate}
        />
      )}

      {/* Client Proposal Preview & Sharing Modal */}
      {activePreviewEstimate && (
        <ClientEstimateModal
          estimate={activePreviewEstimate}
          isOpen={Boolean(activePreviewEstimate)}
          onClose={() => setActivePreviewEstimate(null)}
          onStatusChange={(newStatus) => handleStatusChange(activePreviewEstimate.id, newStatus)}
          onEdit={() => {
            const current = activePreviewEstimate;
            setActivePreviewEstimate(null);
            setEditingEstimate(current);
            setIsBuilderOpen(true);
          }}
          isMasterView={true}
        />
      )}
    </div>
  );
};
