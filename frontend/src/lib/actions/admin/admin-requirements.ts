import { invokeAction } from "@/lib/actions/runtime";
export type { ActionResult } from "@/actions-handlers/admin/admin-requirements";

export async function createRequirementAction(...args: any[]) {
  return invokeAction("admin/admin-requirements", "createRequirementAction", args);
}

export async function updateRequirementAction(...args: any[]) {
  return invokeAction("admin/admin-requirements", "updateRequirementAction", args);
}

export async function deleteRequirementAction(...args: any[]) {
  return invokeAction("admin/admin-requirements", "deleteRequirementAction", args);
}

export async function reorderRequirementsAction(...args: any[]) {
  return invokeAction("admin/admin-requirements", "reorderRequirementsAction", args);
}

