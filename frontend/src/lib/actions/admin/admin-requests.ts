import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/admin/admin-requests";

export async function updateRequestStatusAction(...args: any[]) {
  return invokeAction("admin/admin-requests", "updateRequestStatusAction", args);
}

export async function deleteRequestAction(...args: any[]) {
  return invokeAction("admin/admin-requests", "deleteRequestAction", args);
}

export async function sendResultWhatsAppAction(...args: any[]) {
  return invokeAction("admin/admin-requests", "sendResultWhatsAppAction", args);
}

export async function uploadResultDocumentAction(...args: any[]) {
  return invokeAction("admin/admin-requests", "uploadResultDocumentAction", args);
}

export async function updateActivityLogAction(...args: any[]) {
  return invokeAction("admin/admin-requests", "updateActivityLogAction", args);
}

export async function deleteActivityLogAction(...args: any[]) {
  return invokeAction("admin/admin-requests", "deleteActivityLogAction", args);
}

