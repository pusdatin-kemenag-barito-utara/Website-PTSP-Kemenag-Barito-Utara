import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/user/user";

export async function updateProfileAction(...args: any[]) {
  return invokeAction("user/user", "updateProfileAction", args);
}

