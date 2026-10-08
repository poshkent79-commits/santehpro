// src/components/ServiceAndPartsToolkit.tsx
// Полный инструментарий для эффективной работы мастеров по ремонту сантехники и водонагревателей:
// подбор запчастей, инженерные чертежи, экспресс-диагностика, расчет параметров бойлера и быстрый лист закупки.

import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Flame,
  Zap,
  ShieldAlert,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Layers,
  Clock,
  Compass,
  FileText,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Maximize2,
  BookOpen,
  Send,
  Droplets,
  Gauge,
  CheckSquare,
  Square,
  Info
} from 'lucide-react';
import {
  SPARE_PARTS_CATALOG,
  BOILER_BRANDS_PRESETS,
  REPAIR_SYMPTOMS_MATRIX,
  SparePartItem,
  PartCategory,
  BoilerBrandPreset,
  RepairSymptomGuide
} from '../data/serviceAndPartsData';

interface ServiceAndPartsToolkitProps {
  onOpenArticleById?: (articleId: string) => void;
  onNavigateToDiagnostic?: () => void;
  initialSubTab?: 'parts' | 'diagnostics' | 'drawings' | 'calculator';
}

interface ProcurementCartItem {
  part: SparePartItem;
  quantity: number;
  purchased?: boolean;
}

