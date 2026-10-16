import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Check,
  ShoppingCart,
  Trash2,
  Share2,
  Copy,
  Download,
  FileText,
  X,
  Sparkles,
  Layers,
  Wrench,
  Flame,
  Zap,
  CheckCircle2,
  RotateCcw,
  SlidersHorizontal,
  Package,
  Droplets,
  ShieldCheck,
  CheckSquare,
  Square,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  BookmarkCheck,
  FolderOpen,
  Star,
  Heart
} from 'lucide-react';
import { SavedEstimate } from '../types';
import { useFavoriteMaterials } from '../hooks/useFavoriteMaterials';

import {
  QuickCatalogItem,
  CatalogCategoryKey,
  QUICK_CATALOG_ITEMS,
  CATEGORY_TABS,
  QUICK_TAG_SUGGESTIONS
} from "../data/quickCatalogItems";

export type { QuickCatalogItem, CatalogCategoryKey };
export { QUICK_CATALOG_ITEMS, CATEGORY_TABS, QUICK_TAG_SUGGESTIONS };

export interface SelectedQuickItem {
  item: QuickCatalogItem;
  quantity: number;
  purchased?: boolean;
}

interface QuickMaterialsCalculatorProps {
  onSaveEstimate?: (estimate: SavedEstimate) => void;
  onOpenSavedEstimates?: () => void;
}

/**
 * Автоматическое определение рекомендуемого количества / метража при добавлении позиции
 * Например, для трубы диаметром 20 мм сразу подставляется типовой метраж (20 м) и удобные шаги
 */
export function getAutoQuantityAndUnit(item: QuickCatalogItem): { defaultQty: number; quickIncrements: number[] } {
  // 1. Трубы и материалы с метражом (unit === 'м')
  if (item.unit === 'м') {
    const text = `${item.name} ${item.spec || ''}`.toLowerCase();
    
    // Труба 20 мм (PPR, PEX, металлопластик): типовой квартирный метраж разводки ХВС/ГВС
    if (text.includes('20') || text.includes('ø20') || text.includes('d20') || text.includes('20мм') || text.includes('20 мм')) {
      return { defaultQty: 20, quickIncrements: [4, 10, 20] };
    }
    // Труба 16 мм: контуры тёплого пола или лучевой разводки к радиаторам
    if (text.includes('16') || text.includes('ø16') || text.includes('d16') || text.includes('16мм') || text.includes('16 мм')) {
      return { defaultQty: 20, quickIncrements: [5, 10, 20] };
    }
    // Труба 25 мм: стояки / подвод к гребенкам (хлысты по 4м)
    if (text.includes('25') || text.includes('ø25') || text.includes('d25') || text.includes('25мм') || text.includes('25 мм')) {
      return { defaultQty: 12, quickIncrements: [4, 8, 12] };
    }
    // Труба 32 мм: вводная магистраль
    if (text.includes('32') || text.includes('ø32') || text.includes('d32') || text.includes('32мм') || text.includes('32 мм')) {
      return { defaultQty: 8, quickIncrements: [4, 8, 16] };
    }
    // Канализационные трубы 110 / 50 мм
    if (text.includes('110') || text.includes('50') || text.includes('канализац')) {
      return { defaultQty: 4, quickIncrements: [2, 4, 6] };
    }
    // Теплоизоляция для труб
    if (text.includes('изоляц') || text.includes('утеплител')) {
      return { defaultQty: 20, quickIncrements: [4, 10, 20] };
    }
    // Базовый метраж по умолчанию для труб
    return { defaultQty: 10, quickIncrements: [4, 10, 20] };
  }

  // 2. Рулоны и упаковки (unit === 'рулон' | 'упак')
  if (item.unit === 'рулон' || item.unit === 'упак') {
    return { defaultQty: 1, quickIncrements: [1, 2, 5] };
  }

  // 3. Штучные изделия (unit === 'шт' | 'компл')
  const text = `${item.name} ${item.category}`.toLowerCase();
  
  if (text.includes('евроконус') || text.includes('гильз')) {
    return { defaultQty: 4, quickIncrements: [2, 4, 10] };
  }
  if (text.includes('водорозетк') || text.includes('уголок') || text.includes('угольник') || text.includes('муфта') || text.includes('тройник') || text.includes('отвод') || text.includes('ниппель') || text.includes('футорка') || text.includes('удлинитель')) {
    return { defaultQty: 2, quickIncrements: [1, 2, 4] };
  }
  if (text.includes('кран') || text.includes('клапан') || text.includes('американк')) {
    return { defaultQty: 2, quickIncrements: [1, 2, 4] };
  }
  if (text.includes('хомут') || text.includes('клипс') || text.includes('скоб') || text.includes('дюбель')) {
    return { defaultQty: 10, quickIncrements: [5, 10, 20] };
  }
  if (text.includes('смесител') || text.includes('унитаз') || text.includes('ванн') || text.includes('раковин') || text.includes('инсталляц') || text.includes('сифон') || text.includes('трап')) {
    return { defaultQty: 1, quickIncrements: [1, 2, 3] };
  }

  // Единичные изделия (коллекторы, фильтры, насосы, инсталляции, ТЭНы)
  return { defaultQty: 1, quickIncrements: [1, 2, 5] };
}

