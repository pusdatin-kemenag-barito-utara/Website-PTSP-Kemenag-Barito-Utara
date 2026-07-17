import { pgTable, text, timestamp, bigint, boolean, varchar, date } from "drizzle-orm/pg-core";
import { feedbackStatusEnum } from "./enums";

import { ptspSchema } from "./schema";
export const feedbacks = ptspSchema.table("ptsp_feedbacks", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "feedbacks_id_seq" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  category: text("category").notNull().default("Saran"),
  serviceType: text("service_type").notNull().default("Lainnya"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  content: text("content").notNull(),
  ticketNumber: varchar("ticket_number", { length: 50 }).unique(),
  attachmentUrl: text("attachment_url"),
  incidentDate: date("incident_date"),
  incidentLocation: text("incident_location"),
  status: feedbackStatusEnum("status").default("pending"),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();
