import { invokeAction } from "@/lib/actions/runtime";

export async function getMasterOptionsAction(...args: any[]) {
  return invokeAction("admin/master-options-actions", "getMasterOptionsAction", args);
}

export async function upsertMasterOptionAction(...args: any[]) {
  return invokeAction("admin/master-options-actions", "upsertMasterOptionAction", args);
}

export async function deleteMasterOptionAction(...args: any[]) {
  return invokeAction("admin/master-options-actions", "deleteMasterOptionAction", args);
}

export async function seedMasterOptionsAction(...args: any[]) {
  return invokeAction("admin/master-options-actions", "seedMasterOptionsAction", args);
}

