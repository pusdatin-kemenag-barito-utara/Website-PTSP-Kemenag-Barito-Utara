import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { SystemService } from "@/lib/services/system-service";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await SystemService.getStorageStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
