import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Sparkles,
  Calculator,
  Briefcase,
  ChevronDown,
  Mic,
  MicOff,
  Plus,
  ListOrdered,
  RotateCcw,
  Wrench,
  Layers,
  Zap,
  BookOpen,
  CheckSquare,
  Square,
  Search
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

// Complete turnkey work packages
const PRESET_PACKAGES: { name: string; icon: string; title: string; works: string; price: number }[] = [
  {
    name: 'Санузел под ключ',
    icon: '🚿',
    title: 'Комплексный монтаж водоснабжения и канализации санузла под ключ',
    works:
      '1. Демонтаж старых труб, перегородок и сантехприборов\n2. Сборка распределительного коллекторного узла (Far, редукторы давления, фильтры 100 мкм, обратные клапаны)\n3. Разводка труб холодного и горячего водоснабжения (сшитый полиэтилен Rehau Rautitan)\n4. Монтаж бесшумной канализации с соблюдением нормативных уклонов\n5. Установка и крепление инсталляции подвесного унитаза\n6. Опрессовка смонтированной системы избыточным гидростатическим давлением 10 бар\n7. Установка и подключение чистовой сантехники (смесители, ванна, гигиенический душ, раковина)',
    price: 45000,
  },
  {
    name: 'Разводка Rehau + коллекторы',
    icon: '🔧',
    title: 'Монтаж коллекторного узла ввода и труб водоснабжения Rehau',
    works:
      '1. Монтаж вводных шаровых кранов и датчиков системы защиты от протечек\n2. Установка фильтров тонкой очистки и редукторов давления с манометрами\n3. Сборка распределительных коллекторов на ХВС и ГВС\n4. Лучевая прокладка труб сшитого полиэтилена Rehau к точкам водоразбора\n5. Гидравлические испытания (опрессовка) давлением 10 бар',
    price: 32000,
  },
  {
    name: 'Замена стояков и канализации',
    icon: '🚽',
    title: 'Замена общедомовых стояков водоснабжения и фановой канализации',
    works:
      '1. Демонтаж старого чугунного фанового стояка и стальных водопроводных труб\n2. Проход перекрытий и врезка в стояки соседей сверху и снизу\n3. Монтаж шумопоглощающего канализационного стояка с компенсационным патрубком\n4. Монтаж новых стояков ГВС и ХВС с установкой вводных кранов и байпаса полотенцесушителя\n5. Проверка стыков на герметичность под давлением',
    price: 18000,
  },
  {
    name: 'Отопление и радиаторы',
    icon: '♨️',
    title: 'Замена и монтаж радиаторов отопления',
    works:
      '1. Демонтаж старых конвекторов/чугунных радиаторов отопления\n2. Нарезка резьбы/сварка и установка терморегулирующей арматуры\n3. Навеска и выравнивание новых биметаллических радиаторов по лазерному уровню\n4. Подключение запорных кранов и кранов Маевского для спуска воздуха\n5. Опрессовка смонтированных радиаторов избыточным давлением',
    price: 15000,
  },
  {
    name: 'Чистовая сантехника',
    icon: '🛁',
    title: 'Установка и подключение чистовой сантехники',
    works:
      '1. Сборка и установка ванны с обвязкой сифоном и выставлением по уровню\n2. Монтаж подвесной тумбы, раковины и подключение смесителя\n3. Установка унитаза с подключением к фановой трубе и регулировкой арматуры бачка\n4. Монтаж душевой стойки / тропического душа и гигиенического душа\n5. Подключение стиральной машины и проверка всех узлов на отсутствие подтёков',
    price: 16000,
  },
];

// Quick-add popular work items (1-click chips)
const POPULAR_WORK_CHIPS = [
  'Демонтаж старых труб и приборов',
  'Сборка коллекторного узла Far с фильтрами',
  'Разводка труб Rehau (сшитый полиэтилен)',
  'Опрессовка системы избыточным давлением 10 бар',
  'Монтаж инсталляции подвесного унитаза',
  'Монтаж шумопоглощающей канализации',
  'Установка системы защиты от протечек Neptun',
  'Установка и подключение ванны и смесителей',
  'Монтаж водонагревателя (бойлера)',
  'Установка фильтра обратного осмоса',
  'Монтаж душевого трапа с гидроизоляцией',
  'Установка полотенцесушителя',
];

