import { invokeAction } from "@/lib/actions/runtime";

export async function getSisaCutiByNip(...args: any[]) {
  return invokeAction("pegawai/cuti", "getSisaCutiByNip", args);
}

