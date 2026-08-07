import { sanitizeFilename } from "@/lib/utils";
import { uploadToR2 } from "@/lib/r2";

export function isAllowedExtension(
  fileName: string,
  allowedExtensions: string,
) {
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
    const safeRequirementName = sanitizeFilename(
      requirement.documentName,
    ).replace(/\s+/g, "_");

    const finalFileName = `${safeRequirementName}_${originalFileName}`;
    const r2Path = `requests/${safeUserName}_${user.id.substring(0, 5)}/${requestNumber}/${finalFileName}`;
    await uploadToR2(file, r2Path);
  });

  await Promise.all(uploadPromises);
}
