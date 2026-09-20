import { invokeAction } from "@/lib/actions/runtime";

export async function checkLoginLockoutAction(...args: any[]) {
  return invokeAction("auth/login-lockout", "checkLoginLockoutAction", args);
}

export async function recordFailedLoginAction(...args: any[]) {
  return invokeAction("auth/login-lockout", "recordFailedLoginAction", args);
}

export async function resetLoginLockoutAction(...args: any[]) {
  return invokeAction("auth/login-lockout", "resetLoginLockoutAction", args);
}

export async function unlockAccountAction(...args: any[]) {
  return invokeAction("auth/login-lockout", "unlockAccountAction", args);
}

