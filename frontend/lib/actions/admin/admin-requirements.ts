"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";
import { createAuditLog } from "@/lib/audit";
import { fetchAPI } from "@/lib/api";

const reqSchema = z.object({
  serviceItemId: z.coerce.number().int().positive(),
  documentName: z.string().min(1),
  description: z.string().optional().default(""),
  isRequired: z.boolean().optional().default(false),
  allowedExtensions: z.string().default("pdf,jpg,jpeg,png"),
  maxFileSizeMb: z.coerce.number().default(5),
});

const updateReqSchema = z.object({
  id: z.coerce.number().int().positive(),
  documentName: z.string().min(1),
  description: z.string().optional().default(""),
  isRequired: z.boolean().optional().default(false),
  allowedExtensions: z.string().default("pdf,jpg,jpeg,png"),
  maxFileSizeMb: z.coerce.number().default(5),
});

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};

export async function createRequirementAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const validated = reqSchema.safeParse({
      serviceItemId: formData.get("serviceItemId"),
      documentName: formData.get("documentName"),
      description: formData.get("description") || "",
      isRequired: formData.get("isRequired") === "on",
      allowedExtensions:
        formData.get("allowedExtensions") || "pdf,jpg,jpeg,png",
      maxFileSizeMb: formData.get("maxFileSizeMb") || 5,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { serviceItemId, ...body } = validated.data;

    await fetchAPI(`/admin/service-items/${serviceItemId}/requirements`, {
      method: "POST",
      body: JSON.stringify({
        documentName: body.documentName,
        description: body.description ?? "",
        isRequired: body.isRequired ?? false,
        allowedExtensions: body.allowedExtensions,
        maxFileSizeMb: body.maxFileSizeMb,
      }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "BUAT_PERSYARATAN",
      entityType: "requirement",
      entityId: body.documentName,
      details: { nama: body.documentName },
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Persyaratan berhasil ditambahkan" };
  } catch (error: any) {
    console.error("Error creating requirement:", error);
    return {
      success: false,
      error: error.message || "Gagal membuat persyaratan",
    };
  }
}

export async function updateRequirementAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const validated = updateReqSchema.safeParse({
      id: formData.get("id"),
      documentName: formData.get("documentName"),
      description: formData.get("description") || "",
      isRequired: formData.get("isRequired") === "on",
      allowedExtensions:
        formData.get("allowedExtensions") || "pdf,jpg,jpeg,png",
      maxFileSizeMb: formData.get("maxFileSizeMb") || 5,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { id, ...body } = validated.data;

    await fetchAPI(`/admin/requirements/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        documentName: body.documentName,
        description: body.description ?? "",
        isRequired: body.isRequired ?? false,
        allowedExtensions: body.allowedExtensions,
        maxFileSizeMb: body.maxFileSizeMb,
      }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "UBAH_PERSYARATAN",
      entityType: "requirement",
      entityId: String(id),
      details: { nama: body.documentName },
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Persyaratan berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating requirement:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui persyaratan",
    };
  }
}

export async function deleteRequirementAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID tidak ditemukan" };

    await fetchAPI(`/admin/requirements/${id}`, {
      method: "DELETE",
    });

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_PERSYARATAN",
      entityType: "requirement",
      entityId: id,
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Persyaratan berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting requirement:", error);
    return {
      success: false,
      error: error.message || "Gagal menghapus persyaratan",
    };
  }
}

export async function reorderRequirementsAction(
  ids: number[],
): Promise<ActionResult> {
  await requirePermission("layanan");
  try {
    await fetchAPI("/admin/requirements/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids }),
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();
    return { success: true, message: "Urutan persyaratan berhasil disimpan" };
  } catch (error: any) {
    console.error("Error reordering requirements:", error);
    return {
      success: false,
      error: error.message || "Gagal menyimpan urutan persyaratan",
    };
  }
}
