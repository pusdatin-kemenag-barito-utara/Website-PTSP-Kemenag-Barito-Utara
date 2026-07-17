import { z } from "zod";

export const feedbackSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek").max(100, "Nama terlalu panjang"),
  phone: z.string().regex(/^[\d-]{9,20}$/, "Format WhatsApp tidak valid, gunakan angka atau strip (-)"),
  category: z.enum(["Saran", "Pengaduan"], {
    message: "Kategori tidak valid",
  }),
  serviceType: z.string().min(2).max(100),
  isAnonymous: z.boolean().default(false),
  content: z.string().min(10, "Isi pesan terlalu pendek").max(2000, "Isi pesan terlalu panjang"),
  attachmentUrl: z.string().optional(),
  incidentDate: z.string().optional(),
  incidentLocation: z.string().optional(),
  turnstileToken: z.string().min(1, "Token keamanan wajib diisi").optional(),
});
