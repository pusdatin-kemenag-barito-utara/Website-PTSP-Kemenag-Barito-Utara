"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { services as servicesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { isSuperAdmin as isEmailSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";
import { LayananService } from "@/lib/services/layanan-service";

const serviceSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  roleOwner: z.string().nullable().optional(),
});

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};

// --- SERVICES ---
export async function createServiceAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("super_admin");

    const validated = serviceSchema.safeParse({
      name: formData.get("name"),
      slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
      description: formData.get("description") || "",
      isActive: formData.get("isActive") === "on",
      roleOwner: formData.get("roleOwner") ? String(formData.get("roleOwner")) : null,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await LayananService.createService(validated.data);

    revalidatePath("/admin/layanan");
    revalidatePath("/layanan");
    await emitRefreshSignal();

    return { success: true, message: "Layanan berhasil dibuat" };
  } catch (error: any) {
    console.error("Error creating service:", error);
    return { success: false, error: error.message || "Gagal membuat layanan" };
  }
}

export async function updateServiceAction(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAdmin();
    const isSuper = isEmailSuperAdmin(profile.email);
    
    const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
    const isGeneralAdmin = specificRole === "admin_ptsp";
    const id = BigInt(formData.get("id") as string);

    if (!isSuper && !isGeneralAdmin) {
      const service = await db.query.services.findFirst({
        where: eq(servicesTable.id, id),
        columns: { roleOwner: true },
      });
      if (service?.roleOwner !== specificRole) {
        return { success: false, error: "Unauthorized" };
      }
    }

    const validated = serviceSchema.safeParse({
      name: formData.get("name"),
      slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
      description: formData.get("description") || "",
      isActive: formData.get("isActive") === "on",
      roleOwner: formData.get("roleOwner") ? String(formData.get("roleOwner")) : null,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await LayananService.updateService(id, validated.data);

    revalidatePath("/admin/layanan");
    revalidatePath("/layanan");
    await emitRefreshSignal();

    return { success: true, message: "Layanan berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating service:", error);
    return { success: false, error: error.message || "Gagal memperbarui layanan" };
  }
}

export async function deleteServiceAction(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAdmin();
    const isSuper = isEmailSuperAdmin(profile.email);
    
    const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
    const isGeneralAdmin = specificRole === "admin_ptsp";
    const id = BigInt(formData.get("id") as string);

    if (!isSuper && !isGeneralAdmin) {
      const service = await db.query.services.findFirst({
        where: eq(servicesTable.id, id),
        columns: { roleOwner: true },
      });
      if (service?.roleOwner !== specificRole) {
        return { success: false, error: "Unauthorized" };
      }
    }

    await LayananService.deleteService(id);

    revalidatePath("/admin/layanan");
    revalidatePath("/layanan");
    await emitRefreshSignal();

    return { success: true, message: "Layanan berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return { success: false, error: error.message || "Gagal menghapus layanan" };
  }
}

export async function reorderServicesAction(ids: number[]): Promise<ActionResult> {
  try {
    await requirePermission("super_admin");

    await LayananService.reorderServices(ids);

    revalidatePath("/admin/layanan");
    revalidatePath("/layanan");
    await emitRefreshSignal();

    return { success: true, message: "Urutan layanan berhasil disimpan" };
  } catch (error: any) {
    console.error("Error reordering services:", error);
    return { success: false, error: error.message || "Gagal mengubah urutan layanan" };
  }
}
