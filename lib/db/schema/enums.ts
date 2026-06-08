import { pgEnum, pgSchema } from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");

export const appRoleEnum = pgEnum("ptsp_app_role", [
  "user",
  "admin_ptsp",
  "kepala_kantor",
  "kasubag_tu",
  "super_admin",
  "pegawai",
]);

export const requestStatusEnum = pgEnum("ptsp_request_status", [
  "draft",
  "submitted",
  "under_review",
  "revision_required",
  "rejected",
  "approved",
  "completed",
  "spam",
]);
