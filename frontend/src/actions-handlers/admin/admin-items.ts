import { revalidatePath } from "@/lib/next-compat/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { slugify, stripHtml } from "@/lib/utils";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";
import { createAuditLog } from "@/lib/audit";
import { fetchAPI } from "@/lib/api";

const itemSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  name: z.string().min(3).transform(stripHtml),
  slug: z.string().min(3).transform(stripHtml),
  description: z
    .string()
    .optional()
    .transform((v) => (v ? stripHtml(v) : "")),
  estimatedTime: z
    .string()
    .optional()
    .transform((v) => (v ? stripHtml(v) : "")),
  isActive: z.boolean().optional().default(true),
});

const updateItemSchema = z.object({
  id: z.coerce.number().int().positive(),
  serviceId: z.coerce.number().int().positive(),
  name: z.string().min(3).transform(stripHtml),
  slug: z.string().min(3).transform(stripHtml),
  description: z
    .string()
    .optional()
    .transform((v) => (v ? stripHtml(v) : "")),
  estimatedTime: z
    .string()
    .optional()
    .transform((v) => (v ? stripHtml(v) : "")),
  isActive: z.boolean().optional().default(true),
});

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};

export async function createServiceItemAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const validated = itemSchema.safeParse({
      serviceId: formData.get("serviceId"),
      name: formData.get("name"),
      slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
      description: formData.get("description") || "",
      estimatedTime: String(formData.get("estimatedTime") || "1-3 Hari Kerja"),
      isActive: formData.get("isActive") === "on",
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { serviceId, ...body } = validated.data;

    await fetchAPI(`/admin/services/${serviceId}/items`, {
      method: "POST",
      body: JSON.stringify({
        name: body.name,
        slug: body.slug,
        description: body.description ?? "",
        estimatedTime: body.estimatedTime ?? "1-3 Hari Kerja",
        sortOrder: 0,
      }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "BUAT_ITEM_LAYANAN",
      entityType: "service_item",
      entityId: body.name,
      details: { nama: body.name, layananId: String(serviceId) },
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/layanan", "layout");
    revalidatePath("/", "layout");
    await emitRefreshSignal();

    return { success: true, message: "Item layanan berhasil dibuat" };
  } catch (error: any) {
    console.error("Error creating service item:", error);
    return {
      success: false,
      error: error.message || "Gagal membuat item layanan",
    };
  }
}

export async function updateServiceItemAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const validated = updateItemSchema.safeParse({
      id: formData.get("id"),
      serviceId: formData.get("serviceId"),
      name: formData.get("name"),
      slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
      description: formData.get("description") || "",
      estimatedTime: String(formData.get("estimatedTime") || "1-3 Hari Kerja"),
      isActive: formData.get("isActive") === "on",
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { id, ...body } = validated.data;

    await fetchAPI(`/admin/service-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: body.name,
        description: body.description ?? "",
        estimatedTime: body.estimatedTime ?? "1-3 Hari Kerja",
        isActive: body.isActive ?? true,
      }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "UBAH_ITEM_LAYANAN",
      entityType: "service_item",
      entityId: String(id),
      details: { nama: body.name },
    });

    revalidatePath("/admin/layanan/[id]", "page");
    revalidatePath("/admin/layanan");
    revalidatePath("/layanan", "layout");
    revalidatePath("/", "layout");
    await emitRefreshSignal();

    return { success: true, message: "Item layanan berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating service item:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui item layanan",
    };
  }
}

export async function deleteServiceItemAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID tidak ditemukan" };

    await fetchAPI(`/admin/service-items/${id}`, {
      method: "DELETE",
    });

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_ITEM_LAYANAN",
      entityType: "service_item",
      entityId: id,
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/layanan", "layout");
    revalidatePath("/", "layout");
    await emitRefreshSignal();

    return { success: true, message: "Item layanan berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting service item:", error);
    return {
      success: false,
      error: error.message || "Gagal menghapus item layanan",
    };
  }
}

export async function reorderServiceItemsAction(
  ids: number[],
): Promise<ActionResult> {
  await requirePermission("layanan");
  try {
    await fetchAPI("/admin/service-items/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids }),
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/admin/layanan/[id]", "page");
    revalidatePath("/layanan", "layout");
    revalidatePath("/", "layout");
    await emitRefreshSignal();

    return { success: true, message: "Urutan item layanan berhasil disimpan" };
  } catch (error: any) {
    console.error("Error reordering service items:", error);
    return {
      success: false,
      error: error.message || "Gagal mengubah urutan item layanan",
    };
  }
}
