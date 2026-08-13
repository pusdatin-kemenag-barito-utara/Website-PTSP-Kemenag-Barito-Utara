import { invokeAction } from "@/lib/actions/runtime";

export async function logLoginAction(...args: any[]) {
  return invokeAction("auth/login-audit", "logLoginAction", args);
}

export async function logFailedLoginAction(...args: any[]) {
  return invokeAction("auth/login-audit", "logFailedLoginAction", args);
}

