import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Check,
  Share2,
  Send,
  Copy,
  FolderDown,
  X,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Zap,
  ListChecks,
  CheckSquare,
  Square,
  Search,
  Layers,
  Wrench,
  Package,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { CustomMaterialItem } from './FullPlumbingKitsView';
import { SavedEstimate } from '../types';

export interface ProcurementItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  purchased?: boolean; // Checkbox for shopping in store
}

interface FastProcurementListModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingType: 'apartment' | 'house';
  materialName?: string;
  onAddItemsToKit: (items: CustomMaterialItem[]) => void;
  onSaveEstimateDirectly?: (estimate: SavedEstimate) => void;
}

// 1. Ready Turnkey Procurement Kits (1-Click Kits)
interface ProcurementKitTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  items: Omit<ProcurementItem, 'id' | 'purchased'>[];
}

const PROCUREMENT_KITS: ProcurementKitTemplate[] = [
  {
    id: 'water_bathroom',
    name: 'Водоразбор санузла (Квартира)',
    icon: '🚿',
    description: 'Вводные краны, фильтры, редукторы, гребенки, труба и водорозетки',
    items: [
      { name: 'Кран шаровый латунный 1/2" Bugatti/Valtec', category: 'Запорная арматура', unit: 'шт', quantity: 2, pricePerUnit: 750 },
      { name: 'Фильтр косой механической очистки 1/2" 300 мкм', category: 'Фильтрация', unit: 'шт', quantity: 2, pricePerUnit: 560 },
      { name: 'Редуктор давления мембранный 1/2" с манометром', category: 'Арматура', unit: 'шт', quantity: 2, pricePerUnit: 3600 },
      { name: 'Коллектор распределительный 3/4" на 4 выхода с кранами', category: 'Коллекторы', unit: 'шт', quantity: 2, pricePerUnit: 3400 },
      { name: 'Труба сшитый полиэтилен / ППР Ø16-20 мм', category: 'Трубы', unit: 'м', quantity: 30, pricePerUnit: 120 },
      { name: 'Водорозетка настенная 16/20х1/2" ВР', category: 'Фитинги', unit: 'шт', quantity: 6, pricePerUnit: 280 },
      { name: 'Уголок 90° соединительный 16/20 мм', category: 'Фитинги', unit: 'шт', quantity: 10, pricePerUnit: 65 },
      { name: 'Тройник равнопроходной 16/20 мм', category: 'Фитинги', unit: 'шт', quantity: 6, pricePerUnit: 95 },
      { name: 'Клипса одинарная для труб Ø16-20 мм', category: 'Крепеж', unit: 'шт', quantity: 30, pricePerUnit: 15 },
      { name: 'Лен сантехнический + паста уплотнительная 65г', category: 'Расходники', unit: 'компл', quantity: 1, pricePerUnit: 340 },
    ],
  },
  {
    id: 'drainage_bathroom',
    name: 'Канализация санузла (Комплект)',
    icon: '🚽',
    description: 'Трубы 110 и 50, отводы 45°, тройники, манжеты и смазка',
    items: [
      { name: 'Труба канализационная Ø110 1000 мм', category: 'Канализация', unit: 'шт', quantity: 2, pricePerUnit: 380 },
      { name: 'Труба канализационная Ø50 2000 мм', category: 'Канализация', unit: 'шт', quantity: 2, pricePerUnit: 240 },
      { name: 'Отвод канализационный 110 мм на 45°', category: 'Канализация', unit: 'шт', quantity: 3, pricePerUnit: 160 },
      { name: 'Отвод канализационный 50 мм на 45°', category: 'Канализация', unit: 'шт', quantity: 6, pricePerUnit: 70 },
      { name: 'Тройник канализационный 110х110х87°', category: 'Канализация', unit: 'шт', quantity: 1, pricePerUnit: 290 },
      { name: 'Тройник канализационный 110х50х45°', category: 'Канализация', unit: 'шт', quantity: 2, pricePerUnit: 240 },
      { name: 'Переход редукционный 110х50', category: 'Канализация', unit: 'шт', quantity: 1, pricePerUnit: 110 },
      { name: 'Манжета переходная резиновая 50х32/40', category: 'Канализация', unit: 'шт', quantity: 3, pricePerUnit: 85 },
      { name: 'Хомут канализационный с дюбелем Ø110/50', category: 'Крепеж', unit: 'шт', quantity: 6, pricePerUnit: 95 },
      { name: 'Смазка сантехническая силиконовая 150г', category: 'Расходники', unit: 'шт', quantity: 1, pricePerUnit: 220 },
    ],
  },
  {
    id: 'heating_radiator',
    name: 'Подключение радиаторов отопления',
    icon: '♨️',
    description: 'Терморегулирующие краны, американки, трубы, байпас и крепеж',
    items: [
      { name: 'Комплект радиаторный термостатический 1/2" (клапан + термоголовка)', category: 'Отопление', unit: 'компл', quantity: 2, pricePerUnit: 2800 },
      { name: 'Кран радиаторный настроечный 1/2"', category: 'Отопление', unit: 'шт', quantity: 2, pricePerUnit: 850 },
      { name: 'Разъемное соединение (американка) угловая 1/2"', category: 'Фитинги', unit: 'шт', quantity: 4, pricePerUnit: 420 },
      { name: 'Труба отопления армированная Ø20 мм', category: 'Трубы', unit: 'м', quantity: 10, pricePerUnit: 160 },
      { name: 'Кран Маевского для спуска воздуха 1/2"', category: 'Арматура', unit: 'шт', quantity: 2, pricePerUnit: 120 },
      { name: 'Кронштейн радиаторный анкерный усиленный', category: 'Крепеж', unit: 'шт', quantity: 4, pricePerUnit: 150 },
    ],
  },
  {
    id: 'sanitary_appliances',
    name: 'Чистовая сантехника (Ванна, раковина)',
    icon: '🛁',
    description: 'Сифоны, гибкая подводка, герметик, эксцентрики',
    items: [
      { name: 'Сифон для ванны автомат / полуавтомат с переливом', category: 'Сантехприборы', unit: 'шт', quantity: 1, pricePerUnit: 1850 },
      { name: 'Сифон для раковины бутылочный с донным клапаном', category: 'Сантехприборы', unit: 'шт', quantity: 1, pricePerUnit: 1200 },
      { name: 'Подводка гибкая нержавеющая для смесителей 1/2" 50 см', category: 'Подводка', unit: 'шт', quantity: 2, pricePerUnit: 380 },
      { name: 'Герметик сантехнический силиконовый бесцветный', category: 'Расходники', unit: 'шт', quantity: 1, pricePerUnit: 480 },
      { name: 'Эксцентрики сантехнические с отражателями 3/4"х1/2"', category: 'Фитинги', unit: 'компл', quantity: 1, pricePerUnit: 350 },
      { name: 'Лента уплотнительная ФУМ профессиональная', category: 'Расходники', unit: 'шт', quantity: 1, pricePerUnit: 180 },
    ],
  },
  {
    id: 'consumables_toolbox',
    name: 'Расходники и ремкомплект сантехника',
    icon: '🧰',
    description: 'Ниппели, футорки, заглушки, прокладки, лен и крепежи',
    items: [
      { name: 'Ниппель переходной/прямой латунный 1/2"', category: 'Резьбовые фитинги', unit: 'шт', quantity: 4, pricePerUnit: 110 },
      { name: 'Футорка переходная латунная 3/4"х1/2"', category: 'Резьбовые фитинги', unit: 'шт', quantity: 2, pricePerUnit: 140 },
      { name: 'Заглушка резьбовая 1/2" латунь с прокладкой', category: 'Резьбовые фитинги', unit: 'шт', quantity: 4, pricePerUnit: 75 },
      { name: 'Муфта соединительная резьбовая 1/2"', category: 'Резьбовые фитинги', unit: 'шт', quantity: 2, pricePerUnit: 130 },
      { name: 'Набор прокладок сантехнических (паронит / резина)', category: 'Расходники', unit: 'уп', quantity: 1, pricePerUnit: 220 },
      { name: 'Паста сантехническая уплотнительная Unipak 65г', category: 'Расходники', unit: 'шт', quantity: 1, pricePerUnit: 320 },
      { name: 'Хомуты сантехнические со шпильками 1/2"-3/4"', category: 'Крепеж', unit: 'шт', quantity: 6, pricePerUnit: 95 },
    ],
  },
];

