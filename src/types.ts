export type CategoryId = 
  | 'water'       // Водопровод и трубы
  | 'drainage'    // Канализация и засоры
  | 'heating'     // Отопление и батареи
  | 'fixtures'    // Смесители и санфаянс
  | 'appliances'  // Подключение техники
  | 'tools'       // Инструменты и материалы
  | 'emergency';  // Аварийный ремонт

export interface ArticleStep {
  number: number;
  title: string;
  text: string;
  tip?: string;
  warning?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}

export interface VideoTimestamp {
  time: string;
  label: string;
}

export interface RouteTurnComparison {
  title?: string;
  turn90: { title: string; flowResistance: string; pros: string[]; cons: string[]; recommendedFor: string };
  turn2x45: { title: string; flowResistance: string; pros: string[]; cons: string[]; recommendedFor: string };
  smoothBend?: { title: string; flowResistance: string; pros: string[]; cons: string[]; recommendedFor: string };
}

export interface JointTypeComparison {
  title?: string;
  typeA: { name: string; reliability: string; maxPressure: string; wallHidden: boolean; tools: string; pros: string };
  typeB: { name: string; reliability: string; maxPressure: string; wallHidden: boolean; tools: string; pros: string };
  typeC?: { name: string; reliability: string; maxPressure: string; wallHidden: boolean; tools: string; pros: string };
}

export interface SealingComparison {
  title?: string;
  methodA: { name: string; maxTemp: string; adjustmentAngle: string; dismantle: string; bestFor: string };
  methodB: { name: string; maxTemp: string; adjustmentAngle: string; dismantle: string; bestFor: string };
  methodC?: { name: string; maxTemp: string; adjustmentAngle: string; dismantle: string; bestFor: string };
}

export interface ProMistake {
  mistake: string;
  consequence: string;
  fix: string;
}

export interface Article {
  id: string;
  title: string;
  category: CategoryId;
  type: 'article' | 'video' | 'guide';
  adminSection?: 'handbook' | 'courses' | 'cases';
  accessType?: 'free' | 'paid';
  price?: string;
  buyUrl?: string;
  difficulty: 'Новичок' | 'Продвинутый' | 'Профи';
  timeEst: string;
  description: string;
  coverImage?: string;
  imageTitle?: string;
  videoUrl?: string;
  videoEmbed?: string;
  rutubeUrl?: string;
  youtubeUrl?: string;
  vkVideoUrl?: string;
  videoTimestamps?: VideoTimestamp[];
  audioUrl?: string;
  audioTitle?: string;
  authorAddress?: string;
  galleryImages?: string[];
  studentsCount?: number;
  rating?: number;
  certificate?: boolean;
  toolsRequired?: string[];
  materialsRequired?: string[];
  steps: ArticleStep[];
  author: string;
  views: number;
  likes: number;
  createdAt: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  isOptimized?: boolean;
  authorMasterId?: string;
  moderationStatus?: 'approved' | 'pending' | 'rejected';
  moderationComment?: string;
  routeTurnComparison?: RouteTurnComparison;
  jointTypeComparison?: JointTypeComparison;
  sealingComparison?: SealingComparison;
  proMistakes?: ProMistake[];
}

export interface SpecialistVerificationDoc {
  id: string;
  name: string;
  type: 'passport' | 'self_employed' | 'certificate' | 'diploma' | 'other';
  url?: string;
  dataUrl?: string;
  fileSize?: string;
  size?: string;
  uploadedAt: string;
  status?: string;
}

