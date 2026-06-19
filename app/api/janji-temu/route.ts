import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { NextResponse } from "next/server";

import { appointmentSchema } from "@/lib/validations/appointment";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validasi input dengan Zod
    const validationResult = appointmentSchema.safeParse(body);
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
      appointmentDate,
      appointmentTime,
      turnstileToken,
    } = validationResult.data;

    // Get client IP address if available
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      undefined;

    // Verify Turnstile token
    const isHuman = await verifyTurnstileToken(turnstileToken || "", clientIp);
    if (!isHuman) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Verifikasi keamanan (Turnstile) gagal. Silakan coba lagi atau segarkan halaman.",
        },
        { status: 400 }
      );
    }

    const appointmentDateObj = new Date(appointmentDate);
    // Insert to DB using Drizzle
    const [newEntry] = await db
      .insert(appointments)
      .values({
        guestName,
        whatsapp,
        institutionType,
        institutionName: institutionName || null,
        intendedOfficer,
        purpose,
        appointmentDate: appointmentDateObj,
        appointmentTime,
        status: "pending",
      })
      .returning();

    // Format tanggal dan jam untuk pesan WA
    const appointmentDateFormatted = appointmentDateObj.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });

    const waMessage =
      `Halo *${guestName}* 👋\n\n` +
      `Permintaan janji temu Anda telah *berhasil dicatat* dan sedang menunggu konfirmasi dari petugas.\n\n` +
      `📅 *Detail Janji Temu:*\n` +
      `• Tanggal  : ${appointmentDateFormatted}\n` +
      `• Jam      : ${appointmentTime} WIB\n` +
      `• Bertemu  : ${intendedOfficer}\n` +
      `• Keperluan: ${purpose}\n` +
      (institutionName ? `• Instansi : ${institutionName}\n` : "") +
      `\n⏳ *Status: Menunggu Konfirmasi*\n` +
      `Anda akan dihubungi kembali jika janji temu telah dikonfirmasi.\n\n` +
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
      message: "Berhasil membuat janji temu.",
      data: {
        id: newEntry.id.toString(), // Convert BigInt to string for JSON serialization
        guestName: newEntry.guestName,
        appointmentDate: newEntry.appointmentDate,
        appointmentTime: newEntry.appointmentTime,
      },
    });
  } catch (error: unknown) {
    console.error("Failed to insert appointment entry:", error);
    const errorMessage = error instanceof Error ? error.message : "Gagal membuat janji temu.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
