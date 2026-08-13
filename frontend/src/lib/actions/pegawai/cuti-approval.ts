import { invokeAction } from "@/lib/actions/runtime";

export async function approveByAtasanAction(...args: any[]) {
  return invokeAction("pegawai/cuti-approval", "approveByAtasanAction", args);
}

export async function rejectByAtasanAction(...args: any[]) {
  return invokeAction("pegawai/cuti-approval", "rejectByAtasanAction", args);
}

export async function approveByKepalaAction(...args: any[]) {
  return invokeAction("pegawai/cuti-approval", "approveByKepalaAction", args);
}

export async function rejectByKepalaAction(...args: any[]) {
  return invokeAction("pegawai/cuti-approval", "rejectByKepalaAction", args);
}

export async function getPersetujuanCutiListAction(...args: any[]) {
  return invokeAction("pegawai/cuti-approval", "getPersetujuanCutiListAction", args);
}

export async function getVerifikasiCutiAtasan(...args: any[]) {
  return invokeAction("pegawai/cuti-approval", "getVerifikasiCutiAtasan", args);
}

export async function verifikasiCutiAtasanAction(...args: any[]) {
  return invokeAction("pegawai/cuti-approval", "verifikasiCutiAtasanAction", args);
}

export async function processCutiAction(...args: any[]) {
  return invokeAction("pegawai/cuti-approval", "processCutiAction", args);
}

