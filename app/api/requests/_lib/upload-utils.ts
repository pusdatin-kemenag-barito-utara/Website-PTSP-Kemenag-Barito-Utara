import { sanitizeFilename } from "@/lib/utils";
import { uploadToR2 } from "@/lib/r2";
import { db } from "@/lib/db";
import { serviceRequestDocuments as serviceRequestDocumentsTable } from "@/lib/db/schema";

export function isAllowedExtension(fileName: string, allowedExtensions: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const allowed = allowedExtensions
    .split(",")
    .map((item: string) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(extension);
}

export async function handleRequestUploads({
  formData,
  requirements,
  user,
  fullName,
  requestId,
  requestNumber,
}: {
  formData: FormData;
  requirements: any[];
  user: { id: string };
  fullName: string;
  requestId: string;
  requestNumber: string;
}) {
  const safeUserName = sanitizeFilename(fullName || "User").replace(
    /\s+/g,
    "_",
  );

  const uploadPromises = (requirements ?? []).map(async (requirement) => {
    const file = formData.get(`requirement_${requirement.id}`) as File | null;
    if (!file || file.size === 0) return;

    const originalFileName = sanitizeFilename(file.name);
    const safeRequirementName = sanitizeFilename(requirement.documentName).replace(
      /\s+/g,
      "_",
    );

    // Nama file yang rapi: [NAMA_SYARAT]_[NAMA_ASLI]
    const finalFileName = `${safeRequirementName}_${originalFileName}`;

    // Upload ke Cloudflare R2
    const r2Path = `requests/${safeUserName}_${user.id.substring(0, 5)}/${requestNumber}/${finalFileName}`;
    const { path: storagePath } = await uploadToR2(file, r2Path);

    await db
      .insert(serviceRequestDocumentsTable)
      .values({
        requestId: requestId,
        requirementId: requirement.id,
        fileName: finalFileName,
        filePath: storagePath || "",
        fileType: file.type || "application/octet-stream",
        fileSize: BigInt(file.size),
      })
      .onConflictDoUpdate({
        target: [
          serviceRequestDocumentsTable.requestId,
          serviceRequestDocumentsTable.requirementId,
        ],
        set: {
          fileName: finalFileName,
          filePath: storagePath || "",
          fileType: file.type || "application/octet-stream",
          fileSize: BigInt(file.size),
        },
      });
  });

  await Promise.all(uploadPromises);
}
