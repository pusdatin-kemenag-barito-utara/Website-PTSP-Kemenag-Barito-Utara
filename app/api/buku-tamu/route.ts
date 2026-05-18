import { db } from "@/lib/db";
import { guestBook } from "@/lib/db/schema";
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
