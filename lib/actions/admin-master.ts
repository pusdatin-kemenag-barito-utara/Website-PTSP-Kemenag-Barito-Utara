"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { isSuperAdmin } from "@/lib/constants";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";

const serviceSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  role_owner: z.string().nullable().optional(),
});

const itemSchema = z.object({
  service_id: z.coerce.number().int().positive(),
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  estimated_time: z.string().optional(),
  is_active: z.boolean().optional(),
});

const fieldSchema = z.object({
  service_item_id: z.coerce.number().int().positive(),
  label: z.string().min(2),
  name: z.string().min(2),
  type: z.string().min(2),
  placeholder: z.string().optional(),
  is_required: z.boolean().optional(),
  options: z.string().optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
});

const requirementSchema = z.object({
  service_item_id: z.coerce.number().int().positive(),
  document_name: z.string().min(2),
  description: z.string().optional(),
  is_required: z.boolean().optional(),
  allowed_extensions: z.string().optional(),
  max_file_size_mb: z.coerce.number().min(1).max(20),
});

// --- SERVICES ---
export async function createServiceAction(formData: FormData) {
  await requireAdmin();

  const payload = serviceSchema.parse({
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
    description: formData.get("description") || "",
    is_active: formData.get("is_active") === "on",
    role_owner: formData.get("role_owner")
      ? String(formData.get("role_owner"))
      : null,
  });

  await prisma.services.create({
    data: payload,
  });

  revalidatePath("/admin/layanan");
  await emitRefreshSignal();
}

export async function updateServiceAction(formData: FormData) {
  const profile = await requireAdmin();
  const isSuper = isSuperAdmin(profile.email);
  const isGeneralAdmin = profile.role === "admin_ptsp";
  const id = BigInt(formData.get("id") as string);

  if (!isSuper && !isGeneralAdmin) {
    const service = await prisma.services.findUnique({
      where: { id },
      select: { role_owner: true },
    });

    if (service?.role_owner !== profile.role) {
      throw new Error("Unauthorized");
    }
  }

  const payload = serviceSchema.parse({
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
    description: formData.get("description") || "",
    is_active: formData.get("is_active") === "on",
    role_owner: formData.get("role_owner")
      ? String(formData.get("role_owner"))
      : null,
  });

  await prisma.services.update({
    where: { id },
    data: payload,
  });

  revalidatePath("/admin/layanan");
  await emitRefreshSignal();
}

export async function deleteServiceAction(formData: FormData) {
  const profile = await requireAdmin();
  const isSuper = isSuperAdmin(profile.email);
  const isGeneralAdmin = profile.role === "admin_ptsp";
  const id = BigInt(formData.get("id") as string);

  if (!isSuper && !isGeneralAdmin) {
    const service = await prisma.services.findUnique({
      where: { id },
      select: { role_owner: true },
    });

    if (service?.role_owner !== profile.role) {
      throw new Error("Unauthorized");
    }
  }

  await prisma.services.delete({
    where: { id },
  });

  revalidatePath("/admin/layanan");
  await emitRefreshSignal();
}

export async function reorderServicesAction(ids: number[]) {
  const profile = await requireAdmin();

  // Hanya Super Admin yang bisa mengubah urutan unit kerja
  if (!isSuperAdmin(profile.email)) {
    throw new Error("Hanya Super Admin yang dapat mengubah urutan layanan.");
  }

  await prisma.$transaction(
    ids.map((id: number, index: number) =>
      prisma.services.update({
        where: { id: BigInt(id) },
        data: { sort_order: index },
      }),
    ),
  );

  revalidatePath("/admin/layanan");
  await emitRefreshSignal();
}

// --- SERVICE ITEMS ---
export async function createServiceItemAction(formData: FormData) {
  await requireAdmin();

  const payload = itemSchema.parse({
    service_id: formData.get("service_id"),
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
    description: formData.get("description") || "",
    estimated_time: String(formData.get("estimated_time") || "1-3 Hari Kerja"),
    is_active: formData.get("is_active") === "on",
  });

  await prisma.service_items.create({
    data: {
      ...payload,
      service_id: BigInt(payload.service_id),
      // @ts-ignore
      estimated_time: payload.estimated_time,
    },
  });

  revalidatePath("/admin/layanan");
  await emitRefreshSignal();
}

export async function updateServiceItemAction(formData: FormData) {
  await requireAdmin();
  const id = BigInt(formData.get("id") as string);

  const payload = itemSchema.parse({
    service_id: formData.get("service_id"),
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
    description: formData.get("description") || "",
    estimated_time: String(formData.get("estimated_time") || "1-3 Hari Kerja"),
    is_active: formData.get("is_active") === "on",
  });

  await prisma.service_items.update({
    where: { id },
    data: {
      service_id: BigInt(payload.service_id),
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      // @ts-ignore
      estimated_time: payload.estimated_time,
      is_active: payload.is_active,
    },
  });

  revalidatePath("/admin/layanan/[id]", "page");
  await emitRefreshSignal();
}

export async function deleteServiceItemAction(formData: FormData) {
  await requireAdmin();
  const id = BigInt(formData.get("id") as string);

  await prisma.service_items.delete({
    where: { id },
  });

  revalidatePath("/admin/layanan");
  await emitRefreshSignal();
}

