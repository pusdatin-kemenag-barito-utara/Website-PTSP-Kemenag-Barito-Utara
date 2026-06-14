import { pgEnum, pgSchema } from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");

export const appRoleEnum = pgEnum("ptsp_app_role", [
  "user",
  "admin_ptsp",
  "admin_sub_bagian_tata_usaha",
  "admin_pendidikan_madrasah",
  "admin_pendidikan_agama_islam",
  "admin_pendidikan_diniyah_pondok_pesantren",
  "admin_bimbingan_masyarakat_islam",
  "admin_bimbingan_masyarakat_kristen_katolik",
  "admin_penyelenggara_zakat_wakaf",
  "admin_penyelenggara_hindu",
  "kepala_kantor",
  "kasubag_tu",
  "super_admin",
  "pegawai",
]);

export const appointmentStatusEnum = pgEnum("ptsp_appointment_status", [
  "pending",
  "approved",
  "rejected",
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

export const feedbackStatusEnum = pgEnum("ptsp_feedback_status", [
  "pending",
  "processed",
  "responded",
]);