export const QuickMaterialsCalculator: React.FC<QuickMaterialsCalculatorProps> = ({
  onSaveEstimate,
  onOpenSavedEstimates,
}) => {
  // Favorites hook integration
  const { isFavorite, toggleFavorite, favoriteIds } = useFavoriteMaterials();

  // Search query & category state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');
  
  // Selected Cart Items state
  const [selectedItems, setSelectedItems] = useState<SelectedQuickItem[]>(() => {
    try {
      const saved = localStorage.getItem('santehpro_quick_calc_selected');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal: View Procurement List Drawer / Modal
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState<boolean>(false);
  // Expandable quick cart preview drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  // Minimized state for floating cart bar so it never obstructs materials
  const [isBottomBarMinimized, setIsBottomBarMinimized] = useState<boolean>(false);
  // In-app confirmation modal for clearing the procurement cart (replaces blocked window.confirm)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);
  
  // Modal: Create Custom Position Modal
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState<boolean>(false);
  const [customItemName, setCustomItemName] = useState<string>('');
  const [customItemCategory, setCustomItemCategory] = useState<string>('Сопутствующие материалы');
  const [customItemUnit, setCustomItemUnit] = useState<'шт' | 'м' | 'компл' | 'упак' | 'рулон'>('шт');
  const [customItemPrice, setCustomItemPrice] = useState<number>(500);
  const [customItemQty, setCustomItemQty] = useState<number>(1);
  const [customItemSpec, setCustomItemSpec] = useState<string>('');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('santehpro_quick_calc_selected', JSON.stringify(selectedItems));
    } catch (e) {
      console.error('Failed to save quick calc cart:', e);
    }
  }, [selectedItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Map of item ID -> quantity in selected list
  const selectedMap = useMemo(() => {
    const map = new Map<string, number>();
    selectedItems.forEach((si) => {
      map.set(si.item.id, si.quantity);
    });
    return map;
  }, [selectedItems]);

  // Total count of distinct positions and total price
  const totalPositionsCount = selectedItems.length;
  const totalPrice = useMemo(() => {
    return selectedItems.reduce((acc, si) => acc + si.item.price * si.quantity, 0);
  }, [selectedItems]);

  // Filtering catalog items
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    return QUICK_CATALOG_ITEMS.filter((item) => {
      // Favorite check
      if (selectedCategoryKey === 'favorites') {
        if (!isFavorite(item.id)) return false;
      } else if (selectedCategoryKey !== 'all' && item.categoryKey !== selectedCategoryKey) {
        return false;
      }

      // Query check
      if (!q) return true;

      // Match multi-term tokens
      const searchTokens = q.split(/\s+/).filter(Boolean);
      const targetString = `${item.name} ${item.brand || ''} ${item.spec || ''} ${item.category} ${(item.tags || []).join(' ')}`.toLowerCase();

      return searchTokens.every((token) => targetString.includes(token));
    });
  }, [searchQuery, selectedCategoryKey, isFavorite]);

  // Progressive list limit for silky-smooth 60fps rendering across 700+ positions
  const [displayLimit, setDisplayLimit] = useState<number>(48);

  useEffect(() => {
    setDisplayLimit(48);
  }, [searchQuery, selectedCategoryKey]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayLimit);
  }, [filteredItems, displayLimit]);

  // Add or increment item with smart auto quantity & meterage
  const handleAddItem = (item: QuickCatalogItem, delta?: number) => {
    const auto = getAutoQuantityAndUnit(item);
    const resolvedDelta = delta !== undefined ? delta : auto.defaultQty;

    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex((si) => si.item.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + resolvedDelta;
        if (newQty <= 0) {
          next.splice(existingIndex, 1);
        } else {
          next[existingIndex] = { ...next[existingIndex], quantity: newQty };
        }
        return next;
      } else {
        if (resolvedDelta > 0) {
          return [{ item, quantity: resolvedDelta, purchased: false }, ...prev];
        }
        return prev;
      }
    });

    if (resolvedDelta > 0) {
      showToast(`+${resolvedDelta} ${item.unit}: «${item.name.slice(0, 26)}...»`);
    }
  };

  // Set exact quantity
  const handleSetItemQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((si) => (si.item.id === itemId ? { ...si, quantity: newQty } : si))
    );
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((si) => si.item.id !== itemId));
  };

  // Toggle purchased checkbox (for shopping in store)
  const handleTogglePurchased = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.map((si) => (si.item.id === itemId ? { ...si, purchased: !si.purchased } : si))
    );
  };

  // Clear all (opens friendly in-app confirmation modal without blocking browser window.confirm)
  const handleClearAll = () => {
    setIsClearConfirmOpen(true);
  };

  const handleExecuteClearAll = () => {
    setSelectedItems([]);
    setIsDrawerOpen(false);
    setIsClearConfirmOpen(false);
    showToast('Список закупки полностью очищен');
  };

  // Add custom position
  const handleAddCustomPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;

    const getCustomCategoryKey = (cat: string): CatalogCategoryKey => {
      if (cat.includes('Труб')) return 'pipes_insulation';
      if (cat.includes('Фитинг')) return 'fittings';
      if (cat.includes('Кран') || cat.includes('Армат')) return 'valves_taps';
      if (cat.includes('Сантехник') || cat.includes('Инсталляц')) return 'fixtures';
      if (cat.includes('Коллектор')) return 'collectors';
      if (cat.includes('Защит') || cat.includes('Фильтр')) return 'leak_filters';
      if (cat.includes('Запчаст') || cat.includes('ТЭН')) return 'boiler_parts';
      if (cat.includes('Насос')) return 'pumps_tanks';
      if (cat.includes('Инструмент')) return 'tools';
      return 'supplies';
    };

    const newItem: QuickCatalogItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: customItemName.trim(),
      category: customItemCategory,
      categoryKey: getCustomCategoryKey(customItemCategory),
      spec: customItemSpec.trim() || undefined,
      unit: customItemUnit,
      price: Math.max(0, customItemPrice),
      popular: false,
      tags: ['пользовательская', customItemName.toLowerCase()]
    };

    setSelectedItems((prev) => [
      { item: newItem, quantity: Math.max(1, customItemQty), purchased: false },
      ...prev
    ]);

    setIsCustomItemModalOpen(false);
    setCustomItemName('');
    setCustomItemSpec('');
    setCustomItemQty(1);
    showToast(`Позиция «${newItem.name}» добавлена в список закупки!`);
  };

  // Save current procurement list to "Мои сметы"
  const handleSaveToEstimates = () => {
    if (selectedItems.length === 0) return;

    const estimateName = `Смета закупки (${totalPositionsCount} поз.) — ${new Date().toLocaleDateString('ru-RU')}`;
    const newEst: SavedEstimate = {
      id: `est_quick_${Date.now()}`,
      name: estimateName,
      createdAt: new Date().toISOString(),
      pipeLength: 0,
      selectedPoints: [],
      pipeType: 'pex_16',
      pipeMaterial: 'pex',
      wiringScheme: 'collector',
      reserveMargin: 10,
      includePressureReducers: true,
      use45Elbows: true,
      includeBypasses: true,
      grandTotal: totalPrice,
      totalPointsCount: 0,
      totalLinesCount: 0,
      pipeName: 'Инженерная сантехника и сопутствующие материалы',
      kitType: 'custom',
      items: selectedItems.map((si) => ({
        name: si.item.name,
        category: si.item.category,
        quantity: `${si.quantity} ${si.item.unit}`,
        unit: si.item.unit,
        price: si.item.price,
        total: si.item.price * si.quantity
      }))
    };

    if (onSaveEstimate) {
      onSaveEstimate(newEst);
    } else {
      // Direct localStorage fallback
      try {
        const local = localStorage.getItem('plumbing_saved_estimates');
        const list: SavedEstimate[] = local ? JSON.parse(local) : [];
        localStorage.setItem('plumbing_saved_estimates', JSON.stringify([newEst, ...list]));
      } catch (err) {
        console.error('Failed to save estimate:', err);
      }
    }

    showToast(`Смета «${estimateName}» сохранена в разделе «Мои сметы»!`);
  };

  // Copy formatted procurement text to clipboard (ready for Telegram/WhatsApp/Supplier)
  const handleCopyProcurementText = () => {
    if (selectedItems.length === 0) return;

    let text = `📦 СПИСОК ЗАКУПКИ ИНЖЕНЕРНОЙ САНТЕХНИКИ\n`;
    text += `Дата: ${new Date().toLocaleDateString('ru-RU')} | Позиций: ${totalPositionsCount} | Итого: ${totalPrice.toLocaleString('ru-RU')} ₽\n\n`;

    // Group by category
    const grouped: Record<string, SelectedQuickItem[]> = {};
    selectedItems.forEach((si) => {
      const cat = si.item.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(si);
    });

    Object.entries(grouped).forEach(([category, items]) => {
      text += `🔷 ${category}:\n`;
      items.forEach((si, idx) => {
        const itemTotal = si.item.price * si.quantity;
        text += `  ${idx + 1}. ${si.item.name} — ${si.quantity} ${si.item.unit} x ${si.item.price.toLocaleString('ru-RU')} ₽ = ${itemTotal.toLocaleString('ru-RU')} ₽\n`;
        if (si.item.spec) {
          text += `     (${si.item.spec})\n`;
        }
      });
      text += `\n`;
    });

    text += `════════════════════════════════════\n`;
    text += `💰 ИТОГО К ОПЛАТЕ: ${totalPrice.toLocaleString('ru-RU')} ₽\n`;
    text += `Сгенерировано в приложении СантехПро`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSuccess(true);
      showToast('Список скопирован! Можно отправлять в WhatsApp / Telegram / поставщику');
      setTimeout(() => setCopiedSuccess(false), 2500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-amber-500 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl font-bold flex items-center space-x-2 border-2 border-amber-300 animate-bounce text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Компактный заголовок: сразу доступен поиск без лишнего текста */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-3.5 sm:p-5 shadow-xl relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
              ⚡
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white leading-tight">
                Быстрый расчёт материалов
              </h2>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Авто-подбор метража и количества позиций
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onOpenSavedEstimates && (
              <button
                type="button"
                onClick={onOpenSavedEstimates}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                title="Мои сохранённые сметы"
              >
                <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Мои сметы</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setCustomItemName(searchQuery.trim());
                setIsCustomItemModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition flex items-center space-x-1 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Своя позиция</span>
            </button>
          </div>
        </div>

        {/* Live Search Input — сразу перед глазами без прокрутки */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Начните вводить: труба 20 мм, кран 1/2", Rehau, FAR...'
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-2xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition shadow-inner font-medium"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Tag Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider shrink-0 mr-0.5">
            Быстро:
          </span>
          {QUICK_TAG_SUGGESTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchQuery(tag)}
              className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition shrink-0 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Выбор категории каталога: в режиме поиска скрывается, чтобы результаты были сразу перед глазами; в обычном режиме — компактный горизонтальный скролл в 1 строку */}
      {searchQuery.trim().length > 0 ? (
        <div className="flex items-center justify-between px-1 text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span>Результаты поиска:</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold">
              {filteredItems.length} поз.
            </span>
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
          >
            Сбросить поиск
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORY_TABS.map((cat) => {
            const isActive = selectedCategoryKey === cat.key;
            const count = cat.key === 'all'
              ? QUICK_CATALOG_ITEMS.length
              : cat.key === 'favorites'
              ? QUICK_CATALOG_ITEMS.filter((i) => isFavorite(i.id)).length
              : QUICK_CATALOG_ITEMS.filter((i) => i.categoryKey === cat.key).length;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategoryKey(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 ring-1 ring-amber-400 font-black'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="whitespace-nowrap">{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-slate-950/25 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Каталог материалов сразу под поиском */}
      {filteredItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleItems.map((item) => {
            const currentQty = selectedMap.get(item.id) || 0;
            const isAdded = currentQty > 0;
            const auto = getAutoQuantityAndUnit(item);

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isAdded
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Badges & Favorite Star */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                          showToast(
                            isFavorite(item.id)
                              ? `«${item.name.slice(0, 24)}...» удалено из Избранного`
                              : `«${item.name.slice(0, 24)}...» добавлено в Избранное! ⭐`
                          );
                        }}
                        className={`p-1 rounded-lg transition cursor-pointer flex items-center justify-center ${
                          isFavorite(item.id)
                            ? 'text-amber-400 bg-amber-400/15 ring-1 ring-amber-400/40 hover:bg-amber-400/25'
                            : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                        }`}
                        title={isFavorite(item.id) ? 'Удалить из Избранного' : 'Добавить в Избранное ⭐'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFavorite(item.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/60">
                        {item.category}
                      </span>
                    </div>

                    {isAdded ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-slate-950 flex items-center space-x-1 shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>В смете: {currentQty} {item.unit}</span>
                      </span>
                    ) : item.brand ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {item.brand}
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white text-xs sm:text-sm leading-snug line-clamp-2">
                    {item.name}
                  </h3>

                  {/* Spec */}
                  {item.spec && (
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {item.spec}
                    </p>
                  )}
                </div>

                {/* Price and Instant Stepper / Add */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm sm:text-base font-black text-white">
                        {item.price > 0 ? `${item.price.toLocaleString('ru-RU')} ₽` : 'По запросу'}
                      </div>
                      <span className="text-[10px] text-slate-400">за 1 {item.unit}</span>
                    </div>

                    {/* Stepper with direct quantity input or Add Button */}
                    {isAdded ? (
                      <div className="flex items-center space-x-1 bg-slate-950 border border-amber-500/50 rounded-xl p-0.5 shadow-inner">
                        <button
                          type="button"
                          onClick={() => handleAddItem(item, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs transition cursor-pointer"
                          title="Уменьшить"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={currentQty}
                          onChange={(e) => handleSetItemQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 text-center font-black bg-transparent text-amber-300 text-xs sm:text-sm outline-none"
                        />
                        <span className="text-[10px] text-slate-400 pr-1">{item.unit}</span>

                        <button
                          type="button"
                          onClick={() => handleAddItem(item, 1)}
                          className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs transition shadow-sm cursor-pointer"
                          title="Увеличить"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddItem(item)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                        title={`Добавить сразу с типовым объемом (${auto.defaultQty} ${item.unit})`}
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Добавить ({auto.defaultQty} {item.unit})</span>
                      </button>
                    )}
                  </div>

                  {/* Быстрые шаги добавления метража или количества */}
                  {isAdded && (
                    <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-800/60 text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 mr-0.5">Добавить:</span>
                        {auto.quickIncrements.map((inc) => (
                          <button
                            key={inc}
                            type="button"
                            onClick={() => handleAddItem(item, inc)}
                            className="px-1.5 py-0.5 rounded-lg bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-mono text-[10px] font-bold border border-slate-700/80 transition cursor-pointer"
                            title={`Добавить +${inc} ${item.unit}`}
                          >
                            +{inc}{item.unit}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-amber-400 font-bold text-xs">
                          {(item.price * currentQty).toLocaleString('ru-RU')} ₽
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                          title="Удалить из сметы"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length > visibleItems.length && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="text-xs text-slate-400">
              Показано <span className="font-bold text-amber-400 font-mono">{visibleItems.length}</span> из{' '}
              <span className="font-bold text-white font-mono">{filteredItems.length}</span> доступных позиций сантехники
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setDisplayLimit((prev) => prev + 48)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Показать ещё 48 позиций ↓
              </button>
              <button
                type="button"
                onClick={() => setDisplayLimit(filteredItems.length)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700 cursor-pointer whitespace-nowrap"
              >
                Все ({filteredItems.length})
              </button>
            </div>
          </div>
        )}
      </>
      ) : selectedCategoryKey === 'favorites' ? (
        /* Empty State (Favorites is empty) */
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <Star className="w-8 h-8 fill-amber-400/20 text-amber-400" />
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">В Избранном пока нет позиций</h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mt-1">
              Нажмите на звёздочку ⭐ на любой карточке материала, трубы, крана или расходника, чтобы сохранить её в быстрый доступ.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setSelectedCategoryKey('all')}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition inline-flex items-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>Перейти в полный каталог</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State (Not found) */
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <Search className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Позиция не найдена</h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mt-1">
              {searchQuery
                ? `По запросу «${searchQuery}» ничего не найдено в каталоге. Вы можете моментально добавить свою позицию с нужной ценой и характеристиками.`
                : 'Вводите название фитинга, трубы или оборудования — позиции появятся на лету.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setCustomItemName(searchQuery.trim());
                setIsCustomItemModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition inline-flex items-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Создать свою позицию</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Sticky Bar & Slide-up Preview Drawer */}
      {selectedItems.length > 0 && (
        <div className="sticky bottom-3 sm:bottom-4 z-40 space-y-2 animate-in fade-in duration-200">
          {/* Slide-up Compact Drawer: Выбранные материалы (не мешает поиску и легко скрывается) */}
          {isDrawerOpen && (
            <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-950/95 border-2 border-amber-500/60 backdrop-blur-md shadow-2xl space-y-3 max-h-72 sm:max-h-80 flex flex-col animate-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-white">📋 Выбранные материалы в смете</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                    {totalPositionsCount} поз.
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAll();
                    }}
                    className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Очистить список"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Очистить всё</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Свернуть</span>
                  </button>
                </div>
              </div>

              {/* Items List in Drawer */}
              <div className="overflow-y-auto space-y-2 pr-1 scrollbar-thin flex-1">
                {selectedItems.map((si) => {
                  const itemTotal = si.item.price * si.quantity;
                  return (
                    <div
                      key={si.item.id}
                      className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white truncate text-xs">{si.item.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className="text-amber-400 font-semibold">{si.item.category}</span>
                          <span>•</span>
                          <span>{si.item.price.toLocaleString('ru-RU')} ₽/{si.item.unit}</span>
                        </div>
                      </div>

                      {/* Stepper in drawer */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleAddItem(si.item, -1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={si.quantity}
                            onChange={(e) => handleSetItemQty(si.item.id, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-10 text-center font-black bg-transparent text-amber-300 text-xs outline-none"
                          />
                          <span className="text-[10px] text-slate-400 pr-0.5">{si.item.unit}</span>
                          <button
                            type="button"
                            onClick={() => handleAddItem(si.item, 1)}
                            className="w-5 h-5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <div className="text-right w-16">
                          <div className="font-black text-amber-400 text-xs">
                            {itemTotal.toLocaleString('ru-RU')} ₽
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(si.item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sticky Bottom Bar — компактная плашка, не перекрывающая материалы */}
          {isBottomBarMinimized ? (
            /* Свернутый режим: мини-чип в правом нижнем углу */
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsBottomBarMinimized(false)}
                className="px-3.5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-2xl flex items-center space-x-2 border-2 border-amber-300 cursor-pointer active:scale-95 transition-all"
                title="Развернуть панель сметы"
              >
                <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                <span>{totalPositionsCount} поз.</span>
                <span>•</span>
                <span className="font-mono">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            /* Компактная тонкая плашка в 1 строку (высота всего ~44px, не мешает) */
            <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/95 border border-amber-500/60 backdrop-blur-md shadow-2xl flex items-center justify-between gap-2">
              <div
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="flex items-center space-x-2 cursor-pointer flex-1 min-w-0"
                title="Показать / скрыть выбранные позиции"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                  <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight truncate">
                    {totalPositionsCount} поз. • {totalPrice.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                    <span>{isDrawerOpen ? 'Скрыть список' : 'Показать выбранное'}</span>
                    {isDrawerOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProcurementModalOpen(true)}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Смотреть</span>
                  <span>Ведомость</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition cursor-pointer active:scale-95 touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Очистить выбранные материалы"
                  aria-label="Очистить выбранные материалы"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.2]" />
                </button>

                {/* Кнопка свернуть в мини-бейдж, чтобы вообще не мешала просмотру */}
                <button
                  type="button"
                  onClick={() => setIsBottomBarMinimized(true)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                  title="Свернуть панель"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Full Procurement List Drawer / Modal */}
      {isProcurementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold mb-1">
                  <Package className="w-3.5 h-3.5" />
                  <span>Ведомость закупки</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Спецификация сопутствующих материалов и оборудования
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsProcurementModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: List of selected items */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {selectedItems.length > 0 ? (
                selectedItems.map((si) => {
                  const itemTotal = si.item.price * si.quantity;
                  return (
                    <div
                      key={si.item.id}
                      className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        si.purchased
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {/* Left: Checkbox + Name + Details */}
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleTogglePurchased(si.item.id)}
                          className="mt-0.5 text-slate-400 hover:text-amber-400 transition shrink-0"
                          title={si.purchased ? 'Отметить как некупленное' : 'Отметить как купленное'}
                        >
                          {si.purchased ? (
                            <CheckSquare className="w-5 h-5 text-amber-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-amber-400">
                              {si.item.category}
                            </span>
                            {si.item.brand && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                                {si.item.brand}
                              </span>
                            )}
                          </div>
                          <div
                            className={`font-bold text-sm text-white truncate ${
                              si.purchased ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {si.item.name}
                          </div>
                          {si.item.spec && (
                            <div className="text-xs text-slate-400 truncate">{si.item.spec}</div>
                          )}
                        </div>
                      </div>

                      {/* Right: Quantity Stepper, Price & Remove */}
                      <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                        {/* Stepper */}
                        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => handleAddItem(si.item, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-xs text-white">
                            {si.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddItem(si.item, 1)}
                            className="w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Total per item */}
                        <div className="text-right min-w-[90px]">
                          <div className="font-black text-white text-sm">
                            {itemTotal > 0 ? `${itemTotal.toLocaleString('ru-RU')} ₽` : '—'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {si.item.price.toLocaleString('ru-RU')} ₽ / {si.item.unit}
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(si.item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                          title="Удалить позицию"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-500">Список пуст</div>
              )}
            </div>

            {/* Modal Footer: Actions */}
            <div className="p-5 sm:p-6 bg-slate-950 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">ИТОГОВАЯ СУММА ЗАКУПКИ</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    {totalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="text-right text-xs text-slate-400">
                  Всего позиций: <span className="font-bold text-white">{totalPositionsCount}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyProcurementText}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 border border-slate-700 cursor-pointer"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Скопировано в буфер!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Скопировать для WhatsApp/TG</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSaveToEstimates}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Сохранить в «Мои сметы»</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Custom Position */}
      {isCustomItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Создать свою позицию</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomItemModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomPosition} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Название позиции / фитинга / инструмента *
                </label>
                <input
                  type="text"
                  required
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="Например: Кран шаровой полнопроходной 3/4 ВР-ВР или Труба ППР 20 армированная"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Категория</label>
                  <select
                    value={customItemCategory}
                    onChange={(e) => setCustomItemCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="Краны и арматура">Краны и арматура</option>
                    <option value="Трубы и изоляция">Трубы и изоляция</option>
                    <option value="Фитинги">Фитинги</option>
                    <option value="Сантехника и приборы">Сантехника и приборы</option>
                    <option value="Коллекторы">Коллекторы</option>
                    <option value="Защита и фильтры">Защита и фильтры</option>
                    <option value="Инсталляции и трапы">Инсталляции и трапы</option>
                    <option value="Запчасти и ТЭНы">Запчасти и ТЭНы</option>
                    <option value="Расходники и герметизация">Расходники и герметизация</option>
                    <option value="Насосы и баки">Насосы и баки</option>
                    <option value="Инструмент">Инструмент</option>
                    <option value="Сопутствующие материалы">Сопутствующие материалы</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Ед. изм.</label>
                  <select
                    value={customItemUnit}
                    onChange={(e) => setCustomItemUnit(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="шт">шт</option>
                    <option value="м">м (погонный метр)</option>
                    <option value="компл">компл</option>
                    <option value="упак">упак</option>
                    <option value="рулон">рулон</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Цена за ед. (₽)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Количество</label>
                  <input
                    type="number"
                    min="1"
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Примечание / бренд / артикул
                </label>
                <input
                  type="text"
                  value={customItemSpec}
                  onChange={(e) => setCustomItemSpec(e.target.value)}
                  placeholder="Например: DZR латунь, арт. 2100 12, для котельной"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCustomItemModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold text-xs"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md"
                >
                  + Добавить в список
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Clear All (in-app dialog that works 100% reliably in APKs and mobile browsers) */}
      {isClearConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsClearConfirmOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-base font-black text-white">Очистить список закупки?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Вы действительно хотите удалить все выбранные позиции ({totalPositionsCount} поз. на сумму {totalPrice.toLocaleString('ru-RU')} ₽)?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer active:scale-95 touch-manipulation"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleExecuteClearAll}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/25 cursor-pointer active:scale-95 touch-manipulation"
              >
                Да, очистить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
