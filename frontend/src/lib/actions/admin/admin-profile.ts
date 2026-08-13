import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/admin/admin-profile";

export async function updateAvatarUrlAction(...args: any[]) {
  return invokeAction("admin/admin-profile", "updateAvatarUrlAction", args);
}

export async function uploadAvatarAction(...args: any[]) {
  return invokeAction("admin/admin-profile", "uploadAvatarAction", args);
}

export async function updateProfileNameAction(...args: any[]) {
  return invokeAction("admin/admin-profile", "updateProfileNameAction", args);
}

export async function updateAdminPasswordAction(...args: any[]) {
  return invokeAction("admin/admin-profile", "updateAdminPasswordAction", args);
}

