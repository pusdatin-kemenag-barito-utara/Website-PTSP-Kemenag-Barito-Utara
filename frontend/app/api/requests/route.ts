import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAPI } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await fetchAPI<any>("/requests", {
      method: "POST",
      body: JSON.stringify({ userId: user.id }),
    });

    return NextResponse.json({ 
      id: result.id || "1",
      requestNumber: result.requestNumber || "REQ-001" 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal membuat pengajuan." },
      { status: 500 },
    );
  }
}
