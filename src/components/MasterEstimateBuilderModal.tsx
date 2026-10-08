import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Wrench,
  Package,
  Check,
  Sparkles,
  DollarSign,
  Percent,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Save,
  Send,
  HelpCircle,
  Zap,
  BookOpen
} from 'lucide-react';
import { MasterPlumbingEstimate, MasterEstimateItem, PlumbingSpecialist, ServiceCallRequest } from '../types';
import { PRESET_PACKAGES, PresetPackage } from '../data/contractWorksData';

interface MasterEstimateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (estimate: MasterPlumbingEstimate, sendImmediately?: boolean) => Promise<void>;
  specialist: PlumbingSpecialist;
  initialEstimate?: MasterPlumbingEstimate | null;
  linkedRequest?: ServiceCallRequest | null;
}

// Typical plumbing work quick templates
const QUICK_WORKS_TEMPLATES = [
  // Тепловые насосы и котельное оборудование
  { category: 'Тепловые насосы и котельные', name: 'Монтаж теплового насоса воздух-вода (наружный + внутренний блок)', unit: 'компл', price: 35000 },
  { category: 'Тепловые насосы и котельные', name: 'Обвязка гидромодуля теплового насоса и буферной емкости', unit: 'компл', price: 18000 },
  { category: 'Тепловые насосы и котельные', name: 'Монтаж трехходового клапана ГВС и бойлера косвенного нагрева (БКН)', unit: 'шт', price: 9500 },
  { category: 'Тепловые насосы и котельные', name: 'Вакуумирование, заправка и пусконаладка фреонового контура ТН (R32/R410A)', unit: 'услуга', price: 12000 },
  { category: 'Тепловые насосы и котельные', name: 'Настройка автоматики и погодозависимого регулирования ТН', unit: 'услуга', price: 7000 },
  { category: 'Тепловые насосы и котельные', name: 'Монтаж гидрострелки и насосных групп котельной', unit: 'компл', price: 14000 },
  { category: 'Тепловые насосы и котельные', name: 'Монтаж и обвязка электрического / газового котла', unit: 'шт', price: 12000 },

  // Разводка и трубы
  { category: 'Разводка и трубы', name: 'Разводка труб (сшитый полиэтилен Rehau/Stout)', unit: 'точка', price: 2500 },
  { category: 'Разводка и трубы', name: 'Разводка труб ХВС/ГВС (полипропилен)', unit: 'точка', price: 1800 },
  { category: 'Разводка и трубы', name: 'Монтаж канализационных фановых труб', unit: 'точка', price: 1200 },
  { category: 'Разводка и трубы', name: 'Монтаж коллекторного узла (пара гребенок)', unit: 'компл', price: 4500 },
  { category: 'Разводка и трубы', name: 'Монтаж узла ввода с промывными фильтрами 100 мкм и редуктором', unit: 'компл', price: 5500 },
  { category: 'Разводка и трубы', name: 'Монтаж системы защиты от протечек (Нептун/Аквасторож)', unit: 'компл', price: 4000 },
  { category: 'Разводка и трубы', name: 'Установка счетчиков воды (пара ХВС+ГВС)', unit: 'компл', price: 2000 },

  // Отопление и теплые полы
  { category: 'Отопление и полы', name: 'Монтаж водяного тёплого пола с балансировкой расходомеров', unit: 'м²', price: 650 },
  { category: 'Отопление и полы', name: 'Монтаж смесительного узла и коллектора теплого пола', unit: 'компл', price: 6000 },
  { category: 'Отопление и полы', name: 'Монтаж радиатора / конвектора отопления', unit: 'шт', price: 3500 },
  { category: 'Отопление и полы', name: 'Опрессовка системы отопления давлением', unit: 'услуга', price: 3000 },

  // Сантехприборы
  { category: 'Сантехприборы', name: 'Монтаж инсталляции подвесного унитаза', unit: 'шт', price: 4500 },
  { category: 'Сантехприборы', name: 'Установка смесителя (раковина/ванна)', unit: 'шт', price: 1500 },
  { category: 'Сантехприборы', name: 'Установка термостата скрытого монтажа (I-Box)', unit: 'шт', price: 3800 },
  { category: 'Сантехприборы', name: 'Монтаж душевого трапа в строительном исполнении', unit: 'шт', price: 4800 },
  { category: 'Сантехприборы', name: 'Монтаж ванны акриловой с герметизацией', unit: 'шт', price: 4500 },

  // Демонтаж
  { category: 'Демонтаж', name: 'Демонтаж старого сантехприбора / котла', unit: 'шт', price: 1000 },
  { category: 'Демонтаж', name: 'Демонтаж старых чугунных/стальных труб', unit: 'м.п.', price: 500 },
];

