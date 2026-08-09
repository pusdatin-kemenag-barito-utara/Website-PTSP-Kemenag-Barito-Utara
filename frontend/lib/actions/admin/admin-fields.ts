"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";
import { stripHtml } from "@/lib/utils";
import { createAuditLog } from "@/lib/audit";
import { fetchAPI } from "@/lib/api";

const fieldSchema = z.object({
  serviceItemId: z.coerce.number().int().positive(),
  label: z.string().min(1).transform(stripHtml),
  name: z.string().min(1).transform(stripHtml),
  type: z.string().default("text"),
  placeholder: z
    .string()
    .optional()
    .transform((v) => (v ? stripHtml(v) : "")),
  isRequired: z.boolean().optional().default(false),
  options: z
    .string()
    .optional()
    .transform((v) => (v ? stripHtml(v) : "")),
});

const updateFieldSchema = z.object({
  id: z.coerce.number().int().positive(),
  serviceItemId: z.coerce.number().int().positive(),
  label: z.string().min(1).transform(stripHtml),
  name: z.string().min(1).transform(stripHtml),
  type: z.string().default("text"),
  placeholder: z
    .string()
    .optional()
    .transform((v) => (v ? stripHtml(v) : "")),
  isRequired: z.boolean().optional().default(false),
  options: z
    .string()
    .optional()
    .transform((v) => (v ? stripHtml(v) : "")),
});

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};

export async function createFieldAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const rawIsRequired = String(formData.get("isRequired") ?? "");
    const isReq = rawIsRequired === "on" || rawIsRequired === "true" || rawIsRequired === "1";

    const validated = fieldSchema.safeParse({
      serviceItemId: formData.get("serviceItemId"),
      label: formData.get("label"),
      name: formData.get("name"),
      type: formData.get("type"),
      placeholder: formData.get("placeholder"),
      isRequired: isReq,
      options: formData.get("options"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { serviceItemId, ...body } = validated.data;

    await fetchAPI(`/admin/service-items/${serviceItemId}/form-fields`, {
      method: "POST",
      body: JSON.stringify({
        label: body.label,
        name: body.name,
        type: body.type,
        placeholder: body.placeholder ?? "",
        isRequired: body.isRequired ?? false,
        is_required: body.isRequired ?? false,
        options: body.options ?? "",
      }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "BUAT_FIELD_LAYANAN",
      entityType: "field",
      entityId: body.name,
      details: { label: body.label, type: body.type },
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Field berhasil ditambahkan" };
  } catch (error: any) {
    console.error("Error creating field:", error);
    return { success: false, error: error.message || "Gagal membuat field" };
  }
}

export async function updateFieldAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const rawIsRequired = String(formData.get("isRequired") ?? "");
    const isReq = rawIsRequired === "on" || rawIsRequired === "true" || rawIsRequired === "1";

    const validated = updateFieldSchema.safeParse({
      id: formData.get("id"),
      serviceItemId: formData.get("serviceItemId"),
      label: formData.get("label"),
      name: formData.get("name"),
      type: formData.get("type"),
      placeholder: formData.get("placeholder"),
      isRequired: isReq,
      options: formData.get("options"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { id, ...body } = validated.data;

    await fetchAPI(`/admin/form-fields/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        label: body.label,
        name: body.name,
        type: body.type,
        placeholder: body.placeholder ?? "",
        isRequired: body.isRequired ?? false,
        is_required: body.isRequired ?? false,
        options: body.options ?? "",
      }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "UBAH_FIELD_LAYANAN",
      entityType: "field",
      entityId: String(id),
      details: { name: body.name, label: body.label },
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Field berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating field:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui field",
    };
  }
}

export async function deleteFieldAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("layanan");
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID tidak ditemukan" };

    await fetchAPI(`/admin/form-fields/${id}`, {
      method: "DELETE",
    });

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_FIELD_LAYANAN",
      entityType: "field",
      entityId: id,
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Field berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting field:", error);
    return { success: false, error: error.message || "Gagal menghapus field" };
  }
}

export async function reorderFieldsAction(
  ids: number[],
): Promise<ActionResult> {
  await requirePermission("layanan");
  try {
    await fetchAPI("/admin/form-fields/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids }),
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();
    return { success: true, message: "Urutan field berhasil disimpan" };
  } catch (error: any) {
    console.error("Error reordering fields:", error);
    return {
      success: false,
      error: error.message || "Gagal menyimpan urutan field",
    };
  }
}
