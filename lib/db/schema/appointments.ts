import { pgTable, text, timestamp, date, bigint } from "drizzle-orm/pg-core";

export const appointments = pgTable("appointments", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "appointments_id_seq" }),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  guestName: text("guest_name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  institutionType: text("institution_type").notNull(),
  institutionName: text("institution_name"),
  intendedOfficer: text("intended_officer").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
});
