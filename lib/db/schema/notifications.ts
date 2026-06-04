import { pgTable, text, timestamp, boolean, pgEnum, uuid } from "drizzle-orm/pg-core";
import { profiles } from "./auth";

export const notificationTypeEnum = pgEnum("ptsp_notification_type", [
  "info",
  "success",
  "warning",
  "error"
]);

export const notifications = pgTable("ptsp_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").default("info").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  link: text("link"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
