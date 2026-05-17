"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";
import { RequestService } from "@/lib/services/request-service";
import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const UpdateStatusSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum([
    "under_review",
    "revision_required",
    "rejected",
    "approved",
    "completed",
    "spam",
  ]),
  notes: z.string().optional(),
});

export async function updateRequestStatusAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const adminProfile = await requireAdmin();

    const validated = UpdateStatusSchema.safeParse({
      requestId: formData.get("requestId"),
      status: formData.get("status"),
      notes: formData.get("notes") || undefined,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { requestId, status, notes = "" } = validated.data;

    await RequestService.updateStatus(requestId, status, notes, adminProfile.id);

    revalidatePath("/track");
    revalidatePath("/");
    await emitRefreshSignal();

    return { success: true, message: "Status pengajuan berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating status:", error);
    return { success: false, error: error.message || "Gagal memperbarui status" };
  }
}

const UploadResultSchema = z.object({
  requestId: z.string().uuid(),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size > 0,
      "File wajib diunggah dan tidak boleh kosong",
    ),
});

export async function uploadResultDocumentAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const adminProfile = await requireAdmin();

    const validated = UploadResultSchema.safeParse({
      requestId: formData.get("requestId"),
      file: formData.get("file"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { requestId, file } = validated.data;

    await RequestService.uploadResult(requestId, file, adminProfile.id);

    revalidatePath("/track");
    revalidatePath("/");
    await emitRefreshSignal();

    return { success: true, message: "Dokumen hasil berhasil diunggah" };
  } catch (error: any) {
    console.error("Error uploading result:", error);
    return {
      success: false,
      error: error.message || "Gagal mengunggah dokumen hasil",
    };
  }
}

const DeleteRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export async function deleteRequestAction(
  formData: FormData,
): Promise<ActionResult> {
  let shouldRedirect = false;
  try {
    const adminProfile = await requireAdmin();

    const validated = DeleteRequestSchema.safeParse({
      requestId: formData.get("requestId"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { requestId } = validated.data;

    await RequestService.deleteRequest(requestId, adminProfile.id);

    revalidatePath("/admin/pengajuan");
    revalidatePath("/admin/dokumen-hasil");
    revalidatePath("/track");
    revalidatePath("/");

    shouldRedirect = true;
  } catch (error: any) {
    console.error("Error deleting request:", error);
    return { success: false, error: error.message || "Gagal menghapus pengajuan" };
  }

  if (shouldRedirect) {
    redirect("/admin/pengajuan");
  }
  return { success: true };
}

const LogActionSchema = z.object({
  logId: z.string(),
  requestId: z.string().uuid(),
});

export async function deleteActivityLogAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const validated = LogActionSchema.safeParse({
      logId: formData.get("logId"),
      requestId: formData.get("requestId"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { logId, requestId } = validated.data;

    await db.delete(activityLogs).where(eq(activityLogs.id, BigInt(logId)));

    revalidatePath(`/admin/pengajuan/${requestId}`);
    revalidatePath("/track");
    revalidatePath("/");

    return { success: true, message: "Log aktivitas berhasil dihapus" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus log" };
  }
}

const UpdateLogSchema = LogActionSchema.extend({
  notes: z.string().optional(),
});

export async function updateActivityLogAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const validated = UpdateLogSchema.safeParse({
      logId: formData.get("logId"),
      requestId: formData.get("requestId"),
      notes: formData.get("notes") || undefined,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { logId, requestId, notes = "" } = validated.data;

    await db
      .update(activityLogs)
      .set({ notes })
      .where(eq(activityLogs.id, BigInt(logId)));

    revalidatePath(`/admin/pengajuan/${requestId}`);
    revalidatePath("/track");
    revalidatePath("/");

    return { success: true, message: "Log aktivitas berhasil diperbarui" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui log" };
  }
}