export interface PlumbingSpecialist {
  id: string;
  name: string;
  photo: string;
  city: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  phone: string;
  telegram?: string;
  whatsapp?: string;
  services: string[];
  minPrice: number;
  emergency247: boolean;
  verified: boolean;
  badge?: string;
  bio: string;
  status: 'approved' | 'pending' | 'rejected' | 'deleted' | 'suspended';
  appliedAt: string;
  dataConsent?: boolean;
  consentTimestamp?: string;
  deletedAt?: string;
  legalConsent?: boolean;
  legalConsentTimestamp?: string;
  legalChecklist?: Record<string, boolean>;
  legalChecklistJson?: string;
  verificationDocs?: SpecialistVerificationDoc[];
  verificationDocsJson?: string;
  userUid?: string;
  email?: string;
  portfolioWorksCount?: number;
  rejectionReason?: string;
  moderationComment?: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

export interface MasterWork {
  id: string;
  specialistId: string;
  specialistName?: string;
  title: string;
  description: string;
  category?: CategoryId | string;
  photos: string[]; // up to 15 photos
  completedAt?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationComment?: string;
}

export interface SpecialistReview {
  id: string;
  specialistId: string;
  specialistName?: string;
  clientName: string;
  clientCity?: string;
  rating: number; // 1 to 5
  comment: string;
  serviceCategory?: string;
  serviceRequestId?: string;
  problemDescription?: string;
  createdAt: string;
  verifiedBooking?: boolean;
}

export interface DeletedSpecialistRecord {
  id: string;
  masterId: string;
  name: string;
  city?: string;
  registeredAt?: string;
  appliedAt?: string;
  deletedAt: string;
  deletedBy?: string;
}

export interface CommunityAnswer {
  id: string;
  authorName: string;
  text: string;
  date: string;
  isMaster?: boolean;
}

export interface CommunityQuestion {
  id: string;
  authorName: string;
  city: string;
  title: string;
  text: string;
  photoUrl?: string;
  createdAt: string;
  answersCount: number;
  masterAnswer?: {
    masterName: string;
    text: string;
    date: string;
  };
  answers?: CommunityAnswer[];
}

export interface DiagnosticSolution {
  title: string;
  cause: string;
  steps: string[];
  tools?: string[];
  materials?: string[];
  difficulty?: 'Легко (своими руками)' | 'Средне' | 'Сложно' | 'Рекомендуется специалист';
  estimatedTime?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  warning?: string;
}

export interface DiagnosticOption {
  text: string;
  nextStepId?: string;
  articleId?: string;
  emergencyAdvice?: string;
  solution?: DiagnosticSolution;
}

export interface DiagnosticQuestion {
  id: string;
  title: string;
  subtitle: string;
  options: DiagnosticOption[];
}

export interface ServiceCallRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  city: string;
  address?: string;
  problemDescription: string;
  category?: CategoryId;
  emergency: boolean;
  preferredTime?: string;
  preferredMasterId?: string;
  preferredMasterName?: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  createdAt: string;
  adminNotes?: string;
  userUid?: string;
  clientEmail?: string;
  rating?: number;
  reviewComment?: string;
  reviewedAt?: string;
  masterReply?: string;
  masterRepliedAt?: string;
  attachedEstimateId?: string;
  attachedEstimateSummary?: string;
}

export interface MasterEstimateItem {
  id: string;
  type: 'work' | 'material';
  name: string;
  category: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
}

