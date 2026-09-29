import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Save,
  Check,
  Calendar,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  Sparkles,
  Calculator,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { PlumbingContract, PlumbingSpecialist, MasterPlumbingEstimate, SpecialistLegalType } from '../types';

interface ContractBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: PlumbingContract) => void;
  specialist: PlumbingSpecialist;
  initialContract?: PlumbingContract | null;
  availableEstimates?: MasterPlumbingEstimate[];
}

export const ContractBuilderModal: React.FC<ContractBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  specialist,
  initialContract,
  availableEstimates = [],
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const nextMonthStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Generate clean contract number: СП-YYYY/MM-XXXX
  const generateContractNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `СП-${year}/${month}-${rand}`;
  };

  // State
  const [contractNumber, setContractNumber] = useState<string>(
    initialContract?.contractNumber || generateContractNumber()
  );
  const [contractDate, setContractDate] = useState<string>(initialContract?.contractDate || todayStr);
  const [startDate, setStartDate] = useState<string>(initialContract?.startDate || todayStr);
  const [endDate, setEndDate] = useState<string>(initialContract?.endDate || nextMonthStr);

  // Specialist info
  const [specialistName, setSpecialistName] = useState<string>(
    initialContract?.specialistName || specialist.name || ''
  );
  const [specialistPhone, setSpecialistPhone] = useState<string>(
    initialContract?.specialistPhone || specialist.phone || ''
  );
  const [specialistStatus, setSpecialistStatus] = useState<SpecialistLegalType>(
    initialContract?.specialistStatus || 'self_employed'
  );
  const [specialistInn, setSpecialistInn] = useState<string>(initialContract?.specialistInn || '');
  const [specialistCity, setSpecialistCity] = useState<string>(
    initialContract?.specialistCity || specialist.city || 'Москва'
  );

  // Client info
  const [clientName, setClientName] = useState<string>(initialContract?.clientName || '');
  const [clientPhone, setClientPhone] = useState<string>(initialContract?.clientPhone || '');
  const [clientPassport, setClientPassport] = useState<string>(initialContract?.clientPassport || '');
  const [clientAddress, setClientAddress] = useState<string>(initialContract?.clientAddress || '');

  // Scope & Pricing
  const [title, setTitle] = useState<string>(
    initialContract?.title || 'Монтаж системы водоснабжения и сантехприборов'
  );
  const [worksList, setWorksList] = useState<string>(
    initialContract?.worksList ||
      '1. Демонтаж старых труб и приборов\n2. Разводка труб водоснабжения и канализации\n3. Установка коллекторного узла и фильтров тонкой очистки\n4. Опрессовка системы избыточным давлением\n5. Установка и подключение сантехники'
  );
  const [totalPrice, setTotalPrice] = useState<number>(initialContract?.totalPrice || 25000);
  const [advancePayment, setAdvancePayment] = useState<number>(initialContract?.advancePayment || 0);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(initialContract?.warrantyMonths || 24);
  const [materialsResponsibility, setMaterialsResponsibility] = useState<'contractor' | 'client' | 'mixed'>(
    initialContract?.materialsResponsibility || 'mixed'
  );
  const [linkedEstimateId, setLinkedEstimateId] = useState<string>(initialContract?.estimateId || '');

  const remainingPayment = Math.max(0, totalPrice - advancePayment);

  // Auto-fill from estimate
  const handleSelectEstimate = (estId: string) => {
    setLinkedEstimateId(estId);
    if (!estId) return;

    const est = availableEstimates.find((e) => e.id === estId);
    if (!est) return;

    if (est.clientName) setClientName(est.clientName);
    if (est.clientPhone) setClientPhone(est.clientPhone);
    if (est.clientAddress) setClientAddress(est.clientAddress);
    if (est.title) setTitle(est.title);
    if (est.grandTotal) {
      setTotalPrice(est.grandTotal);
      if (est.advancePayment !== undefined) {
        setAdvancePayment(est.advancePayment);
      }
    }
    if (est.warrantyMonths) setWarrantyMonths(est.warrantyMonths);

    // Build works list from estimate items
    const workItems = est.items.filter((i) => i.type === 'work');
    if (workItems.length > 0) {
      const generatedList = workItems
        .map((w, idx) => `${idx + 1}. ${w.name} (${w.quantity} ${w.unit || 'шт.'}) — ${w.total.toLocaleString('ru-RU')} ₽`)
        .join('\n');
      setWorksList(generatedList);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert('Пожалуйста, укажите ФИО заказчика');
      return;
    }
    if (!clientAddress.trim()) {
      alert('Пожалуйста, укажите адрес объекта');
      return;
    }
    if (totalPrice <= 0) {
      alert('Пожалуйста, укажите корректную стоимость работ');
      return;
    }

    const savedContract: PlumbingContract = {
      id: initialContract?.id || `contract_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      specialistId: specialist.id,
      specialistName: specialistName.trim() || specialist.name,
      specialistPhone: specialistPhone.trim() || specialist.phone,
      specialistStatus,
      specialistInn: specialistInn.trim(),
      specialistCity: specialistCity.trim(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientPassport: clientPassport.trim(),
      clientAddress: clientAddress.trim(),
      contractNumber: contractNumber.trim(),
      contractDate,
      startDate,
      endDate,
      title: title.trim(),
      worksList: worksList.trim(),
      totalPrice: Number(totalPrice) || 0,
      advancePayment: Number(advancePayment) || 0,
      remainingPayment,
      warrantyMonths: Number(warrantyMonths) || 12,
      materialsResponsibility,
      estimateId: linkedEstimateId || undefined,
      status: initialContract?.status || 'active',
      createdAt: initialContract?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(savedContract);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>{initialContract ? 'Редактирование договора' : 'Новый договор и акт подряда'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  B2B Магнит
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Официальный юридический договор с актом сдачи-приёмки и гарантией
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Quick autofill from existing estimate */}
          {availableEstimates.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/50 border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Быстрое заполнение из вашей сметы:
                </span>
                <span className="text-[11px] text-slate-400">Сэкономит 5 минут</span>
              </div>
              <div className="relative">
                <select
                  value={linkedEstimateId}
                  onChange={(e) => handleSelectEstimate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
                >
                  <option value="">-- Выберите смету для переноса данных (опционально) --</option>
                  {availableEstimates.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.title} ({est.clientName || 'Клиент'}) — {est.grandTotal.toLocaleString('ru-RU')} ₽
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Section 1: Номер и даты */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> 1. Номер договора и сроки
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Номер договора</label>
                <input
                  type="text"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Дата заключения</label>
                <input
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Дата начала работ</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Дата сдачи работ</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Исполнитель (Мастер) */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" /> 2. Исполнитель (Ваши данные)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">ФИО мастера / Название</label>
                <input
                  type="text"
                  value={specialistName}
                  onChange={(e) => setSpecialistName(e.target.value)}
                  required
                  placeholder="Иванов Сергей Петрович"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Телефон мастера</label>
                <input
                  type="tel"
                  value={specialistPhone}
                  onChange={(e) => setSpecialistPhone(e.target.value)}
                  required
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Юридический статус</label>
                <select
                  value={specialistStatus}
                  onChange={(e) => setSpecialistStatus(e.target.value as SpecialistLegalType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                >
                  <option value="self_employed">Плательщик НПД (Самозанятый)</option>
                  <option value="individual">Физическое лицо</option>
                  <option value="ip">Индивидуальный предприниматель (ИП)</option>
                  <option value="company">Юридическое лицо (ООО)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  ИНН мастера <span className="text-slate-500">(опционально)</span>
                </label>
                <input
                  type="text"
                  value={specialistInn}
                  onChange={(e) => setSpecialistInn(e.target.value)}
                  placeholder="123456789012"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Город мастера</label>
                <input
                  type="text"
                  value={specialistCity}
                  onChange={(e) => setSpecialistCity(e.target.value)}
                  placeholder="Москва"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Заказчик (Клиент) */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" /> 3. Заказчик (Клиент)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">ФИО Заказчика *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  placeholder="Петров Алексей Владимирович"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Телефон Заказчика</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+7 (900) 123-45-67"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Адрес объекта проведения работ *
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  required
                  placeholder="г. Москва, ул. Профсоюзная, д. 45, кв. 112"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Паспортные данные заказчика <span className="text-slate-500">(опционально)</span>
                </label>
                <input
                  type="text"
                  value={clientPassport}
                  onChange={(e) => setClientPassport(e.target.value)}
                  placeholder="Серия 4510 № 123456, выдан ОВД Тверского р-на г. Москвы..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Работы и сумма */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" /> 4. Предмет работ и финансовые условия
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Название проекта / объекта</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Комплексный монтаж водоснабжения и отопления квартиры"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Перечень выполняемых работ (по пунктам)
                </label>
                <textarea
                  rows={4}
                  value={worksList}
                  onChange={(e) => setWorksList(e.target.value)}
                  required
                  placeholder="1. Прокладка труб водоснабжения..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Итоговая стоимость (₽) *</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(Number(e.target.value) || 0)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-amber-400 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Аванс / предоплата (₽)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Остаток при приёмке (₽)</label>
                  <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400">
                    {remainingPayment.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Срок официальной гарантии</label>
                  <select
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option value={6}>6 месяцев</option>
                    <option value={12}>12 месяцев (1 год)</option>
                    <option value={24}>24 месяца (2 года)</option>
                    <option value={36}>36 месяцев (3 года)</option>
                    <option value={60}>60 месяцев (5 лет)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Поставка черновых материалов</label>
                  <select
                    value={materialsResponsibility}
                    onChange={(e) =>
                      setMaterialsResponsibility(e.target.value as 'contractor' | 'client' | 'mixed')
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option value="contractor">Закупает Исполнитель (Мастер)</option>
                    <option value="client">Предоставляет Заказчик</option>
                    <option value="mixed">По согласованию (совместно)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900/95 py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить и сформировать бланк</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
