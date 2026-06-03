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

export const activityLogs = pgTable("activity_logs", {
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
});

export const auditLogs = pgTable("audit_logs", {
  id: bigserial("id", { mode: "bigint" }).primaryKey().notNull(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
});

export const systemStatus = pgTable("system_status", {
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
});
