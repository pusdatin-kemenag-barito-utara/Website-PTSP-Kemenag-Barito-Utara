import { pgTable, text, timestamp, bigint } from "drizzle-orm/pg-core";

import { ptspSchema } from "./schema";
export const guestBook = ptspSchema.table("ptsp_guest_book", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "guest_book_id_seq" }),
  visitDate: timestamp("visit_date", { withTimezone: true, precision: 6 }).notNull(),
  guestName: text("guest_name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  institutionType: text("institution_type").notNull(),
  institutionName: text("institution_name"),
  intendedOfficer: text("intended_officer").notNull(),
  purpose: text("purpose").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();