// Interactive Plumbing Work Catalog organized by categories
const WORK_CATALOG: { category: string; icon: string; items: string[] }[] = [
  {
    category: 'Водоснабжение и гребенки',
    icon: '🚿',
    items: [
      'Монтаж распределительного коллекторного узла Far с фильтрами тонкой очистки и редукторами давления',
      'Разводка труб холодного и горячего водоснабжения (сшитый полиэтилен Rehau / Tece)',
      'Монтаж системы защиты от протечек воды с автоматическими кранами (Neptun / Аквасторож)',
      'Опрессовка смонтированной системы избыточным гидростатическим давлением 10 бар',
      'Установка магистральных фильтров тонкой очистки Big Blue (10/20 дюймов)',
      'Установка и подключение накопительного / проточного водонагревателя (бойлера) с группой безопасности',
      'Монтаж гасителей гидроударов Caleffi и обратных клапанов',
      'Штробление стен под трубы водоснабжения и канализации с пылесосом',
    ],
  },
  {
    category: 'Канализация и инсталляции',
    icon: '🚽',
    items: [
      'Монтаж и надёжное крепление инсталляции подвесного унитаза с регулировкой высоты',
      'Монтаж шумопоглощающей канализации (Ostendorf Skolan / Rehau Raupiano)',
      'Замена чугунного общедомового стояка канализации на шумопоглощающий пластик',
      'Монтаж трапа душевого поддона с гидроизоляцией и нормативным уклоном',
      'Установка обратного канализационного клапана 110 мм против подтопления',
      'Подключение инсталляции унитаза и биде к фановой трубе',
    ],
  },
  {
    category: 'Чистовая сантехника и приборы',
    icon: '🛁',
    items: [
      'Сборка, выставление по уровню и герметизация ванны (акрил / чугун / искусственный камень)',
      'Монтаж подвесной тумбы, раковины и подключение сифона',
      'Установка смесителя настенного / врезного / скрытого монтажа (iBox)',
      'Монтаж гигиенического душа со встроенным термостатическим смесителем',
      'Монтаж душевой стойки / тропического душа',
      'Установка подвесного унитаза и регулировка двухрежимной клавиши смыва',
      'Установка и подключение полотенцесушителя (электрического / водяного)',
      'Установка системы очистки питьевой воды (обратный осмос с отдельным краном)',
      'Подключение стиральной и сушильной машин с сифоном сухого затвора',
    ],
  },
  {
    category: 'Отопление и радиаторы',
    icon: '♨️',
    items: [
      'Монтаж и навеска биметаллических / панельных радиаторов отопления по лазерному уровню',
      'Установка терморегулирующих вентилей Oventrop / Danfoss и запорных кранов',
      'Нарезка резьбы на стояках отопления и монтаж байпаса',
      'Монтаж контуров водяного тёплого пола с коллекторной группой и насосно-смесительным узлом',
      'Опрессовка системы отопления давлением',
    ],
  },
  {
    category: 'Демонтажные и подготовительные работы',
    icon: '🔨',
    items: [
      'Демонтаж старых чугунных и стальных труб водоснабжения и канализации',
      'Демонтаж старых сантехприборов (ванны, унитаза, раковины, смесителей)',
      'Демонтаж сантехнической кабины / коробов из ГКЛ',
      'Упаковка и вынос строительного мусора',
    ],
  },
];

