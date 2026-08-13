import { invokeAction } from "@/lib/actions/runtime";

export async function submitLaporanKinerjaAction(...args: any[]) {
  return invokeAction("admin/kepegawaian", "submitLaporanKinerjaAction", args);
}

export async function getLaporanKinerjaAction(...args: any[]) {
  return invokeAction("admin/kepegawaian", "getLaporanKinerjaAction", args);
}

export async function updateLaporanStatusAction(...args: any[]) {
  return invokeAction("admin/kepegawaian", "updateLaporanStatusAction", args);
}

export async function getPegawaiListAction(...args: any[]) {
  return invokeAction("admin/kepegawaian", "getPegawaiListAction", args);
}

export async function createPegawaiAction(...args: any[]) {
  return invokeAction("admin/kepegawaian", "createPegawaiAction", args);
}

export async function updatePegawaiAction(...args: any[]) {
  return invokeAction("admin/kepegawaian", "updatePegawaiAction", args);
}

export async function deletePegawaiAction(...args: any[]) {
  return invokeAction("admin/kepegawaian", "deletePegawaiAction", args);
}

