import { revalidatePath } from "@/lib/next-compat/cache";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { fetchAPI } from "@/lib/api";
import { deleteFromR2, isR2Path } from "@/lib/r2";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const UpdateStatusSchema = z.object({
  requestId: z.string().uuid(),
  status: z.string(),
  notes: z.string().optional(),
});

export async function updateRequestStatusAction(
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    const validated = UpdateStatusSchema.safeParse({
      requestId: formData.get("requestId"),
      status: formData.get("status"),
      notes: formData.get("notes") || undefined,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { requestId, status, notes = "" } = validated.data;

    await fetchAPI(`/admin/requests/${requestId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        notes,
        revisionNote: status === "revision_required" ? notes : "",
        rejectionReason: status === "rejected" ? notes : "",
        reviewerId: admin.id,
        reviewerName: admin.fullName || admin.name || "Petugas PTSP",
      }),
    });

    revalidatePath("/admin/pengajuan");
    revalidatePath(`/admin/pengajuan/${requestId}`);

    return { success: true, message: "Status keputusan berhasil diperbarui" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui status" };
  }
}

const DeleteRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export async function deleteRequestAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  try {
    const validated = DeleteRequestSchema.safeParse({
      requestId: formData.get("requestId"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { requestId } = validated.data;

    // Eksekusi penghapusan di backend (menghapus database seketika dan membersihkan R2 secara asinkron di background)
    await fetchAPI(`/admin/requests/${requestId}`, {
      method: "DELETE",
    });

    revalidatePath("/admin/pengajuan");
    return { success: true, message: "Pengajuan dan seluruh berkas file berhasil dihapus permanen" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus pengajuan" };
  }
}

// TODO: Implementasi notifikasi WhatsApp (integrasi dengan WhatsApp API / layanan pihak ketiga)
export async function sendResultWhatsAppAction(
  _formData: FormData,
): Promise<ActionResult> {
  return { success: true, message: "Notifikasi dikirim" };
}

// TODO: Implementasi upload dokumen hasil (Supabase Storage bucket: generated-documents)
export async function uploadResultDocumentAction(
  _formData: FormData,
): Promise<ActionResult> {
  return { success: true, message: "Dokumen berhasil diunggah" };
}

// TODO: Implementasi activity log update via endpoint backend
export async function updateActivityLogAction(
  _formData: FormData,
): Promise<ActionResult> {
  return { success: true, message: "Log berhasil diperbarui" };
}

// TODO: Implementasi activity log delete via endpoint backend
export async function deleteActivityLogAction(
  _formData: FormData,
): Promise<ActionResult> {
  return { success: true, message: "Log berhasil dihapus" };
}
