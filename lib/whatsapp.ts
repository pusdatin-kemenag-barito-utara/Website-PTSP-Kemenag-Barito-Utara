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
 */
export async function sendWhatsAppNotification(
  phone: string,
  message: string
): Promise<void> {
  if (!WA_BOT_URL || !WA_BOT_API_KEY) {
    console.warn("[WA Bot] WA_BOT_URL atau WA_BOT_API_KEY belum diatur di .env. Notifikasi WA dilewati.");
    return;
  }

  // Jangan kirim jika nomor adalah placeholder / tidak valid
  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone || cleanPhone === "-" || cleanPhone.length < 9) {
    console.warn(`[WA Bot] Nomor tidak valid (${phone}), notifikasi dilewati.`);
    return;
  }

  try {
    const response = await fetch(`${WA_BOT_URL}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": WA_BOT_API_KEY,
      },
      body: JSON.stringify({ to: cleanPhone, text: message }),
      // Timeout 10 detik agar tidak menghambat response utama
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[WA Bot] Gagal mengirim notifikasi (HTTP ${response.status}): ${err}`);
    } else {
      console.log(`[WA Bot] ✅ Notifikasi berhasil dikirim ke ${cleanPhone}`);
    }
  } catch (err: any) {
    // Jangan throw error — notifikasi WA gagal tidak boleh membatalkan proses utama
    console.error(`[WA Bot] Error saat mengirim notifikasi: ${err.message}`);
  }
}
