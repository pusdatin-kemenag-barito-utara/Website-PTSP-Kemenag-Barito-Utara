import { NextResponse } from "next/server";
import { getR2SignedUrl, isR2Path } from "@/lib/r2";
import { getCurrentProfile } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path || !isR2Path(path)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signedUrl = await getR2SignedUrl(path);

    if (!signedUrl) {
      return NextResponse.json({ error: "Failed to generate file access link" }, { status: 500 });
    }

    return NextResponse.redirect(signedUrl);
  } catch (error: any) {
    console.error("Error in /api/files:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
