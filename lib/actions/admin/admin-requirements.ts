"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { serviceRequirements as requirementsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";
import { createAuditLog } from "@/lib/audit";

const reqSchema = z.object({
  serviceItemId: z.coerce.string(),
  documentName: z.string().min(1),
  isRequired: z.boolean().optional(),
  allowedExtensions: z.string().default("pdf,jpg,jpeg,png"),
  maxFileSizeMb: z.coerce.number().default(5),
});

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};

export async function createRequirementAction(formData: FormData): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const validated = reqSchema.safeParse({
      serviceItemId: formData.get("serviceItemId"),
      documentName: formData.get("documentName"),
      isRequired: formData.get("isRequired") === "on",
      allowedExtensions: formData.get("allowedExtensions"),
      maxFileSizeMb: formData.get("maxFileSizeMb"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await db.insert(requirementsTable).values({
      ...validated.data,
      serviceItemId: BigInt(validated.data.serviceItemId),
      sortOrder: 0,
    });

    await createAuditLog({
      adminId: profile.id,
      action: "BUAT_PERSYARATAN",
      entityType: "requirement",
      entityId: validated.data.documentName,
      details: { nama: validated.data.documentName },
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Persyaratan berhasil ditambahkan" };
  } catch (error: any) {
    console.error("Error creating requirement:", error);
    return { success: false, error: error.message || "Gagal membuat persyaratan" };
  }
}

export async function updateRequirementAction(formData: FormData): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const id = BigInt(formData.get("id") as string);
    const validated = reqSchema.safeParse({
      serviceItemId: formData.get("serviceItemId"),
      documentName: formData.get("documentName"),
      isRequired: formData.get("isRequired") === "on",
      allowedExtensions: formData.get("allowedExtensions"),
      maxFileSizeMb: formData.get("maxFileSizeMb"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await db
      .update(requirementsTable)
      .set({
        ...validated.data,
        serviceItemId: BigInt(validated.data.serviceItemId),
        updatedAt: new Date(),
      })
      .where(eq(requirementsTable.id, id));

    await createAuditLog({
      adminId: profile.id,
      action: "UBAH_PERSYARATAN",
      entityType: "requirement",
      entityId: id.toString(),
      details: { nama: validated.data.documentName },
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Persyaratan berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating requirement:", error);
    return { success: false, error: error.message || "Gagal memperbarui persyaratan" };
  }
}

export async function deleteRequirementAction(formData: FormData): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const id = BigInt(formData.get("id") as string);
    const req = await db.query.serviceRequirements.findFirst({ where: eq(requirementsTable.id, id), columns: { documentName: true } });
    await db.delete(requirementsTable).where(eq(requirementsTable.id, id));

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_PERSYARATAN",
      entityType: "requirement",
      entityId: id.toString(),
      details: { nama: req?.documentName },
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Persyaratan berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting requirement:", error);
    return { success: false, error: error.message || "Gagal menghapus persyaratan" };
  }
}

export async function reorderRequirementsAction(ids: string[]): Promise<ActionResult> {
  await requirePermission("layanan");
  try {
    await db.transaction(async (tx: any) => {
      for (let i = 0; i < ids.length; i++) {
        await tx
          .update(requirementsTable)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(requirementsTable.id, BigInt(ids[i])));
      }
    });
    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();
    return { success: true, message: "Urutan persyaratan berhasil disimpan" };
  } catch (error: any) {
    console.error("Error reordering requirements:", error);
    return { success: false, error: error.message || "Gagal menyimpan urutan persyaratan" };
  }
}
