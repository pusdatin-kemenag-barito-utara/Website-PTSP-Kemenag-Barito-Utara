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

export async function deletePemohonPermanentlyAction(pemohonId: string, authUserId?: string, email?: string) {
  return invokeAction("admin/admin-users", "deletePemohonPermanentlyAction", [pemohonId, authUserId, email]);
}

export async function impersonatePegawaiAction(nip: string) {
  return invokeAction("admin/admin-users", "impersonatePegawaiAction", [nip]);
}


