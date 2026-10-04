import React, { useState, useMemo } from 'react';
import {
  Flame,
  CheckCircle2,
  Copy,
  Printer,
  Save,
  Download,
  Plus,
  Trash2,
  SlidersHorizontal,
  Layers,
  PhoneCall,
  FileText,
  X,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  FileDown,
  Loader2
} from 'lucide-react';
import { SavedEstimate } from '../types';
import { downloadUnderfloorHeatingPdf } from '../utils/pdfGenerator';

export interface HeatingRoom {
  id: string;
  name: string;
  totalArea: number; // м²
  unheatedArea: number; // м²
  stepMm: 100 | 150 | 200;
  pattern: 'spiral' | 'snake';
  transitDistance: number;
}

interface UnderfloorHeatingCalculatorProps {
  onSaveEstimate?: (est: SavedEstimate) => void;
  onOpenSpecialists?: () => void;
}

export const UnderfloorHeatingCalculator: React.FC<UnderfloorHeatingCalculatorProps> = ({
  onSaveEstimate,
  onOpenSpecialists,
}) => {
  // Main mode: Water floor or Electric floor
  const [floorType, setFloorType] = useState<'water' | 'electric'>('water');

  // Pipe selection for water floor
  const [pipeBrand, setPipeBrand] = useState<'pexa_16' | 'pert_16' | 'pexa_20'>('pexa_16');
  const [insulationType, setInsulationType] = useState<'boss_mats' | 'epps_tacker'>('boss_mats');
  const [cabinetType, setCabinetType] = useState<'built_in' | 'wall_mounted'>('built_in');
  const [includeMixingUnit, setIncludeMixingUnit] = useState<boolean>(true);
  const [includeScreedAdditives, setIncludeScreedAdditives] = useState<boolean>(true);
  const [includeLabor, setIncludeLabor] = useState<boolean>(true);
  const [laborTier, setLaborTier] = useState<'economy' | 'standard' | 'premium' | 'custom'>('standard');
  const [customLaborRate, setCustomLaborRate] = useState<number>(850);
  const [includeScreedPouring, setIncludeScreedPouring] = useState<boolean>(false);
  const [isLaborExplanationOpen, setIsLaborExplanationOpen] = useState<boolean>(true);

  // Electric floor options
  const [electricType, setElectricType] = useState<'mat_tile' | 'cable_screed'>('mat_tile');
  const [thermostatType, setThermostatType] = useState<'wifi_smart' | 'programmable' | 'mechanical'>('wifi_smart');

  // Rooms list
  const [rooms, setRooms] = useState<HeatingRoom[]>([
    {
      id: 'room-1',
      name: 'Кухня-гостиная',
      totalArea: 22,
      unheatedArea: 4,
      stepMm: 150,
      pattern: 'spiral',
      transitDistance: 5,
    },
    {
      id: 'room-2',
      name: 'Ванная комната',
      totalArea: 6,
      unheatedArea: 2,
      stepMm: 100,
      pattern: 'spiral',
      transitDistance: 3,
    },
    {
      id: 'room-3',
      name: 'Прихожая / коридор',
      totalArea: 8,
      unheatedArea: 1,
      stepMm: 150,
      pattern: 'snake',
      transitDistance: 2,
    },
  ]);

  // Modals & toast
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddRoom = () => {
    const newId = `room-${Date.now()}`;
    setRooms((prev) => [
      ...prev,
      {
        id: newId,
        name: `Помещение ${prev.length + 1}`,
        totalArea: 12,
        unheatedArea: 2,
        stepMm: 150,
        pattern: 'spiral',
        transitDistance: 4,
      },
    ]);
  };

  const handleRemoveRoom = (id: string) => {
    if (rooms.length <= 1) {
      showToast('Должно остаться хотя бы одно помещение');
      return;
    }
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRoom = (id: string, field: keyof HeatingRoom, value: any) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Detailed calculations per room
  const calculatedRooms = useMemo(() => {
    return rooms.map((room) => {
      const netHeatedArea = Math.max(1, room.totalArea - room.unheatedArea);
      const pipeDensity = room.stepMm === 100 ? 10.0 : room.stepMm === 150 ? 6.7 : 5.0;
      const basePipeLength = netHeatedArea * pipeDensity;
      const transitPipes = room.transitDistance * 2;
      const totalRawPipe = (basePipeLength + transitPipes) * 1.1;

      // Норматив: максимальная длина 1 контура 16 мм = 75 м
      const maxLoopLength = 75;
      const loopsCount = Math.max(1, Math.ceil(totalRawPipe / maxLoopLength));
      const lengthPerLoop = Math.round(totalRawPipe / loopsCount);
      const totalPipe = lengthPerLoop * loopsCount;
      const perimeter = Math.round(Math.sqrt(room.totalArea) * 4);

      return {
        ...room,
        netHeatedArea,
        totalPipe,
        loopsCount,
        lengthPerLoop,
        perimeter,
      };
    });
  }, [rooms]);

  const totalGrossArea = useMemo(() => rooms.reduce((acc, r) => acc + r.totalArea, 0), [rooms]);
  const totalNetArea = useMemo(() => calculatedRooms.reduce((acc, r) => acc + r.netHeatedArea, 0), [calculatedRooms]);
  const totalPipesLength = useMemo(() => calculatedRooms.reduce((acc, r) => acc + r.totalPipe, 0), [calculatedRooms]);
  const totalLoopsCount = useMemo(() => calculatedRooms.reduce((acc, r) => acc + r.loopsCount, 0), [calculatedRooms]);
  const totalPerimeter = useMemo(() => calculatedRooms.reduce((acc, r) => acc + r.perimeter, 0), [calculatedRooms]);

  const pipeInfo = useMemo(() => {
    switch (pipeBrand) {
      case 'pexa_16':
        return { name: 'Труба из сшитого полиэтилена PE-Xa 16х2.0 мм EVOH (Stout / Rehau)', pricePerMeter: 125 };
      case 'pert_16':
        return { name: 'Труба термостойкая PE-RT Type II 16х2.0 мм (Valtec / Uni-Fitt)', pricePerMeter: 85 };
      case 'pexa_20':
        return { name: 'Труба увеличенного диаметра PE-Xa 20х2.0 мм (Stout / Rehau Rautherm S)', pricePerMeter: 165 };
    }
  }, [pipeBrand]);

  // Water Floor Specs
  const waterSpecification = useMemo(() => {
    const items: Array<{
      category: string;
      name: string;
      quantity: string;
      unit: string;
      unitPrice: number;
      totalPrice: number;
      note: string;
      badge?: string;
    }> = [];

    // 1. Труба
    const pipeCost = totalPipesLength * pipeInfo.pricePerMeter;
    items.push({
      category: 'Труба теплого пола',
      name: pipeInfo.name,
      quantity: `${totalPipesLength}`,
      unit: 'м',
      unitPrice: pipeInfo.pricePerMeter,
      totalPrice: pipeCost,
      note: `Рассчитано на ${totalLoopsCount} контуров с учетом транзитов и запаса 10%`,
      badge: `${totalLoopsCount} петель`,
    });

    // 2. Коллекторная группа с расходомерами
    const collectorPricePerOutlet = 1650;
    const collectorBaseCost = 3500 + totalLoopsCount * collectorPricePerOutlet;
    items.push({
      category: 'Коллекторная группа',
      name: `Коллекторный блок из нержавеющей стали с расходомерами на ${totalLoopsCount} выходов (1" ВР)`,
      quantity: '1',
      unit: 'компл',
      unitPrice: collectorBaseCost,
      totalPrice: collectorBaseCost,
      note: 'В комплекте: расходомеры, термоклапаны, воздухоотводчики, краны, кронштейны',
      badge: `${totalLoopsCount} выходов`,
    });

    // Евроконусы
    const euroconesCount = totalLoopsCount * 2;
    items.push({
      category: 'Коллекторная группа',
      name: `Концовки коллекторные евроконус 3/4" под трубу 16х2.0 / 20х2.0 мм`,
      quantity: `${euroconesCount}`,
      unit: 'шт',
      unitPrice: 260,
      totalPrice: euroconesCount * 260,
      note: 'По 2 шт на каждый контур (подача и обратка)',
      badge: `${euroconesCount} шт`,
    });

    // 3. Смесительный узел
    if (includeMixingUnit) {
      items.push({
        category: 'Смесительный узел',
        name: 'Насосно-смесительный узел для теплого пола с термоголовкой (20-50°C) и циркуляционным насосом 25/60',
        quantity: '1',
        unit: 'компл',
        unitPrice: 26500,
        totalPrice: 26500,
        note: 'Обеспечивает точную комфортную температуру подачи теплоносителя и циркуляцию',
        badge: 'Насос 25/60',
      });
    }

    // 4. Шкаф
    const cabinetCost = totalLoopsCount <= 4 ? 3600 : totalLoopsCount <= 8 ? 4800 : 6200;
    items.push({
      category: 'Монтажные элементы',
      name: `Коллекторный шкаф ${cabinetType === 'built_in' ? 'встраиваемый (ШРВ)' : 'пристенный наружный (ШРН)'} на ${totalLoopsCount} контуров`,
      quantity: '1',
      unit: 'шт',
      unitPrice: cabinetCost,
      totalPrice: cabinetCost,
      note: 'Металлический шкаф с замком и регулировкой по высоте',
      badge: cabinetType === 'built_in' ? 'ШРВ в нишу' : 'ШРН настенный',
    });

    // 5. Теплоизоляция
    if (insulationType === 'boss_mats') {
      const matsArea = Math.ceil(totalGrossArea * 1.05);
      const matPricePerSqm = 650;
      items.push({
        category: 'Теплоизоляция',
        name: 'Теплоизоляционные маты с фиксаторами (бобышками) плотностью 30 кг/м³ с замками',
        quantity: `${matsArea}`,
        unit: 'м²',
        unitPrice: matPricePerSqm,
        totalPrice: matsArea * matPricePerSqm,
        note: 'Обеспечивают идеальный шаг укладки без использования сетки и хомутов',
        badge: 'Маты с бобышками',
      });
    } else {
      const eppsSheets = Math.ceil(totalGrossArea * 1.05);
      const eppsPrice = 450;
      items.push({
        category: 'Теплоизоляция',
        name: 'Плиты экструдированного пенополистирола ЭППС 30-50 мм (Пеноплэкс) + мультифольга с разметкой',
        quantity: `${eppsSheets}`,
        unit: 'м²',
        unitPrice: eppsPrice,
        totalPrice: eppsSheets * eppsPrice,
        note: 'Высокая прочность на сжатие и максимальная теплоизоляция перекрытия',
        badge: 'ЭППС 50 мм',
      });

      const clipsCount = Math.ceil(totalPipesLength * 3);
      items.push({
        category: 'Крепеж',
        name: 'Якорные скобы гарпунные (такерные фиксаторы) для трубы',
        quantity: `${clipsCount}`,
        unit: 'шт',
        unitPrice: 1.8,
        totalPrice: Math.round(clipsCount * 1.8),
        note: 'Фиксация трубы в слой утеплителя ЭППС с помощью такера',
        badge: `${clipsCount} шт`,
      });
    }

    // 6. Демпферная лента
    const damperLength = Math.ceil(totalPerimeter * 1.15);
    items.push({
      category: 'Монтажные элементы',
      name: 'Демпферная компенсационная лента 8х150 мм с фартуком (вспененный полиэтилен)',
      quantity: `${damperLength}`,
      unit: 'м',
      unitPrice: 38,
      totalPrice: damperLength * 38,
      note: 'Компенсация температурного расширения стяжки по периметру и в деформационных швах',
      badge: `${damperLength} м`,
    });

    // 7. Стяжка
    if (includeScreedAdditives) {
      const screedVolumeM3 = totalGrossArea * 0.07;
      const plasticizerLiters = Math.ceil(screedVolumeM3 * 6);
      items.push({
        category: 'Стяжка и химия',
        name: 'Пластификатор для стяжки теплого пола (увеличивает теплоотдачу и плотность)',
        quantity: `${plasticizerLiters}`,
        unit: 'л',
        unitPrice: 220,
        totalPrice: plasticizerLiters * 220,
        note: 'Снижает водопотребность раствора, исключает пустоты вокруг труб',
        badge: `${plasticizerLiters} л`,
      });

      const fiberPacks = Math.ceil(totalGrossArea / 15);
      items.push({
        category: 'Стяжка и химия',
        name: 'Полипропиленовое фиброволокно для микроармирования стяжки (мешки по 0.9 кг)',
        quantity: `${fiberPacks}`,
        unit: 'упак',
        unitPrice: 450,
        totalPrice: fiberPacks * 450,
        note: 'Предотвращает образование усадочных микротрещин при циклическом нагреве',
        badge: `${fiberPacks} упак`,
      });
    }

    return items;
  }, [
    totalPipesLength,
    pipeInfo,
    totalLoopsCount,
    includeMixingUnit,
    cabinetType,
    insulationType,
    totalGrossArea,
    totalPerimeter,
    includeScreedAdditives,
  ]);

  // Electric Floor Specs
  const electricSpecification = useMemo(() => {
    const items: Array<{
      category: string;
      name: string;
      quantity: string;
      unit: string;
      unitPrice: number;
      totalPrice: number;
      note: string;
      badge?: string;
    }> = [];

    const powerPerSqm = 150;
    const totalPowerWatts = Math.round(totalNetArea * powerPerSqm);

    if (electricType === 'mat_tile') {
      items.push({
        category: 'Нагревательные элементы',
        name: `Тонкий двухжильный нагревательный мат под плитку 150 Вт/м² (Thermo / Devi / Теплолюкс)`,
        quantity: `${Math.ceil(totalNetArea)}`,
        unit: 'м²',
        unitPrice: 3850,
        totalPrice: Math.ceil(totalNetArea) * 3850,
        note: `Суммарная тепловая мощность: ${(totalPowerWatts / 1000).toFixed(2)} кВт. Монтаж в слой плиточного клея`,
        badge: 'Мат под плитку',
      });
    } else {
      items.push({
        category: 'Нагревательные элементы',
        name: `Двухжильный нагревательный кабель повышенной надежности в стяжку 18 Вт/м (Devi / Теплолюкс)`,
        quantity: `${Math.ceil(totalNetArea * 7)}`,
        unit: 'м',
        unitPrice: 420,
        totalPrice: Math.ceil(totalNetArea * 7) * 420,
        note: `Суммарная тепловая мощность: ${(totalPowerWatts / 1000).toFixed(2)} кВт. Монтаж в стяжку 3-5 см`,
        badge: 'Кабель в стяжку',
      });

      items.push({
        category: 'Монтажные элементы',
        name: 'Монтажная перфорированная оцинкованная лента для фиксации кабеля',
        quantity: `${Math.ceil(totalNetArea * 2)}`,
        unit: 'м',
        unitPrice: 65,
        totalPrice: Math.ceil(totalNetArea * 2) * 65,
        note: 'Обеспечивает точный шаг раскладки кабеля на полу',
        badge: 'Монтажная лента',
      });
    }

    const thermostatPrice =
      thermostatType === 'wifi_smart' ? 4900 : thermostatType === 'programmable' ? 3200 : 1850;
    const thermostatName =
      thermostatType === 'wifi_smart'
        ? 'Сенсорный смарт-терморегулятор с Wi-Fi управлением со смартфона (Tuya / Smart Life)'
        : thermostatType === 'programmable'
        ? 'Программируемый электронный терморегулятор с ЖК-экраном'
        : 'Электромеханический терморегулятор с дисковым управлением';

    items.push({
      category: 'Управление и автоматика',
      name: thermostatName,
      quantity: `${rooms.length}`,
      unit: 'шт',
      unitPrice: thermostatPrice,
      totalPrice: rooms.length * thermostatPrice,
      note: `По одному индивидуальному регулятору на каждое из ${rooms.length} помещений`,
      badge: thermostatType === 'wifi_smart' ? 'Wi-Fi Smart' : 'Терморегулятор',
    });

    items.push({
      category: 'Монтажные элементы',
      name: 'Гофрированная трубка ПНД диам. 16 мм с латунной заглушкой под датчик температуры',
      quantity: `${rooms.length * 3}`,
      unit: 'м',
      unitPrice: 45,
      totalPrice: rooms.length * 3 * 45,
      note: 'Обеспечивает возможность замены термодатчика без вскрытия напольного покрытия',
      badge: 'Датчик в гофре',
    });

    return items;
  }, [electricType, totalNetArea, rooms.length, thermostatType]);

  const activeSpecification = floorType === 'water' ? waterSpecification : electricSpecification;

  const totalMaterialsCost = useMemo(() => {
    return activeSpecification.reduce((acc, it) => acc + it.totalPrice, 0);
  }, [activeSpecification]);

  const effectiveLaborRatePerM2 = useMemo(() => {
    if (laborTier === 'economy') return 650;
    if (laborTier === 'standard') return 850;
    if (laborTier === 'premium') return 1250;
    return customLaborRate;
  }, [laborTier, customLaborRate]);

  const screedLaborCost = useMemo(() => {
    return includeScreedPouring ? Math.round(totalGrossArea * 550) : 0;
  }, [includeScreedPouring, totalGrossArea]);

  const laborOperationsBreakdown = useMemo(() => {
    if (floorType === 'water') {
      const prepAndInsulation = Math.round(totalGrossArea * 250);
      const pipeLaying = Math.round(totalGrossArea * (effectiveLaborRatePerM2 - 250 - 150));
      const collectorAndTesting = Math.round(totalGrossArea * 150 + 6500);
      return [
        {
          name: 'Подготовка основания, монтаж демпферной ленты и теплоизоляции / матов',
          volume: `${totalGrossArea} м²`,
          unitRate: '250 ₽/м²',
          cost: prepAndInsulation,
        },
        {
          name: `Раскладка и надежная фиксация греющей трубы (улитка/змейка, ${totalPipesLength} м)`,
          volume: `${totalGrossArea} м²`,
          unitRate: `${effectiveLaborRatePerM2 - 400} ₽/м²`,
          cost: pipeLaying,
        },
        {
          name: `Монтаж коллекторного шкафа, подключение ${totalLoopsCount} контуров евроконусами и опрессовка 6-8 бар`,
          volume: '1 комплекс',
          unitRate: 'По регламенту',
          cost: collectorAndTesting,
        },
        ...(includeScreedPouring
          ? [
              {
                name: 'Механизированная полусухая стяжка пола со шлифовкой и демпферами',
                volume: `${totalGrossArea} м²`,
                unitRate: '550 ₽/м²',
                cost: screedLaborCost,
              },
            ]
          : []),
      ];
    } else {
      const matLaying = Math.round(totalNetArea * effectiveLaborRatePerM2);
      const thermostatWiring = rooms.length * 1500;
      return [
        {
          name: `Раскладка и фиксация нагревательного мата/кабеля (${totalNetArea} м²)`,
          volume: `${totalNetArea} м²`,
          unitRate: `${effectiveLaborRatePerM2} ₽/м²`,
          cost: matLaying,
        },
        {
          name: `Установка датчиков температуры в гофротрубке и подключение ${rooms.length} терморегуляторов`,
          volume: `${rooms.length} шт`,
          unitRate: '1 500 ₽/шт',
          cost: thermostatWiring,
        },
      ];
    }
  }, [floorType, totalGrossArea, totalNetArea, effectiveLaborRatePerM2, totalPipesLength, totalLoopsCount, includeScreedPouring, screedLaborCost, rooms.length]);

  const laborCost = useMemo(() => {
    if (!includeLabor) return 0;
    if (floorType === 'water') {
      return Math.round(totalGrossArea * effectiveLaborRatePerM2 + 6500 + screedLaborCost);
    } else {
      return Math.round(totalNetArea * effectiveLaborRatePerM2 + rooms.length * 1500);
    }
  }, [includeLabor, floorType, totalGrossArea, totalNetArea, effectiveLaborRatePerM2, screedLaborCost, rooms.length]);

  const grandTotal = totalMaterialsCost + laborCost;

  const handleSaveToEstimates = () => {
    const est: SavedEstimate = {
      id: `warmfloor-${Date.now()}`,
      name: `Тёплый пол ${floorType === 'water' ? 'водяной' : 'электрический'} (${totalGrossArea} м², ${rooms.length} комн)`,
      createdAt: new Date().toISOString(),
      pipeLength: totalPipesLength,
      selectedPoints: [],
      pipeType: pipeBrand === 'pert_16' ? 'pex_16' : 'pex_20',
      pipeMaterial: 'pex',
      wiringScheme: 'collector',
      reserveMargin: 10,
      includePressureReducers: true,
      use45Elbows: true,
      includeBypasses: true,
      grandTotal: grandTotal,
      totalPointsCount: totalLoopsCount,
      totalLinesCount: totalLoopsCount,
      pipeName: pipeInfo.name,
      items: [
        ...activeSpecification.map(s => ({
          name: s.name,
          quantity: `${s.quantity} ${s.unit}`,
          unit: s.unit,
          price: s.unitPrice,
          total: s.totalPrice,
          category: s.category
        })),
        ...(includeLabor ? [{
          name: `Монтаж тёплого пола под ключ (${totalGrossArea} м²)`,
          quantity: '1 объект',
          unit: 'объект',
          price: laborCost,
          total: laborCost,
          category: 'Монтажные работы'
        }] : [])
      ],
      kitType: 'custom'
    };

    if (onSaveEstimate) {
      onSaveEstimate(est);
    }

    try {
      const existing = localStorage.getItem('plumbing_saved_estimates');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(est);
      localStorage.setItem('plumbing_saved_estimates', JSON.stringify(list));
      showToast('Смета тёплого пола успешно сохранена в "Мои сметы"!');
    } catch {
      showToast('Смета сохранена!');
    }
  };

  const handleCopyText = () => {
    let txt = `СМЕТА: ${floorType === 'water' ? 'ВОДЯНОЙ' : 'ЭЛЕКТРИЧЕСКИЙ'} ТЁПЛЫЙ ПОЛ (САНТЕХПРО)\n`;
    txt += `Общая площадь: ${totalGrossArea} м² (чистая обогреваемая: ${totalNetArea} м²)\n`;
    txt += `Количество помещений: ${rooms.length}\n`;
    if (floorType === 'water') {
      txt += `Всего контуров: ${totalLoopsCount}, Метраж трубы: ${totalPipesLength} м\n\n`;
    } else {
      txt += `Тип: ${electricType === 'mat_tile' ? 'Мат под плитку' : 'Кабель в стяжку'}, Терморегуляторов: ${rooms.length} шт\n\n`;
    }

    txt += `СПЕЦИФИКАЦИЯ МАТЕРИАЛОВ И ОБОРУДОВАНИЯ:\n`;
    activeSpecification.forEach((it, idx) => {
      txt += `${idx + 1}. ${it.name} — ${it.quantity} ${it.unit} x ${it.unitPrice.toLocaleString('ru-RU')} ₽ = ${it.totalPrice.toLocaleString('ru-RU')} ₽\n`;
    });
    txt += `\nИтого материалы: ${totalMaterialsCost.toLocaleString('ru-RU')} ₽\n`;
    if (includeLabor) {
      txt += `Монтаж мастером: ${laborCost.toLocaleString('ru-RU')} ₽\n`;
    }
    txt += `ОБЩАЯ СУММА: ${grandTotal.toLocaleString('ru-RU')} ₽\n`;

    navigator.clipboard.writeText(txt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      showToast('Спецификация тёплого пола скопирована!');
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    let txt = `======================================================================\n`;
    txt += `                            САНТЕХПРО\n`;
    txt += `              РАСЧЁТ СИСТЕМЫ ТЁПЛОГО ПОЛА (${floorType === 'water' ? 'ВОДЯНОЙ' : 'ЭЛЕКТРИЧЕСКИЙ'})\n`;
    txt += `======================================================================\n\n`;
    txt += `Общая площадь:           ${totalGrossArea} м²\n`;
    txt += `Чистая площадь обогрева: ${totalNetArea} м²\n`;
    txt += `Количество помещений:    ${rooms.length}\n`;
    if (floorType === 'water') {
      txt += `Контуров (петель):       ${totalLoopsCount} шт\n`;
      txt += `Всего трубы:             ${totalPipesLength} м\n`;
    }
    txt += `Дата формирования:       ${new Date().toLocaleDateString('ru-RU')}\n`;
    txt += `----------------------------------------------------------------------\n\n`;
    activeSpecification.forEach((it, idx) => {
      txt += `${idx + 1}. [${it.category}] ${it.name}\n   Количество: ${it.quantity} ${it.unit} | Цена: ${it.unitPrice} ₽ | Сумма: ${it.totalPrice} ₽\n\n`;
    });
    txt += `----------------------------------------------------------------------\n`;
    txt += `Итого материалы:         ${totalMaterialsCost} ₽\n`;
    if (includeLabor) {
      txt += `Монтажные работы мастера: ${laborCost} ₽\n`;
    }
    txt += `ИТОГО К ОПЛАТЕ:          ${grandTotal} ₽\n`;

    // Add UTF-8 BOM (\uFEFF) to guarantee Cyrillic displays correctly on Android & Windows text viewers
    const blob = new Blob(['\uFEFF' + txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `santehpro-warm-floor-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Спецификация сохранена в файл TXT (.txt)');
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('Формирование официального PDF тёплого пола...');
      await downloadUnderfloorHeatingPdf({
        floorType,
        systemName:
          floorType === 'water'
            ? 'Водяной тёплый пол (Труба PEX-A / PE-RT)'
            : 'Электрический кабельный теплый пол / Нагревательные маты',
        totalArea: totalGrossArea,
        heatedArea: totalNetArea,
        unheatedArea: Math.max(0, totalGrossArea - totalNetArea),
        roomsCount: rooms.length,
        materialsTotal: totalMaterialsCost,
        laborTotal: includeLabor ? laborCost : 0,
        screedTotal: includeScreedPouring ? Math.round(totalGrossArea * 550) : 0,
        grandTotal,
        items: activeSpecification.map((s) => ({
          name: s.name,
          quantity: `${s.quantity} ${s.unit}`,
          unit: s.unit,
          total: s.totalPrice,
        })),
      });
      showToast('PDF-файл успешно скачан!');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Не удалось сформировать PDF. Используйте печать.');
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in duration-200 text-xs sm:text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 border border-slate-800 p-5 sm:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
              <Flame className="w-3.5 h-3.5" />
              <span>Профессиональный гидравлический расчет</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Инженерный калькулятор тёплого пола
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Точный расчет метража трубы, количества контуров (с контролем длины петли до 75 м), подбор коллектора с расходомерами, смесительного узла, утеплителя и всех компонентов пирога пола.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToEstimates}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>В мои сметы</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-amber-950/40"
            >
              <Download className="w-4 h-4" />
              <span>Смета / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Water Floor vs Electric Floor */}
      <div className="flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 max-w-md">
        <button
          type="button"
          onClick={() => setFloorType('water')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center space-x-2 cursor-pointer ${
            floorType === 'water'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>💧</span>
          <span>Водяной тёплый пол</span>
        </button>
        <button
          type="button"
          onClick={() => setFloorType('electric')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center space-x-2 cursor-pointer ${
            floorType === 'electric'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>⚡</span>
          <span>Электрический пол</span>
        </button>
      </div>

      {/* Main Layout: Rooms List & System Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Rooms & Options */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Помещения и зоны обогрева</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Укажите размеры комнат и шаг укладки для автоматического деления на петли
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRoom}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить комнату</span>
              </button>
            </div>

            {/* Rooms List */}
            <div className="space-y-4">
              {calculatedRooms.map((room, idx) => (
                <div
                  key={room.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3.5 relative hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => handleUpdateRoom(room.id, 'name', e.target.value)}
                        className="bg-transparent border-b border-slate-700 focus:border-amber-400 text-sm font-bold text-white px-1 py-0.5 outline-none transition"
                        placeholder="Название помещения"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                        {room.loopsCount} {room.loopsCount === 1 ? 'петля' : 'петли'} (~{room.lengthPerLoop} м)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRoom(room.id)}
                        className="text-slate-500 hover:text-rose-400 transition p-1 cursor-pointer"
                        title="Удалить помещение"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Room Inputs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Общая площадь (м²)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        placeholder="0"
                        value={room.totalArea === 0 ? '' : room.totalArea}
                        onChange={(e) => {
                          const v = e.target.value;
                          handleUpdateRoom(room.id, 'totalArea', v === '' ? 0 : parseFloat(v) || 0);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs outline-none focus:border-amber-400 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Под мебелью (м²)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={room.totalArea - 1}
                        placeholder="0"
                        value={room.unheatedArea === 0 ? '' : room.unheatedArea}
                        onChange={(e) => {
                          const v = e.target.value;
                          handleUpdateRoom(room.id, 'unheatedArea', v === '' ? 0 : parseFloat(v) || 0);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs outline-none focus:border-amber-400 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Шаг укладки
                      </label>
                      <select
                        value={room.stepMm}
                        onChange={(e) => handleUpdateRoom(room.id, 'stepMm', parseInt(e.target.value) as any)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs outline-none focus:border-amber-400 transition"
                      >
                        <option value={100}>100 мм (Краевая зона)</option>
                        <option value={150}>150 мм (Стандарт)</option>
                        <option value={200}>200 мм (Эконом)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Трасса до шкафа (м)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        placeholder="0"
                        value={room.transitDistance === 0 ? '' : room.transitDistance}
                        onChange={(e) => {
                          const v = e.target.value;
                          handleUpdateRoom(room.id, 'transitDistance', v === '' ? 0 : parseFloat(v) || 0);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <div>
                      Чистая площадь обогрева: <span className="font-bold text-white">{room.netHeatedArea} м²</span>
                    </div>
                    <div>
                      Трубы на комнату: <span className="font-bold text-amber-400">{room.totalPipe} метров</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Options */}
          {floorType === 'water' ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Оборудование и комплектующие водяного пола</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Труба для контуров
                  </label>
                  <select
                    value={pipeBrand}
                    onChange={(e) => setPipeBrand(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold outline-none focus:border-amber-400 transition"
                  >
                    <option value="pexa_16">PE-Xa 16х2.0 EVOH (Stout / Rehau) — 125 ₽/м</option>
                    <option value="pert_16">PE-RT 16х2.0 Type II (Valtec) — 85 ₽/м</option>
                    <option value="pexa_20">PE-Xa 20х2.0 увеличенная — 165 ₽/м</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Теплоизоляционный слой
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInsulationType('boss_mats')}
                      className={`p-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                        insulationType === 'boss_mats'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Маты с бобышками
                    </button>
                    <button
                      type="button"
                      onClick={() => setInsulationType('epps_tacker')}
                      className={`p-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                        insulationType === 'epps_tacker'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ЭППС + Гарпуны
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Коллекторный шкаф
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCabinetType('built_in')}
                      className={`p-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                        cabinetType === 'built_in'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Встраиваемый (ШРВ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCabinetType('wall_mounted')}
                      className={`p-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                        cabinetType === 'wall_mounted'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Настенный (ШРН)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Смесительный узел с насосом
                  </label>
                  <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-white font-bold">Насосная группа (25/60)</span>
                    <input
                      type="checkbox"
                      checked={includeMixingUnit}
                      onChange={(e) => setIncludeMixingUnit(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeScreedAdditives}
                    onChange={(e) => setIncludeScreedAdditives(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span className="text-xs text-slate-300 font-bold">
                    Включить пластификатор и полипропиленовую фибру для стяжки
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Оборудование электрического пола</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Тип нагревателя
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setElectricType('mat_tile')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                        electricType === 'mat_tile'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Мат под плитку (150 Вт)
                    </button>
                    <button
                      type="button"
                      onClick={() => setElectricType('cable_screed')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                        electricType === 'cable_screed'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Кабель в стяжку (18 Вт/м)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Тип терморегуляторов
                  </label>
                  <select
                    value={thermostatType}
                    onChange={(e) => setThermostatType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold outline-none focus:border-amber-400 transition"
                  >
                    <option value="wifi_smart">Wi-Fi Smart сенсорный (Tuya/Алиса) — 4 900 ₽</option>
                    <option value="programmable">Электронный программируемый — 3 200 ₽</option>
                    <option value="mechanical">Механический дисковый — 1 850 ₽</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Labor Tariff and Detailed Breakdown Section */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
            {/* Header toggle */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLabor}
                  onChange={(e) => setIncludeLabor(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span className="text-sm font-black text-white">
                  Монтаж тёплого пола под ключ
                </span>
              </label>
              <span className="text-sm font-black text-amber-400">
                {includeLabor ? `${laborCost.toLocaleString('ru-RU')} ₽` : 'Без монтажа'}
              </span>
            </div>

            {includeLabor && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Tariff Selection Grid */}
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                    <span>Выберите тариф сложности работ:</span>
                    <span className="text-amber-400 font-extrabold">{effectiveLaborRatePerM2} ₽/м²</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setLaborTier('economy')}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        laborTier === 'economy'
                          ? 'bg-amber-950/40 border-amber-500 text-white shadow-md ring-1 ring-amber-500'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">⚡ Базовый</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">650 ₽/м²</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        Монтаж на подготовленное ровное основание, прямоугольные комнаты
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLaborTier('standard')}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer relative ${
                        laborTier === 'standard'
                          ? 'bg-amber-950/40 border-amber-500 text-white shadow-md ring-1 ring-amber-500'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-300">⭐ Стандарт под ключ</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">850 ₽/м²</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        Маты, демпфер, раскладка трубы, навеска шкафа, опрессовка 6 бар
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLaborTier('premium')}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        laborTier === 'premium'
                          ? 'bg-amber-950/40 border-amber-500 text-white shadow-md ring-1 ring-amber-500'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">🏆 Премиум / Сложный</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">1 250 ₽/м²</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        Эркеры, шаг 100 мм, проход стен в гильзах, смесительный узел, сервоприводы
                      </p>
                    </button>
                  </div>

                  {/* Custom Rate Slider & Input */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">Ручная настройка ставки мастера:</span>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          min={200}
                          max={5000}
                          step={50}
                          placeholder="0"
                          value={customLaborRate === 0 ? '' : customLaborRate}
                          onChange={(e) => {
                            setLaborTier('custom');
                            const v = e.target.value;
                            setCustomLaborRate(v === '' ? 0 : parseInt(v, 10) || 0);
                          }}
                          className="w-20 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-extrabold text-xs text-right outline-none focus:border-amber-400"
                        />
                        <span className="text-amber-400 font-bold">₽/м²</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] text-slate-500">500 ₽</span>
                      <input
                        type="range"
                        min={500}
                        max={2000}
                        step={50}
                        value={effectiveLaborRatePerM2}
                        onChange={(e) => {
                          setLaborTier('custom');
                          setCustomLaborRate(Number(e.target.value));
                        }}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-500">2000 ₽</span>
                    </div>
                  </div>

                  {/* Screed Addon Checkbox */}
                  {floorType === 'water' && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <label className="flex items-center space-x-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeScreedPouring}
                          onChange={(e) => setIncludeScreedPouring(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Полусухая механизированная стяжка пола под ключ
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Толщина 6-7 см с фиброармированием, демпферами и шлифовкой под чистовой пол
                          </span>
                        </div>
                      </label>
                      <span className="text-xs font-black text-amber-300 shrink-0 pl-2">
                        +550 ₽/м² ({screedLaborCost.toLocaleString('ru-RU')} ₽)
                      </span>
                    </div>
                  )}
                </div>

                {/* Operations Breakdown Table */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5 flex justify-between">
                    <span>Детализация работ по смете мастера:</span>
                    <span className="text-[10px] text-slate-400">Итого: {laborCost.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {laborOperationsBreakdown.map((op, i) => (
                      <div key={i} className="flex justify-between items-baseline text-slate-300 py-0.5">
                        <div className="pr-2 leading-tight">
                          <span className="text-[11px] text-slate-500 mr-1.5 font-bold">#{i + 1}</span>
                          <span className="text-xs text-slate-200">{op.name}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5">({op.volume})</span>
                        </div>
                        <span className="font-bold text-amber-400 shrink-0">
                          {op.cost.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanatory Accordion: Why price is higher or lower */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsLaborExplanationOpen(!isLaborExplanationOpen)}
                    className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-amber-500/10 transition"
                  >
                    <div className="flex items-center space-x-2 text-xs font-black text-amber-300">
                      <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Откуда берётся эта цена и почему она может быть выше или ниже?</span>
                    </div>
                    {isLaborExplanationOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </button>

                  {isLaborExplanationOpen && (
                    <div className="p-4 pt-1 border-t border-amber-500/20 text-xs text-slate-300 space-y-3 leading-relaxed">
                      <p>
                        Базовая цена качественного монтажа водяного тёплого пола в Москве и МО составляет <strong>850 ₽/м²</strong>. В эту цену входит полный технологический цикл: демпферная лента, укладка матов/утеплителя, раскладка трубы с шагом 150 мм, навеска коллекторного шкафа, подключение петель и обязательная опрессовка под давлением 6-8 бар перед заливкой стяжки.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Why lower */}
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/30">
                          <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-400 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Когда цена может быть НИЖЕ (от 600–700 ₽/м²):</span>
                          </div>
                          <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4">
                            <li><strong>Большая площадь:</strong> от 80–120 м² действуют оптовые скидки монтажных бригад.</li>
                            <li><strong>Простая геометрия:</strong> правильные прямоугольные комнаты без эркеров, радиусных стен и колонн.</li>
                            <li><strong>Подготовленное основание:</strong> ровная стяжка без необходимости обеспыливания и ремонта перекрытия.</li>
                            <li><strong>Шаг 200 мм:</strong> в складских или теплых помещениях уходит меньше крепежа и трубы на квадрат.</li>
                          </ul>
                        </div>

                        {/* Why higher */}
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-orange-500/30">
                          <div className="flex items-center space-x-1.5 text-xs font-black text-orange-400 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-400" />
                            <span>Когда цена может быть ВЫШЕ (от 1 100–1 500+ ₽/м²):</span>
                          </div>
                          <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4">
                            <li><strong>Сложная геометрия:</strong> эркеры, полукруглые стены, узкие коридоры с множеством транзитных труб.</li>
                            <li><strong>Частый шаг 100 мм:</strong> в краевых зонах у панорамных окон расходуется на 50% больше трубы и времени.</li>
                            <li><strong>Пробивка и гильзы:</strong> проход несущих монолитных стен и перекрытий алмазным бурением.</li>
                            <li><strong>Автоматика:</strong> установка сервоприводов на каждый контур и смарт-терморегуляторов.</li>
                            <li><strong>Маленькая площадь:</strong> при объекте до 15–20 м² действует минимальный выезд бригады (от 15 000 ₽).</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Price Summary */}
        <div className="space-y-5">
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 sticky top-24 shadow-2xl space-y-5">
            <h3 className="text-base font-black text-white flex items-center justify-between">
              <span>Сводка по проекту</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                {floorType === 'water' ? 'Водяной пол' : 'Электропол'}
              </span>
            </h3>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Общая площадь</div>
                <div className="text-base font-black text-white">{totalGrossArea} м²</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Чистый обогрев</div>
                <div className="text-base font-black text-amber-400">{totalNetArea} м²</div>
              </div>
              {floorType === 'water' ? (
                <>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Контуров (петель)</div>
                    <div className="text-base font-black text-cyan-400">{totalLoopsCount} шт</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Всего трубы</div>
                    <div className="text-base font-black text-emerald-400">{totalPipesLength} м</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Мощность</div>
                    <div className="text-base font-black text-cyan-400">{(totalNetArea * 0.15).toFixed(1)} кВт</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Терморегуляторы</div>
                    <div className="text-base font-black text-emerald-400">{rooms.length} шт</div>
                  </div>
                </>
              )}
            </div>

            {/* Price lines */}
            <div className="space-y-2.5 text-xs pt-2">
              <div className="flex justify-between text-slate-400">
                <span>Материалы и оборудование:</span>
                <span className="font-bold text-white">{totalMaterialsCost.toLocaleString('ru-RU')} ₽</span>
              </div>
              {includeLabor && (
                <div className="flex justify-between text-slate-400">
                  <span>Монтаж под ключ:</span>
                  <span className="font-bold text-amber-400">{laborCost.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-200">ИТОГО:</span>
                <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400">
                  {grandTotal.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-950/50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Скачать смету (PDF)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition border border-slate-700 cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Скопировано!' : 'Скопировать спецификацию'}</span>
              </button>

              {onOpenSpecialists && (
                <button
                  type="button"
                  onClick={onOpenSpecialists}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Вызвать мастера на монтаж пола</span>
                </button>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              💡 <strong>Правило инженера:</strong> Длина контура 16 мм ограничена 75 метрами. При превышении этого значения насос не сможет прокачать теплоноситель. Наш калькулятор автоматически делит комнаты на сбалансированные петли.
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Items Table */}
      <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-black text-white">
              Детализированная спецификация тёплого пола
            </h3>
            <p className="text-xs text-slate-400">
              Полный комплект материалов для качественного монтажа
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400">
            {activeSpecification.length} позиций
          </span>
        </div>

        <div className="divide-y divide-slate-800/60 overflow-hidden">
          {activeSpecification.map((item, idx) => (
            <div key={idx} className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/30 px-2 rounded-xl transition">
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-[11px] font-bold text-slate-500 w-5 shrink-0">#{idx + 1}</span>
                  <span className="text-xs sm:text-sm font-bold text-white">{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.note && (
                  <div className="text-[11px] text-slate-400 mt-0.5 pl-7">
                    {item.note}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-4 pl-7 sm:pl-0 shrink-0">
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-white">{item.quantity} {item.unit}</span> × {item.unitPrice.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-xs sm:text-sm font-black text-white w-24 text-right">
                  {item.totalPrice.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview / Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Смета: {floorType === 'water' ? 'Водяной' : 'Электрический'} тёплый пол
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Площадь: {totalGrossArea} м² | {rooms.length} помещений {floorType === 'water' ? `| ${totalLoopsCount} контуров` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Оборудование и материалы:</span>
                  <span className="font-bold text-white">{totalMaterialsCost.toLocaleString('ru-RU')} ₽</span>
                </div>
                {includeLabor && (
                  <div className="flex justify-between text-slate-300">
                    <span>Монтаж тёплого пола мастером:</span>
                    <span className="font-bold text-amber-400">{laborCost.toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                  <span>ИТОГО К ОПЛАТЕ:</span>
                  <span className="text-amber-400">{grandTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {activeSpecification.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-800/50 text-[11px]">
                    <span className="text-slate-300 truncate max-w-[340px]">{idx + 1}. {s.name}</span>
                    <span className="font-bold text-white shrink-0">{s.totalPrice.toLocaleString('ru-RU')} ₽</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap gap-2.5 justify-end">
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadPdf}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Скачать PDF</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Скачать TXT</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Печать</span>
              </button>
              <button
                type="button"
                onClick={handleSaveToEstimates}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer border border-slate-700"
              >
                <Save className="w-3.5 h-3.5" />
                <span>В сметы</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
