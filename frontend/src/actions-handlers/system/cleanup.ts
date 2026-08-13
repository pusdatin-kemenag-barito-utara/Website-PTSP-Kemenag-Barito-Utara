import { requirePermission } from "@/lib/auth";
import { revalidatePath } from "@/lib/next-compat/cache";
import { SystemService } from "@/lib/services/system-service";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};

/**
 * Membersihkan file permohonan (Requirements) yang sudah berumur > 3 bulan
 * dan statusnya sudah COMPLETED.
 */
export async function cleanupOldStorageAction(): Promise<ActionResult> {
  try {
    const adminProfile = await requirePermission("super_admin");

    const result = await SystemService.cleanupOldStorage(adminProfile.id);

    revalidatePath("/admin");
    return {
      success: true,
      message: `Pembersihan selesai. ${result.count} file dari ${result.affectedRequests} pengajuan telah dihapus.`,
      data: result,
    };
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return { success: false, error: error.message || "Gagal menjalankan pembersihan" };
  }
}

/**
 * Mendapatkan estimasi jumlah file yang bisa dibersihkan
 */
export async function getCleanupStats(): Promise<{ eligibleRequests: number }> {
  try {
    await requirePermission("super_admin");
    const result = await SystemService.cleanupOldStorage("");
    return { eligibleRequests: result.affectedRequests || 0 };
  } catch (error) {
    return { eligibleRequests: 0 };
  }
}
