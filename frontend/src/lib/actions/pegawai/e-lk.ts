import { invokeAction } from "@/lib/actions/runtime";

export async function getLaporanKinerjaAction(...args: any[]) {
  return invokeAction("pegawai/e-lk", "getLaporanKinerjaAction", args);
}

export async function getLaporanKinerjaBulananAction(...args: any[]) {
  return invokeAction("pegawai/e-lk", "getLaporanKinerjaBulananAction", args);
}

export async function getRekapBulananAction(...args: any[]) {
  return invokeAction("pegawai/e-lk", "getRekapBulananAction", args);
}

export async function createLaporanKinerjaAction(...args: any[]) {
  return invokeAction("pegawai/e-lk", "createLaporanKinerjaAction", args);
}

export async function updateLaporanKinerjaAction(...args: any[]) {
  return invokeAction("pegawai/e-lk", "updateLaporanKinerjaAction", args);
}

export async function bulkCreateLaporanKinerjaAction(...args: any[]) {
  return invokeAction("pegawai/e-lk", "bulkCreateLaporanKinerjaAction", args);
}

export async function uploadFinalLkhAction(...args: any[]) {
  return invokeAction("pegawai/e-lk", "uploadFinalLkhAction", args);
}

export async function deleteLaporanKinerjaAction(...args: any[]) {
  return invokeAction("pegawai/e-lk", "deleteLaporanKinerjaAction", args);
}

