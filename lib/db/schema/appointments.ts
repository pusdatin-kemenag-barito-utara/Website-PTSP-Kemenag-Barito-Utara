import { pgTable, text, timestamp, date, bigint } from "drizzle-orm/pg-core";
import { appointmentStatusEnum } from "./enums";

export const appointments = pgTable("ptsp_appointments", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "appointments_id_seq" }),
  appointmentDate: date("appointment_date", { mode: "date" }).notNull(),
  appointmentTime: text("appointment_time").notNull(),
  guestName: text("guest_name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  institutionType: text("institution_type").notNull(),
  institutionName: text("institution_name"),
  intendedOfficer: text("intended_officer").notNull(),
  purpose: text("purpose").notNull(),
  status: appointmentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();
