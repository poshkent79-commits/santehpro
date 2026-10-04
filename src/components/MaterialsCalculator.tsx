import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Wrench,
  PackageCheck,
  Copy,
  Check,
  Printer,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  HelpCircle,
  Eye,
  Info,
  ArrowRight,
  ShieldCheck,
  Zap,
  Save,
  FolderOpen,
  Trash2,
  X,
  Clock,
  Search,
  BookmarkCheck,
  RotateCcw,
  Boxes,
  Flame,
  Plus,
  Minus,
  Star,
  Crown,
  Download,
  FileText
} from 'lucide-react';
import { SavedEstimate } from '../types';
import { MaterialsSelectionModal, PlumbingItem } from './MaterialsSelectionModal';
import { FullPlumbingKitsView } from './FullPlumbingKitsView';
import { CollectorUnitBuilder } from './CollectorUnitBuilder';
import { UnderfloorHeatingCalculator } from './UnderfloorHeatingCalculator';
import { useFavoriteMaterials } from '../hooks/useFavoriteMaterials';
import { useAuth } from '../context/AuthContext';
import {
  exportCalculatorSpecificationToTxt,
  exportCalculatorSpecificationToPdf
} from '../utils/santehProExport';
import {
  PipeMaterial,
  PipeType,
  WiringScheme,
  MATERIAL_OPTIONS,
  MATERIAL_DIAMETERS_CATALOG,
  DEFAULT_DIAMETERS_BY_MATERIAL,
  getInitialMaterial,
  PIPE_TYPE_DISPLAY,
  WATER_POINT_PRESETS,
  POPULAR_ADDITIONS,
  PopularAddition,
} from '../data/materialsCalculatorData';

export { type PipeMaterial, type PipeType, type WiringScheme };

interface MaterialsCalculatorProps {
  embedded?: boolean; // If true, compact view inside instruction card
  defaultPipeLength?: number;
  defaultPointsCount?: number;
  initialPipeType?: PipeType;
  initialMaterial?: PipeMaterial;
  initialDiameters?: number[];
  title?: string;
}

