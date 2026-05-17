export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { RequestService } from "@/lib/services/request-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await requireAuth();
    const { id } = await params;
    const formData = await request.formData();

    await RequestService.updateByApplicant({
      requestId: id,
      userId: profile.id,
      formData,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[update] Unhandled error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Error" },
      { status: 500 },
    );
  }
}
