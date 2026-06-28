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
import { createAuditLog } from "@/lib/audit";
import { promises as fs } from "fs";
import path from "path";

const serviceSchema = z.object({
  name: z.string().min(3, "Nama layanan minimal 3 karakter"),
  slug: z.string().min(3),
  description: z.string().optional(),
  isActive: z.boolean(),
  roleOwner: z.string().optional().nullable(),
  category: z.string().optional(),
  requirementsText: z.string().optional().nullable(),
  sopUrl: z.string().optional().nullable(),
  requestCode: z.string().optional().nullable(),
});

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};

async function handleBannerUpload(file: File | null, slug: string) {
  if (!file || file.size === 0) return;
  const buffer = Buffer.from(await file.arrayBuffer());
  const bannerDir = path.join(process.cwd(), "public", "banners");
  await fs.mkdir(bannerDir, { recursive: true });
  const filePath = path.join(bannerDir, `${slug}.png`);
  await fs.writeFile(filePath, buffer);
}

// --- SERVICES ---
export async function createServiceAction(formData: FormData): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const validated = serviceSchema.safeParse({
      name: formData.get("name"),
      slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
      description: formData.get("description") || "",
      isActive: formData.get("isActive") === "on",
      roleOwner: formData.get("roleOwner") ? String(formData.get("roleOwner")) : null,
      category: formData.get("category") ? String(formData.get("category")) : "public",
      requirementsText: formData.get("requirementsText") ? String(formData.get("requirementsText")) : null,
      sopUrl: formData.get("sopUrl") ? String(formData.get("sopUrl")) : null,
      requestCode: formData.get("requestCode") ? String(formData.get("requestCode")) : null,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await LayananService.createService(validated.data);
    
    // Handle Banner Upload
    const bannerFile = formData.get("banner") as File | null;
    await handleBannerUpload(bannerFile, validated.data.slug);

    await createAuditLog({
      adminId: profile.id,
      action: "BUAT_LAYANAN",
      entityType: "service",
      entityId: validated.data.name,
      details: { nama: validated.data.name, slug: validated.data.slug, roleOwner: validated.data.roleOwner },
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/admin/layanan-asn");
    revalidatePath("/layanan");
    revalidatePath("/layanan-pegawai");
    await emitRefreshSignal();

    return { success: true, message: "Layanan berhasil dibuat" };
  } catch (error: any) {
    console.error("Error creating service:", error);
    return { success: false, error: error.message || "Gagal membuat layanan" };
  }
}

export async function updateServiceAction(formData: FormData): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
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
      category: formData.get("category") ? String(formData.get("category")) : "public",
      requirementsText: formData.get("requirementsText") ? String(formData.get("requirementsText")) : null,
      sopUrl: formData.get("sopUrl") ? String(formData.get("sopUrl")) : null,
      requestCode: formData.get("requestCode") ? String(formData.get("requestCode")) : null,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await LayananService.updateService(id, validated.data);

    // Handle Banner Upload
    const bannerFile = formData.get("banner") as File | null;
    await handleBannerUpload(bannerFile, validated.data.slug);

    await createAuditLog({
      adminId: profile.id,
      action: "UPDATE_LAYANAN",
      entityType: "service",
      entityId: id.toString(),
      details: { nama: validated.data.name, slug: validated.data.slug, roleOwner: validated.data.roleOwner },
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/admin/layanan-asn");
    revalidatePath("/layanan");
    revalidatePath("/layanan-pegawai");
    await emitRefreshSignal();

    return { success: true, message: "Layanan berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating service:", error);
    return { success: false, error: error.message || "Gagal memperbarui layanan" };
  }
}

export async function deleteServiceAction(formData: FormData): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
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

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_LAYANAN",
      entityType: "service",
      entityId: id.toString(),
      details: { serviceId: id.toString() },
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/layanan");
    await emitRefreshSignal();

    return { success: true, message: "Layanan berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return { success: false, error: error.message || "Gagal menghapus layanan" };
  }
}

export async function reorderServicesAction(ids: (number | bigint | string)[]): Promise<ActionResult> {
  await requirePermission("super_admin");
  try {
    const bigintIds = ids.map(id => BigInt(id));
    await LayananService.reorderServices(bigintIds);

    revalidatePath("/admin/layanan");
    revalidatePath("/layanan");
    await emitRefreshSignal();

    return { success: true, message: "Urutan layanan berhasil disimpan" };
  } catch (error: any) {
    console.error("Error reordering services:", error);
    return { success: false, error: error.message || "Gagal mengubah urutan layanan" };
  }
}
