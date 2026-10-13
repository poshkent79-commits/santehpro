import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Wrench,
  Package,
  Check,
  DollarSign,
  Clock,
  ShieldCheck,
  User,
  Save,
  Send,
  Mic,
  MicOff,
  Copy,
  Sparkles,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Layers,
  FileText,
  Volume2
} from 'lucide-react';
import { MasterPlumbingEstimate, MasterEstimateItem, PlumbingSpecialist, ServiceCallRequest } from '../types';
import { parsePlumbingVoicePhrase } from '../utils/plumbingVoiceParser';

interface MasterEstimateBuilderModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSave?: (estimate: MasterPlumbingEstimate, sendImmediately?: boolean) => Promise<void>;
  onSaved?: () => void;
  specialist: PlumbingSpecialist;
  initialEstimate?: MasterPlumbingEstimate | null;
  linkedRequest?: ServiceCallRequest | null;
}

// ==========================================
// БЫСТРЫЕ ШАБЛОНЫ ДЛЯ ЧЕРНОВЫХ РАБОТ
// ==========================================
export const ROUGH_WORKS_TEMPLATES = [
  { category: 'Штробление и ниши', name: 'Штробление стен под трубы (пеноблок / кирпич)', unit: 'м.п.', price: 450 },
  { category: 'Штробление и ниши', name: 'Штробление стен под трубы (бетон / монолит)', unit: 'м.п.', price: 850 },
  { category: 'Штробление и ниши', name: 'Штробление под канализацию 50-110 мм', unit: 'м.п.', price: 950 },
  { category: 'Штробление и ниши', name: 'Заделка штроб и ниш ремонтным раствором', unit: 'м.п.', price: 350 },
  { category: 'Штробление и ниши', name: 'Алмазное бурение технологических отверстий в бетоне', unit: 'шт', price: 2000 },
  
  { category: 'Трассы и точки', name: 'Прокладка трасс водоснабжения (сшитый полиэтилен)', unit: 'м.п.', price: 250 },
  { category: 'Трассы и точки', name: 'Монтаж водорозетки / точки ХВС/ГВС', unit: 'точка', price: 2200 },
  { category: 'Трассы и точки', name: 'Монтаж точки канализации (слив 50/110 мм)', unit: 'точка', price: 1500 },
  
  { category: 'Узел ввода и коллекторы', name: 'Сборка и монтаж узла ввода ХВС/ГВС с фильтрами и редукторами', unit: 'компл', price: 7500 },
  { category: 'Узел ввода и коллекторы', name: 'Монтаж распределительного коллектора (гребенки)', unit: 'шт', price: 2500 },
  { category: 'Узел ввода и коллекторы', name: 'Монтаж системы защиты от протечек (краны с электроприводом)', unit: 'компл', price: 4000 },
  
  { category: 'Черновые приборы', name: 'Монтаж инсталляции подвесного унитаза (черновой)', unit: 'шт', price: 4500 },
  { category: 'Черновые приборы', name: 'Монтаж встраиваемой части смесителя / гиг. душа (iBox)', unit: 'шт', price: 3500 },
  { category: 'Черновые приборы', name: 'Монтаж душевого трапа с выставлением уклона в пол', unit: 'шт', price: 4800 },
  { category: 'Черновые приборы', name: 'Шумоизоляция фанового канализационного стояка', unit: 'компл', price: 3000 },
  { category: 'Черновые приборы', name: 'Опрессовка системы водоснабжения давлением (воздух/вода)', unit: 'услуга', price: 3000 },
];