// 2. Fast 1-Tap Fitting Selector Items by Diameters
interface QuickFittingButton {
  title: string;
  icon: string;
  category: string;
  unit: string;
  pricePerUnit: number;
}

const QUICK_FITTING_BUTTONS: QuickFittingButton[] = [
  { title: 'Уголок 90°', icon: '📐', category: 'Фитинги', unit: 'шт', pricePerUnit: 65 },
  { title: 'Уголок 45°', icon: '📐', category: 'Фитинги', unit: 'шт', pricePerUnit: 70 },
  { title: 'Тройник равнопроходной', icon: '⫚', category: 'Фитинги', unit: 'шт', pricePerUnit: 95 },
  { title: 'Тройник переходной', icon: '⫚', category: 'Фитинги', unit: 'шт', pricePerUnit: 120 },
  { title: 'Муфта соединительная', icon: '🔗', category: 'Фитинги', unit: 'шт', pricePerUnit: 55 },
  { title: 'Муфта переходная', icon: '🔗', category: 'Фитинги', unit: 'шт', pricePerUnit: 75 },
  { title: 'Муфта комб. 1/2" ВР', icon: '🔩', category: 'Комбинированные', unit: 'шт', pricePerUnit: 240 },
  { title: 'Муфта комб. 1/2" НР', icon: '🔩', category: 'Комбинированные', unit: 'шт', pricePerUnit: 220 },
  { title: 'Водорозетка настенная 1/2" ВР', icon: '🚰', category: 'Водорозетки', unit: 'шт', pricePerUnit: 280 },
  { title: 'Американка (разъемное соед.)', icon: '⚙️', category: 'Фитинги', unit: 'шт', pricePerUnit: 440 },
  { title: 'Кран шаровый полнопроходной', icon: '🔴', category: 'Краны', unit: 'шт', pricePerUnit: 750 },
  { title: 'Обратный клапан пружинный', icon: '↩️', category: 'Арматура', unit: 'шт', pricePerUnit: 490 },
  { title: 'Фильтр косой 300 мкм', icon: '🧹', category: 'Фильтрация', unit: 'шт', pricePerUnit: 560 },
  { title: 'Ниппель латунный', icon: '🧱', category: 'Резьбовые', unit: 'шт', pricePerUnit: 110 },
  { title: 'Труба (бухта/метры)', icon: '➰', category: 'Трубы', unit: 'м', pricePerUnit: 120 },
  { title: 'Клипсы одинарные для труб', icon: '📎', category: 'Крепеж', unit: 'шт', pricePerUnit: 15 },
  { title: 'Лён сантехнический + паста', icon: '🧵', category: 'Расходники', unit: 'компл', pricePerUnit: 340 },
  { title: 'Герметик сантехнический', icon: '🧪', category: 'Расходники', unit: 'шт', pricePerUnit: 480 },
];