// Typical plumbing material quick templates
const QUICK_MATERIALS_TEMPLATES = [
  // Тепловые насосы и котельное оборудование
  { category: 'Тепловые насосы и котельные', name: 'Буферная ёмкость (теплоаккумулятор) 100-300 л', unit: 'шт', price: 38000 },
  { category: 'Тепловые насосы и котельные', name: 'Бойлер косвенного нагрева (БКН) из нержавеющей стали 200 л', unit: 'шт', price: 54000 },
  { category: 'Тепловые насосы и котельные', name: 'Клапан трехходовой с сервоприводом 1" (Dn25)', unit: 'шт', price: 8500 },
  { category: 'Тепловые насосы и котельные', name: 'Фреоновая магистраль в термоизоляции (медь 1/4" + 1/2")', unit: 'м.п.', price: 1850 },
  { category: 'Тепловые насосы и котельные', name: 'Группа безопасности котла/ТН + расширительный бак', unit: 'компл', price: 6800 },
  { category: 'Тепловые насосы и котельные', name: 'Насос циркуляционный частотный энергосберегающий', unit: 'шт', price: 14500 },

  // Трубы и фитинги
  { category: 'Трубы и фитинги', name: 'Труба сшитый полиэтилен PE-Xa Ø16 (Stout/Rehau)', unit: 'м.п.', price: 280 },
  { category: 'Трубы и фитинги', name: 'Труба армированная PP-R Ø20/25/32', unit: 'м.п.', price: 220 },
  { category: 'Трубы и фитинги', name: 'Труба для теплого пола PE-RT Ø16 с кислородным барьером', unit: 'м.п.', price: 95 },
  { category: 'Трубы и фитинги', name: 'Фитинги, тройники, углы (комплект)', unit: 'компл', price: 2200 },
  { category: 'Трубы и фитинги', name: 'Труба канализационная бесшумная Ø50/110', unit: 'м.п.', price: 380 },

  // Арматура
  { category: 'Арматура', name: 'Коллектор распределительный 3/4" на 3-4 выхода с кранами', unit: 'шт', price: 3800 },
  { category: 'Арматура', name: 'Кран шаровый латунный 1/2"-3/4" усиленный (Valtec/Bugatti)', unit: 'шт', price: 950 },
  { category: 'Арматура', name: 'Фильтр самопромывной с манометром 100 мкм', unit: 'шт', price: 4200 },
  { category: 'Арматура', name: 'Редуктор давления мембранный 1/2"', unit: 'шт', price: 3600 },

  // Расходники
  { category: 'Расходники', name: 'Герметик санитарный + уплотнительная паста/лен', unit: 'компл', price: 950 },
  { category: 'Расходники', name: 'Крепежи, виброопоры, хомуты и шпильки монтажные', unit: 'компл', price: 1200 },
];

