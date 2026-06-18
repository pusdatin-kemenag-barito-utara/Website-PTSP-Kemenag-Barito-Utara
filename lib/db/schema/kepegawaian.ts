import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  varchar,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./auth";

import { ptspSchema } from "./schema";
export const laporanKinerja = ptspSchema.table("ptsp_laporan_kinerja", {
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

export const pengajuanCuti = ptspSchema.table("ptsp_pengajuan_cuti", {
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
  editCount: integer("edit_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const dataCutiPegawai = ptspSchema.table("ptsp_data_cuti_pegawai", {
  id: uuid("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
  no: integer("no"),
  nama: text("nama").notNull(),
  nip: text("nip"),
  jabatan: text("jabatan"),
  unitKerja: text("unit_kerja"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const rekapCutiTahunan = ptspSchema.table("ptsp_rekap_cuti_tahunan", {
  id: uuid("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
  pegawaiId: uuid("pegawai_id")
    .notNull()
    .references(() => dataCutiPegawai.id, { onDelete: "cascade" }),
  tahunTarget: integer("tahun_target").notNull(),
  cutiTahun1: integer("cuti_tahun_1"),
  cutiTahun2: integer("cuti_tahun_2"),
  jumlahCuti: integer("jumlah_cuti"),
  cutiTahunan: jsonb("cuti_tahunan").$type<number[]>(),
  cutiAlasanPenting: integer("cuti_alasan_penting"),
  cutiBesar: integer("cuti_besar"),
  cutiBersalin: integer("cuti_bersalin"),
  cutiSakit: integer("cuti_sakit"),
  sisaCuti: integer("sisa_cuti"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();
