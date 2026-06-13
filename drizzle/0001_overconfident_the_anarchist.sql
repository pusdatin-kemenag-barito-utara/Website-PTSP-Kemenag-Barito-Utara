ALTER TYPE "public"."ptsp_app_role" ADD VALUE 'pegawai';--> statement-breakpoint
CREATE TABLE "ptsp_auth_otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"otp" varchar(6) NOT NULL,
	"expires_at" timestamp (6) with time zone NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptsp_whatsapp_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"message" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "ptsp_laporan_kinerja" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tanggal" date NOT NULL,
	"kegiatan_tugas_jabatan" text NOT NULL,
	"hasil" text NOT NULL,
	"bukti_dukung_url" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"komentar_pimpinan" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptsp_pengajuan_cuti" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"jenis_cuti" varchar(50) NOT NULL,
	"tanggal_mulai" date NOT NULL,
	"tanggal_selesai" date NOT NULL,
	"alasan" text NOT NULL,
	"dokumen_url" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"komentar_pimpinan" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ptsp_activity_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_system_status" ADD COLUMN "ai_chat_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "ptsp_feedbacks" ADD COLUMN "category" text DEFAULT 'Saran' NOT NULL;--> statement-breakpoint
ALTER TABLE "ptsp_feedbacks" ADD COLUMN "service_type" text DEFAULT 'Lainnya' NOT NULL;--> statement-breakpoint
ALTER TABLE "ptsp_feedbacks" ADD COLUMN "is_anonymous" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ptsp_laporan_kinerja" ADD CONSTRAINT "ptsp_laporan_kinerja_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD CONSTRAINT "ptsp_pengajuan_cuti_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;