export async function reorderServiceItemsAction(ids: number[]) {
  const profile = await requireAdmin();

  // Hanya Super Admin yang bisa mengubah urutan item layanan
  if (!isSuperAdmin(profile.email)) {
    throw new Error(
      "Hanya Super Admin yang dapat mengubah urutan item layanan.",
    );
  }

  await prisma.$transaction(
    ids.map((id: number, index: number) =>
      prisma.service_items.update({
        where: { id: BigInt(id) },
        // @ts-ignore
        data: { sort_order: index },
      }),
    ),
  );

  revalidatePath("/admin/layanan");
  revalidatePath("/admin/layanan/[id]", "page");
  await emitRefreshSignal();
}

// --- FORM FIELDS ---
export async function createFieldAction(formData: FormData) {
  await requireAdmin();

  const payload = fieldSchema.parse({
    service_item_id: formData.get("service_item_id"),
    label: formData.get("label"),
    name: formData.get("name"),
    type: formData.get("type"),
    placeholder: formData.get("placeholder") || "",
    is_required: formData.get("is_required") === "on",
    options: formData.get("options") || "",
    sort_order: formData.get("sort_order") || 0,
  });

  await prisma.service_form_fields.create({
    data: {
      service_item_id: BigInt(payload.service_item_id),
      label: payload.label,
      name: payload.name,
      type: payload.type,
      placeholder: payload.placeholder,
      is_required: payload.is_required,
      options: payload.options,
      sort_order: payload.sort_order ?? 0,
    },
  });

  revalidatePath("/admin/layanan/[id]", "page");
  await emitRefreshSignal();
}

export async function updateFieldAction(formData: FormData) {
  await requireAdmin();
  const id = BigInt(formData.get("id") as string);

  const payload = fieldSchema.parse({
    service_item_id: formData.get("service_item_id"),
    label: formData.get("label"),
    name: formData.get("name"),
    type: formData.get("type"),
    placeholder: formData.get("placeholder") || "",
    is_required: formData.get("is_required") === "on",
    options: formData.get("options") || "",
    sort_order: formData.get("sort_order") || 0,
  });

  await prisma.service_form_fields.update({
    where: { id },
    data: {
      service_item_id: BigInt(payload.service_item_id),
      label: payload.label,
      name: payload.name,
      type: payload.type,
      placeholder: payload.placeholder,
      is_required: payload.is_required,
      options: payload.options,
      sort_order: payload.sort_order ?? 0,
    },
  });

  revalidatePath("/admin/layanan/[id]", "page");
  await emitRefreshSignal();
}

export async function deleteFieldAction(formData: FormData) {
  await requireAdmin();
  const id = BigInt(formData.get("id") as string);

  await prisma.service_form_fields.delete({
    where: { id },
  });

  revalidatePath("/admin/layanan");
  await emitRefreshSignal();
}

export async function reorderFieldsAction(ids: string[]) {
  try {
    await requireAdmin();

    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.service_form_fields.update({
          where: { id: BigInt(id) },
          data: { sort_order: index },
        }),
      ),
    );

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();
    return { success: true };
  } catch (error: any) {
    console.error("Error in reorderFieldsAction:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui urutan",
    };
  }
}

// --- REQUIREMENTS ---
export async function createRequirementAction(formData: FormData) {
  await requireAdmin();

  const payload = requirementSchema.parse({
    service_item_id: formData.get("service_item_id"),
    document_name: formData.get("document_name"),
    description: formData.get("description") || "",
    is_required: formData.get("is_required") === "on",
    allowed_extensions:
      formData.get("allowed_extensions") || "pdf,jpg,jpeg,png",
    max_file_size_mb: formData.get("max_file_size_mb") || 5,
  });

  await prisma.service_requirements.create({
    data: {
      ...payload,
      service_item_id: BigInt(payload.service_item_id),
    },
  });

  revalidatePath("/admin/layanan");
  await emitRefreshSignal();
}

export async function updateRequirementAction(formData: FormData) {
  await requireAdmin();
  const id = BigInt(formData.get("id") as string);

  const payload = requirementSchema.parse({
    service_item_id: formData.get("service_item_id"),
    document_name: formData.get("document_name"),
    description: formData.get("description") || "",
    is_required: formData.get("is_required") === "on",
    allowed_extensions:
      formData.get("allowed_extensions") || "pdf,jpg,jpeg,png",
    max_file_size_mb: formData.get("max_file_size_mb") || 5,
  });

  await prisma.service_requirements.update({
    where: { id },
    data: {
      service_item_id: BigInt(payload.service_item_id),
      document_name: payload.document_name,
      description: payload.description,
      is_required: payload.is_required,
      allowed_extensions: payload.allowed_extensions,
      max_file_size_mb: payload.max_file_size_mb,
    },
  });

  revalidatePath("/admin/layanan/[id]", "page");
  await emitRefreshSignal();
}

export async function deleteRequirementAction(formData: FormData) {
  await requireAdmin();
  const id = BigInt(formData.get("id") as string);

  await prisma.service_requirements.delete({
    where: { id },
  });

  revalidatePath("/admin/layanan");
  await emitRefreshSignal();
}

export async function reorderRequirementsAction(ids: string[]) {
  try {
    await requireAdmin();

    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.service_requirements.update({
          where: { id: BigInt(id) },
          // @ts-ignore
          data: { sort_order: index },
        }),
      ),
    );

    revalidatePath("/admin/layanan/[id]", "page");
    await emitRefreshSignal();
    return { success: true };
  } catch (error: any) {
    console.error("Error in reorderRequirementsAction:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui urutan persyaratan",
    };
  }
}
