import { invokeAction } from "@/lib/actions/runtime";

export async function signOutAction(...args: any[]) {
  return invokeAction("auth/sign-out", "signOutAction", args);
}

