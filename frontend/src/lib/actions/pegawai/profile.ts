import { invokeAction } from "@/lib/actions/runtime";

export async function updatePegawaiAvatar(...args: any[]) {
  return invokeAction("pegawai/profile", "updatePegawaiAvatar", args);
}

export async function updatePegawaiPassword(...args: any[]) {
  return invokeAction("pegawai/profile", "updatePegawaiPassword", args);
}