export const ServiceAndPartsToolkit: React.FC<ServiceAndPartsToolkitProps> = ({
  onOpenArticleById,
  onNavigateToDiagnostic,
  initialSubTab = 'parts',
}) => {
  // Navigation Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<'parts' | 'diagnostics' | 'drawings' | 'calculator'>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Spare Parts State & Filters
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<PartCategory | 'all'>('all');
  const [partsSearchQuery, setPartsSearchQuery] = useState<string>('');
  const [selectedPartModal, setSelectedPartModal] = useState<SparePartItem | null>(null);

  // Diagnostics State
  const [diagnosticsFilter, setDiagnosticsFilter] = useState<'all' | 'boiler' | 'plumbing'>('all');
  const [selectedSymptomId, setSelectedSymptomId] = useState<string>(REPAIR_SYMPTOMS_MATRIX[0].id);

  // Water Heater Engineering Calculator State
  const [tankVolumeLiters, setTankVolumeLiters] = useState<number>(80);
  const [inletTempC, setInletTempC] = useState<number>(10);
  const [targetTempC, setTargetTempC] = useState<number>(65);
  const [heaterPowerKw, setHeaterPowerKw] = useState<number>(2.0);
  const [waterPressureBar, setWaterPressureBar] = useState<number>(3.5);

  // Drawings viewer state
  const [activeDrawingId, setActiveDrawingId] = useState<'boiler_piping' | 'ppr_welding'>('boiler_piping');
  const [isZoomedDrawing, setIsZoomedDrawing] = useState<boolean>(false);

  // Master Procurement Cart (Быстрый список закупки для мастера / поставщика)
  const [cartItems, setCartItems] = useState<ProcurementCartItem[]>(() => {
    try {
      const saved = localStorage.getItem('santehpro_parts_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [customPartName, setCustomPartName] = useState<string>('');
  const [orderClientNote, setOrderClientNote] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Save cart to local storage
  const saveCart = (items: ProcurementCartItem[]) => {
    setCartItems(items);
    try {
      localStorage.setItem('santehpro_parts_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  };

  const handleAddToCart = (part: SparePartItem, qty: number = 1) => {
    const existingIndex = cartItems.findIndex((c) => c.part.id === part.id);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += qty;
      saveCart(updated);
    } else {
      saveCart([...cartItems, { part, quantity: qty, purchased: false }]);
    }
    showToast(`«${part.name}» добавлено в список закупки!`);
  };

  const handleRemoveFromCart = (partId: string) => {
    saveCart(cartItems.filter((c) => c.part.id !== partId));
  };

  const handleUpdateCartQty = (partId: string, delta: number) => {
    const updated = cartItems
      .map((c) => {
        if (c.part.id === partId) {
          const newQty = Math.max(0, c.quantity + delta);
          return { ...c, quantity: newQty };
        }
        return c;
      })
      .filter((c) => c.quantity > 0);
    saveCart(updated);
  };

  const handleTogglePurchased = (partId: string) => {
    const updated = cartItems.map((c) =>
      c.part.id === partId ? { ...c, purchased: !c.purchased } : c
    );
    saveCart(updated);
  };

  const handleAddCustomItem = () => {
    if (!customPartName.trim()) return;
    const customPart: SparePartItem = {
      id: `custom-${Date.now()}`,
      name: customPartName.trim(),
      category: 'valves_safety',
      categoryLabel: 'Пользовательская деталь',
      articleNumber: 'ПОСТАВЩИК / СПЕЦЗАКАЗ',
      brandCompatibility: ['Универсальная'],
      fittingType: 'Подбор по месту',
      dimensions: 'По образцу',
      description: 'Специальная позиция, добавленная мастером вручную для объекта.',
      keySpecs: ['Добавлено мастером'],
      inStockTypical: true,
      unit: 'шт',
    };
    saveCart([...cartItems, { part: customPart, quantity: 1, purchased: false }]);
    setCustomPartName('');
    showToast('Деталь добавлена в список закупки!');
  };

  const handleClearCart = () => {
    if (window.confirm('Очистить весь сформированный список закупки?')) {
      saveCart([]);
    }
  };

  const showToast = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return SPARE_PARTS_CATALOG.filter((part) => {
      // Category filter
      if (selectedCategory !== 'all' && part.category !== selectedCategory) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== 'all') {
        const matchesBrand = part.brandCompatibility.some(
          (b) => b.toLowerCase().includes(selectedBrand.toLowerCase()) || b.includes('Универсальный')
        );
        if (!matchesBrand) return false;
      }
      // Text search
      if (partsSearchQuery.trim()) {
        const q = partsSearchQuery.toLowerCase();
        const inName = part.name.toLowerCase().includes(q);
        const inArticle = part.articleNumber.toLowerCase().includes(q);
        const inFitting = part.fittingType.toLowerCase().includes(q);
        const inDesc = part.description.toLowerCase().includes(q);
        const inSpecs = part.keySpecs.some((s) => s.toLowerCase().includes(q));
        if (!inName && !inArticle && !inFitting && !inDesc && !inSpecs) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedBrand, partsSearchQuery]);

  // Selected Active Symptom
  const currentSymptom = useMemo(() => {
    return REPAIR_SYMPTOMS_MATRIX.find((s) => s.id === selectedSymptomId) || REPAIR_SYMPTOMS_MATRIX[0];
  }, [selectedSymptomId]);

  // Boiler Calculations
  const boilerCalculations = useMemo(() => {
    // T = (V * deltaT * 1.163) / (P_watts) в часах
    const deltaT = Math.max(1, targetTempC - inletTempC);
    // 1 литр нагреть на 1 градус = 1 ккал = 0.001163 кВт*ч
    const energyKwh = (tankVolumeLiters * deltaT * 0.001163);
    const powerKw = Math.max(0.5, heaterPowerKw);
    const totalHours = energyKwh / powerKw;
    const totalMinutes = Math.round(totalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    // Расчет теплового расширения воды (Thermal expansion)
    // Вода при нагреве от 10 до 65 градусов расширяется примерно на 2.4 - 3.2%
    const expansionRatio = (deltaT / 100) * 0.045; // ~2.8% для 60 градусов
    const expansionVolumeLiters = Number((tankVolumeLiters * expansionRatio).toFixed(2));

    // Рекомендуемый объем расширительного бака ГВС (компенсатора)
    // V_exp = (V_tank * e) / (1 - (P_precharge + 1) / (P_safety + 1))
    const safetyValvePressureBar = 6.0;
    const prechargePressureBar = Math.max(1.5, waterPressureBar - 0.2);
    const pressureFactor = 1 - (prechargePressureBar + 1) / (safetyValvePressureBar + 1);
    const recommendedExpansionTankLiters = Math.ceil(
      Math.max(2, expansionVolumeLiters / Math.max(0.2, pressureFactor))
    );

    // Электрические параметры
    const currentAmperes = Number(((powerKw * 1000) / 220).toFixed(1));
    const recommendedBreakerAmps = currentAmperes > 10 ? 16 : 10;
    const cableCrossSection = powerKw > 2.5 ? '3 × 2.5 мм² (ВВГнг-LS)' : '3 × 1.5 - 2.5 мм² (ВВГнг-LS)';
    const recommendedRcd = 'УЗО 16А 10мА (класс А / АС) либо дифавтомат С16/10мА';

    return {
      deltaT,
      energyKwh: Number(energyKwh.toFixed(2)),
      totalMinutes,
      formattedTime: `${hours > 0 ? `${hours} ч ` : ''}${mins} мин`,
      expansionVolumeLiters,
      recommendedExpansionTankLiters,
      currentAmperes,
      recommendedBreakerAmps,
      cableCrossSection,
      recommendedRcd,
    };
  }, [tankVolumeLiters, inletTempC, targetTempC, heaterPowerKw, waterPressureBar]);

  // Format Procurement List for Clipboard / WhatsApp (Без цен — чистый список для закупки)
  const generateCleanProcurementText = () => {
    let text = `📋 СПИСОК ЗАПЧАСТЕЙ ДЛЯ ЗАКУПКИ (САНТЕХПРО)\n`;
    text += `Дата: ${new Date().toLocaleDateString('ru-RU')} в ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n`;
    if (orderClientNote.trim()) {
      text += `📍 Объект / Модель: ${orderClientNote.trim()}\n`;
    }
    text += `───────────────────────────────────\n`;

    if (cartItems.length === 0) {
      text += `Список закупки пуст.\n`;
    } else {
      cartItems.forEach((item, idx) => {
        const check = item.purchased ? '✅' : '▫️';
        text += `${idx + 1}. ${check} ${item.part.name}\n`;
        text += `   • Кол-во: ${item.quantity} ${item.part.unit}\n`;
        text += `   • Артикул: ${item.part.articleNumber}\n`;
        text += `   • Посадка: ${item.part.fittingType}\n`;
        text += `   • Параметры: ${item.part.dimensions}\n`;
      });
    }

    text += `───────────────────────────────────\n`;
    text += `Всего позиций: ${cartItems.reduce((acc, c) => acc + c.quantity, 0)} шт.\n`;
    text += `Сформировано мастером в приложении «СантехПро»\n`;
    return text;
  };

  const copyProcurementList = () => {
    const text = generateCleanProcurementText();
    navigator.clipboard.writeText(text);
    showToast('Список закупки скопирован в буфер обмена!');
  };

  const sendToWhatsApp = () => {
    const text = generateCleanProcurementText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const sendToTelegram = () => {
    const text = generateCleanProcurementText();
    const url = `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Hero Header: Full-width master workbench banner */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Профессиональный инструментарий мастера</span>
              <span className="text-slate-400">•</span>
              <span className="text-cyan-300">Водонагреватели & Сантехника</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Ремонт водонагревателей и сантехники: подбор запчастей, схемы и чертежи
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Комплексный инженерный модуль для выездных специалистов: экспресс-подбор ТЭНов, анодов, прокладок,
              картриджей и арматуры, точные чертежи узлов монтажа, алгоритмы диагностики и чистый список закупки в один клик.
            </p>
          </div>

          {/* Quick Stat / Action Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="px-3.5 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
              <span className="block text-base sm:text-lg font-black text-amber-400 leading-tight">
                {SPARE_PARTS_CATALOG.length}+
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Запчастей в базе</span>
            </div>

            <div className="px-3.5 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
              <span className="block text-base sm:text-lg font-black text-cyan-400 leading-tight">
                {BOILER_BRANDS_PRESETS.length}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Брендов бойлеров</span>
            </div>

            <button
              type="button"
              onClick={copyProcurementList}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer shrink-0"
              title="Скопировать текущий сформированный список закупки"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              <span>Закупка ({cartItems.length})</span>
            </button>
          </div>
        </div>

        {/* Main Mode Sub-Navigation Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('parts')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center space-x-2 shrink-0 cursor-pointer ${
              activeSubTab === 'parts'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>1. Подбор запчастей</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-900/30 font-bold">
              {SPARE_PARTS_CATALOG.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('drawings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center space-x-2 shrink-0 cursor-pointer ${
              activeSubTab === 'drawings'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>2. Инженерные чертежи узлов</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-cyan-950 text-cyan-300 font-bold">
              CAD схемы
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('diagnostics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center space-x-2 shrink-0 cursor-pointer ${
              activeSubTab === 'diagnostics'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>3. Матрица неисправностей</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-rose-950 text-rose-300 font-bold">
              {REPAIR_SYMPTOMS_MATRIX.length} поломок
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('calculator')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center space-x-2 shrink-0 cursor-pointer ${
              activeSubTab === 'calculator'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>4. Калькулятор бойлера</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-950 text-emerald-300 font-bold">
              Время / Бак / Электрика
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Wide 2-Column Grid on Extra Large Screens */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Primary Section (8 cols on lg, 9 cols on 2xl) */}
        <div className="lg:col-span-8 2xl:col-span-9 space-y-6">
          {/* TAB 1: SPARE PARTS SELECTOR & CATALOG */}
          {activeSubTab === 'parts' && (
            <div className="space-y-6">
              {/* Brand Presets Quick Carousel */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Быстрый выбор по марке водонагревателя:</span>
                  </h3>
                  {selectedBrand !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedBrand('all')}
                      className="text-xs text-amber-400 hover:underline font-bold cursor-pointer"
                    >
                      Сбросить фильтр ({selectedBrand})
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {BOILER_BRANDS_PRESETS.map((bp) => {
                    const isSelected = selectedBrand.toLowerCase() === bp.brand.toLowerCase().split(' ')[0].toLowerCase();
                    return (
                      <button
                        key={bp.id}
                        type="button"
                        onClick={() => {
                          setSelectedBrand(isSelected ? 'all' : bp.brand.split(' ')[0]);
                        }}
                        className={`p-2.5 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between h-full ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-md shadow-amber-500/10'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="font-extrabold text-xs text-white leading-tight">
                          {bp.brand.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-1">
                          {bp.flangeType.split(' ')[0]} {bp.flangeType.split(' ')[1]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filters Bar: Category tabs and search */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={partsSearchQuery}
                      onChange={(e) => setPartsSearchQuery(e.target.value)}
                      placeholder="Поиск запчасти по названию, фланцу, артикулу (напр: 64 мм, овал, анод, картридж)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                    {partsSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPartsSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Reset Filters */}
                  {(selectedCategory !== 'all' || selectedBrand !== 'all' || partsSearchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedBrand('all');
                        setPartsSearchQuery('');
                      }}
                      className="px-3.5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Сбросить всё</span>
                    </button>
                  )}
                </div>

                {/* Categories Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Все запчасти
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('heaters_ten')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      selectedCategory === 'heaters_ten'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    🔥 ТЭНы (водонагреватели)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('anodes')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      selectedCategory === 'anodes'
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    🛡️ Магниевые аноды
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('thermostats')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      selectedCategory === 'thermostats'
                        ? 'bg-indigo-500 text-white font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    ⚡ Термостаты и защита
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('gaskets')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      selectedCategory === 'gaskets'
                        ? 'bg-rose-500 text-white font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    ⭕ Прокладки и фланцы
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('valves_safety')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      selectedCategory === 'valves_safety'
                        ? 'bg-blue-500 text-white font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    🚰 Сбросные клапаны
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('cartridges_mixer')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      selectedCategory === 'cartridges_mixer'
                        ? 'bg-teal-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    🚿 Картриджи смесителей
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('installation_cist')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      selectedCategory === 'installation_cist'
                        ? 'bg-purple-500 text-white font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    🚽 Арматура инсталляций
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('dielectric_hoses')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      selectedCategory === 'dielectric_hoses'
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    🔗 Диэлектрики и подводка
                  </button>
                </div>
              </div>

              {/* Parts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredParts.length === 0 ? (
                  <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
                    <Wrench className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-base font-bold text-white">Запчасти по заданным фильтрам не найдены</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Попробуйте изменить поисковый запрос или сбросить фильтрацию по бренду.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrand('all');
                        setSelectedCategory('all');
                        setPartsSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                    >
                      Показать весь каталог
                    </button>
                  </div>
                ) : (
                  filteredParts.map((part) => {
                    const inCart = cartItems.some((c) => c.part.id === part.id);
                    return (
                      <div
                        key={part.id}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col justify-between space-y-4 group transition"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              {part.categoryLabel}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                              арт. {part.articleNumber}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug group-hover:text-amber-400 transition">
                            {part.name}
                          </h4>

                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                            {part.description}
                          </p>

                          {/* Quick Specs Badges */}
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                              <span className="text-slate-500 font-semibold">Посадка:</span>
                              <span className="text-amber-300 font-bold">{part.fittingType}</span>
                            </div>
                            <div className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                              <span className="text-slate-500 font-semibold">Размеры:</span>
                              <span className="text-cyan-300 font-medium truncate">{part.dimensions}</span>
                            </div>
                            <div className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                              <span className="text-slate-500 font-semibold">Совместимость:</span>
                              <span className="text-slate-200 truncate">
                                {part.brandCompatibility.join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPartModal(part)}
                            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition cursor-pointer"
                          >
                            Подробнее
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(part, 1)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition shadow-sm cursor-pointer ${
                              inCart
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{inCart ? 'Добавить еще' : '+ В закупку'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TECHNICAL ENGINEERING BLUEPRINTS & CAD SCHEMATICS */}
          {activeSubTab === 'drawings' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                      <Compass className="w-5 h-5 text-cyan-400" />
                      <span>Инженерные чертежи и схемы из справочника мастера</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Точные технические чертежи узлов с размерами, направлением потоков и контрольными точками.
                    </p>
                  </div>

                  {/* Switch between diagrams */}
                  <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveDrawingId('boiler_piping')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        activeDrawingId === 'boiler_piping'
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Обвязка бойлера (CAD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDrawingId('ppr_welding')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        activeDrawingId === 'ppr_welding'
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Пайка ППР в разрезе
                    </button>
                  </div>
                </div>

                {/* Main Blueprint Display Card */}
                {activeDrawingId === 'boiler_piping' ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-2xl relative group">
                      <img
                        src="/src/assets/images/boiler_piping_blueprint_1791373804750.jpg"
                        alt="Чертеж безопасной обвязки бойлера"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-cover max-h-[520px] transition group-hover:scale-[1.01] duration-300"
                      />
                      <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-[11px] font-mono text-cyan-300 flex items-center space-x-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>САНТЕХПРО • ЧЕРТЕЖ УЗЛА ОБВЯЗКИ БОЙЛЕРА</span>
                      </div>
                    </div>

                    {/* Technical Blueprint Key Legend & Rules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Контрольные узлы чертежа (Холодная вода ХВС)</span>
                        </h4>
                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                          <li><strong>Синий штуцер бака:</strong> вход холодной воды с диэлектрической муфтой.</li>
                          <li><strong>Сливной тройник:</strong> устанавливается МЕЖДУ баком и сбросным клапаном с шаровым краном 1/2" для быстрого опорожнения.</li>
                          <li><strong>Предохранительный клапан 6 бар:</strong> стрелка направления потока ТОЛЬКО внутрь бака!</li>
                          <li><strong>Дренажный носик:</strong> сбросная трубка 8 мм выводится в канализацию через сифон.</li>
                        </ul>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Критически важные запреты монтажа</span>
                        </h4>
                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                          <li><strong>Запрещено:</strong> ставить любой кран между баком и клапаном сброса давления!</li>
                          <li><strong>Диэлектрическая вставка:</strong> обязательна на обоих патрубках для защиты бака от блуждающих токов.</li>
                          <li><strong>Заземление:</strong> провод 3×2.5 мм² с УЗО 10мА/16А — сохраняет жизнь жильцам!</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleAddToCart(SPARE_PARTS_CATALOG.find((p) => p.id === 'valve-safety-1-2-6bar-lever')!);
                          handleAddToCart(SPARE_PARTS_CATALOG.find((p) => p.id === 'dielectric-insert-1-2-pair')!);
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center space-x-2 transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Добавить комплект обвязки по чертежу в закупку</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950 shadow-2xl relative group">
                      <img
                        src="/src/assets/images/ppr_welding_cross_section_1791373813777.jpg"
                        alt="Инженерный чертеж разреза спайки полипропиленовой трубы"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-cover max-h-[520px] transition group-hover:scale-[1.01] duration-300"
                      />
                      <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-amber-500/40 text-[11px] font-mono text-amber-300 flex items-center space-x-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>САНТЕХПРО • ЧЕРТЕЖ РАЗРЕЗА СВАРНОГО ШВА ППР</span>
                      </div>
                    </div>

                    {/* PPR Technical Blueprint Specs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Глубина погружения трубы</div>
                        <div className="text-sm font-black text-amber-400">Ø20 = 14 мм • Ø25 = 15 мм</div>
                        <div className="text-[11px] text-slate-400">Отмечается маркером перед нагревом, чтобы не запаять внутренний просвет.</div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Температура паяльника</div>
                        <div className="text-sm font-black text-rose-400">Строго 260°C (±10°C)</div>
                        <div className="text-[11px] text-slate-400">При перегреве полипропилен теряет прочность, при недогреве шов потечет.</div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Время нагрева и фиксации</div>
                        <div className="text-sm font-black text-cyan-400">Ø20 = 5 сек • Ø25 = 7 сек</div>
                        <div className="text-[11px] text-slate-400">Соединение без вращения! Охлаждение минимум 2 минуты до подачи давления.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNOSTICS & SYMPTOM MATRIX */}
          {activeSubTab === 'diagnostics' && (
            <div className="space-y-6">
              {/* Filter: All / Boilers / Plumbing */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDiagnosticsFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    diagnosticsFilter === 'all'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Все неисправности ({REPAIR_SYMPTOMS_MATRIX.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDiagnosticsFilter('boiler')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    diagnosticsFilter === 'boiler'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Водонагреватели и бойлеры
                </button>
                <button
                  type="button"
                  onClick={() => setDiagnosticsFilter('plumbing')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    diagnosticsFilter === 'plumbing'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🚿 Сантехника и инсталляции
                </button>
              </div>

              {/* Symptom Selection Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {REPAIR_SYMPTOMS_MATRIX.filter((s) =>
                  diagnosticsFilter === 'all' ? true : s.targetType === diagnosticsFilter
                ).map((symp) => {
                  const isSelected = selectedSymptomId === symp.id;
                  return (
                    <button
                      key={symp.id}
                      type="button"
                      onClick={() => setSelectedSymptomId(symp.id)}
                      className={`p-3.5 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-rose-500/15 border-rose-500/60 text-white shadow-lg shadow-rose-950/30'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="font-extrabold text-xs sm:text-sm leading-tight text-white">
                        {symp.symptom}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {symp.shortDescription}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Symptom Comprehensive Repair Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Регламент выезда мастера
                    </span>
                    {currentSymptom.urgency === 'critical' && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-red-600 text-white animate-pulse">
                        Опасно для жизни
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                    {currentSymptom.symptom}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {currentSymptom.shortDescription}
                  </p>
                </div>

                {/* Safety Alert */}
                {currentSymptom.safetyWarning && (
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-start space-x-3">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold block text-amber-300">Внимание техника безопасности:</strong>
                      {currentSymptom.safetyWarning}
                    </div>
                  </div>
                )}

                {/* 2-Col: Causes & Diagnostics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Вероятные причины поломки:</span>
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                      {currentSymptom.probableCauses.map((cause, i) => (
                        <li key={i} className="leading-relaxed">{cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                      <span>Инструментальная проверка (шаги):</span>
                    </h4>
                    <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                      {currentSymptom.diagnosticCheckSteps.map((step, i) => (
                        <li key={i} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Repair Algorithm */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Пошаговый регламент устранения неисправности:</span>
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-200">
                    {currentSymptom.repairAlgorithm.map((step, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 leading-relaxed">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Parts for this Symptom */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span>Рекомендуемые запчасти для замены при этой поломке:</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentSymptom.recommendedParts.map((partId) => {
                      const part = SPARE_PARTS_CATALOG.find((p) => p.id === partId);
                      if (!part) return null;
                      return (
                        <div
                          key={part.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-extrabold text-xs text-white truncate">{part.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">арт. {part.articleNumber}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(part, 1)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shrink-0 transition cursor-pointer"
                          >
                            + В закупку
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WATER HEATER ENGINEERING CALCULATOR */}
          {activeSubTab === 'calculator' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                  <Gauge className="w-5 h-5 text-emerald-400" />
                  <span>Инженерный калькулятор водонагревателя мастера</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Точный расчет времени нагрева воды, теплового расширения (компенсатора) и электрических параметров для объекта.
                </p>
              </div>

              {/* Sliders and Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Tank Volume */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Объем бака бойлера:</span>
                    <span className="text-emerald-400 font-mono text-sm">{tankVolumeLiters} л</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="200"
                    step="5"
                    value={tankVolumeLiters}
                    onChange={(e) => setTankVolumeLiters(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>15л (кухня)</span>
                    <span>50л</span>
                    <span>80л</span>
                    <span>100л</span>
                    <span>200л</span>
                  </div>
                </div>

                {/* Heater Power */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Мощность ТЭНа:</span>
                    <span className="text-amber-400 font-mono text-sm">{heaterPowerKw} кВт</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[1.2, 1.5, 2.0, 2.5].map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => setHeaterPowerKw(kw)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          heaterPowerKw === kw
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {kw} кВт
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Temperature */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Нагрев с {inletTempC}°C до:</span>
                    <span className="text-cyan-400 font-mono text-sm">{targetTempC}°C</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="80"
                    step="5"
                    value={targetTempC}
                    onChange={(e) => setTargetTempC(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>45°C (Eco)</span>
                    <span>65°C (Стандарт)</span>
                    <span>80°C (Макс)</span>
                  </div>
                </div>
              </div>

              {/* Calculated Outputs Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Time & Energy */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
                    Время полного нагрева
                  </span>
                  <div className="text-2xl font-black text-white">
                    {boilerCalculations.formattedTime}
                  </div>
                  <div className="text-xs text-slate-300">
                    Расход энергии: <strong className="text-indigo-300">{boilerCalculations.energyKwh} кВт·ч</strong> (ΔT = {boilerCalculations.deltaT}°C)
                  </div>
                </div>

                {/* Thermal Expansion & Vessel */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-cyan-950/40 border border-cyan-500/30 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">
                    Объем теплового расширения
                  </span>
                  <div className="text-2xl font-black text-cyan-300">
                    +{boilerCalculations.expansionVolumeLiters} л
                  </div>
                  <div className="text-xs text-slate-300">
                    Рекомендуемый гидробак: <strong className="text-cyan-200">{boilerCalculations.recommendedExpansionTankLiters} л</strong> (чтобы клапан не капал)
                  </div>
                </div>

                {/* Electric Specs */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-amber-950/40 border border-amber-500/30 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
                    Электропитание и защита
                  </span>
                  <div className="text-2xl font-black text-amber-300">
                    {boilerCalculations.currentAmperes} А
                  </div>
                  <div className="text-xs text-slate-300 leading-snug">
                    Автомат: <strong>С{boilerCalculations.recommendedBreakerAmps}</strong> • Кабель: <strong>{boilerCalculations.cableCrossSection}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right / Sidebar: Master Fast Procurement Checklist (Чистый список закупки без цен) */}
        <div className="lg:col-span-4 2xl:col-span-3 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/30">
                  {cartItems.reduce((acc, c) => acc + c.quantity, 0)}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                    Лист закупки запчастей
                  </h3>
                  <span className="text-[10px] text-slate-400">Формирование для мастера</span>
                </div>
              </div>

              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-slate-500 hover:text-rose-400 text-xs transition cursor-pointer"
                  title="Очистить список"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Client / Model Note Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Модель бойлера / адрес объекта:
              </label>
              <input
                type="text"
                value={orderClientNote}
                onChange={(e) => setOrderClientNote(e.target.value)}
                placeholder="напр: Thermex Flat Plus IF 50V (кв. 42)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* List of Cart Items */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {cartItems.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Список пуст. Добавляйте детали из каталога кнопкой <strong>«+ В закупку»</strong>
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.part.id}
                    className={`p-3 rounded-2xl border transition flex items-start justify-between gap-2 ${
                      item.purchased
                        ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePurchased(item.part.id)}
                        className="mt-0.5 text-slate-500 hover:text-emerald-400 transition cursor-pointer shrink-0"
                        title={item.purchased ? 'Отмечено как купленное' : 'Отметить как купленное'}
                      >
                        {item.purchased ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-tight text-white">
                            {item.part.name}
                          </span>
                          {item.purchased && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ✓ Куплено
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.part.articleNumber} • {item.part.fittingType}
                        </div>
                      </div>
                    </div>

                    {/* Qty Controls */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateCartQty(item.part.id, -1)}
                        className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-emerald-300 w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCartQty(item.part.id, 1)}
                        className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Position Form */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Добавить нестандартную деталь:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customPartName}
                  onChange={(e) => setCustomPartName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
                  placeholder="напр: ТЭН Haier 1500W..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  disabled={!customPartName.trim()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* 1-Click Export Actions (WhatsApp, Telegram, Copy) */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <button
                type="button"
                onClick={copyProcurementList}
                disabled={cartItems.length === 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Скопировать список закупки</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={sendToWhatsApp}
                  disabled={cartItems.length === 0}
                  className="py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={sendToTelegram}
                  disabled={cartItems.length === 0}
                  className="py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal for Selected Part */}
      {selectedPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setSelectedPartModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300">
                {selectedPartModal.categoryLabel}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">{selectedPartModal.name}</h3>
              <div className="text-xs font-mono text-amber-400 font-bold">
                Артикул: {selectedPartModal.articleNumber}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedPartModal.description}
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Тип посадки / фланца:</span>
                <span className="text-amber-300 font-bold">{selectedPartModal.fittingType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Габариты и резьбы:</span>
                <span className="text-cyan-300 font-medium">{selectedPartModal.dimensions}</span>
              </div>
              {selectedPartModal.powerWatts && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Мощность:</span>
                  <span className="text-white font-bold">{selectedPartModal.powerWatts} Вт</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Совместимость с брендами:</span>
                <span className="text-slate-200">{selectedPartModal.brandCompatibility.join(', ')}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <strong className="text-xs text-slate-300 block">Ключевые особенности детали:</strong>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                {selectedPartModal.keySpecs.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedPartModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Закрыть
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddToCart(selectedPartModal, 1);
                  setSelectedPartModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить в закупку</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
