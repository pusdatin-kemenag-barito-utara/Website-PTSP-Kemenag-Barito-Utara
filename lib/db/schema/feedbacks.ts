import { pgTable, text, timestamp, bigint, boolean } from "drizzle-orm/pg-core";
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
  status: feedbackStatusEnum("status").default("pending"),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();
