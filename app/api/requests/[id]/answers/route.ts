export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  serviceRequests as serviceRequestsTable,
  serviceRequestAnswers as serviceRequestAnswersTable,
  activityLogs as activityLogsTable,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const requestId = id;

    // Verify ownership and status
    const reqData = await db.query.serviceRequests.findFirst({
      where: and(
        eq(serviceRequestsTable.id, requestId),
        eq(serviceRequestsTable.userId, profile.id),
      ),
      columns: { id: true, status: true },
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
    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx
          .update(serviceRequestAnswersTable)
          .set({ fieldValue: update.field_value })
          .where(
            and(
              eq(serviceRequestAnswersTable.id, BigInt(update.id)),
              eq(serviceRequestAnswersTable.requestId, requestId),
            ),
          );
      }

      await tx.insert(activityLogsTable).values({
        requestId: requestId,
        actorId: profile.id,
        action: "Pemohon memperbarui data formulir",
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
