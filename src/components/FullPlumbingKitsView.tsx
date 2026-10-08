import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Printer,
  Save,
  RotateCcw,
  Search,
  Check,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  BookmarkCheck,
  Layers,
  Wrench,
  Boxes,
  Star,
  Trash2,
  X,
  Tag,
  Filter,
  PackageCheck,
  Flame,
  FileText,
  Download,
  Eye,
  ShoppingCart,
} from 'lucide-react';
import {
  BuildingType,
  InstallationMaterial,
  INSTALLATION_MATERIALS,
  MATERIAL_SPECIFIC_ITEMS,
  BUILDING_EQUIPMENT_ITEMS,
  MATERIAL_DIAMETERS,
  SystemFittingItem
} from '../data/installationMaterialsData';
import { SavedEstimate } from '../types';
import { useFavoriteMaterials } from '../hooks/useFavoriteMaterials';
import { MaterialsSelectionModal } from './MaterialsSelectionModal';
import { SantehProEstimateModal, SantehProExportItem } from './SantehProEstimateModal';
import { FastProcurementListModal } from './FastProcurementListModal';
import {
  downloadTxtSpecification,
  printPdfSpecification,
  getFormattedTxtSpecification
} from '../utils/santehProExport';

export interface CustomMaterialItem {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  brandSuggestion?: string;
  description?: string;
}

interface FullPlumbingKitsViewProps {
  onSwitchToMeterCalculator?: () => void;
  onSaveEstimate?: (est: SavedEstimate) => void;
}

