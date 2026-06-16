CREATE TYPE "public"."ptsp_appointment_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."ptsp_feedback_status" AS ENUM('pending', 'processed', 'responded');--> statement-breakpoint
ALTER TYPE "public"."ptsp_app_role" ADD VALUE 'admin_sub_bagian_tata_usaha' BEFORE 'kepala_kantor';--> statement-breakpoint
ALTER TYPE "public"."ptsp_app_role" ADD VALUE 'admin_pendidikan_madrasah' BEFORE 'kepala_kantor';--> statement-breakpoint
ALTER TYPE "public"."ptsp_app_role" ADD VALUE 'admin_pendidikan_agama_islam' BEFORE 'kepala_kantor';--> statement-breakpoint
ALTER TYPE "public"."ptsp_app_role" ADD VALUE 'admin_pendidikan_diniyah_pondok_pesantren' BEFORE 'kepala_kantor';--> statement-breakpoint
ALTER TYPE "public"."ptsp_app_role" ADD VALUE 'admin_bimbingan_masyarakat_islam' BEFORE 'kepala_kantor';--> statement-breakpoint
ALTER TYPE "public"."ptsp_app_role" ADD VALUE 'admin_bimbingan_masyarakat_kristen_katolik' BEFORE 'kepala_kantor';--> statement-breakpoint
ALTER TYPE "public"."ptsp_app_role" ADD VALUE 'admin_penyelenggara_zakat_wakaf' BEFORE 'kepala_kantor';--> statement-breakpoint
ALTER TYPE "public"."ptsp_app_role" ADD VALUE 'admin_penyelenggara_hindu' BEFORE 'kepala_kantor';--> statement-breakpoint
CREATE TABLE "ptsp_data_pejabat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipe_pejabat" varchar(50) NOT NULL,
	"unit_kerja" varchar(100),
	"nama" text NOT NULL,
	"nip" text NOT NULL,
	"jabatan" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ptsp_data_pejabat" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ptsp_master_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar(50) NOT NULL,
	"value" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ptsp_master_options" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_surat_keluar" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_surat_masuk" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_appointments" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."ptsp_appointment_status";--> statement-breakpoint
ALTER TABLE "ptsp_appointments" ALTER COLUMN "status" SET DATA TYPE "public"."ptsp_appointment_status" USING "status"::"public"."ptsp_appointment_status";--> statement-breakpoint
ALTER TABLE "ptsp_guest_book" ALTER COLUMN "visit_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "ptsp_whatsapp_outbox" ALTER COLUMN "message" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ptsp_profiles" ADD COLUMN "nip" varchar(50);--> statement-breakpoint
ALTER TABLE "ptsp_profiles" ADD COLUMN "jabatan" text;--> statement-breakpoint
ALTER TABLE "ptsp_feedbacks" ADD COLUMN "status" "ptsp_feedback_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "ptsp_feedbacks" ADD COLUMN "admin_reply" text;--> statement-breakpoint
ALTER TABLE "ptsp_whatsapp_outbox" ADD COLUMN "media_url" text;--> statement-breakpoint
ALTER TABLE "ptsp_whatsapp_outbox" ADD COLUMN "media_type" varchar(50);--> statement-breakpoint
ALTER TABLE "ptsp_whatsapp_outbox" ADD COLUMN "file_name" text;--> statement-breakpoint
ALTER TABLE "ptsp_data_cuti_pegawai" ADD COLUMN "unit_kerja" text;--> statement-breakpoint
ALTER TABLE "ptsp_rekap_cuti_tahunan" ADD COLUMN "cuti_besar" integer;--> statement-breakpoint
ALTER TABLE "ptsp_surat_keluar" ADD COLUMN "status" text DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "ptsp_surat_keluar" ADD COLUMN "lampiran" text;--> statement-breakpoint
ALTER TABLE "ptsp_surat_keluar" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "ptsp_surat_keluar" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "ptsp_surat_keluar" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ptsp_surat_masuk" ADD COLUMN "agenda" text;--> statement-breakpoint
ALTER TABLE "ptsp_surat_masuk" ADD COLUMN "status" text DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "ptsp_surat_masuk" ADD COLUMN "lampiran" text;--> statement-breakpoint
ALTER TABLE "ptsp_surat_masuk" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "ptsp_surat_masuk" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "ptsp_surat_masuk" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ptsp_surat_keluar" ADD CONSTRAINT "ptsp_surat_keluar_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptsp_surat_keluar" ADD CONSTRAINT "ptsp_surat_keluar_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptsp_surat_masuk" ADD CONSTRAINT "ptsp_surat_masuk_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptsp_surat_masuk" ADD CONSTRAINT "ptsp_surat_masuk_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_surat_keluar_deleted_at" ON "ptsp_surat_keluar" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_surat_keluar_created_at" ON "ptsp_surat_keluar" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_surat_keluar_deleted_created" ON "ptsp_surat_keluar" USING btree ("deleted_at","created_at");--> statement-breakpoint
CREATE INDEX "idx_surat_masuk_deleted_at" ON "ptsp_surat_masuk" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_surat_masuk_created_at" ON "ptsp_surat_masuk" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_surat_masuk_deleted_created" ON "ptsp_surat_masuk" USING btree ("deleted_at","created_at");--> statement-breakpoint
ALTER TABLE "ptsp_feedbacks" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "ptsp_profiles" ADD CONSTRAINT "ptsp_profiles_nip_unique" UNIQUE("nip");