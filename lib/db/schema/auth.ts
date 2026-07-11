import {
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  varchar,
  smallint,
  integer,
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

import { ptspSchema, pusdatinSchema } from "./schema";
export const profiles = pusdatinSchema.table("profiles", {
  id: uuid("id")
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("name"),
  email: text("email").unique(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull().default("user"),
  userType: text("user_type").notNull().default("internal_admin"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  isVerified: boolean("is_verified").default(true),
  permissions: jsonb("permissions").default([
    "ringkasan",
    "pengajuan",
    "dokumen_hasil",
  ]),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),
}).enableRLS();

export const satelliteApps = pusdatinSchema.table("satellite_apps", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("online"),
  lastHealthCheck: timestamp("last_health_check"),
});

export const appPermissions = pusdatinSchema.table("app_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  appId: varchar("app_id", { length: 50 }).notNull().references(() => satelliteApps.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("none"),
  features: jsonb("features"),
});

export const profilesPegawai = pusdatinSchema.table("profiles_pegawai", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  nip: varchar("nip", { length: 50 }),
  jabatan: varchar("jabatan", { length: 100 }),
  pangkatGolongan: varchar("pangkat_golongan", { length: 50 }),
  unitKerja: varchar("unit_kerja", { length: 255 }),
  tipePejabat: varchar("tipe_pejabat", { length: 50 }),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profilesPemohon = pusdatinSchema.table("profiles_pemohon", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }),
  nik: varchar("nik", { length: 50 }).unique(),
  noHp: varchar("no_hp", { length: 20 }),
  alamat: text("alamat"),
  pekerjaan: varchar("pekerjaan", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
