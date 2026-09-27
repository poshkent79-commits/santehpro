CREATE TABLE "articles" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"type" text NOT NULL,
	"admin_section" text DEFAULT 'handbook',
	"access_type" text DEFAULT 'free',
	"price" text,
	"buy_url" text,
	"difficulty" text DEFAULT 'Новичок',
	"time_est" text DEFAULT '20 мин',
	"description" text NOT NULL,
	"cover_image" text,
	"video_url" text,
	"video_embed" text,
	"video_timestamps_json" text,
	"audio_url" text,
	"audio_title" text,
	"author_address" text,
	"gallery_images_json" text,
	"students_count" integer DEFAULT 0,
	"rating" text DEFAULT '5.0',
	"certificate" boolean DEFAULT false,
	"tools_required_json" text,
	"materials_required_json" text,
	"steps_json" text,
	"author" text DEFAULT 'Достонджон Туйчиев',
	"views" integer DEFAULT 1,
	"likes" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deleted_specialists" (
	"id" text PRIMARY KEY NOT NULL,
	"master_id" text NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"registered_at" timestamp,
	"applied_at" text,
	"deleted_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" text DEFAULT 'Администратор'
);
--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"file_type" text NOT NULL,
	"category" text DEFAULT 'water' NOT NULL,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"description" text DEFAULT '',
	"format" text DEFAULT 'file',
	"file_size" text DEFAULT '',
	"duration" text,
	"tags" text DEFAULT '',
	"article_id" text,
	"article_title" text,
	"uploaded_by" text DEFAULT 'Администратор',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_estimates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"total_price" integer NOT NULL,
	"items_json" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"client_name" text NOT NULL,
	"client_phone" text NOT NULL,
	"city" text NOT NULL,
	"address" text NOT NULL,
	"problem_description" text NOT NULL,
	"category" text NOT NULL,
	"emergency" boolean DEFAULT false,
	"preferred_time" text,
	"preferred_master_id" text,
	"preferred_master_name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"user_uid" text,
	"client_email" text,
	"rating" integer,
	"review_comment" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "specialists" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"photo" text DEFAULT 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
	"city" text NOT NULL,
	"experience_years" integer DEFAULT 1,
	"rating" text DEFAULT '5.0',
	"reviews_count" integer DEFAULT 0,
	"phone" text NOT NULL,
	"telegram" text,
	"whatsapp" text,
	"services_json" text DEFAULT '[]' NOT NULL,
	"min_price" integer DEFAULT 1000,
	"emergency_247" boolean DEFAULT false,
	"verified" boolean DEFAULT false,
	"badge" text,
	"bio" text DEFAULT '',
	"status" text DEFAULT 'pending' NOT NULL,
	"applied_at" text,
	"data_consent" boolean DEFAULT true NOT NULL,
	"consent_timestamp" timestamp DEFAULT now(),
	"legal_consent" boolean DEFAULT true,
	"legal_consent_timestamp" timestamp DEFAULT now(),
	"legal_checklist_json" text,
	"verification_docs_json" text,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"user_uid" text NOT NULL,
	"article_id" text NOT NULL,
	"article_title" text NOT NULL,
	"category" text,
	"cover_image" text,
	"type" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"user_uid" text NOT NULL,
	"user_email" text NOT NULL,
	"course_id" text NOT NULL,
	"course_title" text NOT NULL,
	"price" text NOT NULL,
	"payment_method" text DEFAULT 'Банковская карта',
	"purchased_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"name" text DEFAULT 'Пользователь',
	"phone" text,
	"city" text DEFAULT 'Москва',
	"password_hash" text,
	"role" text DEFAULT 'user',
	"data_consent" boolean DEFAULT true NOT NULL,
	"consent_timestamp" timestamp DEFAULT now(),
	"legal_consent" boolean DEFAULT true,
	"legal_consent_timestamp" timestamp DEFAULT now(),
	"legal_checklist_json" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
