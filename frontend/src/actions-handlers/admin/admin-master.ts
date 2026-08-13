import { revalidatePath } from "@/lib/next-compat/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";
import { createAuditLog } from "@/lib/audit";
import { fetchAPI } from "@/lib/api";
import { promises as fs } from "fs";
import fsSync from "fs";
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
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const bannerDir = path.join(process.cwd(), "public", "banners");
    await fs.mkdir(bannerDir, { recursive: true });
    const filePath = path.join(bannerDir, `${slug}.png`);
    await fs.writeFile(filePath, buffer);
  } catch (err) {
    console.error("Banner upload handling warning:", err);
  }
}

// --- SERVICES ---

export async function createServiceAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const validated = serviceSchema.safeParse({
      name: formData.get("name"),
      slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
      description: formData.get("description") || "",
      isActive: formData.get("isActive") === "on",
      roleOwner: formData.get("roleOwner")
        ? String(formData.get("roleOwner"))
        : null,
      category: formData.get("category")
        ? String(formData.get("category"))
        : "public",
      requirementsText: formData.get("requirementsText")
        ? String(formData.get("requirementsText"))
        : null,
      sopUrl: formData.get("sopUrl") ? String(formData.get("sopUrl")) : null,
      requestCode: formData.get("requestCode")
        ? String(formData.get("requestCode"))
        : null,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await fetchAPI("/admin/services", {
      method: "POST",
      body: JSON.stringify({
        name: validated.data.name,
        slug: validated.data.slug,
        description: validated.data.description ?? "",
        category: validated.data.category ?? "public",
        roleOwner: validated.data.roleOwner ?? "",
        requirementsText: validated.data.requirementsText ?? "",
        sopUrl: validated.data.sopUrl ?? "",
        requestCode: validated.data.requestCode ?? "",
        sortOrder: 0,
      }),
    });

    // Handle Banner Upload
    const bannerFile = formData.get("banner") as File | null;
    await handleBannerUpload(bannerFile, validated.data.slug);

    await createAuditLog({
      adminId: profile.id,
      action: "BUAT_LAYANAN",
      entityType: "service",
      entityId: validated.data.name,
      details: {
        nama: validated.data.name,
        slug: validated.data.slug,
        roleOwner: validated.data.roleOwner,
      },
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

export async function updateServiceAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID tidak ditemukan" };

    const validated = serviceSchema.safeParse({
      name: formData.get("name"),
      slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
      description: formData.get("description") || "",
      isActive: formData.get("isActive") === "on",
      roleOwner: formData.get("roleOwner")
        ? String(formData.get("roleOwner"))
        : null,
      category: formData.get("category")
        ? String(formData.get("category"))
        : "public",
      requirementsText: formData.get("requirementsText")
        ? String(formData.get("requirementsText"))
        : null,
      sopUrl: formData.get("sopUrl") ? String(formData.get("sopUrl")) : null,
      requestCode: formData.get("requestCode")
        ? String(formData.get("requestCode"))
        : null,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await fetchAPI(`/admin/services/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: validated.data.name,
        description: validated.data.description ?? "",
        category: validated.data.category ?? "public",
        roleOwner: validated.data.roleOwner ?? "",
        role_owner: validated.data.roleOwner ?? "",
        requirementsText: validated.data.requirementsText ?? "",
        sopUrl: validated.data.sopUrl ?? "",
        requestCode: validated.data.requestCode ?? "",
        isActive: validated.data.isActive,
        is_active: validated.data.isActive,
      }),
    });

    // Handle Banner Upload & Slug Rename File Copy
    const bannerFile = formData.get("banner") as File | null;
    const oldSlug = formData.get("oldSlug") as string | null;
    const newSlug = validated.data.slug;

    if (bannerFile && bannerFile.size > 0) {
      await handleBannerUpload(bannerFile, newSlug);
    } else if (oldSlug && oldSlug !== newSlug) {
      const bannerDir = path.join(process.cwd(), "public", "banners");
      const oldPath = path.join(bannerDir, `${oldSlug}.png`);
      const newPath = path.join(bannerDir, `${newSlug}.png`);
      try {
        if (fsSync.existsSync(oldPath)) {
          await fs.copyFile(oldPath, newPath);
        }
      } catch (err) {
        console.error("Failed to copy banner file for renamed slug:", err);
      }
    }

    await createAuditLog({
      adminId: profile.id,
      action: "UPDATE_LAYANAN",
      entityType: "service",
      entityId: id.toString(),
      details: {
        nama: validated.data.name,
        slug: validated.data.slug,
        roleOwner: validated.data.roleOwner,
      },
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/admin/layanan-asn");
    revalidatePath("/layanan");
    revalidatePath("/layanan-pegawai");
    await emitRefreshSignal();

    return { success: true, message: "Layanan berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating service:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui layanan",
    };
  }
}

export async function deleteServiceAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID tidak ditemukan" };

    await fetchAPI(`/admin/services/${id}`, {
      method: "DELETE",
    });

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_LAYANAN",
      entityType: "service",
      entityId: id,
      details: { serviceId: id },
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/layanan");
    await emitRefreshSignal();

    return { success: true, message: "Layanan berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return {
      success: false,
      error: error.message || "Gagal menghapus layanan",
    };
  }
}

export async function reorderServicesAction(
  ids: (number | bigint | string)[],
): Promise<ActionResult> {
  await requirePermission("super_admin");
  try {
    const numericIds = ids.map((id) => Number(id));

    await fetchAPI("/admin/services/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids: numericIds }),
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/layanan");
    await emitRefreshSignal();

    return { success: true, message: "Urutan layanan berhasil disimpan" };
  } catch (error: any) {
    console.error("Error reordering services:", error);
    return {
      success: false,
      error: error.message || "Gagal mengubah urutan layanan",
    };
  }
}
