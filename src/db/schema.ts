import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// Define the 'users' table with full profile details
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Unique user identifier
  email: text('email').notNull(),
  name: text('name').default('Пользователь'),
  phone: text('phone'),
  city: text('city').default('Москва'),
  passwordHash: text('password_hash'),
  role: text('role').default('user'),
  dataConsent: boolean('data_consent').notNull().default(true), // Согласие на обработку персональных данных (152-ФЗ)
  consentTimestamp: timestamp('consent_timestamp').defaultNow(), // Точное время подтверждения согласия
  legalConsent: boolean('legal_consent').default(true), // Подтверждение Пользовательского соглашения и правового статуса сервиса
  legalConsentTimestamp: timestamp('legal_consent_timestamp').defaultNow(), // Время фиксации юридического чек-листа
  legalChecklistJson: text('legal_checklist_json'), // Чек-лист правового статуса сервиса (разработчик Туйчиев Д. Н.) и ответственности
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'user_purchases' table for purchased paid courses and materials
export const userPurchases = pgTable('user_purchases', {
  id: text('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  userEmail: text('user_email').notNull(),
  courseId: text('course_id').notNull(),
  courseTitle: text('course_title').notNull(),
  price: text('price').notNull(),
  paymentMethod: text('payment_method').default('Банковская карта'),
  purchasedAt: timestamp('purchased_at').defaultNow(),
  status: text('status').notNull().default('active'),
});

// Define the 'user_favorites' table for bookmarked educational materials
export const userFavorites = pgTable('user_favorites', {
  id: text('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  articleId: text('article_id').notNull(),
  articleTitle: text('article_title').notNull(),
  category: text('category'),
  coverImage: text('cover_image'),
  type: text('type'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'service_requests' table (Client plumbing call requests)
export const serviceRequests = pgTable('service_requests', {
  id: text('id').primaryKey(),
  clientName: text('client_name').notNull(),
  clientPhone: text('client_phone').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  problemDescription: text('problem_description').notNull(),
  category: text('category').notNull(),
  emergency: boolean('emergency').default(false),
  preferredTime: text('preferred_time'),
  preferredMasterId: text('preferred_master_id'),
  preferredMasterName: text('preferred_master_name'),
  status: text('status').notNull().default('pending'),
  adminNotes: text('admin_notes'),
  userUid: text('user_uid'),
  clientEmail: text('client_email'),
  rating: integer('rating'),
  reviewComment: text('review_comment'),
  reviewedAt: timestamp('reviewed_at'),
  masterReply: text('master_reply'),
  masterRepliedAt: timestamp('master_replied_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'saved_estimates' table (Plumbing and materials estimates)
export const savedEstimates = pgTable('saved_estimates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  summary: text('summary').notNull(),
  totalPrice: integer('total_price').notNull(),
  itemsJson: text('items_json').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'media_files' table for materials, photos, videos, and audios
export const mediaFiles = pgTable('media_files', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  fileType: text('file_type').notNull(), // 'material' | 'photo' | 'video' | 'audio'
  category: text('category').notNull().default('water'),
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  description: text('description').default(''),
  format: text('format').default('file'),
  fileSize: text('file_size').default(''),
  duration: text('duration'),
  tags: text('tags').default(''),
  articleId: text('article_id'),
  articleTitle: text('article_title'),
  uploadedBy: text('uploaded_by').default('Администратор'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the 'articles' table for educational materials, guides and courses
export const articles = pgTable('articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  type: text('type').notNull(), // 'article' | 'video' | 'guide'
  adminSection: text('admin_section').default('handbook'),
  accessType: text('access_type').default('free'),
  price: text('price'),
  buyUrl: text('buy_url'),
  difficulty: text('difficulty').default('Новичок'),
  timeEst: text('time_est').default('20 мин'),
  description: text('description').notNull(),
  coverImage: text('cover_image'),
  imageTitle: text('image_title'),
  videoUrl: text('video_url'),
  videoEmbed: text('video_embed'),
  rutubeUrl: text('rutube_url'),
  youtubeUrl: text('youtube_url'),
  vkVideoUrl: text('vk_video_url'),
  videoTimestampsJson: text('video_timestamps_json'),
  audioUrl: text('audio_url'),
  audioTitle: text('audio_title'),
  authorAddress: text('author_address'),
  galleryImagesJson: text('gallery_images_json'),
  studentsCount: integer('students_count').default(0),
  rating: text('rating').default('5.0'),
  certificate: boolean('certificate').default(false),
  toolsRequiredJson: text('tools_required_json'),
  materialsRequiredJson: text('materials_required_json'),
  stepsJson: text('steps_json'),
  author: text('author').default('Достонджон Туйчиев'),
  authorMasterId: text('author_master_id'),
  moderationStatus: text('moderation_status').default('approved'), // 'approved' | 'pending' | 'rejected'
  moderationComment: text('moderation_comment'),
  isPublished: boolean('is_published').default(true),
  views: integer('views').default(1),
  likes: integer('likes').default(0),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the 'specialists' table for plumbers, questionnaires and directory
export const specialists = pgTable('specialists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  photo: text('photo').default('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'),
  city: text('city').notNull(),
  experienceYears: integer('experience_years').default(1),
  rating: text('rating').default('5.0'),
  reviewsCount: integer('reviews_count').default(0),
  phone: text('phone').notNull(),
  telegram: text('telegram'),
  whatsapp: text('whatsapp'),
  servicesJson: text('services_json').notNull().default('[]'),
  minPrice: integer('min_price').default(1000),
  emergency247: boolean('emergency_247').default(false),
  verified: boolean('verified').default(false),
  badge: text('badge'),
  bio: text('bio').default(''),
  status: text('status').notNull().default('pending'), // 'approved' | 'pending' | 'rejected' | 'deleted'
  appliedAt: text('applied_at'),
  dataConsent: boolean('data_consent').notNull().default(true), // Обязательное согласие мастера на обработку персональных данных (152-ФЗ)
  consentTimestamp: timestamp('consent_timestamp').defaultNow(), // Точная дата и время фиксации согласия мастера в БД
  legalConsent: boolean('legal_consent').default(true), // Обязательное подтверждение правового статуса и чек-листа мастера
  legalConsentTimestamp: timestamp('legal_consent_timestamp').defaultNow(), // Точное время фиксации правового чек-листа мастера в БД
  legalChecklistJson: text('legal_checklist_json'), // JSON чек-листа мастера (статус независимого исполнителя, единоличная ответственность на объекте, отсутствие претензий к Туйчиеву Д. Н.)
  verificationDocsJson: text('verification_docs_json'), // JSON прикрепленных документов для верификации анкеты
  userUid: text('user_uid'), // Связь с учетной записью пользователя
  email: text('email'),
  rejectionReason: text('rejection_reason'), // Причина отказа при отклонении кандидатуры администратором
  moderationComment: text('moderation_comment'), // Подробный комментарий администратора с рекомендациями
  moderatedAt: timestamp('moderated_at'), // Дата и время вынесения решения модератором
  moderatedBy: text('moderated_by'), // Кем проведена модерация (Администратор)
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'), // Дата и время удаления мастера из активного каталога
});

// Define the 'master_works' table for specialists' portfolio of completed works (up to 15 photos)
export const masterWorks = pgTable('master_works', {
  id: text('id').primaryKey(),
  specialistId: text('specialist_id').notNull(),
  specialistName: text('specialist_name'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').default('water'),
  photosJson: text('photos_json').notNull().default('[]'), // JSON array of up to 15 photos
  completedAt: text('completed_at'),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  moderationComment: text('moderation_comment'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the 'deleted_specialists' table for audit log of permanently removed masters
// Сохраняет только информацию о мастере: когда он зарегистрировался и когда был удален
export const deletedSpecialists = pgTable('deleted_specialists', {
  id: text('id').primaryKey(),
  masterId: text('master_id').notNull(),
  name: text('name').notNull(),
  city: text('city'),
  registeredAt: timestamp('registered_at'),
  appliedAt: text('applied_at'),
  deletedAt: timestamp('deleted_at').defaultNow().notNull(),
  deletedBy: text('deleted_by').default('Администратор'),
});

