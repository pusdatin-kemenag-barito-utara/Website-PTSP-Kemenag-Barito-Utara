"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { serviceFormFields as fieldsTable } from "@/lib/db/schema";
import { eq, inArray, and, ne } from "drizzle-orm";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";
import { stripHtml } from "@/lib/utils";

async function checkDuplicateFieldName(name: string, serviceItemId: string, excludeId?: bigint): Promise<boolean> {
  const conditions: any[] = [
    eq(fieldsTable.name, name),
    eq(fieldsTable.serviceItemId, BigInt(serviceItemId)),
  ];
  if (excludeId) {
    conditions.push(ne(fieldsTable.id, excludeId));
  }
  const existing = await db.query.serviceFormFields.findFirst({
    where: and(...conditions),
    columns: { id: true },
  });
  return !!existing;
}

const fieldSchema = z.object({
  serviceItemId: z.coerce.string(),
  label: z.string().min(1).transform(stripHtml),
  name: z.string().min(1).transform(stripHtml),
  type: z.string().default("text"),
  placeholder: z.string().optional().transform((v) => v ? stripHtml(v) : v),
  isRequired: z.boolean().optional(),
  options: z.string().optional().transform((v) => v ? stripHtml(v) : v),
});

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};

export async function createFieldAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("layanan");
  try {
    const validated = fieldSchema.safeParse({
      serviceItemId: formData.get("serviceItemId"),
      label: formData.get("label"),
      name: formData.get("name"),
      type: formData.get("type"),
      placeholder: formData.get("placeholder"),
      isRequired: formData.get("isRequired") === "on",
      options: formData.get("options"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const duplicate = await checkDuplicateFieldName(validated.data.name, validated.data.serviceItemId);
    if (duplicate) {
      return { success: false, error: "Nama field sudah digunakan dalam item layanan ini." };
    }

    await db.insert(fieldsTable).values({
      ...validated.data,
      serviceItemId: BigInt(validated.data.serviceItemId),
      sortOrder: 0,
    });

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Field berhasil ditambahkan" };
  } catch (error: any) {
    console.error("Error creating field:", error);
    return { success: false, error: error.message || "Gagal membuat field" };
  }
}

export async function updateFieldAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("layanan");
  try {
    const id = BigInt(formData.get("id") as string);
    const validated = fieldSchema.safeParse({
      serviceItemId: formData.get("serviceItemId"),
      label: formData.get("label"),
      name: formData.get("name"),
      type: formData.get("type"),
      placeholder: formData.get("placeholder"),
      isRequired: formData.get("isRequired") === "on",
      options: formData.get("options"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const duplicate = await checkDuplicateFieldName(validated.data.name, validated.data.serviceItemId, id);
    if (duplicate) {
      return { success: false, error: "Nama field sudah digunakan dalam item layanan ini." };
    }

    await db
      .update(fieldsTable)
      .set({
        ...validated.data,
        serviceItemId: BigInt(validated.data.serviceItemId),
        updatedAt: new Date(),
      })
      .where(eq(fieldsTable.id, id));

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Field berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating field:", error);
    return { success: false, error: error.message || "Gagal memperbarui field" };
  }
}

export async function deleteFieldAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("layanan");
  try {
    const id = BigInt(formData.get("id") as string);
    await db.delete(fieldsTable).where(eq(fieldsTable.id, id));
    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();

    return { success: true, message: "Field berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting field:", error);
    return { success: false, error: error.message || "Gagal menghapus field" };
  }
}

export async function reorderFieldsAction(ids: string[]): Promise<ActionResult> {
  await requirePermission("layanan");
  try {
    await db.transaction(async (tx: any) => {
      for (let i = 0; i < ids.length; i++) {
        await tx
          .update(fieldsTable)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(fieldsTable.id, BigInt(ids[i])));
      }
    });
    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();
    return { success: true, message: "Urutan field berhasil disimpan" };
  } catch (error: any) {
    console.error("Error reordering fields:", error);
    return { success: false, error: error.message || "Gagal menyimpan urutan field" };
  }
}
