import {
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  varchar,
  smallint,
} from "drizzle-orm/pg-core";
import { authSchema, appRoleEnum } from "./enums";

export const users = authSchema.table("users", {
  id: uuid("id").primaryKey().notNull(),
  instanceId: uuid("instance_id"),
  email: varchar("email", { length: 255 }),
  encryptedPassword: varchar("encrypted_password", { length: 255 }),
  emailConfirmedAt: timestamp("email_confirmed_at", {
    withTimezone: true,
    precision: 6,
  }),
  invitedAt: timestamp("invited_at", { withTimezone: true, precision: 6 }),
  confirmationToken: varchar("confirmation_token", { length: 255 }),
  confirmationSentAt: timestamp("confirmation_sent_at", {
    withTimezone: true,
    precision: 6,
  }),
  recoveryToken: varchar("recovery_token", { length: 255 }),
  recoverySentAt: timestamp("recovery_sent_at", {
    withTimezone: true,
    precision: 6,
  }),
  emailChangeTokenNew: varchar("email_change_token_new", { length: 255 }),
  emailChange: varchar("email_change", { length: 255 }),
  emailChangeSentAt: timestamp("email_change_sent_at", {
    withTimezone: true,
    precision: 6,
  }),
  lastSignInAt: timestamp("last_sign_in_at", {
    withTimezone: true,
    precision: 6,
  }),
  rawAppMetaData: jsonb("raw_app_meta_data"),
  rawUserMetaData: jsonb("raw_user_meta_data"),
  isSuperAdmin: boolean("is_super_admin"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 }),
  phone: text("phone").unique(),
  phoneConfirmedAt: timestamp("phone_confirmed_at", {
    withTimezone: true,
    precision: 6,
  }),
  phoneChange: text("phone_change").default(""),
  phoneChangeToken: varchar("phone_change_token", { length: 255 }).default(""),
  phoneChangeSentAt: timestamp("phone_change_sent_at", {
    withTimezone: true,
    precision: 6,
  }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true, precision: 6 }),
  emailChangeTokenCurrent: varchar("email_change_token_current", {
    length: 255,
  }).default(""),
  emailChangeConfirmStatus: smallint("email_change_confirm_status").default(0),
  bannedUntil: timestamp("banned_until", { withTimezone: true, precision: 6 }),
  reauthenticationToken: varchar("reauthentication_token", {
    length: 255,
  }).default(""),
  reauthenticationSentAt: timestamp("reauthentication_sent_at", {
    withTimezone: true,
    precision: 6,
  }),
  isSsoUser: boolean("is_sso_user").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true, precision: 6 }),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
}).enableRLS();

export const profiles = pgTable("ptsp_profiles", {
  id: uuid("id")
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name"),
  email: text("email").unique(),
  phone: text("phone").unique(),
  address: text("address"),
  role: appRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  nip: varchar("nip", { length: 50 }).unique(),
  jabatan: text("jabatan"),
  unitKerja: text("unit_kerja"),
  isVerified: boolean("is_verified").default(true),
  permissions: jsonb("permissions").default([
    "ringkasan",
    "pengajuan",
    "dokumen_hasil",
  ]),
  avatarUrl: text("avatar_url"),
}).enableRLS();

import { pgTable } from "drizzle-orm/pg-core";
export const rolePermissions = pgTable("ptsp_role_permissions", {
  role: varchar("role").primaryKey().notNull(),
  permissions: jsonb("permissions").notNull().default([]),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    precision: 6,
  }).defaultNow(),
}).enableRLS();
