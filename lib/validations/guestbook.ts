import { z } from "zod";

export const guestBookSchema = z.object({
  guestName: z.string().min(2, "Nama terlalu pendek").max(100, "Nama terlalu panjang"),
  whatsapp: z.string().regex(/^[\d-]{9,20}$/, "Format WhatsApp tidak valid, gunakan angka atau strip (-)"),
  institutionType: z.string().min(2).max(50),
  institutionName: z.string().max(100).nullable().optional(),
  intendedOfficer: z.string().min(2).max(100),
  purpose: z.string().min(5, "Keperluan terlalu pendek").max(1000, "Keperluan terlalu panjang"),
  visitDate: z.string().datetime().optional().nullable(),
  turnstileToken: z.string().min(1, "Token keamanan wajib diisi").optional(),
});
