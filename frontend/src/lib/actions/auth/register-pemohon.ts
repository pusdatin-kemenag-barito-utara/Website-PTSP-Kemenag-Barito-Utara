import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/auth/register-pemohon";

export async function requestRegistrationOtpAction(...args: any[]) {
  return invokeAction("auth/register-pemohon", "requestRegistrationOtpAction", args);
}

export async function registerPemohonAction(...args: any[]) {
  return invokeAction("auth/register-pemohon", "registerPemohonAction", args);
}

