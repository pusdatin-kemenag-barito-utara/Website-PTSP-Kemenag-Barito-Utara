"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateUserRoleAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = String(formData.get("id"));
  const role = String(formData.get("role"));
  await admin.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin/pengguna");
}

export async function updateUserPermissionsAction(
  userId: string,
  permissions: string[],
) {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ permissions })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/pengguna");
}

export async function deleteUserPermanentlyAction(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  if (!userId) throw new Error("ID User tidak valid");

  // 1. Dapatkan semua ID Pengajuan milik user ini
  const { data: requests } = await admin
    .from("service_requests")
    .select("id")
    .eq("user_id", userId);

  const requestIds = (requests || []).map((r) => r.id);

  if (requestIds.length > 0) {
    // 2. Cari SEMUA file Google Drive terkait pengajuan user ini
    const [{ data: reqDocs }, { data: genDocs }] = await Promise.all([
      admin
        .from("service_request_documents")
        .select("file_path")
        .in("request_id", requestIds),
      admin
        .from("generated_documents")
        .select("file_path")
        .in("request_id", requestIds),
    ]);

    // 3. Hapus file-file tersebut dari Google Drive
    const { deleteFromDrive } = await import("@/lib/google-drive");
    const allFilePaths = [
      ...(reqDocs || []).map((d) => d.file_path),
      ...(genDocs || []).map((d) => d.file_path),
    ];

    for (const path of allFilePaths) {
      if (path?.startsWith("gdrive:")) {
        const fileId = path.replace("gdrive:", "");
        try {
          await deleteFromDrive(fileId);
        } catch (err) {
          console.error(`Gagal menghapus file ${fileId}:`, err);
        }
      }
    }
  }

  // 4. Hapus user dari Supabase Auth
  const { error: authError } = await admin.auth.admin.deleteUser(userId);

  if (authError) {
    throw new Error(`Gagal menghapus akun auth: ${authError.message}`);
  }

  // 5. Pastikan data di tabel profiles juga terhapus
  await admin.from("profiles").delete().eq("id", userId);

  revalidatePath("/admin/pengguna");
  return { success: true };
}