export const MasterEstimateBuilderModal: React.FC<MasterEstimateBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  specialist,
  initialEstimate,
  linkedRequest,
}) => {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [objectType, setObjectType] = useState('Квартира новостройка');

  const [items, setItems] = useState<MasterEstimateItem[]>([]);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(24);
  const [executionDays, setExecutionDays] = useState<string>('1-2 рабочих дня');
  const [paymentTerms, setPaymentTerms] = useState<string>('50% аванс на закупку, 50% по факту приемки');
  const [notes, setNotes] = useState<string>('');

  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [advancePayment, setAdvancePayment] = useState<number>(0);

  const [isSaving, setIsSaving] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'works' | 'materials'>('works');

  // Apply complete package (unified with contracts)
  const handleApplyPresetPackage = (pkg: PresetPackage) => {
    const lines = pkg.works
      .split('\n')
      .map((l) => l.replace(/^[\d\s.)\-*•]+/, '').trim())
      .filter((l) => l.length > 0);

    const pricePerLine = Math.round(pkg.price / Math.max(1, lines.length));

    const packageItems: MasterEstimateItem[] = lines.map((line, idx) => ({
      id: `pkg-${Date.now()}-${idx}`,
      type: 'work',
      name: line,
      category: pkg.name,
      unit: 'услуга',
      quantity: 1,
      price: pricePerLine,
      total: pricePerLine,
    }));

    setItems((prev) => [...prev, ...packageItems]);
    if (!title) {
      setTitle(pkg.title);
    }
  };

  // Load initial data or prepopulate from linked request
  useEffect(() => {
    if (initialEstimate) {
      setTitle(initialEstimate.title || '');
      setClientName(initialEstimate.clientName || '');
      setClientPhone(initialEstimate.clientPhone || '');
      setClientAddress(initialEstimate.clientAddress || '');
      setObjectType(initialEstimate.objectType || 'Квартира новостройка');
      setItems(initialEstimate.items || []);
      setWarrantyMonths(initialEstimate.warrantyMonths ?? 24);
      setExecutionDays(initialEstimate.executionDays || '1-2 рабочих дня');
      setPaymentTerms(initialEstimate.paymentTerms || '50% аванс на закупку, 50% по факту приемки');
      setNotes(initialEstimate.notes || '');
      setDiscountType(initialEstimate.discountType || 'percent');
      setDiscountValue(initialEstimate.discountValue || 0);
      setAdvancePayment(initialEstimate.advancePayment || 0);
    } else if (linkedRequest) {
      setTitle(`Смета для: ${linkedRequest.clientName} (${linkedRequest.problemDescription.slice(0, 30)}...)`);
      setClientName(linkedRequest.clientName || '');
      setClientPhone(linkedRequest.clientPhone || '');
      setClientAddress(linkedRequest.address || linkedRequest.city || '');
      setNotes(`Заявка клиента: "${linkedRequest.problemDescription}"`);
      setItems([
        {
          id: `item-${Date.now()}-1`,
          type: 'work',
          name: linkedRequest.problemDescription.slice(0, 50) || 'Диагностика и сантехнические работы',
          category: 'Основные работы',
          unit: 'услуга',
          quantity: 1,
          price: specialist.minPrice || 2500,
          total: specialist.minPrice || 2500,
        },
      ]);
    } else {
      // Default clean template
      setTitle(`Смета на сантехработы от ${new Date().toLocaleDateString('ru-RU')}`);
      setClientName('');
      setClientPhone('');
      setClientAddress(specialist.city ? `г. ${specialist.city}` : '');
      setObjectType('Квартира новостройка');
      setItems([
        {
          id: `item-${Date.now()}-1`,
          type: 'work',
          name: 'Разводка труб ХВС/ГВС (полипропилен)',
          category: 'Разводка и трубы',
          unit: 'точка',
          quantity: 4,
          price: 1800,
          total: 7200,
        },
        {
          id: `item-${Date.now()}-2`,
          type: 'work',
          name: 'Монтаж инсталляции подвесного унитаза',
          category: 'Сантехприборы',
          unit: 'шт',
          quantity: 1,
          price: 4500,
          total: 4500,
        },
        {
          id: `item-${Date.now()}-3`,
          type: 'material',
          name: 'Трубы PP-R и фитинги для водоснабжения',
          category: 'Трубы и фитинги',
          unit: 'компл',
          quantity: 1,
          price: 3500,
          total: 3500,
        },
      ]);
      setWarrantyMonths(24);
      setExecutionDays('1-2 рабочих дня');
      setPaymentTerms('50% аванс на закупку, 50% по факту сдачи');
      setNotes('Все работы выполняются по нормам СНиП и ГОСТ с опрессовкой давлением.');
      setDiscountValue(0);
      setAdvancePayment(0);
    }
  }, [initialEstimate, linkedRequest, specialist]);

  if (!isOpen) return null;

  // Real-time calculation helpers
  const worksTotal = items
    .filter((i) => i.type === 'work')
    .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  const materialsTotal = items
    .filter((i) => i.type === 'material')
    .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  const subtotal = worksTotal + materialsTotal;

  let discountAmount = 0;
  if (discountValue > 0) {
    if (discountType === 'percent') {
      discountAmount = Math.round((subtotal * Math.min(100, discountValue)) / 100);
    } else {
      discountAmount = Math.min(subtotal, discountValue);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount);
  const remainingPayment = Math.max(0, grandTotal - (advancePayment || 0));

  // Add Item handler
  const handleAddItem = (type: 'work' | 'material') => {
    const newItem: MasterEstimateItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      name: type === 'work' ? 'Новая сантехническая работа' : 'Новый материал / комплектующие',
      category: type === 'work' ? 'Монтаж' : 'Расходники',
      unit: type === 'work' ? 'шт' : 'шт',
      quantity: 1,
      price: type === 'work' ? 1500 : 500,
      total: type === 'work' ? 1500 : 500,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Add from template
  const handleAddFromTemplate = (template: { name: string; category: string; unit: string; price: number }, type: 'work' | 'material') => {
    const newItem: MasterEstimateItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      name: template.name,
      category: template.category,
      unit: template.unit,
      quantity: 1,
      price: template.price,
      total: template.price,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Update Item row
  const handleUpdateItem = (id: string, field: keyof MasterEstimateItem, val: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'price') {
          const q = field === 'quantity' ? Number(val) || 0 : item.quantity;
          const p = field === 'price' ? Number(val) || 0 : item.price;
          updated.total = Math.round(q * p);
        }
        return updated;
      })
    );
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Submit Save
  const handleSaveEstimate = async (sendImmediately: boolean = false) => {
    if (!clientName.trim()) {
      alert('Пожалуйста, укажите имя заказчика (клиента)');
      return;
    }

    setIsSaving(true);
    try {
      const estimateRecord: MasterPlumbingEstimate = {
        id: initialEstimate?.id || `est-${Date.now()}`,
        specialistId: specialist.id,
        specialistName: specialist.name,
        specialistPhone: specialist.phone,
        specialistCity: specialist.city,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || undefined,
        clientAddress: clientAddress.trim() || undefined,
        objectType,
        title: title.trim() || `Смета для ${clientName.trim()}`,
        items,
        worksTotal,
        materialsTotal,
        discountType,
        discountValue,
        discountAmount,
        grandTotal,
        advancePayment: advancePayment > 0 ? advancePayment : undefined,
        remainingPayment,
        warrantyMonths,
        executionDays,
        paymentTerms,
        notes: notes.trim() || undefined,
        status: sendImmediately ? 'sent' : initialEstimate?.status || 'draft',
        serviceRequestId: linkedRequest?.id || initialEstimate?.serviceRequestId,
        createdAt: initialEstimate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(estimateRecord, sendImmediately);
      onClose();
    } catch (e) {
      console.error('Failed to save estimate:', e);
      alert('Ошибка при сохранении сметы. Попробуйте снова.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {initialEstimate ? 'Редактирование сметы' : 'Конструктор сантехнической сметы'}
              </h2>
              <p className="text-xs text-slate-400">
                Составьте расчет для клиента с прозрачными ценами на работы, материалы и гарантией
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Estimate & Client Details */}
          <div className="bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
              <User className="w-4 h-4" />
              <span>Данные заказчика и объекта</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Название сметы / заказа:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Монтаж водоснабжения в новостройке"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Имя клиента / Заказчик: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Алексей Смирнов"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Телефон клиента (WhatsApp):
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Тип объекта:
                </label>
                <select
                  value={objectType}
                  onChange={(e) => setObjectType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Квартира новостройка">Квартира новостройка</option>
                  <option value="Квартира вторичка">Квартира вторичка</option>
                  <option value="Частный дом / Коттедж">Частный дом / Коттедж</option>
                  <option value="Офис / Коммерция">Офис / Коммерция</option>
                  <option value="Дача">Дача</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Адрес объекта:
              </label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="г. Москва, ул. Ленина 42, кв. 15 (ЖК Солнечный)"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick-Add Templates Drawer */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-white">
                  Быстрое добавление типовых позиций (в 1 клик):
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab('works')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTemplateTab === 'works'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Работы (21)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab('materials')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTemplateTab === 'materials'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Материалы (9)
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {activeTemplateTab === 'works'
                ? QUICK_WORKS_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddFromTemplate(tpl, 'work')}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/60 text-left shrink-0 text-xs transition flex items-center gap-2 cursor-pointer group"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-400 group-hover:scale-125 transition" />
                      <div>
                        <div className="text-slate-200 font-medium whitespace-nowrap">{tpl.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {tpl.price.toLocaleString('ru-RU')} ₽ / {tpl.unit}
                        </div>
                      </div>
                    </button>
                  ))
                : QUICK_MATERIALS_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddFromTemplate(tpl, 'material')}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 text-left shrink-0 text-xs transition flex items-center gap-2 cursor-pointer group"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-125 transition" />
                      <div>
                        <div className="text-slate-200 font-medium whitespace-nowrap">{tpl.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {tpl.price.toLocaleString('ru-RU')} ₽ / {tpl.unit}
                        </div>
                      </div>
                    </button>
                  ))}
            </div>
          </div>

          {/* Complete Turnkey Work Packages (Unified with Contracts) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Готовые пакеты работ (в 1 клик, как в договорах):</span>
              </span>
              <span className="text-[10px] text-slate-400">Автоматически заполнит смету</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PACKAGES.map((pkg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPresetPackage(pkg)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                >
                  <span>{pkg.icon}</span>
                  <span>{pkg.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {pkg.price.toLocaleString('ru-RU')} ₽
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Список работ и комплектующих ({items.length} поз.)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddItem('work')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Работа</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('material')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Материал</span>
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                Позиции пока не добавлены. Нажмите «+ Работа» или «+ Материал», либо выберите позиции из быстрых шаблонов выше.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-3 transition ${
                      item.type === 'work'
                        ? 'bg-slate-950/60 border-slate-800 hover:border-blue-500/30'
                        : 'bg-emerald-950/20 border-emerald-900/30 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs text-slate-500 w-5">{index + 1}.</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          item.type === 'work'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {item.type === 'work' ? 'Работа' : 'Материал'}
                      </span>
                    </div>

                    {/* Name & Category */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                          placeholder="Наименование позиции"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                          placeholder="Категория"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Qty, Unit, Price, Total */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          placeholder="1"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value === '' ? 0 : e.target.value)}
                          className="w-16 bg-slate-900 border border-slate-700 text-white text-center rounded-xl px-1.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                        />
                        <select
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-2 py-1.5 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="шт">шт</option>
                          <option value="точка">точка</option>
                          <option value="м.п.">м.п.</option>
                          <option value="компл">компл</option>
                          <option value="услуга">услуга</option>
                          <option value="час">час</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 text-xs">×</span>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          placeholder="0"
                          value={item.price === 0 ? '' : item.price}
                          onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value === '' ? 0 : e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-700 text-white text-right rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                        />
                        <span className="text-slate-400 text-xs">₽</span>
                      </div>

                      <div className="w-24 text-right">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {item.total.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Terms, Warranty & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Гарантия на работы:</span>
              </label>
              <select
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value={6}>6 месяцев</option>
                <option value={12}>12 месяцев (1 год)</option>
                <option value={24}>24 месяца (2 года)</option>
                <option value={36}>36 месяцев (3 года)</option>
                <option value={60}>60 месяцев (5 лет)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Срок выполнения:</span>
              </label>
              <input
                type="text"
                value={executionDays}
                onChange={(e) => setExecutionDays(e.target.value)}
                placeholder="1-2 рабочих дня"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Порядок оплаты:</span>
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="По факту сдачи или 50% аванс"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Примечания мастера для клиента (рекомендации, особенности монтажа):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Например: все трубы монтируются по лазерному уровню, перед чистовой отделкой проведем опрессовку 10 атм..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Section: Discount, Advance, Calculations Summary */}
          <div className="bg-gradient-to-r from-slate-950 via-blue-950/40 to-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-blue-500/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
            {/* Left: Discount & Prepayment controls */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-slate-300">Скидка клиенту:</span>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={`px-2 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${
                      discountType === 'percent' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`px-2 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${
                      discountType === 'fixed' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    ₽
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={discountValue === 0 ? '' : discountValue}
                  onChange={(e) => setDiscountValue(e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 bg-slate-900 border border-slate-700 text-white text-center rounded-xl px-2 py-1 text-xs font-bold focus:outline-none focus:border-blue-500"
                />
                {discountAmount > 0 && (
                  <span className="text-xs font-bold text-emerald-400">
                    (-{discountAmount.toLocaleString('ru-RU')} ₽)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-slate-300">Предоплата / Аванс:</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="0"
                  value={advancePayment === 0 ? '' : advancePayment}
                  onChange={(e) => setAdvancePayment(e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-28 bg-slate-900 border border-slate-700 text-white text-center rounded-xl px-2 py-1 text-xs font-bold focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-400">₽</span>
                {advancePayment > 0 && (
                  <span className="text-xs text-slate-300">
                    (Остаток после работ: {remainingPayment.toLocaleString('ru-RU')} ₽)
                  </span>
                )}
              </div>
            </div>

            {/* Right: Totals Column */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1.5 min-w-[240px]">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Работы:</span>
                <span className="text-white font-semibold">{worksTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Материалы:</span>
                <span className="text-emerald-400 font-semibold">{materialsTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Скидка:</span>
                  <span className="font-bold">-{discountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-xs font-bold text-white uppercase">ИТОГО:</span>
                <span className="text-lg sm:text-xl font-black text-amber-400">
                  {grandTotal.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition cursor-pointer"
          >
            Отмена
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveEstimate(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-blue-400" />
              <span>Сохранить в черновики</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveEstimate(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSaving ? 'Сохранение...' : 'Сохранить и предложить клиенту'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
