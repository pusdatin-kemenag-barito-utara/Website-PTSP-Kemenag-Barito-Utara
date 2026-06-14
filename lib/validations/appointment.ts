import { z } from "zod";

export const appointmentSchema = z.object({
  guestName: z.string().min(2, "Nama terlalu pendek").max(100, "Nama terlalu panjang"),
  whatsapp: z.string().regex(/^\d{9,20}$/, "Format WhatsApp tidak valid, gunakan angka saja"),
  institutionType: z.string().min(2).max(50),
  institutionName: z.string().max(100).nullable().optional(),
  intendedOfficer: z.string().min(2).max(100),
  purpose: z.string().min(5, "Keperluan terlalu pendek").max(1000, "Keperluan terlalu panjang"),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
  appointmentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu tidak valid (HH:mm)"),
  turnstileToken: z.string().min(1, "Token keamanan wajib diisi").optional(),
});