export interface MasterPlumbingEstimate {
  id: string;
  specialistId: string;
  specialistName: string;
  specialistPhone?: string;
  specialistCity?: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  objectType?: string;
  title: string;
  items: MasterEstimateItem[];
  worksTotal: number;
  materialsTotal: number;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  grandTotal: number;
  advancePayment?: number;
  remainingPayment?: number;
  warrantyMonths: number;
  executionDays: string;
  paymentTerms?: string;
  notes?: string;
  status: 'new' | 'draft' | 'sent' | 'in_progress' | 'accepted' | 'completed' | 'declined';
  serviceRequestId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SavedEstimate {
  id: string;
  name: string;
  createdAt: string;
  pipeLength: number;
  selectedPoints: string[];
  pipeType: string;
  pipeMaterial?: string;
  selectedDiameters?: number[];
  wiringScheme: 'collector' | 'tee' | 'sequential';
  reserveMargin: number;
  includePressureReducers: boolean;
  use45Elbows: boolean;
  includeBypasses: boolean;
  grandTotal: number;
  totalPointsCount: number;
  totalLinesCount: number;
  pipeName: string;
  items?: Array<{ name: string; quantity: number | string; unit?: string; price?: number; total?: number; category?: string }>;
  kitType?: 'house' | 'apartment' | 'custom';
}

export interface UserProfile {
  id?: number;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  role?: string;
  dataConsent?: boolean;
  consentTimestamp?: string;
  legalConsent?: boolean;
  legalConsentTimestamp?: string;
  legalChecklist?: Record<string, boolean>;
  legalChecklistJson?: string;
  createdAt?: string;
}

export interface UserPurchase {
  id: string;
  userUid: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  price: string;
  paymentMethod?: string;
  purchasedAt?: string;
  status: 'active' | 'completed';
}

export interface UserFavorite {
  id: string;
  userUid: string;
  articleId: string;
  articleTitle: string;
  category?: string;
  coverImage?: string;
  type?: string;
  createdAt?: string;
}

export type MediaFileType = 'material' | 'photo' | 'video' | 'audio' | 'graphic';

export interface MediaFile {
  id: string;
  title: string;
  fileType: MediaFileType; // 'material' (документы/сметы) | 'photo' (фотографии) | 'graphic' (графика/чертежи/схемы) | 'video' (видеоматериалы RuTube/YouTube) | 'audio' (аудиогиды)
  category: string;
  fileUrl: string;
  thumbnailUrl?: string;
  description?: string;
  format?: string; // 'jpg', 'png', 'webp', 'mp4', 'webm', 'mp3', 'pdf', 'youtube', etc.
  fileSize?: string;
  originalSize?: string;
  duration?: string;
  tags?: string;
  articleId?: string;
  articleTitle?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt?: string;
  isPublished?: boolean; // Статус публикации: true = Опубликовано, false = Черновик
  isOptimized?: boolean; // Автоматически оптимизировано для облачного стриминга
  optimizationRatio?: string; // e.g. "-74% WebP", "1080p Cloud CDN", "320kbps HLS"
  cloudStoragePath?: string; // Путь в облачном хранилище
  streamBitrate?: string; // Битрейт и качество потоковой трансляции
}

export interface DiagnosticSession {
  id: string;
  userUid?: string;
  userEmail?: string;
  query: string;
  result: string;
  imagePreview?: string;
  category: string;
  timestamp: string;
  createdAt: number;
}

export type SpecialistContractStatus = 'draft' | 'active' | 'completed' | 'terminated';
export type SpecialistLegalType = 'self_employed' | 'individual' | 'ip' | 'company';

export interface PlumbingContract {
  id: string;
  specialistId: string;
  specialistName: string;
  specialistPhone: string;
  specialistStatus: SpecialistLegalType; // Самозанятый / Физлицо / ИП / ООО
  specialistInn?: string;
  specialistCity?: string;
  clientName: string;
  clientPhone: string;
  clientPassport?: string; // Паспорт (серия, номер, кем выдан)
  clientAddress: string; // Адрес объекта
  contractNumber: string; // Номер договора (например: СП-2026/09-001)
  contractDate: string; // Дата заключения (YYYY-MM-DD)
  startDate: string; // Дата начала работ
  endDate: string; // Дата завершения работ
  title: string; // Например: «Монтаж водоснабжения и отопления в новостройке»
  worksList: string; // Список работ
  totalPrice: number; // Общая сумма договора
  advancePayment: number; // Сумма аванса
  remainingPayment: number; // Остаток при приемке
  warrantyMonths: number; // Срок гарантии (12, 24, 36 мес.)
  materialsResponsibility: 'contractor' | 'client' | 'mixed'; // Кто закупает материалы
  estimateId?: string; // Привязка к смете
  status: SpecialistContractStatus;
  createdAt: string;
  updatedAt: string;

  // Hybrid Digital Signature fields (Простая Электронная Подпись & Факсимиле)
  masterSignature?: string; // Base64 data URL
  masterSignedAt?: string; // ISO date
  masterSignedAtMsk?: string; // Дата и точное время (МСК/UTC)
  masterIp?: string; // IP-адрес мастера
  masterDeviceId?: string; // ID устройства мастера
  masterAuthAccount?: string; // Номер телефона / аккаунт мастера

  clientSignature?: string; // Base64 data URL
  clientSignedAt?: string; // ISO date
  clientSignedAtMsk?: string; // Дата и точное время (МСК/UTC)
  clientIp?: string; // IP-адрес заказчика
  clientDeviceId?: string; // ID устройства заказчика
  clientAuthAccount?: string; // Номер телефона / аккаунт заказчика
  clientSignMethod?: 'onsite_finger' | 'remote_link' | 'paper';
  clientSignedPhone?: string;
  digitalSealId?: string; // e.g. ПЭП-RU-2026-XXXX
  verificationCode?: string; // Verification token/code

  // Acceptance Act (Акт сдачи-приёмки) & Warranty Certificate (Гарантийный талон)
  actDate?: string;
  actSignedAt?: string;
  actMasterSignature?: string;
  actMasterSignedAt?: string;
  actMasterSignedAtMsk?: string;
  actMasterIp?: string;
  actMasterDeviceId?: string;
  actMasterAuthAccount?: string;

  actClientSignature?: string;
  actClientSignedAt?: string;
  actClientSignedAtMsk?: string;
  actClientIp?: string;
  actClientDeviceId?: string;
  actClientAuthAccount?: string;
  actSealId?: string;
  actStatus?: 'pending' | 'signed';
  warrantyCertificateNumber?: string;
  warrantyValidUntil?: string;
}



