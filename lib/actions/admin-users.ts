"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateUserRoleAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const role = String(formData.get("role")) as any;
  
  await prisma.profiles.update({
    where: { id },
    data: { role },
  });
  
  revalidatePath("/admin/pengguna");
}

export async function updateUserPermissionsAction(
  userId: string,
  permissions: string[],
) {
  await requireAdmin();

  await prisma.profiles.update({
    where: { id: userId },
    data: { permissions },
  });

  revalidatePath("/admin/pengguna");
}

export async function deleteUserPermanentlyAction(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  if (!userId) throw new Error("ID User tidak valid");

  // 1. Dapatkan semua ID Pengajuan milik user ini
  const requests = await prisma.service_requests.findMany({
    where: { user_id: userId },
    select: { id: true },
  });

  const requestIds = requests.map((r) => r.id);

  if (requestIds.length > 0) {
    // 2. Cari SEMUA file Google Drive terkait pengajuan user ini
    const [reqDocs, genDocs] = await Promise.all([
      prisma.service_request_documents.findMany({
        where: { request_id: { in: requestIds } },
        select: { file_path: true },
      }),
      prisma.generated_documents.findMany({
        where: { request_id: { in: requestIds } },
        select: { file_path: true },
      }),
    ]);

    // 3. Hapus file-file tersebut dari Google Drive
    const { deleteFromDrive } = await import("@/lib/google-drive");
    const combinedPaths = [
      ...reqDocs.map((d) => d.file_path),
      ...genDocs.map((d) => d.file_path),
    ];

    for (const path of combinedPaths) {
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

  // 5. Hapus data di tabel profiles (Prisma akan menangani cascade jika dikonfigurasi di DB, 
  // tapi kita lakukan eksplisit untuk keamanan)
  await prisma.profiles.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/pengguna");
  return { success: true };
}
