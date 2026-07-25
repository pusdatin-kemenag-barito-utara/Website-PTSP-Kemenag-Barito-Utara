import { db } from "@/lib/db";
import { guestBook } from "@/lib/db/schema";
import { verifyTurnstileToken } from "@/lib/turnstile";
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

