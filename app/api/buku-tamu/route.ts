import { db } from "@/lib/db";
import { guestBook } from "@/lib/db/schema";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      guestName,
      whatsapp,
      institutionType,
      institutionName,
      intendedOfficer,
      purpose,
      visitDate,
      turnstileToken,
    } = body;

    // Get client IP address if available
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") || 
                     undefined;

    // Verify Turnstile token
    const isHuman = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!isHuman) {
      return NextResponse.json(
        { success: false, error: "Verifikasi keamanan (Turnstile) gagal. Silakan coba lagi atau segarkan halaman." },
        { status: 400 }
      ) as any;
    }

    // Simple validation
    if (!guestName || !whatsapp || !institutionType || !intendedOfficer || !purpose) {
      return NextResponse.json(
        { success: false, error: "Semua kolom wajib diisi kecuali nama instansi." },
        { status: 400 }
      ) as any;
    }

    // Insert to DB using Drizzle
    const [newEntry] = await db
      .insert(guestBook)
      .values({
        guestName,
        whatsapp,
        institutionType,
        institutionName: institutionName || null,
        intendedOfficer,
        purpose,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
      })
      .returning();

    // Kirim notifikasi WhatsApp ke tamu (fire-and-forget, tidak memblokir response)
    const visitDateFormatted = new Date(newEntry.visitDate).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const waMessage =
      `Halo *${guestName}* 👋\n\n` +
      `Terima kasih telah berkunjung ke:\n` +
      `🏛 *Kantor Kementerian Agama Kabupaten Barito Utara*\n\n` +
      `📝 *Data kunjungan Anda telah berhasil dicatat:*\n` +
      `• Tanggal : ${visitDateFormatted}\n` +
      `• Tujuan  : ${intendedOfficer}\n` +
      `• Keperluan: ${purpose}\n` +
      (institutionName ? `• Instansi : ${institutionName}\n` : "") +
      `\nJika ada pertanyaan lebih lanjut, silakan hubungi kami.\n\n` +
      `_Pelayanan Terpadu Satu Pintu (PTSP)_\n` +
      `_Kemenag Kabupaten Barito Utara_`;

    // Jalankan tanpa await agar tidak memperlambat response ke user
    sendWhatsAppNotification(whatsapp, waMessage).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Berhasil menyimpan buku tamu.",
      data: {
        id: newEntry.id.toString(), // Convert BigInt to string for JSON serialization
        guestName: newEntry.guestName,
        visitDate: newEntry.visitDate.toISOString(),
      },
    }) as any;
  } catch (error: any) {
    console.error("Failed to insert guest book entry:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan buku tamu." },
      { status: 500 }
    ) as any;
  }
}

