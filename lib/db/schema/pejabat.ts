import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const dataPejabat = pgTable("ptsp_data_pejabat", {
  id: uuid("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
  tipePejabat: varchar("tipe_pejabat", { length: 50 }).notNull(), // 'Atasan Langsung' | 'Pejabat Berwenang'
  unitKerja: varchar("unit_kerja", { length: 100 }), // e.g. 'Kepala Kantor' atau mapping dari UNIT_KERJA_OPTIONS
  nama: text("nama").notNull(),
  nip: text("nip").notNull(),
  jabatan: text("jabatan"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();
