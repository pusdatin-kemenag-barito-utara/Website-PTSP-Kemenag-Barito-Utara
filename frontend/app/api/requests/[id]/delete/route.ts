import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { RequestService } from "@/lib/services/request-service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    await RequestService.deleteByApplicant(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Error" },
      { status: 500 },
    );
  }
}
