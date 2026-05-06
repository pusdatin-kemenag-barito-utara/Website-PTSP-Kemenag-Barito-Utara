"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const serviceSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

const itemSchema = z.object({
  service_id: z.coerce.number().int().positive(),
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
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
  sort_order: z.coerce.number().int().min(0),
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
  const admin = createAdminClient();

  const payload = serviceSchema.parse({
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
    description: formData.get("description") || "",
    is_active: formData.get("is_active") === "on",
  });

  await admin.from("services").insert(payload);
  revalidatePath("/admin/layanan");
}

export async function updateServiceAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = Number(formData.get("id"));

  const payload = serviceSchema.parse({
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
    description: formData.get("description") || "",
    is_active: formData.get("is_active") === "on",
  });

  await admin.from("services").update(payload).eq("id", id);
  revalidatePath("/admin/layanan");
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = Number(formData.get("id"));
  await admin.from("services").delete().eq("id", id);
  revalidatePath("/admin/layanan");
}

export async function reorderServicesAction(ids: number[]) {
  await requireAdmin();
  const admin = createAdminClient();

  // Use Promise.all to update all sort orders
  await Promise.all(
    ids.map((id, index) =>
      admin.from("services").update({ sort_order: index }).eq("id", id),
    ),
  );

  revalidatePath("/admin/layanan");
}

// --- SERVICE ITEMS ---
export async function createServiceItemAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const payload = itemSchema.parse({
    service_id: formData.get("service_id"),
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
    description: formData.get("description") || "",
    is_active: formData.get("is_active") === "on",
  });

  await admin.from("service_items").insert(payload);
  revalidatePath("/admin/item-layanan");
}

export async function updateServiceItemAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = Number(formData.get("id"));

  const payload = itemSchema.parse({
    service_id: formData.get("service_id"),
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
    description: formData.get("description") || "",
    is_active: formData.get("is_active") === "on",
  });

  await admin.from("service_items").update(payload).eq("id", id);
  revalidatePath("/admin/item-layanan");
}

export async function deleteServiceItemAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = Number(formData.get("id"));
  await admin.from("service_items").delete().eq("id", id);
  revalidatePath("/admin/item-layanan");
}

// --- FORM FIELDS ---
export async function createFieldAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

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

  await admin.from("service_form_fields").insert(payload);
  revalidatePath("/admin/form-layanan");
}

export async function updateFieldAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = Number(formData.get("id"));

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

  await admin.from("service_form_fields").update(payload).eq("id", id);
  revalidatePath("/admin/form-layanan");
}

export async function deleteFieldAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = Number(formData.get("id"));
  await admin.from("service_form_fields").delete().eq("id", id);
  revalidatePath("/admin/form-layanan");
}

// --- REQUIREMENTS ---
export async function createRequirementAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const payload = requirementSchema.parse({
    service_item_id: formData.get("service_item_id"),
    document_name: formData.get("document_name"),
    description: formData.get("description") || "",
    is_required: formData.get("is_required") === "on",
    allowed_extensions:
      formData.get("allowed_extensions") || "pdf,jpg,jpeg,png",
    max_file_size_mb: formData.get("max_file_size_mb") || 5,
  });

  await admin.from("service_requirements").insert(payload);
  revalidatePath("/admin/persyaratan");
}

export async function updateRequirementAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = Number(formData.get("id"));

  const payload = requirementSchema.parse({
    service_item_id: formData.get("service_item_id"),
    document_name: formData.get("document_name"),
    description: formData.get("description") || "",
    is_required: formData.get("is_required") === "on",
    allowed_extensions:
      formData.get("allowed_extensions") || "pdf,jpg,jpeg,png",
    max_file_size_mb: formData.get("max_file_size_mb") || 5,
  });

  await admin.from("service_requirements").update(payload).eq("id", id);
  revalidatePath("/admin/persyaratan");
}

export async function deleteRequirementAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = Number(formData.get("id"));
  await admin.from("service_requirements").delete().eq("id", id);
  revalidatePath("/admin/persyaratan");
}
