import { NextResponse } from "next/server";
import { getR2SignedUrl, isR2Path } from "@/lib/r2";
import { getCurrentProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { serviceRequestDocuments, generatedDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAdminRole, isSuperAdmin } from "@/lib/constants";

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

    // Authorization & Ownership Verification
    const isUserAdmin = isAdminRole(profile.role) || isSuperAdmin(profile.email);
    if (!isUserAdmin) {
      // Find if this path exists in serviceRequestDocuments
      const doc = await db.query.serviceRequestDocuments.findFirst({
        where: eq(serviceRequestDocuments.filePath, path),
        with: {
          request: true,
        },
      });

      let hasAccess = false;
      if (doc && doc.request && doc.request.userId === profile.id) {
        hasAccess = true;
      }

      if (!hasAccess) {
        // Check if this path exists in generatedDocuments
        const genDoc = await db.query.generatedDocuments.findFirst({
          where: eq(generatedDocuments.filePath, path),
          with: {
            request: true,
          },
        });
        if (genDoc && genDoc.request && genDoc.request.userId === profile.id) {
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden - You do not have permission to access this file" }, { status: 403 });
      }
    }

    // Stream file contents directly from R2 to bypass iframe x-frame-options / CORS blocks
    const key = path.replace("r2:", "");
    const { getR2Object } = await import("@/lib/r2");
    const r2Object = await getR2Object(key);

    if (!r2Object.Body) {
      return NextResponse.json({ error: "File body is empty" }, { status: 404 });
    }

    const contentType = r2Object.ContentType || "application/pdf";
    const bytes = await r2Object.Body.transformToByteArray();
    const buffer = Buffer.from(bytes);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${key.split("/").pop() || "document"}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Error serving R2 file:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
