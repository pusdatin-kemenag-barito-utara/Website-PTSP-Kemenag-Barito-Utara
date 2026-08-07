import { NextResponse } from "next/server";
import { fetchAPI } from "@/lib/api";

export async function GET() {
  try {
    const res = await fetchAPI<any>("/cron/keep-alive");
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to run keep-alive" }, { status: 500 });
  }
}
