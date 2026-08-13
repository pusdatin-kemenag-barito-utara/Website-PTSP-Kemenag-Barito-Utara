import { invokeAction } from "@/lib/actions/runtime";

export async function checkLoginLockoutAction(...args: any[]) {
  return invokeAction("auth/login-lockout", "checkLoginLockoutAction", args);
}

export async function recordFailedLoginAction(...args: any[]) {
  return invokeAction("auth/login-lockout", "recordFailedLoginAction", args);
}

