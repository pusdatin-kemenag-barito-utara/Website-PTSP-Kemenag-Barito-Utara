import { invokeAction } from "@/lib/actions/runtime";

export async function getRequestsForExport(...args: any[]) {
  return invokeAction("system/export", "getRequestsForExport", args);
}

export async function getDocumentsForExport(...args: any[]) {
  return invokeAction("system/export", "getDocumentsForExport", args);
}

