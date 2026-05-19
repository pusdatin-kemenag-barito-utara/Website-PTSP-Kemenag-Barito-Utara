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

    // Basic security: check if user is logged in
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a signed URL that expires in 1 hour
    const signedUrl = await getR2SignedUrl(path, 3600);

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error: any) {
    console.error("Error serving R2 file:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
