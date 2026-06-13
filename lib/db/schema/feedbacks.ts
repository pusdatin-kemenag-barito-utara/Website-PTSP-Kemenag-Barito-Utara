import { pgTable, text, timestamp, bigint, boolean } from "drizzle-orm/pg-core";

export const feedbacks = pgTable("ptsp_feedbacks", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "feedbacks_id_seq" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  category: text("category").notNull().default("Saran"),
  serviceType: text("service_type").notNull().default("Lainnya"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();
