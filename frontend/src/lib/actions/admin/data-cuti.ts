import { invokeAction } from "@/lib/actions/runtime";

export async function getDataCutiListAction(...args: any[]) {
  return invokeAction("admin/data-cuti", "getDataCutiListAction", args);
}

export async function getDataCutiByIdAction(...args: any[]) {
  return invokeAction("admin/data-cuti", "getDataCutiByIdAction", args);
}

export async function createDataCutiAction(...args: any[]) {
  return invokeAction("admin/data-cuti", "createDataCutiAction", args);
}

export async function updateDataCutiAction(...args: any[]) {
  return invokeAction("admin/data-cuti", "updateDataCutiAction", args);
}

export async function deleteDataCutiAction(...args: any[]) {
  return invokeAction("admin/data-cuti", "deleteDataCutiAction", args);
}

export async function createRekapCutiAction(...args: any[]) {
  return invokeAction("admin/data-cuti", "createRekapCutiAction", args);
}

export async function updateRekapCutiAction(...args: any[]) {
  return invokeAction("admin/data-cuti", "updateRekapCutiAction", args);
}

export async function deleteRekapCutiAction(...args: any[]) {
  return invokeAction("admin/data-cuti", "deleteRekapCutiAction", args);
}

export async function importCutiCsvAction(...args: any[]) {
  return invokeAction("admin/data-cuti", "importCutiCsvAction", args);
}

export async function syncDataPegawaiFromPusdatinAction(...args: any[]) {
  return invokeAction("admin/data-cuti", "syncDataPegawaiFromPusdatinAction", args);
}

export async function rolloverCutiTahunanAction(...args: any[]) {
  return invokeAction("admin/data-cuti", "rolloverCutiTahunanAction", args);
}

