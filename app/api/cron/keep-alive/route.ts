import { db } from "@/lib/db";
import { systemStatus } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verifikasi Secret Key dari Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Lakukan update atau insert ke tabel system_status
    // Ini akan men-trigger aktivitas di database Supabase
    await db
      .insert(systemStatus)
      .values({
        id: "heartbeat",
        lastPing: new Date(),
        notes: "Automatic keep-alive from Vercel Cron",
      })
      .onConflictDoUpdate({
        target: systemStatus.id,
        set: {
          lastPing: new Date(),
        },
      });

    console.log("Heartbeat sent to Supabase successfully.");

    return NextResponse.json({
      success: true,
      message: "Database heartbeat successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Failed to send heartbeat:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
