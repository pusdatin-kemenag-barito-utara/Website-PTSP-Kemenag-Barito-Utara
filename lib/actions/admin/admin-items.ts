"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { serviceItems as serviceItemsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { slugify, stripHtml } from "@/lib/utils";
import { isSuperAdmin } from "@/lib/constants";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";
import { createAuditLog } from "@/lib/audit";

const itemSchema = z.object({
  serviceId: z.coerce.string(),
  name: z.string().min(3).transform(stripHtml),
  slug: z.string().min(3).transform(stripHtml),
  description: z.string().optional().transform((v) => v ? stripHtml(v) : v),
  estimatedTime: z.string().optional().transform((v) => v ? stripHtml(v) : v),
  isActive: z.boolean().optional(),
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

    await db.insert(serviceItemsTable).values({
      ...validated.data,
      serviceId: BigInt(validated.data.serviceId),
      sortOrder: 0,
    });

    await createAuditLog({
      adminId: profile.id,
      action: "BUAT_ITEM_LAYANAN",
      entityType: "service_item",
      entityId: validated.data.name,
      details: { nama: validated.data.name, layananId: validated.data.serviceId },
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
    const id = BigInt(formData.get("id") as string);

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

    await db
      .update(serviceItemsTable)
      .set({
        serviceId: BigInt(validated.data.serviceId),
        name: validated.data.name,
        slug: validated.data.slug,
        description: validated.data.description,
        estimatedTime: validated.data.estimatedTime,
        isActive: validated.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(serviceItemsTable.id, id));

    await createAuditLog({
      adminId: profile.id,
      action: "UBAH_ITEM_LAYANAN",
      entityType: "service_item",
      entityId: id.toString(),
      details: { nama: validated.data.name },
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
    const id = BigInt(formData.get("id") as string);
    const item = await db.query.serviceItems.findFirst({ where: eq(serviceItemsTable.id, id), columns: { name: true } });
    await db.delete(serviceItemsTable).where(eq(serviceItemsTable.id, id));

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_ITEM_LAYANAN",
      entityType: "service_item",
      entityId: id.toString(),
      details: { nama: item?.name },
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
    await db.transaction(async (tx: any) => {
      for (let i = 0; i < ids.length; i++) {
        await tx
          .update(serviceItemsTable)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(serviceItemsTable.id, BigInt(ids[i])));
      }
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
