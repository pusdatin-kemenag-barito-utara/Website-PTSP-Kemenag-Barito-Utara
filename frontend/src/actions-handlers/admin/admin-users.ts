import { revalidatePath } from "@/lib/next-compat/cache";
import { requirePermission } from "@/lib/auth";
import { z } from "zod";
import { fetchAPI } from "@/lib/api";
import { createAuditLog } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const UpdateUserRoleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum([
    "user",
    "admin_ptsp",
    "kepala_kantor",
    "kasubag_tu",
    "super_admin",
  ]),
});

const UpdateUserStatusSchema = z.object({
  userId: z.string().uuid(),
  isVerified: z.boolean().optional(),
  status: z.string().optional(),
});

const UpdateUserPermissionsSchema = z.object({
  userId: z.string().uuid(),
  permissions: z.array(z.string()),
});

const DeleteUserSchema = z.object({
  userId: z.string().uuid(),
});

export async function updateUserRoleAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const validated = UpdateUserRoleSchema.safeParse({
      id: formData.get("id"),
      role: formData.get("role"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { id, role } = validated.data;

    await fetchAPI(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "UBAH_ROLE_USER",
      entityType: "user",
      entityId: id,
      details: { role },
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Role pengguna berhasil diperbarui" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui role" };
  }
}

export async function updateUserPermissionsAction(
  userId: string,
  permissions: string[],
): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const validated = UpdateUserPermissionsSchema.safeParse({
      userId,
      permissions,
    });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await fetchAPI(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ permissions }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "UBAH_PERMISSIONS_USER",
      entityType: "user",
      entityId: userId,
      details: { permissions },
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Izin akses berhasil diperbarui" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memperbarui izin",
    };
  }
}

export async function verifyStaffAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const validated = UpdateUserStatusSchema.safeParse({
      userId: formData.get("userId"),
      isVerified: true,
    });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { userId } = validated.data;

    await fetchAPI(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified: true }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "VERIFIKASI_STAFF",
      entityType: "user",
      entityId: userId,
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Akun staff berhasil diverifikasi" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memverifikasi staff",
    };
  }
}

export async function deleteUserPermanentlyAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const validated = DeleteUserSchema.safeParse({
      userId: formData.get("userId"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { userId } = validated.data;

    // Bersihkan akun otentikasi di Supabase Auth
    try {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(userId);
    } catch (e) {
      console.warn("Gagal hapus Supabase Auth user:", e);
    }

    await fetchAPI(`/admin/users/${userId}`, {
      method: "DELETE",
    });

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_USER_PERMANEN",
      entityType: "user",
      entityId: userId,
    });

    revalidatePath("/admin/pengguna");
    return {
      success: true,
      message: "Pengguna berhasil dihapus secara permanen",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menghapus pengguna",
    };
  }
}

export async function deletePemohonPermanentlyAction(
  pemohonId: string,
  authUserId?: string,
  email?: string,
): Promise<ActionResult> {
  const profile = await requirePermission("pengguna");
  try {
    const admin = createAdminClient();

    // 1. Hapus akun dari Supabase Auth (auth.users)
    let authDeleted = false;
    const targetUserId = (authUserId || "").trim();
    if (targetUserId) {
      try {
        const { error: delAuthErr } = await admin.auth.admin.deleteUser(targetUserId);
        if (!delAuthErr) {
          authDeleted = true;
        } else {
          console.warn("deleteUser by ID error:", delAuthErr.message);
        }
      } catch (authErr) {
        console.warn("Gagal hapus user di Supabase Auth via ID:", authErr);
      }
    }

    // Fallback: jika belum terhapus via ID dan ada email, cari di auth.users lalu hapus
    const targetEmail = (email || "").trim().toLowerCase();
    if (!authDeleted && targetEmail) {
      try {
        const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
        const found = listData?.users?.find(
          (u) => u.email?.toLowerCase() === targetEmail,
        );
        if (found) {
          await admin.auth.admin.deleteUser(found.id);
        }
      } catch (authErr) {
        console.warn("Gagal hapus user di Supabase Auth via email:", authErr);
      }
    }

    // 2. Hapus data dari Database PostgreSQL via Golang Backend
    const res = await fetchAPI<any>(`/admin/users/pemohon/${pemohonId}`, {
      method: "DELETE",
    });

    if (res && res.success === false) {
      return {
        success: false,
        error: res.error || "Gagal menghapus data pemohon di database",
      };
    }

    // 3. Catat audit log aktivitas admin
    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_PEMOHON_PERMANEN",
      entityType: "pemohon",
      entityId: pemohonId,
    });

    revalidatePath("/admin/pengguna");
    return {
      success: true,
      message: "Data pemohon dan akun otentikasi berhasil dihapus permanen secara bersih",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menghapus pemohon",
    };
  }
}

export async function impersonatePegawaiAction(nip: string): Promise<any> {
  const profile = await requirePermission("super_admin");
  try {
    const cleanNip = (nip || "").trim();
    if (!cleanNip) {
      return { success: false, error: "NIP wajib diisi." };
    }

    const res = await fetchAPI<any>("/admin/impersonate", {
      method: "POST",
      body: JSON.stringify({ nip: cleanNip }),
    });

    if (res?.success) {
      await createAuditLog({
        adminId: profile.id,
        action: "IMPERSONATE_PEGAWAI",
        entityType: "pegawai",
        entityId: cleanNip,
      });
    }

    return res;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menghubungkan ke server kepegawaian.",
    };
  }
}

