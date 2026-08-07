import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Keamanan sederhana: Pastikan webhook berasal dari Google Sheet Anda
    // Anda bisa mengubah secret ini nanti jika ingin lebih aman
    if (body.secret !== "PTSP_BARUT_CUTI_SYNC_2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Menghapus cache lama berdasarkan tag
    revalidateTag("cuti-data", "max");
    
    console.log("[Webhook] Sinkronisasi data cuti berhasil dipicu oleh Google Sheet.");
    return NextResponse.json({ success: true, message: "Cache cuti-data berhasil diperbarui!" });
  } catch (error) {
    console.error("[Webhook] Error revalidating:", error);
    return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 });
  }
}
