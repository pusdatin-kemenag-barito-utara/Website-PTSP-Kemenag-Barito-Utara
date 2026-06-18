import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { ptspSchema } from "./schema";
export const masterOptions = ptspSchema.table("ptsp_master_options", {
  id: uuid("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
  category: varchar("category", { length: 50 }).notNull(), // 'jenis_cuti', 'jenis_pegawai', 'unit_kerja'
  value: text("value").notNull(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();
