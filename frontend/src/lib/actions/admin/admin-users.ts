import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/admin/admin-users";

export async function updateUserRoleAction(...args: any[]) {
  return invokeAction("admin/admin-users", "updateUserRoleAction", args);
}

export async function updateUserPermissionsAction(...args: any[]) {
  return invokeAction("admin/admin-users", "updateUserPermissionsAction", args);
}

export async function verifyStaffAction(...args: any[]) {
  return invokeAction("admin/admin-users", "verifyStaffAction", args);
}

export async function deleteUserPermanentlyAction(...args: any[]) {
  return invokeAction("admin/admin-users", "deleteUserPermanentlyAction", args);
}

