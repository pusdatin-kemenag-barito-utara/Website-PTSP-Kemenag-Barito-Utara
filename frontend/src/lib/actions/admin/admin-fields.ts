import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/admin/admin-fields";

export async function createFieldAction(...args: any[]) {
  return invokeAction("admin/admin-fields", "createFieldAction", args);
}

export async function updateFieldAction(...args: any[]) {
  return invokeAction("admin/admin-fields", "updateFieldAction", args);
}

export async function deleteFieldAction(...args: any[]) {
  return invokeAction("admin/admin-fields", "deleteFieldAction", args);
}

export async function reorderFieldsAction(...args: any[]) {
  return invokeAction("admin/admin-fields", "reorderFieldsAction", args);
}

