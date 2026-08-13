import { invokeAction } from "@/lib/actions/runtime";

export async function getMyRequests(...args: any[]) {
  return invokeAction("pegawai/requests", "getMyRequests", args);
}

