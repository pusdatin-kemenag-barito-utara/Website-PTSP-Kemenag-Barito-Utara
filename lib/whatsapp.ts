/**
 * Helper untuk mengirim notifikasi WhatsApp via Bot PTSP
 * Menggunakan endpoint POST /api/send pada bot Baileys di VPS
 */

const WA_BOT_URL = process.env.WA_BOT_URL;
const WA_BOT_API_KEY = process.env.WA_BOT_API_KEY;

/**
 * Mengirim pesan WhatsApp melalui bot PTSP
 * @param phone - Nomor telepon tujuan (format: 08xxx atau 62xxx atau 628xxx)
 * @param message - Isi pesan (mendukung format WhatsApp: *bold*, _italic_, dll)
 * @param fileUrl - Opsional: URL file (PDF dll) yang akan disisipkan sebagai tautan di pesan
 */
export async function sendWhatsAppNotification(
  _phone: string,
  _message: string,
  _fileUrl?: string,
  _customFileName?: string
): Promise<void> {
  // Notifikasi WhatsApp dinonaktifkan
  return;
}
