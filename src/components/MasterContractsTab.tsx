import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Trash2,
  Edit2,
  ShieldCheck,
  MessageCircle,
  FileCheck,
  Check,
  AlertCircle,
  Award,
  ArrowRight
} from 'lucide-react';
import { PlumbingContract, PlumbingSpecialist, MasterPlumbingEstimate } from '../types';
import { ContractBuilderModal } from './ContractBuilderModal';
import { ContractViewerModal } from './ContractViewerModal';

interface MasterContractsTabProps {
  specialist: PlumbingSpecialist;
  availableEstimates?: MasterPlumbingEstimate[];
  onOpenEstimate?: (estimate: MasterPlumbingEstimate) => void;
}

export const MasterContractsTab: React.FC<MasterContractsTabProps> = ({
  specialist,
  availableEstimates = [],
}) => {
  const [contracts, setContracts] = useState<PlumbingContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'draft'>('all');

  // Modals state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<PlumbingContract | null>(null);
  const [viewingContract, setViewingContract] = useState<PlumbingContract | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const storageKey = `santehpro_master_contracts_${specialist.id}`;

  const defaultContract: PlumbingContract = {
    id: `contract_sample_${specialist.id}`,
    specialistId: specialist.id,
    specialistName: specialist.name || 'Мастер-сантехник',
    specialistPhone: specialist.phone || '+7 (999) 000-00-00',
    specialistStatus: 'self_employed',
    specialistCity: specialist.city || 'Москва',
    clientName: 'Алексей Смирнов',
    clientPhone: '+7 (916) 450-20-10',
    clientAddress: `г. ${specialist.city || 'Москва'}, ул. Ленина, д. 24, кв. 86`,
    contractNumber: `СП-2026/09-1082`,
    contractDate: new Date().toISOString().slice(0, 10),
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    title: 'Комплексный монтаж узла ввода водоснабжения и труб Rehau',
    worksList:
      '1. Сборка коллекторного узла (Far, редукторы давления, фильтры 100 мкм)\n2. Разводка труб горячего и холодного водоснабжения (сшитый полиэтилен Rehau 16/20)\n3. Монтаж шумопоглощающей канализации\n4. Установка системы защиты от протечек Neptun\n5. Опрессовка системы избыточным давлением 10 бар в течение 60 минут',
    totalPrice: 42000,
    advancePayment: 15000,
    remainingPayment: 27000,
    warrantyMonths: 24,
    materialsResponsibility: 'mixed',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Load contracts: sync from server with localStorage fallback
  useEffect(() => {
    setIsLoading(true);
    let initialList: PlumbingContract[] = [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialList = parsed;
        }
      }
    } catch {}

    // Fetch from server /api/contracts?specialistId=...
    fetch(`/api/contracts?specialistId=${encodeURIComponent(specialist.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((serverContracts) => {
        if (Array.isArray(serverContracts) && serverContracts.length > 0) {
          const mergedMap = new Map<string, PlumbingContract>();
          initialList.forEach((c) => mergedMap.set(c.id, c));
          serverContracts.forEach((c: PlumbingContract) => {
            const loc = mergedMap.get(c.id);
            if (!loc || new Date(c.updatedAt || 0) >= new Date(loc.updatedAt || 0)) {
              mergedMap.set(c.id, c);
            }
          });
          const merged = Array.from(mergedMap.values());
          setContracts(merged);
          try {
            localStorage.setItem(storageKey, JSON.stringify(merged));
          } catch {}
        } else if (initialList.length > 0) {
          setContracts(initialList);
          // Automatically upload existing local contracts to the cloud database
          initialList.forEach((c) => {
            fetch('/api/contracts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(c),
            }).catch(() => {});
          });
        } else {
          setContracts([defaultContract]);
          try {
            localStorage.setItem(storageKey, JSON.stringify([defaultContract]));
          } catch {}
        }
      })
      .catch(() => {
        if (initialList.length > 0) {
          setContracts(initialList);
        } else {
          setContracts([defaultContract]);
        }
      })
      .finally(() => setIsLoading(false));
  }, [specialist.id]);

  const saveContractsList = (newList: PlumbingContract[]) => {
    setContracts(newList);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newList));
    } catch {}
  };

  const handleSaveContract = async (contract: PlumbingContract) => {
    const existingIndex = contracts.findIndex((c) => c.id === contract.id);
    let updated: PlumbingContract[];
    if (existingIndex >= 0) {
      updated = [...contracts];
      updated[existingIndex] = contract;
      showToast(`Договор № ${contract.contractNumber} успешно обновлен!`);
    } else {
      updated = [contract, ...contracts];
      showToast(`Договор № ${contract.contractNumber} успешно создан!`);
    }
    saveContractsList(updated);
    setIsBuilderOpen(false);
    setEditingContract(null);
    setViewingContract(contract);

    // Save to server database
    try {
      await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contract),
      });
    } catch (e) {
      console.warn('Error syncing contract to server:', e);
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (!window.confirm('Вы действительно хотите удалить этот договор?')) return;
    const updated = contracts.filter((c) => c.id !== id);
    saveContractsList(updated);
    showToast('Договор удален');
    if (viewingContract?.id === id) setViewingContract(null);

    try {
      await fetch(`/api/contracts/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {}
  };

  const handleStatusChange = async (newStatus: PlumbingContract['status']) => {
    if (!viewingContract) return;
    const updated = contracts.map((c) => (c.id === viewingContract.id ? { ...c, status: newStatus } : c));
    saveContractsList(updated);
    const updatedItem = { ...viewingContract, status: newStatus };
    setViewingContract(updatedItem);
    showToast(`Статус договора изменен на «${newStatus === 'completed' ? 'Исполнен' : 'В работе'}»`);

    try {
      await fetch(`/api/contracts/${encodeURIComponent(viewingContract.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
  };

  // Filtered list
  const filteredContracts = contracts.filter((c) => {
    const matchSearch =
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAmount = contracts.reduce((acc, c) => acc + (c.totalPrice || 0), 0);
  const activeCount = contracts.filter((c) => c.status === 'active').length;
  const completedCount = contracts.filter((c) => c.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 shadow-xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-emerald-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Banner: B2B Magnet explanation */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 border border-blue-500/25 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Официальный юридический инструмент мастера</span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
              Договоры подряда, Акты сдачи и Гарантийные талоны
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Защитите себя от необоснованных претензий и задержек оплаты. Оформляйте договор с клиентом перед началом работ, подписывайте на экране смартфона или по ссылке в WhatsApp, а после опрессовки в 1 клик формируйте Акт сдачи и Гарантийный талон.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingContract(null);
              setIsBuilderOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-blue-500/25 shrink-0 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Создать договор</span>
          </button>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Всего договоров</span>
          <div className="text-lg font-black text-white">{contracts.length}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400">В работе</span>
          <div className="text-lg font-black text-emerald-400">{activeCount}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-purple-400">Завершено и принято</span>
          <div className="text-lg font-black text-purple-400">{completedCount}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-amber-400">Сумма по договорам</span>
          <div className="text-lg font-black text-amber-400">{totalAmount.toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по номеру договора, заказчику, адресу..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
              statusFilter === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Все ({contracts.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            В работе ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
              statusFilter === 'completed' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Завершенные ({completedCount})
          </button>
        </div>
      </div>

      {/* Contract Cards List */}
      {filteredContracts.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-slate-900/60 rounded-3xl border border-dashed border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">Договоры не найдены</h3>
            <p className="text-xs text-slate-400">
              {searchQuery || statusFilter !== 'all'
                ? 'По заданным параметрам ничего не найдено. Сбросьте фильтры поиска.'
                : 'Создайте первый официальный договор с актом и гарантией. Вы сможете подписать его на телефоне или отправить клиенту в WhatsApp.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingContract(null);
              setIsBuilderOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Создать договор</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContracts.map((contract) => {
            const isContractSigned = Boolean(contract.clientSignature || contract.clientSignedAt);
            const isActSigned = Boolean(contract.actClientSignature || contract.actClientSignedAt || contract.status === 'completed');

            return (
              <div
                key={contract.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition shadow-lg group relative overflow-hidden"
              >
                {/* Header row */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-blue-400">
                          № {contract.contractNumber}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          от {new Date(contract.contractDate).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition mt-0.5">
                        {contract.title}
                      </h3>
                    </div>

                    {/* Status Badges */}
                    <div>
                      {contract.status === 'completed' || isActSigned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          <CheckCircle2 className="w-3 h-3" /> Акт подписан
                        </span>
                      ) : isContractSigned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <Check className="w-3 h-3" /> Договор в силе
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Clock className="w-3 h-3" /> Ожидает подписи
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Client & Address Info */}
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Заказчик:</span>
                      <span className="text-white font-bold">{contract.clientName}</span>
                    </div>
                    {contract.clientPhone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Телефон:</span>
                        <a
                          href={`tel:${contract.clientPhone}`}
                          className="text-blue-400 hover:underline font-mono"
                        >
                          {contract.clientPhone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-400 font-medium shrink-0">Адрес:</span>
                      <span className="text-slate-300 text-right truncate">{contract.clientAddress}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                      <Award className="w-3 h-3 text-emerald-400" />
                      Гарантия: {contract.warrantyMonths || 24} мес.
                    </span>
                    {contract.advancePayment > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-950/60 text-blue-300 border border-blue-800/50">
                        Аванс: {contract.advancePayment.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Pricing & Actions */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider">СУММА ДОГОВОРА:</div>
                    <div className="text-base sm:text-lg font-black text-amber-400">
                      {contract.totalPrice.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* View Full Document */}
                    <button
                      type="button"
                      onClick={() => setViewingContract(contract)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md cursor-pointer active:scale-95"
                      title="Открыть официальный бланк договора, акта и гарантии"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Бланк и Акт</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/?contractId=${encodeURIComponent(contract.id)}`;
                        const warrantyTxt = `Гарантия: ${contract.warrantyMonths || 24} мес.`;
                        const text = `Здравствуйте, ${contract.clientName}!\n\nНаправляю вам официальный договор подряда и акт № ${contract.contractNumber} на сантехнические работы по адресу: ${contract.clientAddress}.\nСумма: ${contract.totalPrice.toLocaleString('ru-RU')} ₽. ${warrantyTxt}.\nСсылка для согласования и подписи:\n${shareUrl}`;
                        const url = `https://wa.me/${contract.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
                        window.open(url, '_blank');
                      }}
                      className="p-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 transition cursor-pointer active:scale-95"
                      title="Отправить в WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingContract(contract);
                        setIsBuilderOpen(true);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer active:scale-95"
                      title="Редактировать данные договора"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteContract(contract.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition cursor-pointer active:scale-95"
                      title="Удалить договор"
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
        <ContractBuilderModal
          isOpen={isBuilderOpen}
          onClose={() => {
            setIsBuilderOpen(false);
            setEditingContract(null);
          }}
          onSave={handleSaveContract}
          specialist={specialist}
          initialContract={editingContract}
          availableEstimates={availableEstimates}
        />
      )}

      {/* Viewer & Print Modal */}
      {viewingContract && (
        <ContractViewerModal
          contract={viewingContract}
          isOpen={Boolean(viewingContract)}
          onClose={() => setViewingContract(null)}
          onEdit={(contract) => {
            setViewingContract(null);
            setEditingContract(contract);
            setIsBuilderOpen(true);
          }}
          onStatusChange={handleStatusChange}
          onUpdateContract={async (updated) => {
            const newArr = contracts.map((c) => (c.id === updated.id ? updated : c));
            saveContractsList(newArr);
            setViewingContract(updated);
            try {
              await fetch(`/api/contracts/${encodeURIComponent(updated.id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
              });
            } catch {}
          }}
        />
      )}
    </div>
  );
};
