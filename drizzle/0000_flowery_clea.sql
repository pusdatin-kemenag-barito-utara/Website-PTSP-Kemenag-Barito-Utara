CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE TYPE "public"."app_role" AS ENUM('user', 'admin_ptsp', 'kepala_kantor', 'kasubag_tu', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('draft', 'submitted', 'under_review', 'revision_required', 'rejected', 'approved', 'completed');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" bigint PRIMARY KEY DEFAULT nextval('public.activity_logs_id_seq') NOT NULL,
	"request_id" uuid,
	"actor_id" uuid,
	"action" text NOT NULL,
	"notes" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigint PRIMARY KEY DEFAULT nextval('public.audit_logs_id_seq') NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"details" jsonb,
	"ip_address" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_documents" (
	"id" bigint PRIMARY KEY DEFAULT nextval('public.generated_documents_id_seq') NOT NULL,
	"request_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"generated_by" uuid,
	"generated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "generated_documents_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"email" text,
	"phone" text,
	"address" text,
	"role" "app_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"unit_kerja" text,
	"plain_password" text,
	"is_verified" boolean DEFAULT true,
	"permissions" jsonb DEFAULT '["ringkasan","pengajuan","dokumen_hasil"]'::jsonb,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role" varchar PRIMARY KEY NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_form_fields" (
	"id" bigint PRIMARY KEY DEFAULT nextval('public.service_form_fields_id_seq') NOT NULL,
	"service_item_id" bigint NOT NULL,
	"label" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"placeholder" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"options" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_items" (
	"id" bigint PRIMARY KEY DEFAULT nextval('public.service_items_id_seq') NOT NULL,
	"service_id" bigint NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"sort_order" integer DEFAULT 0,
	"estimated_time" text DEFAULT '1-3 Hari Kerja',
	CONSTRAINT "service_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "service_request_answers" (
	"id" bigint PRIMARY KEY DEFAULT nextval('public.service_request_answers_id_seq') NOT NULL,
	"request_id" uuid NOT NULL,
	"field_id" bigint,
	"field_name" text NOT NULL,
	"field_value" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_request_documents" (
	"id" bigint PRIMARY KEY DEFAULT nextval('public.service_request_documents_id_seq') NOT NULL,
	"request_id" uuid NOT NULL,
	"requirement_id" bigint,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_type" text,
	"file_size" bigint,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_request_reviews" (
	"id" bigint PRIMARY KEY DEFAULT nextval('public.service_request_reviews_id_seq') NOT NULL,
	"request_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"status" "request_status" NOT NULL,
	"notes" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"service_id" bigint NOT NULL,
	"service_item_id" bigint NOT NULL,
	"request_number" text NOT NULL,
	"status" "request_status" DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp (6) with time zone,
	"approved_at" timestamp (6) with time zone,
	"rejected_at" timestamp (6) with time zone,
	"completed_at" timestamp (6) with time zone,
	"revision_note" text,
	"rejection_reason" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_requests_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "service_requirements" (
	"id" bigint PRIMARY KEY DEFAULT nextval('public.service_requirements_id_seq') NOT NULL,
	"service_item_id" bigint NOT NULL,
	"document_name" text NOT NULL,
	"description" text,
	"is_required" boolean DEFAULT true NOT NULL,
	"allowed_extensions" text DEFAULT 'pdf,jpg,jpeg,png',
	"max_file_size_mb" integer DEFAULT 5 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" bigint PRIMARY KEY DEFAULT nextval('public.services_id_seq') NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"role_owner" text,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"instance_id" uuid,
	"email" varchar(255),
	"encrypted_password" varchar(255),
	"email_confirmed_at" timestamp (6) with time zone,
	"invited_at" timestamp (6) with time zone,
	"confirmation_token" varchar(255),
	"confirmation_sent_at" timestamp (6) with time zone,
	"recovery_token" varchar(255),
	"recovery_sent_at" timestamp (6) with time zone,
	"email_change_token_new" varchar(255),
	"email_change" varchar(255),
	"email_change_sent_at" timestamp (6) with time zone,
	"last_sign_in_at" timestamp (6) with time zone,
	"raw_app_meta_data" jsonb,
	"raw_user_meta_data" jsonb,
	"is_super_admin" boolean,
	"created_at" timestamp (6) with time zone,
	"updated_at" timestamp (6) with time zone,
	"phone" text,
	"phone_confirmed_at" timestamp (6) with time zone,
	"phone_change" text DEFAULT '',
	"phone_change_token" varchar(255) DEFAULT '',
	"phone_change_sent_at" timestamp (6) with time zone,
	"confirmed_at" timestamp (6) with time zone,
	"email_change_token_current" varchar(255) DEFAULT '',
	"email_change_confirm_status" smallint DEFAULT 0,
	"banned_until" timestamp (6) with time zone,
	"reauthentication_token" varchar(255) DEFAULT '',
	"reauthentication_sent_at" timestamp (6) with time zone,
	"is_sso_user" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_request_id_service_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."service_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_profiles_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_request_id_service_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."service_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_generated_by_profiles_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_form_fields" ADD CONSTRAINT "service_form_fields_service_item_id_service_items_id_fk" FOREIGN KEY ("service_item_id") REFERENCES "public"."service_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_items" ADD CONSTRAINT "service_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request_answers" ADD CONSTRAINT "service_request_answers_request_id_service_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."service_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request_answers" ADD CONSTRAINT "service_request_answers_field_id_service_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."service_form_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request_documents" ADD CONSTRAINT "service_request_documents_request_id_service_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."service_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request_documents" ADD CONSTRAINT "service_request_documents_requirement_id_service_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."service_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request_reviews" ADD CONSTRAINT "service_request_reviews_request_id_service_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."service_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request_reviews" ADD CONSTRAINT "service_request_reviews_reviewer_id_profiles_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_service_item_id_service_items_id_fk" FOREIGN KEY ("service_item_id") REFERENCES "public"."service_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requirements" ADD CONSTRAINT "service_requirements_service_item_id_service_items_id_fk" FOREIGN KEY ("service_item_id") REFERENCES "public"."service_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "service_request_documents_request_id_requirement_id_key" ON "service_request_documents" USING btree ("request_id","requirement_id");