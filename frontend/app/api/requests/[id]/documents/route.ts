export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: requestId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Belum login." }, { status: 401 });
    }

    const formData = await request.formData();
    const requirementId = formData.get("requirementId") as string;
    const file = formData.get("file") as File | null;

    if (!requirementId || !file) {
      return NextResponse.json(
        { error: "Data unggahan tidak lengkap." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dokumen berhasil diunggah.",
      data: { requestId, requirementId, name: file.name },
    });
  } catch (error: any) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengunggah dokumen." },
      { status: 500 },
    );
  }
}
