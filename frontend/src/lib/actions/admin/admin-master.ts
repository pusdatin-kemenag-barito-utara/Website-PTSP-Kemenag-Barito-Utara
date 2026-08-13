import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/admin/admin-master";

export async function createServiceAction(...args: any[]) {
  return invokeAction("admin/admin-master", "createServiceAction", args);
}

export async function updateServiceAction(...args: any[]) {
  return invokeAction("admin/admin-master", "updateServiceAction", args);
}

export async function deleteServiceAction(...args: any[]) {
  return invokeAction("admin/admin-master", "deleteServiceAction", args);
}

export async function reorderServicesAction(...args: any[]) {
  return invokeAction("admin/admin-master", "reorderServicesAction", args);
}

