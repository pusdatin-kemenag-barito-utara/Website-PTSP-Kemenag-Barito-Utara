export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";

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

    const res = await fetchAPI(`/admin/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json({ success: true, data: res });
  } catch (error: any) {
    console.error("Error updating answers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update answers" },
      { status: 500 },
    );
  }
}
