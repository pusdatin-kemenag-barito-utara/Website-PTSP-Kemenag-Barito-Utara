import {
  pgTable,
  text,
  timestamp,
  uuid,
  bigint,
  bigserial,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "./auth";
import { serviceRequests } from "./requests";

import { ptspSchema, pusdatinSchema } from "./schema";
export const activityLogs = pusdatinSchema.table("ptsp_activity_logs", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "activity_logs_id_seq" }),
  requestId: uuid("request_id").references(() => serviceRequests.id, {
    onDelete: "cascade",
  }),
  actorId: uuid("actor_id").references(() => profiles.id),
  action: text("action").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const auditLogs = pusdatinSchema.table("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  targetSchema: text("target_schema"),
  performedBy: text("performed_by").notNull(),
  beforeState: jsonb("before_state"),
  afterState: jsonb("after_state"),
  ip: text("ip"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const systemStatus = ptspSchema.table("ptsp_system_status", {
  id: text("id").primaryKey().default("heartbeat"),
  lastPing: timestamp("last_ping", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  notes: text("notes").default("Keep-alive trigger"),
  maintenanceMode: boolean("maintenance_mode").default(false),
  maintenanceMessage: text("maintenance_message").default(
    "Sistem sedang dalam pemeliharaan berkala. Silakan kembali beberapa saat lagi.",
  ),
  maintenanceStartedAt: timestamp("maintenance_started_at", {
    withTimezone: true,
    precision: 6,
  }),
  maintenanceStartedBy: uuid("maintenance_started_by").references(
    () => profiles.id,
  ),
  aiChatEnabled: boolean("ai_chat_enabled").default(true).notNull(),
}).enableRLS();
