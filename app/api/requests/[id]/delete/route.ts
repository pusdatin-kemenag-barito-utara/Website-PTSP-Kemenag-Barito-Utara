import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { RequestService } from "@/lib/services/request-service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await requireAuth();
    const { id } = await params;

    await RequestService.deleteByApplicant(id, profile.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Error" },
      { status: 500 },
    );
  }
}
