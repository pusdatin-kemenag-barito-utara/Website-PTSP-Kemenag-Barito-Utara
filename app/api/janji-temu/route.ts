import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { verifyTurnstileToken } from "@/lib/turnstile";
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
