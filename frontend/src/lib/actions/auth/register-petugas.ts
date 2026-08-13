import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/auth/register-petugas";

export async function registerPetugasAction(...args: any[]) {
  return invokeAction("auth/register-petugas", "registerPetugasAction", args);
}

export async function verifyPetugasAction(...args: any[]) {
  return invokeAction("auth/register-petugas", "verifyPetugasAction", args);
}

export async function rejectPetugasAction(...args: any[]) {
  return invokeAction("auth/register-petugas", "rejectPetugasAction", args);
}

export async function updatePetugasAction(...args: any[]) {
  return invokeAction("auth/register-petugas", "updatePetugasAction", args);
}

