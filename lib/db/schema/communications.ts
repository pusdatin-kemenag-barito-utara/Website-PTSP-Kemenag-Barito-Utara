import {
  uuid,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

// Tabel untuk menyimpan kode OTP
import { ptspSchema } from "./schema";
export const authOtps = ptspSchema.table("ptsp_auth_otps", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  phone: text("phone").notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, precision: 6 }).notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).notNull().defaultNow(),
}).enableRLS();

// Tabel untuk antrean pesan WhatsApp
export const whatsappOutbox = ptspSchema.table("ptsp_whatsapp_outbox", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  phone: text("phone").notNull(),
  message: text("message"), // Dibuat opsional jika hanya ingin mengirim media
  mediaUrl: text("media_url"), // URL atau path ke file (PDF, gambar, video, dll)
  mediaType: varchar("media_type", { length: 50 }), // 'document', 'image', 'video', 'audio'
  fileName: text("file_name"), // Nama file, contoh: 'SK_Cuti.pdf'
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'sent', 'failed'
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 }).notNull().defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true, precision: 6 }),
}).enableRLS();