export const FastProcurementListModal: React.FC<FastProcurementListModalProps> = ({
  isOpen,
  onClose,
  buildingType,
  materialName = 'Полипропилен / PEX',
  onAddItemsToKit,
  onSaveEstimateDirectly,
}) => {
  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [selectedDiameter, setSelectedDiameter] = useState<string>('20 мм');
  const [customInput, setCustomInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isStoreMode, setIsStoreMode] = useState<boolean>(false); // Store checklist mode
  const [hidePurchased, setHidePurchased] = useState<boolean>(false); // Exclude completed items from view
  const [showPriceBanner, setShowPriceBanner] = useState<boolean>(false); // Compact preliminary cost banner toggle

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add items from a ready turnkey kit
  const handleApplyKit = (kit: ProcurementKitTemplate) => {
    const newItems: ProcurementItem[] = kit.items.map((it, idx) => ({
      ...it,
      id: `kit_${kit.id}_${Date.now()}_${idx}`,
      purchased: false,
    }));

    setItems((prev) => [...prev, ...newItems]);
    showToast(`✓ Набор «${kit.name}» добавлен в список (${newItems.length} поз.)`);
  };

  // Fast 1-Tap matrix adder (+1, +5, +10)
  const handleQuickAddFitting = (fitting: QuickFittingButton, qtyToAdd: number) => {
    const fullName = `${fitting.title} ${selectedDiameter}`;

    setItems((prev) => {
      const existing = prev.find((it) => it.name === fullName);
      if (existing) {
        return prev.map((it) =>
          it.id === existing.id ? { ...it, quantity: it.quantity + qtyToAdd } : it
        );
      }
      return [
        {
          id: `fast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: fullName,
          category: fitting.category,
          unit: fitting.unit,
          quantity: qtyToAdd,
          pricePerUnit: fitting.pricePerUnit,
          purchased: false,
        },
        ...prev,
      ];
    });

    showToast(`+${qtyToAdd} ${fullName}`);
  };

  // Custom text add
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const name = customInput.trim();
    setItems((prev) => [
      {
        id: `custom_${Date.now()}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        category: 'Спецзаказ',
        unit: 'шт',
        quantity: 1,
        pricePerUnit: 350,
        purchased: false,
      },
      ...prev,
    ]);
    setCustomInput('');
    showToast(`✓ Добавлено: ${name}`);
  };

  // Update item quantity
  const handleUpdateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  // Toggle purchased checkbox (Store Mode)
  const handleTogglePurchased = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, purchased: !it.purchased } : it))
    );
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Calculations
  const totalCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const totalSum = items.reduce((acc, it) => acc + it.quantity * it.pricePerUnit, 0);
  const purchasedCount = items.filter((it) => it.purchased).length;

  const handleExcludePurchased = () => {
    if (purchasedCount === 0) return;
    setItems((prev) => prev.filter((it) => !it.purchased));
    showToast(`Исключено ${purchasedCount} купленных позиций для удобства списка`);
  };

  const filteredItems = useMemo(() => {
    let res = items;
    if (hidePurchased) {
      res = res.filter((it) => !it.purchased);
    }
    if (!searchQuery.trim()) return res;
    const q = searchQuery.toLowerCase();
    return res.filter((it) => it.name.toLowerCase().includes(q) || it.category.toLowerCase().includes(q));
  }, [items, searchQuery, hidePurchased]);

  if (!isOpen) return null;

  // Format order text for WhatsApp / Telegram
  const getFormattedOrderText = () => {
    const bld = buildingType === 'house' ? 'Частный дом 🏠' : 'Квартира 🏢';
    const dateStr = new Date().toLocaleDateString('ru-RU');
    let text = `🛒 *СПИСОК ЗАКУПКИ САНТЕХНИКИ «САНТЕХПРО»*\n`;
    text += `Объект: ${bld} (${materialName})\n`;
    text += `Дата: ${dateStr}\n\n`;
    text += `*Позиции для закупки (${items.length} шт):*\n`;

    items.forEach((it, idx) => {
      const statusMark = it.purchased ? '✅ ' : '▫️ ';
      const sum = (it.quantity * it.pricePerUnit).toLocaleString('ru-RU');
      text += `${statusMark}${idx + 1}. *${it.name}* — ${it.quantity} ${it.unit} (~${sum} ₽)\n`;
    });

    text += `\n📦 *Всего единиц:* ${totalCount}`;
    text += `\n💰 *Ориентировочная сумма:* ${totalSum.toLocaleString('ru-RU')} ₽\n`;
    text += `\nСформировано в «СантехПро» — экспресс-лист закупки`;
    return text;
  };

  const handleSendWhatsApp = () => {
    if (items.length === 0) {
      showToast('Добавьте хотя бы одну позицию в список');
      return;
    }
    const msg = getFormattedOrderText();
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleSendTelegram = () => {
    if (items.length === 0) {
      showToast('Добавьте хотя бы одну позицию в список');
      return;
    }
    const msg = getFormattedOrderText();
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://santehpro.info')}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    if (items.length === 0) {
      showToast('Список пуст');
      return;
    }
    const msg = getFormattedOrderText();
    navigator.clipboard.writeText(msg);
    setCopied(true);
    showToast('Список закупки скопирован!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Transfer into project specification
  const handleAddToMainKit = () => {
    if (items.length === 0) {
      showToast('Список пуст');
      return;
    }
    const customList: CustomMaterialItem[] = items.map((it) => ({
      id: 'procure_' + it.id,
      name: it.name,
      category: 'fittings',
      categoryName: it.category,
      unit: it.unit,
      quantity: it.quantity,
      pricePerUnit: it.pricePerUnit,
      description: 'Из экспресс-списка закупки',
    }));

    onAddItemsToKit(customList);
    showToast(`✓ В основную спецификацию добавлено ${customList.length} позиций!`);
    onClose();
  };

  // Save to user estimates
  const handleSaveDirectly = () => {
    if (items.length === 0) {
      showToast('Список пуст, нечего сохранять');
      return;
    }

    const bld = buildingType === 'house' ? 'Дом 🏠' : 'Квартира 🏢';
    const estimateName = `Список закупки [${bld}] — ${new Date().toLocaleDateString('ru-RU')}`;

    const estimateItems = items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unit: it.unit,
      price: it.pricePerUnit,
      total: it.quantity * it.pricePerUnit,
      category: it.category,
    }));

    const savedEst: SavedEstimate = {
      id: 'est_procure_' + Date.now(),
      name: estimateName,
      createdAt: new Date().toISOString(),
      pipeLength: 20,
      selectedPoints: ['sink_bath', 'toilet', 'washing_machine'],
      pipeType: 'ppr_20',
      wiringScheme: 'collector',
      reserveMargin: 10,
      includePressureReducers: true,
      use45Elbows: true,
      includeBypasses: true,
      grandTotal: totalSum,
      totalPointsCount: 3,
      totalLinesCount: items.length,
      pipeName: `Список закупки (${materialName})`,
      kitType: buildingType,
      items: estimateItems,
    };

    try {
      const local = localStorage.getItem('plumbing_saved_estimates');
      const list: SavedEstimate[] = local ? JSON.parse(local) : [];
      const updated = [savedEst, ...list];
      localStorage.setItem('plumbing_saved_estimates', JSON.stringify(updated));
      if (onSaveEstimateDirectly) {
        onSaveEstimateDirectly(savedEst);
      }
      showToast(`Список «${estimateName}» сохранен в Мои сметы!`);
    } catch (e) {
      console.error('Error saving procurement list:', e);
      showToast('Ошибка при сохранении');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[94vh]">
        {/* Header: Fast Procurement Builder */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>Экспресс-лист закупок</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {buildingType === 'house' ? 'Частный дом 🏠' : 'Квартира 🏢'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Быстрый подбор фитингов и материалов в 1 клик для отправки в магазин или заказчику
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

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Toast */}
          {toastMessage && (
            <div className="p-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-slate-950 font-extrabold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* 1. Готовые наборы закупки под задачу (в 1 клик) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Готовые комплекты закупки под задачу (в 1 тап):</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Сразу заполняет полный перечень
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PROCUREMENT_KITS.map((kit) => (
                <button
                  key={kit.id}
                  type="button"
                  onClick={() => handleApplyKit(kit)}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 text-left transition flex items-start space-x-3 cursor-pointer group active:scale-[0.98] shadow-sm"
                >
                  <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform shrink-0">
                    {kit.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition truncate">
                      {kit.name}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {kit.description}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-400 mt-1">
                      + {kit.items.length} позиций в список
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Быстрый набор фитингов (One-Tap Matrix) с выбором диаметра */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <span className="font-extrabold text-slate-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Быстрый кликер фитингов: выберите диаметр и жмите +1 / +5:</span>
              </span>

              {/* Diameter selector pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['16 мм', '20 мм', '25 мм', '32 мм', '1/2"', '3/4"', '1"'].map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => setSelectedDiameter(dia)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      selectedDiameter === dia
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick matrix tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {QUICK_FITTING_BUTTONS.map((f, i) => {
                const fullName = `${f.title} ${selectedDiameter}`;
                const curInList = items.find((it) => it.name === fullName)?.quantity || 0;

                return (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-2 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-base mb-1">
                        <span>{f.icon}</span>
                        {curInList > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                            {curInList}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-slate-200 leading-tight line-clamp-2">
                        {f.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ~{f.pricePerUnit} ₽
                      </div>
                    </div>

                    <div className="flex items-center gap-1 pt-1 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => handleQuickAddFitting(f, 1)}
                        className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-300 font-black text-xs transition cursor-pointer active:scale-95 text-center"
                        title="Добавить 1 шт"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAddFitting(f, 5)}
                        className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-300 font-black text-xs transition cursor-pointer active:scale-95 text-center"
                        title="Добавить 5 шт"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Ручное добавление произвольного товара */}
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Добавить свой товар (например: «Коронка по бетону 68мм», «Сгон 1/2» 100мм»)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </form>

          {/* 4. Текущий список закупки без зачеркиваний, с чистым редактированием */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>В списке: {items.length} поз.</span>
                </span>

                {/* Режим отметки наличия */}
                <button
                  type="button"
                  onClick={() => setIsStoreMode(!isStoreMode)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isStoreMode
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                  title="Отметка наличия или покупки"
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>{isStoreMode ? `Отметки (${purchasedCount}/${items.length})` : 'Отмечать купленное'}</span>
                </button>

                {/* Исключить купленные (кнопка очистки зачеркнутого/готового) */}
                {purchasedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleExcludePurchased}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition flex items-center gap-1 cursor-pointer"
                    title="Исключить все отмеченные/купленные позиции из списка"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    <span>Исключить купленные ({purchasedCount})</span>
                  </button>
                )}

                {/* Фильтр скрыть купленные */}
                {purchasedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setHidePurchased(!hidePurchased)}
                    className={`px-2 py-1 rounded-xl text-xs transition cursor-pointer ${
                      hidePurchased
                        ? 'bg-slate-700 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {hidePurchased ? 'Показать все' : 'Скрыть купленные'}
                  </button>
                )}
              </div>

              {items.length > 0 && (
                <div className="flex items-center gap-2">
                  {/* Кнопка предварительной стоимости в компактном баннере */}
                  <button
                    type="button"
                    onClick={() => setShowPriceBanner(!showPriceBanner)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      showPriceBanner
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                    title="Показать предварительный расчет стоимости в компактном баннере"
                  >
                    <span>💰</span>
                    <span>{showPriceBanner ? 'Скрыть стоимость' : 'Предварительная стоимость'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItems([])}
                    className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-800"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Очистить</span>
                  </button>
                </div>
              )}
            </div>

            {/* Компактный баннер предварительной стоимости (появляется только по нажатию кнопки) */}
            {showPriceBanner && items.length > 0 && (
              <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 text-sm">
                    💰
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Предварительная стоимость:
                    </span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-base sm:text-lg font-black text-emerald-300">
                        ~{totalSum.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({items.length} поз., {totalCount} ед.)
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPriceBanner(false)}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0 cursor-pointer"
                >
                  ✕ Скрыть
                </button>
              </div>
            )}

            {/* List Rows — без зачеркнутых элементов, чистый удобный список */}
            {filteredItems.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
                <ShoppingCart className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-400">
                  {items.length > 0 && hidePurchased
                    ? 'Все купленные позиции скрыты фильтром'
                    : 'Список покупок пока пуст'}
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Нажмите на любой готовый комплект сверху или кликайте по нужным фитингам (+1, +5), чтобы быстро собрать перечень за 30 секунд.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {filteredItems.map((it, idx) => (
                  <div
                    key={it.id}
                    className={`p-2.5 sm:p-3 rounded-xl border transition flex items-center justify-between gap-3 text-xs ${
                      it.purchased
                        ? 'bg-slate-900/60 border-emerald-900/40 text-slate-200'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    {/* Checkbox in Store Mode */}
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      {isStoreMode && (
                        <button
                          type="button"
                          onClick={() => handleTogglePurchased(it.id)}
                          className="text-emerald-400 hover:text-emerald-300 cursor-pointer shrink-0"
                          title="Отметить как купленное"
                        >
                          {it.purchased ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      )}

                      <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-white truncate">
                            {it.name}
                          </span>
                          {it.purchased && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                              ✓ Куплено
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-slate-500">{it.category}</span>
                          <span>•</span>
                          <span className="text-cyan-400 font-bold">{it.quantity} {it.unit}</span>
                          {/* Цена видна только при нажатой кнопке предварительной стоимости */}
                          {showPriceBanner && (
                            <>
                              <span>•</span>
                              <span>~{it.pricePerUnit} ₽/{it.unit}</span>
                              <span>•</span>
                              <span className="font-bold text-emerald-400">
                                Всего: {(it.quantity * it.pricePerUnit).toLocaleString('ru-RU')} ₽
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(it.id, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-white min-w-6 text-center">
                          {it.quantity} {it.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(it.id, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(it.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Summary & Share / Export Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-left w-full sm:w-auto">
            {showPriceBanner ? (
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">ПРЕДВАРИТЕЛЬНАЯ СТОИМОСТЬ:</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">
                    ~{totalSum.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-xs text-slate-400">
                    ({items.length} поз., {totalCount} ед.)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPriceBanner(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 ml-2 cursor-pointer underline"
                  >
                    Скрыть
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="text-xs font-bold text-slate-300">
                  Позиций в закупке: <span className="text-white font-black">{items.length}</span> ({totalCount} ед.)
                </div>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPriceBanner(true)}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Показать предварительный расчет стоимости"
                  >
                    <span>💰</span>
                    <span>Предварительная стоимость</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={items.length === 0}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Отправить список закупки в WhatsApp"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              type="button"
              onClick={handleSendTelegram}
              disabled={items.length === 0}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800/80 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Отправить в Telegram"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Telegram</span>
            </button>

            {/* Copy */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={items.length === 0}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Скопировать перечень"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>

            {/* Save directly */}
            <button
              type="button"
              onClick={handleSaveDirectly}
              disabled={items.length === 0}
              className="px-3 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Сохранить в Мои сметы"
            >
              <FolderDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Сохранить</span>
            </button>

            {/* Add to main kit specification */}
            <button
              type="button"
              onClick={handleAddToMainKit}
              disabled={items.length === 0}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 border border-emerald-400/40 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>В спецификацию</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Also export as VoiceFittingsProcurementModal for backward-compatibility alias
export const VoiceFittingsProcurementModal = FastProcurementListModal;