export const ContractBuilderModal: React.FC<ContractBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  specialist,
  initialContract,
  availableEstimates = [],
}) => {
  const recognitionRef = useRef<any>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const nextMonthStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

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

  // Voice Input State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string>('');

  // Work Catalog State
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [selectedCatalogWorks, setSelectedCatalogWorks] = useState<string[]>([]);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [activeCatalogCategory, setActiveCatalogCategory] = useState<string>('all');

  const handleToggleCatalogWork = (work: string) => {
    setSelectedCatalogWorks((prev) =>
      prev.includes(work) ? prev.filter((w) => w !== work) : [...prev, work]
    );
  };

  const handleAddMultipleWorks = (works: string[]) => {
    if (!works || works.length === 0) return;
    setWorksList((prev) => {
      const cleanPrev = prev.trim();
      const existingLines = cleanPrev ? cleanPrev.split('\n').filter((l) => l.trim().length > 0) : [];
      let nextNum = existingLines.length + 1;
      const newLines = works.map((w) => {
        const line = `${nextNum}. ${w.trim()}`;
        nextNum++;
        return line;
      });
      return cleanPrev ? `${cleanPrev}\n${newLines.join('\n')}` : newLines.join('\n');
    });
  };

  const handleConfirmCatalogSelection = () => {
    if (selectedCatalogWorks.length > 0) {
      handleAddMultipleWorks(selectedCatalogWorks);
      setSelectedCatalogWorks([]);
    }
    setIsCatalogOpen(false);
  };

  const remainingPayment = Math.max(0, totalPrice - advancePayment);

  // Stop listening on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Helper to add a work item to worksList with proper numbering
  const handleAddWorkItem = (itemText: string) => {
    const trimmed = itemText.trim();
    if (!trimmed) return;

    setWorksList((prev) => {
      const cleanPrev = prev.trim();
      if (!cleanPrev) {
        return `1. ${trimmed}`;
      }
      const lines = cleanPrev.split('\n').filter((l) => l.trim().length > 0);
      const nextNum = lines.length + 1;
      return `${cleanPrev}\n${nextNum}. ${trimmed}`;
    });
  };

  // Helper to re-format and number all lines neatly
  const handleFormatNumberedList = () => {
    if (!worksList.trim()) return;
    const lines = worksList
      .split('\n')
      .map((line) => line.replace(/^[\d\s.)\-*•]+/, '').trim())
      .filter((line) => line.length > 0);

    const formatted = lines.map((line, idx) => `${idx + 1}. ${line}`).join('\n');
    setWorksList(formatted);
  };

  // Apply complete package
  const handleApplyPreset = (pkg: typeof PRESET_PACKAGES[0]) => {
    setTitle(pkg.title);
    setWorksList(pkg.works);
    if (!initialContract) {
      setTotalPrice(pkg.price);
    }
  };

  // Toggle Voice Dictation (Web Speech API)
  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'В вашем браузере не найден встроенный Web Speech API. Вы можете нажать на значок микрофона на клавиатуре вашего смартфона (Google Клавиатура / Gboard / Яндекс), чтобы надиктовать текст прямо в поле ввода.'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setVoiceNotice('');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('🎙️ Слушаю вас... Называйте работы по порядку (например: "Установка ванны")');
      };

      recognition.onresult = (event: any) => {
        const lastIdx = event.results.length - 1;
        const transcript = event.results[lastIdx][0].transcript.trim();
        if (transcript) {
          // Capitalize first letter
          const capitalized = transcript.charAt(0).toUpperCase() + transcript.slice(1);
          handleAddWorkItem(capitalized);
          setVoiceNotice(`✓ Добавлено: "${capitalized}"`);
          setTimeout(() => {
            setVoiceNotice('🎙️ Слушаю дальше... Назовите следующий пункт');
          }, 2500);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
        setVoiceNotice('Распознавание завершено или отклонен доступ к микрофону');
        setTimeout(() => setVoiceNotice(''), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
      setVoiceNotice('');
    }
  };

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
    if (est.grandTotal) setTotalPrice(est.grandTotal);
    if (est.advanceRequired) setAdvancePayment(est.advanceRequired);

    if (est.items && est.items.length > 0) {
      const worksText = est.items
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.name} (${item.quantity} ${item.unit}) — ${(
              item.quantity * item.pricePerUnit
            ).toLocaleString('ru-RU')} ₽`
        )
        .join('\n');
      setWorksList(worksText);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert('Пожалуйста, укажите имя заказчика');
      return;
    }

    if (!clientAddress.trim()) {
      alert('Пожалуйста, укажите адрес объекта');
      return;
    }

    const savedContract: PlumbingContract = {
      id: initialContract?.id || `contract-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      specialistId: specialist.id,
      specialistName: specialistName.trim(),
      specialistPhone: specialistPhone.trim(),
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
      warrantyMonths: Number(warrantyMonths) || 24,
      materialsResponsibility,
      estimateId: linkedEstimateId || undefined,
      status: initialContract?.status || 'active',
      createdAt: initialContract?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      masterSignature: initialContract?.masterSignature,
      masterSignedAt: initialContract?.masterSignedAt,
      clientSignature: initialContract?.clientSignature,
      clientSignedAt: initialContract?.clientSignedAt,
      clientSignMethod: initialContract?.clientSignMethod,
      clientSignedPhone: initialContract?.clientSignedPhone,
      digitalSealId: initialContract?.digitalSealId,
      actDate: initialContract?.actDate,
      actSignedAt: initialContract?.actSignedAt,
      actMasterSignature: initialContract?.actMasterSignature,
      actClientSignature: initialContract?.actClientSignature,
      actClientSignedAt: initialContract?.actClientSignedAt,
      actSealId: initialContract?.actSealId,
      actStatus: initialContract?.actStatus,
      warrantyCertificateNumber: initialContract?.warrantyCertificateNumber,
      warrantyValidUntil: initialContract?.warrantyValidUntil,
    };

    onSave(savedContract);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-100 text-slate-900 border border-slate-300 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header - Clean Bar without internal marketing labels */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {initialContract ? 'Редактирование договора' : 'Составление договора и акта'}
              </h2>
              <p className="text-xs text-slate-500">
                Официальный юридический договор с актом сдачи-приёмки и гарантией
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Quick autofill from existing estimate */}
          {availableEstimates.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Быстрое заполнение из вашей сметы:
                </span>
                <span className="text-[11px] text-blue-700 font-medium">Сэкономит 5 минут</span>
              </div>
              <div className="relative">
                <select
                  value={linkedEstimateId}
                  onChange={(e) => handleSelectEstimate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition appearance-none cursor-pointer shadow-xs"
                >
                  <option value="">-- Выберите смету для переноса данных (опционально) --</option>
                  {availableEstimates.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.title} ({est.clientName || 'Клиент'}) — {est.grandTotal.toLocaleString('ru-RU')} ₽
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Section 1: Номер и сроки */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" /> 1. Номер договора и сроки
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Номер договора</label>
                <input
                  type="text"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Дата заключения</label>
                <input
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Дата начала работ</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Дата сдачи работ</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Исполнитель (Мастер) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" /> 2. Исполнитель (Ваши данные)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ФИО мастера / Название *</label>
                <input
                  type="text"
                  value={specialistName}
                  onChange={(e) => setSpecialistName(e.target.value)}
                  required
                  placeholder="Иванов Сергей Петрович"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Телефон мастера *</label>
                <input
                  type="tel"
                  value={specialistPhone}
                  onChange={(e) => setSpecialistPhone(e.target.value)}
                  required
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Юридический статус</label>
                <select
                  value={specialistStatus}
                  onChange={(e) => setSpecialistStatus(e.target.value as SpecialistLegalType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="self_employed">Плательщик НПД (Самозанятый)</option>
                  <option value="individual">Физическое лицо</option>
                  <option value="ip">Индивидуальный предприниматель (ИП)</option>
                  <option value="company">Юридическое лицо (ООО)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ИНН мастера <span className="text-slate-500 font-normal">(опционально)</span>
                </label>
                <input
                  type="text"
                  value={specialistInn}
                  onChange={(e) => setSpecialistInn(e.target.value)}
                  placeholder="123456789012"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Город проведения работ</label>
                <input
                  type="text"
                  value={specialistCity}
                  onChange={(e) => setSpecialistCity(e.target.value)}
                  placeholder="Москва"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Заказчик (Клиент) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" /> 3. Заказчик (Клиент)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ФИО Заказчика *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  placeholder="Петров Алексей Владимирович"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Телефон Заказчика</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+7 (900) 123-45-67"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Адрес объекта проведения работ *
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  required
                  placeholder="г. Москва, ул. Профсоюзная, д. 45, кв. 112"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Паспортные данные заказчика <span className="text-slate-500 font-normal">(опционально)</span>
                </label>
                <input
                  type="text"
                  value={clientPassport}
                  onChange={(e) => setClientPassport(e.target.value)}
                  placeholder="Серия 4510 № 123456, выдан ОВД Тверского р-на г. Москвы..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Предмет работ и финансовые условия (Clean Header Without Foreign Dollar Sign) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" /> 4. Предмет работ и финансовые условия
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Название проекта / объекта *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Комплексный монтаж водоснабжения и отопления квартиры"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              {/* FAST WORK SELECTION: 1-Click Packages */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Готовые пакеты работ (в 1 клик):
                  </span>
                  <span className="text-[10px] text-slate-500">Автоматически заполнит перечень</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PACKAGES.map((pkg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(pkg)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-semibold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <span>{pkg.icon}</span>
                      <span>{pkg.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* WORK LIST TEXTAREA WITH VOICE INPUT & ASSIST TOOLS */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Перечень выполняемых работ (по пунктам) *
                  </label>

                  <div className="flex items-center gap-1.5">
                    {/* Voice Input Button */}
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs ${
                        isListening
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                      title={isListening ? 'Остановить голосовую запись' : 'Надиктовать работы голосом'}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>Идёт запись... Нажмите стоп</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span>Надиктовать голосом</span>
                        </>
                      )}
                    </button>

                    {/* Catalog Picker Button */}
                    <button
                      type="button"
                      onClick={() => setIsCatalogOpen(true)}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                      title="Выбрать готовые работы из каталога сантехника с галочками"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Каталог работ</span>
                    </button>

                    {/* Auto-numbering button */}
                    <button
                      type="button"
                      onClick={handleFormatNumberedList}
                      className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                      title="Выровнять и пронумеровать пункты 1, 2, 3..."
                    >
                      <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">1, 2, 3... Нумерация</span>
                    </button>

                    {/* Clear button */}
                    <button
                      type="button"
                      onClick={() => setWorksList('')}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Очистить перечень работ"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Voice Status Alert Banner */}
                {voiceNotice && (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-medium flex items-center justify-between animate-in fade-in duration-150">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>{voiceNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVoiceNotice('')}
                      className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <textarea
                  rows={5}
                  value={worksList}
                  onChange={(e) => setWorksList(e.target.value)}
                  required
                  placeholder="1. Демонтаж старых труб...&#10;2. Разводка труб Rehau...&#10;3. Установка смесителя..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-mono leading-relaxed focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs"
                />

                {/* POPULAR QUICK-ADD CHIPS */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Быстрое добавление пунктов (+1 клик):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_WORK_CHIPS.map((chip, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddWorkItem(chip)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 border border-slate-200 text-[11px] font-medium transition flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3 h-3 text-blue-600" />
                        <span>{chip}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Итоговая стоимость (₽) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="0"
                    value={totalPrice === 0 ? '' : totalPrice}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTotalPrice(v === '' ? 0 : Math.max(0, parseInt(v, 10) || 0));
                    }}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-blue-700 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Аванс / Предоплата (₽)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="0"
                    value={advancePayment === 0 ? '' : advancePayment}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAdvancePayment(v === '' ? 0 : Math.max(0, parseInt(v, 10) || 0));
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Остаток при приёмке
                  </label>
                  <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
                    {remainingPayment.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>

              {/* Warranty & Materials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Срок официальной гарантии
                  </label>
                  <select
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value={6}>6 месяцев</option>
                    <option value={12}>12 месяцев (1 год)</option>
                    <option value={24}>24 месяца (2 года) — стандарт</option>
                    <option value={36}>36 месяцев (3 года)</option>
                    <option value={60}>60 месяцев (5 лет) — премиум</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Закупка материалов
                  </label>
                  <select
                    value={materialsResponsibility}
                    onChange={(e) => setMaterialsResponsibility(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="mixed">По согласованию (материалы клиента, расходники мастера)</option>
                    <option value="contractor">Исполнитель закупает всё за счёт Заказчика</option>
                    <option value="client">Заказчик предоставляет все материалы самостоятельно</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Legal PEP Badge */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Договор формируется с признанием <b>Простой Электронной Подписи (ст. 434 ГК РФ)</b>. Заказчик сможет расписаться пальцем на вашем экране прямо на объекте или согласовать договор со своего смартфона по ссылке в WhatsApp.
            </p>
          </div>

          {/* Footer Actions inside the form */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Отмена
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{initialContract ? 'Сохранить изменения' : 'Создать договор и акт'}</span>
            </button>
          </div>
        </form>

        {/* INTERACTIVE WORK CATALOG MODAL */}
        {isCatalogOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-300 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Справочник сантехнических работ
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Отметьте нужные пункты галочками — они автоматически добавятся в перечень договора
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCatalogOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search & Categories Bar */}
              <div className="p-3 sm:px-5 sm:pt-4 sm:pb-3 border-b border-slate-100 bg-white space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Поиск по работам (например, Far, Rehau, инсталляция, ванна)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 outline-none"
                  />
                  {catalogSearch && (
                    <button
                      type="button"
                      onClick={() => setCatalogSearch('')}
                      className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveCatalogCategory('all')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 transition cursor-pointer ${
                      activeCatalogCategory === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Все разделы
                  </button>
                  {WORK_CATALOG.map((cat, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveCatalogCategory(cat.category)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 transition cursor-pointer flex items-center gap-1 ${
                        activeCatalogCategory === cat.category
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.category.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1">
                {WORK_CATALOG.filter(
                  (c) => activeCatalogCategory === 'all' || activeCatalogCategory === c.category
                ).map((cat, catIdx) => {
                  const filteredItems = cat.items.filter((item) =>
                    catalogSearch.trim()
                      ? item.toLowerCase().includes(catalogSearch.toLowerCase().trim())
                      : true
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={catIdx} className="space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                        <span>{cat.icon}</span>
                        <span>{cat.category}</span>
                      </div>

                      <div className="space-y-1.5">
                        {filteredItems.map((item, itemIdx) => {
                          const isSelected = selectedCatalogWorks.includes(item);
                          return (
                            <div
                              key={itemIdx}
                              onClick={() => handleToggleCatalogWork(item)}
                              className={`p-2.5 rounded-xl border text-xs transition flex items-start justify-between gap-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50/80 border-blue-400 text-blue-950 font-semibold'
                                  : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex items-start space-x-2.5 pt-0.5">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                )}
                                <span className="leading-snug">{item}</span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddWorkItem(item);
                                  setSelectedCatalogWorks((prev) => prev.filter((w) => w !== item));
                                }}
                                className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 text-[11px] font-bold transition shrink-0 cursor-pointer shadow-2xs"
                                title="Вставить прямо сейчас"
                              >
                                + Добавить
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  Выбрано: <b className="text-slate-900">{selectedCatalogWorks.length}</b> поз.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCatalogWorks([]);
                      setIsCatalogOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
                  >
                    Закрыть
                  </button>
                  <button
                    type="button"
                    disabled={selectedCatalogWorks.length === 0}
                    onClick={handleConfirmCatalogSelection}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-blue-600/25 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Вставить в перечень ({selectedCatalogWorks.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
