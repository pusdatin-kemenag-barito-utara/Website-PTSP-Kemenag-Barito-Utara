CREATE TABLE "ptsp_data_cuti_pegawai" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"no" integer,
	"nama" text NOT NULL,
	"nip" text,
	"jabatan" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ptsp_data_cuti_pegawai" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ptsp_rekap_cuti_tahunan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pegawai_id" uuid NOT NULL,
	"tahun_target" integer NOT NULL,
	"cuti_tahun_1" integer,
	"cuti_tahun_2" integer,
	"jumlah_cuti" integer,
	"cuti_tahunan" jsonb,
	"cuti_alasan_penting" integer,
	"cuti_bersalin" integer,
	"cuti_sakit" integer,
	"sisa_cuti" integer,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ptsp_rekap_cuti_tahunan" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ptsp_surat_keluar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text NOT NULL,
	"nomor_surat" text NOT NULL,
	"tanggal_surat" date NOT NULL,
	"agenda" text,
	"tujuan_surat" text NOT NULL,
	"perihal" text NOT NULL,
	"unit_kerja" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ptsp_surat_keluar_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
ALTER TABLE "ptsp_surat_keluar" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ptsp_surat_masuk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text NOT NULL,
	"nomor_surat" text NOT NULL,
	"tanggal_surat" date NOT NULL,
	"tanggal_terima" date NOT NULL,
	"asal_surat" text NOT NULL,
	"perihal" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ptsp_surat_masuk_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
ALTER TABLE "ptsp_surat_masuk" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_role_permissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_appointments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_feedbacks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_guest_book" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_system_status" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_generated_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_service_request_answers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_service_request_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_service_request_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_service_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_service_form_fields" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_service_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_service_requirements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_services" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_auth_otps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_whatsapp_outbox" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_laporan_kinerja" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "tanggal_pilihan" text;--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "jenis_pegawai" varchar(20);--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "unit_kerja" varchar(100);--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "masa_kerja_tahun" varchar(10);--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "masa_kerja_bulan" varchar(10);--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "no_hp" varchar(20);--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "alamat_cuti" text;--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "ttd_pemohon" text;--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "atasan_nip" varchar(50);--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "status_atasan" varchar(50) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "catatan_atasan" text;--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "ttd_atasan" text;--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "status_kepala" varchar(50) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "catatan_kepala" text;--> statement-breakpoint
ALTER TABLE "ptsp_pengajuan_cuti" ADD COLUMN "ttd_kepala" text;--> statement-breakpoint
ALTER TABLE "ptsp_rekap_cuti_tahunan" ADD CONSTRAINT "ptsp_rekap_cuti_tahunan_pegawai_id_ptsp_data_cuti_pegawai_id_fk" FOREIGN KEY ("pegawai_id") REFERENCES "public"."ptsp_data_cuti_pegawai"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_surat_keluar_nomor_surat" ON "ptsp_surat_keluar" USING btree ("nomor_surat");--> statement-breakpoint
CREATE INDEX "idx_surat_keluar_tanggal_surat" ON "ptsp_surat_keluar" USING btree ("tanggal_surat");--> statement-breakpoint
CREATE INDEX "idx_surat_keluar_tujuan_surat" ON "ptsp_surat_keluar" USING btree ("tujuan_surat");--> statement-breakpoint
CREATE INDEX "idx_surat_keluar_unit_kerja" ON "ptsp_surat_keluar" USING btree ("unit_kerja");--> statement-breakpoint
CREATE INDEX "idx_surat_keluar_perihal" ON "ptsp_surat_keluar" USING btree ("perihal");--> statement-breakpoint
CREATE INDEX "idx_surat_masuk_nomor_surat" ON "ptsp_surat_masuk" USING btree ("nomor_surat");--> statement-breakpoint
CREATE INDEX "idx_surat_masuk_tanggal_surat" ON "ptsp_surat_masuk" USING btree ("tanggal_surat");--> statement-breakpoint
CREATE INDEX "idx_surat_masuk_tanggal_terima" ON "ptsp_surat_masuk" USING btree ("tanggal_terima");--> statement-breakpoint
CREATE INDEX "idx_surat_masuk_asal_surat" ON "ptsp_surat_masuk" USING btree ("asal_surat");--> statement-breakpoint
CREATE INDEX "idx_surat_masuk_perihal" ON "ptsp_surat_masuk" USING btree ("perihal");