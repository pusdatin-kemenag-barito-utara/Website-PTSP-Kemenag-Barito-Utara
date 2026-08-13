import { invokeAction } from "@/lib/actions/runtime";

export async function checkPhoneExistsAction(...args: any[]) {
  return invokeAction("auth/reset-password", "checkPhoneExistsAction", args);
}

export async function checkEmailExistsAction(...args: any[]) {
  return invokeAction("auth/reset-password", "checkEmailExistsAction", args);
}

export async function verifyPasswordResetOtpAction(...args: any[]) {
  return invokeAction("auth/reset-password", "verifyPasswordResetOtpAction", args);
}

export async function resetPasswordWithTokenAction(...args: any[]) {
  return invokeAction("auth/reset-password", "resetPasswordWithTokenAction", args);
}

