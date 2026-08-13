import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/system/cleanup";

export async function cleanupOldStorageAction(...args: any[]) {
  return invokeAction("system/cleanup", "cleanupOldStorageAction", args);
}

export async function getCleanupStats(...args: any[]) {
  return invokeAction("system/cleanup", "getCleanupStats", args);
}

