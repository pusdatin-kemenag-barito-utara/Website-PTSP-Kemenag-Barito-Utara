import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/admin/admin-items";

export async function createServiceItemAction(...args: any[]) {
  return invokeAction("admin/admin-items", "createServiceItemAction", args);
}

export async function updateServiceItemAction(...args: any[]) {
  return invokeAction("admin/admin-items", "updateServiceItemAction", args);
}

export async function deleteServiceItemAction(...args: any[]) {
  return invokeAction("admin/admin-items", "deleteServiceItemAction", args);
}

export async function reorderServiceItemsAction(...args: any[]) {
  return invokeAction("admin/admin-items", "reorderServiceItemsAction", args);
}

