import { invokeAction } from "@/lib/actions/runtime";

export async function completeProfileAction(...args: any[]) {
  return invokeAction("auth/complete-profile", "completeProfileAction", args);
}

export async function updatePegawaiPhoneAction(...args: any[]) {
  return invokeAction("auth/complete-profile", "updatePegawaiPhoneAction", args);
}

export async function updatePemohonWhatsappAction(...args: any[]) {
  return invokeAction("auth/complete-profile", "completeProfileAction", args);
}

