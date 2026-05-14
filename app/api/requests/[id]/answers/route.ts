import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const requestId = id;

    // Verify ownership and status
    const reqData = await prisma.service_requests.findUnique({
      where: { 
        id: requestId,
        user_id: profile.id,
      },
      select: { id: true, status: true },
    });

    if (!reqData) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      !["submitted", "under_review", "revision_required"].includes(
        reqData.status,
      )
    ) {
      return NextResponse.json(
        { error: "Status pengajuan saat ini tidak dapat diubah." },
        { status: 400 },
      );
    }

    // Update each answer and log activity in transaction
    await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        await tx.service_request_answers.updateMany({
          where: {
            id: BigInt(update.id),
            request_id: requestId,
          },
          data: {
            field_value: update.field_value,
          },
        });
      }

      await tx.activity_logs.create({
        data: {
          request_id: requestId,
          actor_id: profile.id,
          action: "Pemohon memperbarui data formulir",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating answers:", err);
    return NextResponse.json(
      { error: err.message || "Internal Error" },
      { status: 500 },
    );
  }
}
