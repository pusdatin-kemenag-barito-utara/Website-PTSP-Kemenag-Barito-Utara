import { NextResponse } from "next/server";
import { fetchAPI } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret") || "";
    const res = await fetchAPI<any>(`/cron/cleanup-documents?secret=${encodeURIComponent(secret)}`);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to run cron" }, { status: 500 });
  }
}
