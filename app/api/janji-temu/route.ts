import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { verifyTurnstileToken } from "@/lib/turnstile";
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
