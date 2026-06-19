import { db } from "@/lib/db";
import { feedbacks } from "@/lib/db/schema";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";
import { feedbackSchema } from "@/lib/validations/feedback";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validasi input dengan Zod
    const validationResult = feedbackSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0].message;
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const {
      name,
      phone,
      category,
      serviceType,
      isAnonymous,
      content,
      turnstileToken,
    } = validationResult.data;

    // Get client IP address if available
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") || 
                     undefined;

    // Verify Turnstile token
    const isHuman = await verifyTurnstileToken(turnstileToken || "", clientIp);
    if (!isHuman) {
      return NextResponse.json(
        { success: false, error: "Verifikasi keamanan (Turnstile) gagal. Silakan coba lagi atau segarkan halaman." },
        { status: 400 }
      );
    }

    // Insert to DB using Drizzle
    const [newEntry] = await db
      .insert(feedbacks)
      .values({
        name,
        phone,
        category,
        serviceType,
        isAnonymous,
        content,
        status: "pending",
      })
      .returning();

    // Create Audit Log (Sistem / Sistem Publik)
    try {
      await createAuditLog({
        adminId: "00000000-0000-0000-0000-000000000000", // system placeholder
        action: "BUAT_SARAN_PENGADUAN",
        entityType: "feedbacks",
        entityId: newEntry.id.toString(),
        details: {
          name: isAnonymous ? "Anonim" : name,
          category,
          serviceType,
        },
      });
    } catch (err) {
      console.error("Failed to create audit log:", err);
    }

    // Revalidate admin page
    revalidatePath("/admin/e-pengaduan");
    revalidatePath("/admin/saran-pengaduan"); // Fallback jika belum di-rename semua

    // Format tanggal untuk pesan WA
    const submittedDateFormatted = new Date(newEntry.createdAt).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });

    // Notifikasi WhatsApp Acknowledgement
    const waMessage =
      `Halo 👋\n\n` +
      `Terima kasih telah menghubungi:\n` +
      `🏛 *Kantor Kementerian Agama Kabupaten Barito Utara*\n\n` +
      `📝 *Tiket ${category} Anda telah kami terima dengan detail:*\n` +
      `• Tanggal : ${submittedDateFormatted}\n` +
      `• Layanan : ${serviceType}\n` +
      `• Pelapor : ${isAnonymous ? "Anonim (Dirahasiakan)" : name}\n\n` +
      `Laporan Anda sedang berada dalam antrean peninjauan oleh petugas kami. Anda akan menerima notifikasi balasan jika petugas telah memberikan tanggapan.\n\n` +
      `_Pelayanan Terpadu Satu Pintu (PTSP)_\n` +
      `_Kemenag Kabupaten Barito Utara_`;

    try {
      await sendWhatsAppNotification(phone, waMessage);
    } catch (waErr) {
      console.error("WhatsApp notification failed:", waErr);
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengirim ${category.toLowerCase()}.`,
      data: {
        id: newEntry.id.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Failed to insert feedback entry:", error);
    const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan pengaduan.";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