export const FullPlumbingKitsView: React.FC<FullPlumbingKitsViewProps> = ({
  onSwitchToMeterCalculator,
  onSaveEstimate,
}) => {
  // 1. Смайлики «квартира» и «дом» (Выбор объекта: по умолчанию «квартира»)
  const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType>('apartment');

  // 2. Материал монтажа (из чего специалист будет проводить монтаж)
  const [selectedMaterial, setSelectedMaterial] = useState<InstallationMaterial>('ppr');

  // 3. Выбранные диаметры для фильтрации фитингов и труб (пустой массив = все диаметры)
  const [selectedDiameters, setSelectedDiameters] = useState<number[]>([]);

  // Опция «Тёплый пол»: выбор подтипа материала трубы со стенкой 2,0 мм (PEX / Металлопластик)
  const [floorPipeMaterial, setFloorPipeMaterial] = useState<'pex' | 'metal_plastic'>('pex');
  // Опция «Тёплый пол»: показывать/включать опциональные элементы из альтернативных материалов
  const [showAltMaterialsInFloor, setShowAltMaterialsInFloor] = useState<boolean>(true);

  const availableDiameters = useMemo(() => {
    return MATERIAL_DIAMETERS[selectedMaterial] || [];
  }, [selectedMaterial]);

  const handleToggleDiameter = (dia: number) => {
    setSelectedDiameters((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleSelectAllDiameters = () => {
    if (selectedDiameters.length === availableDiameters.length || selectedDiameters.length === 0) {
      setSelectedDiameters([]);
    } else {
      setSelectedDiameters(availableDiameters.map((d) => d.value));
    }
  };

  // Favorites Hook
  const { favoriteIds, isFavorite, toggleFavorite } = useFavoriteMaterials();

  // Item Quantities & Inclusions: { [id]: { quantity: number; included: boolean } }
  const [itemsState, setItemsState] = useState<Record<string, { quantity: number; included: boolean }>>({});

  // Custom User Positions ("+ Добавить свою позицию")
  const [customPositions, setCustomPositions] = useState<CustomMaterialItem[]>(() => {
    try {
      const saved = localStorage.getItem('santechpro_custom_kit_positions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & UI States
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState<boolean>(false);
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState<boolean>(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isEstimatePreviewOpen, setIsEstimatePreviewOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for new custom position
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState('Фитинги и комплектующие');
  const [newCustomUnit, setNewCustomUnit] = useState('шт');
  const [newCustomQty, setNewCustomQty] = useState('1');
  const [newCustomPrice, setNewCustomPrice] = useState('500');
  const [newCustomBrand, setNewCustomBrand] = useState('');
  const [newCustomDesc, setNewCustomDesc] = useState('');

  // Save custom positions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('santechpro_custom_kit_positions', JSON.stringify(customPositions));
    } catch {
      // ignore
    }
  }, [customPositions]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Автоматическое переключение и перерасчет объекта (Квартира / Частный дом)
  const handleSelectBuildingType = (type: BuildingType) => {
    if (type === selectedBuildingType) return;
    setSelectedBuildingType(type);
    // Автоматически очищаем переопределения количеств, чтобы мгновенно применились нормы для выбранного объекта
    setItemsState({});
    showToast(
      type === 'apartment'
        ? 'Расчёт автоматически обновлён: Квартира 🏢'
        : 'Расчёт автоматически обновлён: Частный дом 🏠'
    );
  };

  // Добавление позиций из голосового ввода в спецификацию
  const handleAddVoiceItemsToKit = (newVoiceItems: CustomMaterialItem[]) => {
    setCustomPositions((prev) => [...prev, ...newVoiceItems]);
  };

  // Быстрое добавление опционального элемента из альтернативного материала в смету теплого пола
  const handleAddAlternativeQuickItem = (matType: 'ppr' | 'inox' | 'copper' | 'metal_plastic' | 'pex') => {
    const foundItem = activeBaseItems.find((item) => item.altMaterialType === matType);
    if (foundItem) {
      setItemsState((prev) => {
        const cur = prev[foundItem.id] || {
          quantity: selectedBuildingType === 'house' ? foundItem.defaultQtyHouse : foundItem.defaultQtyApartment,
          included: true,
        };
        return {
          ...prev,
          [foundItem.id]: {
            quantity: Math.max(1, cur.quantity),
            included: true,
          },
        };
      });
      showToast(`В смету добавлен элемент: ${foundItem.name.split('(')[0]}`);
    } else {
      setIsCatalogModalOpen(true);
    }
  };

  // Compile active items base based on chosen building & material
  const activeBaseItems = useMemo<SystemFittingItem[]>(() => {
    const matItems = MATERIAL_SPECIFIC_ITEMS[selectedMaterial] || [];
    const bldItems = BUILDING_EQUIPMENT_ITEMS[selectedBuildingType] || [];
    return [...matItems, ...bldItems];
  }, [selectedMaterial, selectedBuildingType]);

  // Retrieve current quantity for an item (or default based on house/apartment)
  const getItemQty = (item: SystemFittingItem): number => {
    if (itemsState[item.id]) {
      return itemsState[item.id].quantity;
    }
    return selectedBuildingType === 'house' ? item.defaultQtyHouse : item.defaultQtyApartment;
  };

  // Check if an item is included
  const isItemIncluded = (id: string): boolean => {
    if (itemsState[id] !== undefined) {
      return itemsState[id].included;
    }
    return true;
  };

  // Toggle item inclusion
  const toggleItemInclusion = (id: string) => {
    setItemsState((prev) => {
      const defaultQty = selectedBuildingType === 'house'
        ? (activeBaseItems.find((it) => it.id === id)?.defaultQtyHouse ?? 1)
        : (activeBaseItems.find((it) => it.id === id)?.defaultQtyApartment ?? 1);
      const current = prev[id] || {
        quantity: defaultQty,
        included: true,
      };
      return {
        ...prev,
        [id]: {
          ...current,
          included: !current.included,
        },
      };
    });
  };

  // Adjust quantity
  const updateQuantity = (id: string, delta: number, defaultVal: number) => {
    setItemsState((prev) => {
      const current = prev[id] || { quantity: defaultVal, included: true };
      const newQty = Math.max(1, current.quantity + delta);
      return {
        ...prev,
        [id]: {
          ...current,
          quantity: newQty,
          included: true,
        },
      };
    });
  };

  // Reset to default
  const handleResetKit = () => {
    setItemsState({});
    showToast('Комплектация возвращена к рекомендованному стандарту');
  };

  // Add custom position handler
  const handleAddCustomPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomName.trim()) {
      showToast('Введите наименование материала');
      return;
    }

    const qty = Math.max(1, parseFloat(newCustomQty) || 1);
    const price = Math.max(0, parseFloat(newCustomPrice) || 0);

    const newItem: CustomMaterialItem = {
      id: 'custom_' + Date.now(),
      name: newCustomName.trim(),
      category: 'custom',
      categoryName: newCustomCategory,
      unit: newCustomUnit,
      quantity: qty,
      pricePerUnit: price,
      brandSuggestion: newCustomBrand.trim() || undefined,
      description: newCustomDesc.trim() || 'Пользовательская позиция',
    };

    setCustomPositions((prev) => [newItem, ...prev]);
    setIsAddCustomModalOpen(false);
    setNewCustomName('');
    setNewCustomDesc('');
    setNewCustomBrand('');
    showToast(`Позиция «${newItem.name}» добавлена в смету`);
  };

  // Remove custom position
  const handleRemoveCustomPosition = (id: string) => {
    setCustomPositions((prev) => prev.filter((p) => p.id !== id));
    showToast('Позиция удалена');
  };

  // Add items from Catalog modal
  const handleAddFromCatalog = (items: Array<{ item: any; quantity: number }>) => {
    const mapped: CustomMaterialItem[] = items.map(({ item, quantity }) => ({
      id: 'cat_' + item.id + '_' + Date.now(),
      name: item.name,
      category: item.category,
      categoryName: item.categoryLabel || 'Оборудование из каталога',
      unit: item.unit || 'шт',
      quantity,
      pricePerUnit: item.price,
      brandSuggestion: item.brand,
      description: item.spec || item.description || 'Из каталога оборудования',
    }));

    setCustomPositions((prev) => [...mapped, ...prev]);
    showToast(`Добавлено позиций из каталога: ${mapped.length}`);
  };

  // Extract all categories
  const categoriesList = useMemo(() => {
    const set = new Map<string, string>();
    activeBaseItems.forEach((it) => {
      set.set(it.category, it.categoryName);
    });
    if (customPositions.length > 0) {
      set.set('custom', 'Пользовательские позиции');
    }
    return Array.from(set.entries()).map(([id, name]) => ({ id, name }));
  }, [activeBaseItems, customPositions]);

  // Filtered and Sorted items (Smart search puts Favorites on top!)
  const filteredBaseItems = useMemo(() => {
    return activeBaseItems
      .filter((item) => {
        // Underfloor heating specific filtering
        if (selectedMaterial === 'underfloor_heating') {
          // Alternative materials toggle
          if (item.isAlternativeMaterial && !showAltMaterialsInFloor) {
            return false;
          }
          // Sub-material filtering (PEX vs Metal-plastic for 2.0 mm pipes & eurocones)
          if (item.floorPipeSubMaterial && item.floorPipeSubMaterial !== 'all') {
            if (item.floorPipeSubMaterial !== floorPipeMaterial) {
              return false;
            }
          }
        }

        // Diameter filter
        if (selectedDiameters.length > 0) {
          if (item.diameters && item.diameters.length > 0) {
            const matchesDia = item.diameters.some((d) => selectedDiameters.includes(d));
            if (!matchesDia) return false;
          }
        }

        // Category filter
        if (activeCategoryFilter === 'favorites') {
          if (!isFavorite(item.id)) return false;
        } else if (activeCategoryFilter !== 'all' && item.category !== activeCategoryFilter) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            item.categoryName.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q)) ||
            item.materialCode.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        // When searching or in all, prioritize favorited items at the top
        const aFav = isFavorite(a.id) ? 1 : 0;
        const bFav = isFavorite(b.id) ? 1 : 0;
        if (searchQuery.trim()) {
          return bFav - aFav;
        }
        return 0;
      });
  }, [
    activeBaseItems,
    selectedDiameters,
    activeCategoryFilter,
    searchQuery,
    isFavorite,
    selectedMaterial,
    floorPipeMaterial,
    showAltMaterialsInFloor
  ]);

  // Filtered Custom positions
  const filteredCustomPositions = useMemo(() => {
    if (activeCategoryFilter !== 'all' && activeCategoryFilter !== 'custom' && activeCategoryFilter !== 'favorites') {
      return [];
    }
    return customPositions.filter((p) => {
      if (activeCategoryFilter === 'favorites' && !isFavorite(p.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [customPositions, activeCategoryFilter, searchQuery, isFavorite]);

  // Total Calculations
  const summary = useMemo(() => {
    let totalSum = 0;
    let includedCount = 0;
    let totalItems = activeBaseItems.length + customPositions.length;

    activeBaseItems.forEach((item) => {
      const isInc = isItemIncluded(item.id);
      const qty = getItemQty(item);
      if (isInc) {
        includedCount++;
        totalSum += qty * item.pricePerUnit;
      }
    });

    customPositions.forEach((item) => {
      const isInc = isItemIncluded(item.id);
      const state = itemsState[item.id];
      const qty = state ? state.quantity : item.quantity;
      if (isInc) {
        includedCount++;
        totalSum += qty * item.pricePerUnit;
      }
    });

    return { totalSum, includedCount, totalItems };
  }, [activeBaseItems, customPositions, itemsState, selectedBuildingType]);

  const activeMaterialConfig = useMemo(() => {
    return INSTALLATION_MATERIALS.find((m) => m.id === selectedMaterial) || INSTALLATION_MATERIALS[0];
  }, [selectedMaterial]);

  // Full list of included items for export and printing with «СантехПро»
  const exportItems: SantehProExportItem[] = useMemo(() => {
    const list: SantehProExportItem[] = [];
    activeBaseItems.forEach((it) => {
      if (isItemIncluded(it.id)) {
        list.push({
          id: it.id,
          name: it.name,
          category: it.category,
          categoryName: it.categoryName,
          quantity: getItemQty(it),
          unit: it.unit,
          pricePerUnit: it.pricePerUnit,
          brand: it.brand,
          note: it.note,
          isCustom: false,
        });
      }
    });

    customPositions.forEach((it) => {
      if (isItemIncluded(it.id)) {
        const state = itemsState[it.id];
        const qty = state ? state.quantity : it.quantity;
        list.push({
          id: it.id,
          name: it.name,
          category: it.category,
          categoryName: it.categoryName,
          quantity: qty,
          unit: it.unit,
          pricePerUnit: it.pricePerUnit,
          brand: it.brandSuggestion,
          note: it.description,
          isCustom: true,
        });
      }
    });

    return list;
  }, [activeBaseItems, customPositions, itemsState, isItemIncluded, getItemQty]);

  const exportOptions = useMemo(() => ({
    buildingType: selectedBuildingType,
    materialName: activeMaterialConfig.name,
    materialBadge: activeMaterialConfig.badge,
    connectionType: activeMaterialConfig.connectionType,
    floorPipeMaterial: selectedMaterial === 'underfloor_heating' ? floorPipeMaterial : undefined,
    selectedDiameters,
    summary,
    items: exportItems,
  }), [
    selectedBuildingType,
    activeMaterialConfig,
    selectedMaterial,
    floorPipeMaterial,
    selectedDiameters,
    summary,
    exportItems,
  ]);

  // Copy specification with «СантехПро» header
  const handleCopySpecification = () => {
    const text = getFormattedTxtSpecification(exportOptions);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Спецификация «СантехПро» скопирована в буфер обмена!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Export to .TXT file with «СантехПро» header
  const handleExportTxt = () => {
    downloadTxtSpecification(exportOptions);
    showToast('Спецификация «СантехПро» скачана в текстовом формате (.txt)');
  };

  // Export to PDF with «СантехПро» branding
  const handleExportPdf = () => {
    printPdfSpecification(exportOptions);
    showToast('Сформирован документ «СантехПро» для печати / сохранения в PDF');
  };

  // Save to user estimates
  const handleSaveToEstimates = () => {
    const bldLabel = selectedBuildingType === 'house' ? 'Дом 🏠' : 'Квартира 🏢';
    const estimateName = `${bldLabel} (${activeMaterialConfig.code}) — ${new Date().toLocaleDateString('ru-RU')}`;

    const allItems = [
      ...activeBaseItems.filter((it) => isItemIncluded(it.id)).map((it) => {
        const qty = getItemQty(it);
        return {
          name: `${it.name} (${it.categoryName})`,
          quantity: qty,
          unit: it.unit,
          price: it.pricePerUnit,
          total: qty * it.pricePerUnit,
          category: it.category,
        };
      }),
      ...customPositions.filter((it) => isItemIncluded(it.id)).map((it) => {
        const state = itemsState[it.id];
        const qty = state ? state.quantity : it.quantity;
        return {
          name: `${it.name} [Своя позиция]`,
          quantity: qty,
          unit: it.unit,
          price: it.pricePerUnit,
          total: qty * it.pricePerUnit,
          category: it.category,
        };
      }),
    ];

    const savedEst: SavedEstimate = {
      id: 'est_mat_' + Date.now(),
      name: estimateName,
      createdAt: new Date().toISOString(),
      pipeLength: selectedBuildingType === 'house' ? 45 : 20,
      selectedPoints:
        selectedBuildingType === 'house'
          ? ['sink_kitchen', 'sink_bath', 'bathtub', 'toilet', 'bidet', 'washing_machine', 'dishwasher', 'boiler', 'filter']
          : ['sink_kitchen', 'sink_bath', 'bathtub', 'toilet', 'washing_machine', 'dishwasher', 'boiler'],
      pipeType:
        selectedMaterial === 'underfloor_heating'
          ? (floorPipeMaterial === 'pex' ? 'underfloor_pex_16' : 'underfloor_mp_16')
          : selectedMaterial === 'ppr'
          ? 'ppr_20'
          : selectedMaterial === 'pex'
          ? 'pex_16'
          : 'metal_plastic_16',
      pipeMaterial: selectedMaterial,
      selectedDiameters: selectedDiameters.length > 0 ? selectedDiameters : availableDiameters.map((d) => d.value),
      wiringScheme: selectedMaterial === 'ppr' ? 'sequential' : 'collector',
      reserveMargin: 15,
      includePressureReducers: true,
      use45Elbows: true,
      includeBypasses: true,
      grandTotal: summary.totalSum,
      totalPointsCount: selectedBuildingType === 'house' ? 9 : 7,
      totalLinesCount: selectedBuildingType === 'house' ? 14 : 11,
      pipeName: `${activeMaterialConfig.name}`,
      kitType: selectedBuildingType,
      items: allItems,
    };

    try {
      const local = localStorage.getItem('plumbing_saved_estimates');
      const list: SavedEstimate[] = local ? JSON.parse(local) : [];
      const updated = [savedEst, ...list];
      localStorage.setItem('plumbing_saved_estimates', JSON.stringify(updated));
      if (onSaveEstimate) {
        onSaveEstimate(savedEst);
      }
      showToast(`Смета «${estimateName}» успешно сохранена в ваши сметы!`);
    } catch (e) {
      console.error('Error saving estimate:', e);
      showToast('Ошибка при сохранении сметы');
    }
  };

  const totalFavoritesCount = useMemo(() => {
    return activeBaseItems.filter((it) => isFavorite(it.id)).length +
      customPositions.filter((it) => isFavorite(it.id)).length;
  }, [activeBaseItems, customPositions, isFavorite]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modern Compact Control Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Row 1: Селектор объекта (Квартира / Дом) слева + Голосовой ввод фитингов (в выделенной зоне) + Быстрые действия */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block mb-1">
                Объект монтажа
              </span>
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Смайлик «квартира» (слева по умолчанию) */}
                <button
                  type="button"
                  onClick={() => handleSelectBuildingType('apartment')}
                  className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl font-black text-sm transition-all cursor-pointer border ${
                    selectedBuildingType === 'apartment'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                      : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <span className="text-xl">🏢</span>
                  <span>Квартира</span>
                  {selectedBuildingType === 'apartment' && (
                    <span className="w-2 h-2 rounded-full bg-slate-950 ml-1"></span>
                  )}
                </button>

                {/* Смайлик «дом» (Частный дом) */}
                <button
                  type="button"
                  onClick={() => handleSelectBuildingType('house')}
                  className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl font-black text-sm transition-all cursor-pointer border ${
                    selectedBuildingType === 'house'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                      : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <span className="text-xl">🏠</span>
                  <span>Частный дом</span>
                  {selectedBuildingType === 'house' && (
                    <span className="w-2 h-2 rounded-full bg-slate-950 ml-1"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Быстрый экспресс-лист закупок */}
            <div className="pt-4 sm:pt-4">
              <button
                type="button"
                onClick={() => setIsProcurementModalOpen(true)}
                className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center gap-2.5 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-emerald-400/60 cursor-pointer active:scale-95 group hover:scale-[1.02]"
                title="Быстрый экспресс-лист закупок: готовые комплекты и подбор фитингов в 1 тап"
              >
                <ShoppingCart className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform stroke-[2.5]" />
                <span className="tracking-tight">Список закупок</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-slate-950/20 text-slate-950 text-[10px] font-extrabold uppercase">
                  Экспресс
                </span>
              </button>
            </div>
          </div>

          {/* Top Actions: + Своя позиция, Сбросить */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddCustomModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Добавить свою позицию"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>+ Своя позиция</span>
            </button>

            <button
              type="button"
              onClick={handleResetKit}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/80 text-xs font-medium transition flex items-center space-x-1 cursor-pointer"
              title="Сбросить к стандарту"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сбросить</span>
            </button>
          </div>
        </div>

        {/* Row 2: Материал монтажа (Материал, из которого специалист будет проводить монтаж) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Материал монтажа (Трубопроводная система):</span>
            </span>

            <span className="text-[11px] text-amber-400/90 font-mono hidden sm:inline">
              Комплектующие обновляются автоматически
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {INSTALLATION_MATERIALS.map((mat) => {
              const isSelected = selectedMaterial === mat.id;
              const isFloor = mat.id === 'underfloor_heating';
              return (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => {
                    setSelectedMaterial(mat.id);
                    if (mat.id === 'underfloor_heating') {
                      setSelectedDiameters([16]);
                      showToast('Включен водяной тёплый пол (стенка 2,0 мм)');
                    } else {
                      setSelectedDiameters([]);
                      showToast(`Выбран материал: ${mat.name}`);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? isFloor
                        ? 'bg-gradient-to-b from-orange-950/60 to-slate-900 border-orange-400 text-white shadow-lg shadow-orange-500/20 ring-2 ring-orange-500/40'
                        : 'bg-slate-800 border-amber-400 text-white shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`font-mono font-black text-xs px-2 py-0.5 rounded flex items-center space-x-1 ${
                        isSelected
                          ? isFloor
                            ? 'bg-orange-500 text-slate-950'
                            : 'bg-amber-500 text-slate-950'
                          : isFloor
                          ? 'bg-orange-950/40 text-orange-400 border border-orange-500/30'
                          : 'bg-slate-900 text-amber-400 border border-slate-800'
                      }`}
                    >
                      {isFloor && <Flame className="w-3 h-3 inline mr-0.5" />}
                      <span>{mat.code}</span>
                    </span>
                    <span
                      className={`text-[10px] font-medium ${
                        isFloor ? 'text-orange-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {mat.badge}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-white leading-tight">
                      {mat.name.split('(')[0].trim()}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {mat.pipeDiameterStandard}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* If underfloor heating is selected: Show comprehensive dedicated configuration panel */}
          {selectedMaterial === 'underfloor_heating' ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-orange-950/30 via-slate-950/90 to-slate-950 border border-orange-500/40 shadow-xl space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-500/20 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-sm text-white uppercase tracking-wide">
                        Конфигуратор водяного тёплого пола
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                        Стенка 2,0 мм
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      При выборе диаметра и материала нужные комплектующие подтягиваются автоматически
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">Активный стандарт:</span>
                  <span className="text-xs font-mono font-bold text-orange-300 bg-orange-950/60 px-2.5 py-1 rounded-lg border border-orange-500/30">
                    {floorPipeMaterial === 'pex' ? 'Сшитый полиэтилен (PEX) 2.0 мм' : 'Металлопластик 2.0 мм'} • {selectedDiameters.length > 0 ? selectedDiameters.map(d => `${d} мм`).join(', ') : 'Все диаметры'}
                  </span>
                </div>
              </div>

              {/* 2-Column Selectors: Pipe Diameters & Pipe Materials */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Выбор диаметра трубы (16 мм и 20 мм) */}
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-black flex items-center justify-center">1</span>
                      <span>Выбор диаметра трубы тёплого пола:</span>
                    </span>
                    <span className="text-[11px] text-orange-400 font-mono font-bold">
                      {selectedDiameters.length === 1 ? `Выбран: Ø ${selectedDiameters[0]} мм` : 'Выбрано: 16 и 20 мм'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* 16 мм */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDiameters([16]);
                        showToast('Выбран диаметр 16 мм (16×2.0 мм) — обновлены трубы и евроконусы');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between space-y-1 ${
                        selectedDiameters.length === 1 && selectedDiameters[0] === 16
                          ? 'bg-orange-500 text-slate-950 border-orange-400 font-bold shadow-md shadow-orange-500/20'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-black">Ø 16 мм</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/30">
                        16×2.0 мм
                      </span>
                      <span className={`text-[9px] leading-tight ${
                        selectedDiameters.length === 1 && selectedDiameters[0] === 16 ? 'text-slate-950 font-medium' : 'text-slate-400'
                      }`}>
                        Стандарт (петли до 80 м)
                      </span>
                    </button>

                    {/* 20 мм */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDiameters([20]);
                        showToast('Выбран диаметр 20 мм (20×2.0 мм) — обновлены трубы и евроконусы');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between space-y-1 ${
                        selectedDiameters.length === 1 && selectedDiameters[0] === 20
                          ? 'bg-orange-500 text-slate-950 border-orange-400 font-bold shadow-md shadow-orange-500/20'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-black">Ø 20 мм</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/30">
                        20×2.0 мм
                      </span>
                      <span className={`text-[9px] leading-tight ${
                        selectedDiameters.length === 1 && selectedDiameters[0] === 20 ? 'text-slate-950 font-medium' : 'text-slate-400'
                      }`}>
                        Длинные петли (до 120 м)
                      </span>
                    </button>

                    {/* 16 + 20 мм */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDiameters([16, 20]);
                        showToast('Включены оба диаметра: 16 мм и 20 мм');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between space-y-1 ${
                        selectedDiameters.length === 2
                          ? 'bg-orange-500 text-slate-950 border-orange-400 font-bold shadow-md shadow-orange-500/20'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-black">16 + 20 мм</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/30">
                        Оба диаметра
                      </span>
                      <span className={`text-[9px] leading-tight ${
                        selectedDiameters.length === 2 ? 'text-slate-950 font-medium' : 'text-slate-400'
                      }`}>
                        Комбинированная раскладка
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Выбор материала трубы (толщина стенки 2,0 мм) */}
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-black flex items-center justify-center">2</span>
                      <span>Материал трубы со стенкой 2,0 мм:</span>
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono font-bold">
                      {floorPipeMaterial === 'pex' ? 'Сшитый полиэтилен' : 'Металлопластик'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Вариант А: Сшитый полиэтилен */}
                    <button
                      type="button"
                      onClick={() => {
                        setFloorPipeMaterial('pex');
                        showToast('Выбран сшитый полиэтилен PEX-A / PE-RT (толщина стенки 2,0 мм)');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-1.5 ${
                        floorPipeMaterial === 'pex'
                          ? 'bg-slate-900 border-orange-400 ring-2 ring-orange-500/30 text-white shadow-md shadow-orange-500/10'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-white">
                          🌀 Сшитый полиэтилен
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          floorPipeMaterial === 'pex' ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}>
                          PEX 2.0 мм
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-medium">
                        Стенка 2,0 мм • Барьер EVOH
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Высокая эластичность, память формы. Легко гнется улиткой без заломов и напряжения в углах.
                      </p>
                    </button>

                    {/* Вариант Б: Металлопластик */}
                    <button
                      type="button"
                      onClick={() => {
                        setFloorPipeMaterial('metal_plastic');
                        showToast('Выбран металлопластик PEX-AL-PEX (толщина стенки 2,0 мм)');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-1.5 ${
                        floorPipeMaterial === 'metal_plastic'
                          ? 'bg-slate-900 border-orange-400 ring-2 ring-orange-500/30 text-white shadow-md shadow-orange-500/10'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-white">
                          🛡️ Металлопластик
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          floorPipeMaterial === 'metal_plastic' ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}>
                          MP 2.0 мм
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-medium">
                        Стенка 2,0 мм • Алюминий 0.25 мм
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        100% держит форму изгиба, нулевой пружинящий эффект при укладке по сетке или бобышкам.
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Добавление опциональных элементов из альтернативных материалов */}
              <div className="pt-3 border-t border-slate-800/90 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-black flex items-center justify-center">3</span>
                    <span className="text-xs font-bold text-slate-200">
                      Опциональные элементы из альтернативных материалов (PPR, Медь, Нержавейка, PEX, MP):
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showAltMaterialsInFloor}
                        onChange={(e) => setShowAltMaterialsInFloor(e.target.checked)}
                        className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                      />
                      <span className="font-bold text-cyan-300">Отображать в перечне</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsCatalogModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold transition cursor-pointer flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Каталог материалов</span>
                    </button>
                  </div>
                </div>

                {/* Quick Add Chips for Alternative Materials */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">Быстро добавить в смету:</span>
                  <button
                    type="button"
                    onClick={() => handleAddAlternativeQuickItem('ppr')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-amber-400/50 hover:text-white transition cursor-pointer flex items-center space-x-1"
                  >
                    <span className="text-amber-400 font-bold">PPR</span>
                    <span>Кран-американка 1" PPR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddAlternativeQuickItem('inox')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-400 hover:text-white transition cursor-pointer flex items-center space-x-1"
                  >
                    <span className="text-slate-300 font-bold">INOX</span>
                    <span>Тройник 1" нерж.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddAlternativeQuickItem('copper')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-amber-600 hover:text-white transition cursor-pointer flex items-center space-x-1"
                  >
                    <span className="text-orange-400 font-bold">Медь</span>
                    <span>Медная труба 22 мм</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddAlternativeQuickItem('metal_plastic')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-cyan-400 hover:text-white transition cursor-pointer flex items-center space-x-1"
                  >
                    <span className="text-cyan-400 font-bold">Пресс MP</span>
                    <span>Переходник 26-1"</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddAlternativeQuickItem('pex')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-blue-400 hover:text-white transition cursor-pointer flex items-center space-x-1"
                  >
                    <span className="text-blue-400 font-bold">Аксиал PEX</span>
                    <span>Муфта 25-1"</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Active Material Insight Callout */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>
                    Технология стыковки: <strong className="text-white">{activeMaterialConfig.connectionType}</strong>
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Диаметры в системе: <span className="text-amber-400 font-bold">{activeMaterialConfig.pipeDiameterStandard}</span>
                </div>
              </div>

              {/* Interactive Diameter Filter with Checkboxes */}
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block sm:inline mr-2">
                      Диаметры для подбора фитингов и труб:
                    </span>
                    <span className="text-[11px] text-slate-400 block sm:inline">
                      {selectedDiameters.length === 0
                        ? '(Все диаметры активны)'
                        : `(Выбрано: ${selectedDiameters.map((d) => d + ' мм').join(', ')})`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllDiameters}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedDiameters.length === 0 || selectedDiameters.length === availableDiameters.length
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Все диаметры
                  </button>

                  {availableDiameters.map((d) => {
                    const isChecked = selectedDiameters.includes(d.value);
                    return (
                      <label
                        key={d.value}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition select-none ${
                          isChecked
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleDiameter(d.value)}
                          className="w-3.5 h-3.5 rounded accent-slate-950 cursor-pointer"
                        />
                        <span>{d.label}</span>
                      </label>
                    );
                  })}

                  {selectedDiameters.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedDiameters([])}
                      className="px-2 py-1 text-[11px] text-slate-400 hover:text-amber-300 transition cursor-pointer underline ml-1"
                    >
                      Сбросить
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Live Total Metrics */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Позиций в сметe:</span>
              <span className="text-base font-black text-white">
                {summary.includedCount} <span className="text-xs font-normal text-slate-400">из {summary.totalItems}</span>
              </span>
            </div>

            <div className="h-7 w-px bg-slate-800"></div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Объект:</span>
              <span className="text-xs font-black text-amber-300">
                {selectedBuildingType === 'house' ? 'Частный дом 🏠' : 'Квартира 🏢'}
              </span>
            </div>

            <div className="h-7 w-px bg-slate-800"></div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Материал:</span>
              <span className="text-xs font-black text-cyan-300">
                {activeMaterialConfig.code}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ориентир бюджета:</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              ~{summary.totalSum.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        {/* Filter Chips Bar + Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Все позиции ({activeBaseItems.length + customPositions.length})
            </button>

            {/* Favorite / Часто используемые Tab */}
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('favorites')}
              className={`px-3 py-1.5 rounded-xl font-black whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                activeCategoryFilter === 'favorites'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-amber-400 hover:bg-slate-800 border border-amber-500/30'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Часто используемые ({totalFavoritesCount})</span>
            </button>

            {categoriesList.map((cat) => {
              const isCustom = cat.id === 'custom';
              const count = isCustom
                ? customPositions.length
                : activeBaseItems.filter((it) => it.category === cat.id).length;
              if (count === 0) return null;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                    activeCategoryFilter === cat.id
                      ? 'bg-slate-800 text-amber-300 font-bold border border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Quick Search Input with Favorite Pinning */}
          <div className="relative shrink-0 w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск фитинга, трубы, PPR..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-7 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Item List: Auto-suggested matching fittings and items */}
      <div className="space-y-4">
        {/* Custom Added Positions */}
        {filteredCustomPositions.length > 0 && (
          <div className="rounded-3xl bg-slate-900 border border-amber-500/30 overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-amber-300 flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>Добавленные пользователем позиции ({filteredCustomPositions.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCustomModalOpen(true)}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                + Добавить ещё
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {filteredCustomPositions.map((item) => {
                const isFav = isFavorite(item.id);
                const isInc = isItemIncluded(item.id);
                const state = itemsState[item.id] || { quantity: item.quantity, included: true };
                const lineTotal = state.quantity * item.pricePerUnit;

                return (
                  <div
                    key={item.id}
                    className={`p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isInc ? 'hover:bg-slate-800/40' : 'opacity-40 bg-slate-950/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isInc}
                        onChange={() => toggleItemInclusion(item.id)}
                        className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950 cursor-pointer mt-1 shrink-0"
                      />

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={() => {
                          toggleFavorite(item.id);
                          showToast(isFav ? 'Удалено из часто используемых' : 'Добавлено в часто используемые ⭐');
                        }}
                        className="p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer mt-0.5 shrink-0"
                        title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-500 hover:text-amber-400'
                          }`}
                        />
                      </button>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs sm:text-sm font-bold ${isInc ? 'text-white' : 'text-slate-400'}`}>
                            {item.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Своя позиция
                          </span>
                          {isFav && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center space-x-1">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span>Часто используемое</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-10 sm:pl-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1, item.quantity)}
                          disabled={!isInc || state.quantity <= 1}
                          className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center disabled:opacity-30 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black text-white min-w-[3rem] text-center font-mono">
                          {state.quantity} <span className="text-[10px] text-slate-400">{item.unit}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1, item.quantity)}
                          disabled={!isInc}
                          className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center disabled:opacity-30 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[5.5rem]">
                        <div className="text-[10px] text-slate-400">по {item.pricePerUnit.toLocaleString('ru-RU')} ₽</div>
                        <div className="text-xs sm:text-sm font-black text-amber-400 font-mono">
                          ~{lineTotal.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCustomPosition(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Удалить позицию"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Base Suggested Materials and Fittings */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs sm:text-sm font-black text-white">
                Фитинги, трубы и комплектующие ({filteredBaseItems.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Материал: <strong className="text-amber-300">{activeMaterialConfig.code}</strong> • Объект: <strong className="text-cyan-300">{selectedBuildingType === 'house' ? 'Дом 🏠' : 'Квартира 🏢'}</strong>
            </span>
          </div>

          {filteredBaseItems.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs text-slate-400">
                {activeCategoryFilter === 'favorites'
                  ? 'В этой категории пока нет позиций, добавленных в избранное. Нажмите на звёздочку ⭐ рядом с любым материалом!'
                  : 'Ничего не найдено по заданным фильтрам.'}
              </p>
              {activeCategoryFilter === 'favorites' && (
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('all')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition inline-block"
                >
                  Показать все материалы
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filteredBaseItems.map((item) => {
                const isFav = isFavorite(item.id);
                const isInc = isItemIncluded(item.id);
                const currentQty = getItemQty(item);
                const lineTotal = currentQty * item.pricePerUnit;

                return (
                  <div
                    key={item.id}
                    className={`p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isInc ? 'hover:bg-slate-800/30' : 'opacity-40 bg-slate-950/50'
                    }`}
                  >
                    {/* Left: Checkbox + Favorite + Name & Specs */}
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isInc}
                        onChange={() => toggleItemInclusion(item.id)}
                        className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950 cursor-pointer mt-1 shrink-0"
                      />

                      {/* Favorite Star Button */}
                      <button
                        type="button"
                        onClick={() => {
                          toggleFavorite(item.id);
                          showToast(isFav ? 'Удалено из часто используемых' : 'Добавлено в часто используемые ⭐');
                        }}
                        className="p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer mt-0.5 shrink-0"
                        title={isFav ? 'Удалить из избранного' : 'Добавить в избранное (часто используемое)'}
                      >
                        <Star
                          className={`w-4 h-4 transition-colors ${
                            isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-500 hover:text-amber-400'
                          }`}
                        />
                      </button>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              isInc ? 'text-white' : 'text-slate-400'
                            }`}
                          >
                            {item.name}
                          </span>

                          {/* Material Tag */}
                          {item.materialCode !== 'COMMON' && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-slate-800 text-amber-300 border border-slate-700 font-mono">
                              {item.materialCode}
                            </span>
                          )}

                          {/* Favorite Badge */}
                          {isFav && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center space-x-1">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span>Часто используемое</span>
                            </span>
                          )}

                          {/* Tool Tag */}
                          {item.isTool && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              Инструмент
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Quantity Controls & Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-10 sm:pl-0">
                      {/* Stepper */}
                      <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1, currentQty)}
                          disabled={!isInc || currentQty <= 1}
                          className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center disabled:opacity-30 transition"
                          title="Уменьшить"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="px-2 text-xs font-black text-white min-w-[3.5rem] text-center font-mono">
                          {currentQty} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1, currentQty)}
                          disabled={!isInc}
                          className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center disabled:opacity-30 transition"
                          title="Увеличить"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right min-w-[6rem]">
                        <div className="text-[10px] text-slate-400">
                          по {item.pricePerUnit.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-xs sm:text-sm font-black text-amber-400 font-mono">
                          ~{lineTotal.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Completion & Export Specification Section («В завершение процесса, после проверки комплектующих») */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Завершение комплектации</span>
              </span>
              <span className="text-xs font-bold text-slate-400">«СантехПро»</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Итоговая смета и экспорт данных
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Все комплектующие проверены и согласованы. Выберите удобный формат экспорта сметы в текстовый файл, бланк PDF с фирменным наименованием <b>«СантехПро»</b> или сохраните в базу расчётов.
            </p>
          </div>

          <div className="flex items-baseline md:flex-col md:items-end justify-between bg-slate-950/80 p-3.5 sm:px-5 sm:py-3 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-xs text-slate-400">
              Позиций в смете: <b className="text-white">{summary.includedCount}</b> из {summary.totalItems}
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              ~{summary.totalSum.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. PDF Export */}
          <button
            type="button"
            onClick={handleExportPdf}
            className="p-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition flex flex-col justify-between space-y-3 shadow-lg shadow-sky-600/20 cursor-pointer text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/25 text-white">
                А4 / Печать
              </span>
            </div>
            <div>
              <div className="text-sm font-black flex items-center space-x-1">
                <span>Экспорт в PDF</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </div>
              <div className="text-[11px] text-sky-100/80 font-normal">
                Фирменный документ «СантехПро»
              </div>
            </div>
          </button>

          {/* 2. TXT Export */}
          <button
            type="button"
            onClick={handleExportTxt}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 font-bold transition flex flex-col justify-between space-y-3 cursor-pointer text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-amber-500/30">
                .TXT
              </span>
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center space-x-1">
                <span>Экспорт в текст (.txt)</span>
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                Для Excel, блокнота и 1С/склада
              </div>
            </div>
          </button>

          {/* 3. Copy Specification */}
          <button
            type="button"
            onClick={handleCopySpecification}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-emerald-500/40 font-bold transition flex flex-col justify-between space-y-3 cursor-pointer text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-emerald-500/30">
                {copied ? 'Скопировано!' : 'Буфер'}
              </span>
            </div>
            <div>
              <div className="text-sm font-black text-white">
                Скопировать ведомость
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                Для WhatsApp, Telegram и заметок
              </div>
            </div>
          </button>

          {/* 4. Save to User Estimates */}
          <button
            type="button"
            onClick={handleSaveToEstimates}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-cyan-500/40 font-bold transition flex flex-col justify-between space-y-3 cursor-pointer text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Save className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-cyan-400 border border-cyan-500/30">
                Сметы
              </span>
            </div>
            <div>
              <div className="text-sm font-black text-white">
                Сохранить в «Мои сметы»
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                Для быстрого повторного доступа
              </div>
            </div>
          </button>
        </div>

        {/* Preview sheet link */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>В верхней части документа автоматически добавляется официальное наименование <b>«СантехПро»</b></span>
          </div>

          <button
            type="button"
            onClick={() => setIsEstimatePreviewOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Предпросмотр бланка А4</span>
          </button>
        </div>
      </div>

      {/* Switch to Fine-tuning Meter Calculator */}
      {onSwitchToMeterCalculator && (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Нужен детальный расчет трассы по метрам?</h4>
              <p className="text-xs text-slate-400">
                Перейдите в калькулятор метража с интерактивными точками водоразбора и наглядной схемой поворотов 90° vs 45°.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSwitchToMeterCalculator}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <span>Калькулятор по метражу</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      )}

      {/* Modal: Add Custom Position */}
      {isAddCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsAddCustomModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Добавить свою позицию</h3>
                <p className="text-xs text-slate-400">Материал, расходник или специфический фитинг</p>
              </div>
            </div>

            <form onSubmit={handleAddCustomPosition} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Наименование позиции: <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomName}
                  onChange={(e) => setNewCustomName(e.target.value)}
                  placeholder="Например: Кран шаровый Valtec 1/2 с бабочкой"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Количество:
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                    value={newCustomQty}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewCustomQty(v === '' ? '' : v.replace(/^0+([1-9])/, '$1'));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Единица измерения:
                  </label>
                  <select
                    value={newCustomUnit}
                    onChange={(e) => setNewCustomUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="шт">шт</option>
                    <option value="м">м (метры)</option>
                    <option value="компл">компл</option>
                    <option value="упак">упак</option>
                    <option value="рулон">рулон</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Цена за единицу (₽):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    placeholder="0"
                    value={newCustomPrice}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewCustomPrice(v === '' ? '' : v.replace(/^0+([1-9])/, '$1'));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Артикул / Модель (опционально):
                  </label>
                  <input
                    type="text"
                    value={newCustomBrand}
                    onChange={(e) => setNewCustomBrand(e.target.value)}
                    placeholder="Например: арт. 1042 / 1/2'' ВР-НР"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Примечание / назначение:
                </label>
                <input
                  type="text"
                  value={newCustomDesc}
                  onChange={(e) => setNewCustomDesc(e.target.value)}
                  placeholder="Где используется или артикул"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCustomModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Добавить в смету</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Catalog Modal */}
      <MaterialsSelectionModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        onAddSelectedToEstimate={handleAddFromCatalog}
      />

      {/* SantehPro Branded Document Modal */}
      <SantehProEstimateModal
        isOpen={isEstimatePreviewOpen}
        onClose={() => setIsEstimatePreviewOpen(false)}
        onPrint={handleExportPdf}
        onDownloadTxt={handleExportTxt}
        onCopyTxt={handleCopySpecification}
        copied={copied}
        buildingType={selectedBuildingType}
        materialName={activeMaterialConfig.name}
        materialBadge={activeMaterialConfig.badge}
        connectionType={activeMaterialConfig.connectionType}
        floorPipeMaterial={selectedMaterial === 'underfloor_heating' ? floorPipeMaterial : undefined}
        selectedDiameters={selectedDiameters}
        summary={summary}
        items={exportItems}
      />

      {/* Fast Procurement List Modal */}
      <FastProcurementListModal
        isOpen={isProcurementModalOpen}
        onClose={() => setIsProcurementModalOpen(false)}
        buildingType={selectedBuildingType}
        materialName={activeMaterialConfig.name}
        onAddItemsToKit={handleAddVoiceItemsToKit}
        onSaveEstimateDirectly={onSaveEstimate}
      />
    </div>
  );
};
