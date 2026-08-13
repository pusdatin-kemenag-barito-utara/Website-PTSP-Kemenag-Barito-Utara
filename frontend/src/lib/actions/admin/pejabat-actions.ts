import { invokeAction } from "@/lib/actions/runtime";

export async function getPejabatList(...args: any[]): Promise<any> {
  return invokeAction<any>("admin/pejabat-actions", "getPejabatList", args);
}

export async function upsertPejabat(...args: any[]): Promise<any> {
  return invokeAction<any>("admin/pejabat-actions", "upsertPejabat", args);
}

export async function deletePejabat(...args: any[]): Promise<any> {
  return invokeAction<any>("admin/pejabat-actions", "deletePejabat", args);
}

export async function reorderPejabat(...args: any[]): Promise<any> {
  return invokeAction<any>("admin/pejabat-actions", "reorderPejabat", args);
}

