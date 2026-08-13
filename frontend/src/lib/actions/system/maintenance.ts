import { invokeAction } from "@/lib/actions/runtime";
export type { MaintenanceStatus } from "@/actions-handlers/system/maintenance";

export async function getMaintenanceStatus(...args: any[]) {
  return invokeAction("system/maintenance", "getMaintenanceStatus", args);
}

export async function toggleMaintenanceAction(...args: any[]) {
  return invokeAction("system/maintenance", "toggleMaintenanceAction", args);
}

export async function toggleAIChatAction(...args: any[]) {
  return invokeAction("system/maintenance", "toggleAIChatAction", args);
}