// ==========================================
// БЫСТРЫЕ ШАБЛОНЫ ДЛЯ ЧЕРНОВЫХ МАТЕРИАЛОВ
// ==========================================
export const ROUGH_MATERIALS_TEMPLATES = [
  { category: 'Трубы и изоляция', name: 'Труба сшитый полиэтилен PE-Xa Ø16 мм (кислородный барьер)', unit: 'м.п.', price: 220 },
  { category: 'Трубы и изоляция', name: 'Труба сшитый полиэтилен PE-Xa Ø20 мм (кислородный барьер)', unit: 'м.п.', price: 290 },
  { category: 'Трубы и изоляция', name: 'Труба полипропиленовая армированная Ø20/25 мм', unit: 'м.п.', price: 180 },
  { category: 'Трубы и изоляция', name: 'Теплоизоляция для труб (энергофлекс 9 мм)', unit: 'м.п.', price: 55 },
  
  { category: 'Канализация', name: 'Труба канализационная Ø50 мм', unit: 'м.п.', price: 220 },
  { category: 'Канализация', name: 'Труба канализационная Ø110 мм', unit: 'м.п.', price: 380 },
  { category: 'Канализация', name: 'Труба бесшумная канализация Ø110/50 (Ostendorf)', unit: 'м.п.', price: 850 },
  
  { category: 'Коллекторы и арматура', name: 'Коллектор распределительный 3/4" на 3-4 выхода с кранами', unit: 'шт', price: 3800 },
  { category: 'Коллекторы и арматура', name: 'Кран шаровый латунный усиленный 1/2" с американкой', unit: 'шт', price: 850 },
  { category: 'Коллекторы и арматура', name: 'Кран шаровый латунный усиленный 3/4"', unit: 'шт', price: 1100 },
  { category: 'Коллекторы и арматура', name: 'Фильтр самопромывной с манометром 100 мкм', unit: 'шт', price: 4200 },
  { category: 'Коллекторы и арматура', name: 'Редуктор давления мембранный 1/2"', unit: 'шт', price: 3600 },
  { category: 'Коллекторы и арматура', name: 'Обратный клапан латунный 1/2"', unit: 'шт', price: 650 },
  
  { category: 'Фитинги и расходники', name: 'Комплект аксиальных пресс-фитингов и гильз', unit: 'компл', price: 2800 },
  { category: 'Фитинги и расходники', name: 'Водорозетка латунная настенная 16×1/2"', unit: 'шт', price: 480 },
  { category: 'Фитинги и расходники', name: 'Хомуты сантехнические со шпильками и виброгасителями', unit: 'компл', price: 850 },
  { category: 'Фитинги и расходники', name: 'Строительные заглушки для опрессовки 1/2"', unit: 'компл', price: 450 },
  { category: 'Фитинги и расходники', name: 'Сухая смесь / раствор для заделки штроб', unit: 'мешок', price: 480 },
];