export const MaterialsCalculator: React.FC<MaterialsCalculatorProps> = ({
  embedded = false,
  defaultPipeLength = 15,
  initialPipeType = 'pex_16',
  initialMaterial,
  initialDiameters,
  title = 'Калькулятор материалов и фитингов',
}) => {
  const { openAuthModal } = useAuth();
  const initMat = initialMaterial || getInitialMaterial(initialPipeType);

  // Calculator Inputs
  const [pipeLength, setPipeLength] = useState<number>(defaultPipeLength);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([
    'sink_kitchen',
    'sink_bath',
    'bathtub',
    'toilet',
    'washing_machine',
  ]);
  const [selectedMaterial, setSelectedMaterial] = useState<PipeMaterial>(initMat);
  const [selectedDiameters, setSelectedDiameters] = useState<number[]>(() => {
    if (initialDiameters && initialDiameters.length > 0) return initialDiameters;
    return DEFAULT_DIAMETERS_BY_MATERIAL[initMat] || [16, 20];
  });
  const [pipeType, setPipeType] = useState<PipeType>(initialPipeType);
  const [wiringScheme, setWiringScheme] = useState<WiringScheme>('collector');
  const [reserveMargin, setReserveMargin] = useState<number>(15); // %
  const [includePressureReducers, setIncludePressureReducers] = useState<boolean>(true);
  const [use45Elbows, setUse45Elbows] = useState<boolean>(true);
  const [includeBypasses, setIncludeBypasses] = useState<boolean>(true);
  const [showVisualGuide, setShowVisualGuide] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'elbow90' | 'bendCoil' | 'elbow45'>('elbow90');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(!embedded);

  // Custom Item Modal & Form
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState<boolean>(false);
  const [customItemForm, setCustomItemForm] = useState({
    name: '',
    category: 'Сантехника и узлы',
    unit: 'шт',
    price: 1500,
    quantity: 1,
    specs: '',
  });

  // Saved Estimates State & Modals
  const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>(() => {
    try {
      const local = localStorage.getItem('plumbing_saved_estimates');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      console.error('Error reading saved estimates from localStorage:', e);
      return [];
    }
  });

  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isSavedListModalOpen, setIsSavedListModalOpen] = useState<boolean>(false);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState<boolean>(false);
  const [customMaterials, setCustomMaterials] = useState<{ item: PlumbingItem; quantity: number }[]>(() => {
    try {
      const saved = localStorage.getItem('plumbing_calc_custom_materials');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [estimateNameInput, setEstimateNameInput] = useState<string>('');
  const [savedSearchQuery, setSavedSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [materialsMode, setMaterialsMode] = useState<'kits' | 'collector_unit' | 'underfloor_heating' | 'calculator'>('kits');
  
  // Favorites hook
  const { isFavorite, toggleFavorite } = useFavoriteMaterials();

  useEffect(() => {
    try {
      localStorage.setItem('plumbing_calc_custom_materials', JSON.stringify(customMaterials));
    } catch (e) {
      console.error('Failed to save custom materials:', e);
    }
  }, [customMaterials]);

  // Restore draft calculation from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('plumbing_calc_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (typeof draft.pipeLength === 'number' && draft.pipeLength > 0) setPipeLength(draft.pipeLength);
        if (Array.isArray(draft.selectedPoints) && draft.selectedPoints.length > 0) setSelectedPoints(draft.selectedPoints);
        if (draft.pipeMaterial) setSelectedMaterial(draft.pipeMaterial);
        if (Array.isArray(draft.selectedDiameters) && draft.selectedDiameters.length > 0) setSelectedDiameters(draft.selectedDiameters);
        if (draft.pipeType) setPipeType(draft.pipeType);
        if (draft.wiringScheme) setWiringScheme(draft.wiringScheme);
        if (typeof draft.reserveMargin === 'number') setReserveMargin(draft.reserveMargin);
        if (typeof draft.includePressureReducers === 'boolean') setIncludePressureReducers(draft.includePressureReducers);
        if (typeof draft.use45Elbows === 'boolean') setUse45Elbows(draft.use45Elbows);
        if (typeof draft.includeBypasses === 'boolean') setIncludeBypasses(draft.includeBypasses);
      }
    } catch (e) {
      console.error('Error restoring draft:', e);
    }
  }, []);

  // Save active parameters draft to localStorage on changes
  useEffect(() => {
    try {
      const draft = {
        pipeLength,
        selectedPoints,
        pipeType,
        pipeMaterial: selectedMaterial,
        selectedDiameters,
        wiringScheme,
        reserveMargin,
        includePressureReducers,
        use45Elbows,
        includeBypasses,
      };
      localStorage.setItem('plumbing_calc_draft', JSON.stringify(draft));
    } catch (e) {
      console.error('Error persisting draft:', e);
    }
  }, [
    pipeLength,
    selectedPoints,
    pipeType,
    selectedMaterial,
    selectedDiameters,
    wiringScheme,
    reserveMargin,
    includePressureReducers,
    use45Elbows,
    includeBypasses,
  ]);

  // Material and Diameter selection handlers
  const handleSelectMaterial = (mat: PipeMaterial) => {
    setSelectedMaterial(mat);
    setSelectedDiameters(DEFAULT_DIAMETERS_BY_MATERIAL[mat] || [16, 20]);
    setPipeType(mat === 'ppr' ? 'ppr_20' : mat === 'pex' ? 'pex_16' : 'metal_plastic_16');
  };

  const handleToggleDiameter = (dia: number) => {
    setSelectedDiameters((prev) => {
      if (prev.includes(dia)) {
        if (prev.length === 1) return prev; // Keep at least one diameter
        return prev.filter((d) => d !== dia);
      } else {
        return [...prev, dia].sort((a, b) => a - b);
      }
    });
  };

  const handleSelectAllDiameters = () => {
    const all = (MATERIAL_DIAMETERS_CATALOG[selectedMaterial] || []).map((d) => d.value);
    setSelectedDiameters(all);
  };

  const handleResetDiameters = () => {
    setSelectedDiameters(DEFAULT_DIAMETERS_BY_MATERIAL[selectedMaterial] || [16, 20]);
  };

  // Quick additions handlers
  const handleQuickAddPopular = (pop: PopularAddition) => {
    const newItem: PlumbingItem = {
      id: pop.id + '_' + Date.now(),
      name: pop.name,
      category: 'fittings',
      categoryLabel: pop.category,
      unit: (pop.unit as 'м' | 'шт' | 'компл' | 'рулон' | 'упак') || 'шт',
      price: pop.price,
      spec: pop.specs,
      description: pop.specs,
    };
    handleAddSelectedMaterials([{ item: newItem, quantity: 1 }]);
    showToast(`Позиция «${pop.name.split(' (')[0]}» добавлена в смету!`);
  };

  const handleAddCustomDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemForm.name.trim()) return;

    const newItem: PlumbingItem = {
      id: 'custom_' + Date.now(),
      name: customItemForm.name.trim(),
      category: 'fittings',
      categoryLabel: customItemForm.category.trim() || 'Пользовательские материалы',
      unit: (customItemForm.unit as 'м' | 'шт' | 'компл' | 'рулон' | 'упак') || 'шт',
      price: Number(customItemForm.price) || 0,
      spec: customItemForm.specs.trim() || 'Пользовательская позиция',
      description: customItemForm.specs.trim() || 'Пользовательская позиция',
    };

    handleAddSelectedMaterials([{ item: newItem, quantity: Math.max(1, Number(customItemForm.quantity) || 1) }]);
    setIsAddCustomModalOpen(false);
    setCustomItemForm({
      name: '',
      category: 'Сантехника и узлы',
      unit: 'шт',
      price: 1500,
      quantity: 1,
      specs: '',
    });
    showToast(`Позиция «${newItem.name}» успешно добавлена в смету!`);
  };

  // Quick Preset Selection
  const applyPreset = (presetName: 'flat_1room' | 'flat_3room' | 'house_standard') => {
    if (presetName === 'flat_1room') {
      setPipeLength(16);
      setSelectedPoints(['sink_kitchen', 'sink_bath', 'bathtub', 'toilet', 'washing_machine']);
      setWiringScheme('collector');
      setSelectedMaterial('pex');
      setSelectedDiameters([16, 20]);
      setPipeType('pex_16');
      setUse45Elbows(false);
      setIncludeBypasses(true);
    } else if (presetName === 'flat_3room') {
      setPipeLength(28);
      setSelectedPoints([
        'sink_kitchen',
        'sink_bath',
        'bathtub',
        'toilet',
        'bidet',
        'washing_machine',
        'dishwasher',
        'boiler',
      ]);
      setWiringScheme('collector');
      setSelectedMaterial('pex');
      setSelectedDiameters([16, 20, 25]);
      setPipeType('pex_16');
      setUse45Elbows(false);
      setIncludeBypasses(true);
    } else if (presetName === 'house_standard') {
      setPipeLength(45);
      setSelectedPoints([
        'sink_kitchen',
        'sink_bath',
        'bathtub',
        'toilet',
        'bidet',
        'washing_machine',
        'dishwasher',
        'boiler',
        'filter',
      ]);
      setWiringScheme('collector');
      setSelectedMaterial('pex');
      setSelectedDiameters([16, 20, 25, 32]);
      setPipeType('pex_16');
      setUse45Elbows(false);
      setIncludeBypasses(true);
    }
  };

  const toggleWaterPoint = (id: string) => {
    setSelectedPoints((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Complete Engineering Calculations Engine
  const calculation = useMemo(() => {
    const totalPointsCount = selectedPoints.length || 1;
    const totalLinesCount = selectedPoints.reduce((acc, pointId) => {
      const preset = WATER_POINT_PRESETS.find((p) => p.id === pointId);
      return acc + (preset ? preset.pipesCount : 2);
    }, 0);

    const rawPipeLength = pipeLength;
    const finalPipeLength = Math.ceil(rawPipeLength * (1 + reserveMargin / 100));

    const materialCatalog = MATERIAL_DIAMETERS_CATALOG[selectedMaterial] || MATERIAL_DIAMETERS_CATALOG.pex;
    const activeDiameters = selectedDiameters.length > 0 ? selectedDiameters : [materialCatalog[0].value];
    const isCoilPipe = selectedMaterial === 'pex' || selectedMaterial === 'metal_plastic';

    const items: Array<{
      category: string;
      name: string;
      quantity: string;
      unitPrice: number;
      totalPrice: number;
      note: string;
      badge?: string;
    }> = [];

    // 1. Pipes for each selected diameter
    const sortedDiameters = [...activeDiameters].sort((a, b) => a - b);
    sortedDiameters.forEach((dia, idx) => {
      const spec = materialCatalog.find((d) => d.value === dia) || materialCatalog[0];
      let share = 1;
      if (sortedDiameters.length === 2) {
        share = idx === 0 ? 0.65 : 0.35;
      } else if (sortedDiameters.length === 3) {
        share = idx === 0 ? 0.5 : idx === 1 ? 0.3 : 0.2;
      } else if (sortedDiameters.length >= 4) {
        share = idx === 0 ? 0.45 : idx === 1 ? 0.25 : idx === 2 ? 0.18 : 0.12;
      }
      const lengthForDia = Math.max(3, Math.ceil(finalPipeLength * share));
      items.push({
        category: 'Трубопровод',
        name: spec.pipeName,
        quantity: `${lengthForDia} м`,
        unitPrice: spec.pipePrice,
        totalPrice: lengthForDia * spec.pipePrice,
        note: `${spec.role} (нормативный запас +${reserveMargin}%)`,
        badge: `${dia} мм`,
      });
    });

    // 2. Sleeves / Press rings for PEX and Metal-plastic
    if (selectedMaterial === 'pex') {
      sortedDiameters.forEach((dia) => {
        const spec = materialCatalog.find((d) => d.value === dia);
        if (!spec || !spec.sleevePrice) return;
        let sleeveCount = 0;
        if (dia === 16) {
          sleeveCount = Math.ceil(totalLinesCount * 3.4) + 6;
        } else if (dia === 20) {
          sleeveCount = Math.max(8, Math.ceil(totalLinesCount * 2.2)) + 4;
        } else if (dia === 25) {
          sleeveCount = 12;
        } else {
          sleeveCount = 8;
        }
        items.push({
          category: 'Надвижные гильзы PEX',
          name: spec.sleeveName || `Гильза надвижная аксиальная PEX ${dia} мм`,
          quantity: `${sleeveCount} шт`,
          unitPrice: spec.sleevePrice,
          totalPrice: sleeveCount * spec.sleevePrice,
          note: `Для опрессовки водорозеток, уголков и фитингов ${dia} мм (+15% запас на калибровку)`,
          badge: `${dia} мм`,
        });
      });
    } else if (selectedMaterial === 'metal_plastic') {
      sortedDiameters.forEach((dia) => {
        const spec = materialCatalog.find((d) => d.value === dia);
        if (!spec || !spec.sleevePrice) return;
        const sleeveCount = dia === 16 ? Math.ceil(totalLinesCount * 3.2) + 6 : dia === 20 ? 16 : 8;
        items.push({
          category: 'Пресс-гильзы нержавеющие',
          name: spec.sleeveName || `Пресс-гильза нержавеющая AISI 304 ${dia} мм`,
          quantity: `${sleeveCount} шт`,
          unitPrice: spec.sleevePrice,
          totalPrice: sleeveCount * spec.sleevePrice,
          note: `Нержавеющая пресс-гильза с контрольными глазками опрессовки ${dia} мм`,
          badge: `${dia} мм`,
        });
      });
    }

    // 3. 90° Elbows
    sortedDiameters.forEach((dia, idx) => {
      const spec = materialCatalog.find((d) => d.value === dia) || materialCatalog[0];
      const count = idx === 0 
        ? Math.ceil(totalLinesCount * (wiringScheme === 'collector' ? 1.2 : 2.0))
        : Math.max(3, Math.ceil(totalLinesCount * 0.6));
      items.push({
        category: 'Фитинги поворота',
        name: spec.elbowName,
        quantity: `${count} шт`,
        unitPrice: spec.elbowPrice,
        totalPrice: count * spec.elbowPrice,
        note: `Поворотные узлы трассы и подводы к приборам (${dia} мм)`,
        badge: `${dia} мм`,
      });
    });

    // 4. 45° Elbows for PPR or rigid metal
    if (!isCoilPipe && use45Elbows) {
      const mainDia = sortedDiameters[0];
      const spec = materialCatalog.find((d) => d.value === mainDia) || materialCatalog[0];
      const count45 = Math.ceil(totalLinesCount * 1.5);
      items.push({
        category: 'Фитинги поворота',
        name: `Угольники 45° ${selectedMaterial === 'ppr' ? 'PPR под пайку' : 'капиллярные под пайку'} (${mainDia} мм)`,
        quantity: `${count45} шт`,
        unitPrice: Math.round(spec.elbowPrice * 0.95),
        totalPrice: count45 * Math.round(spec.elbowPrice * 0.95),
        note: 'Плавные повороты 2х45° для снижения гидродинамического шума и сопротивления',
        badge: `${mainDia} мм`,
      });
    }

    // 5. Crossover Bypasses (Обводы)
    if (includeBypasses) {
      const mainDia = sortedDiameters[0];
      const bypassCount = Math.max(2, Math.ceil(totalLinesCount * (isCoilPipe ? 0.4 : 0.6)));
      items.push({
        category: 'Обход трасс',
        name: isCoilPipe
          ? `Фиксаторы поворота трубы 90° оцинкованные (${mainDia} мм)`
          : `Обводные колена раструбные (${mainDia} мм)`,
        quantity: `${bypassCount} шт`,
        unitPrice: isCoilPipe ? 140 : 85,
        totalPrice: bypassCount * (isCoilPipe ? 140 : 85),
        note: isCoilPipe 
          ? 'Жёсткая фиксация прямого угла 90° при выходе из стяжки к смесителю'
          : 'Аккуратное пересечение труб холодной и горячей воды в одной плоскости',
        badge: `${mainDia} мм`,
      });
    }

    // 6. Straight Couplings & Transition couplings
    sortedDiameters.forEach((dia) => {
      const spec = materialCatalog.find((d) => d.value === dia) || materialCatalog[0];
      const count = isCoilPipe ? 2 : Math.max(2, 2 + Math.floor(finalPipeLength / 12));
      items.push({
        category: 'Стыковка / Ремонт',
        name: spec.couplingName,
        quantity: `${count} шт`,
        unitPrice: spec.couplingPrice,
        totalPrice: count * spec.couplingPrice,
        note: isCoilPipe
          ? `Аварийно-ремонтный запас соединителей для бухты ${dia} мм`
          : `Стыковка 4-метровых хлыстов и подгонка трассы (${dia} мм)`,
        badge: `${dia} мм`,
      });
    });

    // If multiple diameters selected: transition reduction couplings
    if (sortedDiameters.length > 1) {
      for (let i = 1; i < sortedDiameters.length; i++) {
        const d1 = sortedDiameters[i - 1];
        const d2 = sortedDiameters[i];
        const reductionPrice = Math.round(materialCatalog[0].couplingPrice * 1.5);
        items.push({
          category: 'Стыковка / Ремонт',
          name: `Муфта переходная редукционная ${d2}×${d1} мм (${selectedMaterial.toUpperCase()})`,
          quantity: '4 шт',
          unitPrice: reductionPrice,
          totalPrice: 4 * reductionPrice,
          note: `Переход с магистрали ${d2} мм на подводку ${d1} мм`,
          badge: `${d2}→${d1}`,
        });
      }
    }

    // 7. Tees (Тройники)
    if (wiringScheme === 'collector') {
      const mainDia = sortedDiameters[0];
      const spec = materialCatalog.find((d) => d.value === mainDia) || materialCatalog[0];
      items.push({
        category: 'Фитинги',
        name: spec.teeName,
        quantity: '2 шт',
        unitPrice: spec.teePrice,
        totalPrice: 2 * spec.teePrice,
        note: 'Сервисные тройники для узла ввода и опрессовки',
        badge: `${mainDia} мм`,
      });
    } else {
      const mainDia = sortedDiameters[0];
      const spec = materialCatalog.find((d) => d.value === mainDia) || materialCatalog[0];
      const teesCount = Math.max(0, totalLinesCount - 2) * 2;
      items.push({
        category: 'Фитинги',
        name: spec.teeName,
        quantity: `${teesCount} шт`,
        unitPrice: spec.teePrice,
        totalPrice: teesCount * spec.teePrice,
        note: 'Последовательные ответвления к сантехническим приборам',
        badge: `${mainDia} мм`,
      });
    }

    // 8. Water Outlets (Водорозетки настенные)
    const outletDia = sortedDiameters[0];
    const outletPrice = selectedMaterial === 'pex' ? 320 : selectedMaterial === 'metal_plastic' ? 280 : selectedMaterial === 'copper' ? 450 : 180;
    items.push({
      category: 'Водорозетки',
      name: `Водорозетки настенные ${outletDia}×1/2" ВР (латунь CW617N)`,
      quantity: `${totalLinesCount} шт`,
      unitPrice: outletPrice,
      totalPrice: totalLinesCount * outletPrice,
      note: 'Надёжные настенные уголки с креплением на монтажную планку под смесители',
      badge: `${outletDia}×1/2"`,
    });

    // 9. Collector Block if collector wiring
    if (wiringScheme === 'collector') {
      items.push({
        category: 'Коллекторный узел',
        name: 'Коллекторный блок латунный с отсекающими кранами (3/4" на 1/2")',
        quantity: '2 шт (ХВС + ГВС)',
        unitPrice: 2950,
        totalPrice: 2 * 2950,
        note: 'Попарное распределение ХВС и ГВС со встроенными вентилями',
        badge: 'ХВС/ГВС',
      });
      const adapterName = selectedMaterial === 'pex' 
        ? `Концовки коллекторные аксиальные (евроконус 3/4" х ${outletDia} мм)`
        : `Адаптеры коллекторные компрессионные (евроконус 3/4" х ${outletDia} мм)`;
      items.push({
        category: 'Коллекторный узел',
        name: adapterName,
        quantity: `${totalLinesCount} шт`,
        unitPrice: 220,
        totalPrice: totalLinesCount * 220,
        note: 'Герметичное подсоединение каждой трубной линии к коллектору',
        badge: 'Евроконус',
      });
    }

    // 10. Thermal Insulation
    sortedDiameters.forEach((dia) => {
      const insPrice = 35;
      const insMeters = Math.ceil(finalPipeLength / sortedDiameters.length);
      items.push({
        category: 'Теплоизоляция',
        name: `Теплоизоляция вспененная трубная 6 мм (рукав 2м) для трубы ${dia} мм`,
        quantity: `${insMeters} м`,
        unitPrice: insPrice,
        totalPrice: insMeters * insPrice,
        note: 'Защита от конденсата на ХВС и снижение теплопотерь на ГВС в стяжке',
        badge: `${dia} мм`,
      });
    });

    // 11. Valving & Filtration
    items.push({
      category: 'Запорная арматура',
      name: 'Краны шаровые полнопроходные 1/2" бабочка (латунь CW617N, PN40)',
      quantity: '4 шт',
      unitPrice: 650,
      totalPrice: 4 * 650,
      note: 'Вводные и отсекающие краны стояка',
    });

    items.push({
      category: 'Фильтрация',
      name: 'Фильтры сетчатые косые грубой очистки 1/2" (300 мкм, латунь CW617N)',
      quantity: '2 шт',
      unitPrice: 480,
      totalPrice: 2 * 480,
      note: 'Защита счетчиков, редукторов и картриджей от окалины',
    });

    if (includePressureReducers) {
      items.push({
        category: 'Безопасность',
        name: 'Редукторы давления поршневые/мембранные 1/2" с манометром',
        quantity: '2 шт',
        unitPrice: 2200,
        totalPrice: 2 * 2200,
        note: 'Стабилизация давления до 3.0 бар и защита от гидроударов',
      });
    }

    const clampsCount = Math.ceil(finalPipeLength * 2.2);
    items.push({
      category: 'Крепёж',
      name: 'Хомуты трубные сантехнические с резиновым виброгасителем',
      quantity: `${clampsCount} шт`,
      unitPrice: 25,
      totalPrice: clampsCount * 25,
      note: 'Надёжная фиксация труб с шагом 40-50 см',
    });

    const threadCount = Math.ceil(totalLinesCount / 4) || 1;
    items.push({
      category: 'Расходники',
      name: 'Сантехническая уплотнительная полиамидная нить (80м) / гель',
      quantity: `${threadCount} упак`,
      unitPrice: 380,
      totalPrice: threadCount * 380,
      note: 'Герметизация резьбовых соединений сантехнических узлов',
    });

    const customItemsPrice = customMaterials.reduce((acc, m) => acc + m.item.price * m.quantity, 0);
    const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0) + customItemsPrice;

    const couplingsCount = isCoilPipe ? 2 : Math.max(2, 2 + Math.floor(finalPipeLength / 12));
    const elbows45Count = (!isCoilPipe && use45Elbows) ? Math.ceil(totalLinesCount * 1.5) : 0;

    return {
      rawPipeLength,
      finalPipeLength,
      totalPointsCount,
      totalLinesCount,
      isCoilPipe,
      items,
      customItemsPrice,
      grandTotal,
      selectedMaterial,
      selectedDiameters: sortedDiameters,
      couplingsCount,
      elbows45Count,
    };
  }, [
    pipeLength,
    selectedPoints,
    selectedMaterial,
    selectedDiameters,
    wiringScheme,
    reserveMargin,
    includePressureReducers,
    use45Elbows,
    includeBypasses,
    customMaterials,
  ]);

  const handleAddSelectedMaterials = (newItems: { item: PlumbingItem; quantity: number }[]) => {
    setCustomMaterials((prev) => {
      const map = new Map<string, { item: PlumbingItem; quantity: number }>();
      prev.forEach((p) => map.set(p.item.id, { ...p }));
      newItems.forEach((n) => {
        if (map.has(n.item.id)) {
          const existing = map.get(n.item.id)!;
          existing.quantity += n.quantity;
        } else {
          map.set(n.item.id, { ...n });
        }
      });
      return Array.from(map.values());
    });
    showToast(`Добавлено ${newItems.length} поз. из Раздела материалов!`);
  };

  const handleRemoveCustomMaterial = (id: string) => {
    setCustomMaterials((prev) => prev.filter((m) => m.item.id !== id));
  };

  const handleUpdateCustomMaterialQty = (id: string, delta: number) => {
    setCustomMaterials((prev) =>
      prev
        .map((m) => {
          if (m.item.id === id) {
            const newQty = Math.max(0, m.quantity + delta);
            return { ...m, quantity: newQty };
          }
          return m;
        })
        .filter((m) => m.quantity > 0)
    );
  };

  const copyShoppingList = () => {
    let text = `======================================================================\n`;
    text += `                            САНТЕХПРО\n`;
    text += `              Твой карманный помощник по сантехнике\n`;
    text += `            ИТОГОВАЯ ВЕДОМОСТЬ КОМПЛЕКТУЮЩИХ И МАТЕРИАЛОВ\n`;
    text += `======================================================================\n\n`;
    text += `Дата расчёта: ${new Date().toLocaleDateString('ru-RU')} в ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n`;
    text += `• Длина трассы: ${calculation.rawPipeLength} м (с запасом +${reserveMargin}% = ${calculation.finalPipeLength} м)\n`;
    text += `• Точки водоразбора: ${calculation.totalPointsCount} шт (${calculation.totalLinesCount} линий ХВС/ГВС)\n`;
    text += `• Схема разводки: ${
      wiringScheme === 'collector' ? 'Коллекторная (гребёнка)' : 'Тройниковая (последовательная)'
    }\n`;
    const matLabel = MATERIAL_OPTIONS.find((m) => m.id === selectedMaterial)?.name || selectedMaterial;
    text += `• Материал труб: ${matLabel}\n`;
    text += `• Выбранные диаметры: ${calculation.selectedDiameters.map((d) => `${d} мм`).join(', ')}\n`;
    text += `• Оптимизация соединений: прямые участки, угольники 90°/45°, обводы и ремонтный резерв.\n\n`;

    text += `ВЕДОМОСТЬ ТРУБ И ФИТИНГОВ:\n`;
    calculation.items.forEach((item, index) => {
      text += `${index + 1}. [${item.category}] ${item.name} — ${item.quantity} (~${item.totalPrice.toLocaleString(
        'ru-RU'
      )} ₽)\n`;
    });

    if (customMaterials.length > 0) {
      text += `\nСПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ (ИЗ РАЗДЕЛА МАТЕРИАЛЫ):\n`;
      customMaterials.forEach((m, index) => {
        text += `${index + 1}. ${m.item.name} — ${m.quantity} ${m.item.unit} (~${(m.quantity * m.item.price).toLocaleString('ru-RU')} ₽)\n`;
      });
    }

    text += `----------------------------------------------------------------------\n`;
    text += `💰 ИТОГОВАЯ СТОИМОСТЬ СМЕТЫ: ~${calculation.grandTotal.toLocaleString(
      'ru-RU'
    )} ₽\n`;
    text += `======================================================================\n`;
    text += `Сформировано в приложении «СантехПро» (santehpro.app)\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showToast('Список комплектующих «СантехПро» скопирован!');
  };

  const handleExportTxt = () => {
    const matLabel = MATERIAL_OPTIONS.find((m) => m.id === selectedMaterial)?.name || selectedMaterial;
    exportCalculatorSpecificationToTxt({
      pipeLength: calculation.rawPipeLength,
      reserveMargin,
      finalPipeLength: calculation.finalPipeLength,
      totalPointsCount: calculation.totalPointsCount,
      totalLinesCount: calculation.totalLinesCount,
      wiringScheme,
      materialName: matLabel,
      selectedDiameters: calculation.selectedDiameters,
      items: calculation.items,
      customMaterials,
      grandTotal: calculation.grandTotal,
    });
    showToast('Текстовая ведомость «СантехПро» скачана (.txt)');
  };

  const handleExportPdf = () => {
    const matLabel = MATERIAL_OPTIONS.find((m) => m.id === selectedMaterial)?.name || selectedMaterial;
    exportCalculatorSpecificationToPdf({
      pipeLength: calculation.rawPipeLength,
      reserveMargin,
      finalPipeLength: calculation.finalPipeLength,
      totalPointsCount: calculation.totalPointsCount,
      totalLinesCount: calculation.totalLinesCount,
      wiringScheme,
      materialName: matLabel,
      selectedDiameters: calculation.selectedDiameters,
      items: calculation.items,
      customMaterials,
      grandTotal: calculation.grandTotal,
    });
    showToast('Открыто окно формирования PDF «СантехПро»');
  };

  const printList = () => {
    handleExportPdf();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  const handleOpenSaveModal = () => {
    const defaultName = `Смета ${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — ${calculation.totalPointsCount} точ. (${calculation.grandTotal.toLocaleString('ru-RU')} ₽)`;
    setEstimateNameInput(defaultName);
    setIsSaveModalOpen(true);
  };

  const handleSaveEstimate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = estimateNameInput.trim() || `Смета от ${new Date().toLocaleDateString('ru-RU')}`;

    const newEst: SavedEstimate = {
      id: 'est_' + Date.now(),
      name,
      createdAt: new Date().toISOString(),
      pipeLength,
      selectedPoints: [...selectedPoints],
      pipeType,
      pipeMaterial: selectedMaterial,
      selectedDiameters: [...selectedDiameters],
      wiringScheme,
      reserveMargin,
      includePressureReducers,
      use45Elbows,
      includeBypasses,
      grandTotal: calculation.grandTotal,
      totalPointsCount: calculation.totalPointsCount,
      totalLinesCount: calculation.totalLinesCount,
      pipeName: calculation.items[0]?.name || 'Труба',
    };

    const updated = [newEst, ...savedEstimates];
    setSavedEstimates(updated);
    try {
      localStorage.setItem('plumbing_saved_estimates', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save estimate to localStorage:', err);
    }
    setIsSaveModalOpen(false);
    showToast(`Смета "${name}" успешно сохранена!`);
  };

  const handleLoadEstimate = (est: SavedEstimate) => {
    setPipeLength(est.pipeLength || 25);
    setSelectedPoints(est.selectedPoints || []);
    const mat: PipeMaterial = (est.pipeMaterial as PipeMaterial) || getInitialMaterial(est.pipeType || 'pex');
    setSelectedMaterial(mat);
    if (Array.isArray(est.selectedDiameters) && est.selectedDiameters.length > 0) {
      setSelectedDiameters(est.selectedDiameters);
    } else {
      setSelectedDiameters(DEFAULT_DIAMETERS_BY_MATERIAL[mat] || [16, 20]);
    }
    setPipeType(est.pipeType || 'pex_16');
    setWiringScheme(est.wiringScheme || 'collector');
    setReserveMargin(typeof est.reserveMargin === 'number' ? est.reserveMargin : 15);
    setIncludePressureReducers(!!est.includePressureReducers);
    setUse45Elbows(!!est.use45Elbows);
    setIncludeBypasses(!!est.includeBypasses);
    setIsSavedListModalOpen(false);
    showToast(`Загружен расчёт "${est.name}"`);
  };

  const handleDeleteEstimate = (id: string, name: string) => {
    const updated = savedEstimates.filter((e) => e.id !== id);
    setSavedEstimates(updated);
    try {
      localStorage.setItem('plumbing_saved_estimates', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to update localStorage:', err);
    }
    showToast(`Смета "${name}" удалена`);
  };

  const handleCopySavedEstimate = (est: SavedEstimate) => {
    let text = `📋 СПИСОК ЗАКУПКИ: ${est.name}\n`;
    text += `Дата сохранения: ${formatDate(est.createdAt)}\n`;
    text += `----------------------------------------\n`;
    text += `• Длина трассы: ${est.pipeLength} м (запас +${est.reserveMargin}%)\n`;
    text += `• Точки водоразбора: ${est.totalPointsCount} шт (${est.totalLinesCount} линий)\n`;
    text += `• Схема разводки: ${
      est.wiringScheme === 'collector' ? 'Коллекторная (гребёнка)' : 'Тройниковая'
    }\n`;
    const matLabel = est.pipeMaterial
      ? MATERIAL_OPTIONS.find((m) => m.id === est.pipeMaterial)?.name || est.pipeMaterial
      : PIPE_TYPE_DISPLAY[est.pipeType] || est.pipeType;
    text += `• Материал труб: ${matLabel}\n`;
    if (est.selectedDiameters && est.selectedDiameters.length > 0) {
      text += `• Диаметры: ${est.selectedDiameters.map((d) => `${d} мм`).join(', ')}\n`;
    }
    text += `----------------------------------------\n`;
    text += `💰 ИТОГОВАЯ СУММА: ~${est.grandTotal.toLocaleString('ru-RU')} ₽\n`;

    navigator.clipboard.writeText(text);
    showToast('Текст сметы скопирован!');
  };

  const filteredSavedEstimates = useMemo(() => {
    if (!savedSearchQuery.trim()) return savedEstimates;
    const q = savedSearchQuery.toLowerCase();
    return savedEstimates.filter((est) => est.name.toLowerCase().includes(q));
  }, [savedEstimates, savedSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Navigation Mode Selector for Section "Материалы" */}
      {!embedded && (
        <div className="p-2 sm:p-2.5 bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl">
          <div className="flex items-center gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-x-auto scrollbar-none whitespace-nowrap scroll-smooth touch-pan-x">
            <button
              type="button"
              onClick={() => setMaterialsMode('kits')}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                materialsMode === 'kits'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span>🏠</span>
              <span>Комплектация объектов</span>
            </button>

            <button
              type="button"
              onClick={() => setMaterialsMode('collector_unit')}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                materialsMode === 'collector_unit'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Узлы ввода (Foriver)</span>
            </button>

            <button
              type="button"
              onClick={() => setMaterialsMode('underfloor_heating')}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                materialsMode === 'underfloor_heating'
                  ? 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Тёплый пол</span>
            </button>

            <button
              type="button"
              onClick={() => setMaterialsMode('calculator')}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                materialsMode === 'calculator'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>По метражу и точкам</span>
            </button>

            <div className="w-px h-6 bg-slate-800 shrink-0 my-auto mx-0.5" />

            <button
              type="button"
              onClick={() => setIsMaterialsModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-sm"
              title="Каталог сантехнического оборудования"
            >
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              <span>Каталог оборудования</span>
              {customMaterials.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                  {customMaterials.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsSavedListModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-sm"
              title="Сохранённые сметы"
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Мои сметы</span>
              {savedEstimates.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500 text-slate-950 font-black">
                  {savedEstimates.length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Either Full Kits View, Collector Unit Builder, Underfloor Heating, or Custom Meter Calculator Card */}
      {!embedded && materialsMode === 'kits' ? (
        <FullPlumbingKitsView
          onSwitchToMeterCalculator={() => setMaterialsMode('calculator')}
          onSaveEstimate={(newEst) => {
            setSavedEstimates((prev) => [newEst, ...prev]);
          }}
        />
      ) : !embedded && materialsMode === 'collector_unit' ? (
        <CollectorUnitBuilder
          onSaveEstimate={(newEst) => {
            setSavedEstimates((prev) => [newEst, ...prev]);
          }}
        />
      ) : !embedded && materialsMode === 'underfloor_heating' ? (
        <UnderfloorHeatingCalculator
          onSaveEstimate={(newEst) => {
            setSavedEstimates((prev) => [newEst, ...prev]);
          }}
        />
      ) : (
      /* Main Calculator Card */
      <div
        className={`rounded-3xl border transition shadow-xl overflow-hidden ${
          embedded
            ? 'bg-slate-950/90 border-slate-800 p-4 sm:p-5'
            : 'bg-slate-900 border-slate-800 p-5 sm:p-7'
        }`}
      >
        {/* Header Banner */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3 sm:pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {title}
                </h2>
              </div>
              {embedded && (
                <p className="text-xs text-slate-400">Расчёт для статьи</p>
              )}
            </div>
          </div>

          {/* Action Controls for Local Saved Estimates & Materials */}
          <div className="flex items-center space-x-2 shrink-0">
            {!embedded && (
              <button
                type="button"
                onClick={() => setMaterialsMode('kits')}
                className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                title="Перейти к выбору готовых комплектов: Дом или Квартира"
              >
                <PackageCheck className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">← Комплекты: Дом / Квартира</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMaterialsModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Открыть каталог материалов и оборудования"
            >
              <Boxes className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Раздел материалы</span>
              {customMaterials.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                  {customMaterials.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenSaveModal}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-amber-500/10 flex items-center space-x-1.5 cursor-pointer"
              title="Сохранить текущую смету в браузере"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Сохранить</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSavedListModalOpen(true)}
              className="relative px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
              title="Открыть сохранённые сметы"
            >
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Мои сметы</span>
              {savedEstimates.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500 text-slate-950 font-black">
                  {savedEstimates.length}
                </span>
              )}
            </button>

            {embedded && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700 flex items-center space-x-1 text-xs font-semibold"
              >
                <span>{isExpanded ? 'Свернуть' : 'Рассчитать материалы'}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

      {isExpanded && (
        <div className="mt-5 space-y-6">
          {/* Quick Object & Material Switcher Bar */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-300">Объект:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('house_standard')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 border ${
                    pipeLength >= 35
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  <span className="text-base">🏠</span>
                  <span>Дом</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('flat_1room')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 border ${
                    pipeLength < 35
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  <span className="text-base">🏢</span>
                  <span>Квартира</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Технология: <span className="font-bold text-amber-300">{MATERIAL_OPTIONS.find((m) => m.id === selectedMaterial)?.connectionType}</span>
              </div>
            </div>

            {/* 5 Material Types Selector Tabs */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Boxes className="w-3.5 h-3.5 text-amber-400" />
                <span>Материал трубной системы (5 стандартов монтажа):</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {MATERIAL_OPTIONS.map((mat) => {
                  const isSelected = selectedMaterial === mat.id;
                  return (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => handleSelectMaterial(mat.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/10 font-bold'
                          : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-xs font-black ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                          {mat.shortName}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {mat.badge}
                        </span>
                      </div>
                      <p className={`text-[10px] leading-tight line-clamp-2 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                        {mat.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Multi-Diameter Selection Chips */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-200">
                    Диаметры в смете:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (активные диаметры для магистралей и подводок)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAllDiameters}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    Выбрать все
                  </button>
                  <span className="text-slate-600 text-xs">•</span>
                  <button
                    type="button"
                    onClick={handleResetDiameters}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-300 cursor-pointer"
                  >
                    Сброс к стандарту
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {(MATERIAL_DIAMETERS_CATALOG[selectedMaterial] || []).map((diaSpec) => {
                  const isChecked = selectedDiameters.includes(diaSpec.value);
                  return (
                    <button
                      key={diaSpec.value}
                      type="button"
                      onClick={() => handleToggleDiameter(diaSpec.value)}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isChecked
                          ? 'bg-slate-900 border-amber-500/60 shadow-sm ring-1 ring-amber-500/40'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-black ${isChecked ? 'text-amber-400' : 'text-slate-500'}`}>
                          Ø {diaSpec.label}
                        </span>
                        <span className={`text-[10px] ${isChecked ? 'text-slate-300' : 'text-slate-600'}`}>
                          {diaSpec.pipePrice} ₽/м
                        </span>
                      </div>
                      <span className={`text-[9px] mt-1 line-clamp-1 ${isChecked ? 'text-slate-300' : 'text-slate-600'}`}>
                        {diaSpec.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Controls Column */}
            <div className="space-y-4">
              {/* Pipeline Length Slider */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-200">
                    Общая протяженность труб (метры):
                  </label>
                  <span className="font-extrabold text-amber-400 text-sm bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
                    {pipeLength} м
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={pipeLength}
                  onChange={(e) => setPipeLength(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>5 м</span>
                  <span>50 м</span>
                  <span>100 м</span>
                </div>
              </div>

              {/* Wiring Scheme & Reserve % */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-200">
                    Схема разводки:
                  </label>
                  <select
                    value={wiringScheme}
                    onChange={(e) => setWiringScheme(e.target.value as WiringScheme)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="collector">Коллекторная (гребёнка на каждую точку)</option>
                    <option value="sequential">Тройниковая (последовательная)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-200">
                    Запас на обрезку (%):
                  </label>
                  <select
                    value={reserveMargin}
                    onChange={(e) => setReserveMargin(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value={5}>+5% (Минимальный)</option>
                    <option value={10}>+10% (Стандарт)</option>
                    <option value={15}>+15% (Рекомендуемый)</option>
                    <option value={20}>+20% (С запасом на сложные обходы)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Fitting Toggles */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Параметры фитингов и поворотов:</span>
                </span>

                <div className="space-y-2">
                  {!calculation.isCoilPipe && (
                    <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-200">
                      <input
                        type="checkbox"
                        checked={use45Elbows}
                        onChange={(e) => setUse45Elbows(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Использовать угольники 45° (плавные повороты без гидравлического шума)</span>
                    </label>
                  )}

                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={includeBypasses}
                      onChange={(e) => setIncludeBypasses(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Включить обводные колена (обводы для пересекающихся труб ХВС/ГВС)</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={includePressureReducers}
                      onChange={(e) => setIncludePressureReducers(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Включить редукторы давления с манометром</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Water Points Checklist */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Точки водоразбора ({selectedPoints.length} выбрано)</span>
                </span>
                <span className="text-[10px] text-amber-400 font-bold">
                  {calculation.totalLinesCount} подключений
                </span>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {WATER_POINT_PRESETS.map((point) => {
                  const isChecked = selectedPoints.includes(point.id);
                  return (
                    <label
                      key={point.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition ${
                        isChecked
                          ? 'bg-slate-900 border-amber-500/40 text-white font-medium'
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleWaterPoint(point.id)}
                          className="w-3.5 h-3.5 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500"
                        />
                        <span>{point.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {point.pipesCount === 2 ? 'ХВС + ГВС' : 'ХВС'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Explanation Banner about Fitting Optimization with Visual Guide Toggle */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-300 block text-xs">
                    Оптимизированный норматив фитингов:
                  </span>
                  <p className="leading-relaxed text-[11px] text-slate-300">
                    {calculation.isCoilPipe ? (
                      <>
                        Трубы из бухты (PEX / металлопластик) укладываются <strong>цельными отрезками</strong> от коллектора до смесителя. Муфты снижены до 2 шт (аварийный запас). Повороты выполняются плавным изгибом трубы без разрезания.
                      </>
                    ) : (
                      <>
                        Полипропиленовые трубы соединяются <strong>угольниками 90° и 45°</strong> на поворотах и <strong>обводными коленами</strong> при пересечениях. Прямые муфты рассчитаны строго для стыковки 4-метровых хлыстов ({calculation.couplingsCount} шт).
                      </>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowVisualGuide(!showVisualGuide);
                  if (!showVisualGuide) {
                    setActiveGuideTab(calculation.isCoilPipe ? 'bendCoil' : 'elbow90');
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/30 transition flex items-center justify-center space-x-2 shrink-0 shadow-sm"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>{showVisualGuide ? 'Скрыть гид' : 'Наглядный гид: Угольник vs Изгиб'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showVisualGuide ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Interactive Visual Guide Section */}
            {showVisualGuide && (
              <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white flex items-center space-x-1.5">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span>Наглядное различие монтажа поворотов трассы</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Текущий выбор: <strong className="text-amber-300">{calculation.isCoilPipe ? 'Гибкая бухта (PEX)' : 'Жёсткий хлыст (ППР)'}</strong>
                  </span>
                </div>

                {/* Tab Selector */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('elbow90')}
                    className={`py-2 px-2 rounded-lg transition text-center ${
                      activeGuideTab === 'elbow90'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1. Угольник 90° (Жесткий)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('bendCoil')}
                    className={`py-2 px-2 rounded-lg transition text-center ${
                      activeGuideTab === 'bendCoil'
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    2. Плавный изгиб (PEX)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('elbow45')}
                    className={`py-2 px-2 rounded-lg transition text-center ${
                      activeGuideTab === 'elbow45'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    3. Составной 2x45° (ППР)
                  </button>
                </div>

                {/* SVG Schematic Canvas & Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                  {activeGuideTab === 'elbow90' && (
                    <div className="space-y-3">
                      <div className="relative bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* 2D Vector Drawing for 90-degree Fitting */}
                        <div className="w-full md:w-1/2 h-36 bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-center justify-center relative overflow-hidden">
                          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
                            {/* Grid background lines */}
                            <path d="M 0 30 L 200 30 M 0 60 L 200 60 M 0 90 L 200 90" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                            <path d="M 50 0 L 50 120 M 100 0 L 100 120 M 150 0 L 150 120" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                            
                            {/* Horizontal Pipe Inlet */}
                            <rect x="20" y="52" width="65" height="16" fill="#334155" rx="2" />
                            <line x1="20" y1="60" x2="85" y2="60" stroke="#0ea5e9" strokeWidth="3" />

                            {/* 90 Degree Elbow Fitting */}
                            <path d="M 80 48 L 104 48 C 108 48 112 52 112 56 L 112 100 L 96 100 L 96 64 C 96 60 92 56 88 56 L 80 56 Z" fill="#475569" stroke="#fbbf24" strokeWidth="2" />
                            
                            {/* Vertical Pipe Outlet */}
                            <rect x="96" y="90" width="16" height="25" fill="#334155" rx="2" />
                            <line x1="104" y1="90" x2="104" y2="115" stroke="#0ea5e9" strokeWidth="3" />

                            {/* Heat-Welded Joints Indicators */}
                            <circle cx="82" cy="60" r="5" fill="#ef4444" className="animate-pulse" />
                            <circle cx="104" cy="92" r="5" fill="#ef4444" className="animate-pulse" />

                            {/* Labels on SVG */}
                            <text x="30" y="44" fill="#94a3b8" fontSize="9" fontWeight="bold">Вход трубы</text>
                            <text x="120" y="70" fill="#fbbf24" fontSize="9" fontWeight="bold">Угольник 90°</text>
                            <text x="35" y="75" fill="#ef4444" fontSize="8">Стык #1 (пайка)</text>
                            <text x="114" y="105" fill="#ef4444" fontSize="8">Стык #2 (пайка)</text>
                          </svg>
                        </div>

                        {/* Specifications */}
                        <div className="w-full md:w-1/2 space-y-2 text-xs">
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Классическое монтажное соединение (ППР / Пресс)</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-slate-300">
                            <li className="flex items-center justify-between">
                              <span className="text-slate-400">Расход фитингов на поворот:</span>
                              <strong className="text-amber-400 font-mono">1 шт (Угольник 90°)</strong>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-400">Соединительных швов / паек:</span>
                              <strong className="text-rose-400 font-mono">2 стыка на каждый угол</strong>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-400">Гидравлическое сопротивление:</span>
                              <strong className="text-slate-200">Высокое (турбулентность)</strong>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                        <strong>Почему много фитингов:</strong> Жёсткие трубы (полипропилен) поставляются хлыстами по 4 метра и не могут быть согнуты под прямым углом без повреждения. На каждом повороте трассы мастера вынуждены отрезать трубу и паять/обжимать угольник 90°.
                      </p>
                    </div>
                  )}

                  {activeGuideTab === 'bendCoil' && (
                    <div className="space-y-3">
                      <div className="relative bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* 2D Vector Drawing for Bendable Pipe */}
                        <div className="w-full md:w-1/2 h-36 bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-center justify-center relative overflow-hidden">
                          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
                            {/* Grid background lines */}
                            <path d="M 0 30 L 200 30 M 0 60 L 200 60 M 0 90 L 200 90" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                            <path d="M 50 0 L 50 120 M 100 0 L 100 120 M 150 0 L 150 120" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />

                            {/* Continuous Smooth Bend Pipe (PEX) */}
                            <path d="M 20 50 L 80 50 C 110 50 120 60 120 90 L 120 115" stroke="#06b6d4" strokeWidth="12" strokeLinecap="round" />
                            <path d="M 20 50 L 80 50 C 110 50 120 60 120 90 L 120 115" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

                            {/* Plastic Bend Guide Bracket */}
                            <path d="M 75 42 C 115 42 128 55 128 95" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
                            <rect x="85" y="42" width="28" height="28" fill="none" stroke="#22d3ee" strokeWidth="1.5" rx="6" />

                            {/* Zero Joints Badge */}
                            <circle cx="102" cy="70" r="12" fill="#10b981" />
                            <path d="M 97 70 L 100 73 L 107 66" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Labels on SVG */}
                            <text x="25" y="38" fill="#38bdf8" fontSize="9" fontWeight="bold">Цельная труба PEX из бухты</text>
                            <text x="120" y="40" fill="#22d3ee" fontSize="8">Фиксатор изгиба (без резки)</text>
                            <text x="45" y="95" fill="#10b981" fontSize="9" fontWeight="bold">0 соединений в стяжке!</text>
                          </svg>
                        </div>

                        {/* Specifications */}
                        <div className="w-full md:w-1/2 space-y-2 text-xs">
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-bold text-[11px] border border-cyan-500/30">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Бесшовный монтаж (Сшитый полиэтилен / Металлопластик)</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-slate-300">
                            <li className="flex items-center justify-between">
                              <span className="text-slate-400">Расход фитингов на поворот:</span>
                              <strong className="text-emerald-400 font-mono">0 шт (Плавный изгиб)</strong>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-400">Соединительных швов / паек:</span>
                              <strong className="text-emerald-400 font-mono">0 стыков (100% герметично)</strong>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-400">Гидравлическое сопротивление:</span>
                              <strong className="text-emerald-300">Минимальное (плавный радиус)</strong>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                        <strong>Почему уменьшено количество фитингов:</strong> Труба разматывается из цельной бухты 100–200м и сгибается с помощью пружинного фиксатора. На трассе от гребёнки до смесителя нет НИ ОДНОГО разреза и нет фитингов. Это исключает протечки в полу и экономит десятки фитингов.
                      </p>
                    </div>
                  )}

                  {activeGuideTab === 'elbow45' && (
                    <div className="space-y-3">
                      <div className="relative bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* 2D Vector Drawing for 2x 45-degree Fitting Pair */}
                        <div className="w-full md:w-1/2 h-36 bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-center justify-center relative overflow-hidden">
                          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
                            {/* Grid background lines */}
                            <path d="M 0 30 L 200 30 M 0 60 L 200 60 M 0 90 L 200 90" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />

                            {/* Pipe Path with 2x 45 elbows */}
                            <path d="M 20 40 L 70 40 L 110 80 L 110 115" stroke="#10b981" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M 20 40 L 70 40 L 110 80 L 110 115" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Two 45 Degree Elbows */}
                            <circle cx="70" cy="40" r="7" fill="#047857" stroke="#34d399" strokeWidth="2" />
                            <circle cx="110" cy="80" r="7" fill="#047857" stroke="#34d399" strokeWidth="2" />

                            {/* Labels on SVG */}
                            <text x="25" y="28" fill="#a7f3d0" fontSize="9" fontWeight="bold">Вход трассы</text>
                            <text x="80" y="32" fill="#34d399" fontSize="8">Угольник 45° #1</text>
                            <text x="120" y="75" fill="#34d399" fontSize="8">Угольник 45° #2</text>
                            <text x="40" y="100" fill="#10b981" fontSize="9" fontWeight="bold">Плавный поток без шума</text>
                          </svg>
                        </div>

                        {/* Specifications */}
                        <div className="w-full md:w-1/2 space-y-2 text-xs">
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                            <Zap className="w-3.5 h-3.5" />
                            <span>Тихий гидродинамический вариант (Полипропилен)</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-slate-300">
                            <li className="flex items-center justify-between">
                              <span className="text-slate-400">Расход фитингов на поворот:</span>
                              <strong className="text-emerald-400 font-mono">2 шт (Угольники 45°)</strong>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-400">Соединительных швов / паек:</span>
                              <strong className="text-amber-400 font-mono">4 стыка</strong>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-400">Шум и гидравлика:</span>
                              <strong className="text-emerald-300">Низкий уровень шума</strong>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                        <strong>Зачем используют 2 угольника по 45°:</strong> На ответственных магистралях профессионалы избегают жесткого угла 90°. Пайка двух угольников по 45° с коротким патрубком снижает гидравлический удар и исключает журчание воды в стенах.
                      </p>
                    </div>
                  )}

                  {/* Comparison Summary Quick Matrix */}
                  <div className="pt-2 border-t border-slate-800 text-[11px]">
                    <span className="font-bold text-slate-300 block mb-2">Сводная таблица технологии монтажа:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-amber-400 font-extrabold block mb-1">Полипропилен (PPR)</span>
                        <div className="text-slate-300 space-y-0.5">
                          • Хлысты по 4 метра<br />
                          • Соединительные муфты каждые 4м<br />
                          • Угольники 90°/45° на каждом углу
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-cyan-400 font-extrabold block mb-1">Сшитый полиэтилен (PEX)</span>
                        <div className="text-slate-300 space-y-0.5">
                          • Бухты 100–200 метров<br />
                          • <strong>0 муфт</strong> на прямых участках<br />
                          • <strong>0 фитингов</strong> на поворотах пола
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-emerald-400 font-extrabold block mb-1">Металлопластик (Пресс)</span>
                        <div className="text-slate-300 space-y-0.5">
                          • Бухты по 50–100 метров<br />
                          • Изгиб с помощью пружины<br />
                          • Минимальный расход комплектующих
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Material Breakdown Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                <span>Итоговая ведомость комплектующих</span>
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copyShoppingList}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
                    copied
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Скопировано!' : 'Скопировать'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportTxt}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                  title="Экспорт в текстовый файл (.txt) с заголовком «СантехПро»"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Экспорт TXT</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                  title="Экспорт в PDF / Печать с заголовком «СантехПро»"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Экспорт PDF</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="p-3">Категория</th>
                    <th className="p-3">Наименование материала / фитинга</th>
                    <th className="p-3 text-center">Количество</th>
                    <th className="p-3 text-right">Средняя цена</th>
                    <th className="p-3 text-right">Сумма (₽)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {calculation.items.map((item, idx) => {
                    const itemId = `calc_${item.name.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '_')}`;
                    const isFav = isFavorite(itemId);
                    return (
                      <tr key={idx} className={`transition ${isFav ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-900/50'}`}>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={(e) => toggleFavorite(itemId, e)}
                              className="p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer text-slate-500 hover:text-amber-400"
                              title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
                            >
                              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                            </button>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-cyan-300 border border-slate-800">
                              {item.category}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-white flex items-center space-x-2 flex-wrap">
                            <span>{item.name}</span>
                            {isFav && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-flex items-center space-x-1">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                <span>Часто используемое</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{item.note}</div>
                        </td>
                        <td className="p-3 text-center font-bold text-amber-400 font-mono">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right text-slate-400">
                          {item.unitPrice.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="p-3 text-right font-extrabold text-white">
                          {item.totalPrice.toLocaleString('ru-RU')} ₽
                        </td>
                      </tr>
                    );
                  })}

                  {/* Section Divider & Custom Materials from "Раздел материалы" */}
                  {customMaterials.length > 0 && (
                    <>
                      <tr className="bg-amber-500/10 border-y border-amber-500/20">
                        <td colSpan={5} className="p-2.5 px-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[11px] text-amber-300 flex items-center space-x-1.5">
                              <Boxes className="w-3.5 h-3.5" />
                              <span>Выбранное оборудование из «Раздела материалы» ({customMaterials.length} поз.)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsMaterialsModalOpen(true)}
                              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                            >
                              + Добавить ещё
                            </button>
                          </div>
                        </td>
                      </tr>
                      {customMaterials.map((m) => (
                        <tr key={m.item.id} className="hover:bg-amber-500/5 bg-slate-950/40 transition border-b border-slate-800/80">
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {m.item.category}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-white flex items-center space-x-2">
                              <span>{m.item.name}</span>
                              {m.item.brand && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                                  {m.item.brand}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{m.item.specs}</div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateCustomMaterialQty(m.item.id, -1)}
                                className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-bold text-amber-400 font-mono px-1.5 text-xs min-w-[2.5rem]">
                                {m.quantity} {m.item.unit}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCustomMaterialQty(m.item.id, 1)}
                                className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-right text-slate-400">
                            {m.item.price.toLocaleString('ru-RU')} ₽/{m.item.unit}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <span className="font-extrabold text-amber-400">
                                {(m.quantity * m.item.price).toLocaleString('ru-RU')} ₽
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomMaterial(m.item.id)}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                title="Удалить из сметы"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Popular Items Carousel / Grid */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Быстрое добавление ходовых узлов и сантехники:</span>
                </span>
                <span className="text-[10px] text-slate-400">1 клик для добавления в смету</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {POPULAR_ADDITIONS.slice(0, 6).map((pop) => (
                  <button
                    key={pop.id}
                    type="button"
                    onClick={() => handleQuickAddPopular(pop)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-white group-hover:text-amber-300 line-clamp-1">
                        {pop.name.split(' (')[0]}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                        {pop.specs}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-800">
                      <span className="text-[10px] font-extrabold text-amber-400">
                        {pop.price.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-[9px] font-bold text-cyan-400 group-hover:underline">
                        + Добавить
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Button to add equipment from catalog */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsMaterialsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>+ Добавить котлы, коллекторы, трубы из «Раздела материалы»</span>
              </button>
            </div>

            {/* Total Summary Footer Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-500/10 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center md:text-left">
                <span className="text-xs text-slate-400 font-medium">Оптимизированный примерный бюджет:</span>
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  ~{calculation.grandTotal.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-[10px] text-slate-400">
                  * Средние рыночные цены Leroy Merlin, Petrovich, Valtec
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleExportTxt}
                  className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                  title="Экспорт ведомости в текстовый файл (.txt) с заголовком «СантехПро»"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Экспорт TXT</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                  title="Экспорт в PDF с фирменной шапкой «СантехПро»"
                >
                  <Printer className="w-4 h-4 text-cyan-400" />
                  <span>Экспорт PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenSaveModal}
                  className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition border border-amber-500/30 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Сохранить смету</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSavedListModalOpen(true)}
                  className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  <span>Мои сметы ({savedEstimates.length})</span>
                </button>

                <button
                  type="button"
                  onClick={copyShoppingList}
                  className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Забрать список</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      )}

      {/* Save Estimate Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Сохранить смету в браузере</h3>
                <p className="text-xs text-slate-400">Смета сохранится в вашем браузере (localStorage)</p>
              </div>
            </div>

            <form onSubmit={handleSaveEstimate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Название сметы / Название объекта:
                </label>
                <input
                  type="text"
                  value={estimateNameInput}
                  onChange={(e) => setEstimateNameInput(e.target.value)}
                  placeholder="Например: Ванная и кухня ЖК Северный"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Summary card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Ориентировочная сумма:</span>
                  <strong className="text-amber-400 font-mono text-sm">
                    ~{calculation.grandTotal.toLocaleString('ru-RU')} ₽
                  </strong>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Параметры:</span>
                  <span>
                    {calculation.rawPipeLength}м • {calculation.totalPointsCount} точ. • {PIPE_TYPE_DISPLAY[pipeType]}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 flex items-center space-x-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Сохранить смету</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saved Estimates List Modal */}
      {isSavedListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center space-x-2">
                    <span>Сохранённые сметы</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold border border-cyan-500/30">
                      {savedEstimates.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Локальное сохранение в памяти вашего браузера (localStorage)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSavedListModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input if > 2 estimates */}
            {savedEstimates.length > 2 && (
              <div className="relative shrink-0">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={savedSearchQuery}
                  onChange={(e) => setSavedSearchQuery(e.target.value)}
                  placeholder="Поиск по названию сметы..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            {/* Content List */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {filteredSavedEstimates.length === 0 ? (
                <div className="py-10 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                    <BookmarkCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">
                      {savedEstimates.length === 0 ? 'Нет сохранённых смет' : 'Ничего не найдено'}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {savedEstimates.length === 0
                        ? 'Выполните расчёт в калькуляторе и нажмите "Сохранить смету", чтобы вернуться к нему позже.'
                        : 'Попробуйте изменить поисковый запрос.'}
                    </p>
                  </div>
                  {savedEstimates.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSavedListModalOpen(false);
                        handleOpenSaveModal();
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition inline-flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Сохранить текущий расчёт</span>
                    </button>
                  )}
                </div>
              ) : (
                filteredSavedEstimates.map((est) => (
                  <div
                    key={est.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-white">{est.name}</h4>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{formatDate(est.createdAt)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-base font-black text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl self-start sm:self-auto">
                        ~{est.grandTotal.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>

                    {/* Tags / Params */}
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                        📏 Трасса: <strong>{est.pipeLength} м</strong> (+{est.reserveMargin}%)
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                        🚰 Точки: <strong>{est.totalPointsCount} шт</strong> ({est.totalLinesCount} лин)
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">
                        🧪 {est.pipeMaterial ? (MATERIAL_OPTIONS.find((m) => m.id === est.pipeMaterial)?.shortName || est.pipeMaterial) : (PIPE_TYPE_DISPLAY[est.pipeType] || est.pipeType)}
                      </span>
                      {est.selectedDiameters && est.selectedDiameters.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300">
                          ⭕ {est.selectedDiameters.map((d) => `Ø${d}`).join(' + ')}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                        🔀 {est.wiringScheme === 'collector' ? 'Коллекторная' : 'Тройниковая'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-900 gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadEstimate(est)}
                        className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-extrabold text-xs transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Загрузить в калькулятор</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopySavedEstimate(est)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
                          title="Скопировать текстовую смету"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEstimate(est.id, est.name)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition cursor-pointer"
                          title="Удалить смету"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3 shrink-0">
              {savedEstimates.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Удалить ВСЕ сохранённые сметы? Это действие нельзя отменить.')) {
                      setSavedEstimates([]);
                      localStorage.removeItem('plumbing_saved_estimates');
                      showToast('Все сметы удалены');
                    }
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Очистить все</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setIsSavedListModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Materials Selection Modal */}
      <MaterialsSelectionModal
        isOpen={isMaterialsModalOpen}
        onClose={() => setIsMaterialsModalOpen(false)}
        onAddSelectedToEstimate={handleAddSelectedMaterials}
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-2xl shadow-amber-500/30 flex items-center space-x-2 border border-amber-400">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

