import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
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
      appointmentDate,
      appointmentTime,
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
    if (
      !guestName ||
      !whatsapp ||
      !institutionType ||
      !intendedOfficer ||
      !purpose ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Semua kolom wajib diisi termasuk Tanggal Rencana dan Jam Bertamu.",
        },
        { status: 400 }
      ) as any;
    }

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
        appointmentDate,
        appointmentTime,
        status: "pending",
      })
      .returning();

    // Format tanggal dan jam untuk pesan WA
    const [year, month, day] = appointmentDate.split("-");
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    const appointmentDateFormatted = dateObj.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const waMessage =
      `Halo *${guestName}* 👋\n\n` +
      `Permintaan janji temu Anda telah *berhasil dicatat* dan sedang menunggu konfirmasi dari petugas.\n\n` +
      `📅 *Detail Janji Temu:*\n` +
      `• Tanggal  : ${appointmentDateFormatted}\n` +
      `• Jam      : ${appointmentTime} WITA\n` +
      `• Bertemu  : ${intendedOfficer}\n` +
      `• Keperluan: ${purpose}\n` +
      (institutionName ? `• Instansi : ${institutionName}\n` : "") +
      `\n⏳ *Status: Menunggu Konfirmasi*\n` +
      `Anda akan dihubungi kembali jika janji temu telah dikonfirmasi.\n\n` +
      `_Pelayanan Terpadu Satu Pintu (PTSP)_\n` +
      `_Kemenag Kabupaten Barito Utara_`;

    // Jalankan tanpa await agar tidak memperlambat response ke user
    sendWhatsAppNotification(whatsapp, waMessage).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Berhasil membuat janji temu.",
      data: {
        id: newEntry.id.toString(), // Convert BigInt to string for JSON serialization
        guestName: newEntry.guestName,
        appointmentDate: newEntry.appointmentDate,
        appointmentTime: newEntry.appointmentTime,
      },
    }) as any;
  } catch (error: any) {
    console.error("Failed to insert appointment entry:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat janji temu." },
      { status: 500 }
    ) as any;
  }
}