// Готовые пакеты для быстрой черновой разводки
const ROUGH_PRESET_PACKAGES = [
  {
    name: 'Черновая сантехника: Санузел новостройка',
    description: 'Комплекс: штробление, разводка труб ХВС/ГВС, канализация, узел ввода и инсталляция',
    totalPrice: 42000,
    items: [
      { type: 'work', name: 'Штробление стен под трубы ХВС/ГВС и канализацию', category: 'Черновые работы', unit: 'м.п.', quantity: 12, price: 550, total: 6600 },
      { type: 'work', name: 'Сборка и монтаж узла ввода ХВС/ГВС с фильтрами', category: 'Черновые работы', unit: 'компл', quantity: 1, price: 7500, total: 7500 },
      { type: 'work', name: 'Разводка труб ХВС/ГВС (водорозетки)', category: 'Черновые работы', unit: 'точка', quantity: 5, price: 2200, total: 11000 },
      { type: 'work', name: 'Монтаж точек канализации 50/110 мм', category: 'Черновые работы', unit: 'точка', quantity: 4, price: 1500, total: 6000 },
      { type: 'work', name: 'Монтаж инсталляции подвесного унитаза', category: 'Черновые работы', unit: 'шт', quantity: 1, price: 4500, total: 4500 },
      { type: 'work', name: 'Шумоизоляция фанового стояка', category: 'Черновые работы', unit: 'компл', quantity: 1, price: 3000, total: 3000 },
      { type: 'work', name: 'Опрессовка системы давлением', category: 'Черновые работы', unit: 'услуга', quantity: 1, price: 3000, total: 3000 },
      { type: 'material', name: 'Труба сшитый полиэтилен PE-Xa Ø16 мм', category: 'Черновые материалы', unit: 'м.п.', quantity: 30, price: 220, total: 6600 },
      { type: 'material', name: 'Труба сшитый полиэтилен PE-Xa Ø20 мм', category: 'Черновые материалы', unit: 'м.п.', quantity: 10, price: 290, total: 2900 },
      { type: 'material', name: 'Теплоизоляция энергофлекс 9 мм', category: 'Черновые материалы', unit: 'м.п.', quantity: 40, price: 55, total: 2200 },
      { type: 'material', name: 'Комплект фитингов и водорозеток', category: 'Черновые материалы', unit: 'компл', quantity: 1, price: 4800, total: 4800 },
      { type: 'material', name: 'Расходники, крепеж, заглушки', category: 'Черновые материалы', unit: 'компл', quantity: 1, price: 2500, total: 2500 },
    ] as MasterEstimateItem[]
  },
  {
    name: 'Узел ввода ХВС/ГВС Премиум (FAR/Stout)',
    description: 'Узел учета, самопромывные фильтры 100 мкм, редукторы FAR, коллекторы и защита от протечек',
    totalPrice: 28500,
    items: [
      { type: 'work', name: 'Сборка и монтаж узла ввода ХВС/ГВС с фильтрами и редукторами', category: 'Черновые работы', unit: 'компл', quantity: 1, price: 7500, total: 7500 },
      { type: 'work', name: 'Монтаж распределительных коллекторов (пара гребенок)', category: 'Черновые работы', unit: 'компл', quantity: 1, price: 4500, total: 4500 },
      { type: 'work', name: 'Монтаж системы контроля протечек (2 крана с приводом)', category: 'Черновые работы', unit: 'компл', quantity: 1, price: 4000, total: 4000 },
      { type: 'material', name: 'Фильтры самопромывные с манометром 100 мкм (пара)', category: 'Черновые материалы', unit: 'компл', quantity: 1, price: 8400, total: 8400 },
      { type: 'material', name: 'Редукторы давления мембранные 1/2" (пара)', category: 'Черновые материалы', unit: 'компл', quantity: 1, price: 7200, total: 7200 },
      { type: 'material', name: 'Коллекторы распределительные 3/4" с отсечными кранами', category: 'Черновые материалы', unit: 'компл', quantity: 1, price: 7600, total: 7600 },
    ] as MasterEstimateItem[]
  }
];

