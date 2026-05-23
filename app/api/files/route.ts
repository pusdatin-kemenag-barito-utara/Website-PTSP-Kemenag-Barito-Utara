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

    // Generate a signed URL that expires in 1 hour
    const signedUrl = await getR2SignedUrl(path, 3600);

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error: any) {
    console.error("Error serving R2 file:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
