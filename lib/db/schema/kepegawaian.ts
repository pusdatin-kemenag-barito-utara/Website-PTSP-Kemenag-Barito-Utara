import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const laporanKinerja = pgTable("ptsp_laporan_kinerja", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tanggal: date("tanggal").notNull(),
  kegiatanTugasJabatan: text("kegiatan_tugas_jabatan").notNull(),
  hasil: text("hasil").notNull(),
  buktiDukungUrl: text("bukti_dukung_url"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, reviewed, revision, approved
  komentarPimpinan: text("komentar_pimpinan"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const pengajuanCuti = pgTable("ptsp_pengajuan_cuti", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jenisCuti: varchar("jenis_cuti", { length: 50 }).notNull(), // Tahunan, Besar, Sakit, Bersalin, Alasan Penting, Di Luar Tanggungan Negara
  tanggalMulai: date("tanggal_mulai").notNull(),
  tanggalSelesai: date("tanggal_selesai").notNull(),
  tanggalPilihan: text("tanggal_pilihan"), // comma separated YYYY-MM-DD
  alasan: text("alasan").notNull(),
  dokumenUrl: text("dokumen_url"),
  
  // Data Pegawai
  jenisPegawai: varchar("jenis_pegawai", { length: 20 }), // PNS atau PPPK
  unitKerja: varchar("unit_kerja", { length: 100 }),
  masaKerjaTahun: varchar("masa_kerja_tahun", { length: 10 }),
  masaKerjaBulan: varchar("masa_kerja_bulan", { length: 10 }),
  noHp: varchar("no_hp", { length: 20 }),
  alamatCuti: text("alamat_cuti"),
  ttdPemohon: text("ttd_pemohon"),

  // Persetujuan Atasan Langsung
  atasanNip: varchar("atasan_nip", { length: 50 }),
  statusAtasan: varchar("status_atasan", { length: 50 }).notNull().default("pending"), // pending, approved, rejected, changes, delayed
  catatanAtasan: text("catatan_atasan"),
  ttdAtasan: text("ttd_atasan"),

  // Keputusan Kepala Kantor
  statusKepala: varchar("status_kepala", { length: 50 }).notNull().default("pending"), // pending, approved, rejected, changes, delayed
  catatanKepala: text("catatan_kepala"),
  ttdKepala: text("ttd_kepala"),

  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected (Status Akhir)
  komentarPimpinan: text("komentar_pimpinan"), // Legacy/General comment
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();
