import { invokeAction } from "@/lib/actions/runtime";

export async function getProfileAfterLoginAction(...args: any[]) {
  return invokeAction("auth/auth", "getProfileAfterLoginAction", args);
}

export async function updatePasswordHashAction(...args: any[]) {
  return invokeAction("auth/auth", "updatePasswordHashAction", args);
}

