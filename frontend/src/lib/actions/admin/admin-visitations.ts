import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/admin/admin-visitations";

export async function deleteGuestBookAction(...args: any[]) {
  return invokeAction("admin/admin-visitations", "deleteGuestBookAction", args);
}

export async function deleteAppointmentAction(...args: any[]) {
  return invokeAction("admin/admin-visitations", "deleteAppointmentAction", args);
}

export async function updateAppointmentStatusAction(...args: any[]) {
  return invokeAction("admin/admin-visitations", "updateAppointmentStatusAction", args);
}

export async function toggleGuestBookModeAction(...args: any[]) {
  return invokeAction("admin/admin-visitations", "toggleGuestBookModeAction", args);
}

