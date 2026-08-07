import { NextResponse } from "next/server";
import { fetchAPI } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ requests: [], profiles: [], services: [], auditLogs: [] });
    }

    const res = await fetchAPI<any>(`/admin/search?q=${encodeURIComponent(q)}`);
    return NextResponse.json(res.data || res);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
