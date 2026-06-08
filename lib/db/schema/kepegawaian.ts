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
});