export const MasterEstimateBuilderModal: React.FC<MasterEstimateBuilderModalProps> = ({
  isOpen = true,
  onClose,
  onSave,
  onSaved,
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
  const [executionDays, setExecutionDays] = useState<string>('2-3 рабочих дня');
  const [paymentTerms, setPaymentTerms] = useState<string>('50% аванс на закупку, 50% по факту сдачи');
  const [notes, setNotes] = useState<string>('');

  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [advancePayment, setAdvancePayment] = useState<number>(0);

  const [isSaving, setIsSaving] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'rough_works' | 'rough_materials' | 'presets'>('rough_works');

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [lastAddedVoiceItem, setLastAddedVoiceItem] = useState<MasterEstimateItem | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [quickTextInput, setQuickTextInput] = useState('');
  const recognitionRef = useRef<any>(null);

  // Focus effect for voice
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ru-RU';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = (final || interim).trim();
        setVoiceTranscript(currentText);

        if (final && final.trim().length > 1) {
          handleProcessVoicePhrase(final.trim());
          setVoiceTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
          setVoiceNotice('Микрофон временно недоступен. Вы можете ввести фразу в строку ниже.');
          setTimeout(() => setVoiceNotice(null), 4000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      setVoiceNotice('В данном браузере голосовой ввод не поддерживается. Используйте текстовую строку ввода.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        setVoiceTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
        setVoiceNotice('Слушаю... Говорите: например, «труба 20 мм, 5 м» или «штробление 8 метров»');
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
        setIsListening(false);
      }
    }
  };

  // Process spoken or typed phrase into estimate item
  const handleProcessVoicePhrase = (phrase: string) => {
    if (!phrase || phrase.trim().length < 2) return;

    const parsed = parsePlumbingVoicePhrase(phrase);
    const newItem = parsed.item;

    setItems((prev) => [newItem, ...prev]);
    setLastAddedVoiceItem(newItem);
    setHighlightedItemId(newItem.id);

    setVoiceNotice(`Добавлено: «${newItem.name}» — ${newItem.quantity} ${newItem.unit} (${newItem.total.toLocaleString('ru-RU')} ₽)`);
    setTimeout(() => {
      setHighlightedItemId(null);
    }, 2500);
  };

  // Instant Repeat (+1 / duplicate quantity)
  const handleInstantRepeat = () => {
    if (!lastAddedVoiceItem) return;

    const repeatedItem: MasterEstimateItem = {
      ...lastAddedVoiceItem,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setItems((prev) => [repeatedItem, ...prev]);
    setHighlightedItemId(repeatedItem.id);
    setVoiceNotice(`Повторно добавлено: «${repeatedItem.name}» (${repeatedItem.quantity} ${repeatedItem.unit})`);

    setTimeout(() => {
      setHighlightedItemId(null);
    }, 2000);
  };

  // Duplicate specific row
  const handleDuplicateRow = (itemToClone: MasterEstimateItem) => {
    const cloned: MasterEstimateItem = {
      ...itemToClone,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setItems((prev) => [cloned, ...prev]);
    setLastAddedVoiceItem(cloned);
    setHighlightedItemId(cloned.id);
    setVoiceNotice(`Дублировано: «${cloned.name}»`);
    setTimeout(() => setHighlightedItemId(null), 2000);
  };

  // Load initial data
  useEffect(() => {
    if (initialEstimate) {
      setTitle(initialEstimate.title || '');
      setClientName(initialEstimate.clientName || '');
      setClientPhone(initialEstimate.clientPhone || '');
      setClientAddress(initialEstimate.clientAddress || '');
      setObjectType(initialEstimate.objectType || 'Квартира новостройка');
      setItems(initialEstimate.items || []);
      setWarrantyMonths(initialEstimate.warrantyMonths ?? 24);
      setExecutionDays(initialEstimate.executionDays || '2-3 рабочих дня');
      setPaymentTerms(initialEstimate.paymentTerms || '50% аванс на закупку, 50% по факту сдачи');
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
          name: linkedRequest.problemDescription.slice(0, 50) || 'Черновой монтаж сантехники',
          category: 'Черновые работы',
          unit: 'услуга',
          quantity: 1,
          price: specialist.minPrice || 3500,
          total: specialist.minPrice || 3500,
        },
      ]);
    } else {
      setTitle(`Смета на сантехработы от ${new Date().toLocaleDateString('ru-RU')}`);
      setClientName('');
      setClientPhone('');
      setClientAddress(specialist.city ? `г. ${specialist.city}` : '');
      setObjectType('Квартира новостройка');
      setItems([
        {
          id: `item-${Date.now()}-1`,
          type: 'work',
          name: 'Штробление стен под трубы (пеноблок / кирпич)',
          category: 'Черновые работы',
          unit: 'м.п.',
          quantity: 8,
          price: 450,
          total: 3600,
        },
        {
          id: `item-${Date.now()}-2`,
          type: 'work',
          name: 'Монтаж водорозетки / точки ХВС/ГВС',
          category: 'Черновые работы',
          unit: 'точка',
          quantity: 4,
          price: 2200,
          total: 8800,
        },
        {
          id: 'item-init-3',
          type: 'material',
          name: 'Труба сшитый полиэтилен PE-Xa Ø20 мм',
          category: 'Черновые материалы',
          unit: 'м.п.',
          quantity: 15,
          price: 290,
          total: 4350,
        },
      ]);
      setWarrantyMonths(24);
      setExecutionDays('2-3 рабочих дня');
      setPaymentTerms('50% аванс на закупку, 50% по факту сдачи');
      setNotes('Монтаж выполняется с соблюдением СНиП. Опрессовка системы перед заделкой штроб.');
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
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      name: type === 'work' ? 'Штробление стен под трубы' : 'Труба сшитый полиэтилен PE-Xa Ø20 мм',
      category: type === 'work' ? 'Черновые работы' : 'Черновые материалы',
      unit: type === 'work' ? 'м.п.' : 'м.п.',
      quantity: 1,
      price: type === 'work' ? 450 : 290,
      total: type === 'work' ? 450 : 290,
    };
    setItems((prev) => [newItem, ...prev]);
    setLastAddedVoiceItem(newItem);
    setHighlightedItemId(newItem.id);
    setTimeout(() => setHighlightedItemId(null), 1500);
  };

  // Add from template
  const handleAddFromTemplate = (template: { name: string; category: string; unit: string; price: number }, type: 'work' | 'material') => {
    const newItem: MasterEstimateItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      name: template.name,
      category: template.category,
      unit: template.unit,
      quantity: 1,
      price: template.price,
      total: template.price,
    };
    setItems((prev) => [newItem, ...prev]);
    setLastAddedVoiceItem(newItem);
    setHighlightedItemId(newItem.id);
    setTimeout(() => setHighlightedItemId(null), 1500);
  };

  // Apply complete package
  const handleApplyRoughPackage = (pkg: typeof ROUGH_PRESET_PACKAGES[0]) => {
    const generated: MasterEstimateItem[] = pkg.items.map((it, idx) => ({
      ...it,
      id: `pkg-${Date.now()}-${idx}`,
    }));
    setItems((prev) => [...generated, ...prev]);
    if (!title) {
      setTitle(pkg.name);
    }
    setVoiceNotice(`Добавлен пакет «${pkg.name}» (${pkg.items.length} позиций)`);
    setTimeout(() => setVoiceNotice(null), 3000);
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
      alert('Пожалуйста, укажите имя заказчика');
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

      if (onSave) {
        await onSave(estimateRecord, sendImmediately);
      } else {
        const storageKey = `santehpro_master_estimates_${specialist.id}`;
        let currentList: MasterPlumbingEstimate[] = [];
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) currentList = JSON.parse(raw);
        } catch (e) {}

        const existingIdx = currentList.findIndex((e) => e.id === estimateRecord.id);
        if (existingIdx >= 0) {
          currentList[existingIdx] = estimateRecord;
        } else {
          currentList.unshift(estimateRecord);
        }

        try {
          localStorage.setItem(storageKey, JSON.stringify(currentList));
          localStorage.setItem(`santehpro_estimate_${estimateRecord.id}`, JSON.stringify(estimateRecord));
        } catch (e) {}

        try {
          await fetch('/api/estimates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: estimateRecord.id,
              name: estimateRecord.title,
              totalPrice: estimateRecord.grandTotal,
              itemsJson: estimateRecord,
            }),
          });
        } catch (e) {}

        onSaved?.();
      }

      onClose();
    } catch (e) {
      console.error('Failed to save estimate:', e);
      alert('Ошибка при сохранении сметы. Попробуйте снова.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header: Concise & Clean */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {initialEstimate ? 'Редактирование сметы' : 'Смета на сантехнические работы'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Черновые работы, материалы, голосовой ввод и расчет для заказчика
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-3 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Section 1: Client & Object */}
          <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-xl border border-slate-800/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Название сметы:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Черновая сантехника (новостройка)"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Заказчик: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Имя клиента"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Телефон (WhatsApp):
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Тип объекта:
                </label>
                <select
                  value={objectType}
                  onChange={(e) => setObjectType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Квартира новостройка">Новостройка</option>
                  <option value="Квартира вторичка">Вторичка</option>
                  <option value="Частный дом / Коттедж">Коттедж / Дом</option>
                  <option value="Коммерция">Офис / Коммерция</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Адрес объекта (улица, дом, квартира)"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: SMART VOICE & TEXT INPUT BAR */}
          <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-blue-500/30 shadow-md space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-blue-600/20 text-blue-400'}`}>
                  {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Голосовой ввод позиций сметы</span>
                    {isListening && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Слушаю...
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Назовите работу или материал (например: <span className="text-blue-300 italic">«труба 20 мм, 5 м»</span> или <span className="text-blue-300 italic">«штробление 8 метров»</span>)
                  </div>
                </div>
              </div>

              {/* Action Mic Toggle */}
              <button
                type="button"
                onClick={toggleVoiceListening}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Остановить запись</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Включить микрофон</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Voice Transcript Bar */}
            {isListening && (
              <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-2 animate-in fade-in">
                <Volume2 className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
                <span className="font-medium">
                  {voiceTranscript ? `«${voiceTranscript}»` : 'Говорите фразу, пауза зафиксирует позицию...'}
                </span>
              </div>
            )}

            {/* Quick Text Input Fallback / Rapid Dictation Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickTextInput}
                onChange={(e) => setQuickTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (quickTextInput.trim()) {
                      handleProcessVoicePhrase(quickTextInput.trim());
                      setQuickTextInput('');
                    }
                  }
                }}
                placeholder="Или введите текст: «труба 20 мм 5 м», «кран 1/2 4 шт», «монтаж инсталляции»..."
                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (quickTextInput.trim()) {
                    handleProcessVoicePhrase(quickTextInput.trim());
                    setQuickTextInput('');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                Добавить
              </button>
            </div>

            {/* Notification / Instant Repeat Banner */}
            {voiceNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{voiceNotice}</span>
                </div>
                {lastAddedVoiceItem && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleInstantRepeat}
                      className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-sm"
                      title="Добавить такую же позицию еще раз"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Повторить ввод (+{lastAddedVoiceItem.quantity} {lastAddedVoiceItem.unit})</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick speech helper chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
              <span className="text-slate-500">Быстрый пример:</span>
              {[
                'труба 20 мм, 5 м',
                'штробление бетон 6 метров',
                'монтаж инсталляции 1 шт',
                'кран 1/2 4 штуки',
                'разводка труб 5 точек',
              ].map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleProcessVoicePhrase(sample)}
                  className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] transition cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: ROUGH WORK TEMPLATES (Черновые работы и материалы) */}
          <div className="bg-slate-950/70 p-3 sm:p-4 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-white">
                  Шаблоны для черновых работ (в 1 клик):
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab('rough_works')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTemplateTab === 'rough_works'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Черновые работы ({ROUGH_WORKS_TEMPLATES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab('rough_materials')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTemplateTab === 'rough_materials'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Черновые материалы ({ROUGH_MATERIALS_TEMPLATES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab('presets')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTemplateTab === 'presets'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Готовые комплексы ({ROUGH_PRESET_PACKAGES.length})
                </button>
              </div>
            </div>

            {/* Template Chips Drawer */}
            {activeTemplateTab === 'presets' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {ROUGH_PRESET_PACKAGES.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between gap-3 transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{pkg.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{pkg.description}</div>
                      <div className="text-xs font-bold text-amber-400 mt-1">
                        {pkg.totalPrice.toLocaleString('ru-RU')} ₽ ({pkg.items.length} поз.)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyRoughPackage(pkg)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shrink-0 cursor-pointer"
                    >
                      Применить
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                {(activeTemplateTab === 'rough_works' ? ROUGH_WORKS_TEMPLATES : ROUGH_MATERIALS_TEMPLATES).map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddFromTemplate(tpl, activeTemplateTab === 'rough_works' ? 'work' : 'material')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/60 text-left shrink-0 text-xs transition flex items-center gap-2 cursor-pointer group"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-400 group-hover:scale-125 transition" />
                    <div>
                      <div className="text-slate-200 font-medium whitespace-nowrap text-xs">{tpl.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {tpl.price.toLocaleString('ru-RU')} ₽ / {tpl.unit}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: ITEMS LIST */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Список позиций сметы ({items.length})</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddItem('work')}
                  className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Работа</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('material')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Материал</span>
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
                Позиций нет. Включите микрофон и продиктуйте или выберите шаблоны выше.
              </div>
            ) : (
              <div className="space-y-1.5">
                {items.map((item, index) => {
                  const isHighlighted = highlightedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-2 transition ${
                        isHighlighted
                          ? 'bg-blue-950/40 border-blue-400 shadow-md ring-1 ring-blue-500'
                          : item.type === 'work'
                          ? 'bg-slate-950/70 border-slate-800/80 hover:border-blue-500/30'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs text-slate-500 w-5 font-mono">{index + 1}.</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            item.type === 'work'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {item.type === 'work' ? 'Работа' : 'Материал'}
                        </span>
                      </div>

                      {/* Name & Category */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-1.5 w-full">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                            placeholder="Наименование"
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                            placeholder="Категория"
                            className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Qty, Unit, Price, Total + Quick Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value === '' ? 0 : e.target.value)}
                            className="w-14 bg-slate-900 border border-slate-800 text-white text-center rounded-lg px-1 py-1 text-xs font-semibold focus:outline-none focus:border-blue-500"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-1.5 py-1 text-xs focus:outline-none cursor-pointer"
                          >
                            <option value="м.п.">м.п.</option>
                            <option value="точка">точка</option>
                            <option value="шт">шт</option>
                            <option value="компл">компл</option>
                            <option value="мешок">мешок</option>
                            <option value="услуга">услуга</option>
                            <option value="м²">м²</option>
                            <option value="час">час</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 text-xs">×</span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={item.price === 0 ? '' : item.price}
                            onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value === '' ? 0 : e.target.value)}
                            className="w-16 sm:w-20 bg-slate-900 border border-slate-800 text-white text-right rounded-lg px-1.5 py-1 text-xs font-semibold focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-slate-400 text-xs">₽</span>
                        </div>

                        <div className="w-20 sm:w-24 text-right">
                          <span className="font-bold text-white text-xs">
                            {item.total.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>

                        {/* Duplicate Button */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(item)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition cursor-pointer"
                          title="Дублировать позицию"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                          title="Удалить позицию"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 5: Terms & Guarantee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 sm:p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Гарантия:</span>
              </label>
              <select
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value={12}>12 месяцев (1 год)</option>
                <option value={24}>24 месяца (2 года)</option>
                <option value={36}>36 месяцев (3 года)</option>
                <option value={60}>60 месяцев (5 лет)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Срок работ:</span>
              </label>
              <input
                type="text"
                value={executionDays}
                onChange={(e) => setExecutionDays(e.target.value)}
                placeholder="2-3 рабочих дня"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Порядок оплаты:</span>
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="50% аванс, 50% по факту"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 6: Calculations Summary */}
          <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400">Работы: </span>
                <span className="text-white font-bold">{worksTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div>
                <span className="text-slate-400">Материалы: </span>
                <span className="text-emerald-400 font-bold">{materialsTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              {discountAmount > 0 && (
                <div>
                  <span className="text-slate-400">Скидка: </span>
                  <span className="text-rose-400 font-bold">-{discountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Итого к оплате:</span>
              <span className="text-xl font-black text-amber-400">
                {grandTotal.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            Отмена
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveEstimate(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-blue-400" />
              <span>В черновики</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveEstimate(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Сохранение...' : 'Сохранить и отправить'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
