import { db } from "@/lib/db";
import { guestBook } from "@/lib/db/schema";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { NextResponse } from "next/server";

import { guestBookSchema } from "@/lib/validations/guestbook";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validasi input dengan Zod
    const validationResult = guestBookSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0].message;
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const {
      guestName,
      whatsapp,
      institutionType,
      institutionName,
      intendedOfficer,
      purpose,
      visitDate,
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

    // Tunggu notifikasi WA selesai (menghindari dibunuh oleh Vercel serverless)
    try {
      await sendWhatsAppNotification(whatsapp, waMessage);
    } catch (waErr) {
      console.error("WhatsApp notification failed:", waErr);
    }

    return NextResponse.json({
      success: true,
      message: "Berhasil menyimpan buku tamu.",
      data: {
        id: newEntry.id.toString(), // Convert BigInt to string for JSON serialization
        guestName: newEntry.guestName,
        visitDate: newEntry.visitDate.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Failed to insert guest book entry:", error);
    const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan buku tamu.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

